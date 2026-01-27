// =============================================
// EXCENTRICA - Gastronomia Page JavaScript
// =============================================

let currentPage = 1;

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Render gastronomy card - Interactive with website button
function renderGastronomyCard(restaurant) {
    const imageUrl = restaurant.image_url || '/images/placeholder.svg';

    // Price range visual
    const priceLevel = (restaurant.price_range || '').length;
    let priceDisplay = '';
    if (priceLevel > 0) {
        for (let i = 0; i < 4; i++) {
            priceDisplay += `<span class="${i < priceLevel ? 'active' : 'inactive'}">$</span>`;
        }
    }

    // Services
    const services = [];
    if (restaurant.has_delivery) services.push({ icon: '🛵', label: 'Delivery' });
    if (restaurant.has_takeaway) services.push({ icon: '🥡', label: 'Takeaway' });

    // Action buttons
    let actionButtons = '';

    // Website button (primary if exists)
    if (restaurant.website) {
        actionButtons += `
            <a href="${escapeHtml(restaurant.website)}" target="_blank" rel="noopener noreferrer" class="gastro-card-btn gastro-card-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Visitar Web
            </a>
        `;
    }

    // WhatsApp button (if phone exists)
    if (restaurant.phone) {
        const phoneClean = restaurant.phone.replace(/\D/g, '');
        actionButtons += `
            <a href="https://wa.me/54${phoneClean}" target="_blank" rel="noopener noreferrer" class="gastro-card-btn gastro-card-btn-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
            </a>
        `;
    }

    // Details button
    actionButtons += `
        <a href="/restaurante.html?id=${restaurant.id}" class="gastro-card-btn gastro-card-btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Ver mas
        </a>
    `;

    return `
        <article class="gastro-card">
            <div class="gastro-card-image-container">
                <img src="${imageUrl}" alt="${escapeHtml(restaurant.name)}" class="gastro-card-image" onerror="this.src='/images/placeholder.svg'">
                <div class="gastro-card-overlay"></div>
                ${restaurant.category_name ? `<span class="gastro-card-badge">${escapeHtml(restaurant.category_name)}</span>` : ''}
                ${restaurant.featured ? '<span class="gastro-card-featured">⭐ Destacado</span>' : ''}
            </div>
            <div class="gastro-card-body">
                <h3 class="gastro-card-title">
                    <a href="/restaurante.html?id=${restaurant.id}">${escapeHtml(restaurant.name)}</a>
                </h3>
                ${restaurant.specialties ? `<p class="gastro-card-specialties">${escapeHtml(restaurant.specialties)}</p>` : ''}
                <div class="gastro-card-meta">
                    ${restaurant.zone_name ? `
                        <span class="gastro-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${escapeHtml(restaurant.zone_name)}
                        </span>
                    ` : ''}
                    ${priceDisplay ? `<span class="gastro-card-meta-item gastro-card-price-range">${priceDisplay}</span>` : ''}
                    ${restaurant.phone ? `
                        <span class="gastro-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            ${escapeHtml(restaurant.phone)}
                        </span>
                    ` : ''}
                </div>
                ${services.length > 0 ? `
                    <div class="gastro-card-services">
                        ${services.map(s => `<span class="gastro-card-service">${s.icon} ${s.label}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="gastro-card-actions">
                    ${actionButtons}
                </div>
            </div>
        </article>
    `;
}

// Show empty state
function showEmpty(container, message, icon) {
    container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">${icon}</div>
            <p class="empty-state-title">${message}</p>
        </div>
    `;
}

// Show loading
function showLoading(container) {
    container.innerHTML = `
        <div class="loading-container" style="grid-column: 1 / -1;">
            <div class="spinner spinner-lg"></div>
        </div>
    `;
}

// Show error
function showError(container, message) {
    container.innerHTML = `
        <div class="alert alert-danger" style="grid-column: 1 / -1;">
            <strong>Error:</strong> ${escapeHtml(message)}
        </div>
    `;
}

// Load gastronomy data
async function loadGastronomy(page = 1) {
    currentPage = page;
    const search = document.getElementById('search-input').value;
    const category = document.getElementById('category-filter').value;
    const zone = document.getElementById('zone-filter').value;
    const container = document.getElementById('gastronomy-grid');

    showLoading(container);

    try {
        const response = await api.getGastronomy({ page, limit: 12, search, category, zone });

        const items = response.data?.items || [];
        if (response.success && items.length > 0) {
            container.innerHTML = items.map(g => renderGastronomyCard(g)).join('');

            // Render pagination
            const pagination = response.data.pagination;
            if (pagination && pagination.pages > 1) {
                document.getElementById('pagination').innerHTML = Components.pagination(
                    pagination.page,
                    pagination.pages,
                    'loadGastronomy'
                );
            } else {
                document.getElementById('pagination').innerHTML = '';
            }
        } else {
            showEmpty(container, 'No hay restaurantes disponibles', '🍽️');
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (e) {
        console.error('Error loading gastronomy:', e);
        showError(container, 'Error cargando restaurantes');
    }

    // Update URL params
    Utils.updateUrl({
        page: page > 1 ? page : null,
        category: category || null,
        zone: zone || null,
        search: search || null
    });
}

// Debounced search
const debouncedSearch = Utils.debounce(() => loadGastronomy(1), 500);

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Load user widget
    const user = auth.getUser();
    const userWidget = document.getElementById('user-widget-content');

    if (user && userWidget) {
        let panelButton = '';
        if (user.role === 'admin' || user.role === 'editor' || user.role === 'periodista') {
            panelButton = `<a href="/editor/" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); color: #fff;">Panel de Editor</a>`;
        }

        userWidget.innerHTML = `
            <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.5rem;">Hola, ${Utils.escapeHtml(user.name ? user.name.split(' ')[0] : 'Usuario')}</p>
            <p style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 0.75rem;">${Utils.escapeHtml(user.email)}</p>
            ${panelButton}
            <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
        `;
    }

    // Load filter options
    await Promise.all([
        App.loadCategories('category-filter', 'gastronomia'),
        App.loadZones('zone-filter')
    ]);

    // Apply URL params to filters
    const params = Utils.getUrlParams();
    if (params.category) document.getElementById('category-filter').value = params.category;
    if (params.zone) document.getElementById('zone-filter').value = params.zone;
    if (params.search) document.getElementById('search-input').value = params.search;

    // Load data
    loadGastronomy(parseInt(params.page) || 1);

    // Event listeners
    document.getElementById('search-input').addEventListener('input', debouncedSearch);
    document.getElementById('category-filter').addEventListener('change', () => loadGastronomy(1));
    document.getElementById('zone-filter').addEventListener('change', () => loadGastronomy(1));
});

// Mobile menu toggle
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.sidebar-nav').classList.toggle('active');
});
