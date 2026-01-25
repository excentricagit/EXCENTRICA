// Rutas administrativas generales

import { success, error } from '../utils/response.js';
import { requireAdmin, requireEditor } from '../middleware/auth.js';

export async function handleGetStats(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const [
            usersCount,
            newsCount,
            productsCount,
            eventsCount,
            pendingProducts,
            pendingNews
        ] = await Promise.all([
            env.DB.prepare('SELECT COUNT(*) as count FROM users').first(),
            env.DB.prepare('SELECT COUNT(*) as count FROM news').first(),
            env.DB.prepare('SELECT COUNT(*) as count FROM products').first(),
            env.DB.prepare('SELECT COUNT(*) as count FROM events').first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'pending'").first(),
            env.DB.prepare("SELECT COUNT(*) as count FROM news WHERE status = 'pending'").first()
        ]);

        // Obtener últimos registros
        const [recentUsers, recentNews, recentProducts] = await Promise.all([
            env.DB.prepare('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 5').all(),
            env.DB.prepare('SELECT id, title, status, created_at FROM news ORDER BY created_at DESC LIMIT 5').all(),
            env.DB.prepare('SELECT id, title, status, price, created_at FROM products ORDER BY created_at DESC LIMIT 5').all()
        ]);

        return success({
            counts: {
                users: usersCount.count,
                news: newsCount.count,
                products: productsCount.count,
                events: eventsCount.count,
                pending_products: pendingProducts.count,
                pending_news: pendingNews.count
            },
            recent: {
                users: recentUsers.results,
                news: recentNews.results,
                products: recentProducts.results
            }
        });

    } catch (e) {
        return error('Error obteniendo estadísticas: ' + e.message, 500);
    }
}

export async function handleGetStorageStats(request, env) {
    const { error: authError } = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        // Estadísticas de tablas de la base de datos
        const tables = ['users', 'news', 'products', 'events', 'videos', 'categories', 'zones', 'likes', 'ads', 'media'];
        const tableStats = [];
        let totalRows = 0;

        for (const table of tables) {
            try {
                const result = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
                const count = result.count || 0;
                tableStats.push({
                    name: table,
                    rows: count
                });
                totalRows += count;
            } catch (e) {
                // Si la tabla no existe, continuar
                console.error(`Error getting count for table ${table}:`, e);
            }
        }

        // Ordenar tablas por número de filas (descendente)
        tableStats.sort((a, b) => b.rows - a.rows);

        // Estimación del tamaño de la base de datos (aprox. 1KB por fila promedio)
        // Esto es una estimación, Cloudflare D1 no expone el tamaño real directamente
        const estimatedSizeBytes = totalRows * 1024;

        // Estadísticas de R2 (bucket de archivos)
        let r2Stats = {
            size_bytes: 0,
            files: 0,
            images: 0
        };

        // Obtener estadísticas de la tabla media para R2
        try {
            const mediaStats = await env.DB.prepare(`
                SELECT
                    COUNT(*) as total_files,
                    SUM(size) as total_size,
                    SUM(CASE WHEN content_type LIKE 'image/%' THEN 1 ELSE 0 END) as image_count
                FROM media
            `).first();

            r2Stats = {
                size_bytes: mediaStats.total_size || 0,
                files: mediaStats.total_files || 0,
                images: mediaStats.image_count || 0
            };
        } catch (e) {
            console.error('Error getting media stats:', e);
        }

        return success({
            database: {
                size_bytes: estimatedSizeBytes,
                total_rows: totalRows,
                tables: tableStats
            },
            r2: r2Stats
        });

    } catch (e) {
        return error('Error obteniendo estadísticas de almacenamiento: ' + e.message, 500);
    }
}
