// Rutas de usuarios (admin)

import { hashPassword } from '../utils/hash.js';
import { success, error, notFound } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

export async function handleGetUsers(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const search = url.searchParams.get('search') || '';
        const role = url.searchParams.get('role') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT id, username, email, name, phone, role, is_active,
                   created_at, last_login, avatar_url
            FROM users WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR username LIKE ?)';
            countQuery += ' AND (name LIKE ? OR email LIKE ? OR username LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        if (role) {
            query += ' AND role = ?';
            countQuery += ' AND role = ?';
            params.push(role);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const [users, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            users: users.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo usuarios: ' + e.message, 500);
    }
}

export async function handleGetUser(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const user = await env.DB.prepare(`
            SELECT id, username, email, name, phone, bio, role, is_active,
                   zone_id, avatar_url, created_at, updated_at, last_login
            FROM users WHERE id = ?
        `).bind(id).first();

        if (!user) {
            return notFound('Usuario no encontrado');
        }

        return success(user);

    } catch (e) {
        return error('Error obteniendo usuario: ' + e.message, 500);
    }
}

export async function handleCreateUser(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const { username, email, password, name, phone, role, is_active } = await request.json();

        if (!username || !email || !password || !name) {
            return error('Campos requeridos: username, email, password, name');
        }

        // Verificar si ya existe
        const existing = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ? OR username = ?'
        ).bind(email.toLowerCase(), username.toLowerCase()).first();

        if (existing) {
            return error('El email o nombre de usuario ya existe');
        }

        const passwordHash = await hashPassword(password);

        const result = await env.DB.prepare(`
            INSERT INTO users (username, email, password_hash, name, phone, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(
            username.toLowerCase(),
            email.toLowerCase(),
            passwordHash,
            name,
            phone || null,
            role || 'user',
            is_active !== undefined ? (is_active ? 1 : 0) : 1
        ).run();

        return success({ id: result.meta.last_row_id }, 'Usuario creado');

    } catch (e) {
        return error('Error creando usuario: ' + e.message, 500);
    }
}

export async function handleUpdateUser(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { name, phone, role, is_active, email, username } = data;

        // Verificar que existe
        const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(id).first();
        if (!existing) {
            return notFound('Usuario no encontrado');
        }

        await env.DB.prepare(`
            UPDATE users SET
                name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                role = COALESCE(?, role),
                is_active = COALESCE(?, is_active),
                email = COALESCE(?, email),
                username = COALESCE(?, username),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            name || null,
            phone || null,
            role || null,
            is_active !== undefined ? (is_active ? 1 : 0) : null,
            email || null,
            username || null,
            id
        ).run();

        return success(null, 'Usuario actualizado');

    } catch (e) {
        return error('Error actualizando usuario: ' + e.message, 500);
    }
}

export async function handleDeleteUser(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        // No permitir eliminar el admin principal
        if (parseInt(id) === 1) {
            return error('No se puede eliminar el administrador principal');
        }

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

        return success(null, 'Usuario eliminado');

    } catch (e) {
        return error('Error eliminando usuario: ' + e.message, 500);
    }
}

export async function handleToggleUserStatus(request, env, id) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const user = await env.DB.prepare('SELECT is_active FROM users WHERE id = ?').bind(id).first();
        if (!user) {
            return notFound('Usuario no encontrado');
        }

        const newStatus = user.is_active ? 0 : 1;
        await env.DB.prepare(
            "UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(newStatus, id).run();

        return success({ is_active: newStatus }, 'Estado actualizado');

    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}
