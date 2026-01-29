// EXCENTRICA - PWA Mobile
// Install prompt, deteccion offline y actualizaciones

const PWA = {
    deferredPrompt: null,
    isInstalled: false,
    isIOS: false,
    swRegistration: null,
    waitingWorker: null,

    init() {
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;

        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineStatus();
        this.listenForSWMessages();
    },

    // Registrar Service Worker con deteccion de actualizaciones
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('[PWA] Service Worker registered');

            // Detectar cuando hay un nuevo SW esperando
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                console.log('[PWA] New Service Worker found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Hay un nuevo SW instalado y hay uno viejo controlando
                        console.log('[PWA] New version available');
                        this.waitingWorker = newWorker;
                        this.showUpdateBanner();
                    }
                });
            });

            // Chequear si ya hay un SW esperando
            if (this.swRegistration.waiting) {
                this.waitingWorker = this.swRegistration.waiting;
                this.showUpdateBanner();
            }

            // Forzar chequeo de actualizaciones cada 30 minutos
            setInterval(() => {
                this.swRegistration.update();
            }, 30 * 60 * 1000);

            // Chequear actualizaciones al volver a la app
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && this.swRegistration) {
                    this.swRegistration.update();
                }
            });

        } catch (err) {
            console.error('[PWA] SW registration failed:', err);
        }
    },

    // Escuchar mensajes del Service Worker
    listenForSWMessages() {
        navigator.serviceWorker?.addEventListener('message', (event) => {
            if (event.data.type === 'SW_UPDATED') {
                console.log('[PWA] SW updated to version:', event.data.version);
                // Recargar la pagina si el SW se actualizo
                // Solo si el usuario ya acepto la actualizacion
            }
        });

        // Detectar cuando un nuevo SW toma control
        navigator.serviceWorker?.addEventListener('controllerchange', () => {
            console.log('[PWA] New SW controller, reloading...');
            window.location.reload();
        });
    },

    // Mostrar banner de actualizacion
    showUpdateBanner() {
        // Crear el banner si no existe
        let banner = document.getElementById('update-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'update-banner';
            banner.className = 'update-banner';
            document.body.appendChild(banner);
        }

        banner.innerHTML = `
            <div class="update-banner-content">
                <div class="update-banner-text">
                    <span class="update-banner-icon">🔄</span>
                    <span>Nueva version disponible</span>
                </div>
                <button class="update-banner-btn" id="update-btn">Actualizar</button>
                <button class="update-banner-close" id="update-close">&times;</button>
            </div>
        `;

        banner.classList.add('active');

        // Eventos
        document.getElementById('update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });

        document.getElementById('update-close').addEventListener('click', () => {
            banner.classList.remove('active');
            // Mostrar de nuevo en 1 hora si no actualiza
            setTimeout(() => {
                if (this.waitingWorker) {
                    this.showUpdateBanner();
                }
            }, 60 * 60 * 1000);
        });
    },

    // Aplicar la actualizacion
    applyUpdate() {
        if (!this.waitingWorker) {
            window.location.reload();
            return;
        }

        // Mostrar estado de carga
        const btn = document.getElementById('update-btn');
        if (btn) {
            btn.innerHTML = '<span class="spinner-small"></span> Actualizando...';
            btn.disabled = true;
        }

        // Decirle al SW que tome control
        this.waitingWorker.postMessage({ type: 'SKIP_WAITING' });

        // El controllerchange listener recargara la pagina
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
            // Chequear actualizaciones al volver online
            if (this.swRegistration) {
                this.swRegistration.update();
            }
        });

        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
        });

        // Estado inicial
        if (!navigator.onLine) {
            document.body.classList.add('offline');
        }
    },

    // Metodo publico para forzar actualizacion
    checkForUpdates() {
        if (this.swRegistration) {
            this.swRegistration.update();
        }
    }
};

// Inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', () => PWA.init());

// Exponer globalmente para uso manual
window.PWA = PWA;
