// Bus Routes - Colectivos y paradas de transporte público
// CRUD completo para líneas de colectivos y paradas

import { success, error, notFound } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// =============================================
// PUBLIC ROUTES - BUS LINES
// =============================================

/**
 * GET /api/bus-lines
 * Lista pública de líneas de colectivos activas
 */
export async function handleGetBusLines(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
        const offset = (page - 1) * limit;
        const zoneId = url.searchParams.get('zone_id');
        const zone = url.searchParams.get('zone');
        const search = url.searchParams.get('search');
        const featured = url.searchParams.get('featured');

        // Base WHERE conditions
        let whereClause = 'WHERE bl.status = \'approved\' AND bl.is_active = 1';
        const params = [];

        if (zoneId) {
            whereClause += ' AND bl.zone_id = ?';
            params.push(zoneId);
        }

        if (zone) {
            whereClause += ' AND z.slug = ?';
            params.push(zone);
        }

        if (search) {
            whereClause += ' AND (bl.name LIKE ? OR bl.line_number LIKE ? OR bl.company LIKE ? OR bl.route_description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (featured === '1' || featured === 'true') {
            whereClause += ' AND bl.featured = 1';
        }

        // Count total
        const countQuery = `SELECT COUNT(*) as total FROM bus_lines bl LEFT JOIN zones z ON bl.zone_id = z.id ${whereClause}`;
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Get results with stops count
        const query = `
            SELECT bl.*, z.name as zone_name
            FROM bus_lines bl
            LEFT JOIN zones z ON bl.zone_id = z.id
            ${whereClause}
            ORDER BY bl.featured DESC, bl.line_number ASC LIMIT ? OFFSET ?
        `;
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
        return error('Error obteniendo líneas de colectivos: ' + e.message, 500);
    }
}

/**
 * GET /api/bus-lines/:id
 * Detalle de una línea con sus paradas
 */
export async function handleGetBusLineById(request, env, id) {
    try {
        const result = await env.DB.prepare(`
            SELECT
                bl.*,
                z.name as zone_name
            FROM bus_lines bl
            LEFT JOIN zones z ON bl.zone_id = z.id
            WHERE bl.id = ? AND bl.status = 'approved' AND bl.is_active = 1
        `).bind(id).first();

        if (!result) {
            return notFound('Línea de colectivo no encontrada');
        }

        // Get stops for this line
        const stops = await env.DB.prepare(`
            SELECT * FROM bus_stops
            WHERE bus_line_id = ? AND is_active = 1
            ORDER BY stop_order ASC
        `).bind(id).all();

        result.stops = stops.results || [];

        return success(result);
    } catch (e) {
        return error('Error obteniendo línea de colectivo: ' + e.message, 500);
    }
}

/**
 * GET /api/bus-stops
 * Lista pública de paradas (para mostrar en mapa)
 */
export async function handleGetBusStops(request, env) {
    try {
        const url = new URL(request.url);
        const busLineId = url.searchParams.get('bus_line_id');
        const withCoords = url.searchParams.get('with_coords');

        let query = `
            SELECT
                bs.*,
                bl.line_number,
                bl.name as line_name,
                bl.color as line_color
            FROM bus_stops bs
            INNER JOIN bus_lines bl ON bs.bus_line_id = bl.id
            WHERE bs.is_active = 1 AND bl.status = 'approved' AND bl.is_active = 1
        `;
        const params = [];

        if (busLineId) {
            query += ' AND bs.bus_line_id = ?';
            params.push(busLineId);
        }

        if (withCoords === '1' || withCoords === 'true') {
            query += ' AND bs.latitude IS NOT NULL AND bs.longitude IS NOT NULL';
        }

        query += ' ORDER BY bl.line_number ASC, bs.stop_order ASC';

        const results = await env.DB.prepare(query).bind(...params).all();

        return success({
            items: results.results || []
        });
    } catch (e) {
        return error('Error obteniendo paradas: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES - BUS LINES
// =============================================

/**
 * GET /api/admin/bus-lines
 * Lista de todas las líneas (admin)
 */
export async function handleAdminGetBusLines(request, env) {
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

        // Base WHERE conditions
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (status) {
            whereClause += ' AND bl.status = ?';
            params.push(status);
        }

        if (zoneId) {
            whereClause += ' AND bl.zone_id = ?';
            params.push(zoneId);
        }

        if (search) {
            whereClause += ' AND (bl.name LIKE ? OR bl.line_number LIKE ? OR bl.company LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        // Count
        const countQuery = `SELECT COUNT(*) as total FROM bus_lines bl LEFT JOIN zones z ON bl.zone_id = z.id ${whereClause}`;
        const countResult = await env.DB.prepare(countQuery).bind(...params).first();
        const total = countResult?.total || 0;

        // Results
        const query = `
            SELECT bl.*, z.name as zone_name
            FROM bus_lines bl
            LEFT JOIN zones z ON bl.zone_id = z.id
            ${whereClause}
            ORDER BY bl.created_at DESC LIMIT ? OFFSET ?
        `;
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
        return error('Error obteniendo líneas de colectivos: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/bus-lines
 * Crear nueva línea de colectivo
 */
export async function handleAdminCreateBusLine(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validaciones
        if (!data.line_number || !data.line_number.trim()) {
            return error('El número de línea es requerido');
        }
        if (!data.name || !data.name.trim()) {
            return error('El nombre es requerido');
        }

        const result = await env.DB.prepare(`
            INSERT INTO bus_lines (
                line_number, name, company, description, route_description,
                color, schedule, price, zone_id,
                author_id, status, featured, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `).bind(
            data.line_number.trim(),
            data.name.trim(),
            data.company || null,
            data.description || null,
            data.route_description || null,
            data.color || '#a855f7',
            data.schedule || null,
            data.price || null,
            data.zone_id || null,
            user.id,
            data.status || 'pending',
            data.featured ? 1 : 0
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM bus_lines WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Línea de colectivo creada exitosamente');
    } catch (e) {
        return error('Error creando línea de colectivo: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/bus-lines/:id
 * Actualizar línea de colectivo
 */
export async function handleAdminUpdateBusLine(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT * FROM bus_lines WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Línea de colectivo no encontrada');
        }

        const data = await request.json();

        await env.DB.prepare(`
            UPDATE bus_lines SET
                line_number = COALESCE(?, line_number),
                name = COALESCE(?, name),
                company = ?,
                description = ?,
                route_description = ?,
                color = ?,
                schedule = ?,
                price = ?,
                zone_id = ?,
                status = COALESCE(?, status),
                featured = ?,
                is_active = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            data.line_number?.trim() || null,
            data.name?.trim() || null,
            data.company !== undefined ? data.company : existing.company,
            data.description !== undefined ? data.description : existing.description,
            data.route_description !== undefined ? data.route_description : existing.route_description,
            data.color !== undefined ? data.color : existing.color,
            data.schedule !== undefined ? data.schedule : existing.schedule,
            data.price !== undefined ? data.price : existing.price,
            data.zone_id !== undefined ? data.zone_id : existing.zone_id,
            data.status,
            data.featured !== undefined ? (data.featured ? 1 : 0) : existing.featured,
            data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM bus_lines WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Línea de colectivo actualizada exitosamente');
    } catch (e) {
        return error('Error actualizando línea de colectivo: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/bus-lines/:id
 * Eliminar línea de colectivo (y sus paradas)
 */
export async function handleAdminDeleteBusLine(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM bus_lines WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Línea de colectivo no encontrada');
        }

        // Delete stops first
        await env.DB.prepare('DELETE FROM bus_stops WHERE bus_line_id = ?').bind(id).run();
        // Delete line
        await env.DB.prepare('DELETE FROM bus_lines WHERE id = ?').bind(id).run();

        return success(null, 'Línea de colectivo eliminada exitosamente');
    } catch (e) {
        return error('Error eliminando línea de colectivo: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/bus-lines/:id/status
 * Cambiar estado de línea
 */
export async function handleAdminUpdateBusLineStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.status || !['pending', 'approved', 'rejected'].includes(data.status)) {
            return error('Estado inválido');
        }

        const existing = await env.DB.prepare(
            'SELECT id FROM bus_lines WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Línea de colectivo no encontrada');
        }

        await env.DB.prepare(`
            UPDATE bus_lines SET status = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(data.status, id).run();

        const statusLabels = {
            pending: 'pendiente',
            approved: 'aprobada',
            rejected: 'rechazada'
        };

        return success(null, `Línea ${statusLabels[data.status]}`);
    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

/**
 * PATCH /api/admin/bus-lines/:id/featured
 * Toggle destacado
 */
export async function handleAdminToggleBusLineFeatured(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id, featured FROM bus_lines WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Línea de colectivo no encontrada');
        }

        const newFeatured = existing.featured ? 0 : 1;

        await env.DB.prepare(`
            UPDATE bus_lines SET featured = ?, updated_at = datetime('now') WHERE id = ?
        `).bind(newFeatured, id).run();

        return success(
            { featured: newFeatured },
            newFeatured ? 'Línea destacada' : 'Línea quitada de destacados'
        );
    } catch (e) {
        return error('Error actualizando destacado: ' + e.message, 500);
    }
}

// =============================================
// ADMIN ROUTES - BUS STOPS
// =============================================

/**
 * GET /api/admin/bus-stops
 * Lista de todas las paradas (admin)
 */
export async function handleAdminGetBusStops(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const busLineId = url.searchParams.get('bus_line_id');
        const search = url.searchParams.get('search');

        let query = `
            SELECT
                bs.*,
                bl.line_number,
                bl.name as line_name
            FROM bus_stops bs
            INNER JOIN bus_lines bl ON bs.bus_line_id = bl.id
            WHERE 1=1
        `;
        const params = [];

        if (busLineId) {
            query += ' AND bs.bus_line_id = ?';
            params.push(busLineId);
        }

        if (search) {
            query += ' AND (bs.name LIKE ? OR bs.address LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ' ORDER BY bl.line_number ASC, bs.stop_order ASC';

        const results = await env.DB.prepare(query).bind(...params).all();

        return success({
            items: results.results || []
        });
    } catch (e) {
        return error('Error obteniendo paradas: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/bus-stops
 * Crear nueva parada
 */
export async function handleAdminCreateBusStop(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        // Validaciones
        if (!data.bus_line_id) {
            return error('La línea de colectivo es requerida');
        }
        if (!data.name || !data.name.trim()) {
            return error('El nombre de la parada es requerido');
        }

        // Verify bus line exists
        const busLine = await env.DB.prepare(
            'SELECT id FROM bus_lines WHERE id = ?'
        ).bind(data.bus_line_id).first();

        if (!busLine) {
            return notFound('Línea de colectivo no encontrada');
        }

        // Get max stop_order for this line
        const maxOrder = await env.DB.prepare(
            'SELECT MAX(stop_order) as max_order FROM bus_stops WHERE bus_line_id = ?'
        ).bind(data.bus_line_id).first();
        const nextOrder = data.stop_order || ((maxOrder?.max_order || 0) + 1);

        const result = await env.DB.prepare(`
            INSERT INTO bus_stops (
                bus_line_id, name, address, latitude, longitude,
                stop_order, arrival_times, stop_type, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
        `).bind(
            data.bus_line_id,
            data.name.trim(),
            data.address || null,
            data.latitude || null,
            data.longitude || null,
            nextOrder,
            data.arrival_times || null,
            data.stop_type || 'normal'
        ).run();

        const newItem = await env.DB.prepare(
            'SELECT * FROM bus_stops WHERE id = ?'
        ).bind(result.meta.last_row_id).first();

        return success(newItem, 'Parada creada exitosamente');
    } catch (e) {
        return error('Error creando parada: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/bus-stops/:id
 * Actualizar parada
 */
export async function handleAdminUpdateBusStop(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT * FROM bus_stops WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Parada no encontrada');
        }

        const data = await request.json();

        await env.DB.prepare(`
            UPDATE bus_stops SET
                bus_line_id = ?,
                name = COALESCE(?, name),
                address = ?,
                latitude = ?,
                longitude = ?,
                stop_order = ?,
                arrival_times = ?,
                stop_type = ?,
                is_active = ?,
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            data.bus_line_id !== undefined ? data.bus_line_id : existing.bus_line_id,
            data.name?.trim() || null,
            data.address !== undefined ? data.address : existing.address,
            data.latitude !== undefined ? data.latitude : existing.latitude,
            data.longitude !== undefined ? data.longitude : existing.longitude,
            data.stop_order !== undefined ? data.stop_order : existing.stop_order,
            data.arrival_times !== undefined ? data.arrival_times : existing.arrival_times,
            data.stop_type !== undefined ? data.stop_type : (existing.stop_type || 'normal'),
            data.is_active !== undefined ? (data.is_active ? 1 : 0) : existing.is_active,
            id
        ).run();

        const updated = await env.DB.prepare(
            'SELECT * FROM bus_stops WHERE id = ?'
        ).bind(id).first();

        return success(updated, 'Parada actualizada exitosamente');
    } catch (e) {
        return error('Error actualizando parada: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/bus-stops/:id
 * Eliminar parada
 */
export async function handleAdminDeleteBusStop(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const existing = await env.DB.prepare(
            'SELECT id FROM bus_stops WHERE id = ?'
        ).bind(id).first();

        if (!existing) {
            return notFound('Parada no encontrada');
        }

        await env.DB.prepare('DELETE FROM bus_stops WHERE id = ?').bind(id).run();

        return success(null, 'Parada eliminada exitosamente');
    } catch (e) {
        return error('Error eliminando parada: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/bus-stops/reorder
 * Reordenar paradas de una línea
 */
export async function handleAdminReorderBusStops(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();

        if (!data.stops || !Array.isArray(data.stops)) {
            return error('Lista de paradas inválida');
        }

        // Update each stop's order
        for (let i = 0; i < data.stops.length; i++) {
            await env.DB.prepare(
                'UPDATE bus_stops SET stop_order = ?, updated_at = datetime(\'now\') WHERE id = ?'
            ).bind(i + 1, data.stops[i]).run();
        }

        return success(null, 'Paradas reordenadas exitosamente');
    } catch (e) {
        return error('Error reordenando paradas: ' + e.message, 500);
    }
}
