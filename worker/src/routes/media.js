// Ruta para servir archivos desde R2
import { error } from '../utils/response.js';

/**
 * Sirve un archivo desde R2
 * GET /media/:key
 */
export async function handleServeMedia(request, env, key) {
    try {
        // Obtener archivo de R2
        const object = await env.R2.get(key);

        if (!object) {
            return new Response('Archivo no encontrado', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Servir el archivo con headers apropiados
        const headers = new Headers();
        headers.set('Content-Type', object.httpMetadata.contentType || 'application/octet-stream');
        headers.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 año
        headers.set('Access-Control-Allow-Origin', '*'); // CORS para todas las origins

        // Si es imagen, agregar headers adicionales
        if (object.httpMetadata.contentType?.startsWith('image/')) {
            headers.set('X-Content-Type-Options', 'nosniff');
        }

        return new Response(object.body, {
            headers,
            status: 200
        });

    } catch (e) {
        console.error('Error serving media:', e);
        return new Response('Error sirviendo archivo', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}
