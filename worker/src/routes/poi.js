/**
 * Points of Interest Routes - Puntos de interés turístico
 */

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// PUBLIC ROUTES
// =============================================

/**
 * GET /api/poi
 * Listar puntos de interés aprobados (público)
 */
export async function getPublicPoi(request, env) {
    try {
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('category_id');
        const zoneId = url.searchParams.get('zone_id');
        const featured = url.searchParams.get('featured');
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM points_of_interest p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            WHERE p.status = 'approved'
        `;
        const params = [];

        if (categoryId) {
            baseQuery += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        if (zoneId) {
            baseQuery += ' AND p.zone_id = ?';
            params.push(zoneId);
        }

        if (featured === 'true') {
            baseQuery += ' AND p.featured = 1';
        }

        if (search) {
            baseQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Count total
        const countResult = await env.DB.prepare(`SELECT COUNT(*) as total ${baseQuery}`)
            .bind(...params)
            .first();
        const total = countResult?.total || 0;

        // Get paginated results
        const query = `
            SELECT
                p.*,
                c.name as category_name,
                c.icon as category_icon,
                z.name as zone_name
            ${baseQuery}
            ORDER BY p.featured DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const results = await env.DB.prepare(query)
            .bind(...params, limit, offset)
            .all();

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
        return error('Error obteniendo puntos de interés: ' + e.message, 500);
    }
}

/**
 * GET /api/poi/:id
 * Obtener punto de interés por ID (público)
 */
export async function getPublicPoiById(request, env, params) {
    try {
        const result = await env.DB.prepare(`
            SELECT p.*, c.name as category_name, c.icon as category_icon, z.name as zone_name
            FROM points_of_interest p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            WHERE p.id = ? AND p.status = 'approved'
        `).bind(params.id).first();

        if (!result) return notFound('Punto de interés no encontrado');
        return success(result);
    } catch (e) {
        return error('Error obteniendo punto de interés: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/admin/poi
 * Listar todos los puntos de interés (admin)
 */
export async function getAdminPoi(request, env) {
    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const categoryId = url.searchParams.get('category_id');
        const zoneId = url.searchParams.get('zone_id');
        const search = url.searchParams.get('search');
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const offset = (page - 1) * limit;

        let baseQuery = `
            FROM points_of_interest p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            baseQuery += ' AND p.status = ?';
            params.push(status);
        }

        if (categoryId) {
            baseQuery += ' AND p.category_id = ?';
            params.push(categoryId);
        }

        if (zoneId) {
            baseQuery += ' AND p.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            baseQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Count total
        const countResult = await env.DB.prepare(`SELECT COUNT(*) as total ${baseQuery}`)
            .bind(...params)
            .first();
        const total = countResult?.total || 0;

        // Get paginated results
        const query = `
            SELECT
                p.*,
                c.name as category_name,
                c.icon as category_icon,
                z.name as zone_name
            ${baseQuery}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `;

        const results = await env.DB.prepare(query)
            .bind(...params, limit, offset)
            .all();

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
        return error('Error obteniendo puntos de interés: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/poi
 * Crear punto de interés
 */
export async function createPoi(request, env) {
    try {
        const data = await request.json();
        const user = request.user;

        if (!data.name || !data.description) {
            return error('Nombre y descripción son requeridos', 400);
        }

        const result = await env.DB.prepare(`
            INSERT INTO points_of_interest (
                name, description, image_url, images, category_id, author_id,
                zone_id, address, latitude, longitude, phone, website,
                schedule, entry_fee, is_free, accessibility, status, featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            data.name,
            data.description,
            data.image_url || null,
            data.images ? JSON.stringify(data.images) : null,
            data.category_id || null,
            user.id,
            data.zone_id || null,
            data.address || null,
            data.latitude || null,
            data.longitude || null,
            data.phone || null,
            data.website || null,
            data.schedule || null,
            data.entry_fee || 0,
            data.is_free !== false ? 1 : 0,
            data.accessibility || null,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id, message: 'Punto de interés creado' });
    } catch (e) {
        return error('Error creando punto de interés: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/poi/:id
 * Actualizar punto de interés
 */
export async function updatePoi(request, env, params) {
    try {
        const data = await request.json();

        // Check exists
        const existing = await env.DB.prepare('SELECT id FROM points_of_interest WHERE id = ?')
            .bind(params.id).first();
        if (!existing) return notFound('Punto de interés no encontrado');

        const fields = [];
        const values = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
        if (data.image_url !== undefined) { fields.push('image_url = ?'); values.push(data.image_url); }
        if (data.images !== undefined) { fields.push('images = ?'); values.push(JSON.stringify(data.images)); }
        if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
        if (data.zone_id !== undefined) { fields.push('zone_id = ?'); values.push(data.zone_id); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.latitude !== undefined) { fields.push('latitude = ?'); values.push(data.latitude); }
        if (data.longitude !== undefined) { fields.push('longitude = ?'); values.push(data.longitude); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.website !== undefined) { fields.push('website = ?'); values.push(data.website); }
        if (data.schedule !== undefined) { fields.push('schedule = ?'); values.push(data.schedule); }
        if (data.entry_fee !== undefined) { fields.push('entry_fee = ?'); values.push(data.entry_fee); }
        if (data.is_free !== undefined) { fields.push('is_free = ?'); values.push(data.is_free ? 1 : 0); }
        if (data.accessibility !== undefined) { fields.push('accessibility = ?'); values.push(data.accessibility); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
        if (data.featured !== undefined) { fields.push('featured = ?'); values.push(data.featured ? 1 : 0); }

        if (fields.length === 0) return error('No hay campos para actualizar', 400);

        fields.push("updated_at = datetime('now')");
        values.push(params.id);

        await env.DB.prepare(`UPDATE points_of_interest SET ${fields.join(', ')} WHERE id = ?`)
            .bind(...values).run();

        return success({ message: 'Punto de interés actualizado' });
    } catch (e) {
        return error('Error actualizando punto de interés: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/poi/:id
 * Eliminar punto de interés
 */
export async function deletePoi(request, env, params) {
    try {
        const existing = await env.DB.prepare('SELECT id FROM points_of_interest WHERE id = ?')
            .bind(params.id).first();
        if (!existing) return notFound('Punto de interés no encontrado');

        await env.DB.prepare('DELETE FROM points_of_interest WHERE id = ?')
            .bind(params.id).run();

        return success({ message: 'Punto de interés eliminado' });
    } catch (e) {
        return error('Error eliminando punto de interés: ' + e.message, 500);
    }
}
