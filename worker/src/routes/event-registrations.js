// Rutas de registros/inscripciones a eventos

import { success, error, notFound, forbidden } from '../utils/response.js';
import { requireAuth, requireEditor } from '../middleware/auth.js';

// Generar codigo de registro unico
function generateRegistrationCode(eventId, userId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `EVT-${eventId}-${timestamp}${random}`;
}

// Formatear numero de WhatsApp
function formatWhatsAppNumber(number) {
    if (!number) return null;
    const clean = number.replace(/\D/g, '');
    return clean.startsWith('549') ? clean : `549${clean}`;
}

// =============================================
// ENDPOINTS PUBLICOS (usuarios autenticados)
// =============================================

// Registrarse a un evento
export async function handleEventRegister(request, env, eventId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        // Verificar que el evento existe y esta aprobado
        const event = await env.DB.prepare(`
            SELECT e.*, u.name as author_name, u.phone as author_phone
            FROM events e
            LEFT JOIN users u ON e.author_id = u.id
            WHERE e.id = ? AND (e.status = 'approved' OR e.status = 'aprobado')
        `).bind(eventId).first();

        if (!event) {
            return notFound('Evento no encontrado o no disponible');
        }

        // Verificar si ya esta registrado
        const existing = await env.DB.prepare(
            'SELECT id, status FROM event_registrations WHERE user_id = ? AND event_id = ?'
        ).bind(user.id, eventId).first();

        if (existing) {
            return error(`Ya estas inscrito a este evento (Estado: ${existing.status})`, 400);
        }

        // Generar codigo de registro
        const registrationCode = generateRegistrationCode(eventId, user.id);

        // Determinar estado inicial segun si es gratis o pago
        const isFree = !event.price || event.price === 0;
        const initialStatus = isFree ? 'confirmado' : 'pendiente';

        // Crear registro
        const result = await env.DB.prepare(`
            INSERT INTO event_registrations (user_id, event_id, registration_code, status)
            VALUES (?, ?, ?, ?)
        `).bind(user.id, eventId, registrationCode, initialStatus).run();

        // Preparar datos para WhatsApp si es pago
        let whatsappData = null;
        if (!isFree) {
            const whatsappNumber = formatWhatsAppNumber(event.whatsapp || event.phone);
            if (whatsappNumber) {
                const message = `Hola! Soy ${user.name} y me quiero inscribir al evento "${event.title}".

Precio: $${event.price}
Codigo de registro: ${registrationCode}

Por favor, indicame los datos para realizar el pago. Una vez abonado, enviare el comprobante para confirmar mi inscripcion.`;

                whatsappData = {
                    number: whatsappNumber,
                    message: encodeURIComponent(message),
                    url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
                };
            }
        }

        return success({
            registration_id: result.meta.last_row_id,
            registration_code: registrationCode,
            status: initialStatus,
            is_free: isFree,
            whatsapp: whatsappData
        }, isFree
            ? 'Inscripcion confirmada! Tu codigo de entrada es: ' + registrationCode
            : 'Inscripcion registrada. Contacta al organizador para confirmar el pago.'
        );

    } catch (e) {
        if (e.message.includes('UNIQUE constraint failed')) {
            return error('Ya estas inscrito a este evento', 400);
        }
        return error('Error registrando inscripcion: ' + e.message, 500);
    }
}

// Cancelar inscripcion
export async function handleEventUnregister(request, env, eventId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const registration = await env.DB.prepare(
            'SELECT id, status FROM event_registrations WHERE user_id = ? AND event_id = ?'
        ).bind(user.id, eventId).first();

        if (!registration) {
            return notFound('No estas inscrito a este evento');
        }

        // No permitir cancelar si ya fue confirmado (para eventos pagos ya abonados)
        // Opcional: podriamos permitirlo con una politica de cancelacion

        await env.DB.prepare(
            'DELETE FROM event_registrations WHERE user_id = ? AND event_id = ?'
        ).bind(user.id, eventId).run();

        return success(null, 'Inscripcion cancelada');

    } catch (e) {
        return error('Error cancelando inscripcion: ' + e.message, 500);
    }
}

// Obtener mis eventos registrados
export async function handleGetMyEventRegistrations(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const status = url.searchParams.get('status') || '';
        const upcoming = url.searchParams.get('upcoming') === '1';

        let query = `
            SELECT
                er.id as registration_id,
                er.registration_code,
                er.status as registration_status,
                er.registered_at,
                er.approved_at,
                er.notes,
                e.id as event_id,
                e.title,
                e.description,
                e.image_url,
                e.event_date,
                e.event_time,
                e.end_date,
                e.end_time,
                e.location,
                e.address,
                e.price,
                c.name as category_name,
                z.name as zone_name
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            LEFT JOIN categories c ON e.category_id = c.id
            LEFT JOIN zones z ON e.zone_id = z.id
            WHERE er.user_id = ?
        `;
        const params = [user.id];

        if (status) {
            query += ' AND er.status = ?';
            params.push(status);
        }

        if (upcoming) {
            query += " AND e.event_date >= date('now')";
        }

        query += ' ORDER BY e.event_date ASC, e.event_time ASC';

        const registrations = await env.DB.prepare(query).bind(...params).all();

        return success({
            registrations: registrations.results,
            total: registrations.results.length
        });

    } catch (e) {
        return error('Error obteniendo inscripciones: ' + e.message, 500);
    }
}

// Verificar si estoy registrado a un evento
export async function handleCheckEventRegistration(request, env, eventId) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const registration = await env.DB.prepare(
            'SELECT id, registration_code, status, registered_at FROM event_registrations WHERE user_id = ? AND event_id = ?'
        ).bind(user.id, eventId).first();

        return success({
            is_registered: !!registration,
            registration: registration || null
        });

    } catch (e) {
        return error('Error verificando inscripcion: ' + e.message, 500);
    }
}

// =============================================
// ENDPOINTS ADMIN/EDITOR
// =============================================

// Obtener registros de eventos (para el publicista/editor)
export async function handleAdminGetEventRegistrations(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const eventId = url.searchParams.get('event_id') || '';
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT
                er.*,
                e.title as event_title,
                e.event_date,
                e.event_time,
                e.price as event_price,
                e.author_id as event_author_id,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone,
                approver.name as approved_by_name
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            JOIN users u ON er.user_id = u.id
            LEFT JOIN users approver ON er.approved_by = approver.id
            WHERE 1=1
        `;

        let countQuery = 'SELECT COUNT(*) as total FROM event_registrations er JOIN events e ON er.event_id = e.id JOIN users u ON er.user_id = u.id WHERE 1=1';
        const params = [];

        // Si no es admin, solo mostrar registros de sus propios eventos
        if (user.role !== 'admin') {
            query += ' AND e.author_id = ?';
            countQuery += ' AND e.author_id = ?';
            params.push(user.id);
        }

        if (status) {
            query += ' AND er.status = ?';
            countQuery += ' AND er.status = ?';
            params.push(status);
        }

        if (eventId) {
            query += ' AND er.event_id = ?';
            countQuery += ' AND er.event_id = ?';
            params.push(eventId);
        }

        if (search) {
            query += ' AND (u.name LIKE ? OR u.email LIKE ? OR er.registration_code LIKE ?)';
            countQuery += ' AND (u.name LIKE ? OR u.email LIKE ? OR er.registration_code LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY er.registered_at DESC LIMIT ? OFFSET ?';

        const [registrations, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            registrations: registrations.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo registros: ' + e.message, 500);
    }
}

// Aprobar/rechazar inscripcion
export async function handleAdminUpdateRegistrationStatus(request, env, registrationId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { status, notes } = await request.json();

        if (!['pendiente', 'confirmado', 'rechazado', 'cancelado'].includes(status)) {
            return error('Estado invalido. Usar: pendiente, confirmado, rechazado, cancelado');
        }

        // Verificar que el registro existe
        const registration = await env.DB.prepare(`
            SELECT er.*, e.author_id as event_author_id
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            WHERE er.id = ?
        `).bind(registrationId).first();

        if (!registration) {
            return notFound('Registro no encontrado');
        }

        // Solo el autor del evento o admin puede aprobar
        if (user.role !== 'admin' && registration.event_author_id !== user.id) {
            return forbidden('No tienes permiso para modificar este registro');
        }

        // Actualizar estado
        const approvedAt = status === 'confirmado' ? "datetime('now')" : 'NULL';
        const approvedBy = status === 'confirmado' ? user.id : null;

        await env.DB.prepare(`
            UPDATE event_registrations
            SET status = ?,
                notes = COALESCE(?, notes),
                approved_at = ${status === 'confirmado' ? "datetime('now')" : 'approved_at'},
                approved_by = ${status === 'confirmado' ? '?' : 'approved_by'}
            WHERE id = ?
        `).bind(
            status,
            notes || null,
            ...(status === 'confirmado' ? [user.id] : []),
            registrationId
        ).run();

        return success({ status }, `Inscripcion ${status === 'confirmado' ? 'aprobada' : 'actualizada'}`);

    } catch (e) {
        return error('Error actualizando registro: ' + e.message, 500);
    }
}

// Obtener estadisticas de registros de un evento
export async function handleAdminGetEventRegistrationStats(request, env, eventId) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Verificar que el evento existe y el usuario tiene permiso
        const event = await env.DB.prepare('SELECT * FROM events WHERE id = ?').bind(eventId).first();

        if (!event) {
            return notFound('Evento no encontrado');
        }

        if (user.role !== 'admin' && event.author_id !== user.id) {
            return forbidden('No tienes permiso para ver estas estadisticas');
        }

        const stats = await env.DB.prepare(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN status = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                SUM(CASE WHEN status = 'rechazado' THEN 1 ELSE 0 END) as rechazados,
                SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as cancelados
            FROM event_registrations
            WHERE event_id = ?
        `).bind(eventId).first();

        return success({
            event_id: eventId,
            event_title: event.title,
            stats
        });

    } catch (e) {
        return error('Error obteniendo estadisticas: ' + e.message, 500);
    }
}

// Verificar codigo de registro (para entrada al evento)
export async function handleVerifyRegistrationCode(request, env, code) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const registration = await env.DB.prepare(`
            SELECT
                er.*,
                e.id as event_id,
                e.title as event_title,
                e.event_date,
                e.event_time,
                e.author_id as event_author_id,
                u.name as user_name,
                u.email as user_email,
                u.phone as user_phone
            FROM event_registrations er
            JOIN events e ON er.event_id = e.id
            JOIN users u ON er.user_id = u.id
            WHERE er.registration_code = ?
        `).bind(code).first();

        if (!registration) {
            return success({
                valid: false,
                message: 'Codigo de registro no encontrado'
            });
        }

        // Solo el autor del evento o admin puede verificar
        if (user.role !== 'admin' && registration.event_author_id !== user.id) {
            return forbidden('No tienes permiso para verificar este codigo');
        }

        return success({
            valid: true,
            status: registration.status,
            can_enter: registration.status === 'confirmado',
            registration: {
                code: registration.registration_code,
                status: registration.status,
                user_name: registration.user_name,
                user_email: registration.user_email,
                user_phone: registration.user_phone,
                event_title: registration.event_title,
                event_date: registration.event_date,
                event_time: registration.event_time,
                registered_at: registration.registered_at,
                approved_at: registration.approved_at
            }
        });

    } catch (e) {
        return error('Error verificando codigo: ' + e.message, 500);
    }
}
