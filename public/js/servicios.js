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

    // Renderizar card de servicio mejorada
    function renderServiceCard(service) {
        const imageUrl = service.image_url || '/assets/placeholder.jpg';
        const hasWhatsapp = service.whatsapp;
        const hasPhone = service.phone;
        const hasWeb = service.website;

        // Formatear whatsapp
        let whatsappLink = '';
        if (hasWhatsapp) {
            const phone = service.whatsapp.replace(/\D/g, '');
            whatsappLink = `https://wa.me/${phone}`;
        }

        // Botones de contacto
        let contactBtns = '';
        if (hasWhatsapp) {
            contactBtns += `<a href="${whatsappLink}" target="_blank" rel="noopener" class="service-contact-btn whatsapp" onclick="event.stopPropagation()">💬 WhatsApp</a>`;
        }
        if (hasPhone && !hasWhatsapp) {
            contactBtns += `<a href="tel:${service.phone}" class="service-contact-btn phone" onclick="event.stopPropagation()">📞 Llamar</a>`;
        }
        if (hasWeb) {
            const webUrl = service.website.startsWith('http') ? service.website : `https://${service.website}`;
            contactBtns += `<a href="${webUrl}" target="_blank" rel="noopener" class="service-contact-btn web" onclick="event.stopPropagation()">🌐 Web</a>`;
        }

        return `
            <article class="service-card" onclick="window.location.href='/servicio.html?id=${service.id}'">
                <div class="service-image">
                    <img src="${imageUrl}" alt="${Utils.escapeHtml(service.title)}" onerror="Utils.handleImageError(this)">
                    ${service.category_name ? `<span class="service-badge">${Utils.escapeHtml(service.category_name)}</span>` : ''}
                    ${service.featured ? '<span class="service-featured">⭐ Destacado</span>' : ''}
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

    // Renderizar chips de categorias
    function renderCategoryChips() {
        const container = document.getElementById('category-chips');
        if (!container) return;

        let html = `
            <button class="service-category-chip ${!currentCategory ? 'active' : ''}" data-category="">
                <span class="chip-icon">🔧</span> Todos
            </button>
        `;

        categories.forEach(cat => {
            const icon = getCategoryIcon(cat.name);
            html += `
                <button class="service-category-chip ${currentCategory == cat.id ? 'active' : ''}" data-category="${cat.id}">
                    <span class="chip-icon">${icon}</span> ${Utils.escapeHtml(cat.name)}
                </button>
            `;
        });

        container.innerHTML = html;

        // Event listeners
        container.querySelectorAll('.service-category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                currentCategory = chip.dataset.category;
                loadServices(1);
            });
        });
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
                category: currentCategory,
                zone: currentZone
            });

            const items = response.data?.items || [];

            if (response.success && items.length > 0) {
                grid.innerHTML = items.map(s => renderServiceCard(s)).join('');

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
            category: currentCategory || null,
            zone: currentZone || null,
            search: currentSearch || null
        });

        // Actualizar chips activos
        document.querySelectorAll('.service-category-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === currentCategory);
        });
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
            userWidget.innerHTML = `
                <p style="color: #f1f5f9; font-size: 0.95rem; margin-bottom: 0.5rem;">Hola, ${Utils.escapeHtml(user.name || 'Usuario')}</p>
                <p style="color: #cbd5e1; font-size: 0.8rem; margin-bottom: 0.75rem;">${Utils.escapeHtml(user.email)}</p>
                <a href="/perfil.html" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; box-shadow: 0 0 15px rgba(168, 85, 247, 0.4); color: #fff;">Mi Perfil</a>
                ${user.role === 'admin' || user.role === 'editor' ? '<a href="/editor/" class="btn btn-block mb-2" style="background: transparent; border: 1px solid #a855f7; color: #e2e8f0;">Panel de Editor</a>' : ''}
                <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
            `;
        }
    }

    // Inicializacion
    async function init() {
        // Cargar datos iniciales
        await Promise.all([
            loadCategories(),
            loadZones()
        ]);

        // Leer parametros URL
        const params = Utils.getUrlParams();
        if (params.category) currentCategory = params.category;
        if (params.zone) {
            currentZone = params.zone;
            document.getElementById('zone-filter').value = params.zone;
        }
        if (params.search) {
            currentSearch = params.search;
            document.getElementById('search-input').value = params.search;
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
        init: init
    };

    // Inicializar cuando el DOM este listo
    document.addEventListener('DOMContentLoaded', init);

})();
