// Rutas de Activity Logs (solo admin)

import { success, error } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

// Obtener logs de actividad (paginado con filtros)
export async function handleGetLogs(request, env) {
    const { user, error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 50;
        const userId = url.searchParams.get('user_id') || '';
        const userRole = url.searchParams.get('user_role') || '';
        const action = url.searchParams.get('action') || '';
        const entityType = url.searchParams.get('entity_type') || '';
        const dateFrom = url.searchParams.get('date_from') || '';
        const dateTo = url.searchParams.get('date_to') || '';
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM activity_logs WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
        const params = [];

        if (userId) {
            query += ' AND user_id = ?';
            countQuery += ' AND user_id = ?';
            params.push(userId);
        }

        if (userRole) {
            query += ' AND user_role = ?';
            countQuery += ' AND user_role = ?';
            params.push(userRole);
        }

        if (action) {
            query += ' AND action = ?';
            countQuery += ' AND action = ?';
            params.push(action);
        }

        if (entityType) {
            query += ' AND entity_type = ?';
            countQuery += ' AND entity_type = ?';
            params.push(entityType);
        }

        if (dateFrom) {
            query += ' AND DATE(created_at) >= ?';
            countQuery += ' AND DATE(created_at) >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            query += ' AND DATE(created_at) <= ?';
            countQuery += ' AND DATE(created_at) <= ?';
            params.push(dateTo);
        }

        if (search) {
            query += ' AND (user_name LIKE ? OR entity_name LIKE ? OR details LIKE ?)';
            countQuery += ' AND (user_name LIKE ? OR entity_name LIKE ? OR details LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const [logs, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            logs: logs.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo logs: ' + e.message, 500);
    }
}

// Obtener resumen de actividad (para dashboard)
export async function handleGetLogsSummary(request, env) {
    const { user, error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        // Actividad de las ultimas 24 horas
        const [byAction, byUser, byEntityType, recentCount] = await Promise.all([
            // Por tipo de accion
            env.DB.prepare(`
                SELECT action, COUNT(*) as count
                FROM activity_logs
                WHERE created_at >= datetime('now', '-24 hours')
                GROUP BY action
                ORDER BY count DESC
            `).all(),

            // Por usuario (top 10)
            env.DB.prepare(`
                SELECT user_id, user_name, user_role, COUNT(*) as count
                FROM activity_logs
                WHERE created_at >= datetime('now', '-24 hours')
                GROUP BY user_id
                ORDER BY count DESC
                LIMIT 10
            `).all(),

            // Por tipo de entidad
            env.DB.prepare(`
                SELECT entity_type, COUNT(*) as count
                FROM activity_logs
                WHERE created_at >= datetime('now', '-24 hours')
                GROUP BY entity_type
                ORDER BY count DESC
            `).all(),

            // Total ultimas 24h
            env.DB.prepare(`
                SELECT COUNT(*) as total
                FROM activity_logs
                WHERE created_at >= datetime('now', '-24 hours')
            `).first()
        ]);

        return success({
            last_24h: {
                total: recentCount.total,
                by_action: byAction.results,
                by_user: byUser.results,
                by_entity_type: byEntityType.results
            }
        });

    } catch (e) {
        return error('Error obteniendo resumen: ' + e.message, 500);
    }
}

// Obtener lista de usuarios activos (para filtro)
export async function handleGetLogsUsers(request, env) {
    const { user, error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const users = await env.DB.prepare(`
            SELECT DISTINCT user_id, user_name, user_role
            FROM activity_logs
            ORDER BY user_name
        `).all();

        return success({ users: users.results });

    } catch (e) {
        return error('Error obteniendo usuarios: ' + e.message, 500);
    }
}
