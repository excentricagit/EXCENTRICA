// Rutas de upload (R2)

import { success, error } from '../utils/response.js';
import { requireAuth } from '../middleware/auth.js';

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function handleUpload(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return error('No se envió ningún archivo');
        }

        // Log para debugging
        console.log('File info:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validar tipo
        if (!ALLOWED_TYPES.includes(file.type)) {
            return error(`Tipo de archivo no permitido: "${file.type}". Permitidos: ${ALLOWED_TYPES.join(', ')}`);
        }

        // Validar tamaño
        if (file.size > MAX_FILE_SIZE) {
            return error('El archivo excede el tamaño máximo de 10MB');
        }

        // Convertir a base64
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);

        // Convertir bytes a string binario
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        // Codificar a base64
        const base64 = btoa(binary);
        const dataUrl = `data:${file.type};base64,${base64}`;

        // Generar key para registro
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const key = `base64-${timestamp}-${random}`;

        // Guardar en base de datos (solo metadata, la imagen va en las noticias directamente)
        await env.DB.prepare(`
            INSERT INTO media (key, url, filename, content_type, size, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(key, dataUrl, file.name, file.type, file.size, user.id).run();

        return success({
            key,
            url: dataUrl,  // Devuelve el data URL directamente
            filename: file.name,
            content_type: file.type,
            size: file.size
        }, 'Imagen convertida a base64 correctamente');

    } catch (e) {
        return error('Error procesando archivo: ' + e.message, 500);
    }
}

export async function handleDeleteFile(request, env, key) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        // Verificar que el archivo existe y pertenece al usuario (o es admin)
        const media = await env.DB.prepare(
            'SELECT * FROM media WHERE key = ?'
        ).bind(key).first();

        if (!media) {
            return error('Archivo no encontrado', 404);
        }

        if (media.uploaded_by !== user.id && user.role !== 'admin') {
            return error('No tienes permiso para eliminar este archivo', 403);
        }

        // Eliminar de base de datos (base64 no necesita borrar de storage)
        await env.DB.prepare('DELETE FROM media WHERE key = ?').bind(key).run();

        return success(null, 'Archivo eliminado');

    } catch (e) {
        return error('Error eliminando archivo: ' + e.message, 500);
    }
}

export async function handleGetMedia(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM media';
        let countQuery = 'SELECT COUNT(*) as total FROM media';

        // Solo admin ve todos los archivos
        if (user.role !== 'admin') {
            query += ' WHERE uploaded_by = ?';
            countQuery += ' WHERE uploaded_by = ?';
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const params = user.role !== 'admin' ? [user.id, limit, offset] : [limit, offset];
        const countParams = user.role !== 'admin' ? [user.id] : [];

        const [media, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params).all(),
            env.DB.prepare(countQuery).bind(...countParams).first()
        ]);

        return success({
            media: media.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo archivos: ' + e.message, 500);
    }
}
