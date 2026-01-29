// EXCENTRICA - PWA Mobile
// Install prompt y deteccion offline

const PWA = {
    deferredPrompt: null,
    isInstalled: false,
    isIOS: false,

    init() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;

        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineStatus();
    },

    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
            } catch (err) {
                console.error('SW registration failed:', err);
            }
        }
    },

    // Configurar prompt de instalacion
    setupInstallPrompt() {
        // Si ya esta instalada, no mostrar banner
        if (this.isInstalled) return;

        // Si el usuario ya cerro el banner antes
        if (localStorage.getItem('pwa_banner_dismissed')) return;

        // Capturar evento beforeinstallprompt (Chrome/Android)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Para iOS, mostrar instrucciones manuales
        if (this.isIOS && !this.isInstalled) {
            setTimeout(() => this.showInstallBanner(), 2000);
        }
    },

    // Mostrar banner de instalacion
    showInstallBanner() {
        const banner = document.getElementById('install-banner');
        if (!banner) return;

        const isIOS = this.isIOS;
        const buttonText = isIOS ? 'Ver como' : 'Instalar';

        banner.innerHTML = `
            <div class="install-banner-content">
                <div class="install-banner-text">
                    <span class="install-banner-icon">📲</span>
                    <span>Instala Excentrica</span>
                </div>
                <button class="install-banner-btn" id="install-btn">${buttonText}</button>
                <button class="install-banner-close" id="install-close">&times;</button>
            </div>
        `;

        banner.classList.add('active');

        // Eventos
        document.getElementById('install-btn').addEventListener('click', () => {
            if (isIOS) {
                this.showIOSInstructions();
            } else {
                this.triggerInstall();
            }
        });

        document.getElementById('install-close').addEventListener('click', () => {
            this.dismissBanner();
        });
    },

    // Disparar instalacion (Android/Chrome)
    async triggerInstall() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            this.dismissBanner();
        }

        this.deferredPrompt = null;
    },

    // Mostrar instrucciones iOS
    showIOSInstructions() {
        const banner = document.getElementById('install-banner');
        if (!banner) return;

        banner.innerHTML = `
            <div class="install-banner-content" style="flex-direction: column; align-items: flex-start; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
                    <span style="font-size: 0.875rem; flex: 1;">Para instalar:</span>
                    <button class="install-banner-close" id="install-close">&times;</button>
                </div>
                <div style="font-size: 0.8125rem; color: var(--text-secondary);">
                    1. Toca el boton <strong>Compartir</strong> (cuadrado con flecha)
                    <br>2. Selecciona <strong>"Agregar a inicio"</strong>
                </div>
            </div>
        `;

        document.getElementById('install-close').addEventListener('click', () => {
            this.dismissBanner();
        });
    },

    // Cerrar banner
    dismissBanner() {
        const banner = document.getElementById('install-banner');
        if (banner) {
            banner.classList.remove('active');
        }
        localStorage.setItem('pwa_banner_dismissed', 'true');
    },

    // Detectar estado online/offline
    setupOnlineStatus() {
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
        });

        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
        });

        // Estado inicial
        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    }
};

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => PWA.init());
