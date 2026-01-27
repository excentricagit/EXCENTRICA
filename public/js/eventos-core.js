/**
 * EVENTOS CORE - Utilidades, renderizado y filtros
 */

// Estado global
let currentPage = 1;
let currentEvent = null;
let currentFilter = 'upcoming';
let currentCategory = '';
let currentView = 'grid';
let userRegistrations = {};
let allCategories = [];
let featuredEvent = null;

// =============================================
// UTILIDADES
// =============================================

function formatEventDate(dateStr) {
    if (!dateStr) return { day: '--', month: '---' };
    const date = new Date(dateStr);
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()
    };
}

function formatEventPrice(price) {
    if (!price || price === 0) return 'Gratis';
    return '$' + Number(price).toLocaleString('es-AR');
}

function formatEventTime(time) {
    if (!time) return '';
    return time.substring(0, 5) + ' hs';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function getImageUrl(url) {
    return url || '/images/placeholder.svg';
}

function getCountdown(dateStr) {
    if (!dateStr) return '';
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diff = eventDate - now;

    if (diff < 0) return 'Evento pasado';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
        return `En ${days} dia${days > 1 ? 's' : ''} y ${hours}h`;
    } else if (hours > 0) {
        return `En ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
        return 'Comienza pronto!';
    }
}

function formatWhatsAppPhone(phone) {
    if (!phone) return null;
    // Remove spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // Remove leading + if present
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }
    // If starts with 0, remove it (local format)
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    // If doesn't start with 54, add Argentina code
    if (!cleaned.startsWith('54')) {
        cleaned = '54' + cleaned;
    }
    return cleaned;
}

function getWhatsAppUrl(event) {
    const phone = event.whatsapp || event.phone;
    if (!phone) return null;

    const formattedPhone = formatWhatsAppPhone(phone);
    if (!formattedPhone) return null;

    const dateInfo = formatEventDate(event.event_date);
    const message = `Hola! Me inscribi al evento "${event.title}" del ${dateInfo.day} de ${dateInfo.month} y mi inscripcion esta pendiente. Podrian confirmarla? Gracias!`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

// =============================================
// HERO - EVENTOS DESTACADOS (DOBLE)
// =============================================

function renderHeroCard(event, prefix) {
    const dateInfo = formatEventDate(event.event_date);
    const isFree = !event.price || event.price === 0;
    const registration = userRegistrations[event.id];
    const isLoggedIn = typeof auth !== 'undefined' && auth.isAuthenticated();

    document.getElementById(`hero-${prefix}-image`).src = getImageUrl(event.image_url);
    document.getElementById(`hero-${prefix}-day`).textContent = dateInfo.day;
    document.getElementById(`hero-${prefix}-month`).textContent = dateInfo.month;
    document.getElementById(`hero-${prefix}-countdown`).textContent = getCountdown(event.event_date);
    document.getElementById(`hero-${prefix}-title`).textContent = event.title;
    document.getElementById(`hero-${prefix}-location`).innerHTML = `<span>📍</span> ${escapeHtml(event.location || 'Por confirmar')}`;
    document.getElementById(`hero-${prefix}-time`).innerHTML = `<span>🕐</span> ${formatEventTime(event.event_time) || 'Por confirmar'}`;

    const priceEl = document.getElementById(`hero-${prefix}-price`);
    priceEl.textContent = formatEventPrice(event.price);
    priceEl.className = 'events-hero-price' + (isFree ? ' free' : '');

    const subscribeBtn = document.getElementById(`hero-${prefix}-subscribe-btn`);
    const whatsappBtn = document.getElementById(`hero-${prefix}-whatsapp-btn`);

    if (registration) {
        subscribeBtn.innerHTML = `<span>✓</span> ${registration.status === 'confirmado' ? 'Inscrito' : 'Pendiente'}`;
        subscribeBtn.classList.add('subscribed');
        subscribeBtn.disabled = true;

        // Show WhatsApp button only for pending status
        if (registration.status === 'pendiente' && whatsappBtn) {
            const whatsappUrl = getWhatsAppUrl(event);
            if (whatsappUrl) {
                whatsappBtn.href = whatsappUrl;
                whatsappBtn.style.display = 'inline-flex';
            } else {
                whatsappBtn.style.display = 'none';
            }
        } else if (whatsappBtn) {
            whatsappBtn.style.display = 'none';
        }
    } else if (isLoggedIn) {
        subscribeBtn.innerHTML = '<span>📝</span> Inscribirse';
        subscribeBtn.classList.remove('subscribed');
        subscribeBtn.disabled = false;
        subscribeBtn.onclick = (e) => subscribeToEvent(event.id, e);
        if (whatsappBtn) whatsappBtn.style.display = 'none';
    } else {
        subscribeBtn.innerHTML = '<span>🔒</span> Inicia sesion';
        subscribeBtn.classList.remove('subscribed');
        subscribeBtn.disabled = false;
        subscribeBtn.onclick = () => window.location.href = '/login.html';
        if (whatsappBtn) whatsappBtn.style.display = 'none';
    }

    document.getElementById(`hero-${prefix}-view-btn`).onclick = () => openEventModal(event.id);
}

function renderHero(mainEvent, secondaryEvent, tertiaryEvent) {
    const container = document.getElementById('events-hero-container');
    const mainCard = document.getElementById('events-hero-main');
    const secondaryCard = document.getElementById('events-hero-secondary');
    const tertiaryCard = document.getElementById('events-hero-tertiary');

    if (!mainEvent) {
        container.style.display = 'none';
        return;
    }

    featuredEvent = mainEvent;

    // Renderizar evento principal (proximo)
    renderHeroCard(mainEvent, 'main');
    mainCard.style.display = 'grid';

    // Renderizar evento terciario (especial) - en la columna izquierda
    if (tertiaryEvent && tertiaryCard) {
        renderHeroCard(tertiaryEvent, 'tertiary');
        tertiaryCard.style.display = 'grid';
        mainCard.classList.remove('solo');
    } else if (tertiaryCard) {
        tertiaryCard.style.display = 'none';
        mainCard.classList.add('solo');
    }

    // Renderizar evento destacado (columna derecha)
    if (secondaryEvent) {
        renderHeroCard(secondaryEvent, 'secondary');
        secondaryCard.style.display = 'flex';
    } else {
        secondaryCard.style.display = 'none';
        container.style.gridTemplateColumns = '1fr';
    }

    container.style.display = 'grid';
}

// =============================================
// TABS Y FILTROS
// =============================================

function initTabs() {
    const tabs = document.querySelectorAll('.events-tab');
    console.log('initTabs: found', tabs.length, 'tabs');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log('Tab clicked:', tab.dataset.filter);
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            console.log('currentFilter set to:', currentFilter);
            currentPage = 1;
            loadEvents(1);
        });
    });
}

function initCategoryChips() {
    const container = document.getElementById('category-chips');
    if (!container || allCategories.length === 0) return;

    container.innerHTML = `
        <button class="events-category-chip ${currentCategory === '' ? 'active' : ''}" data-category="">
            Todos
        </button>
        ${allCategories.map(cat => `
            <button class="events-category-chip ${currentCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
                ${cat.icon || '📌'} ${escapeHtml(cat.name)}
            </button>
        `).join('')}
    `;

    container.querySelectorAll('.events-category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            console.log('Category chip clicked:', chip.dataset.category);
            container.querySelectorAll('.events-category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.category;
            console.log('currentCategory set to:', currentCategory, '| currentFilter:', currentFilter);
            currentPage = 1;
            loadEvents(1);
        });
    });
}

function initViewToggle() {
    const buttons = document.querySelectorAll('.events-view-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;

            const grid = document.getElementById('events-grid');
            if (currentView === 'list') {
                grid.classList.add('list-view');
            } else {
                grid.classList.remove('list-view');
            }
        });
    });
}

// =============================================
// RENDERIZADO
// =============================================

function renderEventCard(event) {
    const dateInfo = formatEventDate(event.event_date);
    const isFree = !event.price || event.price === 0;
    const imageUrl = getImageUrl(event.image_url);
    const registration = userRegistrations[event.id];
    const isLoggedIn = typeof auth !== 'undefined' && auth.isAuthenticated();

    let subscribeButton = '';
    let whatsappButton = '';

    if (registration) {
        subscribeButton = `
            <button class="btn-event-subscribe subscribed" disabled>
                <span>✓</span> ${registration.status === 'confirmado' ? 'Inscrito' : 'Pendiente'}
            </button>
        `;
        // Add WhatsApp button for pending registrations
        if (registration.status === 'pendiente') {
            const whatsappUrl = getWhatsAppUrl(event);
            if (whatsappUrl) {
                whatsappButton = `
                    <a class="btn-event-whatsapp" href="${whatsappUrl}" target="_blank">
                        <span>💬</span> WhatsApp
                    </a>
                `;
            }
        }
    } else if (isLoggedIn) {
        subscribeButton = `
            <button class="btn-event-subscribe" onclick="subscribeToEvent(${event.id}, event)">
                <span>📝</span> Inscribirse
            </button>
        `;
    } else {
        subscribeButton = `
            <button class="btn-event-subscribe" onclick="window.location.href='/login.html'">
                <span>🔒</span> Inicia sesion
            </button>
        `;
    }

    return `
        <article class="event-card-full">
            <div class="event-card-full-image" onclick="openEventModal(${event.id})" style="cursor:pointer;">
                <img src="${imageUrl}" alt="${escapeHtml(event.title)}" onerror="this.src='/images/placeholder.svg'" loading="lazy">
                <div class="event-card-full-date">
                    <span class="event-card-full-date-day">${dateInfo.day}</span>
                    <span class="event-card-full-date-month">${dateInfo.month}</span>
                </div>
                <div class="event-card-full-price ${isFree ? 'free' : ''}">${formatEventPrice(event.price)}</div>
            </div>
            <div class="event-card-full-body">
                ${event.category_name ? `<span class="event-card-full-category">${escapeHtml(event.category_name)}</span>` : ''}
                <h3 class="event-card-full-title" onclick="openEventModal(${event.id})">${escapeHtml(event.title)}</h3>
                <div class="event-card-full-meta">
                    ${event.location ? `<div class="event-card-full-meta-item"><span>📍</span> ${escapeHtml(event.location)}</div>` : ''}
                    ${event.event_time ? `<div class="event-card-full-meta-item"><span>🕐</span> ${formatEventTime(event.event_time)}</div>` : ''}
                </div>
                <div class="event-card-full-actions">
                    ${subscribeButton}
                    ${whatsappButton}
                    <button class="btn-event-view" onclick="openEventModal(${event.id})">Ver</button>
                </div>
            </div>
        </article>
    `;
}

function renderSkeletons(count = 6) {
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `
            <div class="event-card-skeleton">
                <div class="skeleton-image"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                </div>
            </div>
        `;
    }
    return html;
}

function renderPagination(current, total) {
    const container = document.getElementById('pagination');
    if (!container || total <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';
    html += `<button class="pagination-btn" onclick="loadEvents(${current - 1})" ${current <= 1 ? 'disabled' : ''}>← Anterior</button>`;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="loadEvents(${i})">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
            html += '<span style="color: #6b7280; padding: 0.5rem;">...</span>';
        }
    }

    html += `<button class="pagination-btn" onclick="loadEvents(${current + 1})" ${current >= total ? 'disabled' : ''}>Siguiente →</button>`;
    html += '</div>';

    container.innerHTML = html;
}
