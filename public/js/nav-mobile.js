// EXCENTRICA - Navigation Mobile
// Header y bottom navigation

const MobileNav = {
    currentPage: 'home',

    // Iconos SVG minimalistas
    icons: {
        home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
        categorias: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
        publicar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        perfil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
    },

    init(page = 'home') {
        this.currentPage = page;
        this.renderHeader();
        this.renderBottomNav();
    },

    // Renderizar header
    renderHeader() {
        const header = document.getElementById('mobile-header');
        if (!header) return;

        header.innerHTML = `
            <div class="mobile-header-inner">
                <a href="/mobile/index-mobile.html" class="mobile-header-logo">
                    <img src="/assets/logo.png" alt="Excentrica">
                </a>
            </div>
        `;
    },

    // Renderizar bottom navigation
    renderBottomNav() {
        const nav = document.getElementById('mobile-bottom-nav');
        if (!nav) return;

        const user = Auth.getUser();
        const isPeriodista = user && user.role === 'periodista';

        // Items de navegacion con iconos SVG
        const items = [
            { id: 'home', icon: this.icons.home, label: 'Inicio', href: '/mobile/index-mobile.html' },
            { id: 'categorias', icon: this.icons.categorias, label: 'Categorias', href: '/mobile/categorias-mobile.html' }
        ];

        // Agregar Publicar solo para periodistas
        if (isPeriodista) {
            items.push({ id: 'publicar', icon: this.icons.publicar, label: 'Publicar', href: '/mobile/publicar-mobile.html' });
        }

        // Perfil siempre al final
        items.push({ id: 'perfil', icon: this.icons.perfil, label: 'Perfil', href: '/mobile/perfil-mobile.html' });

        nav.innerHTML = `
            <div class="mobile-bottom-nav-inner">
                ${items.map(item => `
                    <a href="${item.href}"
                       class="mobile-nav-item ${this.currentPage === item.id ? 'active' : ''}"
                       data-page="${item.id}">
                        <span class="mobile-nav-icon">${item.icon}</span>
                        <span class="mobile-nav-label">${item.label}</span>
                    </a>
                `).join('')}
            </div>
        `;
    },

    // Actualizar pagina activa
    setActivePage(page) {
        this.currentPage = page;
        const items = document.querySelectorAll('.mobile-nav-item');
        items.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
    },

    // Mostrar/ocultar header en scroll
    setupScrollBehavior() {
        let lastScroll = 0;
        const header = document.getElementById('mobile-header');

        window.addEventListener('scroll', Utils.throttle(() => {
            const currentScroll = window.scrollY;

            if (currentScroll > lastScroll && currentScroll > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }

            lastScroll = currentScroll;
        }, 100));
    }
};
