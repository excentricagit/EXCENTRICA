// EXCENTRICA - Feed Mobile
// Logica del feed home (mezcla de contenido)

const MobileFeed = {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,
    container: null,

    // Inicializar feed
    async init(containerId = '#feed-container') {
        this.container = document.querySelector(containerId);
        if (!this.container) return;

        this.reset();
        await this.loadMore();
        this.setupInfiniteScroll();
    },

    // Resetear estado
    reset() {
        this.items = [];
        this.page = 1;
        this.hasMore = true;
        this.loading = false;
    },

    // Cargar contenido mixto
    async loadMore() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;

        if (this.page === 1) {
            MobileUI.showLoading(this.container);
        }

        try {
            // Llamar multiples APIs en paralelo
            const [newsRes, productsRes, eventsRes] = await Promise.allSettled([
                Api.getNews({ page: this.page, limit: 4, status: 'published' }),
                Api.getProducts({ page: this.page, limit: 4, status: 'approved' }),
                Api.getEvents({ page: this.page, limit: 4, status: 'published' })
            ]);

            // Extraer items de cada respuesta
            // Formato: {success: true, data: {news: [], pagination: {}}}
            const extractItems = (res, key) => {
                if (res.status !== 'fulfilled') return [];
                const val = res.value;
                // El formato es val.data.news, val.data.products, val.data.events
                if (val && val.data && Array.isArray(val.data[key])) {
                    return val.data[key];
                }
                return [];
            };

            const newsItems = extractItems(newsRes, 'news');
            const productItems = extractItems(productsRes, 'products');
            const eventItems = extractItems(eventsRes, 'events');

            // Agregar tipo a cada item
            newsItems.forEach(item => item._type = 'noticia');
            productItems.forEach(item => item._type = 'producto');
            eventItems.forEach(item => item._type = 'evento');

            // Combinar todos los items
            const allItems = [...newsItems, ...productItems, ...eventItems];

            // Ordenar por fecha
            allItems.sort((a, b) => {
                const dateA = new Date(a.created_at || a.event_date || 0);
                const dateB = new Date(b.created_at || b.event_date || 0);
                return dateB - dateA;
            });

            // Verificar si hay mas contenido
            const hasMoreNews = newsItems.length === 4;
            const hasMoreProducts = productItems.length === 4;
            const hasMoreEvents = eventItems.length === 4;
            this.hasMore = hasMoreNews || hasMoreProducts || hasMoreEvents;

            // Agregar items al feed
            this.items.push(...allItems);
            this.page++;

            // Renderizar
            this.render();

        } catch (error) {
            console.error('Error loading feed:', error);
            if (this.page === 1) {
                MobileUI.showError(this.container, 'Error al cargar el contenido');
            }
        } finally {
            this.loading = false;
        }
    },

    // Renderizar feed
    render() {
        if (!this.container) return;

        if (this.items.length === 0) {
            MobileUI.showEmpty(this.container, '📭', 'Sin contenido', 'No hay publicaciones todavia');
            return;
        }

        let html = '<div class="mobile-feed-grid">';

        this.items.forEach(item => {
            switch (item._type) {
                case 'noticia':
                    html += MobileUI.cardNoticia(item);
                    break;
                case 'producto':
                    html += MobileUI.cardProducto(item);
                    break;
                case 'evento':
                    html += MobileUI.cardEvento(item);
                    break;
            }
        });

        html += '</div>';

        // Agregar boton cargar mas
        if (this.hasMore) {
            html += `
                <div class="mobile-load-more">
                    <button class="mobile-btn-load-more" id="btn-load-more">
                        Cargar mas
                    </button>
                </div>
            `;
        }

        this.container.innerHTML = html;

        // Evento del boton
        const loadMoreBtn = document.getElementById('btn-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMore());
        }
    },

    // Scroll infinito
    setupInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            const lastEntry = entries[0];
            if (lastEntry.isIntersecting && !this.loading && this.hasMore) {
                this.loadMore();
            }
        }, { rootMargin: '200px' });

        // Observar el final del contenedor
        const sentinel = document.createElement('div');
        sentinel.id = 'feed-sentinel';
        this.container.parentNode.appendChild(sentinel);
        observer.observe(sentinel);
    },

    // Refrescar feed
    async refresh() {
        this.reset();
        await this.loadMore();
    }
};

// Feed por categoria
const MobileCategoryFeed = {
    items: [],
    page: 1,
    hasMore: true,
    loading: false,
    container: null,
    category: null,
    apiMethod: null,
    // Mapeo de categoria a key de la API
    // Las APIs de servicios (gastronomia, alojamiento, etc) usan 'items'
    // Las APIs de contenido (noticias, productos, eventos) usan nombres especificos
    categoryToKey: {
        'noticias': 'news',
        'productos': 'products',
        'eventos': 'events',
        'videos': 'videos',
        'gastronomia': 'items',
        'alojamiento': 'items',
        'transporte': 'items',
        'colectivos': 'items',
        'servicios': 'items',
        'turismo': 'items'
    },

    async init(containerId, category, apiMethod) {
        this.container = document.querySelector(containerId);
        this.category = category;
        this.apiMethod = apiMethod;

        if (!this.container || !this.apiMethod) return;

        this.reset();
        await this.loadMore();
    },

    reset() {
        this.items = [];
        this.page = 1;
        this.hasMore = true;
        this.loading = false;
    },

    async loadMore() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;

        if (this.page === 1) {
            MobileUI.showLoading(this.container);
        }

        try {
            const response = await this.apiMethod({ page: this.page, limit: 12 });
            // Extraer items usando el mapeo de categoria a key
            const key = this.categoryToKey[this.category] || this.category;
            const items = (response.data && response.data[key]) || [];

            this.hasMore = items.length === 12;
            this.items.push(...items);
            this.page++;

            this.render();
        } catch (error) {
            console.error('Error loading category feed:', error);
            if (this.page === 1) {
                MobileUI.showError(this.container);
            }
        } finally {
            this.loading = false;
        }
    },

    render() {
        if (!this.container) return;

        if (this.items.length === 0) {
            MobileUI.showEmpty(this.container);
            return;
        }

        let html = '<div class="mobile-feed-grid">';

        this.items.forEach(item => {
            html += this.renderCard(item);
        });

        html += '</div>';

        if (this.hasMore) {
            html += `
                <div class="mobile-load-more">
                    <button class="mobile-btn-load-more" onclick="MobileCategoryFeed.loadMore()">
                        Cargar mas
                    </button>
                </div>
            `;
        }

        this.container.innerHTML = html;
    },

    renderCard(item) {
        switch (this.category) {
            case 'noticias': return MobileUI.cardNoticia(item);
            case 'productos': return MobileUI.cardProducto(item);
            case 'eventos': return MobileUI.cardEvento(item);
            case 'videos': return MobileUI.cardVideo(item);
            case 'gastronomia': return MobileUI.cardGastronomia(item);
            case 'alojamiento': return MobileUI.cardAlojamiento(item);
            case 'transporte': return MobileUI.cardTransporte(item);
            case 'colectivos': return MobileUI.cardColectivo(item);
            case 'servicios': return MobileUI.cardServicios(item);
            case 'turismo': return MobileUI.cardTurismo(item);
            default: return MobileUI.cardGenerico(item, this.category, '📄');
        }
    }
};
