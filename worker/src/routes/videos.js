// Rutas de videos

import { success, error, notFound } from '../utils/response.js';
import { requireEditor, authMiddleware } from '../middleware/auth.js';

export async function handleGetVideos(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 12;
        const category = url.searchParams.get('category') || '';
        const featured = url.searchParams.get('featured');
        const offset = (page - 1) * limit;

        let query = `
            SELECT v.*, c.name as category_name, u.name as author_name
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.id
            LEFT JOIN users u ON v.author_id = u.id
            WHERE v.status = 'approved'
        `;
        let countQuery = "SELECT COUNT(*) as total FROM videos WHERE status = 'approved'";
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
            params.push(category);
        }

        if (featured === '1') {
            query += ' AND v.featured = 1';
            countQuery += ' AND featured = 1';
        }

        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';

        const [videos, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            videos: videos.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo videos: ' + e.message, 500);
    }
}

export async function handleGetVideoById(request, env, id) {
    try {
        const video = await env.DB.prepare(`
            SELECT v.*, c.name as category_name, u.name as author_name
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.id
            LEFT JOIN users u ON v.author_id = u.id
            WHERE v.id = ?
        `).bind(id).first();

        if (!video) {
            return notFound('Video no encontrado');
        }

        // Incrementar vistas
        await env.DB.prepare(
            'UPDATE videos SET view_count = view_count + 1 WHERE id = ?'
        ).bind(id).run();

        const { user } = await authMiddleware(request, env);
        let userLiked = false;
        if (user) {
            const like = await env.DB.prepare(
                'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
            ).bind(user.id, 'video', id).first();
            userLiked = !!like;
        }

        return success({ ...video, user_liked: userLiked });

    } catch (e) {
        return error('Error obteniendo video: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetVideos(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT v.*, c.name as category_name, u.name as author_name
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.id
            LEFT JOIN users u ON v.author_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM videos WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND v.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';

        const [videos, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            videos: videos.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo videos: ' + e.message, 500);
    }
}

export async function handleAdminCreateVideo(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, thumbnail_url, category_id, status, featured } = data;

        if (!title || !video_url) {
            return error('Título y URL del video son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO videos (title, description, video_url, thumbnail_url, category_id, author_id, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description || null,
            video_url,
            thumbnail_url || null,
            category_id || null,
            user.id,
            status || 'pending',
            featured ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id }, 'Video creado');

    } catch (e) {
        return error('Error creando video: ' + e.message, 500);
    }
}

export async function handleAdminUpdateVideo(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, thumbnail_url, category_id, status, featured } = data;

        const existing = await env.DB.prepare('SELECT id FROM videos WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Video no encontrado');
        }

        await env.DB.prepare(`
            UPDATE videos SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                video_url = COALESCE(?, video_url),
                thumbnail_url = COALESCE(?, thumbnail_url),
                category_id = COALESCE(?, category_id),
                status = COALESCE(?, status),
                featured = COALESCE(?, featured),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            video_url || null,
            thumbnail_url || null,
            category_id || null,
            status || null,
            featured !== undefined ? (featured ? 1 : 0) : null,
            id
        ).run();

        return success(null, 'Video actualizado');

    } catch (e) {
        return error('Error actualizando video: ' + e.message, 500);
    }
}

export async function handleAdminDeleteVideo(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
        await env.DB.prepare("DELETE FROM likes WHERE content_type = 'video' AND content_id = ?").bind(id).run();

        return success(null, 'Video eliminado');

    } catch (e) {
        return error('Error eliminando video: ' + e.message, 500);
    }
}
