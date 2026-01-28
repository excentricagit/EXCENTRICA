/**
 * TRANSPORTE - Interfaz mejorada
 * Publico (colectivos - bus_lines) y Privado (taxis/remises - transport)
 */

// Estado global
let currentPage = 1;
let currentType = 'public'; // 'public' o 'private'
let currentTransport = null;
let publicCount = 0;
let privateCount = 0;

// Configuracion de contacto
const CONTACT_CONFIG = {
    WHATSAPP: '5493854356825'
};

// =============================================
// UTILIDADES
// =============================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function formatPrice(price) {
    if (!price) return 'Consultar';
    return '$' + Number(price).toLocaleString('es-AR');
}

function getPrivateIcon(transport) {
    const name = (transport.name || transport.title || '').toLowerCase();
    if (name.includes('taxi')) return '🚕';
    if (name.includes('remis') || name.includes('remise')) return '🚗';
    if (name.includes('combi') || name.includes('van') || name.includes('transfer')) return '🚐';
    return '🚕';
}

function getPrivateType(transport) {
    if (transport.vehicle_type) {
        const types = { 'remis': 'Remis', 'taxi': 'Taxi', 'uber': 'App', 'particular': 'Particular' };
        return types[transport.vehicle_type] || 'Transporte';
    }
    const name = (transport.name || transport.title || '').toLowerCase();
    if (name.includes('taxi')) return 'Taxi';
    if (name.includes('remis') || name.includes('remise')) return 'Remis';
    if (name.includes('combi')) return 'Combi';
    return 'Transporte';
}

function parseStops(routeDescription) {
    if (!routeDescription) return [];
    // Intentar separar por diferentes delimitadores
    let stops = routeDescription.split(/[,\-\>→]/).map(s => s.trim()).filter(s => s);
    return stops.slice(0, 8); // Maximo 8 paradas
}

function formatSchedule(schedule) {
    if (!schedule) return '';
    // Si tiene formato detallado por día (Lun: 06:00 - 22:00...), extraer solo el rango
    const timeMatch = schedule.match(/(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/);
    if (timeMatch) {
        return `${timeMatch[1]} - ${timeMatch[2]}`;
    }
    // Si es muy largo, truncar
    if (schedule.length > 20) {
        return schedule.substring(0, 17) + '...';
    }
    return schedule;
}

function parseScheduleByDay(schedule) {
    if (!schedule) return null;

    // Buscar patron: "Dia: HH:MM - HH:MM"
    const dayPatterns = [
        { key: 'lun', label: 'Lun', regex: /lun[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'mar', label: 'Mar', regex: /mar[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'mie', label: 'Mie', regex: /mi[eé][a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'jue', label: 'Jue', regex: /jue[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'vie', label: 'Vie', regex: /vie[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'sab', label: 'Sab', regex: /s[aá]b[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i },
        { key: 'dom', label: 'Dom', regex: /dom[a-z]*:?\s*(\d{1,2}:\d{2})\s*[-a]\s*(\d{1,2}:\d{2})/i }
    ];

    const result = [];
    for (const pattern of dayPatterns) {
        const match = schedule.match(pattern.regex);
        if (match) {
            result.push({ day: pattern.label, time: `${match[1]}-${match[2]}` });
        }
    }

    return result.length > 0 ? result : null;
}

// =============================================
// WHATSAPP
// =============================================

function getWhatsAppLink(transport, isPrivate = false) {
    const phone = transport.phone || CONTACT_CONFIG.WHATSAPP;
    const cleanNumber = phone.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('549') ? cleanNumber : `549${cleanNumber}`;

    let message;
    if (isPrivate) {
        message = `Hola! Necesito un servicio de ${getPrivateType(transport)}. Podrian ayudarme?`;
    } else {
        message = `Hola! Necesito informacion sobre la Linea ${transport.line_number || ''} (${transport.name}).`;
    }

    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
}

// =============================================
// RENDERIZADO - COLECTIVOS (bus_lines)
// =============================================

function renderBusCard(busLine) {
    const stops = parseStops(busLine.route_description);
    const mainRoute = stops.length >= 2 ? `${stops[0]} → ${stops[stops.length - 1]}` : busLine.route_description || '';
    const color = busLine.color || '#3b82f6';
    const scheduleByDay = parseScheduleByDay(busLine.schedule);
    const scheduleShort = formatSchedule(busLine.schedule);

    // Renderizar horarios por dia o version corta
    let scheduleHtml = '';
    if (scheduleByDay && scheduleByDay.length > 0) {
        scheduleHtml = `
            <div class="bus-card-schedule">
                <div class="bus-schedule-header">
                    <span>🕐</span> Horarios
                </div>
                <div class="bus-schedule-grid">
                    ${scheduleByDay.map(s => `
                        <div class="bus-schedule-item">
                            <span class="bus-schedule-day">${s.day}</span>
                            <span class="bus-schedule-time">${s.time}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <article class="bus-card" onclick="openBusModal(${busLine.id})">
            <div class="bus-card-header">
                <div class="bus-line-badge" style="background: linear-gradient(135deg, ${color}, ${color}dd);">${escapeHtml(busLine.line_number) || '?'}</div>
                <div class="bus-card-info">
                    <h3 class="bus-card-name">${escapeHtml(busLine.name)}</h3>
                    <div class="bus-card-route">${escapeHtml(mainRoute)}</div>
                </div>
            </div>

            ${scheduleHtml}

            <div class="bus-card-footer">
                <div class="bus-card-details">
                    ${!scheduleByDay && scheduleShort ? `
                        <div class="bus-detail">
                            <span class="bus-detail-icon">🕐</span>
                            <span class="bus-detail-value">${escapeHtml(scheduleShort)}</span>
                        </div>
                    ` : ''}
                    ${busLine.price ? `
                        <div class="bus-detail">
                            <span class="bus-detail-icon">💵</span>
                            <span class="bus-detail-value">${formatPrice(busLine.price)}</span>
                        </div>
                    ` : ''}
                    ${busLine.company ? `
                        <div class="bus-detail">
                            <span class="bus-detail-icon">🚌</span>
                            <span class="bus-detail-value">${escapeHtml(busLine.company)}</span>
                        </div>
                    ` : ''}
                </div>
                <button class="btn-bus-info" onclick="event.stopPropagation(); openBusModal(${busLine.id})">Ver mas</button>
            </div>
        </article>
    `;
}

// =============================================
// RENDERIZADO - TRANSPORTE PRIVADO
// =============================================

function renderPrivateCard(transport) {
    const icon = getPrivateIcon(transport);
    const type = getPrivateType(transport);
    const name = transport.title || transport.name;
    const is24h = transport.is_24h || (transport.schedule && transport.schedule.toLowerCase().includes('24'));
    const whatsappLink = getWhatsAppLink(transport, true);

    const whatsappSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    return `
        <article class="private-card ${transport.featured ? 'featured' : ''}">
            <div class="private-card-header">
                <div class="private-type-icon">${icon}</div>
                <div class="private-card-info">
                    <h3 class="private-card-name">${escapeHtml(name)}</h3>
                    <div class="private-card-type">${type}</div>
                </div>
            </div>

            <div class="private-card-availability ${is24h ? '' : 'limited'}">
                <span class="availability-dot"></span>
                ${is24h ? 'Disponible 24 horas' : escapeHtml(transport.schedule) || 'Consultar disponibilidad'}
            </div>

            ${transport.zone_name ? `
                <div class="private-card-zone">
                    <span>📍</span>
                    ${escapeHtml(transport.zone_name)}
                </div>
            ` : ''}

            <div class="private-card-actions">
                <a href="${whatsappLink}" target="_blank" class="btn-private-whatsapp" onclick="event.stopPropagation();">
                    ${whatsappSvg} WhatsApp
                </a>
            </div>
        </article>
    `;
}

// =============================================
// PAGINACION
// =============================================

function renderPagination(current, total) {
    const container = document.getElementById('pagination');
    if (!container || total <= 1) {
        if (container) container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';
    html += `<button class="pagination-btn" onclick="loadTransport(${current - 1})" ${current <= 1 ? 'disabled' : ''}>Anterior</button>`;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="loadTransport(${i})">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
            html += '<span style="color: #6b7280; padding: 0.5rem;">...</span>';
        }
    }

    html += `<button class="pagination-btn" onclick="loadTransport(${current + 1})" ${current >= total ? 'disabled' : ''}>Siguiente</button>`;
    html += '</div>';

    container.innerHTML = html;
}

// =============================================
// MODALES
// =============================================

async function openBusModal(busLineId) {
    try {
        const response = await api.getBusLineById(busLineId);
        if (!response.success || !response.data) return;

        const busLine = response.data;
        currentTransport = busLine;
        const stops = busLine.stops || [];
        const routeStops = parseStops(busLine.route_description);
        const color = busLine.color || '#3b82f6';
        const allStops = stops.length > 0 ? stops.map(s => ({ name: s.name, type: s.stop_type })) : routeStops.map(s => ({ name: s, type: null }));

        const modal = document.getElementById('transport-modal');
        modal.innerHTML = `
            <div class="modal-bus">
                <button class="modal-close" onclick="closeModal()">&times;</button>

                <div class="modal-bus-header" style="background: linear-gradient(135deg, ${color}22, ${color}0a);">
                    <div class="modal-line-badge" style="background: linear-gradient(135deg, ${color}, ${color}dd);">${escapeHtml(busLine.line_number) || '?'}</div>
                    <div class="modal-bus-title">
                        <h2>${escapeHtml(busLine.name)}</h2>
                        <p>${routeStops.length >= 2 ? `${routeStops[0]} → ${routeStops[routeStops.length - 1]}` : 'Recorrido urbano'}</p>
                    </div>
                </div>

                <div class="modal-body">
                    <div class="modal-info-grid">
                        <div class="modal-info-item">
                            <div class="modal-info-label">Empresa</div>
                            <div class="modal-info-value">${escapeHtml(busLine.company) || 'Municipal'}</div>
                        </div>
                        <div class="modal-info-item">
                            <div class="modal-info-label">Horario</div>
                            <div class="modal-info-value">${escapeHtml(busLine.schedule) || 'Consultar'}</div>
                        </div>
                        <div class="modal-info-item">
                            <div class="modal-info-label">Tarifa</div>
                            <div class="modal-info-value fare">${busLine.price ? formatPrice(busLine.price) : 'Consultar'}</div>
                        </div>
                    </div>

                    ${allStops.length > 0 ? `
                        <div class="modal-section">
                            <div class="modal-section-title">🚏 Recorrido</div>
                            <div class="modal-route-visual">
                                ${allStops.map((stop, i) => `
                                    <div class="route-stop">
                                        <div class="route-stop-dot" style="background: linear-gradient(135deg, ${color}, ${color}dd);">${i + 1}</div>
                                        <div class="route-stop-name">${escapeHtml(stop.name)}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (e) {
        console.error('Error loading bus line:', e);
    }
}

function closeModal() {
    document.getElementById('transport-modal').classList.remove('active');
    document.body.style.overflow = '';
    currentTransport = null;
}

// =============================================
// TABS
// =============================================

function switchTab(type) {
    currentType = type;
    currentPage = 1;

    // Actualizar tabs activos
    document.querySelectorAll('.transport-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });

    // Actualizar clase del grid
    const grid = document.getElementById('transport-grid');
    grid.classList.remove('public-grid', 'private-grid');
    grid.classList.add(type === 'public' ? 'public-grid' : 'private-grid');

    // Actualizar placeholder de busqueda
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.placeholder = type === 'public'
            ? 'Buscar linea o destino...'
            : 'Buscar taxi, remis...';
    }

    loadTransport(1);
}

// =============================================
// CARGA DE DATOS
// =============================================

async function loadTransport(page = 1) {
    currentPage = page;
    const search = document.getElementById('search-input')?.value || '';
    const grid = document.getElementById('transport-grid');

    if (!grid) return;

    grid.innerHTML = '<div class="transport-empty"><div class="spinner spinner-lg mx-auto"></div></div>';

    try {
        let response;
        let items = [];

        if (currentType === 'public') {
            // Cargar colectivos desde bus_lines
            response = await api.getBusLines({ page, limit: 12, search });
            items = response.success ? (response.data.items || []) : [];
        } else {
            // Cargar transporte privado desde transport
            response = await api.getTransport({ page, limit: 12, search, type: 'private' });
            items = response.success ? (response.data.items || []) : [];
        }

        if (items.length > 0) {
            if (currentType === 'public') {
                grid.innerHTML = items.map(t => renderBusCard(t)).join('');
            } else {
                grid.innerHTML = items.map(t => renderPrivateCard(t)).join('');
            }

            const total = response.data.pagination?.total || items.length;
            const resultsEl = document.getElementById('results-count');
            if (resultsEl) {
                resultsEl.textContent = `${total} ${currentType === 'public' ? 'linea' : 'servicio'}${total !== 1 ? 's' : ''}`;
            }

            renderPagination(response.data.pagination?.page || 1, response.data.pagination?.pages || 1);
        } else {
            const emptyIcon = currentType === 'public' ? '🚌' : '🚕';
            const emptyText = currentType === 'public'
                ? 'No hay lineas de colectivo registradas'
                : 'No hay servicios de transporte privado';

            grid.innerHTML = `
                <div class="transport-empty">
                    <div class="transport-empty-icon">${emptyIcon}</div>
                    <h3>${emptyText}</h3>
                    <p>Pronto agregaremos mas opciones.</p>
                </div>
            `;

            const resultsEl = document.getElementById('results-count');
            if (resultsEl) resultsEl.textContent = '';

            const paginationEl = document.getElementById('pagination');
            if (paginationEl) paginationEl.innerHTML = '';
        }
    } catch (e) {
        console.error('Error loading transport:', e);
        grid.innerHTML = `
            <div class="transport-empty">
                <div class="transport-empty-icon">⚠️</div>
                <h3>Error cargando datos</h3>
                <p>Por favor, intenta de nuevo.</p>
            </div>
        `;
    }

    if (typeof Utils !== 'undefined') {
        Utils.updateUrl({
            page: page > 1 ? page : null,
            type: currentType !== 'public' ? currentType : null,
            search: search || null
        });
    }
}

async function loadCounts() {
    try {
        // Cargar conteos para los tabs
        const [publicRes, privateRes] = await Promise.all([
            api.getBusLines({ limit: 1 }),
            api.getTransport({ limit: 1, type: 'private' })
        ]);

        publicCount = publicRes.success ? (publicRes.data.pagination?.total || 0) : 0;
        privateCount = privateRes.success ? (privateRes.data.pagination?.total || 0) : 0;

        // Actualizar badges en tabs
        const publicTab = document.querySelector('.transport-tab[data-type="public"] .tab-count');
        const privateTab = document.querySelector('.transport-tab[data-type="private"] .tab-count');

        if (publicTab) publicTab.textContent = publicCount;
        if (privateTab) privateTab.textContent = privateCount;
    } catch (e) {
        console.error('Error loading counts:', e);
    }
}

// =============================================
// INICIALIZACION
// =============================================

function initTransporte() {
    // Event listener para cerrar modal con click afuera
    const modal = document.getElementById('transport-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Search con debounce
    let searchTimeout;
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => loadTransport(1), 500);
        });
    }

    // Tab click listeners
    document.querySelectorAll('.transport-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.type));
    });
}

// Auto-inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', async () => {
    initTransporte();

    // Obtener params de URL
    const params = typeof Utils !== 'undefined' ? Utils.getUrlParams() : {};

    // Establecer tipo inicial desde URL o default
    if (params.type === 'private') {
        currentType = 'private';
        document.querySelectorAll('.transport-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === 'private');
        });
        const grid = document.getElementById('transport-grid');
        if (grid) {
            grid.classList.remove('public-grid');
            grid.classList.add('private-grid');
        }
    }

    const searchInput = document.getElementById('search-input');
    if (params.search && searchInput) searchInput.value = params.search;

    // Cargar conteos y datos
    await loadCounts();
    loadTransport(parseInt(params.page) || 1);

    // Update user widget si existe la funcion
    if (typeof updateUserWidget === 'function') {
        updateUserWidget();
    }
});
