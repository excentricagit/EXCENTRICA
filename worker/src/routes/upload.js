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

        // Validar tipo
        if (!ALLOWED_TYPES.includes(file.type)) {
            return error('Tipo de archivo no permitido. Permitidos: ' + ALLOWED_TYPES.join(', '));
        }

        // Validar tamaño
        if (file.size > MAX_FILE_SIZE) {
            return error('El archivo excede el tamaño máximo de 10MB');
        }

        // Generar nombre único
        const ext = file.name.split('.').pop().toLowerCase();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const key = `uploads/${timestamp}-${random}.${ext}`;

        // Subir a R2
        await env.R2.put(key, file.stream(), {
            httpMetadata: {
                contentType: file.type
            }
        });

        // Construir URL pública
        // Nota: Necesitas configurar un dominio personalizado o usar el dominio de R2
        const url = `https://pub-excentrica.r2.dev/${key}`;

        // Guardar en base de datos
        await env.DB.prepare(`
            INSERT INTO media (key, url, filename, content_type, size, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(key, url, file.name, file.type, file.size, user.id).run();

        return success({
            key,
            url,
            filename: file.name,
            content_type: file.type,
            size: file.size
        }, 'Archivo subido correctamente');

    } catch (e) {
        return error('Error subiendo archivo: ' + e.message, 500);
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

        // Eliminar de R2
        await env.R2.delete(key);

        // Eliminar de base de datos
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
