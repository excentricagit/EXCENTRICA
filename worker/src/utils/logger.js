// =============================================
// ACTIVITY LOGGER - Sistema de auditoria
// =============================================
// Registra acciones de usuarios para control y trazabilidad

/**
 * Registra una actividad en el log
 * @param {Object} env - Environment con DB
 * @param {Object} user - Usuario que realiza la accion {id, name, role}
 * @param {string} action - Tipo de accion (create, update, delete, approve, reject, activate, deactivate)
 * @param {string} entityType - Tipo de entidad (ad, event, registration, user, news, product)
 * @param {number|null} entityId - ID de la entidad
 * @param {string|null} entityName - Nombre/titulo de la entidad para referencia
 * @param {Object} details - Detalles adicionales (objeto que se guarda como JSON)
 * @param {Request} request - Request para obtener IP y User-Agent (opcional)
 */
export async function logActivity(env, user, action, entityType, entityId = null, entityName = null, details = {}, request = null) {
    try {
        // Obtener IP y User-Agent si hay request
        let ipAddress = null;
        let userAgent = null;

        if (request) {
            ipAddress = request.headers.get('CF-Connecting-IP') ||
                        request.headers.get('X-Forwarded-For') ||
                        request.headers.get('X-Real-IP') ||
                        null;
            userAgent = request.headers.get('User-Agent') || null;
        }

        await env.DB.prepare(`
            INSERT INTO activity_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, details, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            user.id,
            user.name || 'Unknown',
            user.role || 'user',
            action,
            entityType,
            entityId,
            entityName,
            JSON.stringify(details),
            ipAddress,
            userAgent
        ).run();

    } catch (e) {
        // No lanzar error si falla el log, solo registrar en consola
        console.error('Error logging activity:', e.message);
    }
}

// Constantes de acciones para consistencia
export const ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    APPROVE: 'approve',
    REJECT: 'reject',
    ACTIVATE: 'activate',
    DEACTIVATE: 'deactivate',
    LOGIN: 'login',
    LOGOUT: 'logout',
    VERIFY: 'verify'
};

// Constantes de tipos de entidad
export const ENTITY_TYPES = {
    AD: 'ad',
    EVENT: 'event',
    REGISTRATION: 'registration',
    USER: 'user',
    NEWS: 'news',
    PRODUCT: 'product'
};
