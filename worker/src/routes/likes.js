// Rutas de likes

import { success, error } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const VALID_CONTENT_TYPES = ['news', 'product', 'event', 'video', 'accommodation', 'gastronomy', 'transport', 'service', 'poi'];

const CONTENT_TABLES = {
    news: 'news',
    product: 'products',
    event: 'events',
    video: 'videos',
    accommodation: 'accommodations',
    gastronomy: 'gastronomy',
    transport: 'transport',
    service: 'services',
    poi: 'points_of_interest'
};

export async function handleToggleLike(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const { content_type, content_id } = await request.json();

        if (!content_type || !content_id) {
            return error('Tipo y ID de contenido son requeridos');
        }

        if (!VALID_CONTENT_TYPES.includes(content_type)) {
            return error('Tipo de contenido inválido');
        }

        // Verificar si ya existe el like
        const existingLike = await env.DB.prepare(
            'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
        ).bind(user.id, content_type, content_id).first();

        const table = CONTENT_TABLES[content_type];
        let liked = false;

        if (existingLike) {
            // Quitar like
            await env.DB.prepare(
                'DELETE FROM likes WHERE id = ?'
            ).bind(existingLike.id).run();

            // Decrementar contador
            await env.DB.prepare(
                `UPDATE ${table} SET like_count = MAX(0, like_count - 1) WHERE id = ?`
            ).bind(content_id).run();

            liked = false;
        } else {
            // Agregar like
            await env.DB.prepare(
                'INSERT INTO likes (user_id, content_type, content_id) VALUES (?, ?, ?)'
            ).bind(user.id, content_type, content_id).run();

            // Incrementar contador
            await env.DB.prepare(
                `UPDATE ${table} SET like_count = like_count + 1 WHERE id = ?`
            ).bind(content_id).run();

            liked = true;
        }

        // Obtener nuevo contador
        const result = await env.DB.prepare(
            `SELECT like_count FROM ${table} WHERE id = ?`
        ).bind(content_id).first();

        return success({
            liked,
            like_count: result?.like_count || 0
        });

    } catch (e) {
        return error('Error procesando like: ' + e.message, 500);
    }
}

export async function handleGetLikeStatus(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const content_type = url.searchParams.get('content_type');
        const content_id = url.searchParams.get('content_id');

        if (!content_type || !content_id) {
            return error('Tipo y ID de contenido son requeridos');
        }

        const like = await env.DB.prepare(
            'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
        ).bind(user.id, content_type, content_id).first();

        return success({ liked: !!like });

    } catch (e) {
        return error('Error obteniendo estado de like: ' + e.message, 500);
    }
}

export async function handleGetUserLikes(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const content_type = url.searchParams.get('content_type') || '';

        let query = 'SELECT content_type, content_id, created_at FROM likes WHERE user_id = ?';
        const params = [user.id];

        if (content_type) {
            query += ' AND content_type = ?';
            params.push(content_type);
        }

        query += ' ORDER BY created_at DESC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo likes: ' + e.message, 500);
    }
}
