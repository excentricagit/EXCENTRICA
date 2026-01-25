// EXCENTRICA - Configuración

const CONFIG = {
    // API
    API_URL: 'https://excentrica-api.contactoexcentrica.workers.dev',
    // Para desarrollo local, descomentar:
    // API_URL: 'http://localhost:8787',

    // App info
    APP_NAME: 'Excentrica',
    APP_VERSION: '1.2.0',

    // Pagination
    DEFAULT_PAGE_SIZE: 12,
    ADMIN_PAGE_SIZE: 20,

    // Storage keys
    STORAGE_TOKEN: 'excentrica_token',
    STORAGE_USER: 'excentrica_user',

    // Image placeholders
    PLACEHOLDER_IMAGE: '/images/placeholder.jpg',
    PLACEHOLDER_AVATAR: '/images/avatar-placeholder.png',

    // Sections
    SECTIONS: {
        noticias: { name: 'Noticias', icon: '📰' },
        mercaderia: { name: 'Mercadería', icon: '🛒' },
        eventos: { name: 'Eventos', icon: '📅' },
        gastronomia: { name: 'Gastronomía', icon: '🍽️' },
        alojamiento: { name: 'Alojamiento', icon: '🏨' },
        transporte: { name: 'Transporte', icon: '🚌' },
        servicios: { name: 'Servicios', icon: '🔧' },
        'puntos-interes': { name: 'Puntos de Interés', icon: '📍' },
        videos: { name: 'Videos', icon: '🎬' }
    },

    // Product conditions
    PRODUCT_CONDITIONS: {
        new: 'Nuevo',
        used: 'Usado',
        refurbished: 'Reacondicionado'
    },

    // Status labels
    STATUS_LABELS: {
        pending: 'Pendiente',
        approved: 'Aprobado',
        published: 'Publicado',
        rejected: 'Rechazado',
        draft: 'Borrador',
        sold: 'Vendido'
    },

    // Status colors
    STATUS_COLORS: {
        pending: 'warning',
        approved: 'success',
        published: 'success',
        rejected: 'danger',
        draft: 'secondary',
        sold: 'info'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.SECTIONS);
Object.freeze(CONFIG.PRODUCT_CONDITIONS);
Object.freeze(CONFIG.STATUS_LABELS);
Object.freeze(CONFIG.STATUS_COLORS);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
