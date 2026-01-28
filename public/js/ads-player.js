/**
 * EXCENTRICA - Ads Player Component
 * Carga y muestra videos publicitarios de YouTube en las secciones
 */

class AdsPlayer {
    constructor(containerId, position = 'sidebar') {
        this.container = document.getElementById(containerId);
        this.position = position;
        this.ads = [];
        this.currentIndex = 0;
        this.rotationInterval = null;
        this.rotationTime = 35000; // 35 segundos entre videos
    }

    /**
     * Extrae el ID de video de una URL de YouTube
     */
    extractYouTubeId(url) {
        if (!url) return null;

        // Patrones de URL de YouTube
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
            /youtube\.com\/shorts\/([^&\?\/]+)/
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Carga los anuncios desde la API
     */
    async loadAds() {
        try {
            console.log('[AdsPlayer] Loading ads for position:', this.position);
            const response = await api.getAds(this.position);
            console.log('[AdsPlayer] Response:', response);
            if (response.success && response.data && response.data.length > 0) {
                this.ads = response.data;
                // Log ads positions for debugging - stringify to see values directly
                console.log('[AdsPlayer] Loaded', this.ads.length, 'ads:');
                this.ads.forEach(a => console.log('  - Ad ID:', a.id, '| Title:', a.title, '| Position:', a.position));
                return true;
            }
            console.log('[AdsPlayer] No ads found for position:', this.position);
            return false;
        } catch (e) {
            console.error('Error loading ads:', e);
            return false;
        }
    }

    /**
     * Registra una impresion del anuncio
     */
    async trackImpression(adId) {
        try {
            await api.trackAdImpression(adId);
        } catch (e) {
            console.error('Error tracking impression:', e);
        }
    }

    /**
     * Registra un click en el anuncio
     */
    async trackClick(adId) {
        try {
            await api.trackAdClick(adId);
        } catch (e) {
            console.error('Error tracking click:', e);
        }
    }

    /**
     * Renderiza el video actual
     */
    renderCurrentAd() {
        if (!this.container || this.ads.length === 0) return;

        const ad = this.ads[this.currentIndex];
        const videoId = this.extractYouTubeId(ad.video_url);

        if (!videoId) {
            console.error('Invalid YouTube URL:', ad.video_url);
            this.nextAd();
            return;
        }

        // Registrar impresion
        this.trackImpression(ad.id);

        const hasLink = ad.link_url && ad.link_url.trim() !== '';

        this.container.innerHTML = `
            <div class="ads-player-wrapper">
                <div class="ads-player-video">
                    <iframe
                        src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>
                ${ad.title ? `<div class="ads-player-title">${this.escapeHtml(ad.title)}</div>` : ''}
                ${hasLink ? `
                    <a href="${ad.link_url}" target="_blank" rel="noopener" class="ads-player-link" data-ad-id="${ad.id}">
                        Mas info
                    </a>
                ` : ''}
                ${this.ads.length > 1 ? `
                    <div class="ads-player-dots">
                        ${this.ads.map((_, i) => `<span class="ads-dot ${i === this.currentIndex ? 'active' : ''}" data-index="${i}"></span>`).join('')}
                    </div>
                ` : ''}
                <div class="ads-player-badge">Publicidad</div>
            </div>
        `;

        // Event listener para clicks en el link
        const link = this.container.querySelector('.ads-player-link');
        if (link) {
            link.addEventListener('click', () => {
                this.trackClick(ad.id);
            });
        }

        // Event listeners para los dots de navegacion
        const dots = this.container.querySelectorAll('.ads-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    this.currentIndex = index;
                    this.renderCurrentAd();
                    this.resetRotation();
                }
            });
        });
    }

    /**
     * Muestra el siguiente anuncio
     */
    nextAd() {
        if (this.ads.length <= 1) return;
        this.currentIndex = (this.currentIndex + 1) % this.ads.length;
        this.renderCurrentAd();
    }

    /**
     * Inicia la rotacion de anuncios
     */
    startRotation() {
        if (this.ads.length <= 1) return;
        this.rotationInterval = setInterval(() => {
            this.nextAd();
        }, this.rotationTime);
    }

    /**
     * Resetea el timer de rotacion
     */
    resetRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.startRotation();
        }
    }

    /**
     * Detiene la rotacion
     */
    stopRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    /**
     * Renderiza el estado vacio (sin anuncios)
     */
    renderEmpty() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="ads-player-empty">
                <div class="ads-player-empty-icon">📣</div>
                <h4>Espacio Publicitario</h4>
                <p>Promociona tu negocio aqui</p>
                <a href="/contacto.html" class="btn btn-sm btn-primary">Quiero Anunciar</a>
            </div>
        `;
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Inicializa el player
     */
    async init() {
        if (!this.container) {
            console.warn('Ads container not found');
            return;
        }

        const hasAds = await this.loadAds();

        if (hasAds) {
            this.renderCurrentAd();
            this.startRotation();
        } else {
            this.renderEmpty();
        }
    }
}

// Funcion helper para inicializar ads en una pagina
function initAdsPlayer(containerId, position) {
    const player = new AdsPlayer(containerId, position);
    player.init();
    return player;
}
