// Rutas de eventos

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor, authMiddleware } from '../middleware/auth.js';

export async function handleGetEvents(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 12;
        const category = url.searchParams.get('category') || '';
        const zone = url.searchParams.get('zone') || '';
        const upcoming = url.searchParams.get('upcoming');
        const dateTo = url.searchParams.get('dateTo') || '';
        const free = url.searchParams.get('free');
        const isFeatured = url.searchParams.get('is_featured');
        const isSpecial = url.searchParams.get('is_special');
        const offset = (page - 1) * limit;

        let query = `
            SELECT e.*, c.name as category_name, z.name as zone_name, u.name as author_name
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN zones z ON e.zone_id = z.id
            LEFT JOIN users u ON e.author_id = u.id
            WHERE e.status = 'approved'
        `;
        let countQuery = "SELECT COUNT(*) as total FROM events WHERE status = 'approved'";
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
            params.push(category);
        }

        if (zone) {
            query += ' AND z.slug = ?';
            countQuery += ' AND zone_id = (SELECT id FROM zones WHERE slug = ?)';
            params.push(zone);
        }

        if (upcoming === '1') {
            // Filtrar eventos que aún no han pasado (considerando fecha Y hora)
            query += " AND datetime(e.event_date || ' ' || COALESCE(e.event_time, '23:59')) >= datetime('now')";
            countQuery += " AND datetime(event_date || ' ' || COALESCE(event_time, '23:59')) >= datetime('now')";
        }

        if (dateTo) {
            query += ' AND e.event_date <= ?';
            countQuery += ' AND event_date <= ?';
            params.push(dateTo);
        }

        if (free === '1') {
            query += ' AND (e.price IS NULL OR e.price = 0)';
            countQuery += ' AND (price IS NULL OR price = 0)';
        }

        if (isFeatured === '1') {
            query += ' AND e.is_featured = 1';
            countQuery += ' AND is_featured = 1';
        }

        if (isSpecial === '1') {
            query += ' AND e.is_special = 1';
            countQuery += ' AND is_special = 1';
        }

        // Si es featured o special, ordenar aleatoriamente para rotar entre varios
        if (isFeatured === '1' || isSpecial === '1') {
            query += ' ORDER BY RANDOM() LIMIT ? OFFSET ?';
        } else {
            query += ' ORDER BY e.event_date ASC, e.event_time ASC LIMIT ? OFFSET ?';
        }

        const [events, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            events: events.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo eventos: ' + e.message, 500);
    }
}

export async function handleGetEventById(request, env, id) {
    try {
        const event = await env.DB.prepare(`
            SELECT e.*, c.name as category_name, c.slug as category_slug,
                   z.name as zone_name, u.name as author_name
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN zones z ON e.zone_id = z.id
            LEFT JOIN users u ON e.author_id = u.id
            WHERE e.id = ?
        `).bind(id).first();

        if (!event) {
            return notFound('Evento no encontrado');
        }

        const { user } = await authMiddleware(request, env);
        let userLiked = false;
        if (user) {
            const like = await env.DB.prepare(
                'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
            ).bind(user.id, 'event', id).first();
            userLiked = !!like;
        }

        return success({ ...event, user_liked: userLiked });

    } catch (e) {
        return error('Error obteniendo evento: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetEvents(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const authorId = url.searchParams.get('author_id') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT e.*, c.name as category_name, z.name as zone_name, u.name as author_name
            FROM events e
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN zones z ON e.zone_id = z.id
            LEFT JOIN users u ON e.author_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM events WHERE 1=1';
        const params = [];

        // Filtrar por autor (para publicistas que solo ven sus propios eventos)
        if (authorId) {
            query += ' AND e.author_id = ?';
            countQuery += ' AND author_id = ?';
            params.push(authorId);
        }

        if (status) {
            query += ' AND e.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY e.event_date DESC LIMIT ? OFFSET ?';

        const [events, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            events: events.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo eventos: ' + e.message, 500);
    }
}

export async function handleAdminCreateEvent(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, image_url, images, category_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, featured, is_featured, is_special } = data;

        if (!title || !description || !event_date) {
            return error('Título, descripción y fecha son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO events (title, description, image_url, images, category_id, author_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, featured, is_featured, is_special)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description,
            image_url || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            user.id,
            zone_id || null,
            location || null,
            address || null,
            latitude || null,
            longitude || null,
            event_date,
            event_time || null,
            end_date || null,
            end_time || null,
            price || 0,
            ticket_url || null,
            phone || null,
            whatsapp || null,
            website || null,
            status || 'pending',
            featured ? 1 : 0,
            is_featured ? 1 : 0,
            is_special ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id }, 'Evento creado');

    } catch (e) {
        return error('Error creando evento: ' + e.message, 500);
    }
}

export async function handleAdminUpdateEvent(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        const existing = await env.DB.prepare('SELECT id FROM events WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Evento no encontrado');
        }

        const fields = ['title', 'description', 'image_url', 'category_id', 'zone_id', 'location', 'address', 'latitude', 'longitude', 'event_date', 'event_time', 'end_date', 'end_time', 'price', 'ticket_url', 'phone', 'whatsapp', 'website', 'status', 'featured', 'is_featured', 'is_special'];

        let setClause = fields.map(f => `${f} = COALESCE(?, ${f})`).join(', ');
        setClause += ", updated_at = datetime('now')";

        const values = fields.map(f => {
            if (f === 'featured' || f === 'is_featured' || f === 'is_special') return data[f] !== undefined ? (data[f] ? 1 : 0) : null;
            return data[f] !== undefined ? data[f] : null;
        });

        await env.DB.prepare(`UPDATE events SET ${setClause} WHERE id = ?`).bind(...values, id).run();

        return success(null, 'Evento actualizado');

    } catch (e) {
        return error('Error actualizando evento: ' + e.message, 500);
    }
}

export async function handleAdminDeleteEvent(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
        await env.DB.prepare("DELETE FROM likes WHERE content_type = 'event' AND content_id = ?").bind(id).run();

        return success(null, 'Evento eliminado');

    } catch (e) {
        return error('Error eliminando evento: ' + e.message, 500);
    }
}

// Crear eventos masivamente (para duplicar semanalmente)
export async function handleAdminCreateEventsBulk(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { events } = await request.json();

        if (!events || !Array.isArray(events) || events.length === 0) {
            return error('Se requiere un array de eventos');
        }

        if (events.length > 52) {
            return error('Maximo 52 eventos por lote');
        }

        const createdIds = [];

        for (const eventData of events) {
            const { title, description, image_url, images, category_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, is_featured, is_special } = eventData;

            if (!title || !event_date) {
                continue; // Saltar eventos sin datos requeridos
            }

            const result = await env.DB.prepare(`
                INSERT INTO events (title, description, image_url, images, category_id, author_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, is_featured, is_special)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                title,
                description || null,
                image_url || null,
                images ? JSON.stringify(images) : null,
                category_id || null,
                user.id,
                zone_id || null,
                location || null,
                address || null,
                latitude || null,
                longitude || null,
                event_date,
                event_time || null,
                end_date || null,
                end_time || null,
                price || 0,
                ticket_url || null,
                phone || null,
                whatsapp || null,
                website || null,
                status || 'approved',
                is_featured ? 1 : 0,
                is_special ? 1 : 0
            ).run();

            createdIds.push(result.meta.last_row_id);
        }

        return success({
            created: createdIds.length,
            ids: createdIds
        }, `Se crearon ${createdIds.length} eventos`);

    } catch (e) {
        return error('Error creando eventos: ' + e.message, 500);
    }
}

// Eliminar eventos masivamente
export async function handleAdminDeleteEventsBulk(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return error('Se requiere un array de IDs');
        }

        if (ids.length > 52) {
            return error('Maximo 52 eventos por lote');
        }

        let deleted = 0;
        for (const id of ids) {
            try {
                const result = await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(id).run();
                if (result.meta.changes > 0) {
                    deleted++;
                    // Eliminar likes asociados
                    await env.DB.prepare("DELETE FROM likes WHERE content_type = 'event' AND content_id = ?").bind(id).run();
                }
            } catch (e) {
                console.error(`Error eliminando evento ${id}:`, e);
            }
        }

        return success({
            deleted,
            requested: ids.length
        }, `Se eliminaron ${deleted} eventos`);

    } catch (e) {
        return error('Error eliminando eventos: ' + e.message, 500);
    }
}
