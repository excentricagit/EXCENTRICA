// Manejo de JWT (JSON Web Tokens)

const JWT_SECRET = 'excentrica-jwt-secret-2026';

function base64UrlEncode(str) {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
}

async function createSignature(header, payload, secret) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${header}.${payload}`);
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

async function verifySignature(header, payload, signature, secret) {
    const expectedSignature = await createSignature(header, payload, secret);
    return signature === expectedSignature;
}

export async function signJWT(payload, expiresIn = '7d') {
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

    // Calcular expiración
    let expSeconds = 7 * 24 * 60 * 60; // 7 días por defecto
    if (typeof expiresIn === 'string') {
        const match = expiresIn.match(/^(\d+)([dhms])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            switch (unit) {
                case 'd': expSeconds = value * 24 * 60 * 60; break;
                case 'h': expSeconds = value * 60 * 60; break;
                case 'm': expSeconds = value * 60; break;
                case 's': expSeconds = value; break;
            }
        }
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
        ...payload,
        iat: now,
        exp: now + expSeconds
    };

    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    const signature = await createSignature(header, encodedPayload, JWT_SECRET);

    return `${header}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const [header, payload, signature] = parts;

        // Verificar firma
        const isValid = await verifySignature(header, payload, signature, JWT_SECRET);
        if (!isValid) return null;

        // Decodificar payload
        const decoded = JSON.parse(base64UrlDecode(payload));

        // Verificar expiración
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }

        return decoded;
    } catch (e) {
        return null;
    }
}

export function getTokenFromHeader(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
