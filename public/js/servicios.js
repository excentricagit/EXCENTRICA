// ===========================================
// SERVICIOS - Modulo de servicios profesionales
// ===========================================

(function() {
    'use strict';

    // Estado
    let currentPage = 1;
    let currentCategory = '';
    let currentZone = '';
    let currentSearch = '';
    let categories = [];
    let featuredServices = [];
    let featuredIndex = 0;
    let featuredInterval = null;

    // Categorias predefinidas para servicios
    const categoryIcons = {
        'electricista': '⚡',
        'plomero': '🔧',
        'gasista': '🔥',
        'albañil': '🧱',
        'pintor': '🎨',
        'carpintero': '🪚',
        'mecanico': '🔩',
        'cerrajero': '🔐',
        'jardinero': '🌿',
        'limpieza': '🧹',
        'mudanza': '📦',
        'abogado': '⚖️',
        'contador': '📊',
        'medico': '🏥',
        'veterinario': '🐾',
        'profesor': '📚',
        'informatica': '💻',
        'fotografo': '📷',
        'diseñador': '🖌️',
        'default': '🔧'
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

    // SVG de WhatsApp
    const whatsappSvg = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    // Obtener link de WhatsApp
    function getWhatsappLink(service) {
        const phone = service.whatsapp || service.phone;
        if (!phone) return '';
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('549') ? cleanPhone : `549${cleanPhone}`;
        return `https://wa.me/${fullPhone}`;
    }

    // Renderizar card de servicio mejorada
    function renderServiceCard(service) {
        const imageUrl = service.image_url || '/assets/placeholder.jpg';
        const hasWeb = service.website;
        const isFeatured = service.featured;
        const whatsappLink = getWhatsappLink(service);

        // Botones de contacto
        let contactBtns = '';
        if (whatsappLink) {
            contactBtns = `<a href="${whatsappLink}" target="_blank" rel="noopener" class="service-contact-btn whatsapp" onclick="event.stopPropagation()">${whatsappSvg} WhatsApp</a>`;
        }
        if (hasWeb) {
            const webUrl = service.website.startsWith('http') ? service.website : `https://${service.website}`;
            contactBtns += `<a href="${webUrl}" target="_blank" rel="noopener" class="service-contact-btn web" onclick="event.stopPropagation()">🌐 Web</a>`;
        }

        return `
            <article class="service-card ${isFeatured ? 'featured' : ''}" onclick="window.location.href='/servicio.html?id=${service.id}'">
                <div class="service-image">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(service.title)}" onerror="Utils.handleImageError(this)">
                    <div class="service-image-overlay"></div>
                    ${service.category_name ? `<span class="service-badge">${Utils.escapeHtml(service.category_name)}</span>` : ''}
                    ${isFeatured ? '<span class="service-featured-badge">⭐ Destacado</span>' : ''}
                </div>
                <div class="service-info">
                    <h3 class="service-title">
                        <a href="/servicio.html?id=${service.id}">${Utils.escapeHtml(service.title)}</a>
                    </h3>
                    ${service.description ? `<p class="service-description">${Utils.escapeHtml(service.description)}</p>` : ''}
                    <div class="service-meta">
                        ${service.zone_name ? `<span>📍 ${Utils.escapeHtml(service.zone_name)}</span>` : ''}
                        ${service.price_from ? `<span class="price">Desde ${Utils.formatPrice(service.price_from)}</span>` : ''}
                    </div>
                    ${contactBtns ? `<div class="service-contact">${contactBtns}</div>` : ''}
                </div>
            </article>
        `;
    }

    // Renderizar card destacada para el hero
    function renderFeaturedCard(service) {
        const imageUrl = service.image_url || '/assets/placeholder.jpg';
        const whatsappLink = getWhatsappLink(service);

        return `
            <div class="service-featured-card" onclick="window.location.href='/servicio.html?id=${service.id}'">
                <div class="service-featured-image">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(service.title)}" onerror="Utils.handleImageError(this)">
                    <div class="service-featured-image-overlay"></div>
                    ${service.category_name ? `<span class="service-featured-category">${Utils.escapeHtml(service.category_name)}</span>` : ''}
                    <span class="service-featured-badge">⭐ Destacado</span>
                </div>
                <div class="service-featured-info">
                    <h3 class="service-featured-name">${Utils.escapeHtml(service.title)}</h3>
                    ${service.description ? `<p class="service-featured-desc">${Utils.escapeHtml(service.description)}</p>` : ''}
                    <div class="service-featured-meta">
                        ${service.zone_name ? `<span>📍 ${Utils.escapeHtml(service.zone_name)}</span>` : ''}
                        ${service.price_from ? `<span class="service-featured-price">Desde ${Utils.formatPrice(service.price_from)}</span>` : ''}
                    </div>
                    <div class="service-featured-actions">
                        ${whatsappLink ? `<a href="${whatsappLink}" target="_blank" rel="noopener" class="btn-featured-whatsapp" onclick="event.stopPropagation()">${whatsappSvg} WhatsApp</a>` : ''}
                        <button class="btn-featured-view" onclick="event.stopPropagation(); window.location.href='/servicio.html?id=${service.id}'">Ver</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizar seccion de destacados
    function renderFeaturedSection() {
        const container = document.getElementById('featured-section');
        if (!container || featuredServices.length === 0) {
            if (container) container.style.display = 'none';
            return;
        }

        container.style.display = 'block';

        // Calcular cuantas paginas de 2 cards hay
        const totalPages = Math.ceil(featuredServices.length / 2);
        const startIdx = (featuredIndex % totalPages) * 2;
        const visibleServices = featuredServices.slice(startIdx, startIdx + 2);

        // Generar dots si hay mas de 2 destacados
        let dotsHtml = '';
        if (totalPages > 1) {
            dotsHtml = '<div class="services-featured-dots">';
            for (let i = 0; i < totalPages; i++) {
                dotsHtml += `<div class="featured-dot ${i === (featuredIndex % totalPages) ? 'active' : ''}" onclick="ServiciosModule.goToFeatured(${i})"></div>`;
            }
            dotsHtml += '</div>';
        }

        container.innerHTML = `
            <div class="services-featured-header">
                <div class="services-featured-title">
                    <span>⭐</span> Servicios Destacados
                </div>
                ${dotsHtml}
            </div>
            <div class="services-featured-grid">
                ${visibleServices.map(s => renderFeaturedCard(s)).join('')}
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
        if (featuredServices.length <= 2) return;
        featuredInterval = setInterval(() => {
            const totalPages = Math.ceil(featuredServices.length / 2);
            featuredIndex = (featuredIndex + 1) % totalPages;
            renderFeaturedSection();
        }, 6000); // Rotar cada 6 segundos
    }

    // Cargar servicios destacados
    async function loadFeaturedServices() {
        try {
            const response = await api.getServices({ featured: true, limit: 10 });
            if (response.success && response.data?.items) {
                featuredServices = response.data.items.filter(s => s.featured);
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
            <button class="service-category-chip ${!currentCategory ? 'active' : ''}" data-category="">
                <span class="chip-icon">🔧</span> Todos
            </button>
        `;

        // Chips visibles
        visibleCategories.forEach(cat => {
            const icon = getCategoryIcon(cat.name);
            html += `
                <button class="service-category-chip ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
                    <span class="chip-icon">${icon}</span> ${Utils.escapeHtml(cat.name)}
                </button>
            `;
        });

        // Dropdown para las demas categorias
        if (hiddenCategories.length > 0) {
            html += `
                <div class="service-category-dropdown">
                    <button class="service-category-chip dropdown-trigger ${selectedInHidden ? 'active' : ''}">
                        <span class="chip-icon">📋</span>
                        ${selectedCategoryName ? Utils.escapeHtml(selectedCategoryName) : 'Más'}
                        <span class="dropdown-arrow">▼</span>
                    </button>
                    <div class="service-category-dropdown-menu">
                        ${hiddenCategories.map(cat => {
                            const icon = getCategoryIcon(cat.name);
                            return `
                                <button class="dropdown-category-item ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
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
        container.querySelectorAll('.service-category-chip:not(.dropdown-trigger)').forEach(chip => {
            chip.addEventListener('click', () => {
                currentCategory = chip.dataset.category;
                loadServices(1);
            });
        });

        // Event listener para dropdown
        const dropdown = container.querySelector('.service-category-dropdown');
        if (dropdown) {
            const trigger = dropdown.querySelector('.dropdown-trigger');
            const menu = dropdown.querySelector('.service-category-dropdown-menu');

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });

            // Items del dropdown
            menu.querySelectorAll('.dropdown-category-item').forEach(item => {
                item.addEventListener('click', () => {
                    currentCategory = item.dataset.category;
                    dropdown.classList.remove('open');
                    loadServices(1);
                });
            });

            // Cerrar dropdown al hacer click afuera
            document.addEventListener('click', () => {
                dropdown.classList.remove('open');
            });
        }
    }

    // Cargar servicios
    async function loadServices(page = 1) {
        currentPage = page;
        const grid = document.getElementById('services-grid');

        // Loading
        grid.innerHTML = '<div class="loading-container" style="grid-column: 1 / -1;"><div class="spinner spinner-lg"></div></div>';

        try {
            const response = await api.getServices({
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
                grid.innerHTML = sortedItems.map(s => renderServiceCard(s)).join('');

                // Actualizar contador
                const countEl = document.getElementById('results-count');
                if (countEl) {
                    countEl.textContent = response.data.pagination.total || items.length;
                }

                // Paginacion
                document.getElementById('pagination').innerHTML = Components.pagination(
                    response.data.pagination.page,
                    response.data.pagination.pages,
                    'ServiciosModule.loadServices'
                );
            } else {
                grid.innerHTML = `
                    <div class="service-empty">
                        <div class="service-empty-icon">🔧</div>
                        <p class="service-empty-text">No hay servicios disponibles</p>
                    </div>
                `;
                document.getElementById('pagination').innerHTML = '';

                const countEl = document.getElementById('results-count');
                if (countEl) countEl.textContent = '0';
            }
        } catch (e) {
            console.error('Error cargando servicios:', e);
            grid.innerHTML = `
                <div class="service-empty">
                    <div class="service-empty-icon">❌</div>
                    <p class="service-empty-text">Error cargando servicios</p>
                </div>
            `;
        }

        // Actualizar URL
        Utils.updateUrl({
            page: page > 1 ? page : null,
            category_id: currentCategory || null,
            zone_id: currentZone || null,
            search: currentSearch || null
        });

        // Actualizar chips activos (re-renderizar para manejar dropdown correctamente)
        renderCategoryChips();
    }

    // Cargar categorias
    async function loadCategories() {
        try {
            const response = await api.getCategories('servicios');
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
                panelButtons += `<a href="/editor/" class="btn btn-block mb-2" style="background: transparent; border: 1px solid #a855f7; color: #e2e8f0;">Panel Editor</a>`;
            }
            if (user.role === 'admin' || user.role === 'publicista') {
                panelButtons += `<a href="/publicista/" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;">Panel Publicista</a>`;
            }
            userWidget.innerHTML = `
                <p style="color: #f1f5f9; font-size: 0.95rem; margin-bottom: 0.5rem;">Hola, ${Utils.escapeHtml(user.name || 'Usuario')}</p>
                <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">${Utils.escapeHtml(user.email)}</p>
                <a href="/perfil.html" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); color: #fff;">Mi Perfil</a>
                ${panelButtons}
                <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
            `;
        }
    }

    // Inicializacion
    async function init() {
        // Leer parametros URL PRIMERO (antes de cargar categorias)
        const params = Utils.getUrlParams();
        if (params.category_id) currentCategory = params.category_id;
        if (params.zone_id) currentZone = params.zone_id;
        if (params.search) currentSearch = params.search;

        // Cargar datos iniciales (incluyendo destacados)
        await Promise.all([
            loadCategories(),
            loadZones(),
            loadFeaturedServices()
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

        // Cargar servicios
        loadServices(parseInt(params.page) || 1);

        // Event listeners
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            const debouncedSearch = Utils.debounce(() => {
                currentSearch = searchInput.value;
                loadServices(1);
            }, 500);
            searchInput.addEventListener('input', debouncedSearch);
        }

        const zoneFilter = document.getElementById('zone-filter');
        if (zoneFilter) {
            zoneFilter.addEventListener('change', () => {
                currentZone = zoneFilter.value;
                loadServices(1);
            });
        }

        // Actualizar widget de usuario
        updateUserWidget();
    }

    // Exponer API publica
    window.ServiciosModule = {
        loadServices: loadServices,
        goToFeatured: goToFeatured,
        init: init
    };

    // Inicializar cuando el DOM este listo
    document.addEventListener('DOMContentLoaded', init);

})();
