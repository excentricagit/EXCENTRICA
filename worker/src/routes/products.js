// Rutas de productos (marketplace)

import { success, error, notFound, forbidden } from '../utils/response.js';
import { requireAuth, requireAdmin, requireEditor, authMiddleware } from '../middleware/auth.js';

export async function handleGetProducts(request, env) {
    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 12;
        const category = url.searchParams.get('category') || '';
        const zone = url.searchParams.get('zone') || '';
        const condition = url.searchParams.get('condition') || '';
        const minPrice = url.searchParams.get('min_price');
        const maxPrice = url.searchParams.get('max_price');
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, c.name as category_name, z.name as zone_name, u.name as author_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.status = 'approved'
        `;
        let countQuery = "SELECT COUNT(*) as total FROM products WHERE status = 'approved'";
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
            params.push(category);
        }

        if (zone) {
            query += ' AND z.slug = ?';
            countQuery += ' AND zone_id = (SELECT id FROM zones WHERE slug = ?)';
            params.push(zone);
        }

        if (condition) {
            query += ' AND p.condition = ?';
            countQuery += ' AND condition = ?';
            params.push(condition);
        }

        if (minPrice) {
            query += ' AND p.price >= ?';
            countQuery += ' AND price >= ?';
            params.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            query += ' AND p.price <= ?';
            countQuery += ' AND price <= ?';
            params.push(parseFloat(maxPrice));
        }

        if (search) {
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.featured DESC, p.created_at DESC LIMIT ? OFFSET ?';

        const [products, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            products: products.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo productos: ' + e.message, 500);
    }
}

export async function handleGetProductById(request, env, id) {
    try {
        const product = await env.DB.prepare(`
            SELECT p.*, c.name as category_name, c.slug as category_slug,
                   z.name as zone_name, u.name as author_name, u.phone as author_phone
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.id = ?
        `).bind(id).first();

        if (!product) {
            return notFound('Producto no encontrado');
        }

        // Incrementar vistas
        await env.DB.prepare(
            'UPDATE products SET view_count = view_count + 1 WHERE id = ?'
        ).bind(id).run();

        // Verificar like del usuario
        const { user } = await authMiddleware(request, env);
        let userLiked = false;
        if (user) {
            const like = await env.DB.prepare(
                'SELECT id FROM likes WHERE user_id = ? AND content_type = ? AND content_id = ?'
            ).bind(user.id, 'product', id).first();
            userLiked = !!like;
        }

        return success({ ...product, user_liked: userLiked });

    } catch (e) {
        return error('Error obteniendo producto: ' + e.message, 500);
    }
}

export async function handleCreateProduct(request, env) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, price, original_price, image_url, front_image_url, back_image_url, images, category_id, zone_id, address, phone, whatsapp, condition, accepts_offers } = data;

        if (!title || !description || !price) {
            return error('Título, descripción y precio son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO products (title, description, price, original_price, image_url, front_image_url, back_image_url, images, category_id, author_id, zone_id, address, phone, whatsapp, condition, accepts_offers, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `).bind(
            title,
            description,
            price,
            original_price || null,
            image_url || null,
            front_image_url || null,
            back_image_url || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            user.id,
            zone_id || null,
            address || null,
            phone || null,
            whatsapp || null,
            condition || 'new',
            accepts_offers ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id }, 'Producto creado. Pendiente de aprobación.');

    } catch (e) {
        return error('Error creando producto: ' + e.message, 500);
    }
}

export async function handleUpdateProduct(request, env, id) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
        if (!product) {
            return notFound('Producto no encontrado');
        }

        // Solo el autor o admin puede editar
        if (product.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para editar este producto');
        }

        const data = await request.json();
        const { title, description, price, original_price, image_url, front_image_url, back_image_url, images, category_id, zone_id, address, phone, whatsapp, condition, accepts_offers } = data;

        await env.DB.prepare(`
            UPDATE products SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                original_price = ?,
                image_url = COALESCE(?, image_url),
                front_image_url = COALESCE(?, front_image_url),
                back_image_url = COALESCE(?, back_image_url),
                images = COALESCE(?, images),
                category_id = COALESCE(?, category_id),
                zone_id = COALESCE(?, zone_id),
                address = COALESCE(?, address),
                phone = COALESCE(?, phone),
                whatsapp = COALESCE(?, whatsapp),
                condition = COALESCE(?, condition),
                accepts_offers = COALESCE(?, accepts_offers),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            price || null,
            original_price !== undefined ? original_price : product.original_price,
            image_url || null,
            front_image_url || null,
            back_image_url || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            zone_id || null,
            address || null,
            phone || null,
            whatsapp || null,
            condition || null,
            accepts_offers !== undefined ? (accepts_offers ? 1 : 0) : null,
            id
        ).run();

        return success(null, 'Producto actualizado');

    } catch (e) {
        return error('Error actualizando producto: ' + e.message, 500);
    }
}

export async function handleDeleteProduct(request, env, id) {
    const { user, error: authError } = await requireAuth(request, env);
    if (authError) return authError;

    try {
        const product = await env.DB.prepare('SELECT author_id FROM products WHERE id = ?').bind(id).first();
        if (!product) {
            return notFound('Producto no encontrado');
        }

        if (product.author_id !== user.id && user.role !== 'admin') {
            return forbidden('No tienes permiso para eliminar este producto');
        }

        await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
        await env.DB.prepare("DELETE FROM likes WHERE content_type = 'product' AND content_id = ?").bind(id).run();

        return success(null, 'Producto eliminado');

    } catch (e) {
        return error('Error eliminando producto: ' + e.message, 500);
    }
}

// ADMIN

export async function handleAdminGetProducts(request, env) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 20;
        const status = url.searchParams.get('status') || '';
        const category = url.searchParams.get('category') || '';
        const search = url.searchParams.get('search') || '';
        const offset = (page - 1) * limit;

        let query = `
            SELECT p.*, c.name as category_name, z.name as zone_name, u.name as author_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN zones z ON p.zone_id = z.id
            LEFT JOIN users u ON p.author_id = u.id
            WHERE 1=1
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND p.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
        }

        if (category) {
            query += ' AND c.slug = ?';
            countQuery += ' AND category_id = (SELECT id FROM categories WHERE slug = ?)';
            params.push(category);
        }

        if (search) {
            query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
            countQuery += ' AND (title LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';

        const [products, countResult] = await Promise.all([
            env.DB.prepare(query).bind(...params, limit, offset).all(),
            env.DB.prepare(countQuery).bind(...params).first()
        ]);

        return success({
            products: products.results,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil(countResult.total / limit)
            }
        });

    } catch (e) {
        return error('Error obteniendo productos: ' + e.message, 500);
    }
}

export async function handleAdminUpdateProductStatus(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const { status } = await request.json();

        if (!['pending', 'approved', 'rejected', 'sold'].includes(status)) {
            return error('Estado inválido');
        }

        await env.DB.prepare(
            "UPDATE products SET status = ?, updated_at = datetime('now') WHERE id = ?"
        ).bind(status, id).run();

        return success(null, 'Estado actualizado');

    } catch (e) {
        return error('Error actualizando estado: ' + e.message, 500);
    }
}

export async function handleAdminCreateProduct(request, env) {
    const { user, error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, price, original_price, image_url, images, category_id, zone_id, condition, accepts_offers, phone, status, featured } = data;

        if (!title || !description || !price) {
            return error('Título, descripción y precio son requeridos');
        }

        const result = await env.DB.prepare(`
            INSERT INTO products (title, description, price, original_price, image_url, images, category_id, author_id, zone_id, condition, accepts_offers, phone, status, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            title,
            description,
            price,
            original_price || null,
            image_url || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            user.id,
            zone_id || null,
            condition || 'new',
            accepts_offers ? 1 : 0,
            phone || null,
            status || 'approved',
            featured ? 1 : 0
        ).run();

        return success({ id: result.meta.last_row_id }, 'Producto creado');

    } catch (e) {
        return error('Error creando producto: ' + e.message, 500);
    }
}

export async function handleAdminUpdateProduct(request, env, id) {
    const { error: authError } = await requireEditor(request, env);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { title, description, price, original_price, image_url, images, category_id, zone_id, condition, accepts_offers, phone, status, featured } = data;

        const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
        if (!product) {
            return notFound('Producto no encontrado');
        }

        await env.DB.prepare(`
            UPDATE products SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                price = COALESCE(?, price),
                original_price = ?,
                image_url = COALESCE(?, image_url),
                images = COALESCE(?, images),
                category_id = COALESCE(?, category_id),
                zone_id = COALESCE(?, zone_id),
                condition = COALESCE(?, condition),
                accepts_offers = COALESCE(?, accepts_offers),
                phone = COALESCE(?, phone),
                status = COALESCE(?, status),
                featured = COALESCE(?, featured),
                updated_at = datetime('now')
            WHERE id = ?
        `).bind(
            title || null,
            description || null,
            price || null,
            original_price !== undefined ? original_price : product.original_price,
            image_url || null,
            images ? JSON.stringify(images) : null,
            category_id || null,
            zone_id || null,
            condition || null,
            accepts_offers !== undefined ? (accepts_offers ? 1 : 0) : null,
            phone || null,
            status || null,
            featured !== undefined ? (featured ? 1 : 0) : null,
            id
        ).run();

        return success(null, 'Producto actualizado');

    } catch (e) {
        return error('Error actualizando producto: ' + e.message, 500);
    }
}
