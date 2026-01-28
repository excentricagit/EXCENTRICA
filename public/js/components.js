// EXCENTRICA - Componentes UI

const Components = {
    // Helper para verificar si es noticia reciente (48 horas)
    isRecentNews(dateStr) {
        if (!dateStr) return false;
        const newsDate = new Date(dateStr);
        const now = new Date();
        const diffHours = (now - newsDate) / (1000 * 60 * 60);
        return diffHours < 48;
    },

    // Crear card de noticia - Estilo Excentrica mejorado
    newsCard(news) {
        const imageUrl = news.image_url || '';
        const isNew = this.isRecentNews(news.published_at || news.created_at);
        const views = news.view_count || 0;
        const likes = news.like_count || 0;
        const summary = news.summary || '';

        return `
            <article class="news-card-ex">
                ${imageUrl ? `
                    <div class="news-card-ex-image">
                        <a href="/noticia.html?id=${news.id}">
                            <img src="${imageUrl}" alt="${Utils.escapeHtml(news.title)}"
                                 onerror="this.parentElement.parentElement.style.display='none'">
                        </a>
                        <div class="news-card-ex-overlay"></div>
                        ${isNew ? '<span class="news-card-ex-badge">Nueva</span>' : ''}
                    </div>
                ` : ''}
                <div class="news-card-ex-body">
                    ${news.category_name ? `<span class="news-card-ex-category">${Utils.escapeHtml(news.category_name)}</span>` : ''}
                    <h3 class="news-card-ex-title">
                        <a href="/noticia.html?id=${news.id}">${Utils.escapeHtml(news.title)}</a>
                    </h3>
                    ${summary ? `<p class="news-card-ex-excerpt">${Utils.escapeHtml(summary).substring(0, 160)}${summary.length > 160 ? '...' : ''}</p>` : ''}
                    <div class="news-card-ex-footer">
                        <div class="news-card-ex-meta">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>${Utils.timeAgo(news.published_at || news.created_at)}</span>
                        </div>
                        <div class="news-card-ex-stats">
                            <span class="news-card-ex-stat">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                ${views}
                            </span>
                            ${likes > 0 ? `
                                <span class="news-card-ex-stat">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                    </svg>
                                    ${likes}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `;
    },

    // Crear card de producto
    productCard(product) {
        const imageUrl = product.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const conditionLabel = CONFIG.PRODUCT_CONDITIONS[product.condition] || '';
        const hasDiscount = product.original_price && product.original_price > product.price;

        return `
            <article class="product-card">
                <div class="product-image">
                    <a href="/producto.html?id=${product.id}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(product.title)}"
                             onerror="Utils.handleImageError(this)">
                    </a>
                    ${conditionLabel ? `<span class="product-badge badge badge-info">${conditionLabel}</span>` : ''}
                    <button class="product-favorite ${product.user_liked ? 'liked' : ''}"
                            data-like="product" data-id="${product.id}">
                        ❤️
                    </button>
                </div>
                <div class="product-info">
                    <h3 class="product-title">
                        <a href="/producto.html?id=${product.id}">${Utils.escapeHtml(product.title)}</a>
                    </h3>
                    <div class="product-price">
                        ${Utils.formatPrice(product.price)}
                        ${hasDiscount ? `<span class="product-price-original">${Utils.formatPrice(product.original_price)}</span>` : ''}
                    </div>
                    <div class="product-meta">
                        <span>📍 ${product.zone_name || 'Santiago'}</span>
                        <span>👁️ ${product.view_count || 0}</span>
                    </div>
                </div>
            </article>
        `;
    },

    // Crear card de evento
    eventCard(event) {
        const date = new Date(event.event_date);
        const day = date.getDate();
        const month = date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase();

        return `
            <article class="event-card">
                <div class="event-date-box">
                    <span class="event-date-day">${day}</span>
                    <span class="event-date-month">${month}</span>
                </div>
                <div class="event-info">
                    <h3 class="event-title">
                        <a href="/evento.html?id=${event.id}">${Utils.escapeHtml(event.title)}</a>
                    </h3>
                    <div class="event-meta">
                        ${event.location ? `<span class="event-meta-item">📍 ${Utils.escapeHtml(event.location)}</span>` : ''}
                        ${event.event_time ? `<span class="event-meta-item">🕐 ${event.event_time}</span>` : ''}
                        ${event.price > 0 ? `<span class="event-meta-item">🎫 ${Utils.formatPrice(event.price)}</span>` : '<span class="event-meta-item">🎫 Gratis</span>'}
                    </div>
                </div>
            </article>
        `;
    },

    // Crear card de alojamiento
    accommodationCard(accommodation) {
        const imageUrl = accommodation.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const typeLabels = {
            'hotel': 'Hotel',
            'hostel': 'Hostel',
            'apart': 'Apart Hotel',
            'cabin': 'Cabaña',
            'camping': 'Camping'
        };
        const typeLabel = typeLabels[accommodation.accommodation_type] || 'Alojamiento';

        // Generar estrellas
        let stars = '';
        if (accommodation.star_rating > 0) {
            for (let i = 0; i < accommodation.star_rating; i++) {
                stars += '⭐';
            }
        }

        // Servicios icons
        const services = [];
        if (accommodation.has_wifi) services.push('📶');
        if (accommodation.has_pool) services.push('🏊');
        if (accommodation.has_parking) services.push('🅿️');
        if (accommodation.has_breakfast) services.push('🍳');
        if (accommodation.has_ac) services.push('❄️');
        if (accommodation.has_pet_friendly) services.push('🐾');

        return `
            <article class="accommodation-card">
                <div class="accommodation-image">
                    <a href="/alojamiento-detalle.html?id=${accommodation.id}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(accommodation.name)}"
                             onerror="Utils.handleImageError(this)">
                    </a>
                    <span class="accommodation-badge badge badge-primary">${typeLabel}</span>
                    ${accommodation.featured ? '<span class="accommodation-featured">⭐ Destacado</span>' : ''}
                </div>
                <div class="accommodation-info">
                    <h3 class="accommodation-title">
                        <a href="/alojamiento-detalle.html?id=${accommodation.id}">${Utils.escapeHtml(accommodation.name)}</a>
                    </h3>
                    ${stars ? `<div class="accommodation-stars">${stars}</div>` : ''}
                    <div class="accommodation-meta">
                        ${accommodation.zone_name ? `<span>📍 ${Utils.escapeHtml(accommodation.zone_name)}</span>` : ''}
                        ${accommodation.price_range ? `<span class="accommodation-price">${accommodation.price_range}</span>` : ''}
                    </div>
                    ${services.length > 0 ? `<div class="accommodation-services">${services.join(' ')}</div>` : ''}
                    ${accommodation.price_from ? `<div class="accommodation-price-from">Desde ${Utils.formatPrice(accommodation.price_from)}</div>` : ''}
                </div>
            </article>
        `;
    },

    // Crear card de gastronomía/restaurante
    gastronomyCard(restaurant) {
        const imageUrl = restaurant.image_url || CONFIG.PLACEHOLDER_IMAGE;

        // Iconos de servicios
        const services = [];
        if (restaurant.has_delivery) services.push('🛵 Delivery');
        if (restaurant.has_takeaway) services.push('🥡 Takeaway');

        // Rango de precio
        const priceRanges = {
            '$': '💵',
            '$$': '💵💵',
            '$$$': '💵💵💵',
            '$$$$': '💵💵💵💵'
        };
        const priceIcon = priceRanges[restaurant.price_range] || '';

        return `
            <article class="gastronomy-card">
                <div class="gastronomy-image">
                    <a href="/restaurante.html?id=${restaurant.id}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(restaurant.name)}"
                             onerror="Utils.handleImageError(this)">
                    </a>
                    ${restaurant.featured ? '<span class="gastronomy-featured">⭐ Destacado</span>' : ''}
                    ${restaurant.category_name ? `<span class="gastronomy-badge badge badge-primary">${Utils.escapeHtml(restaurant.category_name)}</span>` : ''}
                </div>
                <div class="gastronomy-info">
                    <h3 class="gastronomy-title">
                        <a href="/restaurante.html?id=${restaurant.id}">${Utils.escapeHtml(restaurant.name)}</a>
                    </h3>
                    ${restaurant.specialties ? `<p class="gastronomy-specialties">${Utils.escapeHtml(restaurant.specialties)}</p>` : ''}
                    <div class="gastronomy-meta">
                        ${restaurant.zone_name ? `<span>📍 ${Utils.escapeHtml(restaurant.zone_name)}</span>` : ''}
                        ${priceIcon ? `<span>${priceIcon}</span>` : ''}
                    </div>
                    ${services.length > 0 ? `<div class="gastronomy-services">${services.join(' • ')}</div>` : ''}
                    ${restaurant.phone ? `<div class="gastronomy-contact">📞 ${Utils.escapeHtml(restaurant.phone)}</div>` : ''}
                </div>
            </article>
        `;
    },

    // Crear card de servicio profesional
    serviceCard(service) {
        const imageUrl = service.image_url || CONFIG.PLACEHOLDER_IMAGE;

        return `
            <article class="service-card">
                <div class="service-image">
                    <a href="/servicio.html?id=${service.id}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(service.title)}"
                             onerror="Utils.handleImageError(this)">
                    </a>
                    ${service.featured ? '<span class="service-featured">⭐ Destacado</span>' : ''}
                    ${service.category_name ? `<span class="service-badge badge badge-info">${Utils.escapeHtml(service.category_name)}</span>` : ''}
                </div>
                <div class="service-info">
                    <h3 class="service-title">
                        <a href="/servicio.html?id=${service.id}">${Utils.escapeHtml(service.title)}</a>
                    </h3>
                    ${service.description ? `<p class="service-description">${Utils.escapeHtml(service.description).substring(0, 100)}...</p>` : ''}
                    <div class="service-meta">
                        ${service.zone_name ? `<span>📍 ${Utils.escapeHtml(service.zone_name)}</span>` : ''}
                        ${service.price_from ? `<span>Desde ${Utils.formatPrice(service.price_from)}</span>` : ''}
                    </div>
                    ${service.phone ? `<div class="service-contact">📞 ${Utils.escapeHtml(service.phone)}</div>` : ''}
                </div>
            </article>
        `;
    },

    // Crear card de punto de interés turístico
    poiCard(poi) {
        const imageUrl = poi.image_url || CONFIG.PLACEHOLDER_IMAGE;

        return `
            <article class="poi-card">
                <div class="poi-image">
                    <a href="/punto-interes.html?id=${poi.id}">
                        <img src="${imageUrl}" alt="${Utils.escapeHtml(poi.name)}"
                             onerror="Utils.handleImageError(this)">
                    </a>
                    ${poi.featured ? '<span class="poi-featured">⭐ Destacado</span>' : ''}
                    ${poi.category_name ? `<span class="poi-badge badge badge-success">${Utils.escapeHtml(poi.category_name)}</span>` : ''}
                </div>
                <div class="poi-info">
                    <h3 class="poi-title">
                        <a href="/punto-interes.html?id=${poi.id}">${Utils.escapeHtml(poi.name)}</a>
                    </h3>
                    ${poi.description ? `<p class="poi-description">${Utils.escapeHtml(poi.description).substring(0, 100)}...</p>` : ''}
                    <div class="poi-meta">
                        ${poi.zone_name ? `<span>📍 ${Utils.escapeHtml(poi.zone_name)}</span>` : ''}
                        ${poi.entry_fee ? `<span>🎫 ${Utils.formatPrice(poi.entry_fee)}</span>` : '<span>🎫 Gratis</span>'}
                    </div>
                </div>
            </article>
        `;
    },

    // Crear card de video
    videoCard(video) {
        // Extraer ID de YouTube
        const getYouTubeId = (url) => {
            if (!url) return null;
            const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
            return match ? match[1] : null;
        };

        const videoId = getYouTubeId(video.video_url);
        const thumbnail = videoId
            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
            : (video.thumbnail_url || CONFIG.PLACEHOLDER_IMAGE);
        const views = video.view_count || 0;
        const likes = video.like_count || 0;

        return `
            <article class="video-card">
                <a href="/video.html?id=${video.id}" class="video-card-link">
                    <div class="video-card-thumbnail">
                        <img src="${thumbnail}" alt="${Utils.escapeHtml(video.title)}"
                             onerror="Utils.handleImageError(this)">
                        <div class="video-card-play-btn">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </div>
                    </div>
                    <div class="video-card-info">
                        <h3 class="video-card-title">${Utils.escapeHtml(video.title)}</h3>
                        <div class="video-card-meta">
                            <span>👁️ ${views.toLocaleString()} vistas</span>
                            ${likes > 0 ? `<span>❤️ ${likes.toLocaleString()}</span>` : ''}
                        </div>
                        <div class="video-card-date">${Utils.timeAgo(video.created_at)}</div>
                    </div>
                </a>
            </article>
        `;
    },

    // Crear paginación
    pagination(current, total, onPageChange) {
        if (total <= 1) return '';

        let html = '<div class="pagination">';

        // Anterior
        html += `<button class="pagination-item ${current <= 1 ? 'disabled' : ''}"
                         onclick="${current > 1 ? `${onPageChange}(${current - 1})` : ''}"
                         ${current <= 1 ? 'disabled' : ''}>
                    ←
                 </button>`;

        // Números
        const start = Math.max(1, current - 2);
        const end = Math.min(total, current + 2);

        if (start > 1) {
            html += `<button class="pagination-item" onclick="${onPageChange}(1)">1</button>`;
            if (start > 2) html += '<span class="pagination-item">...</span>';
        }

        for (let i = start; i <= end; i++) {
            html += `<button class="pagination-item ${i === current ? 'active' : ''}"
                             onclick="${onPageChange}(${i})">${i}</button>`;
        }

        if (end < total) {
            if (end < total - 1) html += '<span class="pagination-item">...</span>';
            html += `<button class="pagination-item" onclick="${onPageChange}(${total})">${total}</button>`;
        }

        // Siguiente
        html += `<button class="pagination-item ${current >= total ? 'disabled' : ''}"
                         onclick="${current < total ? `${onPageChange}(${current + 1})` : ''}"
                         ${current >= total ? 'disabled' : ''}>
                    →
                 </button>`;

        html += '</div>';
        return html;
    },

    // Mostrar toast/notificación
    toast(message, type = 'info', duration = 3000) {
        // Remover toast existente
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast-notification alert alert-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Mostrar loading
    showLoading(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner spinner-lg mx-auto mb-3"></div>
                    <p class="text-muted">Cargando...</p>
                </div>
            `;
        }
    },

    // Mostrar estado vacío
    showEmpty(container, message = 'No hay contenido para mostrar', icon = '📭') {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${icon}</div>
                    <p class="empty-state-title">${message}</p>
                </div>
            `;
        }
    },

    // Mostrar error
    showError(container, message = 'Ha ocurrido un error') {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${Utils.escapeHtml(message)}
                </div>
            `;
        }
    },

    // Crear modal
    modal(id, title, content, footer = '') {
        return `
            <div class="modal-backdrop" id="${id}-backdrop" onclick="Components.closeModal('${id}')"></div>
            <div class="modal" id="${id}">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <span class="modal-close" onclick="Components.closeModal('${id}')">&times;</span>
                </div>
                <div class="modal-body">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;
    },

    // Abrir modal
    openModal(id) {
        const modal = document.getElementById(id);
        const backdrop = document.getElementById(`${id}-backdrop`);
        if (modal) modal.classList.add('active');
        if (backdrop) backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    // Cerrar modal
    closeModal(id) {
        const modal = document.getElementById(id);
        const backdrop = document.getElementById(`${id}-backdrop`);
        if (modal) modal.classList.remove('active');
        if (backdrop) backdrop.classList.remove('active');
        document.body.style.overflow = '';
    },

    // Widget de anuncio
    adWidget(ad) {
        const youtubeId = Utils.getYouTubeId(ad.video_url);
        if (!youtubeId) return '';

        return `
            <div class="ad-banner" data-ad-id="${ad.id}">
                <iframe src="https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=1"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        allowfullscreen></iframe>
                <div class="ad-label">Publicidad</div>
            </div>
        `;
    },

    // Badge de estado
    statusBadge(status) {
        const label = CONFIG.STATUS_LABELS[status] || status;
        const color = CONFIG.STATUS_COLORS[status] || 'secondary';
        return `<span class="badge badge-${color}">${label}</span>`;
    }
};

// Agregar estilos de animación para toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

// =============================================
// LAYOUT COMPONENTS - Dinamicos
// =============================================

// Definicion de navegacion
const NAV_ITEMS = {
    main: [
        { href: '/', icon: '🏠', label: 'Inicio' }
    ],
    explore: [
        { href: '/noticias.html', icon: '📰', label: 'Noticias' },
        { href: '/mercaderia.html', icon: '🛒', label: 'Mercaderia' },
        { href: '/eventos.html', icon: '📅', label: 'Eventos' },
        { href: '/videos.html', icon: '🎥', label: 'Videos' }
    ],
    services: [
        { href: '/gastronomia.html', icon: '🍽️', label: 'Gastronomia' },
        { href: '/alojamiento.html', icon: '🏨', label: 'Alojamiento' },
        { href: '/transporte.html', icon: '🚌', label: 'Transporte' },
        { href: '/servicios.html', icon: '🔧', label: 'Servicios' },
        { href: '/puntos-interes.html', icon: '📍', label: 'Turismo' }
    ],
    extra: [
        { href: '/cine.html', icon: '🎬', label: 'Cine' },
        { href: '/contacto.html', icon: '📞', label: 'Contacto' }
    ]
};

// Obtener pagina actual
function getCurrentPage() {
    return window.location.pathname;
}

// Renderizar sidebar de navegacion
Components.renderSidebar = function(containerId = 'sidebar-nav') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentPath = getCurrentPage();

    const renderItems = (items) => items.map(item => `
        <a href="${item.href}" class="sidebar-nav-item ${currentPath === item.href ? 'active' : ''}">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
        </a>
    `).join('');

    container.innerHTML = `
        ${renderItems(NAV_ITEMS.main)}

        <div class="sidebar-divider"></div>
        <div class="sidebar-section-title">Explorar</div>

        ${renderItems(NAV_ITEMS.explore)}

        <div class="sidebar-divider"></div>
        <div class="sidebar-section-title">Servicios</div>

        ${renderItems(NAV_ITEMS.services)}

        <div class="sidebar-divider"></div>

        ${renderItems(NAV_ITEMS.extra)}
    `;
};

// Renderizar header
Components.renderHeader = function(containerId = 'main-header', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
        searchPlaceholder = 'Buscar...',
        showSearch = true,
        searchId = 'search-input'
    } = options;

    container.innerHTML = `
        <div class="header-inner">
            <a href="/" class="logo">
                <img src="/assets/logo.png" alt="Logo" style="height: 28px; width: auto;"> Excentrica
            </a>
            ${showSearch ? `
                <div class="header-search">
                    <input type="search" id="${searchId}" placeholder="${searchPlaceholder}" />
                </div>
            ` : ''}
            <button class="menu-toggle"><span></span><span></span><span></span></button>
        </div>
    `;
};

// Renderizar footer
Components.renderFooter = function(containerId = 'main-footer') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const year = new Date().getFullYear();

    container.innerHTML = `
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4 class="footer-title">Excentrica</h4>
                    <p class="text-muted">Red social y marketplace de Santiago del Estero, Argentina.</p>
                </div>
                <div>
                    <h4 class="footer-title">Secciones</h4>
                    <div class="footer-links">
                        <a href="/noticias.html" class="footer-link">Noticias</a>
                        <a href="/mercaderia.html" class="footer-link">Mercaderia</a>
                        <a href="/eventos.html" class="footer-link">Eventos</a>
                    </div>
                </div>
                <div>
                    <h4 class="footer-title">Servicios</h4>
                    <div class="footer-links">
                        <a href="/gastronomia.html" class="footer-link">Gastronomia</a>
                        <a href="/alojamiento.html" class="footer-link">Alojamiento</a>
                        <a href="/transporte.html" class="footer-link">Transporte</a>
                    </div>
                </div>
                <div>
                    <h4 class="footer-title">Contacto</h4>
                    <div class="footer-links">
                        <span class="footer-link">contacto@excentrica.com.ar</span>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${year} Excentrica. Todos los derechos reservados.</p>
            </div>
        </div>
    `;
};

// Widget de usuario para sidebar
Components.renderUserWidget = function(containerId = 'user-widget-content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = typeof auth !== 'undefined' ? auth.getUser() : null;

    if (user) {
        let panelButtons = '';
        // Boton de Panel Admin/Editor
        if (user.role === 'admin') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: #fff;" onclick="window.location.href='/admin/'">Panel Admin</button>`;
        }
        if (user.role === 'admin' || user.role === 'editor' || user.role === 'periodista') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">Panel Editor</button>`;
        }
        // Boton de Panel Publicista
        if (user.role === 'admin' || user.role === 'publicista') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;" onclick="window.location.href='/publicista/'">Panel Publicista</button>`;
        }
        // Boton de Panel Videos
        if (user.role === 'admin' || user.role === 'videoeditor') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ec4899, #db2777); border: none; color: #fff;" onclick="window.location.href='/videoeditor/'">Panel Videos</button>`;
        }

        container.innerHTML = `
            <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.75rem; text-align: center;">Hola, ${Utils.escapeHtml(user.name ? user.name.split(' ')[0] : user.email)}</p>
            <button class="btn btn-block mb-2" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #e2e8f0;" onclick="window.location.href='/perfil.html'">Mi Perfil</button>
            ${panelButtons}
            <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
        `;
    } else {
        container.innerHTML = `
            <p style="color: #e2e8f0; font-size: 0.9rem; margin-bottom: 0.75rem;">Inicia sesion para acceder a todas las funciones.</p>
            <button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); color: #fff;" onclick="window.location.href='/login.html'">Iniciar Sesion</button>
            <button class="btn btn-block" style="background: transparent; border: 1px solid #a855f7; color: #e2e8f0;" onclick="window.location.href='/registro.html'">Crear Cuenta</button>
        `;
    }
};

// Widget de publicidad
Components.renderAdWidget = function(containerId = 'ad-widget-content') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; text-align: center; min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div style="width: 70px; height: 70px; margin-bottom: 1rem; background: linear-gradient(135deg, #a855f7, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; box-shadow: 0 0 25px rgba(168, 85, 247, 0.5);">📣</div>
            <p style="color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Promociona tu Negocio</p>
            <p style="color: #c4b5fd; font-size: 0.85rem; line-height: 1.5; margin-bottom: 1rem;">Llega a miles de personas en Santiago del Estero</p>
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                <span style="background: rgba(34, 197, 94, 0.2); color: #4ade80; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 500;">Alto alcance</span>
                <span style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 500;">Videos promocionales</span>
            </div>
        </div>
        <a href="/contacto.html" class="btn btn-block" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); border: none; color: #1f2937; font-weight: 700; padding: 0.75rem; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
            Quiero Anunciar
        </a>
    `;
};

// Inicializar layout completo
Components.initLayout = function(options = {}) {
    const {
        sidebar = true,
        header = true,
        footer = true,
        userWidget = true,
        adWidget = true,
        headerOptions = {}
    } = options;

    if (sidebar) this.renderSidebar();
    if (header) this.renderHeader('main-header', headerOptions);
    if (footer) this.renderFooter();
    if (userWidget) this.renderUserWidget();
    if (adWidget) this.renderAdWidget();
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
