// ===========================================
// TURISMO - Modulo de puntos de interes turistico
// ===========================================

(function() {
    'use strict';

    // Estado
    let currentPage = 1;
    let currentCategory = '';
    let currentZone = '';
    let currentSearch = '';
    let categories = [];
    let featuredPOIs = [];
    let featuredIndex = 0;
    let featuredInterval = null;

    // Categorias predefinidas para turismo
    const categoryIcons = {
        'museo': '🏛️',
        'parque': '🌳',
        'plaza': '🏞️',
        'iglesia': '⛪',
        'monumento': '🗿',
        'rio': '🏊',
        'termas': '♨️',
        'laguna': '🌊',
        'reserva': '🦜',
        'cerro': '⛰️',
        'mirador': '🔭',
        'ruinas': '🏚️',
        'historico': '📜',
        'arquitectura': '🏗️',
        'naturaleza': '🌿',
        'aventura': '🧗',
        'cultural': '🎭',
        'religioso': '🕯️',
        'default': '📍'
    };

    // Obtener icono de categoria
    function getCategoryIcon(categoryName) {
        if (!categoryName) return categoryIcons.default;
        const name = categoryName.toLowerCase();
        for (const key in categoryIcons) {
            if (name.includes(key)) return categoryIcons[key];
        }
        return categoryIcons.default;
    }

    // Renderizar card de POI mejorada
    function renderPOICard(poi) {
        const imageUrl = poi.image_url || '/assets/placeholder.jpg';
        const isFeatured = poi.featured;
        const hasLocation = poi.latitude && poi.longitude;

        // Botones de accion
        let actionBtns = `
            <button class="poi-action-btn view" onclick="event.stopPropagation(); TurismoModule.showPOIDetail(${poi.id})">
                <span>👁️</span> Ver detalles
            </button>
        `;

        if (hasLocation) {
            const mapsUrl = `https://www.google.com/maps?q=${poi.latitude},${poi.longitude}`;
            actionBtns += `
                <a href="${mapsUrl}" target="_blank" rel="noopener" class="poi-action-btn map" onclick="event.stopPropagation()">
                    <span>🗺️</span> Mapa
                </a>
            `;
        }

        return `
            <article class="poi-card ${isFeatured ? 'featured' : ''}" onclick="TurismoModule.showPOIDetail(${poi.id})">
                <div class="poi-image">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(poi.name)}" onerror="Utils.handleImageError(this)">
                    <div class="poi-image-overlay"></div>
                    ${poi.category_name ? `<span class="poi-badge">${Utils.escapeHtml(poi.category_name)}</span>` : ''}
                    ${isFeatured ? '<span class="poi-featured-badge">⭐ Destacado</span>' : ''}
                </div>
                <div class="poi-info">
                    <h3 class="poi-title">
                        <span class="poi-title-text">${Utils.escapeHtml(poi.name)}</span>
                    </h3>
                    ${poi.description ? `<p class="poi-description">${Utils.escapeHtml(poi.description)}</p>` : ''}
                    <div class="poi-meta">
                        ${poi.zone_name ? `<span>📍 ${Utils.escapeHtml(poi.zone_name)}</span>` : ''}
                        ${poi.entry_fee ? `<span class="entry-fee">🎫 ${Utils.formatPrice(poi.entry_fee)}</span>` : '<span class="free-entry">🎫 Gratis</span>'}
                    </div>
                    <div class="poi-actions">${actionBtns}</div>
                </div>
            </article>
        `;
    }

    // Renderizar card destacada para el hero
    function renderFeaturedCard(poi) {
        const imageUrl = poi.image_url || '/assets/placeholder.jpg';
        const hasLocation = poi.latitude && poi.longitude;

        return `
            <div class="turismo-featured-card" onclick="TurismoModule.showPOIDetail(${poi.id})">
                <div class="turismo-featured-image">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(poi.name)}" onerror="Utils.handleImageError(this)">
                    <div class="turismo-featured-overlay"></div>
                    ${poi.category_name ? `<span class="turismo-featured-category">${Utils.escapeHtml(poi.category_name)}</span>` : ''}
                    <span class="turismo-featured-badge">⭐ Destacado</span>
                </div>
                <div class="turismo-featured-info">
                    <h3 class="turismo-featured-name">${Utils.escapeHtml(poi.name)}</h3>
                    ${poi.description ? `<p class="turismo-featured-desc">${Utils.escapeHtml(poi.description)}</p>` : ''}
                    <div class="turismo-featured-meta">
                        ${poi.zone_name ? `<span>📍 ${Utils.escapeHtml(poi.zone_name)}</span>` : ''}
                        ${poi.entry_fee ? `<span class="turismo-featured-entry">🎫 ${Utils.formatPrice(poi.entry_fee)}</span>` : '<span class="turismo-featured-entry">🎫 Gratis</span>'}
                    </div>
                    <div class="turismo-featured-actions">
                        <button class="btn-turismo-view" onclick="event.stopPropagation(); TurismoModule.showPOIDetail(${poi.id})">Ver lugar</button>
                        ${hasLocation ? `<a href="https://www.google.com/maps?q=${poi.latitude},${poi.longitude}" target="_blank" rel="noopener" class="btn-turismo-map" onclick="event.stopPropagation()">🗺️</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar seccion de destacados
    function renderFeaturedSection() {
        const container = document.getElementById('featured-section');
        if (!container || featuredPOIs.length === 0) {
            if (container) container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        // Calcular cuantas paginas de 2 cards hay
        const totalPages = Math.ceil(featuredPOIs.length / 2);
        const startIdx = (featuredIndex % totalPages) * 2;
        const visiblePOIs = featuredPOIs.slice(startIdx, startIdx + 2);

        // Generar dots si hay mas de 2 destacados
        let dotsHtml = '';
        if (totalPages > 1) {
            dotsHtml = '<div class="turismo-featured-dots">';
            for (let i = 0; i < totalPages; i++) {
                dotsHtml += `<div class="turismo-featured-dot ${i === (featuredIndex % totalPages) ? 'active' : ''}" onclick="TurismoModule.goToFeatured(${i})"></div>`;
            }
            dotsHtml += '</div>';
        }

        container.innerHTML = `
            <div class="turismo-featured-header">
                <div class="turismo-featured-title">
                    <span>⭐</span> Lugares Destacados
                </div>
                ${dotsHtml}
            </div>
            <div class="turismo-featured-grid">
                ${visiblePOIs.map(p => renderFeaturedCard(p)).join('')}
            </div>
        `;
    }

    // Ir a una pagina especifica de destacados
    function goToFeatured(index) {
        featuredIndex = index;
        renderFeaturedSection();
        // Reiniciar el intervalo
        if (featuredInterval) {
            clearInterval(featuredInterval);
            startFeaturedRotation();
        }
    }

    // Iniciar rotacion automatica
    function startFeaturedRotation() {
        if (featuredPOIs.length <= 2) return;
        featuredInterval = setInterval(() => {
            const totalPages = Math.ceil(featuredPOIs.length / 2);
            featuredIndex = (featuredIndex + 1) % totalPages;
            renderFeaturedSection();
        }, 6000);
    }

    // Cargar POIs destacados
    async function loadFeaturedPOIs() {
        try {
            const response = await api.getPoi({ featured: true, limit: 10 });
            if (response.success && response.data?.items) {
                featuredPOIs = response.data.items.filter(p => p.featured);
                renderFeaturedSection();
                startFeaturedRotation();
            }
        } catch (e) {
            console.error('Error cargando destacados:', e);
        }
    }

    // Renderizar chips de categorias
    function renderCategoryChips() {
        const container = document.getElementById('category-chips');
        if (!container) return;

        const MAX_VISIBLE_CHIPS = 5;
        const visibleCategories = categories.slice(0, MAX_VISIBLE_CHIPS);
        const hiddenCategories = categories.slice(MAX_VISIBLE_CHIPS);

        // Verificar si la categoria seleccionada esta en las ocultas
        const selectedInHidden = hiddenCategories.find(cat => cat.id == currentCategory);
        const selectedCategoryName = selectedInHidden ? selectedInHidden.name : null;

        let html = `
            <button class="turismo-category-chip ${!currentCategory ? 'active' : ''}" data-category="">
                <span class="chip-icon">📍</span> Todos
            </button>
        `;

        // Chips visibles
        visibleCategories.forEach(cat => {
            const icon = getCategoryIcon(cat.name);
            html += `
                <button class="turismo-category-chip ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
                    <span class="chip-icon">${icon}</span> ${Utils.escapeHtml(cat.name)}
                </button>
            `;
        });

        // Dropdown para las demas categorias
        if (hiddenCategories.length > 0) {
            html += `
                <div class="turismo-category-dropdown">
                    <button class="turismo-category-chip dropdown-trigger ${selectedInHidden ? 'active' : ''}">
                        <span class="chip-icon">📋</span>
                        ${selectedCategoryName ? Utils.escapeHtml(selectedCategoryName) : 'Mas'}
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="turismo-category-dropdown-menu">
                        ${hiddenCategories.map(cat => {
                            const icon = getCategoryIcon(cat.name);
                            return `
                                <button class="turismo-dropdown-item ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
                                    <span class="chip-icon">${icon}</span> ${Utils.escapeHtml(cat.name)}
                                </button>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;

        // Event listeners para chips
        container.querySelectorAll('.turismo-category-chip:not(.dropdown-trigger)').forEach(chip => {
            chip.addEventListener('click', () => {
                currentCategory = chip.dataset.category;
                loadPOIs(1);
            });
        });

        // Event listener para dropdown
        const dropdown = container.querySelector('.turismo-category-dropdown');
        if (dropdown) {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.turismo-category-dropdown-menu');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // Items del dropdown
            menu.querySelectorAll('.turismo-dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentCategory = item.dataset.category;
                    dropdown.classList.remove('open');
                    loadPOIs(1);
                });
            });

            // Cerrar dropdown al hacer click afuera
            document.addEventListener('click', () => {
                dropdown.classList.remove('open');
            });
        }
    }

    // Cargar puntos de interes
    async function loadPOIs(page = 1) {
        currentPage = page;
        const grid = document.getElementById('poi-grid');

        // Loading
        grid.innerHTML = '<div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner spinner-lg"></div></div>';

        try {
            const response = await api.getPoi({
                page,
                limit: 12,
                search: currentSearch,
                category_id: currentCategory,
                zone_id: currentZone
            });

            const items = response.data?.items || [];

            if (response.success && items.length > 0) {
                // Ordenar: destacados primero
                const sortedItems = [...items].sort((a, b) => {
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return 0;
                });
                grid.innerHTML = sortedItems.map(p => renderPOICard(p)).join('');

                // Actualizar contador
                const countEl = document.getElementById('results-count');
                if (countEl) {
                    countEl.textContent = response.data.pagination.total || items.length;
                }

                // Paginacion
                document.getElementById('pagination').innerHTML = Components.pagination(
                    response.data.pagination.page,
                    response.data.pagination.pages,
                    'TurismoModule.loadPOIs'
                );
            } else {
                grid.innerHTML = `
                    <div class="turismo-empty">
                        <div class="turismo-empty-icon">📍</div>
                        <p class="turismo-empty-text">No hay lugares disponibles</p>
                    </div>
                `;
                document.getElementById('pagination').innerHTML = '';

                const countEl = document.getElementById('results-count');
                if (countEl) countEl.textContent = '0';
            }
        } catch (e) {
            console.error('Error cargando puntos de interes:', e);
            grid.innerHTML = `
                <div class="turismo-empty">
                    <div class="turismo-empty-icon">❌</div>
                    <p class="turismo-empty-text">Error cargando lugares</p>
                </div>
            `;
        }

        // Actualizar URL
        Utils.updateUrl({
            page: page > 1 ? page : null,
            category: currentCategory || null,
            zone: currentZone || null,
            search: currentSearch || null
        });

        // Actualizar chips activos
        renderCategoryChips();
    }

    // Cargar categorias
    async function loadCategories() {
        try {
            const response = await api.getCategories('puntos-interes');
            if (response.success && response.data) {
                categories = response.data;
                renderCategoryChips();
            }
        } catch (e) {
            console.error('Error cargando categorias:', e);
        }
    }

    // Cargar zonas
    async function loadZones() {
        try {
            const response = await api.getZones();
            if (response.success && response.data) {
                const select = document.getElementById('zone-filter');
                if (select) {
                    response.data.forEach(zone => {
                        const option = document.createElement('option');
                        option.value = zone.id;
                        option.textContent = zone.name;
                        select.appendChild(option);
                    });
                }
            }
        } catch (e) {
            console.error('Error cargando zonas:', e);
        }
    }

    // Actualizar widget de usuario
    function updateUserWidget() {
        const user = auth.getUser();
        const userWidget = document.getElementById('user-widget-content');
        if (user && userWidget) {
            let panelButtons = '';
            if (user.role === 'admin') {
                panelButtons += `<a href="/admin/" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: #fff;">Panel Admin</a>`;
            }
            if (user.role === 'admin' || user.role === 'editor' || user.role === 'periodista') {
                panelButtons += `<a href="/editor/" class="btn btn-block mb-2" style="background: transparent; border: 1px solid #10b981; color: #e2e8f0;">Panel Editor</a>`;
            }
            if (user.role === 'admin' || user.role === 'publicista') {
                panelButtons += `<a href="/publicista/" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;">Panel Publicista</a>`;
            }
            userWidget.innerHTML = `
                <p style="color: #f1f5f9; font-size: 0.95rem; margin-bottom: 0.5rem;">Hola, ${Utils.escapeHtml(user.name || 'Usuario')}</p>
                <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">${Utils.escapeHtml(user.email)}</p>
                <a href="/perfil.html" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #10b981, #059669); border: none; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); color: #fff;">Mi Perfil</a>
                ${panelButtons}
                <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
            `;
        }
    }

    // Mostrar detalle de POI en modal
    async function showPOIDetail(poiId) {
        // Crear modal si no existe
        let modal = document.getElementById('poi-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'poi-modal';
            modal.className = 'poi-modal';
            document.body.appendChild(modal);
        }

        // Mostrar loading
        modal.innerHTML = `
            <div class="poi-modal-overlay" onclick="TurismoModule.closeModal()"></div>
            <div class="poi-modal-content">
                <div class="poi-modal-loading">
                    <div class="spinner spinner-lg"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        `;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        try {
            const response = await api.getPoiById(poiId);
            if (!response.success || !response.data) {
                throw new Error('POI no encontrado');
            }

            const poi = response.data;
            const imageUrl = poi.image_url || '/assets/placeholder.jpg';
            const hasLocation = poi.latitude && poi.longitude;

            // Generar botones de accion
            let actionButtons = '';
            if (hasLocation) {
                actionButtons += `
                    <a href="https://www.google.com/maps?q=${poi.latitude},${poi.longitude}" target="_blank" rel="noopener" class="poi-modal-action-btn map">
                        <span>🗺️</span> Ver en Mapa
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}" target="_blank" rel="noopener" class="poi-modal-action-btn directions">
                        <span>🧭</span> Como llegar
                    </a>
                `;
            }
            if (poi.phone) {
                actionButtons += `
                    <a href="tel:${poi.phone}" class="poi-modal-action-btn phone">
                        <span>📞</span> Llamar
                    </a>
                `;
            }
            if (poi.website) {
                actionButtons += `
                    <a href="${poi.website}" target="_blank" rel="noopener" class="poi-modal-action-btn website">
                        <span>🌐</span> Sitio Web
                    </a>
                `;
            }

            modal.innerHTML = `
                <div class="poi-modal-overlay" onclick="TurismoModule.closeModal()"></div>
                <div class="poi-modal-content">
                    <button class="poi-modal-close" onclick="TurismoModule.closeModal()">✕</button>

                    <div class="poi-modal-header">
                        <div class="poi-modal-image">
                            <img src="${imageUrl}" alt="${Utils.escapeHtml(poi.name)}" onerror="Utils.handleImageError(this)">
                            ${poi.category_name ? `<span class="poi-modal-category">${Utils.escapeHtml(poi.category_name)}</span>` : ''}
                            ${poi.featured ? '<span class="poi-modal-featured">⭐ Destacado</span>' : ''}
                        </div>
                    </div>

                    <div class="poi-modal-body">
                        <h2 class="poi-modal-title">${Utils.escapeHtml(poi.name)}</h2>

                        <div class="poi-modal-meta">
                            ${poi.zone_name ? `<span class="poi-modal-meta-item"><span class="icon">📍</span> ${Utils.escapeHtml(poi.zone_name)}</span>` : ''}
                            ${poi.entry_fee ? `<span class="poi-modal-meta-item entry-fee"><span class="icon">🎫</span> ${Utils.formatPrice(poi.entry_fee)}</span>` : '<span class="poi-modal-meta-item free-entry"><span class="icon">🎫</span> Entrada Gratuita</span>'}
                        </div>

                        ${poi.address ? `<p class="poi-modal-address"><span class="icon">🏠</span> ${Utils.escapeHtml(poi.address)}</p>` : ''}

                        ${poi.schedule ? `<p class="poi-modal-schedule"><span class="icon">🕐</span> ${Utils.escapeHtml(poi.schedule)}</p>` : ''}

                        ${poi.description ? `
                            <div class="poi-modal-description">
                                <h3>Descripcion</h3>
                                <p>${Utils.escapeHtml(poi.description)}</p>
                            </div>
                        ` : ''}

                        ${actionButtons ? `
                            <div class="poi-modal-actions">
                                ${actionButtons}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (e) {
            console.error('Error cargando POI:', e);
            modal.innerHTML = `
                <div class="poi-modal-overlay" onclick="TurismoModule.closeModal()"></div>
                <div class="poi-modal-content">
                    <button class="poi-modal-close" onclick="TurismoModule.closeModal()">✕</button>
                    <div class="poi-modal-error">
                        <span class="error-icon">❌</span>
                        <p>Error cargando informacion del lugar</p>
                        <button class="btn-retry" onclick="TurismoModule.showPOIDetail(${poiId})">Reintentar</button>
                    </div>
                </div>
            `;
        }
    }

    // Cerrar modal
    function closeModal() {
        const modal = document.getElementById('poi-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Inicializacion
    async function init() {
        // Leer parametros URL PRIMERO
        const params = Utils.getUrlParams();
        if (params.category) currentCategory = params.category;
        if (params.zone) currentZone = params.zone;
        if (params.search) currentSearch = params.search;

        // Cargar datos iniciales (incluyendo destacados)
        await Promise.all([
            loadCategories(),
            loadZones(),
            loadFeaturedPOIs()
        ]);

        // Actualizar campos de formulario con valores de URL
        if (currentZone) {
            const zoneFilter = document.getElementById('zone-filter');
            if (zoneFilter) zoneFilter.value = currentZone;
        }
        if (currentSearch) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = currentSearch;
        }

        // Cargar POIs
        loadPOIs(parseInt(params.page) || 1);

        // Event listeners
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                currentSearch = searchInput.value;
                loadPOIs(1);
            }, 500);
            searchInput.addEventListener('input', debouncedSearch);
        }

        const zoneFilter = document.getElementById('zone-filter');
        if (zoneFilter) {
            zoneFilter.addEventListener('change', () => {
                currentZone = zoneFilter.value;
                loadPOIs(1);
            });
        }

        // Actualizar widget de usuario
        updateUserWidget();
    }

    // Exponer API publica
    window.TurismoModule = {
        loadPOIs: loadPOIs,
        goToFeatured: goToFeatured,
        showPOIDetail: showPOIDetail,
        closeModal: closeModal,
        init: init
    };

    // Inicializar cuando el DOM este listo
    document.addEventListener('DOMContentLoaded', init);

})();
