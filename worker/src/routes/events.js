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
            query += " AND e.event_date >= date('now')";
            countQuery += " AND event_date >= date('now')";
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

        query += ' ORDER BY e.event_date ASC, e.event_time ASC LIMIT ? OFFSET ?';

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
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
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
        const { title, description, image_url, images, category_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, featured } = data;

        if (!title || !description || !event_date) {
            return error('Título, descripción y fecha son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO events (title, description, image_url, images, category_id, author_id, zone_id, location, address, latitude, longitude, event_date, event_time, end_date, end_time, price, ticket_url, phone, whatsapp, website, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            featured ? 1 : 0
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

        const fields = ['title', 'description', 'image_url', 'category_id', 'zone_id', 'location', 'address', 'latitude', 'longitude', 'event_date', 'event_time', 'end_date', 'end_time', 'price', 'ticket_url', 'phone', 'whatsapp', 'website', 'status', 'featured'];

        let setClause = fields.map(f => `${f} = COALESCE(?, ${f})`).join(', ');
        setClause += ", updated_at = datetime('now')";

        const values = fields.map(f => {
            if (f === 'featured') return data[f] !== undefined ? (data[f] ? 1 : 0) : null;
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
