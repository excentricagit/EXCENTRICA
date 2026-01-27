/* =============================================
   PERFIL - Logica de la pagina de perfil
   ============================================= */

(function() {
    'use strict';

    let currentUser = null;

    // Verificar autenticacion al cargar
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    // Switch entre tabs
    window.switchTab = function(tab) {
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));

        const tabButton = document.querySelector(`.profile-tab[data-tab="${tab}"]`);
        const tabSection = document.getElementById(`section-${tab}`);

        if (tabButton) tabButton.classList.add('active');
        if (tabSection) tabSection.classList.add('active');
    };

    // Formatear fecha de evento
    function formatEventDate(dateStr) {
        if (!dateStr) return { day: '--', month: '---' };
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()
        };
    }

    // Cargar eventos del usuario
    async function loadMyEvents() {
        const container = document.getElementById('events-list');
        if (!container) return;

        try {
            const response = await api.getMyEventRegistrations();

            if (response.success && response.data.registrations && response.data.registrations.length > 0) {
                container.innerHTML = response.data.registrations.map(reg => {
                    const dateInfo = formatEventDate(reg.event_date);
                    const statusLabels = {
                        'pendiente': { icon: '⏳', text: 'Pendiente' },
                        'confirmado': { icon: '✓', text: 'Confirmado' },
                        'rechazado': { icon: '✗', text: 'Rechazado' },
                        'cancelado': { icon: '⊘', text: 'Cancelado' }
                    };
                    const status = statusLabels[reg.registration_status] || statusLabels.pendiente;

                    return `
                        <div class="event-registration-card">
                            <div class="event-registration-date">
                                <span class="event-registration-date-day">${dateInfo.day}</span>
                                <span class="event-registration-date-month">${dateInfo.month}</span>
                            </div>
                            <div class="event-registration-info">
                                <div class="event-registration-title">${Utils.escapeHtml(reg.title)}</div>
                                <div class="event-registration-meta">
                                    ${reg.location ? `<span>📍 ${Utils.escapeHtml(reg.location)}</span>` : ''}
                                    ${reg.event_time ? `<span>🕐 ${reg.event_time.substring(0,5)} hs</span>` : ''}
                                    ${reg.price > 0 ? `<span>💰 $${Number(reg.price).toLocaleString('es-AR')}</span>` : '<span>🎫 Gratis</span>'}
                                </div>
                                <div>
                                    <span class="event-registration-status ${reg.registration_status}">${status.icon} ${status.text}</span>
                                    ${reg.registration_status === 'confirmado' && reg.registration_code ? `<span class="event-registration-code">${reg.registration_code}</span>` : ''}
                                </div>
                            </div>
                            <div class="event-registration-actions">
                                ${reg.registration_status !== 'cancelado' ? `
                                    <button class="btn-cancel-registration" onclick="cancelRegistration(${reg.event_id}, '${Utils.escapeHtml(reg.title).replace(/'/g, "\\'")}')">Cancelar</button>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = `
                    <div class="empty-events">
                        <div class="empty-events-icon">📅</div>
                        <h3 style="color: #e2e8f0; margin-bottom: 0.5rem;">No tienes eventos</h3>
                        <p>Aun no te has inscrito a ningun evento.</p>
                        <a href="/eventos.html" class="btn btn-profile-primary mt-3" style="display: inline-block;">
                            Explorar Eventos
                        </a>
                    </div>
                `;
            }
        } catch (e) {
            console.error('Error loading events:', e);
            container.innerHTML = `
                <div class="empty-events">
                    <div class="empty-events-icon">⚠️</div>
                    <p style="color: #ef4444;">Error cargando eventos</p>
                </div>
            `;
        }
    }

    // Cancelar inscripcion
    window.cancelRegistration = async function(eventId, eventTitle) {
        if (!confirm(`¿Estas seguro de cancelar tu inscripcion a "${eventTitle}"?`)) return;

        try {
            const response = await api.unregisterFromEvent(eventId);
            if (response.success) {
                Components.toast('Inscripcion cancelada', 'success');
                loadMyEvents();
            }
        } catch (e) {
            Components.toast(e.message || 'Error al cancelar', 'danger');
        }
    };

    // Cargar perfil
    async function loadProfile() {
        try {
            const response = await api.getMe();
            if (response.success && response.data) {
                currentUser = response.data;

                // Header
                const profileName = document.getElementById('profile-name');
                const profileEmail = document.getElementById('profile-email');
                const profileRole = document.getElementById('profile-role');
                const profileAvatar = document.getElementById('profile-avatar');

                if (profileName) profileName.textContent = currentUser.name || currentUser.username;
                if (profileEmail) profileEmail.textContent = currentUser.email;
                if (profileRole) {
                    profileRole.textContent = currentUser.role === 'admin' ? 'Administrador' :
                        currentUser.role === 'editor' ? 'Editor' : 'Usuario';
                }

                // Avatar con inicial
                if (profileAvatar) {
                    const initial = (currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase();
                    profileAvatar.textContent = initial;
                }

                // Formulario
                const inputName = document.getElementById('input-name');
                const inputUsername = document.getElementById('input-username');
                const inputEmail = document.getElementById('input-email');
                const inputPhone = document.getElementById('input-phone');
                const inputBio = document.getElementById('input-bio');

                if (inputName) inputName.value = currentUser.name || '';
                if (inputUsername) inputUsername.value = currentUser.username || '';
                if (inputEmail) inputEmail.value = currentUser.email || '';
                if (inputPhone) inputPhone.value = currentUser.phone || '';
                if (inputBio) inputBio.value = currentUser.bio || '';
            }
        } catch (e) {
            console.error('Error loading profile:', e);
        }
    }

    // Guardar perfil
    function handleProfileSubmit(e) {
        e.preventDefault();

        const name = document.getElementById('input-name')?.value;
        const phone = document.getElementById('input-phone')?.value;
        const bio = document.getElementById('input-bio')?.value;

        api.updateProfile({ name, phone, bio })
            .then(response => {
                if (response.success) {
                    Components.toast('Perfil actualizado', 'success');
                    loadProfile();
                }
            })
            .catch(e => {
                Components.toast(e.message || 'Error al guardar', 'danger');
            });
    }

    // Cambiar contrasena
    function handlePasswordSubmit(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('input-current-password')?.value;
        const newPassword = document.getElementById('input-new-password')?.value;
        const confirmPassword = document.getElementById('input-confirm-password')?.value;

        if (newPassword !== confirmPassword) {
            Components.toast('Las contrasenas no coinciden', 'danger');
            return;
        }

        api.changePassword(currentPassword, newPassword)
            .then(response => {
                if (response.success) {
                    Components.toast('Contrasena cambiada', 'success');
                    document.getElementById('password-form')?.reset();
                }
            })
            .catch(e => {
                Components.toast(e.message || 'Error al cambiar contrasena', 'danger');
            });
    }

    // Logout
    window.logout = function() {
        auth.logout();
    };

    // Inicializar cuando el DOM este listo
    function init() {
        // Setup event listeners
        const profileForm = document.getElementById('profile-form');
        const passwordForm = document.getElementById('password-form');

        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileSubmit);
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordSubmit);
        }

        // Inicializar layout
        Components.initLayout({ userWidget: false, adWidget: false });

        // Cargar datos
        loadProfile();
        loadMyEvents();
    }

    // Ejecutar init cuando DOM este listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
