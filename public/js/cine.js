// ===========================================
// CINE - Modulo de cartelera de cines
// ===========================================

(function() {
    'use strict';

    // Estado
    let currentDate = new Date().toISOString().split('T')[0];
    let currentCinema = '';
    let currentView = 'movies'; // 'movies' o 'cinemas'
    let cinemas = [];
    let movies = [];
    let showtimes = [];
    let upcomingMovies = [];

    // Nombres de dias
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Generar fechas para selector (7 dias)
    function generateDates() {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                date: date.toISOString().split('T')[0],
                dayName: i === 0 ? 'Hoy' : dayNames[date.getDay()],
                dayNum: date.getDate(),
                isToday: i === 0
            });
        }
        return dates;
    }

    // Renderizar selector de fechas
    function renderDateSelector() {
        const container = document.getElementById('date-selector');
        if (!container) return;

        const dates = generateDates();
        container.innerHTML = dates.map(d => `
            <button class="cine-date-btn ${d.date === currentDate ? 'active' : ''} ${d.isToday ? 'today' : ''}"
                    data-date="${d.date}">
                <span class="day-name">${d.dayName}</span>
                <span class="day-num">${d.dayNum}</span>
            </button>
        `).join('');

        // Event listeners
        container.querySelectorAll('.cine-date-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentDate = btn.dataset.date;
                renderDateSelector();
                loadShowtimes();
            });
        });
    }

    // Obtener clase de rating
    function getRatingClass(rating) {
        if (!rating) return 'atp';
        const r = rating.toLowerCase();
        if (r.includes('18') || r === 'r') return 'plus18';
        if (r.includes('16')) return 'plus16';
        if (r.includes('13') || r === 'pg-13') return 'plus13';
        return 'atp';
    }

    // Formatear duracion
    function formatDuration(minutes) {
        if (!minutes) return '';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return h > 0 ? `${h}h ${m}min` : `${m}min`;
    }

    // Parsear generos
    function parseGenres(genre) {
        if (!genre) return [];
        try {
            return typeof genre === 'string' ? JSON.parse(genre) : genre;
        } catch {
            return genre.split(',').map(g => g.trim());
        }
    }

    // Renderizar card de pelicula con horarios
    function renderMovieCard(movie, movieShowtimes) {
        const posterUrl = movie.poster_url || '/assets/placeholder-movie.jpg';
        const genres = parseGenres(movie.genre);
        const ratingClass = getRatingClass(movie.rating);

        // Agrupar horarios por cine
        const cinemaGroups = {};
        movieShowtimes.forEach(st => {
            if (!cinemaGroups[st.cinema_id]) {
                cinemaGroups[st.cinema_id] = {
                    name: st.cinema_name,
                    address: st.cinema_address,
                    times: []
                };
            }
            cinemaGroups[st.cinema_id].times.push(st);
        });

        let showtimesHtml = '';
        for (const cinemaId in cinemaGroups) {
            const group = cinemaGroups[cinemaId];
            showtimesHtml += `
                <div class="movie-cinema-group">
                    <div class="cinema-group-header">
                        <span class="cinema-group-name">🎬 ${Utils.escapeHtml(group.name)}</span>
                        ${group.address ? `<span class="cinema-group-address">- ${Utils.escapeHtml(group.address)}</span>` : ''}
                    </div>
                    <div class="showtime-chips">
                        ${group.times.map(st => `
                            <div class="showtime-chip">
                                <span class="time">${st.show_time.substring(0, 5)}</span>
                                <span class="format">${st.format || '2D'} ${st.language === 'doblada' ? 'DOB' : 'SUB'}</span>
                                ${st.price ? `<span class="price">$${st.price}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return `
            <article class="movie-card">
                <div class="movie-card-header">
                    <div class="movie-poster">
                        <img src="${posterUrl}" alt="${Utils.escapeHtml(movie.title)}" onerror="Utils.handleImageError(this)">
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${Utils.escapeHtml(movie.title)}</h3>
                        <div class="movie-meta">
                            ${movie.rating ? `<span class="movie-rating ${ratingClass}">${movie.rating}</span>` : ''}
                            ${movie.duration ? `<span class="movie-meta-item">🕐 ${formatDuration(movie.duration)}</span>` : ''}
                        </div>
                        ${genres.length > 0 ? `<div class="movie-genre">${genres.slice(0, 3).join(' / ')}</div>` : ''}
                        ${movie.synopsis ? `<p class="movie-synopsis">${Utils.escapeHtml(movie.synopsis)}</p>` : ''}
                    </div>
                </div>
                <div class="movie-showtimes">
                    ${showtimesHtml || '<p style="color: #64748b; font-size: 0.85rem;">No hay funciones disponibles</p>'}
                </div>
            </article>
        `;
    }

    // Renderizar seccion de cine con sus peliculas
    function renderCinemaSection(cinema, cinemaShowtimes) {
        const logoUrl = cinema.logo_url || cinema.image_url;
        let features = [];
        try {
            features = cinema.features ? JSON.parse(cinema.features) : [];
        } catch { features = []; }

        // Agrupar horarios por pelicula
        const movieGroups = {};
        cinemaShowtimes.forEach(st => {
            if (!movieGroups[st.movie_id]) {
                movieGroups[st.movie_id] = {
                    id: st.movie_id,
                    title: st.movie_title,
                    poster_url: st.poster_url,
                    duration: st.duration,
                    rating: st.rating,
                    times: []
                };
            }
            movieGroups[st.movie_id].times.push(st);
        });

        const moviesHtml = Object.values(movieGroups).map(movie => `
            <div class="movie-mini-card" onclick="CineModule.showMovieDetail(${movie.id})">
                <div class="movie-mini-poster">
                    <img src="${movie.poster_url || '/assets/placeholder-movie.jpg'}" alt="${Utils.escapeHtml(movie.title)}" onerror="Utils.handleImageError(this)">
                </div>
                <div class="movie-mini-info">
                    <h4 class="movie-mini-title">${Utils.escapeHtml(movie.title)}</h4>
                    <div class="movie-mini-times">
                        ${movie.times.slice(0, 4).map(t => `<span class="movie-mini-time">${t.show_time.substring(0, 5)}</span>`).join('')}
                        ${movie.times.length > 4 ? `<span class="movie-mini-time">+${movie.times.length - 4}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <div class="cinema-section">
                <div class="cinema-header">
                    <div class="cinema-logo">
                        ${logoUrl ? `<img src="${logoUrl}" alt="${Utils.escapeHtml(cinema.name)}" onerror="this.parentElement.innerHTML='🎬'">` : '🎬'}
                    </div>
                    <div class="cinema-details">
                        <h2 class="cinema-name">${Utils.escapeHtml(cinema.name)}</h2>
                        ${cinema.address ? `<p class="cinema-address">📍 ${Utils.escapeHtml(cinema.address)}</p>` : ''}
                        ${features.length > 0 ? `
                            <div class="cinema-features">
                                ${features.map(f => `<span class="cinema-feature">${Utils.escapeHtml(f)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="cinema-actions">
                        ${cinema.phone ? `<a href="tel:${cinema.phone}" class="cinema-action-btn phone">📞 Llamar</a>` : ''}
                        ${cinema.latitude && cinema.longitude ? `<a href="https://www.google.com/maps?q=${cinema.latitude},${cinema.longitude}" target="_blank" class="cinema-action-btn map">🗺️ Mapa</a>` : ''}
                    </div>
                </div>
                <div class="cinema-movies">
                    ${Object.keys(movieGroups).length > 0 ? `
                        <div class="cinema-movies-grid">${moviesHtml}</div>
                    ` : '<p style="color: #64748b; text-align: center; padding: 2rem;">No hay peliculas en cartelera para esta fecha</p>'}
                </div>
            </div>
        `;
    }

    // Cargar horarios y renderizar
    async function loadShowtimes() {
        const container = document.getElementById('content-area');
        container.innerHTML = '<div class="cine-loading"><div class="spinner spinner-lg"></div></div>';

        try {
            const params = { date: currentDate };
            if (currentCinema) params.cinema_id = currentCinema;

            const response = await api.getShowtimes(params);
            showtimes = response.data || [];

            if (showtimes.length === 0) {
                container.innerHTML = `
                    <div class="cine-empty">
                        <div class="cine-empty-icon">🎬</div>
                        <p class="cine-empty-text">No hay funciones para esta fecha</p>
                        <p class="cine-empty-hint">Proba seleccionando otra fecha o cine</p>
                    </div>
                `;
                return;
            }

            if (currentView === 'movies') {
                renderMoviesView();
            } else {
                renderCinemasView();
            }
        } catch (e) {
            console.error('Error cargando cartelera:', e);
            container.innerHTML = `
                <div class="cine-empty">
                    <div class="cine-empty-icon">❌</div>
                    <p class="cine-empty-text">Error cargando cartelera</p>
                </div>
            `;
        }
    }

    // Vista por peliculas
    function renderMoviesView() {
        const container = document.getElementById('content-area');

        // Agrupar showtimes por pelicula
        const movieMap = {};
        showtimes.forEach(st => {
            if (!movieMap[st.movie_id]) {
                movieMap[st.movie_id] = {
                    movie: {
                        id: st.movie_id,
                        title: st.movie_title,
                        poster_url: st.poster_url,
                        duration: st.duration,
                        rating: st.rating,
                        synopsis: st.synopsis,
                        genre: st.genre
                    },
                    showtimes: []
                };
            }
            movieMap[st.movie_id].showtimes.push(st);
        });

        const html = Object.values(movieMap).map(m => renderMovieCard(m.movie, m.showtimes)).join('');
        container.innerHTML = `<div class="cine-movies-grid">${html}</div>`;
    }

    // Vista por cines
    function renderCinemasView() {
        const container = document.getElementById('content-area');

        // Agrupar showtimes por cine
        const cinemaMap = {};
        showtimes.forEach(st => {
            if (!cinemaMap[st.cinema_id]) {
                // Buscar info del cine
                const cinema = cinemas.find(c => c.id == st.cinema_id) || {
                    id: st.cinema_id,
                    name: st.cinema_name,
                    address: st.cinema_address
                };
                cinemaMap[st.cinema_id] = {
                    cinema: cinema,
                    showtimes: []
                };
            }
            cinemaMap[st.cinema_id].showtimes.push(st);
        });

        const html = Object.values(cinemaMap).map(c => renderCinemaSection(c.cinema, c.showtimes)).join('');
        container.innerHTML = html;
    }

    // Cambiar vista
    function setView(view) {
        currentView = view;
        document.querySelectorAll('.cine-view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        if (showtimes.length > 0) {
            if (view === 'movies') {
                renderMoviesView();
            } else {
                renderCinemasView();
            }
        }
    }

    // Cargar cines para el filtro
    async function loadCinemas() {
        try {
            const response = await api.getCinemas({});
            cinemas = response.data || [];

            const select = document.getElementById('cinema-filter');
            if (select && cinemas.length > 0) {
                cinemas.forEach(cinema => {
                    const option = document.createElement('option');
                    option.value = cinema.id;
                    option.textContent = cinema.name;
                    select.appendChild(option);
                });
            }
        } catch (e) {
            console.error('Error cargando cines:', e);
        }
    }

    // Cargar proximos estrenos para widget
    async function loadUpcomingMovies() {
        try {
            const response = await api.getMovies({ status: 'coming_soon' });
            upcomingMovies = (response.data || []).slice(0, 3);
            renderUpcomingWidget();
        } catch (e) {
            console.error('Error cargando proximos estrenos:', e);
        }
    }

    // Renderizar widget de proximos estrenos
    function renderUpcomingWidget() {
        const container = document.getElementById('upcoming-movies');
        if (!container || upcomingMovies.length === 0) return;

        container.innerHTML = upcomingMovies.map(movie => {
            const releaseDate = movie.release_date ? new Date(movie.release_date) : null;
            const dateStr = releaseDate ? `${releaseDate.getDate()} ${monthNames[releaseDate.getMonth()]}` : 'Proximamente';

            return `
                <div class="upcoming-movie">
                    <div class="upcoming-poster">
                        <img src="${movie.poster_url || '/assets/placeholder-movie.jpg'}" alt="${Utils.escapeHtml(movie.title)}" onerror="Utils.handleImageError(this)">
                    </div>
                    <div class="upcoming-info">
                        <h4 class="upcoming-title">${Utils.escapeHtml(movie.title)}</h4>
                        <p class="upcoming-date">🗓️ ${dateStr}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Mostrar detalle de pelicula en modal
    async function showMovieDetail(movieId) {
        // Buscar la pelicula en los showtimes actuales
        const movieShowtimes = showtimes.filter(st => st.movie_id == movieId);
        if (movieShowtimes.length === 0) return;

        const st = movieShowtimes[0];
        const movie = {
            id: st.movie_id,
            title: st.movie_title,
            poster_url: st.poster_url,
            backdrop_url: st.backdrop_url,
            duration: st.duration,
            rating: st.rating,
            synopsis: st.synopsis,
            genre: st.genre,
            director: st.director,
            cast: st.cast,
            trailer_url: st.trailer_url
        };

        // Agrupar horarios por cine
        const cinemaGroups = {};
        movieShowtimes.forEach(s => {
            if (!cinemaGroups[s.cinema_id]) {
                cinemaGroups[s.cinema_id] = {
                    name: s.cinema_name,
                    address: s.cinema_address,
                    times: []
                };
            }
            cinemaGroups[s.cinema_id].times.push(s);
        });

        const genres = parseGenres(movie.genre);
        const ratingClass = getRatingClass(movie.rating);

        // Crear modal
        let modal = document.getElementById('movie-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'movie-modal';
            modal.className = 'movie-modal';
            document.body.appendChild(modal);
        }

        // Generar HTML de horarios
        let showtimesHtml = '';
        for (const cinemaId in cinemaGroups) {
            const group = cinemaGroups[cinemaId];
            showtimesHtml += `
                <div class="modal-cinema-group">
                    <div class="modal-cinema-name">🎬 ${Utils.escapeHtml(group.name)}</div>
                    ${group.address ? `<div class="modal-cinema-address">📍 ${Utils.escapeHtml(group.address)}</div>` : ''}
                    <div class="modal-showtime-chips">
                        ${group.times.map(t => `
                            <div class="modal-showtime-chip">
                                <span class="time">${t.show_time.substring(0, 5)}</span>
                                <span class="format">${t.format || '2D'} - ${t.language === 'doblada' ? 'Doblada' : 'Subtitulada'}</span>
                                ${t.price ? `<span class="price">$${t.price}</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        modal.innerHTML = `
            <div class="movie-modal-overlay" onclick="CineModule.closeModal()"></div>
            <div class="movie-modal-content">
                <button class="movie-modal-close" onclick="CineModule.closeModal()">✕</button>

                <div class="movie-modal-header">
                    <div class="movie-modal-poster">
                        <img src="${movie.poster_url || '/assets/placeholder-movie.jpg'}" alt="${Utils.escapeHtml(movie.title)}" onerror="Utils.handleImageError(this)">
                    </div>
                    <div class="movie-modal-info">
                        <h2 class="movie-modal-title">${Utils.escapeHtml(movie.title)}</h2>
                        <div class="movie-modal-meta">
                            ${movie.rating ? `<span class="movie-rating ${ratingClass}">${movie.rating}</span>` : ''}
                            ${movie.duration ? `<span class="movie-meta-item">🕐 ${formatDuration(movie.duration)}</span>` : ''}
                            ${genres.length > 0 ? `<span class="movie-meta-item">🎭 ${genres.join(', ')}</span>` : ''}
                        </div>
                        ${movie.director ? `<p class="movie-modal-director"><strong>Director:</strong> ${Utils.escapeHtml(movie.director)}</p>` : ''}
                        ${movie.synopsis ? `<p class="movie-modal-synopsis">${Utils.escapeHtml(movie.synopsis)}</p>` : ''}
                        ${movie.trailer_url ? `
                            <a href="${movie.trailer_url}" target="_blank" rel="noopener" class="movie-modal-trailer-btn">
                                ▶️ Ver Trailer
                            </a>
                        ` : ''}
                    </div>
                </div>

                <div class="movie-modal-showtimes">
                    <h3 class="movie-modal-showtimes-title">🎟️ Funciones Disponibles</h3>
                    ${showtimesHtml}
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Cerrar modal
    function closeModal() {
        const modal = document.getElementById('movie-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
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
                <a href="/perfil.html" class="btn btn-block mb-2" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); color: #fff;">Mi Perfil</a>
                ${user.role === 'admin' || user.role === 'editor' ? '<a href="/editor/" class="btn btn-block mb-2" style="background: transparent; border: 1px solid #ef4444; color: #e2e8f0;">Panel de Editor</a>' : ''}
                <button class="btn btn-block" style="background: transparent; border: 1px solid rgba(239, 68, 68, 0.5); color: #f87171;" onclick="auth.logout()">Cerrar Sesion</button>
            `;
        }
    }

    // Inicializacion
    async function init() {
        // Renderizar selector de fechas
        renderDateSelector();

        // Cargar cines
        await loadCinemas();

        // Leer parametros URL
        const params = Utils.getUrlParams();
        if (params.cinema) {
            currentCinema = params.cinema;
            const select = document.getElementById('cinema-filter');
            if (select) select.value = currentCinema;
        }
        if (params.date) {
            currentDate = params.date;
            renderDateSelector();
        }
        if (params.view) {
            currentView = params.view;
        }

        // Actualizar tabs activos
        document.querySelectorAll('.cine-view-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === currentView);
        });

        // Cargar cartelera
        loadShowtimes();

        // Cargar proximos estrenos
        loadUpcomingMovies();

        // Event listeners
        const cinemaFilter = document.getElementById('cinema-filter');
        if (cinemaFilter) {
            cinemaFilter.addEventListener('change', () => {
                currentCinema = cinemaFilter.value;
                loadShowtimes();
                Utils.updateUrl({ cinema: currentCinema || null, date: currentDate, view: currentView });
            });
        }

        // Tabs de vista
        document.querySelectorAll('.cine-view-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                setView(tab.dataset.view);
                Utils.updateUrl({ cinema: currentCinema || null, date: currentDate, view: currentView });
            });
        });

        // Actualizar widget de usuario
        updateUserWidget();
    }

    // Exponer API publica
    window.CineModule = {
        init: init,
        loadShowtimes: loadShowtimes,
        setView: setView,
        showMovieDetail: showMovieDetail,
        closeModal: closeModal
    };

    // Inicializar cuando el DOM este listo
    document.addEventListener('DOMContentLoaded', init);

})();
