/* =============================================
   PUBLICISTA INSCRIPCIONES - Logica
   ============================================= */

(function() {
    'use strict';

    // Verificar autenticacion
    const user = auth.getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'publicista')) {
        window.location.href = '/login.html';
        return;
    }

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user?.name || 'Publicista';

    let allRegistrations = [];
    let myEvents = [];
    let filteredRegistrations = [];

    // Cargar datos iniciales
    async function loadData() {
        try {
            console.log('[Inscripciones] Cargando datos...');

            // Cargar TODOS los eventos y TODAS las inscripciones (publicista ve todo)
            const [eventsResponse, registrationsResponse] = await Promise.all([
                api.getAdminEvents(), // Sin filtro - todos los eventos
                api.getAdminEventRegistrations()
            ]);

            console.log('[Inscripciones] Eventos response:', eventsResponse);
            console.log('[Inscripciones] Registrations response:', registrationsResponse);

            if (eventsResponse.success) {
                myEvents = eventsResponse.data?.events || eventsResponse.data || [];
                console.log('[Inscripciones] Eventos cargados:', myEvents.length);
                renderEventFilter();
            } else {
                console.error('[Inscripciones] Error en eventos:', eventsResponse.message || eventsResponse.error);
                Components.toast('Error cargando eventos: ' + (eventsResponse.message || 'Error desconocido'), 'error');
            }

            if (registrationsResponse.success) {
                allRegistrations = registrationsResponse.data?.registrations || registrationsResponse.data || [];
                console.log('[Inscripciones] Inscripciones cargadas:', allRegistrations.length);
                // El publicista ve TODAS las inscripciones (ya filtradas por el backend)
                applyFilters();
                updateStats();
            } else {
                console.error('[Inscripciones] Error en inscripciones:', registrationsResponse.message || registrationsResponse.error);
                Components.toast('Error cargando inscripciones: ' + (registrationsResponse.message || 'Error desconocido'), 'error');
            }
        } catch (e) {
            console.error('[Inscripciones] Error loading data:', e);
            Components.toast('Error cargando datos: ' + (e.message || 'Error desconocido'), 'error');
        }
    }

    function renderEventFilter() {
        const select = document.getElementById('filter-event');
        if (!select) return;

        select.innerHTML = '<option value="">Todos los eventos</option>' +
            myEvents.map(event => `<option value="${event.id}">${Utils.escapeHtml(event.title)}</option>`).join('');
    }

    function applyFilters() {
        const eventFilter = document.getElementById('filter-event')?.value || '';
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const searchFilter = document.getElementById('filter-search')?.value?.toLowerCase() || '';

        filteredRegistrations = allRegistrations.filter(reg => {
            const matchEvent = !eventFilter || reg.event_id == eventFilter;
            const matchStatus = !statusFilter || reg.status === statusFilter;
            const matchSearch = !searchFilter ||
                (reg.user_name && reg.user_name.toLowerCase().includes(searchFilter)) ||
                (reg.user_email && reg.user_email.toLowerCase().includes(searchFilter)) ||
                (reg.registration_code && reg.registration_code.toLowerCase().includes(searchFilter));

            return matchEvent && matchStatus && matchSearch;
        });

        renderTable();
    }

    function updateStats() {
        const totalEl = document.getElementById('stat-total');
        const pendingEl = document.getElementById('stat-pending');
        const confirmedEl = document.getElementById('stat-confirmed');
        const rejectedEl = document.getElementById('stat-rejected');

        if (totalEl) totalEl.textContent = allRegistrations.length;
        if (pendingEl) pendingEl.textContent = allRegistrations.filter(r => r.status === 'pendiente').length;
        if (confirmedEl) confirmedEl.textContent = allRegistrations.filter(r => r.status === 'confirmado').length;
        if (rejectedEl) rejectedEl.textContent = allRegistrations.filter(r => r.status === 'rechazado').length;
    }

    function renderTable() {
        const container = document.getElementById('registrations-table-container');
        if (!container) return;

        if (filteredRegistrations.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No se encontraron inscripciones</p>';
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Evento</th>
                        <th>Codigo</th>
                        <th>Estado</th>
                        <th>Fecha Inscripcion</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredRegistrations.map(reg => `
                        <tr>
                            <td>
                                <div class="registration-user">
                                    <span class="registration-user-name">${Utils.escapeHtml(reg.user_name || 'Sin nombre')}</span>
                                    <span class="registration-user-email">${Utils.escapeHtml(reg.user_email || '')}</span>
                                    ${reg.user_phone ? `<span class="registration-user-phone">📞 ${Utils.escapeHtml(reg.user_phone)}</span>` : ''}
                                </div>
                            </td>
                            <td>
                                <div class="registration-event">
                                    <span class="registration-event-title">${Utils.escapeHtml(reg.event_title || 'Evento')}</span>
                                    <span class="registration-event-date">${formatDate(reg.event_date)}</span>
                                </div>
                            </td>
                            <td>
                                <span class="registration-code">${reg.registration_code || '-'}</span>
                            </td>
                            <td>
                                <span class="badge badge-${reg.status}">${getStatusLabel(reg.status)}</span>
                            </td>
                            <td>${formatDate(reg.registered_at)}</td>
                            <td>
                                <div class="btn-group">
                                    ${reg.status === 'pendiente' ? `
                                        <button class="btn-approve" onclick="approveRegistration(${reg.id})" title="Aprobar">
                                            ✅ Aprobar
                                        </button>
                                        <button class="btn-reject" onclick="showRejectModal(${reg.id})" title="Rechazar">
                                            ❌
                                        </button>
                                    ` : ''}
                                    ${reg.status === 'confirmado' ? `
                                        <button class="btn-pending" onclick="setPendingRegistration(${reg.id})" title="Volver a pendiente">
                                            ⏳ Pendiente
                                        </button>
                                        <button class="btn-reject" onclick="showRejectModal(${reg.id})" title="Rechazar">
                                            ❌
                                        </button>
                                    ` : ''}
                                    ${reg.status === 'rechazado' ? `
                                        <button class="btn-pending" onclick="setPendingRegistration(${reg.id})" title="Volver a pendiente">
                                            ⏳ Pendiente
                                        </button>
                                        <button class="btn-approve" onclick="approveRegistration(${reg.id})" title="Aprobar">
                                            ✅
                                        </button>
                                    ` : ''}
                                    ${reg.user_phone ? `
                                        <a href="https://wa.me/${formatWhatsApp(reg.user_phone)}?text=${encodeURIComponent(getWhatsAppMessage(reg))}"
                                           target="_blank" class="btn-whatsapp" title="Contactar por WhatsApp">
                                            💬
                                        </a>
                                    ` : ''}
                                    <button class="btn-delete" onclick="deleteRegistration(${reg.id})" title="Eliminar inscripcion">
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function getStatusLabel(status) {
        const labels = {
            'pendiente': 'Pendiente',
            'confirmado': 'Confirmado',
            'rechazado': 'Rechazado',
            'cancelado': 'Cancelado'
        };
        return labels[status] || status;
    }

    function formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatWhatsApp(phone) {
        // Limpiar el numero de telefono
        return phone.replace(/\D/g, '');
    }

    function getWhatsAppMessage(reg) {
        const event = myEvents.find(e => e.id === reg.event_id);
        let message = `Hola ${reg.user_name}! `;

        if (reg.status === 'pendiente') {
            message += `Tu inscripcion al evento "${event?.title || 'evento'}" esta pendiente de confirmacion. `;
            if (event?.price > 0) {
                message += `El precio de la entrada es $${Number(event.price).toLocaleString('es-AR')}. `;
            }
        } else if (reg.status === 'confirmado') {
            message += `Tu inscripcion al evento "${event?.title || 'evento'}" ha sido confirmada. `;
            message += `Tu codigo es: ${reg.registration_code}`;
        }

        return message;
    }

    // Funciones globales
    window.approveRegistration = async function(registrationId) {
        if (!confirm('¿Confirmar esta inscripcion?')) return;

        try {
            const response = await api.updateEventRegistrationStatus(registrationId, 'confirmado');
            if (response.success) {
                Components.toast('Inscripcion confirmada', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error approving registration:', e);
            Components.toast(e.message || 'Error al confirmar', 'error');
        }
    };

    window.setPendingRegistration = async function(registrationId) {
        if (!confirm('¿Volver esta inscripcion a estado pendiente?')) return;

        try {
            const response = await api.updateEventRegistrationStatus(registrationId, 'pendiente');
            if (response.success) {
                Components.toast('Inscripcion marcada como pendiente', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error setting pending registration:', e);
            Components.toast(e.message || 'Error al cambiar estado', 'error');
        }
    };

    window.showRejectModal = function(registrationId) {
        const modal = document.getElementById('notes-modal');
        const form = document.getElementById('notes-form');

        if (modal && form) {
            form.dataset.registrationId = registrationId;
            form.dataset.action = 'reject';
            document.getElementById('notes-textarea').value = '';
            document.getElementById('notes-modal-title').textContent = 'Rechazar inscripcion';
            modal.classList.add('active');
        }
    };

    window.closeNotesModal = function() {
        const modal = document.getElementById('notes-modal');
        if (modal) modal.classList.remove('active');
    };

    window.submitNotes = async function(e) {
        e.preventDefault();

        const form = document.getElementById('notes-form');
        const registrationId = form.dataset.registrationId;
        const notes = document.getElementById('notes-textarea').value;

        try {
            const response = await api.updateEventRegistrationStatus(registrationId, 'rechazado', notes);
            if (response.success) {
                Components.toast('Inscripcion rechazada', 'success');
                closeNotesModal();
                loadData();
            }
        } catch (e) {
            console.error('Error rejecting registration:', e);
            Components.toast(e.message || 'Error al rechazar', 'error');
        }
    };

    window.deleteRegistration = async function(registrationId) {
        if (!confirm('¿Seguro que deseas eliminar esta inscripcion? Esta accion no se puede deshacer.')) return;

        try {
            const response = await api.deleteEventRegistration(registrationId);
            if (response.success) {
                Components.toast('Inscripcion eliminada', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error deleting registration:', e);
            Components.toast(e.message || 'Error al eliminar', 'error');
        }
    };

    window.verifyCode = async function(e) {
        e.preventDefault();

        const codeInput = document.getElementById('verify-code-input');
        const resultContainer = document.getElementById('verify-result');
        const code = codeInput.value.trim().toUpperCase();

        if (!code) {
            Components.toast('Ingresa un codigo', 'warning');
            return;
        }

        try {
            const response = await api.verifyRegistrationCode(code);

            if (response.success && response.data && response.data.valid) {
                const reg = response.data.registration;
                const canEnter = response.data.can_enter;

                resultContainer.className = 'verify-result valid';
                resultContainer.innerHTML = `
                    <div class="verify-result-title">${canEnter ? '✅ Codigo valido - PUEDE INGRESAR' : '⚠️ Codigo encontrado'}</div>
                    <div class="verify-result-details">
                        <strong>Usuario:</strong> ${Utils.escapeHtml(reg.user_name || 'Sin nombre')}<br>
                        <strong>Email:</strong> ${Utils.escapeHtml(reg.user_email || '-')}<br>
                        ${reg.user_phone ? `<strong>Telefono:</strong> ${Utils.escapeHtml(reg.user_phone)}<br>` : ''}
                        <strong>Evento:</strong> ${Utils.escapeHtml(reg.event_title || 'Evento')}<br>
                        <strong>Fecha evento:</strong> ${formatDate(reg.event_date)}${reg.event_time ? ' ' + reg.event_time : ''}<br>
                        <strong>Estado:</strong> <span class="badge badge-${reg.status}">${getStatusLabel(reg.status)}</span><br>
                        <strong>Fecha inscripcion:</strong> ${formatDate(reg.registered_at)}
                        ${reg.approved_at ? `<br><strong>Fecha aprobacion:</strong> ${formatDate(reg.approved_at)}` : ''}
                    </div>
                    ${!canEnter && reg.status === 'pendiente' ? '<p style="margin-top: 0.75rem; color: #fcd34d; font-size: 0.85rem;">⚠️ Esta inscripcion aun no ha sido aprobada</p>' : ''}
                    ${reg.status === 'rechazado' ? '<p style="margin-top: 0.75rem; color: #fca5a5; font-size: 0.85rem;">❌ Esta inscripcion fue rechazada</p>' : ''}
                `;
            } else {
                resultContainer.className = 'verify-result invalid';
                resultContainer.innerHTML = `
                    <div class="verify-result-title">❌ Codigo invalido</div>
                    <div class="verify-result-details">
                        El codigo ingresado no existe o no corresponde a ninguna inscripcion.
                    </div>
                `;
            }
        } catch (e) {
            console.error('Error verifying code:', e);
            resultContainer.className = 'verify-result invalid';
            resultContainer.innerHTML = `
                <div class="verify-result-title">❌ Error</div>
                <div class="verify-result-details">${e.message || 'Error al verificar codigo'}</div>
            `;
        }
    };

    // Event listeners
    function init() {
        const eventFilter = document.getElementById('filter-event');
        const statusFilter = document.getElementById('filter-status');
        const searchFilter = document.getElementById('filter-search');

        if (eventFilter) eventFilter.addEventListener('change', applyFilters);
        if (statusFilter) statusFilter.addEventListener('change', applyFilters);
        if (searchFilter) searchFilter.addEventListener('input', applyFilters);

        loadData();
    }

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
