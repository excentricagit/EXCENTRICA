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
        const result = await env.DB.prepare(
            'SELECT * FROM zones WHERE is_active = 1 ORDER BY name ASC'
        ).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo zonas: ' + e.message, 500);
    }
}

export async function handleGetZoneById(request, env, id) {
    try {
        const zone = await env.DB.prepare(
            'SELECT * FROM zones WHERE id = ?'
        ).bind(id).first();

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
        const result = await env.DB.prepare(
            'SELECT * FROM zones ORDER BY name ASC'
        ).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo zonas: ' + e.message, 500);
    }
}

export async function handleAdminCreateZone(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { name, description } = await request.json();

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
            INSERT INTO zones (name, slug, description)
            VALUES (?, ?, ?)
        `).bind(name, slug, description || null).run();

        return success({ id: result.meta.last_row_id }, 'Zona creada');

    } catch (e) {
        return error('Error creando zona: ' + e.message, 500);
    }
}

export async function handleAdminUpdateZone(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { name, description, is_active } = await request.json();

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
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        `).bind(
            name || null,
            slug,
            description || null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
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
        await env.DB.prepare('DELETE FROM zones WHERE id = ?').bind(id).run();

        return success(null, 'Zona eliminada');

    } catch (e) {
        return error('Error eliminando zona: ' + e.message, 500);
    }
}
