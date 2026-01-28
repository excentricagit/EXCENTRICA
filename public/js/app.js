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
        const widgetUserContent = document.getElementById('user-widget-content');

        if (auth.isAuthenticated()) {
            const user = auth.getUser();

            // No mostrar nada en el header - el usuario accede desde el widget del sidebar

            // Determinar paneles según rol
            let panelButtons = '';

            // Admin puede ver todos los paneles
            if (user.role === 'admin') {
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: #fff;" onclick="window.location.href='/admin/'">Panel Admin</button>`;
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">Panel Editor</button>`;
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;" onclick="window.location.href='/publicista/'">Panel Publicista</button>`;
            }
            // Editor/Reporter/Periodista
            else if (user.role === 'editor' || user.role === 'reporter' || user.role === 'periodista') {
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">Panel Editor</button>`;
            }
            // Comerciante
            else if (user.role === 'merchant' || user.role === 'comerciante') {
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff;" onclick="window.location.href='/comerciante/'">Mi Negocio</button>`;
            }
            // Publicista
            else if (user.role === 'publicista') {
                panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;" onclick="window.location.href='/publicista/'">Panel Publicista</button>`;
            }

            // Actualizar widget de usuario en sidebar (si existe - formato antiguo)
            if (widgetUser) {
                widgetUser.innerHTML = `
                    <div class="widget-icon">👤</div>
                    <h3 class="widget-title">Hola, ${user.name ? user.name.split(' ')[0] : 'Usuario'}</h3>
                    <p class="widget-text">${user.email}</p>
                    ${panelButtons}
                    <button class="btn btn-outline btn-block" onclick="auth.logout()">Cerrar Sesion</button>
                `;
            }

            // Actualizar widget de usuario en sidebar (formato nuevo con id)
            if (widgetUserContent) {
                widgetUserContent.innerHTML = `
                    <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.75rem; text-align: center;">Hola, ${Utils.escapeHtml(user.name ? user.name.split(' ')[0] : user.email)}</p>
                    <button class="btn btn-block mb-2" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #e2e8f0;" onclick="window.location.href='/perfil.html'">Mi Perfil</button>
                    ${panelButtons}
                    <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
                `;
            }

            // Ocultar botones de auth
            if (authButtons) authButtons.style.display = 'none';
        } else {
            // No mostrar nada en el header - el usuario accede desde el widget del sidebar

            // Mostrar botones de login en widget (si existe - formato antiguo)
            if (widgetUser) {
                widgetUser.innerHTML = `
                    <div class="widget-icon">👤</div>
                    <h3 class="widget-title">Únete a Excentrica</h3>
                    <p class="widget-text">Iniciá sesión para dar likes y guardar favoritos.</p>
                    <button class="btn btn-primary btn-block mb-2" onclick="window.location.href='/login.html'">Iniciar Sesión</button>
                    <button class="btn btn-outline btn-block" onclick="window.location.href='/registro.html'">Crear Cuenta</button>
                `;
            }

            // Widget formato nuevo ya tiene el HTML estático correcto para usuarios no logueados
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
