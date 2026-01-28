// =============================================
// EXCENTRICA - Alojamiento Page JavaScript
// Professional Design
// =============================================

let currentPage = 1;
let currentCategory = '';
let currentZone = '';
let currentSearch = '';
let currentView = 'grid';

// Tipos de alojamiento predefinidos
const ALOJA_TYPES = [
    { slug: 'hotel', name: 'Hotel', icon: '🏨' },
    { slug: 'apart-hotel', name: 'Apart Hotel', icon: '🏢' },
    { slug: 'hostel', name: 'Hostel', icon: '🛏️' },
    { slug: 'cabanas', name: 'Cabanas', icon: '🏡' },
    { slug: 'departamento', name: 'Departamento', icon: '🏠' },
    { slug: 'residencial', name: 'Residencial', icon: '🏘️' },
    { slug: 'bed-breakfast', name: 'B&B', icon: '🛋️' },
    { slug: 'motel', name: 'Motel', icon: '🅿️' },
    { slug: 'camping', name: 'Camping', icon: '⛺' },
    { slug: 'estancia', name: 'Estancia', icon: '🌾' }
];

function getTypeLabel(slug) {
    const type = ALOJA_TYPES.find(t => t.slug === slug);
    return type ? `${type.icon} ${type.name}` : slug;
}

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Render stars
function renderStars(stars) {
    const num = parseInt(stars) || 0;
    let html = '';
    for (let i = 0; i < 5; i++) {
        html += i < num ? '★' : '☆';
    }
    return html;
}

// Render accommodation card
function renderAccommodationCard(accommodation) {
    const imageUrl = accommodation.image_url || '/images/placeholder.svg';

    // Amenities
    const amenities = [];
    if (accommodation.has_wifi) amenities.push({ icon: '📶', label: 'WiFi' });
    if (accommodation.has_parking) amenities.push({ icon: '🅿️', label: 'Parking' });
    if (accommodation.has_pool) amenities.push({ icon: '🏊', label: 'Piscina' });
    if (accommodation.has_breakfast) amenities.push({ icon: '🍳', label: 'Desayuno' });
    if (accommodation.has_ac) amenities.push({ icon: '❄️', label: 'A/C' });

    // Action buttons
    let actionButtons = '';

    // Website button (primary if exists)
    if (accommodation.website) {
        actionButtons += `
            <a href="${escapeHtml(accommodation.website)}" target="_blank" rel="noopener noreferrer" class="aloja-card-btn aloja-card-btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Reservar
            </a>
        `;
    }

    // WhatsApp button (if phone exists)
    if (accommodation.phone) {
        const phoneClean = accommodation.phone.replace(/\D/g, '');
        actionButtons += `
            <a href="https://wa.me/54${phoneClean}" target="_blank" rel="noopener noreferrer" class="aloja-card-btn aloja-card-btn-whatsapp">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
            </a>
        `;
    }

    // Details button
    actionButtons += `
        <a href="/alojamiento-detalle.html?id=${accommodation.id}" class="aloja-card-btn aloja-card-btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Ver mas
        </a>
    `;

    // Price display
    let priceHtml = '';
    if (accommodation.price_from) {
        priceHtml = `
            <div class="aloja-card-price">
                <span class="aloja-card-price-value">$${accommodation.price_from.toLocaleString()}</span>
                <span class="aloja-card-price-label">/ noche</span>
            </div>
        `;
    }

    return `
        <article class="aloja-card">
            <div class="aloja-card-image-container">
                <img src="${imageUrl}" alt="${escapeHtml(accommodation.name)}" class="aloja-card-image" onerror="this.src='/images/placeholder.svg'">
                <div class="aloja-card-overlay"></div>
                ${accommodation.accommodation_type ? `<span class="aloja-card-badge">${getTypeLabel(accommodation.accommodation_type)}</span>` : ''}
                ${accommodation.featured ? '<span class="aloja-card-featured">⭐ Destacado</span>' : ''}
                ${accommodation.stars ? `<span class="aloja-card-stars">${renderStars(accommodation.stars)}</span>` : ''}
            </div>
            <div class="aloja-card-body">
                <h3 class="aloja-card-title">
                    <a href="/alojamiento-detalle.html?id=${accommodation.id}">${escapeHtml(accommodation.name)}</a>
                </h3>
                ${priceHtml}
                <div class="aloja-card-meta">
                    ${accommodation.zone_name ? `
                        <span class="aloja-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            ${escapeHtml(accommodation.zone_name)}
                        </span>
                    ` : ''}
                    ${accommodation.phone ? `
                        <span class="aloja-card-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            ${escapeHtml(accommodation.phone)}
                        </span>
                    ` : ''}
                </div>
                ${amenities.length > 0 ? `
                    <div class="aloja-card-amenities">
                        ${amenities.slice(0, 4).map(a => `<span class="aloja-card-amenity">${a.icon} ${a.label}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="aloja-card-actions">
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

// Render category chips
function renderCategoryChips() {
    const chipsContainer = document.getElementById('category-chips');
    const currentCategoryParam = new URLSearchParams(window.location.search).get('category') || '';
    currentCategory = currentCategoryParam;

    chipsContainer.innerHTML = `
        <button class="aloja-category-chip ${!currentCategory ? 'active' : ''}" data-category="">
            <span class="chip-icon">🏨</span> Todos
        </button>
        ${ALOJA_TYPES.map(type => `
            <button class="aloja-category-chip ${currentCategory === type.slug ? 'active' : ''}" data-category="${type.slug}">
                <span class="chip-icon">${type.icon}</span> ${type.name}
            </button>
        `).join('')}
    `;

    // Add click handlers
    chipsContainer.querySelectorAll('.aloja-category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            currentCategory = chip.dataset.category;
            chipsContainer.querySelectorAll('.aloja-category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            updateWidgetActive();
            loadAccommodations(1);
        });
    });

    // Also populate sidebar widget
    const widgetContainer = document.getElementById('categories-widget');
    if (widgetContainer) {
        widgetContainer.innerHTML = `
            <a href="#" class="widget-item ${!currentCategory ? 'active' : ''}" data-category="">
                <span>🏨</span>
                <span>Todos</span>
            </a>
            ${ALOJA_TYPES.map(type => `
                <a href="#" class="widget-item ${currentCategory === type.slug ? 'active' : ''}" data-category="${type.slug}">
                    <span>${type.icon}</span>
                    <span>${type.name}</span>
                </a>
            `).join('')}
        `;

        widgetContainer.querySelectorAll('.widget-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                currentCategory = item.dataset.category;
                // Update chips
                chipsContainer.querySelectorAll('.aloja-category-chip').forEach(c => {
                    c.classList.toggle('active', c.dataset.category === currentCategory);
                });
                updateWidgetActive();
                loadAccommodations(1);
            });
        });
    }
}

function updateWidgetActive() {
    const widgetContainer = document.getElementById('categories-widget');
    if (widgetContainer) {
        widgetContainer.querySelectorAll('.widget-item').forEach(w => {
            w.classList.toggle('active', w.dataset.category === currentCategory);
        });
    }
}

// Load accommodations
async function loadAccommodations(page = 1) {
    currentPage = page;
    const search = document.getElementById('search-input')?.value || '';
    const zone = document.getElementById('zone-filter')?.value || '';
    const container = document.getElementById('accommodation-grid');

    showLoading(container);

    try {
        const response = await api.getAccommodations({
            page,
            limit: 12,
            search,
            accommodation_type: currentCategory,
            zone_id: zone
        });

        const items = response.data?.items || [];
        const total = response.data?.pagination?.total || 0;

        // Update results count
        document.getElementById('results-count').textContent = total;

        if (response.success && items.length > 0) {
            container.innerHTML = items.map(a => renderAccommodationCard(a)).join('');

            // Render pagination
            const pagination = response.data.pagination;
            if (pagination && pagination.pages > 1) {
                renderPagination(pagination.page, pagination.pages);
            } else {
                document.getElementById('pagination').innerHTML = '';
            }
        } else {
            showEmpty(container, 'No se encontraron alojamientos', '🏨');
            document.getElementById('pagination').innerHTML = '';
        }
    } catch (e) {
        console.error('Error loading accommodations:', e);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ef4444;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="margin-bottom: 0.5rem;">Error cargando alojamientos</h3>
                <p>Por favor, intenta de nuevo mas tarde.</p>
            </div>
        `;
    }

    // Update URL params
    Utils.updateUrl({
        page: page > 1 ? page : null,
        category: currentCategory || null,
        zone: zone || null,
        search: search || null
    });
}

// Render pagination
function renderPagination(current, total) {
    if (total <= 1) {
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';
    html += `<button class="pagination-btn" onclick="loadAccommodations(${current - 1})" ${current <= 1 ? 'disabled' : ''}>← Anterior</button>`;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="loadAccommodations(${i})">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
            html += '<span style="color: #6b7280; padding: 0.5rem;">...</span>';
        }
    }

    html += `<button class="pagination-btn" onclick="loadAccommodations(${current + 1})" ${current >= total ? 'disabled' : ''}>Siguiente →</button>`;
    html += '</div>';

    document.getElementById('pagination').innerHTML = html;
}

// Toggle view (grid/list)
function toggleView(view) {
    currentView = view;
    const grid = document.getElementById('accommodation-grid');
    const btns = document.querySelectorAll('.aloja-view-btn');

    btns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));

    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// Update user widget
function updateUserWidget() {
    const user = auth.getUser();
    const widget = document.getElementById('user-widget-content');

    if (user && widget) {
        let panelButton = '';
        if (user.role === 'admin' || user.role === 'editor' || user.role === 'periodista') {
            panelButton = `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">📝 Panel Editor</button>`;
        }

        widget.innerHTML = `
            <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.75rem; text-align: center;">Hola, ${escapeHtml(user.name ? user.name.split(' ')[0] : user.email)}</p>
            <button class="btn btn-block mb-2" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #e2e8f0;" onclick="window.location.href='/perfil.html'">👤 Mi Perfil</button>
            ${panelButton}
            <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
        `;
    }
}

// Debounced search
const debouncedSearch = Utils.debounce(() => loadAccommodations(1), 500);

// Load zones for filter
async function loadZones() {
    try {
        const response = await api.getZones();
        const zoneFilter = document.getElementById('zone-filter');
        if (response.success && zoneFilter) {
            const zones = response.data || [];
            zones.forEach(zone => {
                const option = document.createElement('option');
                option.value = zone.id;
                option.textContent = zone.name;
                zoneFilter.appendChild(option);
            });
        }
    } catch (e) {
        console.error('Error loading zones:', e);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Render category chips
    renderCategoryChips();

    // Load zones for filter
    await loadZones();

    // Read URL params
    const params = Utils.getUrlParams();
    if (params.category) currentCategory = params.category;
    if (params.zone) document.getElementById('zone-filter').value = params.zone;
    if (params.search) document.getElementById('search-input').value = params.search;

    // Load data
    loadAccommodations(parseInt(params.page) || 1);

    // Update user widget
    updateUserWidget();

    // Event listeners
    document.getElementById('search-input')?.addEventListener('input', debouncedSearch);
    document.getElementById('zone-filter')?.addEventListener('change', () => loadAccommodations(1));

    // View toggle
    document.querySelectorAll('.aloja-view-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleView(btn.dataset.view));
    });
});

// Mobile menu toggle
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.sidebar-nav').classList.toggle('active');
});
