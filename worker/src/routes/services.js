/**
 * Services Routes - Servicios profesionales
 */

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// PUBLIC ROUTES
// =============================================

/**
 * GET /api/services
 * Listar servicios aprobados (público)
 */
export async function handleGetServices(request, env) {
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
            FROM services s
            LEFT JOIN categories c ON s.category_id = c.id
            LEFT JOIN zones z ON s.zone_id = z.id
            WHERE s.status = 'approved'
        `;
        const params = [];

        if (categoryId) {
            baseQuery += ' AND s.category_id = ?';
            params.push(categoryId);
        }

        if (zoneId) {
            baseQuery += ' AND s.zone_id = ?';
            params.push(zoneId);
        }

        if (featured === 'true') {
            baseQuery += ' AND s.featured = 1';
        }

        if (search) {
            baseQuery += ' AND (s.title LIKE ? OR s.description LIKE ?)';
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
                s.*,
                c.name as category_name,
                c.icon as category_icon,
                z.name as zone_name
            ${baseQuery}
            ORDER BY s.featured DESC, s.created_at DESC
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
        return error('Error obteniendo servicios: ' + e.message, 500);
    }
}

/**
 * GET /api/services/:id
 * Obtener servicio por ID (público)
 */
export async function handleGetServiceById(request, env, id) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                s.*,
                c.name as category_name,
                c.icon as category_icon,
                z.name as zone_name
            FROM services s
            LEFT JOIN categories c ON s.category_id = c.id
            LEFT JOIN zones z ON s.zone_id = z.id
            WHERE s.id = ? AND s.status = 'approved'
        `).bind(id).first();

        if (!result) {
            return notFound('Servicio no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo servicio: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/admin/services
 * Listar todos los servicios (admin)
 */
export async function handleAdminGetServices(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

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
            FROM services s
            LEFT JOIN categories c ON s.category_id = c.id
            LEFT JOIN zones z ON s.zone_id = z.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            baseQuery += ' AND s.status = ?';
            params.push(status);
        }

        if (categoryId) {
            baseQuery += ' AND s.category_id = ?';
            params.push(categoryId);
        }

        if (zoneId) {
            baseQuery += ' AND s.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            baseQuery += ' AND (s.title LIKE ? OR s.description LIKE ?)';
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
                s.*,
                c.name as category_name,
                c.icon as category_icon,
                z.name as zone_name
            ${baseQuery}
            ORDER BY s.created_at DESC
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
        return error('Error obteniendo servicios: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/services
 * Crear servicio
 */
export async function handleAdminCreateService(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.title || !data.title.trim()) {
            return error('El título es requerido');
        }

        const result = await env.DB.prepare(`
            INSERT INTO services (
                title, description, image_url, images,
                category_id, author_id, zone_id, address, latitude, longitude,
                phone, whatsapp, email, website, instagram, facebook,
                price_from, price_to, price_unit, schedule, experience_years,
                status, featured, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
            data.title.trim(),
            data.description || null,
            data.image_url || null,
            data.images || null,
            data.category_id || null,
            user.id,
            data.zone_id || null,
            data.address || null,
            data.latitude || null,
            data.longitude || null,
            data.phone || null,
            data.whatsapp || null,
            data.email || null,
            data.website || null,
            data.instagram || null,
            data.facebook || null,
            data.price_from || null,
            data.price_to || null,
            data.price_unit || null,
            data.schedule || null,
            data.experience_years || null,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM services WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Servicio creado exitosamente');
    } catch (e) {
        return error('Error creando servicio: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/services/:id
 * Actualizar servicio
 */
export async function handleAdminUpdateService(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT * FROM services WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Servicio no encontrado');
        }

        const data = await request.json();

        await env.DB.prepare(`
            UPDATE services SET
                title = COALESCE(?, title),
                description = ?,
                image_url = ?,
                images = ?,
                category_id = ?,
                zone_id = ?,
                address = ?,
                latitude = ?,
                longitude = ?,
                phone = ?,
                whatsapp = ?,
                email = ?,
                website = ?,
                instagram = ?,
                facebook = ?,
                price_from = ?,
                price_to = ?,
                price_unit = ?,
                schedule = ?,
                experience_years = ?,
                status = COALESCE(?, status),
                featured = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            data.title?.trim() || null,
            data.description !== undefined ? data.description : existing.description,
            data.image_url !== undefined ? data.image_url : existing.image_url,
            data.images !== undefined ? data.images : existing.images,
            data.category_id !== undefined ? data.category_id : existing.category_id,
            data.zone_id !== undefined ? data.zone_id : existing.zone_id,
            data.address !== undefined ? data.address : existing.address,
            data.latitude !== undefined ? data.latitude : existing.latitude,
            data.longitude !== undefined ? data.longitude : existing.longitude,
            data.phone !== undefined ? data.phone : existing.phone,
            data.whatsapp !== undefined ? data.whatsapp : existing.whatsapp,
            data.email !== undefined ? data.email : existing.email,
            data.website !== undefined ? data.website : existing.website,
            data.instagram !== undefined ? data.instagram : existing.instagram,
            data.facebook !== undefined ? data.facebook : existing.facebook,
            data.price_from !== undefined ? data.price_from : existing.price_from,
            data.price_to !== undefined ? data.price_to : existing.price_to,
            data.price_unit !== undefined ? data.price_unit : existing.price_unit,
            data.schedule !== undefined ? data.schedule : existing.schedule,
            data.experience_years !== undefined ? data.experience_years : existing.experience_years,
            data.status,
            data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM services WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Servicio actualizado exitosamente');
    } catch (e) {
        return error('Error actualizando servicio: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/services/:id
 * Eliminar servicio
 */
export async function handleAdminDeleteService(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM services WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Servicio no encontrado');
        }

        await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(id).run();

        return success(null, 'Servicio eliminado exitosamente');
    } catch (e) {
        return error('Error eliminando servicio: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/services/:id/status
 * Cambiar estado de servicio
 */
export async function handleAdminUpdateServiceStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!['pending', 'approved', 'rejected'].includes(data.status)) {
            return error('Estado inválido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM services WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Servicio no encontrado');
        }

        await env.DB.prepare(`
            UPDATE services SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(data.status, id).run();

        const statusLabels = {
            pending: 'pendiente',
            approved: 'aprobado',
            rejected: 'rechazado'
        };

        return success(null, `Servicio ${statusLabels[data.status]}`);
    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/services/:id/featured
 * Toggle destacado
 */
export async function handleAdminToggleServiceFeatured(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, featured FROM services WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Servicio no encontrado');
        }

        const newFeatured = existing.featured ? 0 : 1;

        await env.DB.prepare(`
            UPDATE services SET featured = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newFeatured, id).run();

        return success(
            { featured: newFeatured },
            newFeatured ? 'Servicio destacado' : 'Servicio quitado de destacados'
        );
    } catch (e) {
        return error('Error actualizando destacado: ' + e.message, 500);
    }
}

// =============================================
// SERVICE PROVIDERS (Datos privados)
// =============================================

/**
 * GET /api/admin/services/:id/provider
 * Obtener datos del proveedor
 */
export async function handleGetServiceProvider(request, env, serviceId) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const provider = await env.DB.prepare(`
            SELECT * FROM service_providers WHERE service_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(serviceId).first();

        return success(provider || null);
    } catch (e) {
        return error('Error obteniendo proveedor: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/services/:id/provider
 * Crear o actualizar datos del proveedor
 */
export async function handleSaveServiceProvider(request, env, serviceId) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const service = await env.DB.prepare(
            'SELECT id FROM services WHERE id = ?'
        ).bind(serviceId).first();

        if (!service) {
            return notFound('Servicio no encontrado');
        }

        const data = await request.json();

        if (!data.full_name || !data.full_name.trim()) {
            return error('El nombre completo es requerido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM service_providers WHERE service_id = ?'
        ).bind(serviceId).first();

        if (existing) {
            await env.DB.prepare(`
                UPDATE service_providers SET
                    full_name = ?,
                    dni = ?,
                    address = ?,
                    phone_personal = ?,
                    photo1 = ?,
                    photo2 = ?,
                    notes = ?,
                    updated_at = datetime('now')
                WHERE service_id = ?
            `).bind(
                data.full_name.trim(),
                data.dni || null,
                data.address || null,
                data.phone_personal || null,
                data.photo1 || null,
                data.photo2 || null,
                data.notes || null,
                serviceId
            ).run();

            const updated = await env.DB.prepare(
                'SELECT * FROM service_providers WHERE service_id = ?'
            ).bind(serviceId).first();

            return success(updated, 'Datos del proveedor actualizados');
        } else {
            const result = await env.DB.prepare(`
                INSERT INTO service_providers (service_id, full_name, dni, address, phone_personal, photo1, photo2, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                serviceId,
                data.full_name.trim(),
                data.dni || null,
                data.address || null,
                data.phone_personal || null,
                data.photo1 || null,
                data.photo2 || null,
                data.notes || null
            ).run();

            const newProvider = await env.DB.prepare(
                'SELECT * FROM service_providers WHERE id = ?'
            ).bind(result.meta.last_row_id).first();

            return success(newProvider, 'Datos del proveedor guardados');
        }
    } catch (e) {
        return error('Error guardando proveedor: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/services/:id/provider
 * Eliminar datos del proveedor
 */
export async function handleDeleteServiceProvider(request, env, serviceId) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare(
            'DELETE FROM service_providers WHERE service_id = ?'
        ).bind(serviceId).run();

        return success(null, 'Datos del proveedor eliminados');
    } catch (e) {
        return error('Error eliminando proveedor: ' + e.message, 500);
    }
}
