// Rutas administrativas generales

import { success, error } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

export async function handleGetStats(request, env) {
    const { error: authError } = await requireAdmin(request, env);
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
        // Estadísticas de media
        const mediaStats = await env.DB.prepare(`
            SELECT
                COUNT(*) as total_files,
                SUM(size) as total_size,
                COUNT(DISTINCT content_type) as file_types
            FROM media
        `).first();

        // Por tipo de archivo
        const byType = await env.DB.prepare(`
            SELECT content_type, COUNT(*) as count, SUM(size) as size
            FROM media
            GROUP BY content_type
            ORDER BY size DESC
        `).all();

        // Estadísticas de tablas
        const tables = ['users', 'news', 'products', 'events', 'videos', 'accommodations', 'gastronomy', 'transport', 'services', 'points_of_interest', 'likes', 'ads'];
        const tableCounts = {};

        for (const table of tables) {
            const result = await env.DB.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
            tableCounts[table] = result.count;
        }

        return success({
            media: {
                total_files: mediaStats.total_files || 0,
                total_size: mediaStats.total_size || 0,
                total_size_mb: ((mediaStats.total_size || 0) / (1024 * 1024)).toFixed(2),
                by_type: byType.results
            },
            database: {
                tables: tableCounts
            }
        });

    } catch (e) {
        return error('Error obteniendo estadísticas de almacenamiento: ' + e.message, 500);
    }
}
