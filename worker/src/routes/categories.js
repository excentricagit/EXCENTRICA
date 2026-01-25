// Rutas de categorías

import { success, error, notFound } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export async function handleGetCategories(request, env) {
    try {
        const url = new URL(request.url);
        const section = url.searchParams.get('section') || '';

        let query = 'SELECT * FROM categories WHERE is_active = 1';
        const params = [];

        if (section) {
            query += ' AND section = ?';
            params.push(section);
        }

        query += ' ORDER BY name ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo categorías: ' + e.message, 500);
    }
}

export async function handleGetCategoryById(request, env, id) {
    try {
        const category = await env.DB.prepare(
            'SELECT * FROM categories WHERE id = ?'
        ).bind(id).first();

        if (!category) {
            return notFound('Categoría no encontrada');
        }

        return success(category);

    } catch (e) {
        return error('Error obteniendo categoría: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetCategories(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const section = url.searchParams.get('section') || '';

        let query = 'SELECT * FROM categories';
        const params = [];

        if (section) {
            query += ' WHERE section = ?';
            params.push(section);
        }

        query += ' ORDER BY section, name ASC';

        const result = await env.DB.prepare(query).bind(...params).all();

        return success(result.results);

    } catch (e) {
        return error('Error obteniendo categorías: ' + e.message, 500);
    }
}

export async function handleAdminCreateCategory(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const { name, section, icon } = await request.json();

        if (!name || !section) {
            return error('Nombre y sección son requeridos');
        }

        const slug = generateSlug(name);

        // Verificar duplicado
        const existing = await env.DB.prepare(
            'SELECT id FROM categories WHERE slug = ? AND section = ?'
        ).bind(slug, section).first();

        if (existing) {
            return error('Ya existe una categoría con ese nombre en esta sección');
        }

        const result = await env.DB.prepare(`
            INSERT INTO categories (name, slug, section, icon)
            VALUES (?, ?, ?, ?)
        `).bind(name, slug, section, icon || null).run();

        return success({ id: result.meta.last_row_id }, 'Categoría creada');

    } catch (e) {
        return error('Error creando categoría: ' + e.message, 500);
    }
}

export async function handleAdminUpdateCategory(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const { name, icon, is_active } = await request.json();

        const existing = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Categoría no encontrada');
        }

        let slug = existing.slug;
        if (name && name !== existing.name) {
            slug = generateSlug(name);
        }

        await env.DB.prepare(`
            UPDATE categories SET
                name = COALESCE(?, name),
                slug = ?,
                icon = COALESCE(?, icon),
                is_active = COALESCE(?, is_active)
            WHERE id = ?
        `).bind(
            name || null,
            slug,
            icon || null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            id
        ).run();

        return success(null, 'Categoría actualizada');

    } catch (e) {
        return error('Error actualizando categoría: ' + e.message, 500);
    }
}

export async function handleAdminDeleteCategory(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();

        return success(null, 'Categoría eliminada');

    } catch (e) {
        return error('Error eliminando categoría: ' + e.message, 500);
    }
}
