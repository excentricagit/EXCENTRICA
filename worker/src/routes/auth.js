// Rutas de autenticación

import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signJWT } from '../utils/jwt.js';
import { success, error, unauthorized } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

export async function handleLogin(request, env) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return error('Email y contraseña son requeridos');
        }

        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE email = ? AND is_active = 1'
        ).bind(email.toLowerCase()).first();

        if (!user) {
            return unauthorized('Credenciales inválidas');
        }

        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return unauthorized('Credenciales inválidas');
        }

        // Actualizar último login
        await env.DB.prepare(
            "UPDATE users SET last_login = datetime('now') WHERE id = ?"
        ).bind(user.id).run();

        // Generar token
        const token = await signJWT({ userId: user.id, role: user.role }, '7d');

        return success({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar_url: user.avatar_url
            }
        }, 'Login exitoso');

    } catch (e) {
        return error('Error en el login: ' + e.message, 500);
    }
}

export async function handleRegister(request, env) {
    try {
        const { username, email, password, name, phone } = await request.json();

        if (!username || !email || !password || !name) {
            return error('Todos los campos son requeridos');
        }

        // Verificar si ya existe
        const existing = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ? OR username = ?'
        ).bind(email.toLowerCase(), username.toLowerCase()).first();

        if (existing) {
            return error('El email o nombre de usuario ya está registrado');
        }

        // Hashear password
        const passwordHash = await hashPassword(password);

        // Insertar usuario
        const result = await env.DB.prepare(`
            INSERT INTO users (username, email, password_hash, name, phone, role)
            VALUES (?, ?, ?, ?, ?, 'user')
        `).bind(
            username.toLowerCase(),
            email.toLowerCase(),
            passwordHash,
            name,
            phone || null
        ).run();

        const userId = result.meta.last_row_id;

        // Generar token
        const token = await signJWT({ userId, role: 'user' }, '7d');

        return success({
            token,
            user: {
                id: userId,
                username: username.toLowerCase(),
                email: email.toLowerCase(),
                name,
                role: 'user'
            }
        }, 'Registro exitoso');

    } catch (e) {
        return error('Error en el registro: ' + e.message, 500);
    }
}

export async function handleGetMe(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    return success({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url
    });
}

export async function handleUpdateProfile(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const { name, phone, bio, avatar_url } = await request.json();

        await env.DB.prepare(`
            UPDATE users SET
                name = COALESCE(?, name),
                phone = COALESCE(?, phone),
                bio = COALESCE(?, bio),
                avatar_url = COALESCE(?, avatar_url),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(name, phone, bio, avatar_url, user.id).run();

        return success(null, 'Perfil actualizado');

    } catch (e) {
        return error('Error actualizando perfil: ' + e.message, 500);
    }
}

export async function handleChangePassword(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return error('Contraseñas requeridas');
        }

        // Obtener hash actual
        const userData = await env.DB.prepare(
            'SELECT password_hash FROM users WHERE id = ?'
        ).bind(user.id).first();

        const isValid = await verifyPassword(currentPassword, userData.password_hash);
        if (!isValid) {
            return error('Contraseña actual incorrecta');
        }

        const newHash = await hashPassword(newPassword);
        await env.DB.prepare(
            "UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(newHash, user.id).run();

        return success(null, 'Contraseña actualizada');

    } catch (e) {
        return error('Error cambiando contraseña: ' + e.message, 500);
    }
}
