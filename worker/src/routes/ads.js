// Rutas de publicidad (Ads)

import { success, error, notFound } from '../utils/response.js';
import { requireAdmin, requirePublicista } from '../middleware/auth.js';
import { logActivity, ACTIONS, ENTITY_TYPES } from '../utils/logger.js';

export async function handleGetAds(request, env) {
    try {
        const url = new URL(request.url);
        const position = url.searchParams.get('position') || '';

        console.log('[handleGetAds] Requested position:', position);

        let query = `
            SELECT * FROM ads
            WHERE is_active = 1
            AND (start_date IS NULL OR start_date <= date('now'))
            AND (end_date IS NULL OR end_date >= date('now'))
        `;
        const params = [];

        if (position) {
            query += ' AND position = ?';
            params.push(position);
        }

        query += ' ORDER BY priority DESC, created_at DESC';

        const result = await env.DB.prepare(query).bind(...params).all();

        console.log('[handleGetAds] Found', result.results.length, 'ads. Positions:', result.results.map(a => a.position));

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo anuncios: ' + e.message, 500);
    }
}

export async function handleGetAdById(request, env, id) {
    try {
        const ad = await env.DB.prepare('SELECT * FROM ads WHERE id = ?').bind(id).first();

        if (!ad) {
            return notFound('Anuncio no encontrado');
        }

        return success(ad);

    } catch (e) {
        return error('Error obteniendo anuncio: ' + e.message, 500);
    }
}

export async function handleTrackImpression(request, env, id) {
    try {
        await env.DB.prepare(
            'UPDATE ads SET impressions = impressions + 1 WHERE id = ?'
        ).bind(id).run();

        return success(null);

    } catch (e) {
        return error('Error registrando impresión: ' + e.message, 500);
    }
}

export async function handleTrackClick(request, env, id) {
    try {
        await env.DB.prepare(
            'UPDATE ads SET clicks = clicks + 1 WHERE id = ?'
        ).bind(id).run();

        return success(null);

    } catch (e) {
        return error('Error registrando click: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetAds(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const result = await env.DB.prepare(`
            SELECT a.*, u.name as author_name
            FROM ads a
            LEFT JOIN users u ON a.author_id = u.id
            ORDER BY a.created_at DESC
        `).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo anuncios: ' + e.message, 500);
    }
}

export async function handleAdminCreateAd(request, env) {
    const { user, error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, link_url, position, priority, is_active, start_date, end_date } = data;

        if (!title || !video_url) {
            return error('Título y URL del video son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO ads (title, description, video_url, link_url, position, priority, author_id, is_active, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description || null,
            video_url,
            link_url || null,
            position || 'sidebar',
            priority || 0,
            user.id,
            is_active !== undefined ? (is_active ? 1 : 0) : 1,
            start_date || null,
            end_date || null
        ).run();

        return success({ id: result.meta.last_row_id }, 'Anuncio creado');

    } catch (e) {
        return error('Error creando anuncio: ' + e.message, 500);
    }
}

export async function handleAdminUpdateAd(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, link_url, position, priority, is_active, start_date, end_date } = data;

        const existing = await env.DB.prepare('SELECT id FROM ads WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Anuncio no encontrado');
        }

        await env.DB.prepare(`
            UPDATE ads SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                video_url = COALESCE(?, video_url),
                link_url = COALESCE(?, link_url),
                position = COALESCE(?, position),
                priority = COALESCE(?, priority),
                is_active = COALESCE(?, is_active),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            video_url || null,
            link_url || null,
            position || null,
            priority !== undefined ? priority : null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            start_date || null,
            end_date || null,
            id
        ).run();

        return success(null, 'Anuncio actualizado');

    } catch (e) {
        return error('Error actualizando anuncio: ' + e.message, 500);
    }
}

export async function handleAdminDeleteAd(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM ads WHERE id = ?').bind(id).run();

        return success(null, 'Anuncio eliminado');

    } catch (e) {
        return error('Error eliminando anuncio: ' + e.message, 500);
    }
}

// PUBLICISTA ENDPOINTS

export async function handlePublicistaGetAds(request, env) {
    const { user, error: authError } = await requirePublicista(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const position = url.searchParams.get('position');

        // Admin ve todos los anuncios, publicista solo los suyos
        let query;
        let params = [];

        if (user.role === 'admin') {
            query = 'SELECT * FROM ads WHERE 1=1';
        } else {
            query = 'SELECT * FROM ads WHERE author_id = ?';
            params.push(user.id);
        }

        if (status === 'activo') {
            query += ' AND is_active = 1';
        } else if (status === 'inactivo') {
            query += ' AND is_active = 0';
        }

        if (position) {
            query += ' AND position = ?';
            params.push(position);
        }

        query += ' ORDER BY created_at DESC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo anuncios: ' + e.message, 500);
    }
}

export async function handlePublicistaCreateAd(request, env) {
    const { user, error: authError } = await requirePublicista(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, link_url, position, priority, is_active, start_date, end_date } = data;

        console.log('[handlePublicistaCreateAd] Creating ad with position:', position);

        if (!title || !video_url) {
            return error('Titulo y URL del video son requeridos');
        }

        const finalPosition = position || 'sidebar';
        console.log('[handlePublicistaCreateAd] Final position to save:', finalPosition);

        const result = await env.DB.prepare(`
            INSERT INTO ads (title, description, video_url, link_url, position, priority, author_id, is_active, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description || null,
            video_url,
            link_url || null,
            finalPosition,
            priority || 0,
            user.id,
            is_active ? 1 : 0,
            start_date || null,
            end_date || null
        ).run();

        // Log de actividad
        await logActivity(env, user, ACTIONS.CREATE, ENTITY_TYPES.AD, result.meta.last_row_id, title, { position: finalPosition }, request);

        return success({ id: result.meta.last_row_id }, 'Anuncio creado');

    } catch (e) {
        return error('Error creando anuncio: ' + e.message, 500);
    }
}

export async function handlePublicistaUpdateAd(request, env, id) {
    const { user, error: authError } = await requirePublicista(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, link_url, position, priority, is_active, start_date, end_date } = data;

        console.log('[handlePublicistaUpdateAd] Updating ad', id, 'with position:', position);

        // Verificar que el anuncio pertenece al publicista
        const existing = await env.DB.prepare('SELECT id, author_id, title, is_active FROM ads WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Anuncio no encontrado');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return error('No tienes permiso para editar este anuncio', 403);
        }

        await env.DB.prepare(`
            UPDATE ads SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                video_url = COALESCE(?, video_url),
                link_url = COALESCE(?, link_url),
                position = COALESCE(?, position),
                priority = COALESCE(?, priority),
                is_active = COALESCE(?, is_active),
                start_date = COALESCE(?, start_date),
                end_date = COALESCE(?, end_date),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            video_url || null,
            link_url || null,
            position || null,
            priority !== undefined ? priority : null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            start_date || null,
            end_date || null,
            id
        ).run();

        // Log de actividad - determinar accion especifica
        const action = is_active !== undefined ? (is_active ? ACTIONS.ACTIVATE : ACTIONS.DEACTIVATE) : ACTIONS.UPDATE;
        await logActivity(env, user, action, ENTITY_TYPES.AD, id, existing.title || title, { changes: data }, request);

        return success(null, 'Anuncio actualizado');

    } catch (e) {
        return error('Error actualizando anuncio: ' + e.message, 500);
    }
}

export async function handlePublicistaDeleteAd(request, env, id) {
    const { user, error: authError } = await requirePublicista(request, env);
    if (authError) return authError;

    try {
        // Verificar que el anuncio pertenece al publicista
        const existing = await env.DB.prepare('SELECT id, author_id, title FROM ads WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Anuncio no encontrado');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return error('No tienes permiso para eliminar este anuncio', 403);
        }

        await env.DB.prepare('DELETE FROM ads WHERE id = ?').bind(id).run();

        // Log de actividad
        await logActivity(env, user, ACTIONS.DELETE, ENTITY_TYPES.AD, id, existing.title, {}, request);

        return success(null, 'Anuncio eliminado');

    } catch (e) {
        return error('Error eliminando anuncio: ' + e.message, 500);
    }
}

export async function handlePublicistaGetAdStats(request, env) {
    const { user, error: authError } = await requirePublicista(request, env);
    if (authError) return authError;

    try {
        const stats = await env.DB.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activos,
                SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactivos,
                SUM(impressions) as total_impresiones,
                SUM(clicks) as total_clicks
            FROM ads WHERE author_id = ?
        `).bind(user.id).first();

        return success(stats);

    } catch (e) {
        return error('Error obteniendo estadisticas: ' + e.message, 500);
    }
}
