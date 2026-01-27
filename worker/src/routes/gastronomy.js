// Gastronomy Routes - Restaurantes y locales de comida
// CRUD completo para el módulo de gastronomía

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// FUNCIONES AUXILIARES
// =============================================

function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// =============================================
// PUBLIC ROUTES
// =============================================

/**
 * GET /api/gastronomy
 * Lista pública de restaurantes aprobados
 */
export async function handleGetGastronomy(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
        const offset = (page - 1) * limit;
        const zoneId = url.searchParams.get('zone_id');
        const categoryId = url.searchParams.get('category_id');
        const search = url.searchParams.get('search');
        const hasDelivery = url.searchParams.get('has_delivery');
        const hasTakeaway = url.searchParams.get('has_takeaway');
        const priceRange = url.searchParams.get('price_range');
        const featured = url.searchParams.get('featured');
        const specialties = url.searchParams.get('specialties');

        let query = `
            SELECT
                g.*,
                z.name as zone_name,
                c.name as category_name
            FROM gastronomy g
            LEFT JOIN zones z ON g.zone_id = z.id
            LEFT JOIN categories c ON g.category_id = c.id
            WHERE g.status = 'approved'
        `;
        const params = [];

        if (zoneId) {
            query += ' AND g.zone_id = ?';
            params.push(zoneId);
        }

        if (categoryId) {
            query += ' AND g.category_id = ?';
            params.push(categoryId);
        }

        if (search) {
            query += ' AND (g.name LIKE ? OR g.description LIKE ? OR g.specialties LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (hasDelivery === '1' || hasDelivery === 'true') {
            query += ' AND g.has_delivery = 1';
        }

        if (hasTakeaway === '1' || hasTakeaway === 'true') {
            query += ' AND g.has_takeaway = 1';
        }

        if (priceRange) {
            query += ' AND g.price_range = ?';
            params.push(priceRange);
        }

        if (featured === '1' || featured === 'true') {
            query += ' AND g.featured = 1';
        }

        if (specialties) {
            query += ' AND g.specialties = ?';
            params.push(specialties);
        }

        // Count total
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Get results
        query += ' ORDER BY g.featured DESC, g.name ASC LIMIT ? OFFSET ?';
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
        return error('Error obteniendo restaurantes: ' + e.message, 500);
    }
}

/**
 * GET /api/gastronomy/:id
 * Detalle de un restaurante
 */
export async function handleGetGastronomyById(request, env, id) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                g.*,
                z.name as zone_name,
                c.name as category_name,
                u.name as author_name
            FROM gastronomy g
            LEFT JOIN zones z ON g.zone_id = z.id
            LEFT JOIN categories c ON g.category_id = c.id
            LEFT JOIN users u ON g.author_id = u.id
            WHERE g.id = ? AND g.status = 'approved'
        `).bind(id).first();

        if (!result) {
            return notFound('Restaurante no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo restaurante: ' + e.message, 500);
    }
}

/**
 * GET /api/gastronomy/slug/:slug
 * Obtener restaurante por slug
 */
export async function handleGetGastronomyBySlug(request, env, slug) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                g.*,
                z.name as zone_name,
                c.name as category_name,
                u.name as author_name
            FROM gastronomy g
            LEFT JOIN zones z ON g.zone_id = z.id
            LEFT JOIN categories c ON g.category_id = c.id
            LEFT JOIN users u ON g.author_id = u.id
            WHERE g.slug = ? AND g.status = 'approved'
        `).bind(slug).first();

        if (!result) {
            return notFound('Restaurante no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo restaurante: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/admin/gastronomy
 * Lista de todos los restaurantes (admin)
 */
export async function handleAdminGetGastronomy(request, env) {
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
                g.*,
                z.name as zone_name,
                c.name as category_name,
                u.name as author_name
            FROM gastronomy g
            LEFT JOIN zones z ON g.zone_id = z.id
            LEFT JOIN categories c ON g.category_id = c.id
            LEFT JOIN users u ON g.author_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND g.status = ?';
            params.push(status);
        }

        if (zoneId) {
            query += ' AND g.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            query += ' AND (g.name LIKE ? OR g.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Count
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Results
        query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
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
        return error('Error obteniendo restaurantes: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/gastronomy
 * Crear nuevo restaurante
 */
export async function handleAdminCreateGastronomy(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validaciones
        if (!data.name || !data.name.trim()) {
            return error('El nombre es requerido');
        }

        // Generar slug único
        let slug = generateSlug(data.name);
        const existingSlug = await env.DB.prepare(
            'SELECT id FROM gastronomy WHERE slug = ?'
        ).bind(slug).first();

        if (existingSlug) {
            slug = `${slug}-${Date.now()}`;
        }

        const result = await env.DB.prepare(`
            INSERT INTO gastronomy (
                name, slug, description, image_url, images,
                category_id, author_id, zone_id,
                address, latitude, longitude,
                phone, email, website, instagram,
                price_range, schedule,
                has_delivery, has_takeaway,
                specialties, status, featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.name.trim(),
            slug,
            data.description || null,
            data.image_url || null,
            data.images ? JSON.stringify(data.images) : null,
            data.category_id || null,
            user.id,
            data.zone_id || null,
            data.address || null,
            data.latitude || null,
            data.longitude || null,
            data.phone || null,
            data.email || null,
            data.website || null,
            data.instagram || null,
            data.price_range || null,
            data.schedule || null,
            data.has_delivery ? 1 : 0,
            data.has_takeaway ? 1 : 0,
            data.specialties || null,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM gastronomy WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Restaurante creado exitosamente');
    } catch (e) {
        return error('Error creando restaurante: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/gastronomy/:id
 * Actualizar restaurante
 */
export async function handleAdminUpdateGastronomy(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Verificar que existe
        const existing = await env.DB.prepare(
            'SELECT * FROM gastronomy WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Restaurante no encontrado');
        }

        const data = await request.json();

        // Si cambia el nombre, actualizar slug
        let slug = existing.slug;
        if (data.name && data.name.trim() !== existing.name) {
            slug = generateSlug(data.name);
            const existingSlug = await env.DB.prepare(
                'SELECT id FROM gastronomy WHERE slug = ? AND id != ?'
            ).bind(slug, id).first();
            if (existingSlug) {
                slug = `${slug}-${Date.now()}`;
            }
        }

        await env.DB.prepare(`
            UPDATE gastronomy SET
                name = COALESCE(?, name),
                slug = ?,
                description = COALESCE(?, description),
                image_url = ?,
                images = ?,
                category_id = ?,
                zone_id = ?,
                address = ?,
                latitude = ?,
                longitude = ?,
                phone = ?,
                email = ?,
                website = ?,
                instagram = ?,
                price_range = ?,
                schedule = ?,
                has_delivery = ?,
                has_takeaway = ?,
                specialties = ?,
                status = COALESCE(?, status),
                featured = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            data.name?.trim() || null,
            slug,
            data.description,
            data.image_url || null,
            data.images ? JSON.stringify(data.images) : existing.images,
            data.category_id !== undefined ? data.category_id : existing.category_id,
            data.zone_id !== undefined ? data.zone_id : existing.zone_id,
            data.address !== undefined ? data.address : existing.address,
            data.latitude !== undefined ? data.latitude : existing.latitude,
            data.longitude !== undefined ? data.longitude : existing.longitude,
            data.phone !== undefined ? data.phone : existing.phone,
            data.email !== undefined ? data.email : existing.email,
            data.website !== undefined ? data.website : existing.website,
            data.instagram !== undefined ? data.instagram : existing.instagram,
            data.price_range !== undefined ? data.price_range : existing.price_range,
            data.schedule !== undefined ? data.schedule : existing.schedule,
            data.has_delivery !== undefined ? (data.has_delivery ? 1 : 0) : existing.has_delivery,
            data.has_takeaway !== undefined ? (data.has_takeaway ? 1 : 0) : existing.has_takeaway,
            data.specialties !== undefined ? data.specialties : existing.specialties,
            data.status,
            data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM gastronomy WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Restaurante actualizado exitosamente');
    } catch (e) {
        return error('Error actualizando restaurante: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/gastronomy/:id
 * Eliminar restaurante
 */
export async function handleAdminDeleteGastronomy(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM gastronomy WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Restaurante no encontrado');
        }

        await env.DB.prepare('DELETE FROM gastronomy WHERE id = ?').bind(id).run();

        return success(null, 'Restaurante eliminado exitosamente');
    } catch (e) {
        return error('Error eliminando restaurante: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/gastronomy/:id/status
 * Cambiar estado de restaurante (aprobar/rechazar)
 */
export async function handleAdminUpdateGastronomyStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
            return error('Estado inválido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM gastronomy WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Restaurante no encontrado');
        }

        await env.DB.prepare(`
            UPDATE gastronomy SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(data.status, id).run();

        const statusLabels = {
            pending: 'pendiente',
            approved: 'aprobado',
            rejected: 'rechazado'
        };

        return success(null, `Restaurante ${statusLabels[data.status]}`);
    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/gastronomy/:id/featured
 * Toggle destacado
 */
export async function handleAdminToggleGastronomyFeatured(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, featured FROM gastronomy WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Restaurante no encontrado');
        }

        const newFeatured = existing.featured ? 0 : 1;

        await env.DB.prepare(`
            UPDATE gastronomy SET featured = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newFeatured, id).run();

        return success(
            { featured: newFeatured },
            newFeatured ? 'Restaurante destacado' : 'Restaurante quitado de destacados'
        );
    } catch (e) {
        return error('Error actualizando destacado: ' + e.message, 500);
    }
}
