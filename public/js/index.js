// =============================================
// EXCENTRICA - Index Page JavaScript
// =============================================

// Tipos de gastronomia predefinidos
const GASTRO_TYPES = [
    { slug: 'parrilla', name: 'Parrilla', icon: '🔥' },
    { slug: 'restaurante', name: 'Restaurante', icon: '🍽️' },
    { slug: 'bar', name: 'Bar', icon: '🍺' },
    { slug: 'cafeteria', name: 'Cafeteria', icon: '☕' },
    { slug: 'pizzeria', name: 'Pizzeria', icon: '🍕' },
    { slug: 'pastas', name: 'Pastas', icon: '🍝' },
    { slug: 'comida-rapida', name: 'Comida Rapida', icon: '🍔' },
    { slug: 'sushi', name: 'Sushi', icon: '🍣' },
    { slug: 'heladeria', name: 'Heladeria', icon: '🍦' },
    { slug: 'panaderia', name: 'Panaderia', icon: '🥐' },
    { slug: 'comida-mexicana', name: 'Mexicana', icon: '🌮' },
    { slug: 'rotiseria', name: 'Rotiseria', icon: '🍗' },
    { slug: 'empanadas', name: 'Empanadas', icon: '🥟' },
    { slug: 'food-truck', name: 'Food Truck', icon: '🚚' }
];

// Categorias de productos predefinidas
const PRODUCT_CATEGORIES = [
    { slug: 'electronica', name: 'Electronica', icon: '📱' },
    { slug: 'hogar', name: 'Hogar', icon: '🏠' },
    { slug: 'ropa', name: 'Ropa', icon: '👕' },
    { slug: 'deportes', name: 'Deportes', icon: '⚽' },
    { slug: 'vehiculos', name: 'Vehiculos', icon: '🚗' },
    { slug: 'servicios', name: 'Servicios', icon: '🔧' },
    { slug: 'mascotas', name: 'Mascotas', icon: '🐾' },
    { slug: 'belleza', name: 'Belleza', icon: '💄' },
    { slug: 'juguetes', name: 'Juguetes', icon: '🧸' },
    { slug: 'libros', name: 'Libros', icon: '📚' }
];

let currentGastroType = '';
let currentProductCategory = '';

function getGastroTypeLabel(slug) {
    const type = GASTRO_TYPES.find(t => t.slug === slug);
    return type ? `${type.icon} ${type.name}` : slug;
}

function getProductCategoryLabel(slug) {
    const cat = PRODUCT_CATEGORIES.find(c => c.slug === slug);
    return cat ? `${cat.icon} ${cat.name}` : slug;
}

// Helper function to format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Helper to get event date parts
function getEventDateParts(dateStr) {
    if (!dateStr) return { day: '?', month: '???' };
    const date = new Date(dateStr);
    return {
        day: date.getDate(),
        month: date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()
    };
}

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Helper to truncate text
function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

// Helper to check if news is recent (within 48 hours)
function isRecentNews(dateStr) {
    if (!dateStr) return false;
    const newsDate = new Date(dateStr);
    const now = new Date();
    const diffHours = (now - newsDate) / (1000 * 60 * 60);
    return diffHours < 48;
}

// Helper to extract array from API response (handles different formats)
function extractArray(response, ...keys) {
    if (!response || !response.success) return [];
    const data = response.data;
    if (Array.isArray(data)) return data;
    for (const key of keys) {
        if (data && Array.isArray(data[key])) return data[key];
    }
    return [];
}

// Show empty state
function showEmpty(container, message, icon) {
    container.innerHTML = `
        <div class="empty-state">
            <div class="icon">${icon}</div>
            <p>${message}</p>
        </div>
    `;
}

// =============================================
// RENDER FUNCTIONS
// =============================================

// Render news card - Estilo Excentrica mejorado
function renderNewsCard(news) {
    const imageUrl = news.image_url || news.imageUrl || '';
    const isNew = isRecentNews(news.created_at);
    const views = news.views || news.view_count || 0;
    const likes = news.likes || news.like_count || 0;

    return `
        <article class="news-card">
            ${imageUrl ? `
                <div class="news-card-image-container">
                    <img src="${imageUrl}" alt="${escapeHtml(news.title)}" class="news-card-image" onerror="this.parentElement.style.display='none'">
                    <div class="news-card-image-overlay"></div>
                    ${isNew ? '<span class="news-card-badge">Nueva</span>' : ''}
                </div>
            ` : ''}
            <div class="news-card-body">
                ${news.category_name ? `<span class="news-card-category">${escapeHtml(news.category_name)}</span>` : ''}
                <h3 class="news-card-title">
                    <a href="/noticia.html?id=${news.id}">${escapeHtml(news.title)}</a>
                </h3>
                <p class="news-card-excerpt">${escapeHtml(truncate(news.summary || news.excerpt || news.content, 160))}</p>
                <div class="news-card-footer">
                    <div class="news-card-meta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${formatDate(news.created_at)}</span>
                    </div>
                    <div class="news-card-stats">
                        <span class="news-card-stat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${views}
                        </span>
                        ${likes > 0 ? `
                            <span class="news-card-stat">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                ${likes}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </div>
        </article>
    `;
}

// Render product card - Estilo mejorado
function renderProductCard(product) {
    const imageUrl = product.image_url || product.imageUrl || '/images/placeholder.svg';
    const price = product.price ? `$${Number(product.price).toLocaleString('es-AR')}` : 'Consultar';
    const isNew = product.created_at && isRecentNews(product.created_at);
    const condition = product.condition === 'new' ? 'Nuevo' : product.condition === 'used' ? 'Usado' : '';

    return `
        <article class="product-card">
            <div class="product-card-image-container">
                <img src="${imageUrl}" alt="${escapeHtml(product.title || product.name)}" class="product-card-image" onerror="this.src='/images/placeholder.svg'">
                <div class="product-card-overlay"></div>
                ${isNew ? '<span class="product-card-badge product-card-badge-new">Nuevo</span>' : ''}
                ${product.featured ? '<span class="product-card-badge product-card-badge-featured">Destacado</span>' : ''}
                ${condition ? `<span class="product-card-condition">${condition}</span>` : ''}
            </div>
            <div class="product-card-body">
                ${product.category_name ? `<span class="product-card-category">${escapeHtml(product.category_name)}</span>` : ''}
                <h3 class="product-card-title">
                    <a href="/producto.html?id=${product.id}">${escapeHtml(product.title || product.name)}</a>
                </h3>
                <div class="product-card-price">${price}</div>
                <div class="product-card-meta">
                    ${product.zone_name ? `<span class="product-card-meta-item">📍 ${escapeHtml(product.zone_name)}</span>` : ''}
                    ${product.views ? `<span class="product-card-meta-item">👁️ ${product.views}</span>` : ''}
                </div>
                <div class="product-card-actions">
                    <a href="/producto.html?id=${product.id}" class="product-card-btn product-card-btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        Ver detalles
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Render event card
function renderEventCard(event) {
    const dateParts = getEventDateParts(event.event_date || event.start_date);
    return `
        <article class="event-card">
            <div class="event-date">
                <div class="event-date-day">${dateParts.day}</div>
                <div class="event-date-month">${dateParts.month}</div>
            </div>
            <div class="event-info">
                <h3 class="event-title">
                    <a href="/evento.html?id=${event.id}">${escapeHtml(event.title)}</a>
                </h3>
                <div class="event-location">📍 ${escapeHtml(event.location || event.venue || 'Por confirmar')}</div>
            </div>
        </article>
    `;
}

// Render movie card
function renderMovieCard(movie) {
    const posterUrl = movie.poster_url || movie.image_url || '/images/movie-placeholder.svg';
    return `
        <article class="movie-card">
            <img src="${posterUrl}" alt="${escapeHtml(movie.title)}" class="movie-card-poster" onerror="this.src='/images/placeholder.svg'">
            <div class="movie-card-body">
                <h3 class="movie-card-title">${escapeHtml(movie.title)}</h3>
                <div class="movie-card-genre">${escapeHtml(movie.genre || '')}</div>
            </div>
        </article>
    `;
}

// Render POI card
function renderPoiCard(poi) {
    const imageUrl = poi.image_url || '/images/placeholder.svg';
    return `
        <article class="poi-card">
            <img src="${imageUrl}" alt="${escapeHtml(poi.name)}" class="poi-card-image" onerror="this.src='/images/placeholder.svg'">
            <div class="poi-card-body">
                ${poi.category_name ? `<span class="poi-card-category">${escapeHtml(poi.category_name)}</span>` : ''}
                <h3 class="poi-card-title">${escapeHtml(poi.name)}</h3>
                ${poi.zone_name ? `<div class="poi-card-location">📍 ${escapeHtml(poi.zone_name)}</div>` : ''}
            </div>
        </article>
    `;
}

// Render video card - YouTube style
function renderVideoCard(video) {
    const videoId = getYouTubeVideoId(video.video_url);
    const thumbnail = videoId
        ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
        : (video.thumbnail_url || '/images/placeholder.svg');
    const views = video.view_count || 0;
    const likes = video.like_count || 0;

    return `
        <article class="video-card-home">
            <a href="/video.html?id=${video.id}" class="video-card-link">
                <div class="video-card-thumbnail">
                    <img src="${thumbnail}" alt="${escapeHtml(video.title)}" onerror="this.src='/images/placeholder.svg'">
                    <div class="video-card-play">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                    <div class="video-card-duration">${video.duration || ''}</div>
                </div>
                <div class="video-card-info">
                    <h3 class="video-card-title">${escapeHtml(video.title)}</h3>
                    <div class="video-card-meta">
                        <span class="video-card-views">👁️ ${views.toLocaleString()}</span>
                        ${likes > 0 ? `<span class="video-card-likes">❤️ ${likes.toLocaleString()}</span>` : ''}
                    </div>
                </div>
            </a>
        </article>
    `;
}

// Helper to get YouTube video ID
function getYouTubeVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

// Render sorteo card - Premium design
function renderSorteoCard(sorteo) {
    const imageUrl = sorteo.image_url || '/images/placeholder.svg';
    const participantCount = sorteo.participants_count || sorteo.participant_count || 0;

    // Calculate if ending soon (within 3 days)
    const drawDate = new Date(sorteo.draw_date);
    const now = new Date();
    const daysUntilDraw = Math.ceil((drawDate - now) / (1000 * 60 * 60 * 24));
    const isEndingSoon = daysUntilDraw <= 3 && daysUntilDraw > 0;
    const hasEnded = daysUntilDraw <= 0;

    // Format draw date
    const drawDateFormatted = drawDate.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Badge text
    let badgeText = '🎲 Sorteo Activo';
    let badgeClass = '';
    if (hasEnded) {
        badgeText = '✓ Finalizado';
    } else if (isEndingSoon) {
        badgeText = `⏰ ${daysUntilDraw === 1 ? 'Ultimo dia!' : `Quedan ${daysUntilDraw} dias`}`;
        badgeClass = 'sorteo-card-badge-ending';
    }

    return `
        <article class="sorteo-card">
            <div class="sorteo-card-image-container">
                <img src="${imageUrl}" alt="${escapeHtml(sorteo.title)}" class="sorteo-card-image" onerror="this.src='/images/placeholder.svg'">
                <div class="sorteo-card-overlay"></div>
                <span class="sorteo-card-badge ${badgeClass}">${badgeText}</span>
                <span class="sorteo-card-participants">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    ${participantCount} participantes
                </span>
            </div>
            <div class="sorteo-card-body">
                <div class="sorteo-card-prize">
                    🎁 ${escapeHtml(sorteo.prize || sorteo.prize_description || 'Premio sorpresa')}
                </div>
                <h3 class="sorteo-card-title">
                    <a href="/sorteo.html?id=${sorteo.id}">${escapeHtml(sorteo.title)}</a>
                </h3>
                ${sorteo.description ? `
                    <p class="sorteo-card-description">${escapeHtml(truncate(sorteo.description, 100))}</p>
                ` : ''}
                <div class="sorteo-card-meta">
                    <div class="sorteo-card-date">
                        <span class="sorteo-card-date-label">Sorteo</span>
                        <span class="sorteo-card-date-value">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            ${drawDateFormatted}
                        </span>
                    </div>
                    ${!hasEnded ? `
                        <a href="/sorteo.html?id=${sorteo.id}" class="sorteo-card-btn">
                            Participar
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    ` : `
                        <a href="/sorteo.html?id=${sorteo.id}" class="sorteo-card-btn" style="background: linear-gradient(135deg, #6b7280, #4b5563);">
                            Ver resultado
                        </a>
                    `}
                </div>
            </div>
        </article>
    `;
}

// Render gastronomy card - Interactive with website button
function renderGastronomyCard(restaurant) {
    const imageUrl = restaurant.image_url || '/images/placeholder.svg';

    // Price range icons
    const priceRanges = { '$': '💵', '$$': '💵💵', '$$$': '💵💵💵', '$$$$': '💵💵💵💵' };
    const priceIcon = priceRanges[restaurant.price_range] || '';

    // Services
    const services = [];
    if (restaurant.has_delivery) services.push('🛵 Delivery');
    if (restaurant.has_takeaway) services.push('🥡 Takeaway');

    // Website button (only show if has website)
    const websiteBtn = restaurant.website ? `
        <a href="${escapeHtml(restaurant.website)}" target="_blank" rel="noopener noreferrer" class="gastro-card-btn gastro-card-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            Visitar Web
        </a>
    ` : '';

    // Details button
    const detailsBtn = `
        <a href="/restaurante.html?id=${restaurant.id}" class="gastro-card-btn gastro-card-btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Ver mas
        </a>
    `;

    return `
        <article class="gastro-card">
            <div class="gastro-card-image-container">
                <img src="${imageUrl}" alt="${escapeHtml(restaurant.name)}" class="gastro-card-image" onerror="this.src='/images/placeholder.svg'">
                <div class="gastro-card-overlay"></div>
                ${restaurant.specialties ? `<span class="gastro-card-badge">${getGastroTypeLabel(restaurant.specialties)}</span>` : ''}
                ${restaurant.featured ? '<span class="gastro-card-featured">⭐ Destacado</span>' : ''}
            </div>
            <div class="gastro-card-body">
                <h3 class="gastro-card-title">
                    <a href="/restaurante.html?id=${restaurant.id}">${escapeHtml(restaurant.name)}</a>
                </h3>
                <div class="gastro-card-meta">
                    ${restaurant.zone_name ? `<span class="gastro-card-meta-item">📍 ${escapeHtml(restaurant.zone_name)}</span>` : ''}
                    ${priceIcon ? `<span class="gastro-card-meta-item">${priceIcon}</span>` : ''}
                    ${restaurant.phone ? `<span class="gastro-card-meta-item">📞 ${escapeHtml(restaurant.phone)}</span>` : ''}
                </div>
                ${services.length > 0 ? `
                    <div class="gastro-card-services">
                        ${services.map(s => `<span class="gastro-card-service">${s}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="gastro-card-actions">
                    ${websiteBtn}
                    ${detailsBtn}
                </div>
            </div>
        </article>
    `;
}

// =============================================
// LOAD HOME PAGE CONTENT
// =============================================
async function loadHomePage() {
    // Load user menu
    const user = auth.getUser();
    const userWidget = document.getElementById('user-widget-content');

    if (user && userWidget) {
        let panelButtons = '';
        if (user.role === 'admin') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: #fff;" onclick="window.location.href='/admin/'">Panel Admin</button>`;
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">Panel Editor</button>`;
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;" onclick="window.location.href='/publicista/'">Panel Publicista</button>`;
        }
        else if (user.role === 'editor' || user.role === 'reporter') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff;" onclick="window.location.href='/editor/'">Panel Editor</button>`;
        }
        else if (user.role === 'periodista') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #3b82f6, #2563eb); border: none; color: #fff;" onclick="window.location.href='/periodista/'">Panel Periodista</button>`;
        }
        else if (user.role === 'publicista') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: #fff;" onclick="window.location.href='/publicista/'">Panel Publicista</button>`;
        }
        else if (user.role === 'videoeditor') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ec4899, #db2777); border: none; color: #fff;" onclick="window.location.href='/videoeditor/'">Panel Videos</button>`;
        }
        else if (user.role === 'merchant' || user.role === 'comerciante') {
            panelButtons += `<button class="btn btn-block mb-2" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff;" onclick="window.location.href='/comerciante/'">Mi Negocio</button>`;
        }

        userWidget.innerHTML = `
            <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.75rem; text-align: center;">Hola, ${escapeHtml(user.name ? user.name.split(' ')[0] : user.email)}</p>
            <button class="btn btn-block mb-2" style="background: rgba(168, 85, 247, 0.2); border: 1px solid rgba(168, 85, 247, 0.4); color: #e2e8f0;" onclick="window.location.href='/perfil.html'">Mi Perfil</button>
            ${panelButtons}
            <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
        `;
    }

    // Render chips first
    renderGastroTypeChips();
    renderProductCategoryChips();

    // Load all sections in parallel
    await Promise.all([
        loadNews(),
        loadVideos(),
        loadProducts(),
        loadEvents(),
        loadMovies(),
        loadGastronomy(),
        loadPoi(),
        loadSorteos()
    ]);
}

// Load news
async function loadNews() {
    try {
        const newsResponse = await api.getNews({ limit: 5 });
        const newsFeed = document.getElementById('news-feed');
        const newsData = extractArray(newsResponse, 'news', 'items');

        if (newsData.length > 0) {
            newsFeed.innerHTML = newsData.map(n => renderNewsCard(n)).join('');
        } else {
            showEmpty(newsFeed, 'No hay noticias disponibles', '📰');
        }
    } catch (e) {
        console.error('Error loading news:', e);
        showEmpty(document.getElementById('news-feed'), 'Error cargando noticias', '❌');
    }
}

// Load videos
async function loadVideos() {
    try {
        const videosResponse = await api.getVideos({ limit: 6 });
        const videosGrid = document.getElementById('videos-grid');
        if (!videosGrid) return;

        const videosData = extractArray(videosResponse, 'videos', 'items');

        if (videosData.length > 0) {
            videosGrid.innerHTML = videosData.map(v => renderVideoCard(v)).join('');
        } else {
            showEmpty(videosGrid, 'No hay videos disponibles', '🎥');
        }
    } catch (e) {
        console.error('Error loading videos:', e);
        const videosGrid = document.getElementById('videos-grid');
        if (videosGrid) {
            showEmpty(videosGrid, 'Error cargando videos', '❌');
        }
    }
}

// Render product category chips
function renderProductCategoryChips() {
    const chipsContainer = document.getElementById('product-category-chips');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = `
        <button class="product-chip ${!currentProductCategory ? 'active' : ''}" data-category="">
            <span>🛒</span> Todos
        </button>
        ${PRODUCT_CATEGORIES.slice(0, 8).map(cat => `
            <button class="product-chip ${currentProductCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
                <span>${cat.icon}</span> ${cat.name}
            </button>
        `).join('')}
    `;

    // Add click handlers
    chipsContainer.querySelectorAll('.product-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            currentProductCategory = chip.dataset.category;
            chipsContainer.querySelectorAll('.product-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            loadProducts();
        });
    });
}

// Load products
async function loadProducts() {
    try {
        const params = { limit: 8 };
        if (currentProductCategory) {
            params.category = currentProductCategory;
        } else {
            params.featured = 1;
        }

        const productsResponse = await api.getProducts(params);
        const productsGrid = document.getElementById('products-grid');
        const productsData = extractArray(productsResponse, 'products', 'items');

        if (productsData.length > 0) {
            productsGrid.innerHTML = productsData.map(p => renderProductCard(p)).join('');
        } else {
            showEmpty(productsGrid, 'No hay productos disponibles', '🛒');
        }
    } catch (e) {
        console.error('Error loading products:', e);
        showEmpty(document.getElementById('products-grid'), 'Error cargando productos', '❌');
    }
}

// Load events
async function loadEvents() {
    try {
        const eventsResponse = await api.getEvents({ limit: 4, upcoming: 1 });
        const eventsList = document.getElementById('events-list');
        const eventsData = extractArray(eventsResponse, 'events', 'items');

        if (eventsData.length > 0) {
            eventsList.innerHTML = eventsData.map(e => renderEventCard(e)).join('');
        } else {
            showEmpty(eventsList, 'No hay eventos proximos', '📅');
        }
    } catch (e) {
        console.error('Error loading events:', e);
        showEmpty(document.getElementById('events-list'), 'Error cargando eventos', '❌');
    }
}

// Load movies
async function loadMovies() {
    try {
        const moviesResponse = await api.getMovies({ status: 'now_showing' });
        const moviesGrid = document.getElementById('movies-grid');
        const moviesData = extractArray(moviesResponse, 'movies', 'items');

        if (moviesData.length > 0) {
            moviesGrid.innerHTML = moviesData.slice(0, 6).map(m => renderMovieCard(m)).join('');
        } else {
            showEmpty(moviesGrid, 'No hay peliculas en cartelera', '🎬');
        }
    } catch (e) {
        console.error('Error loading movies:', e);
        showEmpty(document.getElementById('movies-grid'), 'No hay cartelera disponible', '🎬');
    }
}

// Render gastronomy type chips
function renderGastroTypeChips() {
    const chipsContainer = document.getElementById('gastro-type-chips');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = `
        <button class="gastro-chip ${!currentGastroType ? 'active' : ''}" data-type="">
            <span>🍽️</span> Todos
        </button>
        ${GASTRO_TYPES.slice(0, 8).map(type => `
            <button class="gastro-chip ${currentGastroType === type.slug ? 'active' : ''}" data-type="${type.slug}">
                <span>${type.icon}</span> ${type.name}
            </button>
        `).join('')}
    `;

    // Add click handlers
    chipsContainer.querySelectorAll('.gastro-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            currentGastroType = chip.dataset.type;
            chipsContainer.querySelectorAll('.gastro-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            loadGastronomy();
        });
    });
}

// Load gastronomy
async function loadGastronomy() {
    try {
        const params = { limit: 6 };
        if (currentGastroType) {
            params.specialties = currentGastroType;
        } else {
            params.featured = 1;
        }

        const gastroResponse = await api.getGastronomy(params);
        const gastroGrid = document.getElementById('gastro-grid');
        if (!gastroGrid) return;

        const gastroData = extractArray(gastroResponse, 'items', 'gastronomy');

        if (gastroData.length > 0) {
            gastroGrid.innerHTML = gastroData.map(g => renderGastronomyCard(g)).join('');
        } else {
            showEmpty(gastroGrid, 'No hay restaurantes disponibles', '🍽️');
        }
    } catch (e) {
        console.error('Error loading gastronomy:', e);
        const gastroGrid = document.getElementById('gastro-grid');
        if (gastroGrid) {
            showEmpty(gastroGrid, 'Error cargando restaurantes', '❌');
        }
    }
}

// Load POI
async function loadPoi() {
    try {
        const poiResponse = await api.getPoi({ limit: 6 });
        const poiGrid = document.getElementById('poi-grid');
        const poiData = extractArray(poiResponse, 'items', 'poi');

        if (poiData.length > 0) {
            poiGrid.innerHTML = poiData.map(p => renderPoiCard(p)).join('');
        } else {
            showEmpty(poiGrid, 'No hay lugares para mostrar', '🗺️');
        }
    } catch (e) {
        console.error('Error loading POI:', e);
        showEmpty(document.getElementById('poi-grid'), 'No hay lugares disponibles', '🗺️');
    }
}

// Load sorteos
async function loadSorteos() {
    try {
        console.log('[Sorteos] Loading...');
        const sorteosResponse = await api.getSorteos({ status: 'active', limit: 6 });
        console.log('[Sorteos] Response:', sorteosResponse);

        const sorteosGrid = document.getElementById('sorteos-grid');
        const sorteosSection = document.getElementById('sorteos-section');

        if (!sorteosGrid) {
            console.log('[Sorteos] Grid element not found!');
            return;
        }

        const sorteosData = extractArray(sorteosResponse, 'sorteos', 'items');
        console.log('[Sorteos] Extracted data:', sorteosData.length, 'items');

        if (sorteosData.length > 0) {
            console.log('[Sorteos] Rendering', sorteosData.length, 'sorteos');
            sorteosGrid.innerHTML = sorteosData.map(s => renderSorteoCard(s)).join('');
            if (sorteosSection) {
                sorteosSection.style.display = 'block';
                console.log('[Sorteos] Section shown!');
            }
        } else {
            console.log('[Sorteos] No sorteos to display');
            if (sorteosSection) sorteosSection.style.display = 'none';
        }
    } catch (e) {
        console.error('[Sorteos] Error loading:', e);
        const sorteosSection = document.getElementById('sorteos-section');
        if (sorteosSection) sorteosSection.style.display = 'none';
    }
}

// =============================================
// EVENT LISTENERS
// =============================================

// Run on load
document.addEventListener('DOMContentLoaded', loadHomePage);

// Mobile menu toggle
document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.sidebar-nav').classList.toggle('active');
});

// Global search
document.getElementById('global-search')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `/buscar.html?q=${encodeURIComponent(query)}`;
        }
    }
});
