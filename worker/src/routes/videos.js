// Rutas de videos

import { success, error, notFound, forbidden } from '../utils/response.js';
import { requireEditor, requireVideoEditor, authMiddleware } from '../middleware/auth.js';

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

// =============================================
// VIDEOEDITOR ROUTES
// =============================================

// Obtener videos del videoeditor (solo sus propios videos)
export async function handleVideoEditorGetVideos(request, env) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT v.*, c.name as category_name,
                   vpi.playlist_id, vp.name as playlist_name
            FROM videos v
            LEFT JOIN categories c ON v.category_id = c.id
            LEFT JOIN video_playlist_items vpi ON v.id = vpi.video_id
            LEFT JOIN video_playlists vp ON vpi.playlist_id = vp.id
            WHERE v.author_id = ?
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM videos WHERE author_id = ?';
        const params = [user.id];

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

// Obtener estadisticas del videoeditor
export async function handleVideoEditorGetStats(request, env) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const stats = await env.DB.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(view_count) as total_views,
                SUM(like_count) as total_likes
            FROM videos
            WHERE author_id = ?
        `).bind(user.id).first();

        return success(stats);

    } catch (e) {
        return error('Error obteniendo estadisticas: ' + e.message, 500);
    }
}

// Crear video (videoeditor) - se aprueba automaticamente
export async function handleVideoEditorCreateVideo(request, env) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, thumbnail_url, category_id, playlist_id } = data;

        if (!title || !video_url) {
            return error('Titulo y URL del video son requeridos');
        }

        // Los videos del videoeditor se aprueban automaticamente
        const result = await env.DB.prepare(`
            INSERT INTO videos (title, description, video_url, thumbnail_url, category_id, author_id, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, 'approved', 0)
        `).bind(
            title,
            description || null,
            video_url,
            thumbnail_url || null,
            category_id || null,
            user.id
        ).run();

        const videoId = result.meta.last_row_id;

        // Si se especifico playlist, agregar el video
        if (playlist_id) {
            try {
                const maxPos = await env.DB.prepare(
                    'SELECT MAX(position) as max_pos FROM video_playlist_items WHERE playlist_id = ?'
                ).bind(playlist_id).first();
                const newPosition = (maxPos?.max_pos || 0) + 1;

                await env.DB.prepare(`
                    INSERT OR IGNORE INTO video_playlist_items (playlist_id, video_id, position)
                    VALUES (?, ?, ?)
                `).bind(playlist_id, videoId, newPosition).run();
            } catch (playlistError) {
                console.error('Error adding to playlist:', playlistError);
            }
        }

        return success({ id: videoId }, 'Video creado y publicado');

    } catch (e) {
        return error('Error creando video: ' + e.message, 500);
    }
}

// Actualizar video (videoeditor - solo sus propios videos)
export async function handleVideoEditorUpdateVideo(request, env, id) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, video_url, thumbnail_url, category_id } = data;

        // Verificar que el video pertenece al usuario
        const existing = await env.DB.prepare('SELECT id, author_id FROM videos WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Video no encontrado');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para editar este video');
        }

        await env.DB.prepare(`
            UPDATE videos SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                video_url = COALESCE(?, video_url),
                thumbnail_url = COALESCE(?, thumbnail_url),
                category_id = COALESCE(?, category_id),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            video_url || null,
            thumbnail_url || null,
            category_id || null,
            id
        ).run();

        return success(null, 'Video actualizado');

    } catch (e) {
        return error('Error actualizando video: ' + e.message, 500);
    }
}

// Eliminar video (videoeditor - solo sus propios videos pendientes o rechazados)
export async function handleVideoEditorDeleteVideo(request, env, id) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare('SELECT id, author_id, status FROM videos WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Video no encontrado');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para eliminar este video');
        }

        // Solo puede eliminar videos pendientes o rechazados (no aprobados)
        if (existing.status === 'approved' && user.role !== 'admin') {
            return forbidden('No puedes eliminar videos aprobados. Contacta al administrador.');
        }

        await env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
        await env.DB.prepare("DELETE FROM likes WHERE content_type = 'video' AND content_id = ?").bind(id).run();

        return success(null, 'Video eliminado');

    } catch (e) {
        return error('Error eliminando video: ' + e.message, 500);
    }
}

// =============================================
// YOUTUBE METADATA
// =============================================

// Obtener metadatos de un video de YouTube (titulo, canal) usando oEmbed API
export async function handleGetYouTubeMetadata(request, env) {
    try {
        const url = new URL(request.url);
        const videoUrl = url.searchParams.get('url');

        if (!videoUrl) {
            return error('URL del video requerida');
        }

        // Extraer video ID
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (!videoIdMatch) {
            return error('URL de YouTube invalida');
        }

        const videoId = videoIdMatch[1];

        // Usar oEmbed API oficial de YouTube
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);

        if (!response.ok) {
            throw new Error('No se pudo obtener el video');
        }

        const data = await response.json();

        // Thumbnail de alta calidad
        const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        return success({
            videoId,
            title: data.title || null,
            description: null, // oEmbed no proporciona descripcion
            channel: data.author_name || null,
            thumbnail
        });

    } catch (e) {
        return error('Error obteniendo metadatos: ' + e.message, 500);
    }
}

// Helper para decodificar entidades HTML
function decodeHTMLEntities(text) {
    if (!text) return text;
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/\\u0026/g, '&')
        .replace(/\\n/g, '\n');
}

// Helper para generar slug
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// =============================================
// VIDEO PLAYLISTS
// =============================================

// Obtener playlists públicas
export async function handleGetPlaylists(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 12;
        const offset = (page - 1) * limit;

        const [playlists, countResult] = await Promise.all([
            env.DB.prepare(`
                SELECT vp.*, u.name as author_name
                FROM video_playlists vp
                LEFT JOIN users u ON vp.author_id = u.id
                WHERE vp.is_public = 1 AND vp.video_count > 0
                ORDER BY vp.created_at DESC
                LIMIT ? OFFSET ?
            `).bind(limit, offset).all(),
            env.DB.prepare(
                'SELECT COUNT(*) as total FROM video_playlists WHERE is_public = 1 AND video_count > 0'
            ).first()
        ]);

        return success({
            playlists: playlists.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo playlists: ' + e.message, 500);
    }
}

// Obtener playlist por ID o slug con sus videos
export async function handleGetPlaylistById(request, env, id) {
    try {
        // Buscar por ID o slug
        const isNumeric = /^\d+$/.test(id);
        const playlist = await env.DB.prepare(`
            SELECT vp.*, u.name as author_name
            FROM video_playlists vp
            LEFT JOIN users u ON vp.author_id = u.id
            WHERE ${isNumeric ? 'vp.id = ?' : 'vp.slug = ?'}
        `).bind(id).first();

        if (!playlist) {
            return notFound('Playlist no encontrada');
        }

        // Obtener videos de la playlist
        const videos = await env.DB.prepare(`
            SELECT v.*, vpi.position, c.name as category_name, u.name as author_name
            FROM video_playlist_items vpi
            INNER JOIN videos v ON vpi.video_id = v.id
            LEFT JOIN categories c ON v.category_id = c.id
            LEFT JOIN users u ON v.author_id = u.id
            WHERE vpi.playlist_id = ? AND v.status = 'approved'
            ORDER BY vpi.position ASC
        `).bind(playlist.id).all();

        // Incrementar vistas
        await env.DB.prepare(
            'UPDATE video_playlists SET view_count = view_count + 1 WHERE id = ?'
        ).bind(playlist.id).run();

        return success({
            ...playlist,
            videos: videos.results
        });

    } catch (e) {
        return error('Error obteniendo playlist: ' + e.message, 500);
    }
}

// =============================================
// VIDEOEDITOR PLAYLISTS
// =============================================

// Obtener playlists del videoeditor
export async function handleVideoEditorGetPlaylists(request, env) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const playlists = await env.DB.prepare(`
            SELECT * FROM video_playlists
            WHERE author_id = ?
            ORDER BY created_at DESC
        `).bind(user.id).all();

        return success({ playlists: playlists.results });

    } catch (e) {
        return error('Error obteniendo playlists: ' + e.message, 500);
    }
}

// Crear playlist
export async function handleVideoEditorCreatePlaylist(request, env) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { name, description, cover_image, is_public } = data;

        if (!name) {
            return error('El nombre es requerido');
        }

        // Generar slug único
        let slug = generateSlug(name);
        const existing = await env.DB.prepare(
            'SELECT id FROM video_playlists WHERE slug = ?'
        ).bind(slug).first();

        if (existing) {
            slug = `${slug}-${Date.now()}`;
        }

        const result = await env.DB.prepare(`
            INSERT INTO video_playlists (name, slug, description, cover_image, author_id, is_public)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            name,
            slug,
            description || null,
            cover_image || null,
            user.id,
            is_public !== false ? 1 : 0
        ).run();

        return success({
            id: result.meta.last_row_id,
            slug
        }, 'Playlist creada');

    } catch (e) {
        return error('Error creando playlist: ' + e.message, 500);
    }
}

// Actualizar playlist
export async function handleVideoEditorUpdatePlaylist(request, env, id) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { name, description, cover_image, is_public } = data;

        const existing = await env.DB.prepare(
            'SELECT id, author_id FROM video_playlists WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Playlist no encontrada');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para editar esta playlist');
        }

        await env.DB.prepare(`
            UPDATE video_playlists SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                cover_image = COALESCE(?, cover_image),
                is_public = COALESCE(?, is_public),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            name || null,
            description || null,
            cover_image || null,
            is_public !== undefined ? (is_public ? 1 : 0) : null,
            id
        ).run();

        return success(null, 'Playlist actualizada');

    } catch (e) {
        return error('Error actualizando playlist: ' + e.message, 500);
    }
}

// Eliminar playlist
export async function handleVideoEditorDeletePlaylist(request, env, id) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, author_id FROM video_playlists WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Playlist no encontrada');
        }

        if (existing.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para eliminar esta playlist');
        }

        // Los items se eliminan por CASCADE
        await env.DB.prepare('DELETE FROM video_playlists WHERE id = ?').bind(id).run();

        return success(null, 'Playlist eliminada');

    } catch (e) {
        return error('Error eliminando playlist: ' + e.message, 500);
    }
}

// Agregar video a playlist
export async function handleVideoEditorAddToPlaylist(request, env, playlistId) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { video_id } = data;

        if (!video_id) {
            return error('ID de video requerido');
        }

        // Verificar que la playlist pertenece al usuario
        const playlist = await env.DB.prepare(
            'SELECT id, author_id FROM video_playlists WHERE id = ?'
        ).bind(playlistId).first();

        if (!playlist) {
            return notFound('Playlist no encontrada');
        }

        if (playlist.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para modificar esta playlist');
        }

        // Verificar que el video existe y está aprobado
        const video = await env.DB.prepare(
            'SELECT id FROM videos WHERE id = ? AND status = ?'
        ).bind(video_id, 'approved').first();

        if (!video) {
            return notFound('Video no encontrado o no aprobado');
        }

        // Obtener la posición máxima actual
        const maxPos = await env.DB.prepare(
            'SELECT MAX(position) as max_pos FROM video_playlist_items WHERE playlist_id = ?'
        ).bind(playlistId).first();

        const newPosition = (maxPos?.max_pos || 0) + 1;

        // Insertar (ignorar si ya existe)
        await env.DB.prepare(`
            INSERT OR IGNORE INTO video_playlist_items (playlist_id, video_id, position)
            VALUES (?, ?, ?)
        `).bind(playlistId, video_id, newPosition).run();

        return success(null, 'Video agregado a la playlist');

    } catch (e) {
        return error('Error agregando video: ' + e.message, 500);
    }
}

// Quitar video de playlist
export async function handleVideoEditorRemoveFromPlaylist(request, env, playlistId, videoId) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        // Verificar que la playlist pertenece al usuario
        const playlist = await env.DB.prepare(
            'SELECT id, author_id FROM video_playlists WHERE id = ?'
        ).bind(playlistId).first();

        if (!playlist) {
            return notFound('Playlist no encontrada');
        }

        if (playlist.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para modificar esta playlist');
        }

        await env.DB.prepare(
            'DELETE FROM video_playlist_items WHERE playlist_id = ? AND video_id = ?'
        ).bind(playlistId, videoId).run();

        return success(null, 'Video eliminado de la playlist');

    } catch (e) {
        return error('Error eliminando video: ' + e.message, 500);
    }
}

// Reordenar videos en playlist
export async function handleVideoEditorReorderPlaylist(request, env, playlistId) {
    const { user, error: authError } = await requireVideoEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { video_ids } = data; // Array de IDs en el nuevo orden

        if (!video_ids || !Array.isArray(video_ids)) {
            return error('Array de video_ids requerido');
        }

        // Verificar que la playlist pertenece al usuario
        const playlist = await env.DB.prepare(
            'SELECT id, author_id FROM video_playlists WHERE id = ?'
        ).bind(playlistId).first();

        if (!playlist) {
            return notFound('Playlist no encontrada');
        }

        if (playlist.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para modificar esta playlist');
        }

        // Actualizar posiciones
        const updates = video_ids.map((videoId, index) =>
            env.DB.prepare(
                'UPDATE video_playlist_items SET position = ? WHERE playlist_id = ? AND video_id = ?'
            ).bind(index + 1, playlistId, videoId).run()
        );

        await Promise.all(updates);

        return success(null, 'Orden actualizado');

    } catch (e) {
        return error('Error reordenando playlist: ' + e.message, 500);
    }
}
