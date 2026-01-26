// Accommodation Routes - Hoteles, hostales y alojamientos
// CRUD completo para el módulo de alojamiento

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// PUBLIC ROUTES
// =============================================

/**
 * GET /api/accommodations
 * Lista pública de alojamientos aprobados
 */
export async function handleGetAccommodations(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
        const offset = (page - 1) * limit;
        const zoneId = url.searchParams.get('zone_id');
        const zone = url.searchParams.get('zone');
        const search = url.searchParams.get('search');
        const featured = url.searchParams.get('featured');

        let query = `
            SELECT
                a.*,
                z.name as zone_name
            FROM accommodations a
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE a.status = 'approved'
        `;
        const params = [];

        if (zoneId) {
            query += ' AND a.zone_id = ?';
            params.push(zoneId);
        }

        if (zone) {
            query += ' AND z.slug = ?';
            params.push(zone);
        }

        if (search) {
            query += ' AND (a.name LIKE ? OR a.description LIKE ? OR a.address LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (featured === '1' || featured === 'true') {
            query += ' AND a.featured = 1';
        }

        // Count total
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Get results
        query += ' ORDER BY a.featured DESC, a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await env.DB.prepare(query).bind(...params).all();

        return success({
            items: results.results || [],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        return error('Error obteniendo alojamientos: ' + e.message, 500);
    }
}

/**
 * GET /api/accommodations/:id
 * Detalle de un alojamiento
 */
export async function handleGetAccommodationById(request, env, id) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                a.*,
                z.name as zone_name
            FROM accommodations a
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE a.id = ? AND a.status = 'approved'
        `).bind(id).first();

        if (!result) {
            return notFound('Alojamiento no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo alojamiento: ' + e.message, 500);
    }
}

/**
 * GET /api/accommodations/slug/:slug
 * Obtener alojamiento por slug
 */
export async function handleGetAccommodationBySlug(request, env, slug) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                a.*,
                z.name as zone_name
            FROM accommodations a
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE a.slug = ? AND a.status = 'approved'
        `).bind(slug).first();

        if (!result) {
            return notFound('Alojamiento no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo alojamiento: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/admin/accommodations
 * Lista de todos los alojamientos (admin)
 */
export async function handleAdminGetAccommodations(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(url.searchParams.get('limit')) || 50, 100);
        const offset = (page - 1) * limit;
        const status = url.searchParams.get('status');
        const zoneId = url.searchParams.get('zone_id');
        const search = url.searchParams.get('search');

        let query = `
            SELECT
                a.*,
                z.name as zone_name
            FROM accommodations a
            LEFT JOIN zones z ON a.zone_id = z.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND a.status = ?';
            params.push(status);
        }

        if (zoneId) {
            query += ' AND a.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            query += ' AND (a.name LIKE ? OR a.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Count
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Results
        query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const results = await env.DB.prepare(query).bind(...params).all();

        return success({
            items: results.results || [],
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (e) {
        return error('Error obteniendo alojamientos: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/accommodations
 * Crear nuevo alojamiento
 */
export async function handleAdminCreateAccommodation(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validaciones
        if (!data.name || !data.name.trim()) {
            return error('El nombre es requerido');
        }

        const result = await env.DB.prepare(`
            INSERT INTO accommodations (
                name, description, image_url,
                zone_id, address, latitude, longitude,
                phone, email, website,
                price_per_night, amenities, star_rating,
                author_id, status, featured, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
            data.name.trim(),
            data.description || null,
            data.image_url || null,
            data.zone_id || null,
            data.address || null,
            data.latitude || null,
            data.longitude || null,
            data.phone || null,
            data.email || null,
            data.website || null,
            data.price_per_night || null,
            data.amenities ? JSON.stringify(data.amenities) : null,
            data.star_rating || 0,
            user.id,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM accommodations WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Alojamiento creado exitosamente');
    } catch (e) {
        return error('Error creando alojamiento: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/accommodations/:id
 * Actualizar alojamiento
 */
export async function handleAdminUpdateAccommodation(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Verificar que existe
        const existing = await env.DB.prepare(
            'SELECT * FROM accommodations WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Alojamiento no encontrado');
        }

        const data = await request.json();

        await env.DB.prepare(`
            UPDATE accommodations SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                image_url = ?,
                zone_id = ?,
                address = ?,
                latitude = ?,
                longitude = ?,
                phone = ?,
                email = ?,
                website = ?,
                price_per_night = ?,
                amenities = ?,
                star_rating = ?,
                status = COALESCE(?, status),
                featured = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            data.name?.trim() || null,
            data.description,
            data.image_url !== undefined ? data.image_url : existing.image_url,
            data.zone_id !== undefined ? data.zone_id : existing.zone_id,
            data.address !== undefined ? data.address : existing.address,
            data.latitude !== undefined ? data.latitude : existing.latitude,
            data.longitude !== undefined ? data.longitude : existing.longitude,
            data.phone !== undefined ? data.phone : existing.phone,
            data.email !== undefined ? data.email : existing.email,
            data.website !== undefined ? data.website : existing.website,
            data.price_per_night !== undefined ? data.price_per_night : existing.price_per_night,
            data.amenities ? JSON.stringify(data.amenities) : existing.amenities,
            data.star_rating !== undefined ? data.star_rating : existing.star_rating,
            data.status,
            data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM accommodations WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Alojamiento actualizado exitosamente');
    } catch (e) {
        return error('Error actualizando alojamiento: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/accommodations/:id
 * Eliminar alojamiento
 */
export async function handleAdminDeleteAccommodation(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM accommodations WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Alojamiento no encontrado');
        }

        await env.DB.prepare('DELETE FROM accommodations WHERE id = ?').bind(id).run();

        return success(null, 'Alojamiento eliminado exitosamente');
    } catch (e) {
        return error('Error eliminando alojamiento: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/accommodations/:id/status
 * Cambiar estado de alojamiento (aprobar/rechazar)
 */
export async function handleAdminUpdateAccommodationStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
            return error('Estado inválido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM accommodations WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Alojamiento no encontrado');
        }

        await env.DB.prepare(`
            UPDATE accommodations SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(data.status, id).run();

        const statusLabels = {
            pending: 'pendiente',
            approved: 'aprobado',
            rejected: 'rechazado'
        };

        return success(null, `Alojamiento ${statusLabels[data.status]}`);
    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/accommodations/:id/featured
 * Toggle destacado
 */
export async function handleAdminToggleAccommodationFeatured(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, featured FROM accommodations WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Alojamiento no encontrado');
        }

        const newFeatured = existing.featured ? 0 : 1;

        await env.DB.prepare(`
            UPDATE accommodations SET featured = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newFeatured, id).run();

        return success(
            { featured: newFeatured },
            newFeatured ? 'Alojamiento destacado' : 'Alojamiento quitado de destacados'
        );
    } catch (e) {
        return error('Error actualizando destacado: ' + e.message, 500);
    }
}
