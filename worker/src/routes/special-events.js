// Rutas de Eventos Especiales (Sorteos y Recurrentes)

import { success, error, notFound, forbidden } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';
import { logActivity, ACTIONS, ENTITY_TYPES } from '../utils/logger.js';

// =============================================
// ENDPOINTS PUBLICOS
// =============================================

// Obtener sorteos activos (publico)
export async function handleGetSorteos(request, env) {
    try {
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const zoneId = url.searchParams.get('zone_id') || '';

        let query = `
            SELECT se.*, c.name as category_name, z.name as zone_name, u.name as author_name,
                   (SELECT COUNT(*) FROM sorteo_participants WHERE sorteo_id = se.id) as participants_count
            FROM special_events se
            LEFT JOIN categories c ON se.category_id = c.id
            LEFT JOIN zones z ON se.zone_id = z.id
            LEFT JOIN users u ON se.author_id = u.id
            WHERE se.event_type = 'sorteo'
            AND se.status = 'activo'
            AND (se.draw_date >= date('now') OR se.draw_date IS NULL)
        `;
        const params = [];

        if (zoneId) {
            query += ' AND se.zone_id = ?';
            params.push(zoneId);
        }

        query += ' ORDER BY se.draw_date ASC, se.created_at DESC LIMIT ?';
        params.push(limit);

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo sorteos: ' + e.message, 500);
    }
}

// Obtener detalle de un sorteo (publico)
export async function handleGetSorteoById(request, env, id) {
    try {
        const sorteo = await env.DB.prepare(`
            SELECT se.*, c.name as category_name, z.name as zone_name, u.name as author_name,
                   (SELECT COUNT(*) FROM sorteo_participants WHERE sorteo_id = se.id) as participants_count
            FROM special_events se
            LEFT JOIN categories c ON se.category_id = c.id
            LEFT JOIN zones z ON se.zone_id = z.id
            LEFT JOIN users u ON se.author_id = u.id
            WHERE se.id = ? AND se.event_type = 'sorteo'
        `).bind(id).first();

        if (!sorteo) {
            return notFound('Sorteo no encontrado');
        }

        return success(sorteo);

    } catch (e) {
        return error('Error obteniendo sorteo: ' + e.message, 500);
    }
}

// =============================================
// PARTICIPACION EN SORTEOS (requiere auth)
// =============================================

// Participar en un sorteo
export async function handleParticipateSorteo(request, env, sorteoId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        // Verificar que el sorteo existe y esta activo
        const sorteo = await env.DB.prepare(`
            SELECT * FROM special_events
            WHERE id = ? AND event_type = 'sorteo' AND status = 'activo'
        `).bind(sorteoId).first();

        if (!sorteo) {
            return notFound('Sorteo no encontrado o no activo');
        }

        // Verificar fecha limite de inscripcion
        if (sorteo.registration_deadline) {
            const deadline = new Date(sorteo.registration_deadline);
            if (new Date() > deadline) {
                return error('El plazo de inscripcion ha finalizado', 400);
            }
        }

        // Verificar maximo de participantes
        if (sorteo.max_participants) {
            const count = await env.DB.prepare(
                'SELECT COUNT(*) as total FROM sorteo_participants WHERE sorteo_id = ?'
            ).bind(sorteoId).first();

            if (count.total >= sorteo.max_participants) {
                return error('El sorteo ha alcanzado el maximo de participantes', 400);
            }
        }

        // Intentar registrar participacion
        try {
            await env.DB.prepare(`
                INSERT INTO sorteo_participants (sorteo_id, user_id)
                VALUES (?, ?)
            `).bind(sorteoId, user.id).run();
        } catch (e) {
            if (e.message.includes('UNIQUE constraint failed')) {
                return error('Ya estas participando en este sorteo', 400);
            }
            throw e;
        }

        return success(null, 'Te has inscrito al sorteo exitosamente');

    } catch (e) {
        return error('Error al participar: ' + e.message, 500);
    }
}

// Verificar si estoy participando en un sorteo
export async function handleCheckSorteoParticipation(request, env, sorteoId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const participation = await env.DB.prepare(`
            SELECT * FROM sorteo_participants
            WHERE sorteo_id = ? AND user_id = ?
        `).bind(sorteoId, user.id).first();

        return success({
            is_participating: !!participation,
            participation: participation || null
        });

    } catch (e) {
        return error('Error verificando participacion: ' + e.message, 500);
    }
}

// Cancelar participacion en sorteo
export async function handleCancelSorteoParticipation(request, env, sorteoId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const result = await env.DB.prepare(`
            DELETE FROM sorteo_participants
            WHERE sorteo_id = ? AND user_id = ? AND is_winner = 0
        `).bind(sorteoId, user.id).run();

        if (result.meta.changes === 0) {
            return error('No se pudo cancelar la participacion (puede que ya seas ganador)', 400);
        }

        return success(null, 'Participacion cancelada');

    } catch (e) {
        return error('Error cancelando participacion: ' + e.message, 500);
    }
}

// =============================================
// ENDPOINTS ADMIN/EDITOR
// =============================================

// Obtener todos los eventos especiales (admin)
export async function handleAdminGetSpecialEvents(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const eventType = url.searchParams.get('type') || '';
        const status = url.searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT se.*, c.name as category_name, z.name as zone_name, u.name as author_name,
                   (SELECT COUNT(*) FROM sorteo_participants WHERE sorteo_id = se.id) as participants_count
            FROM special_events se
            LEFT JOIN categories c ON se.category_id = c.id
            LEFT JOIN zones z ON se.zone_id = z.id
            LEFT JOIN users u ON se.author_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM special_events WHERE 1=1';
        const params = [];

        if (eventType) {
            query += ' AND se.event_type = ?';
            countQuery += ' AND event_type = ?';
            params.push(eventType);
        }

        if (status) {
            query += ' AND se.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY se.created_at DESC LIMIT ? OFFSET ?';

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
        return error('Error obteniendo eventos especiales: ' + e.message, 500);
    }
}

// Crear evento especial (sorteo o recurrente)
export async function handleAdminCreateSpecialEvent(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const {
            event_type,
            title,
            description,
            image_url,
            location,
            address,
            zone_id,
            category_id,
            phone,
            whatsapp,
            website,
            price,
            // Campos sorteo
            prize_description,
            prize_value,
            max_participants,
            draw_date,
            draw_time,
            winners_count,
            registration_deadline,
            // Campos recurrente
            recurrence_day,
            recurrence_time,
            recurrence_start_date,
            recurrence_end_date,
            recurrence_weeks,
            // Otros
            status,
            is_featured
        } = data;

        if (!title) {
            return error('El titulo es requerido');
        }

        if (!event_type || !['sorteo', 'recurrente'].includes(event_type)) {
            return error('Tipo de evento invalido. Usar: sorteo, recurrente');
        }

        const result = await env.DB.prepare(`
            INSERT INTO special_events (
                event_type, title, description, image_url, location, address,
                zone_id, category_id, phone, whatsapp, website, price,
                prize_description, prize_value, max_participants, draw_date, draw_time,
                winners_count, registration_deadline,
                recurrence_day, recurrence_time, recurrence_start_date, recurrence_end_date, recurrence_weeks,
                author_id, status, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            event_type,
            title,
            description || null,
            image_url || null,
            location || null,
            address || null,
            zone_id || null,
            category_id || null,
            phone || null,
            whatsapp || null,
            website || null,
            price || 0,
            prize_description || null,
            prize_value || null,
            max_participants || null,
            draw_date || null,
            draw_time || null,
            winners_count || 1,
            registration_deadline || null,
            recurrence_day !== undefined ? recurrence_day : null,
            recurrence_time || null,
            recurrence_start_date || null,
            recurrence_end_date || null,
            recurrence_weeks || null,
            user.id,
            status || 'activo',
            is_featured ? 1 : 0
        ).run();

        const newId = result.meta.last_row_id;

        // Si es recurrente, generar los eventos
        if (event_type === 'recurrente' && recurrence_weeks && recurrence_day !== undefined) {
            const generatedIds = await generateRecurringEvents(env, newId, data, user.id);

            // Guardar los IDs generados
            await env.DB.prepare(
                'UPDATE special_events SET generated_event_ids = ? WHERE id = ?'
            ).bind(JSON.stringify(generatedIds), newId).run();
        }

        // Log de actividad
        await logActivity(env, user, ACTIONS.CREATE, ENTITY_TYPES.EVENT, newId, title,
            { event_type, is_special: true }, request);

        return success({ id: newId }, event_type === 'sorteo' ? 'Sorteo creado' : 'Evento recurrente creado');

    } catch (e) {
        return error('Error creando evento especial: ' + e.message, 500);
    }
}

// Funcion auxiliar para generar eventos recurrentes
async function generateRecurringEvents(env, specialEventId, data, authorId) {
    const {
        title,
        description,
        image_url,
        location,
        address,
        zone_id,
        category_id,
        phone,
        whatsapp,
        website,
        price,
        recurrence_day,
        recurrence_time,
        recurrence_start_date,
        recurrence_weeks
    } = data;

    const generatedIds = [];
    const startDate = new Date(recurrence_start_date);

    // Ajustar al primer dia de la semana correspondiente
    const currentDay = startDate.getDay();
    const targetDay = parseInt(recurrence_day);
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;

    startDate.setDate(startDate.getDate() + daysToAdd);

    for (let week = 0; week < recurrence_weeks; week++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(eventDate.getDate() + (week * 7));

        const dateStr = eventDate.toISOString().split('T')[0];

        const result = await env.DB.prepare(`
            INSERT INTO events (
                title, description, image_url, location, address,
                zone_id, category_id, phone, whatsapp, website, price,
                event_date, event_time, author_id, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
        `).bind(
            title,
            description || null,
            image_url || null,
            location || null,
            address || null,
            zone_id || null,
            category_id || null,
            phone || null,
            whatsapp || null,
            website || null,
            price || 0,
            dateStr,
            recurrence_time || null,
            authorId
        ).run();

        generatedIds.push(result.meta.last_row_id);
    }

    return generatedIds;
}

// Actualizar evento especial
export async function handleAdminUpdateSpecialEvent(request, env, id) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        const existing = await env.DB.prepare(
            'SELECT * FROM special_events WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Evento especial no encontrado');
        }

        const {
            title, description, image_url, location, address,
            zone_id, category_id, phone, whatsapp, website, price,
            prize_description, prize_value, max_participants, draw_date, draw_time,
            winners_count, registration_deadline,
            status, is_featured
        } = data;

        await env.DB.prepare(`
            UPDATE special_events SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                image_url = COALESCE(?, image_url),
                location = COALESCE(?, location),
                address = COALESCE(?, address),
                zone_id = COALESCE(?, zone_id),
                category_id = COALESCE(?, category_id),
                phone = COALESCE(?, phone),
                whatsapp = COALESCE(?, whatsapp),
                website = COALESCE(?, website),
                price = COALESCE(?, price),
                prize_description = COALESCE(?, prize_description),
                prize_value = COALESCE(?, prize_value),
                max_participants = COALESCE(?, max_participants),
                draw_date = COALESCE(?, draw_date),
                draw_time = COALESCE(?, draw_time),
                winners_count = COALESCE(?, winners_count),
                registration_deadline = COALESCE(?, registration_deadline),
                status = COALESCE(?, status),
                is_featured = COALESCE(?, is_featured),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            image_url || null,
            location || null,
            address || null,
            zone_id || null,
            category_id || null,
            phone || null,
            whatsapp || null,
            website || null,
            price !== undefined ? price : null,
            prize_description || null,
            prize_value || null,
            max_participants || null,
            draw_date || null,
            draw_time || null,
            winners_count || null,
            registration_deadline || null,
            status || null,
            is_featured !== undefined ? (is_featured ? 1 : 0) : null,
            id
        ).run();

        // Log de actividad
        await logActivity(env, user, ACTIONS.UPDATE, ENTITY_TYPES.EVENT, id, existing.title,
            { changes: data, is_special: true }, request);

        return success(null, 'Evento especial actualizado');

    } catch (e) {
        return error('Error actualizando evento especial: ' + e.message, 500);
    }
}

// Eliminar evento especial
export async function handleAdminDeleteSpecialEvent(request, env, id) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT * FROM special_events WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Evento especial no encontrado');
        }

        // Si es recurrente, eliminar tambien los eventos generados
        if (existing.event_type === 'recurrente' && existing.generated_event_ids) {
            try {
                const ids = JSON.parse(existing.generated_event_ids);
                for (const eventId of ids) {
                    await env.DB.prepare('DELETE FROM events WHERE id = ?').bind(eventId).run();
                }
            } catch (e) {
                console.error('Error eliminando eventos generados:', e);
            }
        }

        // Eliminar participantes si es sorteo
        await env.DB.prepare('DELETE FROM sorteo_participants WHERE sorteo_id = ?').bind(id).run();

        // Eliminar el evento especial
        await env.DB.prepare('DELETE FROM special_events WHERE id = ?').bind(id).run();

        // Log de actividad
        await logActivity(env, user, ACTIONS.DELETE, ENTITY_TYPES.EVENT, id, existing.title,
            { event_type: existing.event_type, is_special: true }, request);

        return success(null, 'Evento especial eliminado');

    } catch (e) {
        return error('Error eliminando evento especial: ' + e.message, 500);
    }
}

// =============================================
// GESTION DE SORTEOS (seleccionar ganadores, etc)
// =============================================

// Obtener participantes de un sorteo
export async function handleAdminGetSorteoParticipants(request, env, sorteoId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const participants = await env.DB.prepare(`
            SELECT sp.*, u.name as user_name, u.email as user_email, u.phone as user_phone
            FROM sorteo_participants sp
            JOIN users u ON sp.user_id = u.id
            WHERE sp.sorteo_id = ?
            ORDER BY sp.is_winner DESC, sp.registered_at ASC
        `).bind(sorteoId).all();

        return success({
            participants: participants.results,
            total: participants.results.length,
            winners: participants.results.filter(p => p.is_winner).length
        });

    } catch (e) {
        return error('Error obteniendo participantes: ' + e.message, 500);
    }
}

// Seleccionar ganadores aleatoriamente
export async function handleAdminSelectWinners(request, env, sorteoId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const sorteo = await env.DB.prepare(
            'SELECT * FROM special_events WHERE id = ? AND event_type = ?'
        ).bind(sorteoId, 'sorteo').first();

        if (!sorteo) {
            return notFound('Sorteo no encontrado');
        }

        const winnersCount = sorteo.winners_count || 1;

        // Obtener participantes no descalificados
        const participants = await env.DB.prepare(`
            SELECT id FROM sorteo_participants
            WHERE sorteo_id = ? AND status = 'participando'
            ORDER BY RANDOM()
            LIMIT ?
        `).bind(sorteoId, winnersCount).all();

        if (participants.results.length === 0) {
            return error('No hay participantes elegibles', 400);
        }

        // Resetear ganadores anteriores
        await env.DB.prepare(`
            UPDATE sorteo_participants
            SET is_winner = 0, status = 'participando'
            WHERE sorteo_id = ? AND is_winner = 1
        `).bind(sorteoId).run();

        // Marcar nuevos ganadores
        const winnerIds = participants.results.map(p => p.id);
        for (const winnerId of winnerIds) {
            await env.DB.prepare(`
                UPDATE sorteo_participants
                SET is_winner = 1, status = 'ganador'
                WHERE id = ?
            `).bind(winnerId).run();
        }

        // Marcar sorteo como finalizado
        await env.DB.prepare(`
            UPDATE special_events SET status = 'finalizado', updated_at = datetime('now')
            WHERE id = ?
        `).bind(sorteoId).run();

        // Log de actividad
        await logActivity(env, user, ACTIONS.UPDATE, ENTITY_TYPES.EVENT, sorteoId, sorteo.title,
            { action: 'select_winners', winners_count: winnerIds.length }, request);

        return success({
            winners_selected: winnerIds.length,
            winner_ids: winnerIds
        }, `Se seleccionaron ${winnerIds.length} ganador(es)`);

    } catch (e) {
        return error('Error seleccionando ganadores: ' + e.message, 500);
    }
}

// Marcar premio como reclamado
export async function handleAdminMarkPrizeClaimed(request, env, participantId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const participant = await env.DB.prepare(
            'SELECT * FROM sorteo_participants WHERE id = ? AND is_winner = 1'
        ).bind(participantId).first();

        if (!participant) {
            return notFound('Participante ganador no encontrado');
        }

        await env.DB.prepare(`
            UPDATE sorteo_participants
            SET prize_claimed = 1, claimed_at = datetime('now')
            WHERE id = ?
        `).bind(participantId).run();

        return success(null, 'Premio marcado como reclamado');

    } catch (e) {
        return error('Error marcando premio: ' + e.message, 500);
    }
}

// Descalificar participante
export async function handleAdminDisqualifyParticipant(request, env, participantId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { notes } = await request.json();

        const result = await env.DB.prepare(`
            UPDATE sorteo_participants
            SET status = 'descalificado', is_winner = 0, notes = ?
            WHERE id = ?
        `).bind(notes || 'Descalificado por el organizador', participantId).run();

        if (result.meta.changes === 0) {
            return notFound('Participante no encontrado');
        }

        return success(null, 'Participante descalificado');

    } catch (e) {
        return error('Error descalificando participante: ' + e.message, 500);
    }
}
