// Rutas de cines

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// ========== PÚBLICO ==========

export async function handleGetCinemas(request, env) {
    try {
        const url = new URL(request.url);
        const zone = url.searchParams.get('zone') || '';

        let query = `
            SELECT c.*, z.name as zone_name
            FROM cinemas c
            LEFT JOIN zones z ON c.zone_id = z.id
            WHERE c.status = 'approved' AND c.is_active = 1
        `;
        const params = [];

        if (zone) {
            query += ' AND z.slug = ?';
            params.push(zone);
        }

        query += ' ORDER BY c.name ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo cines: ' + e.message, 500);
    }
}

export async function handleGetCinemaById(request, env, id) {
    try {
        const cinema = await env.DB.prepare(`
            SELECT c.*, z.name as zone_name
            FROM cinemas c
            LEFT JOIN zones z ON c.zone_id = z.id
            WHERE c.id = ? AND c.is_active = 1
        `).bind(id).first();

        if (!cinema) {
            return notFound('Cine no encontrado');
        }

        // Obtener películas en cartelera de este cine
        const movies = await env.DB.prepare(`
            SELECT DISTINCT m.*,
                   GROUP_CONCAT(DISTINCT s.format) as formats,
                   GROUP_CONCAT(DISTINCT s.language) as languages,
                   MIN(s.price) as min_price
            FROM movies m
            INNER JOIN showtimes s ON m.id = s.movie_id
            WHERE s.cinema_id = ?
              AND s.is_active = 1
              AND s.show_date >= date('now')
              AND m.is_active = 1
            GROUP BY m.id
            ORDER BY m.title ASC
        `).bind(id).all();

        return success({
            ...cinema,
            movies: movies.results
        });

    } catch (e) {
        return error('Error obteniendo cine: ' + e.message, 500);
    }
}

// ========== PELÍCULAS PÚBLICAS ==========

export async function handleGetMovies(request, env) {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || 'now_showing';

        let query = `
            SELECT m.*
            FROM movies m
            WHERE m.is_active = 1
        `;
        const params = [];

        if (status) {
            query += ' AND m.status = ?';
            params.push(status);
        }

        query += ' ORDER BY m.release_date DESC, m.title ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo películas: ' + e.message, 500);
    }
}

export async function handleGetMovieById(request, env, id) {
    try {
        const movie = await env.DB.prepare(`
            SELECT * FROM movies WHERE id = ? AND is_active = 1
        `).bind(id).first();

        if (!movie) {
            return notFound('Película no encontrada');
        }

        // Obtener funciones de esta película en todos los cines
        const showtimes = await env.DB.prepare(`
            SELECT s.*, c.name as cinema_name, c.address as cinema_address
            FROM showtimes s
            INNER JOIN cinemas c ON s.cinema_id = c.id
            WHERE s.movie_id = ?
              AND s.is_active = 1
              AND s.show_date >= date('now')
              AND c.is_active = 1
            ORDER BY s.show_date ASC, s.show_time ASC
        `).bind(id).all();

        return success({
            ...movie,
            showtimes: showtimes.results
        });

    } catch (e) {
        return error('Error obteniendo película: ' + e.message, 500);
    }
}

// ========== CARTELERA PÚBLICA ==========

export async function handleGetShowtimes(request, env) {
    try {
        const url = new URL(request.url);
        const cinemaId = url.searchParams.get('cinema_id');
        const movieId = url.searchParams.get('movie_id');
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

        let query = `
            SELECT s.*,
                   m.title as movie_title, m.poster_url, m.duration, m.rating,
                   c.name as cinema_name, c.address as cinema_address
            FROM showtimes s
            INNER JOIN movies m ON s.movie_id = m.id
            INNER JOIN cinemas c ON s.cinema_id = c.id
            WHERE s.is_active = 1
              AND s.show_date = ?
              AND m.is_active = 1
              AND c.is_active = 1
        `;
        const params = [date];

        if (cinemaId) {
            query += ' AND s.cinema_id = ?';
            params.push(cinemaId);
        }

        if (movieId) {
            query += ' AND s.movie_id = ?';
            params.push(movieId);
        }

        query += ' ORDER BY c.name ASC, s.show_time ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo cartelera: ' + e.message, 500);
    }
}

// ========== ADMIN: CINES ==========

export async function handleAdminGetCinemas(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const result = await env.DB.prepare(`
            SELECT c.*, z.name as zone_name
            FROM cinemas c
            LEFT JOIN zones z ON c.zone_id = z.id
            ORDER BY c.name ASC
        `).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo cines: ' + e.message, 500);
    }
}

export async function handleAdminCreateCinema(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { name, description, logo_url, image_url, address, latitude, longitude, zone_id, phone, whatsapp, website, instagram, total_screens, features, schedule, status } = data;

        if (!name) {
            return error('Nombre es requerido');
        }

        const slug = generateSlug(name);

        // Verificar duplicado
        const existing = await env.DB.prepare(
            'SELECT id FROM cinemas WHERE slug = ?'
        ).bind(slug).first();

        if (existing) {
            return error('Ya existe un cine con ese nombre');
        }

        const result = await env.DB.prepare(`
            INSERT INTO cinemas (name, slug, description, logo_url, image_url, address, latitude, longitude, zone_id, phone, whatsapp, website, instagram, total_screens, features, schedule, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            name,
            slug,
            description || null,
            logo_url || null,
            image_url || null,
            address || null,
            latitude || null,
            longitude || null,
            zone_id || null,
            phone || null,
            whatsapp || null,
            website || null,
            instagram || null,
            total_screens || 1,
            features ? JSON.stringify(features) : null,
            schedule || null,
            status || 'pending'
        ).run();

        return success({ id: result.meta.last_row_id }, 'Cine creado');

    } catch (e) {
        return error('Error creando cine: ' + e.message, 500);
    }
}

export async function handleAdminUpdateCinema(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        const existing = await env.DB.prepare('SELECT * FROM cinemas WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Cine no encontrado');
        }

        let slug = existing.slug;
        if (data.name && data.name !== existing.name) {
            slug = generateSlug(data.name);
        }

        const fields = ['name', 'description', 'logo_url', 'image_url', 'address', 'latitude', 'longitude', 'zone_id', 'phone', 'whatsapp', 'website', 'instagram', 'total_screens', 'features', 'schedule', 'status', 'is_active'];

        let setClause = fields.map(f => `${f} = COALESCE(?, ${f})`).join(', ');
        setClause += `, slug = ?, updated_at = datetime('now')`;

        const values = fields.map(f => {
            if (f === 'features' && data[f]) return JSON.stringify(data[f]);
            if (f === 'is_active') return data[f] !== undefined ? (data[f] ? 1 : 0) : null;
            return data[f] !== undefined ? data[f] : null;
        });

        await env.DB.prepare(`UPDATE cinemas SET ${setClause} WHERE id = ?`).bind(...values, slug, id).run();

        return success(null, 'Cine actualizado');

    } catch (e) {
        return error('Error actualizando cine: ' + e.message, 500);
    }
}

export async function handleAdminDeleteCinema(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Eliminar funciones del cine primero
        await env.DB.prepare('DELETE FROM showtimes WHERE cinema_id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM cinemas WHERE id = ?').bind(id).run();

        return success(null, 'Cine eliminado');

    } catch (e) {
        return error('Error eliminando cine: ' + e.message, 500);
    }
}

// ========== ADMIN: PELÍCULAS ==========

export async function handleAdminGetMovies(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || '';

        let query = 'SELECT * FROM movies';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY release_date DESC, title ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo películas: ' + e.message, 500);
    }
}

export async function handleAdminCreateMovie(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, original_title, synopsis, poster_url, backdrop_url, trailer_url, duration, rating, genre, director, cast, release_date, country, language, imdb_id, status } = data;

        if (!title) {
            return error('Título es requerido');
        }

        const slug = generateSlug(title);

        const result = await env.DB.prepare(`
            INSERT INTO movies (title, original_title, slug, synopsis, poster_url, backdrop_url, trailer_url, duration, rating, genre, director, "cast", release_date, country, language, imdb_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            original_title || null,
            slug,
            synopsis || null,
            poster_url || null,
            backdrop_url || null,
            trailer_url || null,
            duration || null,
            rating || 'ATP',
            genre ? (typeof genre === 'string' ? genre : JSON.stringify(genre)) : null,
            director || null,
            cast ? (typeof cast === 'string' ? cast : JSON.stringify(cast)) : null,
            release_date || null,
            country || null,
            language || null,
            imdb_id || null,
            status || 'now_showing'
        ).run();

        return success({ id: result.meta.last_row_id }, 'Película creada');

    } catch (e) {
        return error('Error creando película: ' + e.message, 500);
    }
}

export async function handleAdminUpdateMovie(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        const existing = await env.DB.prepare('SELECT * FROM movies WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Película no encontrada');
        }

        let slug = existing.slug;
        if (data.title && data.title !== existing.title) {
            slug = generateSlug(data.title);
        }

        const fields = ['title', 'original_title', 'synopsis', 'poster_url', 'backdrop_url', 'trailer_url', 'duration', 'rating', 'genre', 'director', 'cast', 'release_date', 'country', 'language', 'imdb_id', 'status', 'is_active'];

        // Escapar "cast" porque es palabra reservada de SQL
        let setClause = fields.map(f => {
            const col = f === 'cast' ? '"cast"' : f;
            return `${col} = COALESCE(?, ${col})`;
        }).join(', ');
        setClause += `, slug = ?, updated_at = datetime('now')`;

        const values = fields.map(f => {
            if ((f === 'genre' || f === 'cast') && data[f]) {
                // Evitar double stringify - si ya es string, no stringify de nuevo
                return typeof data[f] === 'string' ? data[f] : JSON.stringify(data[f]);
            }
            if (f === 'is_active') return data[f] !== undefined ? (data[f] ? 1 : 0) : null;
            return data[f] !== undefined ? data[f] : null;
        });

        await env.DB.prepare(`UPDATE movies SET ${setClause} WHERE id = ?`).bind(...values, slug, id).run();

        return success(null, 'Película actualizada');

    } catch (e) {
        return error('Error actualizando película: ' + e.message, 500);
    }
}

export async function handleAdminDeleteMovie(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Eliminar funciones de la película primero
        await env.DB.prepare('DELETE FROM showtimes WHERE movie_id = ?').bind(id).run();
        await env.DB.prepare('DELETE FROM movies WHERE id = ?').bind(id).run();

        return success(null, 'Película eliminada');

    } catch (e) {
        return error('Error eliminando película: ' + e.message, 500);
    }
}

// ========== ADMIN: FUNCIONES (CARTELERA) ==========

export async function handleAdminGetShowtimes(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const cinemaId = url.searchParams.get('cinema_id');
        const movieId = url.searchParams.get('movie_id');

        let query = `
            SELECT s.*,
                   m.title as movie_title, m.poster_url,
                   c.name as cinema_name
            FROM showtimes s
            INNER JOIN movies m ON s.movie_id = m.id
            INNER JOIN cinemas c ON s.cinema_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (cinemaId) {
            query += ' AND s.cinema_id = ?';
            params.push(cinemaId);
        }

        if (movieId) {
            query += ' AND s.movie_id = ?';
            params.push(movieId);
        }

        query += ' ORDER BY s.show_date DESC, s.show_time ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo funciones: ' + e.message, 500);
    }
}

export async function handleAdminCreateShowtime(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, available_seats, valid_from, valid_until } = data;

        if (!cinema_id || !movie_id || !show_date || !show_time) {
            return error('Cine, película, fecha y hora son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, available_seats, valid_from, valid_until)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            cinema_id,
            movie_id,
            screen_number || 1,
            show_date,
            show_time,
            format || '2D',
            language || 'subtitulada',
            price || 0,
            price_promo || null,
            available_seats || null,
            valid_from || null,
            valid_until || null
        ).run();

        return success({ id: result.meta.last_row_id }, 'Función creada');

    } catch (e) {
        return error('Error creando función: ' + e.message, 500);
    }
}

export async function handleAdminUpdateShowtime(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        const existing = await env.DB.prepare('SELECT id FROM showtimes WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Función no encontrada');
        }

        const fields = ['cinema_id', 'movie_id', 'screen_number', 'show_date', 'show_time', 'format', 'language', 'price', 'price_promo', 'available_seats', 'is_active', 'valid_from', 'valid_until'];

        let setClause = fields.map(f => `${f} = COALESCE(?, ${f})`).join(', ');

        const values = fields.map(f => {
            if (f === 'is_active') return data[f] !== undefined ? (data[f] ? 1 : 0) : null;
            return data[f] !== undefined ? data[f] : null;
        });

        await env.DB.prepare(`UPDATE showtimes SET ${setClause} WHERE id = ?`).bind(...values, id).run();

        return success(null, 'Función actualizada');

    } catch (e) {
        return error('Error actualizando función: ' + e.message, 500);
    }
}

export async function handleAdminDeleteShowtime(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM showtimes WHERE id = ?').bind(id).run();

        return success(null, 'Función eliminada');

    } catch (e) {
        return error('Error eliminando función: ' + e.message, 500);
    }
}

// Crear múltiples funciones a la vez (para cargar cartelera semanal)
export async function handleAdminBulkCreateShowtimes(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { showtimes } = await request.json();

        if (!showtimes || !Array.isArray(showtimes) || showtimes.length === 0) {
            return error('Se requiere un array de funciones');
        }

        let created = 0;
        for (const st of showtimes) {
            if (st.cinema_id && st.movie_id && st.show_date && st.show_time) {
                await env.DB.prepare(`
                    INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, valid_from, valid_until)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    st.cinema_id,
                    st.movie_id,
                    st.screen_number || 1,
                    st.show_date,
                    st.show_time,
                    st.format || '2D',
                    st.language || 'subtitulada',
                    st.price || 0,
                    st.price_promo || null,
                    st.valid_from || null,
                    st.valid_until || null
                ).run();
                created++;
            }
        }

        return success({ created }, `${created} funciones creadas`);

    } catch (e) {
        return error('Error creando funciones: ' + e.message, 500);
    }
}

// Bulk delete showtimes
export async function handleAdminBulkDeleteShowtimes(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return error('Se requiere un array de IDs');
        }

        let deleted = 0;
        for (const id of ids) {
            const result = await env.DB.prepare('DELETE FROM showtimes WHERE id = ?').bind(id).run();
            if (result.meta.changes > 0) deleted++;
        }

        return success({ deleted }, `${deleted} funciones eliminadas`);

    } catch (e) {
        return error('Error eliminando funciones: ' + e.message, 500);
    }
}
