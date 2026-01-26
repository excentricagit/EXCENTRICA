// Rutas administrativas generales

import { success, error } from '../utils/response.js';
import { requireAdmin, requireEditor } from '../middleware/auth.js';

export async function handleGetStats(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        // Helper to safely count from a table
        const safeCount = async (query) => {
            try {
                const result = await env.DB.prepare(query).first();
                return result?.count || 0;
            } catch (e) {
                return 0;
            }
        };

        // Get all counts in parallel
        const [
            users, news, products, events, categories, zones, provinces,
            cinemas, movies, showtimes,
            restaurants, accommodations, services, poi,
            busLines, busStops,
            pendingProducts, pendingNews, pendingPoi
        ] = await Promise.all([
            safeCount('SELECT COUNT(*) as count FROM users'),
            safeCount('SELECT COUNT(*) as count FROM news'),
            safeCount('SELECT COUNT(*) as count FROM products'),
            safeCount('SELECT COUNT(*) as count FROM events'),
            safeCount('SELECT COUNT(*) as count FROM categories'),
            safeCount('SELECT COUNT(*) as count FROM zones'),
            safeCount('SELECT COUNT(*) as count FROM provinces'),
            safeCount('SELECT COUNT(*) as count FROM cinemas'),
            safeCount('SELECT COUNT(*) as count FROM movies'),
            safeCount('SELECT COUNT(*) as count FROM showtimes'),
            safeCount('SELECT COUNT(*) as count FROM restaurants'),
            safeCount('SELECT COUNT(*) as count FROM accommodations'),
            safeCount('SELECT COUNT(*) as count FROM services'),
            safeCount('SELECT COUNT(*) as count FROM points_of_interest'),
            safeCount('SELECT COUNT(*) as count FROM bus_lines'),
            safeCount('SELECT COUNT(*) as count FROM bus_stops'),
            safeCount("SELECT COUNT(*) as count FROM products WHERE status = 'pending'"),
            safeCount("SELECT COUNT(*) as count FROM news WHERE status = 'pending'"),
            safeCount("SELECT COUNT(*) as count FROM points_of_interest WHERE status = 'pending'")
        ]);

        // Get recent items from various tables
        const safeRecent = async (query) => {
            try {
                const result = await env.DB.prepare(query).all();
                return result?.results || [];
            } catch (e) {
                return [];
            }
        };

        const [recentNews, recentProducts, recentPoi, recentEvents] = await Promise.all([
            safeRecent('SELECT id, title, status, created_at FROM news ORDER BY created_at DESC LIMIT 5'),
            safeRecent('SELECT id, title, status, created_at FROM products ORDER BY created_at DESC LIMIT 5'),
            safeRecent('SELECT id, name, status, created_at FROM points_of_interest ORDER BY created_at DESC LIMIT 5'),
            safeRecent('SELECT id, title, status, created_at FROM events ORDER BY created_at DESC LIMIT 5')
        ]);

        return success({
            counts: {
                users,
                news,
                products,
                events,
                categories,
                zones,
                provinces,
                cinemas,
                movies,
                showtimes,
                restaurants,
                accommodations,
                services,
                poi,
                bus_lines: busLines,
                bus_stops: busStops,
                pending_products: pendingProducts,
                pending_news: pendingNews,
                pending_poi: pendingPoi
            },
            recent: {
                news: recentNews,
                products: recentProducts,
                poi: recentPoi,
                events: recentEvents
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
