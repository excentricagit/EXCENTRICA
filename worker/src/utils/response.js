// Helpers para respuestas HTTP

export function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

export function success(data, message = 'OK') {
    return json({ success: true, message, data });
}

export function error(message, status = 400) {
    return json({ success: false, error: message }, status);
}

export function notFound(message = 'Recurso no encontrado') {
    return error(message, 404);
}

export function unauthorized(message = 'No autorizado') {
    return error(message, 401);
}

export function forbidden(message = 'Acceso denegado') {
    return error(message, 403);
}

export function serverError(message = 'Error interno del servidor') {
    return error(message, 500);
}
