// EXCENTRICA - Aplicación Principal

const App = {
    // Inicializar aplicación
    init() {
        this.initNavigation();
        this.initUserMenu();
        this.initLikeButtons();
        this.initDropdowns();
    },

    // Inicializar navegación móvil
    initNavigation() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('.main-nav');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', () => {
                mainNav.classList.toggle('active');
                menuToggle.classList.toggle('active');
            });

            // Cerrar al hacer clic en un enlace
            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mainNav.classList.remove('active');
                    menuToggle.classList.remove('active');
                });
            });
        }
    },

    // Inicializar menú de usuario
    initUserMenu() {
        const userMenu = document.querySelector('.user-menu');
        const authButtons = document.querySelector('.auth-buttons');
        const userDropdown = document.querySelector('.user-dropdown');
        const widgetUser = document.querySelector('.widget-user');

        if (auth.isAuthenticated()) {
            const user = auth.getUser();

            // Mostrar menú de usuario en header
            if (userMenu) {
                // Determinar panel según rol
                let panelLink = '';
                let panelLabel = '';
                switch(user.role) {
                    case 'admin':
                        panelLink = '/admin/';
                        panelLabel = '⚙️ Panel Admin';
                        break;
                    case 'editor':
                    case 'reporter':
                    case 'periodista':
                        panelLink = '/editor/';
                        panelLabel = '📝 Panel Editor';
                        break;
                    case 'merchant':
                    case 'comerciante':
                        panelLink = '/comerciante/';
                        panelLabel = '🏪 Mi Negocio';
                        break;
                    case 'publicista':
                        panelLink = '/publicista/';
                        panelLabel = '📺 Mis Anuncios';
                        break;
                }

                userMenu.innerHTML = `
                    <div class="dropdown">
                        <button class="user-avatar-btn" onclick="this.parentElement.classList.toggle('active')">
                            <img src="${user.avatar_url || CONFIG.PLACEHOLDER_AVATAR}" alt="${user.name}" class="avatar avatar-sm">
                            <span class="hide-mobile">${user.name}</span>
                        </button>
                        <div class="dropdown-menu">
                            <a href="/perfil.html" class="dropdown-item">👤 Mi Perfil</a>
                            ${panelLink ? `<a href="${panelLink}" class="dropdown-item">${panelLabel}</a>` : ''}
                            <div class="dropdown-divider"></div>
                            <a href="#" class="dropdown-item" onclick="auth.logout(); return false;">🚪 Cerrar Sesión</a>
                        </div>
                    </div>
                `;
            }

            // Actualizar widget de usuario en sidebar (si existe)
            if (widgetUser) {
                // Determinar panel según rol
                let panelButton = '';
                switch(user.role) {
                    case 'admin':
                        panelButton = `
                            <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/admin/'">
                                ⚙️ Panel Admin
                            </button>
                        `;
                        break;
                    case 'editor':
                    case 'reporter':
                    case 'periodista':
                        panelButton = `
                            <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/editor/'">
                                📝 Panel Editor
                            </button>
                        `;
                        break;
                    case 'merchant':
                    case 'comerciante':
                        panelButton = `
                            <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/comerciante/'">
                                🏪 Mi Negocio
                            </button>
                        `;
                        break;
                    case 'publicista':
                        panelButton = `
                            <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/publicista/'">
                                📺 Mis Anuncios
                            </button>
                        `;
                        break;
                }

                widgetUser.innerHTML = `
                    <div class="widget-icon">👤</div>
                    <h3 class="widget-title">Hola, ${user.name.split(' ')[0]}</h3>
                    <p class="widget-text">${user.email}</p>
                    ${panelButton}
                    <button class="btn btn-outline btn-block" onclick="auth.logout()">
                        🚪 Cerrar Sesión
                    </button>
                `;
            }

            // Ocultar botones de auth
            if (authButtons) authButtons.style.display = 'none';
        } else {
            // Mostrar botones de login/registro en header
            if (userMenu) {
                userMenu.innerHTML = `
                    <a href="/login.html" class="btn btn-outline btn-sm">Ingresar</a>
                    <a href="/registro.html" class="btn btn-primary btn-sm hide-mobile">Registrarse</a>
                `;
            }

            // Mostrar botones de login en widget (si existe)
            if (widgetUser) {
                widgetUser.innerHTML = `
                    <div class="widget-icon">👤</div>
                    <h3 class="widget-title">Únete a Excentrica</h3>
                    <p class="widget-text">Iniciá sesión para dar likes y guardar favoritos.</p>
                    <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/login.html'">Iniciar Sesión</button>
                    <button class="btn btn-outline btn-block" onclick="window.location.href='/registro.html'">Crear Cuenta</button>
                `;
            }
        }
    },

    // Inicializar botones de like
    initLikeButtons() {
        document.addEventListener('click', async (e) => {
            const likeBtn = e.target.closest('[data-like]');
            if (!likeBtn) return;

            if (!auth.isAuthenticated()) {
                Components.toast('Debes iniciar sesión para dar like', 'warning');
                return;
            }

            const contentType = likeBtn.dataset.like;
            const contentId = likeBtn.dataset.id;

            try {
                const response = await api.toggleLike(contentType, contentId);
                if (response.success) {
                    likeBtn.classList.toggle('liked', response.data.liked);

                    // Actualizar contador si existe
                    const countSpan = likeBtn.querySelector('span') || likeBtn;
                    const icon = contentType === 'product' ? '❤️' : '❤️';
                    countSpan.textContent = `${icon} ${response.data.like_count}`;
                }
            } catch (error) {
                Components.toast('Error al procesar like', 'danger');
            }
        });
    },

    // Inicializar dropdowns
    initDropdowns() {
        document.addEventListener('click', (e) => {
            // Cerrar todos los dropdowns si se hace clic fuera
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown.active').forEach(d => {
                    d.classList.remove('active');
                });
            }
        });
    },

    // Cargar categorías en un select
    async loadCategories(selectId, section) {
        const select = document.getElementById(selectId);
        if (!select) return;

        try {
            const response = await api.getCategories(section);
            if (response.success && response.data) {
                select.innerHTML = '<option value="">Todas las categorías</option>';
                response.data.forEach(cat => {
                    select.innerHTML += `<option value="${cat.slug}">${cat.icon || ''} ${cat.name}</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    },

    // Cargar zonas en un select
    async loadZones(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        try {
            const response = await api.getZones();
            if (response.success && response.data) {
                select.innerHTML = '<option value="">Todas las zonas</option>';
                response.data.forEach(zone => {
                    select.innerHTML += `<option value="${zone.slug}">${zone.name}</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading zones:', error);
        }
    },

    // Cargar anuncios en sidebar
    async loadAds(containerId, position = 'sidebar') {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const response = await api.getAds(position);
            if (response.success && response.data && response.data.length > 0) {
                container.innerHTML = response.data.map(ad => Components.adWidget(ad)).join('');

                // Track impressions
                response.data.forEach(ad => {
                    api.trackAdImpression(ad.id).catch(() => {});
                });
            }
        } catch (error) {
            console.error('Error loading ads:', error);
        }
    },

    // Compartir contenido
    share(platform, url, text) {
        const shareUrl = Utils.getShareUrl(platform, url || window.location.href, text || document.title);
        window.open(shareUrl, '_blank', 'width=600,height=400');
    },

    // Copiar enlace
    async copyLink(url = window.location.href) {
        const success = await Utils.copyToClipboard(url);
        if (success) {
            Components.toast('Enlace copiado al portapapeles', 'success');
        } else {
            Components.toast('Error al copiar enlace', 'danger');
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
