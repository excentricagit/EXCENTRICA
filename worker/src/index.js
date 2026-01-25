// EXCENTRICA API - Entry Point
// Cloudflare Worker

import { handleCors, addCorsHeaders } from './middleware/cors.js';
import { json, notFound, serverError } from './utils/response.js';

// Auth routes
import { handleLogin, handleRegister, handleGetMe, handleUpdateProfile, handleChangePassword } from './routes/auth.js';

// Users routes
import { handleGetUsers, handleGetUser, handleCreateUser, handleUpdateUser, handleDeleteUser, handleToggleUserStatus } from './routes/users.js';

// News routes
import { handleGetNews, handleGetNewsById, handleGetNewsBySlug, handleAdminGetNews, handleAdminCreateNews, handleAdminUpdateNews, handleAdminDeleteNews } from './routes/news.js';

// Products routes
import { handleGetProducts, handleGetProductById, handleCreateProduct, handleUpdateProduct, handleDeleteProduct, handleAdminGetProducts, handleAdminUpdateProductStatus, handleAdminCreateProduct, handleAdminUpdateProduct } from './routes/products.js';

// Categories routes
import { handleGetCategories, handleGetCategoryById, handleAdminGetCategories, handleAdminCreateCategory, handleAdminUpdateCategory, handleAdminDeleteCategory } from './routes/categories.js';

// Zones routes
import { handleGetZones, handleGetZoneById, handleAdminGetZones, handleAdminCreateZone, handleAdminUpdateZone, handleAdminDeleteZone } from './routes/zones.js';

// Events routes
import { handleGetEvents, handleGetEventById, handleAdminGetEvents, handleAdminCreateEvent, handleAdminUpdateEvent, handleAdminDeleteEvent } from './routes/events.js';

// Videos routes
import { handleGetVideos, handleGetVideoById, handleAdminGetVideos, handleAdminCreateVideo, handleAdminUpdateVideo, handleAdminDeleteVideo } from './routes/videos.js';

// Likes routes
import { handleToggleLike, handleGetLikeStatus, handleGetUserLikes } from './routes/likes.js';

// Upload routes
import { handleUpload, handleDeleteFile, handleGetMedia } from './routes/upload.js';

// Ads routes
import { handleGetAds, handleGetAdById, handleTrackImpression, handleTrackClick, handleAdminGetAds, handleAdminCreateAd, handleAdminUpdateAd, handleAdminDeleteAd } from './routes/ads.js';

// Admin routes
import { handleGetStats, handleGetStorageStats } from './routes/admin.js';

// Simple router
function matchRoute(method, path, routes) {
    for (const route of routes) {
        if (route.method !== method && route.method !== '*') continue;

        // Exact match
        if (route.path === path) {
            return { handler: route.handler, params: {} };
        }

        // Pattern match with params
        const routeParts = route.path.split('/');
        const pathParts = path.split('/');

        if (routeParts.length !== pathParts.length) continue;

        const params = {};
        let match = true;

        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
                match = false;
                break;
            }
        }

        if (match) {
            return { handler: route.handler, params };
        }
    }

    return null;
}

// Define routes
const routes = [
    // Health check
    { method: 'GET', path: '/api/health', handler: () => json({ status: 'ok', version: '1.2.0' }) },

    // Auth
    { method: 'POST', path: '/api/auth/login', handler: handleLogin },
    { method: 'POST', path: '/api/auth/register', handler: handleRegister },
    { method: 'GET', path: '/api/auth/me', handler: handleGetMe },
    { method: 'PUT', path: '/api/auth/profile', handler: handleUpdateProfile },
    { method: 'PUT', path: '/api/auth/password', handler: handleChangePassword },

    // Categories (public)
    { method: 'GET', path: '/api/categories', handler: handleGetCategories },
    { method: 'GET', path: '/api/categories/:id', handler: (req, env, params) => handleGetCategoryById(req, env, params.id) },

    // Zones (public)
    { method: 'GET', path: '/api/zones', handler: handleGetZones },
    { method: 'GET', path: '/api/zones/:id', handler: (req, env, params) => handleGetZoneById(req, env, params.id) },

    // News (public)
    { method: 'GET', path: '/api/news', handler: handleGetNews },
    { method: 'GET', path: '/api/news/:id', handler: (req, env, params) => handleGetNewsById(req, env, params.id) },
    { method: 'GET', path: '/api/news/slug/:slug', handler: (req, env, params) => handleGetNewsBySlug(req, env, params.slug) },

    // Products (public + auth)
    { method: 'GET', path: '/api/products', handler: handleGetProducts },
    { method: 'GET', path: '/api/products/:id', handler: (req, env, params) => handleGetProductById(req, env, params.id) },
    { method: 'POST', path: '/api/products', handler: handleCreateProduct },
    { method: 'PUT', path: '/api/products/:id', handler: (req, env, params) => handleUpdateProduct(req, env, params.id) },
    { method: 'DELETE', path: '/api/products/:id', handler: (req, env, params) => handleDeleteProduct(req, env, params.id) },

    // Events (public)
    { method: 'GET', path: '/api/events', handler: handleGetEvents },
    { method: 'GET', path: '/api/events/:id', handler: (req, env, params) => handleGetEventById(req, env, params.id) },

    // Videos (public)
    { method: 'GET', path: '/api/videos', handler: handleGetVideos },
    { method: 'GET', path: '/api/videos/:id', handler: (req, env, params) => handleGetVideoById(req, env, params.id) },

    // Ads (public)
    { method: 'GET', path: '/api/ads', handler: handleGetAds },
    { method: 'GET', path: '/api/ads/:id', handler: (req, env, params) => handleGetAdById(req, env, params.id) },
    { method: 'POST', path: '/api/ads/:id/impression', handler: (req, env, params) => handleTrackImpression(req, env, params.id) },
    { method: 'POST', path: '/api/ads/:id/click', handler: (req, env, params) => handleTrackClick(req, env, params.id) },

    // Likes (auth)
    { method: 'POST', path: '/api/likes', handler: handleToggleLike },
    { method: 'GET', path: '/api/likes/status', handler: handleGetLikeStatus },
    { method: 'GET', path: '/api/likes/user', handler: handleGetUserLikes },

    // Upload (auth)
    { method: 'POST', path: '/api/upload', handler: handleUpload },
    { method: 'DELETE', path: '/api/upload/:key', handler: (req, env, params) => handleDeleteFile(req, env, params.key) },
    { method: 'GET', path: '/api/media', handler: handleGetMedia },

    // ========== ADMIN ROUTES ==========

    // Admin - Stats
    { method: 'GET', path: '/api/admin/stats', handler: handleGetStats },
    { method: 'GET', path: '/api/admin/storage', handler: handleGetStorageStats },

    // Admin - Users
    { method: 'GET', path: '/api/admin/users', handler: handleGetUsers },
    { method: 'GET', path: '/api/admin/users/:id', handler: (req, env, params) => handleGetUser(req, env, params.id) },
    { method: 'POST', path: '/api/admin/users', handler: handleCreateUser },
    { method: 'PUT', path: '/api/admin/users/:id', handler: (req, env, params) => handleUpdateUser(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/users/:id', handler: (req, env, params) => handleDeleteUser(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/users/:id/toggle', handler: (req, env, params) => handleToggleUserStatus(req, env, params.id) },

    // Admin - Categories
    { method: 'GET', path: '/api/admin/categories', handler: handleAdminGetCategories },
    { method: 'POST', path: '/api/admin/categories', handler: handleAdminCreateCategory },
    { method: 'PUT', path: '/api/admin/categories/:id', handler: (req, env, params) => handleAdminUpdateCategory(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/categories/:id', handler: (req, env, params) => handleAdminDeleteCategory(req, env, params.id) },

    // Admin - Zones
    { method: 'GET', path: '/api/admin/zones', handler: handleAdminGetZones },
    { method: 'POST', path: '/api/admin/zones', handler: handleAdminCreateZone },
    { method: 'PUT', path: '/api/admin/zones/:id', handler: (req, env, params) => handleAdminUpdateZone(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/zones/:id', handler: (req, env, params) => handleAdminDeleteZone(req, env, params.id) },

    // Admin - News
    { method: 'GET', path: '/api/admin/news', handler: handleAdminGetNews },
    { method: 'POST', path: '/api/admin/news', handler: handleAdminCreateNews },
    { method: 'PUT', path: '/api/admin/news/:id', handler: (req, env, params) => handleAdminUpdateNews(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/news/:id', handler: (req, env, params) => handleAdminDeleteNews(req, env, params.id) },

    // Admin - Products
    { method: 'GET', path: '/api/admin/products', handler: handleAdminGetProducts },
    { method: 'POST', path: '/api/admin/products', handler: handleAdminCreateProduct },
    { method: 'PUT', path: '/api/admin/products/:id', handler: (req, env, params) => handleAdminUpdateProduct(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/products/:id/status', handler: (req, env, params) => handleAdminUpdateProductStatus(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/products/:id', handler: (req, env, params) => handleDeleteProduct(req, env, params.id) },

    // Admin - Events
    { method: 'GET', path: '/api/admin/events', handler: handleAdminGetEvents },
    { method: 'POST', path: '/api/admin/events', handler: handleAdminCreateEvent },
    { method: 'PUT', path: '/api/admin/events/:id', handler: (req, env, params) => handleAdminUpdateEvent(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/events/:id', handler: (req, env, params) => handleAdminDeleteEvent(req, env, params.id) },

    // Admin - Videos
    { method: 'GET', path: '/api/admin/videos', handler: handleAdminGetVideos },
    { method: 'POST', path: '/api/admin/videos', handler: handleAdminCreateVideo },
    { method: 'PUT', path: '/api/admin/videos/:id', handler: (req, env, params) => handleAdminUpdateVideo(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/videos/:id', handler: (req, env, params) => handleAdminDeleteVideo(req, env, params.id) },

    // Admin - Ads
    { method: 'GET', path: '/api/admin/ads', handler: handleAdminGetAds },
    { method: 'POST', path: '/api/admin/ads', handler: handleAdminCreateAd },
    { method: 'PUT', path: '/api/admin/ads/:id', handler: (req, env, params) => handleAdminUpdateAd(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/ads/:id', handler: (req, env, params) => handleAdminDeleteAd(req, env, params.id) },
];

export default {
    async fetch(request, env, ctx) {
        try {
            // Handle CORS preflight
            const corsResponse = handleCors(request);
            if (corsResponse) return corsResponse;

            const url = new URL(request.url);
            const path = url.pathname;
            const method = request.method;

            // Match route
            const match = matchRoute(method, path, routes);

            let response;
            if (match) {
                response = await match.handler(request, env, match.params);
            } else {
                response = notFound('Endpoint no encontrado');
            }

            // Add CORS headers to response
            return addCorsHeaders(response, request);

        } catch (e) {
            console.error('Error:', e);
            return addCorsHeaders(serverError('Error interno: ' + e.message), request);
        }
    }
};
