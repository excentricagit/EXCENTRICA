// EXCENTRICA - UI Mobile
// Componentes UI (cards, loaders, etc)

const MobileUI = {
    // Mostrar loading
    showLoading(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (!container) return;

        container.innerHTML = `
            <div class="mobile-loading">
                <div class="mobile-spinner"></div>
            </div>
        `;
    },

    // Mostrar estado vacio
    showEmpty(container, icon = '📭', title = 'Sin contenido', text = '') {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (!container) return;

        container.innerHTML = `
            <div class="mobile-empty">
                <div class="mobile-empty-icon">${icon}</div>
                <div class="mobile-empty-title">${title}</div>
                ${text ? `<div class="mobile-empty-text">${text}</div>` : ''}
            </div>
        `;
    },

    // Mostrar error
    showError(container, message = 'Error al cargar') {
        this.showEmpty(container, '⚠️', 'Error', message);
    },

    // Card de noticia
    cardNoticia(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const date = Utils.timeAgo(item.created_at);

        return `
            <a href="/mobile/noticia-mobile.html?id=${item.id}" class="mobile-card mobile-card-noticia">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">📰 Noticia</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.title)}</h3>
                    <p class="mobile-card-excerpt line-clamp-2">${Utils.escapeHtml(item.summary || '')}</p>
                    <span class="mobile-card-meta">${date}</span>
                </div>
            </a>
        `;
    },

    // Card de producto
    cardProducto(item) {
        const image = item.front_image_url || item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const price = Utils.formatPrice(item.price);
        const hasDiscount = item.original_price && item.original_price > item.price;

        return `
            <a href="/mobile/producto-mobile.html?id=${item.id}" class="mobile-card mobile-card-producto">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    ${item.condition === 'new' ? '<span class="mobile-card-badge">Nuevo</span>' : ''}
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🛒 Mercaderia</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.title)}</h3>
                    <div class="mobile-card-price">
                        <span class="price-current">${price}</span>
                        ${hasDiscount ? `<span class="price-original">${Utils.formatPrice(item.original_price)}</span>` : ''}
                    </div>
                </div>
            </a>
        `;
    },

    // Card de evento
    cardEvento(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const date = item.event_date ? Utils.formatDate(item.event_date) : '';
        const isFree = !item.price || item.price === 0;
        const priceText = isFree ? 'Gratis' : Utils.formatPrice(item.price);

        // Verificar estado de inscripción
        const registration = window.mobileEventRegistrations ? window.mobileEventRegistrations[item.id] : null;
        const isLoggedIn = Auth && Auth.isAuthenticated();

        let subscribeBtn = '';
        let whatsappBtn = '';

        if (registration) {
            const statusText = registration.status === 'confirmado' ? 'Inscrito' : 'Pendiente';
            subscribeBtn = `<button class="mobile-btn-event mobile-btn-event-subscribed" disabled>✓ ${statusText}</button>`;

            // Mostrar WhatsApp si está pendiente y hay contacto
            if (registration.status === 'pendiente' && (item.whatsapp || item.phone)) {
                const phone = (item.whatsapp || item.phone).replace(/\D/g, '');
                const fullPhone = phone.startsWith('54') ? phone : '54' + phone;
                const msg = encodeURIComponent(`Hola! Me inscribí al evento "${item.title}" y mi inscripción está pendiente.`);
                whatsappBtn = `<a href="https://wa.me/${fullPhone}?text=${msg}" target="_blank" class="mobile-btn-event mobile-btn-event-whatsapp" onclick="event.stopPropagation()"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp</a>`;
            }
        } else if (isLoggedIn) {
            subscribeBtn = `<button class="mobile-btn-event mobile-btn-event-subscribe" onclick="mobileSubscribeEvent(${item.id}, this, event)">📝 Inscribirse</button>`;
        } else {
            subscribeBtn = `<button class="mobile-btn-event mobile-btn-event-login" onclick="event.stopPropagation(); window.location.href='/mobile/login-mobile.html'">🔒 Iniciar sesión</button>`;
        }

        return `
            <div class="mobile-card mobile-card-evento" onclick="window.location.href='/mobile/evento-mobile.html?id=${item.id}'">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                    ${date ? `<span class="mobile-card-date-badge">${date}</span>` : ''}
                    <span class="mobile-card-price-badge ${isFree ? 'free' : ''}">${priceText}</span>
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">📅 Evento</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.title)}</h3>
                    ${item.location ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.location)}</span>` : ''}
                    <div class="mobile-card-event-actions" onclick="event.stopPropagation()">
                        ${subscribeBtn}
                        ${whatsappBtn}
                    </div>
                </div>
            </div>
        `;
    },

    // Card de video
    cardVideo(item) {
        const thumbnail = Utils.getYouTubeThumbnail(item.video_url) || CONFIG.PLACEHOLDER_IMAGE;

        return `
            <a href="/mobile/video-mobile.html?id=${item.id}" class="mobile-card mobile-card-video">
                <div class="mobile-card-image">
                    <img src="${thumbnail}" alt="" loading="lazy">
                    <span class="mobile-card-play-icon">▶</span>
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🎥 Video</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.title)}</h3>
                    <span class="mobile-card-meta">${Utils.timeAgo(item.created_at)}</span>
                </div>
            </a>
        `;
    },

    // Card de gastronomia
    cardGastronomia(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;

        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=gastronomia" class="mobile-card mobile-card-local">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🍽️ Gastronomia</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name)}</h3>
                    ${item.address ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.address)}</span>` : ''}
                </div>
            </a>
        `;
    },

    // Card de alojamiento
    cardAlojamiento(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;

        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=alojamiento" class="mobile-card mobile-card-local">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🏨 Alojamiento</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name)}</h3>
                    ${item.address ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.address)}</span>` : ''}
                </div>
            </a>
        `;
    },

    // Card de transporte
    cardTransporte(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=transporte" class="mobile-card mobile-card-local">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🚌 Transporte</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name)}</h3>
                    ${item.address ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.address)}</span>` : ''}
                </div>
            </a>
        `;
    },

    // Card de colectivo (linea de bus)
    cardColectivo(item) {
        const lineNumber = item.line_number || '';
        const company = item.company || '';
        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=colectivo" class="mobile-card mobile-card-colectivo">
                <div class="mobile-card-bus-number">${Utils.escapeHtml(lineNumber)}</div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🚌 Colectivo</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name || 'Linea ' + lineNumber)}</h3>
                    ${company ? `<span class="mobile-card-meta">${Utils.escapeHtml(company)}</span>` : ''}
                    ${item.route_description ? `<p class="mobile-card-excerpt line-clamp-2">${Utils.escapeHtml(item.route_description)}</p>` : ''}
                </div>
            </a>
        `;
    },

    // Card de servicios
    cardServicios(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=servicios" class="mobile-card mobile-card-local">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">🔧 Servicios</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name || item.title)}</h3>
                    ${item.address ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.address)}</span>` : ''}
                </div>
            </a>
        `;
    },

    // Card de turismo
    cardTurismo(item) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=turismo" class="mobile-card mobile-card-local">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">📍 Turismo</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(item.name || item.title)}</h3>
                    ${item.address ? `<span class="mobile-card-meta">📍 ${Utils.escapeHtml(item.address)}</span>` : ''}
                </div>
            </a>
        `;
    },

    // Card generico
    cardGenerico(item, type, icon) {
        const image = item.image_url || CONFIG.PLACEHOLDER_IMAGE;
        const title = item.title || item.name || 'Sin titulo';

        return `
            <a href="/mobile/local-mobile.html?id=${item.id}&type=${type}" class="mobile-card">
                <div class="mobile-card-image">
                    <img src="${image}" alt="" loading="lazy" onerror="this.src='${CONFIG.PLACEHOLDER_IMAGE}'">
                </div>
                <div class="mobile-card-body">
                    <span class="mobile-card-category">${icon}</span>
                    <h3 class="mobile-card-title line-clamp-2">${Utils.escapeHtml(title)}</h3>
                </div>
            </a>
        `;
    },

    // Boton cargar mas
    buttonLoadMore(onClick) {
        const btn = document.createElement('button');
        btn.className = 'mobile-btn-load-more';
        btn.textContent = 'Cargar mas';
        btn.onclick = onClick;
        return btn;
    },

    // Toast notification
    toast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast mobile-toast-${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};
