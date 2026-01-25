// Rutas de publicidad (Ads)

import { success, error, notFound } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

export async function handleGetAds(request, env) {
    try {
        const url = new URL(request.url);
        const position = url.searchParams.get('position') || '';

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
