// Rutas de noticias

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor, authMiddleware } from '../middleware/auth.js';

function generateSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 100);
}

export async function handleGetNews(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const category = url.searchParams.get('category') || '';
        const featured = url.searchParams.get('featured');
        const offset = (page - 1) * limit;

        let query = `
            SELECT n.*, c.name as category_name, u.name as author_name
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.status = 'published'
        `;
        let countQuery = "SELECT COUNT(*) as total FROM news WHERE status = 'published'";
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ? AND section = "noticias")';
            params.push(category);
        }

        if (featured === '1') {
            query += ' AND n.featured = 1';
            countQuery += ' AND featured = 1';
        }

        query += ' ORDER BY n.published_at DESC, n.created_at DESC LIMIT ? OFFSET ?';

        const [news, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            news: news.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo noticias: ' + e.message, 500);
    }
}

export async function handleGetNewsById(request, env, id) {
    try {
        const news = await env.DB.prepare(`
            SELECT n.*, c.name as category_name, c.slug as category_slug,
                   u.name as author_name, u.avatar_url as author_avatar
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.id = ?
        `).bind(id).first();

        if (!news) {
            return notFound('Noticia no encontrada');
        }

        // Incrementar vistas
        await env.DB.prepare(
            'UPDATE news SET view_count = view_count + 1 WHERE id = ?'
        ).bind(id).run();

        // Obtener usuario actual para verificar like
        const { user } = await authMiddleware(request, env);
        let userLiked = false;
        if (user) {
            const like = await env.DB.prepare(
                'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
            ).bind(user.id, 'news', id).first();
            userLiked = !!like;
        }

        return success({ ...news, user_liked: userLiked });

    } catch (e) {
        return error('Error obteniendo noticia: ' + e.message, 500);
    }
}

export async function handleGetNewsBySlug(request, env, slug) {
    try {
        const news = await env.DB.prepare(`
            SELECT n.*, c.name as category_name, c.slug as category_slug,
                   u.name as author_name, u.avatar_url as author_avatar
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE n.slug = ?
        `).bind(slug).first();

        if (!news) {
            return notFound('Noticia no encontrada');
        }

        // Incrementar vistas
        await env.DB.prepare(
            'UPDATE news SET view_count = view_count + 1 WHERE id = ?'
        ).bind(news.id).run();

        return success(news);

    } catch (e) {
        return error('Error obteniendo noticia: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetNews(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT n.*, c.name as category_name, u.name as author_name
            FROM news n
            LEFT JOIN categories c ON n.category_id = c.id
            LEFT JOIN users u ON n.author_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM news WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND n.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
        }

        if (search) {
            query += ' AND (n.title LIKE ? OR n.summary LIKE ?)';
            countQuery += ' AND (title LIKE ? OR summary LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';

        const [news, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            news: news.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo noticias: ' + e.message, 500);
    }
}

export async function handleAdminCreateNews(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, summary, content, image_url, image_alt, images, category_id, status, featured, source_url, expiration_date, published_date } = data;

        if (!title || !content) {
            return error('Título y contenido son requeridos');
        }

        let slug = generateSlug(title);
        // Verificar slug único
        const existing = await env.DB.prepare('SELECT id FROM news WHERE slug = ?').bind(slug).first();
        if (existing) {
            slug = slug + '-' + Date.now();
        }

        // Si hay fecha de publicación manual, usarla; sino usar la fecha actual si está publicada
        const publishedAt = published_date || (status === 'published' ? new Date().toISOString() : null);

        const result = await env.DB.prepare(`
            INSERT INTO news (title, slug, summary, content, image_url, image_alt, images, category_id, author_id, status, featured, source_url, expiration_date, published_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            slug,
            summary || null,
            content,
            image_url || null,
            image_alt || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            user.id,
            status || 'draft',
            featured ? 1 : 0,
            source_url || null,
            expiration_date || null,
            publishedAt
        ).run();

        return success({ id: result.meta.last_row_id, slug }, 'Noticia creada');

    } catch (e) {
        return error('Error creando noticia: ' + e.message, 500);
    }
}

export async function handleAdminUpdateNews(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, summary, content, image_url, image_alt, images, category_id, status, featured, source_url, expiration_date, published_date } = data;

        const existing = await env.DB.prepare('SELECT * FROM news WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Noticia no encontrada');
        }

        // Si hay fecha de publicación manual, usarla; sino mantener la existente o usar fecha actual si recién se publica
        let publishedAt = existing.published_at;
        if (published_date) {
            publishedAt = published_date;
        } else if (status === 'published' && existing.status !== 'published') {
            publishedAt = new Date().toISOString();
        }

        await env.DB.prepare(`
            UPDATE news SET
                title = COALESCE(?, title),
                summary = COALESCE(?, summary),
                content = COALESCE(?, content),
                image_url = COALESCE(?, image_url),
                image_alt = COALESCE(?, image_alt),
                images = COALESCE(?, images),
                category_id = COALESCE(?, category_id),
                status = COALESCE(?, status),
                featured = COALESCE(?, featured),
                source_url = COALESCE(?, source_url),
                expiration_date = COALESCE(?, expiration_date),
                published_at = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            summary || null,
            content || null,
            image_url || null,
            image_alt || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            status || null,
            featured !== undefined ? (featured ? 1 : 0) : null,
            source_url || null,
            expiration_date || null,
            publishedAt,
            id
        ).run();

        return success(null, 'Noticia actualizada');

    } catch (e) {
        return error('Error actualizando noticia: ' + e.message, 500);
    }
}

export async function handleAdminDeleteNews(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
        await env.DB.prepare("DELETE FROM likes WHERE content_type = 'news' AND content_id = ?").bind(id).run();

        return success(null, 'Noticia eliminada');

    } catch (e) {
        return error('Error eliminando noticia: ' + e.message, 500);
    }
}
