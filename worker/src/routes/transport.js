// Transport Routes - Transporte público y privado
// CRUD completo para el módulo de transporte

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// PUBLIC ROUTES
// =============================================

/**
 * GET /api/transport
 * Lista pública de transportes aprobados
 */
export async function handleGetTransport(request, env) {
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
                t.*,
                z.name as zone_name
            FROM transport t
            LEFT JOIN zones z ON t.zone_id = z.id
            WHERE t.status = 'approved'
        `;
        const params = [];

        if (zoneId) {
            query += ' AND t.zone_id = ?';
            params.push(zoneId);
        }

        if (zone) {
            query += ' AND z.slug = ?';
            params.push(zone);
        }

        if (search) {
            query += ' AND (t.name LIKE ? OR t.description LIKE ? OR t.routes LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (featured === '1' || featured === 'true') {
            query += ' AND t.featured = 1';
        }

        // Count total
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Get results
        query += ' ORDER BY t.featured DESC, t.created_at DESC LIMIT ? OFFSET ?';
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
        return error('Error obteniendo transportes: ' + e.message, 500);
    }
}

/**
 * GET /api/transport/:id
 * Detalle de un transporte
 */
export async function handleGetTransportById(request, env, id) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                t.*,
                z.name as zone_name
            FROM transport t
            LEFT JOIN zones z ON t.zone_id = z.id
            WHERE t.id = ? AND t.status = 'approved'
        `).bind(id).first();

        if (!result) {
            return notFound('Transporte no encontrado');
        }

        return success(result);
    } catch (e) {
        return error('Error obteniendo transporte: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES
// =============================================

/**
 * GET /api/admin/transport
 * Lista de todos los transportes (admin)
 */
export async function handleAdminGetTransport(request, env) {
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
                t.*,
                z.name as zone_name
            FROM transport t
            LEFT JOIN zones z ON t.zone_id = z.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (zoneId) {
            query += ' AND t.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            query += ' AND (t.name LIKE ? OR t.description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Count
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Results
        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
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
        return error('Error obteniendo transportes: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/transport
 * Crear nuevo transporte
 */
export async function handleAdminCreateTransport(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validaciones
        if (!data.name || !data.name.trim()) {
            return error('El nombre es requerido');
        }

        const result = await env.DB.prepare(`
            INSERT INTO transport (
                name, description, image_url,
                zone_id, address, phone, email, website,
                schedule, routes,
                author_id, status, featured, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).bind(
            data.name.trim(),
            data.description || null,
            data.image_url || null,
            data.zone_id || null,
            data.address || null,
            data.phone || null,
            data.email || null,
            data.website || null,
            data.schedule || null,
            data.routes || null,
            user.id,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM transport WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Transporte creado exitosamente');
    } catch (e) {
        return error('Error creando transporte: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/transport/:id
 * Actualizar transporte
 */
export async function handleAdminUpdateTransport(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Verificar que existe
        const existing = await env.DB.prepare(
            'SELECT * FROM transport WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Transporte no encontrado');
        }

        const data = await request.json();

        await env.DB.prepare(`
            UPDATE transport SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                image_url = ?,
                zone_id = ?,
                address = ?,
                phone = ?,
                email = ?,
                website = ?,
                schedule = ?,
                routes = ?,
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
            data.phone !== undefined ? data.phone : existing.phone,
            data.email !== undefined ? data.email : existing.email,
            data.website !== undefined ? data.website : existing.website,
            data.schedule !== undefined ? data.schedule : existing.schedule,
            data.routes !== undefined ? data.routes : existing.routes,
            data.status,
            data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM transport WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Transporte actualizado exitosamente');
    } catch (e) {
        return error('Error actualizando transporte: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/transport/:id
 * Eliminar transporte
 */
export async function handleAdminDeleteTransport(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM transport WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Transporte no encontrado');
        }

        await env.DB.prepare('DELETE FROM transport WHERE id = ?').bind(id).run();

        return success(null, 'Transporte eliminado exitosamente');
    } catch (e) {
        return error('Error eliminando transporte: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/transport/:id/status
 * Cambiar estado de transporte (aprobar/rechazar)
 */
export async function handleAdminUpdateTransportStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
            return error('Estado inválido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM transport WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Transporte no encontrado');
        }

        await env.DB.prepare(`
            UPDATE transport SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(data.status, id).run();

        const statusLabels = {
            pending: 'pendiente',
            approved: 'aprobado',
            rejected: 'rechazado'
        };

        return success(null, `Transporte ${statusLabels[data.status]}`);
    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/transport/:id/featured
 * Toggle destacado
 */
export async function handleAdminToggleTransportFeatured(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, featured FROM transport WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Transporte no encontrado');
        }

        const newFeatured = existing.featured ? 0 : 1;

        await env.DB.prepare(`
            UPDATE transport SET featured = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newFeatured, id).run();

        return success(
            { featured: newFeatured },
            newFeatured ? 'Transporte destacado' : 'Transporte quitado de destacados'
        );
    } catch (e) {
        return error('Error actualizando destacado: ' + e.message, 500);
    }
}
