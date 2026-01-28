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
import { handleGetZones, handleGetZoneById, handleAdminGetZones, handleAdminCreateZone, handleAdminUpdateZone, handleAdminDeleteZone, handleAdminMergeZone } from './routes/zones.js';

// Events routes
import { handleGetEvents, handleGetEventById, handleAdminGetEvents, handleAdminCreateEvent, handleAdminUpdateEvent, handleAdminDeleteEvent } from './routes/events.js';

// Event Registrations routes
import {
    handleEventRegister, handleEventUnregister, handleGetMyEventRegistrations, handleCheckEventRegistration,
    handleAdminGetEventRegistrations, handleAdminUpdateRegistrationStatus, handleAdminGetEventRegistrationStats, handleVerifyRegistrationCode
} from './routes/event-registrations.js';

// Videos routes
import { handleGetVideos, handleGetVideoById, handleAdminGetVideos, handleAdminCreateVideo, handleAdminUpdateVideo, handleAdminDeleteVideo } from './routes/videos.js';

// Likes routes
import { handleToggleLike, handleGetLikeStatus, handleGetUserLikes } from './routes/likes.js';

// Upload routes
import { handleUpload, handleDeleteFile, handleGetMedia } from './routes/upload.js';

// Ads routes
import {
    handleGetAds, handleGetAdById, handleTrackImpression, handleTrackClick,
    handleAdminGetAds, handleAdminCreateAd, handleAdminUpdateAd, handleAdminDeleteAd,
    handlePublicistaGetAds, handlePublicistaCreateAd, handlePublicistaUpdateAd, handlePublicistaDeleteAd, handlePublicistaGetAdStats
} from './routes/ads.js';

// Admin routes
import { handleGetStats, handleGetStorageStats } from './routes/admin.js';

// Cinema routes
import {
    handleGetCinemas, handleGetCinemaById, handleGetMovies, handleGetMovieById, handleGetShowtimes,
    handleAdminGetCinemas, handleAdminCreateCinema, handleAdminUpdateCinema, handleAdminDeleteCinema,
    handleAdminGetMovies, handleAdminCreateMovie, handleAdminUpdateMovie, handleAdminDeleteMovie,
    handleAdminGetShowtimes, handleAdminCreateShowtime, handleAdminUpdateShowtime, handleAdminDeleteShowtime,
    handleAdminBulkCreateShowtimes, handleAdminBulkDeleteShowtimes
} from './routes/cinema.js';

// Gastronomy routes
import {
    handleGetGastronomy, handleGetGastronomyById, handleGetGastronomyBySlug,
    handleAdminGetGastronomy, handleAdminCreateGastronomy, handleAdminUpdateGastronomy,
    handleAdminDeleteGastronomy, handleAdminUpdateGastronomyStatus, handleAdminToggleGastronomyFeatured
} from './routes/gastronomy.js';

// Accommodation routes
import {
    handleGetAccommodations, handleGetAccommodationById, handleGetAccommodationBySlug,
    handleAdminGetAccommodations, handleAdminCreateAccommodation, handleAdminUpdateAccommodation,
    handleAdminDeleteAccommodation, handleAdminUpdateAccommodationStatus, handleAdminToggleAccommodationFeatured
} from './routes/accommodation.js';

// Transport routes
import {
    handleGetTransport, handleGetTransportById,
    handleAdminGetTransport, handleAdminCreateTransport, handleAdminUpdateTransport,
    handleAdminDeleteTransport, handleAdminUpdateTransportStatus, handleAdminToggleTransportFeatured,
    handleGetDriver, handleSaveDriver, handleDeleteDriver
} from './routes/transport.js';

// Services routes (servicios profesionales)
import {
    handleGetServices, handleGetServiceById,
    handleAdminGetServices, handleAdminCreateService, handleAdminUpdateService,
    handleAdminDeleteService, handleAdminUpdateServiceStatus, handleAdminToggleServiceFeatured,
    handleGetServiceProvider, handleSaveServiceProvider, handleDeleteServiceProvider
} from './routes/services.js';

// Bus routes (colectivos y paradas)
import {
    handleGetBusLines, handleGetBusLineById, handleGetBusStops,
    handleAdminGetBusLines, handleAdminCreateBusLine, handleAdminUpdateBusLine,
    handleAdminDeleteBusLine, handleAdminUpdateBusLineStatus, handleAdminToggleBusLineFeatured,
    handleAdminGetBusStops, handleAdminCreateBusStop, handleAdminUpdateBusStop,
    handleAdminDeleteBusStop, handleAdminReorderBusStops
} from './routes/bus.js';

// POI routes (puntos de interés turístico)
import {
    getPublicPoi, getPublicPoiById,
    getAdminPoi, createPoi, updatePoi, deletePoi
} from './routes/poi.js';

// Provinces routes (provincias)
import {
    getProvinces, getProvinceById,
    createProvince, updateProvince, deleteProvince
} from './routes/provinces.js';

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

    // Event Registrations (auth required)
    { method: 'POST', path: '/api/events/:id/register', handler: (req, env, params) => handleEventRegister(req, env, params.id) },
    { method: 'DELETE', path: '/api/events/:id/register', handler: (req, env, params) => handleEventUnregister(req, env, params.id) },
    { method: 'GET', path: '/api/events/:id/registration', handler: (req, env, params) => handleCheckEventRegistration(req, env, params.id) },
    { method: 'GET', path: '/api/user/events', handler: handleGetMyEventRegistrations },

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
    { method: 'POST', path: '/api/admin/zones/:id/merge', handler: (req, env, params) => handleAdminMergeZone(req, env, params.id) },

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

    // Admin - Event Registrations
    { method: 'GET', path: '/api/admin/event-registrations', handler: handleAdminGetEventRegistrations },
    { method: 'PUT', path: '/api/admin/event-registrations/:id', handler: (req, env, params) => handleAdminUpdateRegistrationStatus(req, env, params.id) },
    { method: 'GET', path: '/api/admin/events/:id/registrations/stats', handler: (req, env, params) => handleAdminGetEventRegistrationStats(req, env, params.id) },
    { method: 'GET', path: '/api/admin/event-registrations/verify/:code', handler: (req, env, params) => handleVerifyRegistrationCode(req, env, params.code) },

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

    // ========== PUBLICISTA ROUTES ==========

    // Publicista - Ads
    { method: 'GET', path: '/api/publicista/ads', handler: handlePublicistaGetAds },
    { method: 'GET', path: '/api/publicista/ads/stats', handler: handlePublicistaGetAdStats },
    { method: 'POST', path: '/api/publicista/ads', handler: handlePublicistaCreateAd },
    { method: 'PUT', path: '/api/publicista/ads/:id', handler: (req, env, params) => handlePublicistaUpdateAd(req, env, params.id) },
    { method: 'DELETE', path: '/api/publicista/ads/:id', handler: (req, env, params) => handlePublicistaDeleteAd(req, env, params.id) },

    // ========== CINEMA ROUTES ==========

    // Cinemas (public)
    { method: 'GET', path: '/api/cinemas', handler: handleGetCinemas },
    { method: 'GET', path: '/api/cinemas/:id', handler: (req, env, params) => handleGetCinemaById(req, env, params.id) },

    // Movies (public)
    { method: 'GET', path: '/api/movies', handler: handleGetMovies },
    { method: 'GET', path: '/api/movies/:id', handler: (req, env, params) => handleGetMovieById(req, env, params.id) },

    // Showtimes (public)
    { method: 'GET', path: '/api/showtimes', handler: handleGetShowtimes },

    // Admin - Cinemas
    { method: 'GET', path: '/api/admin/cinemas', handler: handleAdminGetCinemas },
    { method: 'POST', path: '/api/admin/cinemas', handler: handleAdminCreateCinema },
    { method: 'PUT', path: '/api/admin/cinemas/:id', handler: (req, env, params) => handleAdminUpdateCinema(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/cinemas/:id', handler: (req, env, params) => handleAdminDeleteCinema(req, env, params.id) },

    // Admin - Movies
    { method: 'GET', path: '/api/admin/movies', handler: handleAdminGetMovies },
    { method: 'POST', path: '/api/admin/movies', handler: handleAdminCreateMovie },
    { method: 'PUT', path: '/api/admin/movies/:id', handler: (req, env, params) => handleAdminUpdateMovie(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/movies/:id', handler: (req, env, params) => handleAdminDeleteMovie(req, env, params.id) },

    // Admin - Showtimes
    { method: 'GET', path: '/api/admin/showtimes', handler: handleAdminGetShowtimes },
    { method: 'POST', path: '/api/admin/showtimes', handler: handleAdminCreateShowtime },
    { method: 'POST', path: '/api/admin/showtimes/bulk', handler: handleAdminBulkCreateShowtimes },
    { method: 'POST', path: '/api/admin/showtimes/bulk-delete', handler: handleAdminBulkDeleteShowtimes },
    { method: 'PUT', path: '/api/admin/showtimes/:id', handler: (req, env, params) => handleAdminUpdateShowtime(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/showtimes/:id', handler: (req, env, params) => handleAdminDeleteShowtime(req, env, params.id) },

    // ========== GASTRONOMY ROUTES ==========

    // Gastronomy (public)
    { method: 'GET', path: '/api/gastronomy', handler: handleGetGastronomy },
    { method: 'GET', path: '/api/gastronomy/:id', handler: (req, env, params) => handleGetGastronomyById(req, env, params.id) },
    { method: 'GET', path: '/api/gastronomy/slug/:slug', handler: (req, env, params) => handleGetGastronomyBySlug(req, env, params.slug) },

    // Admin - Gastronomy
    { method: 'GET', path: '/api/admin/gastronomy', handler: handleAdminGetGastronomy },
    { method: 'POST', path: '/api/admin/gastronomy', handler: handleAdminCreateGastronomy },
    { method: 'PUT', path: '/api/admin/gastronomy/:id', handler: (req, env, params) => handleAdminUpdateGastronomy(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/gastronomy/:id', handler: (req, env, params) => handleAdminDeleteGastronomy(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/gastronomy/:id/status', handler: (req, env, params) => handleAdminUpdateGastronomyStatus(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/gastronomy/:id/featured', handler: (req, env, params) => handleAdminToggleGastronomyFeatured(req, env, params.id) },

    // ========== ACCOMMODATION ROUTES ==========

    // Accommodation (public)
    { method: 'GET', path: '/api/accommodations', handler: handleGetAccommodations },
    { method: 'GET', path: '/api/accommodations/:id', handler: (req, env, params) => handleGetAccommodationById(req, env, params.id) },
    { method: 'GET', path: '/api/accommodations/slug/:slug', handler: (req, env, params) => handleGetAccommodationBySlug(req, env, params.slug) },

    // Admin - Accommodation
    { method: 'GET', path: '/api/admin/accommodations', handler: handleAdminGetAccommodations },
    { method: 'POST', path: '/api/admin/accommodations', handler: handleAdminCreateAccommodation },
    { method: 'PUT', path: '/api/admin/accommodations/:id', handler: (req, env, params) => handleAdminUpdateAccommodation(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/accommodations/:id', handler: (req, env, params) => handleAdminDeleteAccommodation(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/accommodations/:id/status', handler: (req, env, params) => handleAdminUpdateAccommodationStatus(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/accommodations/:id/featured', handler: (req, env, params) => handleAdminToggleAccommodationFeatured(req, env, params.id) },

    // ========== TRANSPORT ROUTES ==========

    // Transport (public)
    { method: 'GET', path: '/api/transport', handler: handleGetTransport },
    { method: 'GET', path: '/api/transport/:id', handler: (req, env, params) => handleGetTransportById(req, env, params.id) },

    // Admin - Transport
    { method: 'GET', path: '/api/admin/transport', handler: handleAdminGetTransport },
    { method: 'POST', path: '/api/admin/transport', handler: handleAdminCreateTransport },
    { method: 'PUT', path: '/api/admin/transport/:id', handler: (req, env, params) => handleAdminUpdateTransport(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/transport/:id', handler: (req, env, params) => handleAdminDeleteTransport(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/transport/:id/status', handler: (req, env, params) => handleAdminUpdateTransportStatus(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/transport/:id/featured', handler: (req, env, params) => handleAdminToggleTransportFeatured(req, env, params.id) },
    // Transport Drivers (datos privados de conductores)
    { method: 'GET', path: '/api/admin/transport/:id/driver', handler: (req, env, params) => handleGetDriver(req, env, params.id) },
    { method: 'POST', path: '/api/admin/transport/:id/driver', handler: (req, env, params) => handleSaveDriver(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/transport/:id/driver', handler: (req, env, params) => handleDeleteDriver(req, env, params.id) },

    // ========== SERVICES (Servicios profesionales) ==========

    // Services (public)
    { method: 'GET', path: '/api/services', handler: handleGetServices },
    { method: 'GET', path: '/api/services/:id', handler: (req, env, params) => handleGetServiceById(req, env, params.id) },

    // Admin - Services
    { method: 'GET', path: '/api/admin/services', handler: handleAdminGetServices },
    { method: 'POST', path: '/api/admin/services', handler: handleAdminCreateService },
    { method: 'PUT', path: '/api/admin/services/:id', handler: (req, env, params) => handleAdminUpdateService(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/services/:id', handler: (req, env, params) => handleAdminDeleteService(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/services/:id/status', handler: (req, env, params) => handleAdminUpdateServiceStatus(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/services/:id/featured', handler: (req, env, params) => handleAdminToggleServiceFeatured(req, env, params.id) },
    // Service Providers (datos privados del proveedor)
    { method: 'GET', path: '/api/admin/services/:id/provider', handler: (req, env, params) => handleGetServiceProvider(req, env, params.id) },
    { method: 'POST', path: '/api/admin/services/:id/provider', handler: (req, env, params) => handleSaveServiceProvider(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/services/:id/provider', handler: (req, env, params) => handleDeleteServiceProvider(req, env, params.id) },

    // ========== BUS ROUTES (Colectivos) ==========

    // Bus Lines (public)
    { method: 'GET', path: '/api/bus-lines', handler: handleGetBusLines },
    { method: 'GET', path: '/api/bus-lines/:id', handler: (req, env, params) => handleGetBusLineById(req, env, params.id) },
    { method: 'GET', path: '/api/bus-stops', handler: handleGetBusStops },

    // Admin - Bus Lines
    { method: 'GET', path: '/api/admin/bus-lines', handler: handleAdminGetBusLines },
    { method: 'POST', path: '/api/admin/bus-lines', handler: handleAdminCreateBusLine },
    { method: 'PUT', path: '/api/admin/bus-lines/:id', handler: (req, env, params) => handleAdminUpdateBusLine(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/bus-lines/:id', handler: (req, env, params) => handleAdminDeleteBusLine(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/bus-lines/:id/status', handler: (req, env, params) => handleAdminUpdateBusLineStatus(req, env, params.id) },
    { method: 'PATCH', path: '/api/admin/bus-lines/:id/featured', handler: (req, env, params) => handleAdminToggleBusLineFeatured(req, env, params.id) },

    // Admin - Bus Stops
    { method: 'GET', path: '/api/admin/bus-stops', handler: handleAdminGetBusStops },
    { method: 'POST', path: '/api/admin/bus-stops', handler: handleAdminCreateBusStop },
    { method: 'PUT', path: '/api/admin/bus-stops/:id', handler: (req, env, params) => handleAdminUpdateBusStop(req, env, params.id) },
    { method: 'DELETE', path: '/api/admin/bus-stops/:id', handler: (req, env, params) => handleAdminDeleteBusStop(req, env, params.id) },
    { method: 'POST', path: '/api/admin/bus-stops/reorder', handler: handleAdminReorderBusStops },

    // ========== POI ROUTES (Puntos de Interés Turístico) ==========

    // POI (public)
    { method: 'GET', path: '/api/poi', handler: getPublicPoi },
    { method: 'GET', path: '/api/poi/:id', handler: (req, env, params) => getPublicPoiById(req, env, params) },

    // Admin - POI
    { method: 'GET', path: '/api/admin/poi', handler: getAdminPoi },
    { method: 'POST', path: '/api/admin/poi', handler: createPoi },
    { method: 'PUT', path: '/api/admin/poi/:id', handler: (req, env, params) => updatePoi(req, env, params) },
    { method: 'DELETE', path: '/api/admin/poi/:id', handler: (req, env, params) => deletePoi(req, env, params) },

    // ========== PROVINCES ROUTES (Provincias) ==========

    // Provinces (public)
    { method: 'GET', path: '/api/provinces', handler: getProvinces },
    { method: 'GET', path: '/api/provinces/:id', handler: (req, env, params) => getProvinceById(req, env, params) },

    // Admin - Provinces
    { method: 'POST', path: '/api/admin/provinces', handler: createProvince },
    { method: 'PUT', path: '/api/admin/provinces/:id', handler: (req, env, params) => updateProvince(req, env, params) },
    { method: 'DELETE', path: '/api/admin/provinces/:id', handler: (req, env, params) => deleteProvince(req, env, params) },
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
