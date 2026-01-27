/**
 * EVENTOS - Modal, suscripciones y carga de datos
 * Requiere: eventos-core.js
 */

// =============================================
// MODAL DE EVENTO
// =============================================

async function openEventModal(eventId) {
    try {
        const response = await api.getEventById(eventId);
        if (response.success && response.data) {
            const event = response.data;
            currentEvent = event;

            const dateInfo = formatEventDate(event.event_date);
            const isFree = !event.price || event.price === 0;
            const imageUrl = getImageUrl(event.image_url);
            const registration = userRegistrations[event.id];
            const isLoggedIn = typeof auth !== 'undefined' && auth.isAuthenticated();

            document.getElementById('event-modal-image').src = imageUrl;
            document.getElementById('event-modal-day').textContent = dateInfo.day;
            document.getElementById('event-modal-month').textContent = dateInfo.month;
            document.getElementById('event-modal-title').textContent = event.title;
            document.getElementById('event-modal-category').textContent = event.category_name || 'Evento';
            document.getElementById('event-modal-description').textContent = event.description || 'Sin descripcion disponible.';

            document.getElementById('event-modal-location').textContent = event.location || event.address || 'Por confirmar';
            document.getElementById('event-modal-time').textContent = event.event_time ? formatEventTime(event.event_time) : 'Por confirmar';
            document.getElementById('event-modal-price').textContent = formatEventPrice(event.price);
            document.getElementById('event-modal-zone').textContent = event.zone_name || 'Santiago del Estero';

            const subscribeBtn = document.getElementById('btn-modal-subscribe');
            const subscribeInfo = document.getElementById('event-modal-subscribe-info');

            if (registration) {
                subscribeBtn.innerHTML = `<span>✓</span> ${registration.status === 'confirmado' ? 'Inscripcion Confirmada' : 'Inscripcion Pendiente'}`;
                subscribeBtn.classList.add('subscribed');
                subscribeBtn.disabled = true;

                if (registration.status === 'confirmado' && registration.registration_code) {
                    subscribeInfo.innerHTML = `
                        <div class="registration-status confirmado">Tu codigo: <strong>${registration.registration_code}</strong></div>
                        <p style="margin-top: 0.5rem; font-size: 0.8rem;">Presenta este codigo en la entrada del evento.</p>
                    `;
                } else if (registration.status === 'pendiente') {
                    subscribeInfo.innerHTML = `
                        <div class="registration-status pendiente">Esperando confirmacion del organizador</div>
                        <p style="margin-top: 0.5rem; font-size: 0.8rem;">${isFree ? 'Tu inscripcion sera confirmada pronto.' : 'Contacta al organizador para confirmar el pago.'}</p>
                    `;
                }
            } else if (isLoggedIn) {
                subscribeBtn.innerHTML = '<span>📝</span> Inscribirme a este evento';
                subscribeBtn.classList.remove('subscribed');
                subscribeBtn.disabled = false;
                subscribeBtn.onclick = () => subscribeToEventFromModal();

                subscribeInfo.innerHTML = isFree
                    ? '<p>Este evento es <strong style="color: #22c55e;">gratuito</strong>. Tu inscripcion sera confirmada inmediatamente.</p>'
                    : '<p>Este evento tiene un costo de <strong style="color: #22c55e;">' + formatEventPrice(event.price) + '</strong>. Despues de inscribirte, el organizador te contactara para coordinar el pago.</p>';
            } else {
                subscribeBtn.innerHTML = '<span>🔒</span> Inicia sesion para inscribirte';
                subscribeBtn.classList.remove('subscribed');
                subscribeBtn.disabled = false;
                subscribeBtn.onclick = () => window.location.href = '/login.html';
                subscribeInfo.innerHTML = '<p>Necesitas una cuenta para inscribirte a eventos.</p>';
            }

            const whatsappSection = document.getElementById('event-modal-whatsapp');
            if (!isFree && (event.whatsapp || event.phone)) {
                const whatsappNumber = (event.whatsapp || event.phone).replace(/\D/g, '');
                const fullNumber = whatsappNumber.startsWith('549') ? whatsappNumber : `549${whatsappNumber}`;
                const message = encodeURIComponent(`Hola! Estoy interesado en el evento "${event.title}" del ${dateInfo.day} ${dateInfo.month}. Precio: ${formatEventPrice(event.price)}. ¿Como puedo inscribirme?`);
                whatsappSection.innerHTML = `
                    <a href="https://wa.me/${fullNumber}?text=${message}" target="_blank" class="btn-whatsapp-event">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Consultar por WhatsApp
                    </a>
                `;
                whatsappSection.style.display = 'block';
            } else {
                whatsappSection.style.display = 'none';
            }

            document.getElementById('event-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (e) {
        console.error('Error loading event:', e);
        if (typeof Components !== 'undefined') {
            Components.toast('Error cargando evento', 'danger');
        }
    }
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
    document.body.style.overflow = '';
    currentEvent = null;
}

// =============================================
// SUSCRIPCION A EVENTOS
// =============================================

async function subscribeToEvent(eventId, e) {
    if (e) e.stopPropagation();

    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    const btn = e?.target?.closest('.btn-event-subscribe');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span>';
    }

    try {
        const response = await api.registerToEvent(eventId);

        if (response.success) {
            const data = response.data;

            userRegistrations[eventId] = {
                status: data.status,
                registration_code: data.registration_code
            };

            if (btn) {
                btn.innerHTML = `<span>✓</span> ${data.status === 'confirmado' ? 'Inscrito' : 'Pendiente'}`;
                btn.classList.add('subscribed');
            }

            if (data.is_free) {
                Components.toast('Inscripcion confirmada! Tu codigo: ' + data.registration_code, 'success', 5000);
            } else {
                Components.toast('Inscripcion registrada. Contacta al organizador para confirmar el pago.', 'info', 5000);

                if (data.whatsapp?.url) {
                    setTimeout(() => {
                        if (confirm('¿Queres contactar al organizador por WhatsApp?')) {
                            window.open(data.whatsapp.url, '_blank');
                        }
                    }, 1000);
                }
            }

            if (featuredEvent && featuredEvent.id === eventId) {
                showHero();
            }
        }
    } catch (e) {
        console.error('Error subscribing:', e);
        Components.toast(e.message || 'Error al inscribirse', 'danger');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span>📝</span> Inscribirse';
        }
    }
}

async function subscribeToEventFromModal() {
    if (!currentEvent) return;

    const btn = document.getElementById('btn-modal-subscribe');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;"></span> Procesando...';

    try {
        const response = await api.registerToEvent(currentEvent.id);

        if (response.success) {
            const data = response.data;

            userRegistrations[currentEvent.id] = {
                status: data.status,
                registration_code: data.registration_code
            };

            btn.innerHTML = `<span>✓</span> ${data.status === 'confirmado' ? 'Inscripcion Confirmada' : 'Inscripcion Pendiente'}`;
            btn.classList.add('subscribed');

            const subscribeInfo = document.getElementById('event-modal-subscribe-info');
            if (data.status === 'confirmado') {
                subscribeInfo.innerHTML = `
                    <div class="registration-status confirmado">Tu codigo: <strong>${data.registration_code}</strong></div>
                    <p style="margin-top: 0.5rem; font-size: 0.8rem;">Presenta este codigo en la entrada del evento.</p>
                `;
            } else {
                subscribeInfo.innerHTML = `
                    <div class="registration-status pendiente">Esperando confirmacion del organizador</div>
                `;
            }

            Components.toast(response.message, 'success', 5000);
            loadEvents(currentPage);
        }
    } catch (e) {
        console.error('Error subscribing:', e);
        Components.toast(e.message || 'Error al inscribirse', 'danger');
        btn.disabled = false;
        btn.innerHTML = '<span>📝</span> Inscribirme a este evento';
    }
}

// =============================================
// CARGA DE DATOS
// =============================================

async function loadUserRegistrations() {
    if (!auth.isAuthenticated()) return;

    try {
        const response = await api.getMyEventRegistrations({ upcoming: 1 });
        if (response.success && response.data.registrations) {
            response.data.registrations.forEach(reg => {
                userRegistrations[reg.event_id] = {
                    status: reg.registration_status,
                    registration_code: reg.registration_code
                };
            });
        }
    } catch (e) {
        console.error('Error loading user registrations:', e);
    }
}

// Variables para guardar los eventos del hero
let heroMainEvent = null;
let heroFeaturedEvent = null;
let heroSpecialEvent = null;

// Cargar hero de proximos eventos (siempre visible)
async function loadHero() {
    console.log('loadHero: starting...');
    try {
        // Cargar en paralelo: proximo evento, evento destacado, evento especial
        const [mainResponse, featuredResponse, specialResponse, countResponse] = await Promise.all([
            api.getEvents({ page: 1, limit: 1, upcoming: 1 }),
            api.getEvents({ page: 1, limit: 1, upcoming: 1, is_featured: 1 }),
            api.getEvents({ page: 1, limit: 1, upcoming: 1, is_special: 1 }),
            api.getEvents({ page: 1, limit: 1, upcoming: 1 }) // Para el contador
        ]);

        console.log('loadHero: responses:', { mainResponse, featuredResponse, specialResponse });

        // Evento principal (proximo)
        heroMainEvent = mainResponse.success && mainResponse.data?.events?.length > 0
            ? mainResponse.data.events[0]
            : null;

        // Evento destacado
        heroFeaturedEvent = featuredResponse.success && featuredResponse.data?.events?.length > 0
            ? featuredResponse.data.events[0]
            : null;

        // Evento especial
        heroSpecialEvent = specialResponse.success && specialResponse.data?.events?.length > 0
            ? specialResponse.data.events[0]
            : null;

        if (heroMainEvent) {
            console.log('loadHero: rendering hero');
            renderHero(heroMainEvent, heroFeaturedEvent, heroSpecialEvent);

            // Actualizar contador de proximos
            const tabCount = document.getElementById('tab-count-upcoming');
            if (tabCount && countResponse.success) {
                tabCount.textContent = countResponse.data.pagination.total || 0;
            }
        } else {
            console.log('loadHero: no main event, hiding hero');
            document.getElementById('events-hero-container').style.display = 'none';
        }
    } catch (e) {
        console.error('loadHero error:', e);
        document.getElementById('events-hero-container').style.display = 'none';
    }
}

// Mostrar el hero (llamar despues de filtrar si se oculto)
function showHero() {
    if (heroMainEvent) {
        renderHero(heroMainEvent, heroFeaturedEvent, heroSpecialEvent);
    }
}

async function loadEvents(page = 1) {
    currentPage = page;
    const eventsGrid = document.getElementById('events-grid');

    if (!eventsGrid) {
        console.error('loadEvents: events-grid not found');
        return;
    }

    console.log('loadEvents: starting, page:', page);
    eventsGrid.innerHTML = renderSkeletons(6);

    const params = {
        page,
        limit: 12
    };

    if (currentCategory) {
        params.category = currentCategory;
    }

    switch (currentFilter) {
        case 'upcoming':
            params.upcoming = 1;
            break;
        case 'week':
            params.upcoming = 1;
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() + 7);
            params.dateTo = weekEnd.toISOString().split('T')[0];
            break;
        case 'free':
            params.upcoming = 1;
            params.free = 1;
            break;
        case 'all':
            break;
    }

    console.log('loadEvents: params:', params);

    try {
        console.log('loadEvents: calling api.getEvents');
        const response = await api.getEvents(params);
        console.log('loadEvents: response:', response);

        if (response.success && response.data && response.data.events && response.data.events.length > 0) {
            const events = response.data.events;
            console.log('loadEvents: got', events.length, 'events');

            // Mostrar los eventos como cards en el grid
            console.log('loadEvents: rendering', events.length, 'cards in grid');
            eventsGrid.innerHTML = events.map(e => renderEventCard(e)).join('');

            if (currentView === 'list') {
                eventsGrid.classList.add('list-view');
            }

            renderPagination(response.data.pagination.page, response.data.pagination.pages);

            const resultsCount = document.getElementById('results-count');
            if (resultsCount) {
                resultsCount.textContent = response.data.pagination.total || events.length;
            }
        } else {
            eventsGrid.innerHTML = `
                <div class="events-empty">
                    <div class="events-empty-icon">📅</div>
                    <h3>No hay eventos</h3>
                    <p>No se encontraron eventos con los filtros seleccionados.</p>
                </div>
            `;
            const paginationEl = document.getElementById('pagination');
            if (paginationEl) paginationEl.innerHTML = '';

            const resultsCount = document.getElementById('results-count');
            if (resultsCount) resultsCount.textContent = '0';
        }

        // Siempre mostrar el hero despues de cargar eventos
        showHero();

    } catch (e) {
        console.error('loadEvents ERROR:', e);
        eventsGrid.innerHTML = `
            <div class="events-empty">
                <div class="events-empty-icon">⚠️</div>
                <h3>Error cargando eventos</h3>
                <p>${e.message || 'Por favor, intenta de nuevo mas tarde.'}</p>
            </div>
        `;

        const paginationEl = document.getElementById('pagination');
        if (paginationEl) paginationEl.innerHTML = '';

        // Mostrar hero incluso si hay error en el grid
        showHero();
    }
}

async function loadCategories() {
    try {
        const response = await api.getCategories('eventos');
        if (response.success && response.data) {
            allCategories = response.data;
            initCategoryChips();
        }
    } catch (e) {
        console.error('Error loading categories:', e);
    }
}

// =============================================
// INICIALIZACION
// =============================================

function initEventos() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('event-modal-overlay')) {
                closeEventModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeEventModal();
    });

    initTabs();
    initViewToggle();
}

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('eventos.js: DOMContentLoaded');

    // Verificar dependencias
    if (typeof api === 'undefined') {
        console.error('eventos.js: api not defined!');
        return;
    }
    if (typeof renderEventCard === 'undefined') {
        console.error('eventos.js: renderEventCard not defined (eventos-core.js missing?)');
        return;
    }

    console.log('eventos.js: dependencies OK');

    initEventos();

    const params = typeof Utils !== 'undefined' ? Utils.getUrlParams() : {};
    if (params.category) currentCategory = params.category;

    // Cargar todo de forma asincrona
    (async () => {
        // PRIMERO cargar las inscripciones del usuario (para mostrar estado correcto)
        await loadUserRegistrations().catch((e) => console.warn('loadUserRegistrations error:', e));

        // Luego cargar el hero (siempre visible)
        await loadHero().catch((e) => console.warn('loadHero error:', e));

        // Luego cargar eventos del grid
        loadEvents(parseInt(params.page) || 1);

        // Cargar categorias en paralelo
        loadCategories().catch((e) => console.warn('loadCategories error:', e));
    })();

    if (typeof Components !== 'undefined') {
        Components.renderUserWidget();
    }
});
