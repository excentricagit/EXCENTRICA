// EXCENTRICA - Componentes UI

const Components = {
    // Crear card de noticia
    newsCard(news) {
        const imageUrl = news.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const categoryBadge = news.category_name ?
            `<span class="badge badge-primary">${news.category_name}</span>` : '';

        return `
            <article class="post">
                <a href="/noticia.html?id=${news.id}">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(news.title)}" class="post-image"
                         onerror="Utils.handleImageError(this)">
                </a>
                <div class="post-content">
                    ${categoryBadge}
                    <h3 class="post-title">
                        <a href="/noticia.html?id=${news.id}">${Utils.escapeHtml(news.title)}</a>
                    </h3>
                    <p class="post-excerpt">${Utils.escapeHtml(news.summary || '')}</p>
                </div>
                <div class="post-footer">
                    <div class="post-actions">
                        <span class="post-action" data-like="news" data-id="${news.id}">
                            ❤️ ${news.like_count || 0}
                        </span>
                        <span class="post-action">👁️ ${news.view_count || 0}</span>
                    </div>
                    <span class="text-muted text-sm">${Utils.timeAgo(news.published_at || news.created_at)}</span>
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

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Components;
}
