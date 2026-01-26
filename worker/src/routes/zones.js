// Rutas de zonas geográficas

import { success, error, notFound } from '../utils/response.js';
import { requireAdmin, requireEditor } from '../middleware/auth.js';

function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function handleGetZones(request, env) {
    try {
        const url = new URL(request.url);
        const provinceId = url.searchParams.get('province_id');

        let query = `
            SELECT z.*, p.name as province_name
            FROM zones z
            LEFT JOIN provinces p ON z.province_id = p.id
            WHERE z.is_active = 1
        `;
        const params = [];

        if (provinceId) {
            query += ' AND z.province_id = ?';
            params.push(provinceId);
        }

        query += ' ORDER BY z.name ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo zonas: ' + e.message, 500);
    }
}

export async function handleGetZoneById(request, env, id) {
    try {
        const zone = await env.DB.prepare(`
            SELECT z.*, p.name as province_name
            FROM zones z
            LEFT JOIN provinces p ON z.province_id = p.id
            WHERE z.id = ?
        `).bind(id).first();

        if (!zone) {
            return notFound('Zona no encontrada');
        }

        return success(zone);

    } catch (e) {
        return error('Error obteniendo zona: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetZones(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const provinceId = url.searchParams.get('province_id');

        let query = `
            SELECT z.*, p.name as province_name
            FROM zones z
            LEFT JOIN provinces p ON z.province_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (provinceId) {
            query += ' AND z.province_id = ?';
            params.push(provinceId);
        }

        query += ' ORDER BY p.name ASC, z.name ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo zonas: ' + e.message, 500);
    }
}

export async function handleAdminCreateZone(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { name, description, province_id } = await request.json();

        if (!name) {
            return error('Nombre es requerido');
        }

        const slug = generateSlug(name);

        // Verificar duplicado
        const existing = await env.DB.prepare(
            'SELECT id FROM zones WHERE slug = ?'
        ).bind(slug).first();

        if (existing) {
            return error('Ya existe una zona con ese nombre');
        }

        const result = await env.DB.prepare(`
            INSERT INTO zones (name, slug, description, province_id)
            VALUES (?, ?, ?, ?)
        `).bind(name, slug, description || null, province_id || null).run();

        return success({ id: result.meta.last_row_id }, 'Zona creada');

    } catch (e) {
        return error('Error creando zona: ' + e.message, 500);
    }
}

export async function handleAdminUpdateZone(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { name, description, is_active, province_id } = body;

        const existing = await env.DB.prepare('SELECT * FROM zones WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Zona no encontrada');
        }

        let slug = existing.slug;
        if (name && name !== existing.name) {
            slug = generateSlug(name);
        }

        await env.DB.prepare(`
            UPDATE zones SET
                name = COALESCE(?, name),
                slug = ?,
                description = COALESCE(?, description),
                is_active = COALESCE(?, is_active),
                province_id = COALESCE(?, province_id)
            WHERE id = ?
        `).bind(
            name || null,
            slug,
            description !== undefined ? description : null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            province_id !== undefined ? province_id : null,
            id
        ).run();

        return success(null, 'Zona actualizada');

    } catch (e) {
        return error('Error actualizando zona: ' + e.message, 500);
    }
}

export async function handleAdminDeleteZone(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Check for associated content
        const poiCount = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM points_of_interest WHERE zone_id = ?'
        ).bind(id).first();

        if (poiCount?.count > 0) {
            return error(`No se puede eliminar: hay ${poiCount.count} punto(s) de interés asociado(s). Usa "Fusionar" para transferirlos a otra zona.`, 400);
        }

        // Check other potential tables (add as needed)
        // const newsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM news WHERE zone_id = ?').bind(id).first();
        // const eventsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM events WHERE zone_id = ?').bind(id).first();

        await env.DB.prepare('DELETE FROM zones WHERE id = ?').bind(id).run();

        return success(null, 'Zona eliminada');

    } catch (e) {
        return error('Error eliminando zona: ' + e.message, 500);
    }
}

/**
 * POST /api/admin/zones/:id/merge
 * Fusionar zona: transfiere todos los datos a otra zona y elimina la original
 */
export async function handleAdminMergeZone(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { target_zone_id } = await request.json();

        if (!target_zone_id) {
            return error('Zona destino es requerida', 400);
        }

        if (id == target_zone_id) {
            return error('No puedes fusionar una zona consigo misma', 400);
        }

        // Verify both zones exist
        const sourceZone = await env.DB.prepare('SELECT * FROM zones WHERE id = ?').bind(id).first();
        const targetZone = await env.DB.prepare('SELECT * FROM zones WHERE id = ?').bind(target_zone_id).first();

        if (!sourceZone) return notFound('Zona origen no encontrada');
        if (!targetZone) return notFound('Zona destino no encontrada');

        // Transfer POIs
        const poiResult = await env.DB.prepare(
            'UPDATE points_of_interest SET zone_id = ? WHERE zone_id = ?'
        ).bind(target_zone_id, id).run();

        // Add more transfers here as needed for other tables
        // await env.DB.prepare('UPDATE news SET zone_id = ? WHERE zone_id = ?').bind(target_zone_id, id).run();
        // await env.DB.prepare('UPDATE events SET zone_id = ? WHERE zone_id = ?').bind(target_zone_id, id).run();

        // Delete the source zone
        await env.DB.prepare('DELETE FROM zones WHERE id = ?').bind(id).run();

        return success({
            transferred_pois: poiResult.meta.changes,
            deleted_zone: sourceZone.name,
            target_zone: targetZone.name
        }, `Zona "${sourceZone.name}" fusionada con "${targetZone.name}"`);

    } catch (e) {
        return error('Error fusionando zona: ' + e.message, 500);
    }
}
