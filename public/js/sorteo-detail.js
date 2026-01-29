// =============================================
// EXCENTRICA - Sorteo Detail Page JavaScript
// =============================================

let currentSorteo = null;
let countdownInterval = null;

// Get sorteo ID from URL
function getSorteoId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Update countdown
function updateCountdown() {
    if (!currentSorteo) return;

    const drawDate = new Date(currentSorteo.draw_date);
    const now = new Date();
    const diff = drawDate - now;

    if (diff <= 0) {
        document.getElementById('countdown-days').textContent = '00';
        document.getElementById('countdown-hours').textContent = '00';
        document.getElementById('countdown-minutes').textContent = '00';
        document.getElementById('countdown-seconds').textContent = '00';

        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
    document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('countdown-seconds').textContent = seconds.toString().padStart(2, '0');
}

// Load sorteo details
async function loadSorteo() {
    const sorteoId = getSorteoId();

    if (!sorteoId) {
        showError();
        return;
    }

    try {
        const response = await api.getSorteoById(sorteoId);

        if (!response.success || !response.data) {
            showError();
            return;
        }

        currentSorteo = response.data;
        renderSorteo();
        checkParticipationStatus();

        // Start countdown
        updateCountdown();
        countdownInterval = setInterval(updateCountdown, 1000);

    } catch (e) {
        console.error('Error loading sorteo:', e);
        showError();
    }
}

// Show error state
function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}

// Render sorteo
function renderSorteo() {
    const sorteo = currentSorteo;

    // Hide loading, show content
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('sorteo-content').style.display = 'block';

    // Update page title
    document.title = `${sorteo.title} - Sorteo | Excentrica`;

    // Breadcrumb
    document.getElementById('breadcrumb-title').textContent = sorteo.title;

    // Image
    document.getElementById('sorteo-image').src = sorteo.image_url || '/images/placeholder.svg';
    document.getElementById('sorteo-image').alt = sorteo.title;

    // Badge
    const badge = document.getElementById('sorteo-badge');
    const drawDate = new Date(sorteo.draw_date);
    const now = new Date();
    const daysUntilDraw = Math.ceil((drawDate - now) / (1000 * 60 * 60 * 24));
    const hasEnded = daysUntilDraw <= 0 || sorteo.status === 'completed';
    const isEndingSoon = daysUntilDraw <= 3 && daysUntilDraw > 0;

    if (hasEnded) {
        badge.textContent = '✓ Finalizado';
        badge.classList.add('completed');
    } else if (isEndingSoon) {
        badge.textContent = `⏰ ${daysUntilDraw === 1 ? 'Ultimo dia!' : `Quedan ${daysUntilDraw} dias`}`;
        badge.classList.add('ending');
    } else {
        badge.textContent = '🎲 Activo';
    }

    // Participants count
    document.getElementById('sorteo-participants').textContent = `${sorteo.participants_count || sorteo.participant_count || 0} participantes`;

    // Main content
    document.getElementById('sorteo-prize').textContent = `🎁 ${sorteo.prize || sorteo.prize_description || 'Premio sorpresa'}`;
    document.getElementById('sorteo-title').textContent = sorteo.title;
    document.getElementById('sorteo-description').innerHTML = escapeHtml(sorteo.description || '').replace(/\n/g, '<br>');

    // Draw date
    const drawDateFormatted = drawDate.toLocaleDateString('es-AR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('sorteo-draw-date').textContent = drawDateFormatted;

    // Requirements
    if (sorteo.requirements) {
        const reqSection = document.getElementById('requirements-section');
        const reqContainer = document.getElementById('sorteo-requirements');
        reqSection.style.display = 'block';

        const requirements = sorteo.requirements.split('\n').filter(r => r.trim());
        reqContainer.innerHTML = requirements.map(req => `
            <div class="sorteo-requirement-item">
                <span>✓</span>
                <p>${escapeHtml(req.trim())}</p>
            </div>
        `).join('');
    }

    // Winner section (if completed)
    if (hasEnded && sorteo.winner_name) {
        const winnerSection = document.getElementById('winner-section');
        const winnerInfo = document.getElementById('winner-info');
        winnerSection.style.display = 'block';

        const initial = sorteo.winner_name.charAt(0).toUpperCase();
        winnerInfo.innerHTML = `
            <div class="sorteo-winner-avatar">${initial}</div>
            <div class="sorteo-winner-info">
                <h4>${escapeHtml(sorteo.winner_name)}</h4>
                <p>Ganador del sorteo</p>
            </div>
        `;
    }

    // Update participation card based on status
    updateParticipationCard(hasEnded);
}

// Update participation card
function updateParticipationCard(hasEnded) {
    const user = auth.getUser();

    // Hide all states first
    document.getElementById('not-logged-in').style.display = 'none';
    document.getElementById('can-participate').style.display = 'none';
    document.getElementById('already-participating').style.display = 'none';
    document.getElementById('sorteo-ended').style.display = 'none';

    if (hasEnded) {
        document.getElementById('sorteo-ended').style.display = 'block';
        document.getElementById('countdown-card').style.display = 'none';
    } else if (!user) {
        document.getElementById('not-logged-in').style.display = 'block';
    } else {
        // Check participation status will handle this
    }
}

// Check participation status
async function checkParticipationStatus() {
    const user = auth.getUser();
    if (!user || !currentSorteo) return;

    const drawDate = new Date(currentSorteo.draw_date);
    const now = new Date();
    const hasEnded = drawDate <= now || currentSorteo.status === 'completed';

    if (hasEnded) {
        document.getElementById('sorteo-ended').style.display = 'block';
        return;
    }

    try {
        const response = await api.checkSorteoParticipation(currentSorteo.id);

        if (response.success && response.data?.participating) {
            document.getElementById('already-participating').style.display = 'block';
        } else {
            document.getElementById('can-participate').style.display = 'block';
        }
    } catch (e) {
        console.error('Error checking participation:', e);
        document.getElementById('can-participate').style.display = 'block';
    }
}

// Participate in sorteo
window.participateInSorteo = async function() {
    const user = auth.getUser();
    if (!user) {
        window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    const btn = document.getElementById('btn-participate');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Inscribiendo...';

    try {
        const response = await api.participateSorteo(currentSorteo.id);

        if (response.success) {
            showToast('Te has inscrito al sorteo. Mucha suerte!', 'success');

            // Update UI
            document.getElementById('can-participate').style.display = 'none';
            document.getElementById('already-participating').style.display = 'block';

            // Update participant count
            const countEl = document.getElementById('sorteo-participants');
            const currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = `${currentCount + 1} participantes`;
        } else {
            showToast(response.error || 'Error al inscribirse', 'error');
            btn.disabled = false;
            btn.innerHTML = '<span>🎲</span> Participar Ahora';
        }
    } catch (e) {
        console.error('Error participating:', e);
        showToast('Error al inscribirse al sorteo', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span>🎲</span> Participar Ahora';
    }
};

// Cancel participation
window.cancelParticipation = async function() {
    if (!confirm('Estas seguro de que quieres cancelar tu participacion?')) {
        return;
    }

    try {
        const response = await api.cancelSorteoParticipation(currentSorteo.id);

        if (response.success) {
            showToast('Has cancelado tu participacion', 'info');

            // Update UI
            document.getElementById('already-participating').style.display = 'none';
            document.getElementById('can-participate').style.display = 'block';

            // Update participant count
            const countEl = document.getElementById('sorteo-participants');
            const currentCount = parseInt(countEl.textContent) || 0;
            countEl.textContent = `${Math.max(0, currentCount - 1)} participantes`;
        } else {
            showToast(response.error || 'Error al cancelar', 'error');
        }
    } catch (e) {
        console.error('Error canceling:', e);
        showToast('Error al cancelar participacion', 'error');
    }
};

// Share sorteo
window.shareSorteo = function(platform) {
    const url = window.location.href;
    const title = currentSorteo?.title || 'Sorteo en Excentrica';
    const text = `Participa en el sorteo "${title}" y gana increibles premios!`;

    switch (platform) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'copy':
            navigator.clipboard.writeText(url).then(() => {
                showToast('Enlace copiado al portapapeles', 'success');
            }).catch(() => {
                showToast('Error al copiar enlace', 'error');
            });
            break;
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', loadSorteo);
