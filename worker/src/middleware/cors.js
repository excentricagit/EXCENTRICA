// Middleware CORS

const ALLOWED_ORIGINS = [
    'https://excentrica.pages.dev',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:8080'
];

export function corsHeaders(request) {
    const origin = request.headers.get('Origin') || '*';

    // Permitir cualquier subdominio de pages.dev de Cloudflare
    const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
                      origin === '*' ||
                      (origin && origin.endsWith('.pages.dev'));

    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
    };
}

export function handleCors(request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders(request)
        });
    }
    return null;
}

export function addCorsHeaders(response, request) {
    const headers = corsHeaders(request);
    const newResponse = new Response(response.body, response);
    Object.entries(headers).forEach(([key, value]) => {
        newResponse.headers.set(key, value);
    });
    return newResponse;
}
