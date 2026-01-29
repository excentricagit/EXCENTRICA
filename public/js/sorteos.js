// =============================================
// EXCENTRICA - Sorteos Page JavaScript
// =============================================

let currentFilter = 'active';
let currentPage = 1;
const ITEMS_PER_PAGE = 12;

// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

// Calculate countdown
function getCountdown(drawDate) {
    const now = new Date();
    const draw = new Date(drawDate);
    const diff = draw - now;

    if (diff <= 0) {
        return null;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
}

// Render sorteo card
function renderSorteoCard(sorteo) {
    const imageUrl = sorteo.image_url || '/images/placeholder.svg';
    const participantCount = sorteo.participants_count || sorteo.participant_count || 0;

    // Calculate status
    const drawDate = new Date(sorteo.draw_date);
    const now = new Date();
    const daysUntilDraw = Math.ceil((drawDate - now) / (1000 * 60 * 60 * 24));
    const isEndingSoon = daysUntilDraw <= 3 && daysUntilDraw > 0;
    const hasEnded = daysUntilDraw <= 0 || sorteo.status === 'completed';

    // Badge
    let badgeText = '🎲 Activo';
    let badgeClass = '';
    if (hasEnded) {
        badgeText = '✓ Finalizado';
        badgeClass = 'sorteo-card-badge-completed';
    } else if (isEndingSoon) {
        badgeText = `⏰ ${daysUntilDraw === 1 ? 'Ultimo dia!' : `${daysUntilDraw} dias`}`;
        badgeClass = 'sorteo-card-badge-ending';
    }

    // Countdown
    const countdown = getCountdown(sorteo.draw_date);
    let countdownHtml = '';
    if (countdown && !hasEnded) {
        countdownHtml = `
            <div class="sorteo-card-countdown">
                <div class="sorteo-card-countdown-item">
                    <div class="sorteo-card-countdown-number">${countdown.days}</div>
                    <div class="sorteo-card-countdown-label">Dias</div>
                </div>
                <div class="sorteo-card-countdown-item">
                    <div class="sorteo-card-countdown-number">${countdown.hours}</div>
                    <div class="sorteo-card-countdown-label">Hrs</div>
                </div>
                <div class="sorteo-card-countdown-item">
                    <div class="sorteo-card-countdown-number">${countdown.minutes}</div>
                    <div class="sorteo-card-countdown-label">Min</div>
                </div>
            </div>
        `;
    }

    // Format draw date
    const drawDateFormatted = drawDate.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

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
                    ${participantCount}
                </span>
                ${countdownHtml}
            </div>
            <div class="sorteo-card-body">
                <div class="sorteo-card-prize">
                    🎁 ${escapeHtml(sorteo.prize || sorteo.prize_description || 'Premio sorpresa')}
                </div>
                <h3 class="sorteo-card-title">
                    <a href="/sorteo.html?id=${sorteo.id}">${escapeHtml(sorteo.title)}</a>
                </h3>
                ${sorteo.description ? `
                    <p class="sorteo-card-description">${escapeHtml(truncate(sorteo.description, 120))}</p>
                ` : ''}
                <div class="sorteo-card-meta">
                    <div class="sorteo-card-date">
                        <span class="sorteo-card-date-label">Fecha del sorteo</span>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    ` : `
                        <a href="/sorteo.html?id=${sorteo.id}" class="sorteo-card-btn sorteo-card-btn-completed">
                            Ver resultado
                        </a>
                    `}
                </div>
            </div>
        </article>
    `;
}

// Load sorteos
async function loadSorteos() {
    const grid = document.getElementById('sorteos-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');

    try {
        const params = {
            page: currentPage,
            limit: ITEMS_PER_PAGE
        };

        // Apply filter
        if (currentFilter === 'active') {
            params.status = 'active';
        } else if (currentFilter === 'ending') {
            params.status = 'active';
            params.ending_soon = 1;
        } else if (currentFilter === 'completed') {
            params.status = 'completed';
        }

        const response = await api.getSorteos(params);

        if (!response.success) {
            throw new Error(response.error || 'Error al cargar sorteos');
        }

        const sorteos = Array.isArray(response.data) ? response.data : (response.data?.sorteos || response.data?.items || []);
        const total = sorteos.length;

        if (sorteos.length > 0) {
            grid.innerHTML = sorteos.map(s => renderSorteoCard(s)).join('');
            grid.style.display = 'grid';
            emptyState.style.display = 'none';
            resultsCount.textContent = total;

            // Hide pagination for now (backend doesn't support it yet)
            document.getElementById('pagination').innerHTML = '';
        } else {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            resultsCount.textContent = '0';
        }

    } catch (e) {
        console.error('Error loading sorteos:', e);
        grid.innerHTML = `
            <div class="sorteos-empty">
                <div class="sorteos-empty-icon">❌</div>
                <h3>Error al cargar sorteos</h3>
                <p>${e.message}</p>
            </div>
        `;
    }
}

// Render pagination
function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!pagination || pagination.pages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';

    // Previous button
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">← Anterior</button>`;
    }

    // Page numbers
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === currentPage) {
            html += `<span class="pagination-current">${i}</span>`;
        } else if (i === 1 || i === pagination.pages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="pagination-dots">...</span>';
        }
    }

    // Next button
    if (currentPage < pagination.pages) {
        html += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">Siguiente →</button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// Change page
window.changePage = function(page) {
    currentPage = page;
    loadSorteos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Load stats
async function loadStats() {
    try {
        // Get active sorteos
        const activeResponse = await api.getSorteos({ status: 'active', limit: 100 });
        const sorteos = Array.isArray(activeResponse.data) ? activeResponse.data : (activeResponse.data?.sorteos || activeResponse.data?.items || []);

        const activeCount = sorteos.length;
        document.getElementById('stat-active').textContent = activeCount;

        // Get total participants (sum from all active sorteos)
        const totalParticipants = sorteos.reduce((sum, s) => sum + (s.participants_count || s.participant_count || 0), 0);
        document.getElementById('stat-participants').textContent = totalParticipants;

        // Get winners count (completed sorteos)
        const completedResponse = await api.getSorteos({ status: 'completed', limit: 100 });
        const completedSorteos = Array.isArray(completedResponse.data) ? completedResponse.data : (completedResponse.data?.sorteos || completedResponse.data?.items || []);
        const winnersCount = completedSorteos.length;
        document.getElementById('stat-winners').textContent = winnersCount;

    } catch (e) {
        console.error('Error loading stats:', e);
    }
}

// Load user's participations
async function loadMyParticipations() {
    const user = auth.getUser();
    if (!user) return;

    const widget = document.getElementById('my-sorteos-widget');
    const content = document.getElementById('my-sorteos-content');
    const userWidget = document.getElementById('user-widget-content');

    // Update user widget
    userWidget.innerHTML = `
        <p style="color: #e2e8f0; font-weight: 500; margin-bottom: 0.75rem; text-align: center;">Hola, ${escapeHtml(user.name ? user.name.split(' ')[0] : user.email)}</p>
        <button class="btn-widget-secondary" onclick="auth.logout()">Cerrar Sesion</button>
    `;

    try {
        const response = await api.getMyParticipations();

        if (response.success && response.data?.participations?.length > 0) {
            widget.style.display = 'block';
            const participations = response.data.participations.slice(0, 5);

            content.innerHTML = participations.map(p => {
                const drawDate = new Date(p.draw_date);
                const now = new Date();
                const isEnding = (drawDate - now) <= (3 * 24 * 60 * 60 * 1000) && drawDate > now;
                const isActive = p.status === 'active' && drawDate > now;

                return `
                    <a href="/sorteo.html?id=${p.sorteo_id}" class="my-sorteo-item">
                        <img src="${p.image_url || '/images/placeholder.svg'}" alt="" class="my-sorteo-image" onerror="this.src='/images/placeholder.svg'">
                        <div class="my-sorteo-info">
                            <div class="my-sorteo-title">${escapeHtml(p.title)}</div>
                            <div class="my-sorteo-status ${isEnding ? 'ending' : isActive ? 'active' : ''}">
                                ${isEnding ? '⏰ Por terminar' : isActive ? '🎲 Participando' : '✓ Finalizado'}
                            </div>
                        </div>
                    </a>
                `;
            }).join('');

            if (response.data.participations.length > 5) {
                content.innerHTML += `
                    <a href="/perfil.html#sorteos" class="my-sorteo-item" style="justify-content: center; color: #fbbf24;">
                        Ver todos mis sorteos →
                    </a>
                `;
            }
        } else {
            widget.style.display = 'block';
            content.innerHTML = `
                <p style="text-align: center; color: #94a3b8; font-size: 0.9rem; padding: 1rem;">
                    Aun no participas en ningun sorteo.
                    <br><br>
                    Explora los sorteos activos y participa!
                </p>
            `;
        }
    } catch (e) {
        console.error('Error loading participations:', e);
        widget.style.display = 'none';
    }
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.sorteos-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            currentPage = 1;
            loadSorteos();
        });
    });
}

// Initialize page
async function initPage() {
    initTabs();

    // Load data in parallel
    await Promise.all([
        loadSorteos(),
        loadStats(),
        loadMyParticipations()
    ]);
}

// Run on load
document.addEventListener('DOMContentLoaded', initPage);
