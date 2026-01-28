// Middleware de autenticación

import { verifyJWT, getTokenFromHeader } from '../utils/jwt.js';
import { unauthorized, forbidden } from '../utils/response.js';

export async function authMiddleware(request, env) {
    const token = getTokenFromHeader(request);

    if (!token) {
        return { user: null, error: null };
    }

    const decoded = await verifyJWT(token);
    if (!decoded) {
        return { user: null, error: unauthorized('Token inválido o expirado') };
    }

    // Obtener usuario de la base de datos
    const user = await env.DB.prepare(
        'SELECT id, username, email, name, role, avatar_url, is_active FROM users WHERE id = ?'
    ).bind(decoded.userId).first();

    if (!user || !user.is_active) {
        return { user: null, error: unauthorized('Usuario no encontrado o inactivo') };
    }

    return { user, error: null };
}

export async function requireAuth(request, env) {
    const { user, error } = await authMiddleware(request, env);
    if (error) return { user: null, error };
    if (!user) return { user: null, error: unauthorized('Autenticación requerida') };
    return { user, error: null };
}

export async function requireRole(request, env, roles) {
    const { user, error } = await requireAuth(request, env);
    if (error) return { user: null, error };

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
        return { user: null, error: forbidden('No tienes permiso para esta acción') };
    }

    return { user, error: null };
}

export async function requireAdmin(request, env) {
    return requireRole(request, env, 'admin');
}

export async function requireEditor(request, env) {
    return requireRole(request, env, ['admin', 'editor', 'periodista', 'reporter']);
}

export async function requirePublicista(request, env) {
    return requireRole(request, env, ['admin', 'publicista']);
}

export async function requireVideoEditor(request, env) {
    return requireRole(request, env, ['admin', 'videoeditor']);
}
