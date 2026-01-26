/**
 * Provinces Routes - Provincias
 */

import { success, error, notFound } from '../utils/response.js';

/**
 * GET /api/provinces
 * Listar provincias activas
 */
export async function getProvinces(request, env) {
    try {
        const results = await env.DB.prepare(`
            SELECT p.*,
                (SELECT COUNT(*) FROM zones z WHERE z.province_id = p.id AND z.is_active = 1) as zones_count
            FROM provinces p
            WHERE p.is_active = 1
            ORDER BY p.name ASC
        `).all();

        return success(results.results || []);
    } catch (e) {
        return error('Error obteniendo provincias: ' + e.message, 500);
    }
}

/**
 * GET /api/provinces/:id
 * Obtener provincia por ID
 */
export async function getProvinceById(request, env, params) {
    try {
        const result = await env.DB.prepare(`
            SELECT * FROM provinces WHERE id = ?
        `).bind(params.id).first();

        if (!result) return notFound('Provincia no encontrada');
        return success(result);
    } catch (e) {
        return error('Error obteniendo provincia: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/provinces
 * Crear provincia
 */
export async function createProvince(request, env) {
    try {
        const data = await request.json();

        if (!data.name) {
            return error('Nombre es requerido', 400);
        }

        const slug = data.slug || data.name.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const result = await env.DB.prepare(`
            INSERT INTO provinces (name, slug, country, is_active)
            VALUES (?, ?, ?, ?)
        `).bind(
            data.name,
            slug,
            data.country || 'Argentina',
            data.is_active !== false ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id, message: 'Provincia creada' });
    } catch (e) {
        if (e.message.includes('UNIQUE constraint')) {
            return error('Ya existe una provincia con ese nombre', 400);
        }
        return error('Error creando provincia: ' + e.message, 500);
    }
}

/**
 * PUT /api/admin/provinces/:id
 * Actualizar provincia
 */
export async function updateProvince(request, env, params) {
    try {
        const data = await request.json();

        const existing = await env.DB.prepare('SELECT id FROM provinces WHERE id = ?')
            .bind(params.id).first();
        if (!existing) return notFound('Provincia no encontrada');

        const fields = [];
        const values = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug); }
        if (data.country !== undefined) { fields.push('country = ?'); values.push(data.country); }
        if (data.is_active !== undefined) { fields.push('is_active = ?'); values.push(data.is_active ? 1 : 0); }

        if (fields.length === 0) return error('No hay campos para actualizar', 400);

        values.push(params.id);
        await env.DB.prepare(`UPDATE provinces SET ${fields.join(', ')} WHERE id = ?`)
            .bind(...values).run();

        return success({ message: 'Provincia actualizada' });
    } catch (e) {
        return error('Error actualizando provincia: ' + e.message, 500);
    }
}

/**
 * DELETE /api/admin/provinces/:id
 * Eliminar provincia
 */
export async function deleteProvince(request, env, params) {
    try {
        const existing = await env.DB.prepare('SELECT id FROM provinces WHERE id = ?')
            .bind(params.id).first();
        if (!existing) return notFound('Provincia no encontrada');

        // Check if there are zones using this province
        const zonesCount = await env.DB.prepare('SELECT COUNT(*) as count FROM zones WHERE province_id = ?')
            .bind(params.id).first();
        if (zonesCount?.count > 0) {
            return error('No se puede eliminar: hay zonas asociadas a esta provincia', 400);
        }

        await env.DB.prepare('DELETE FROM provinces WHERE id = ?')
            .bind(params.id).run();

        return success({ message: 'Provincia eliminada' });
    } catch (e) {
        return error('Error eliminando provincia: ' + e.message, 500);
    }
}
