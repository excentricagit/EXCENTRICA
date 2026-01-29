/* =============================================
   SORTEOS Y EVENTOS RECURRENTES - Editor
   ============================================= */

(function() {
    'use strict';

    // Verificar autenticacion
    const user = auth.getUser();
    if (!user || !['admin', 'editor', 'publicista'].includes(user.role)) {
        window.location.href = '/login.html';
        return;
    }

    const userNameEl = document.getElementById('user-name');
    if (userNameEl) userNameEl.textContent = user?.name || 'Editor';

    let allEvents = [];
    let categories = [];
    let zones = [];
    let editingId = null;
    let currentSorteoId = null;

    // =============================================
    // INICIALIZACION
    // =============================================

    async function init() {
        setupTabs();
        setupDaySelector();
        setupRecurrencePreview();
        await loadCategoriesAndZones();
        await loadEvents();
    }

    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.classList.remove('active');
                });

                const tabId = 'tab-' + btn.dataset.tab;
                document.getElementById(tabId)?.classList.add('active');
            });
        });

        // Filtros
        document.getElementById('filter-sorteo-status')?.addEventListener('change', renderSorteos);
        document.getElementById('filter-recurrente-status')?.addEventListener('change', renderRecurrentes);
    }

    function setupDaySelector() {
        const dayBtns = document.querySelectorAll('.day-btn');
        dayBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                dayBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('recurrence-day').value = btn.dataset.day;
                updateRecurrencePreview();
            });
        });
    }

    function setupRecurrencePreview() {
        const inputs = ['recurrence-start', 'recurrence-weeks', 'recurrence-day'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', updateRecurrencePreview);
            }
        });
    }

    function updateRecurrencePreview() {
        const container = document.getElementById('preview-weeks');
        const startDate = document.getElementById('recurrence-start').value;
        const weeks = parseInt(document.getElementById('recurrence-weeks').value) || 8;
        const day = parseInt(document.getElementById('recurrence-day').value);
        const time = document.getElementById('recurrence-time').value || '21:00';

        if (!startDate) {
            container.innerHTML = '<p class="text-muted">Selecciona fecha de inicio para ver la vista previa</p>';
            return;
        }

        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        const dates = generateRecurringDates(startDate, day, weeks);

        container.innerHTML = `
            <p class="mb-2"><strong>Se crearan ${dates.length} eventos:</strong></p>
            ${dates.map((date, i) => `
                <div class="preview-week">
                    <span class="text-muted">${i + 1}.</span>
                    <span>${dayNames[day]} ${formatDateShort(date)} a las ${time}</span>
                </div>
            `).join('')}
        `;
    }

    function generateRecurringDates(startDateStr, targetDay, weeks) {
        const dates = [];
        const startDate = new Date(startDateStr + 'T12:00:00');

        // Ajustar al primer dia de la semana correspondiente
        const currentDay = startDate.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd < 0) daysToAdd += 7;

        startDate.setDate(startDate.getDate() + daysToAdd);

        for (let week = 0; week < weeks; week++) {
            const eventDate = new Date(startDate);
            eventDate.setDate(eventDate.getDate() + (week * 7));
            dates.push(eventDate);
        }

        return dates;
    }

    function formatDateShort(date) {
        return date.toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // =============================================
    // CARGA DE DATOS
    // =============================================

    async function loadCategoriesAndZones() {
        try {
            const [catResponse, zoneResponse] = await Promise.all([
                api.get('/api/categories', { section: 'events' }),
                api.get('/api/zones')
            ]);

            if (catResponse.success) {
                categories = catResponse.data || [];
                renderCategoryOptions();
            }

            if (zoneResponse.success) {
                zones = zoneResponse.data || [];
                renderZoneOptions();
            }
        } catch (e) {
            console.error('Error loading categories/zones:', e);
        }
    }

    function renderCategoryOptions() {
        const select = document.getElementById('event-category');
        if (!select) return;

        select.innerHTML = '<option value="">Sin categoria</option>' +
            categories.map(c => `<option value="${c.id}">${Utils.escapeHtml(c.name)}</option>`).join('');
    }

    function renderZoneOptions() {
        const select = document.getElementById('event-zone');
        if (!select) return;

        select.innerHTML = '<option value="">Sin zona</option>' +
            zones.map(z => `<option value="${z.id}">${Utils.escapeHtml(z.name)}</option>`).join('');
    }

    async function loadEvents() {
        try {
            const response = await api.get('/api/admin/special-events');

            if (response.success) {
                allEvents = response.data?.events || response.data || [];
                updateStats();
                renderSorteos();
                renderRecurrentes();
            }
        } catch (e) {
            console.error('Error loading events:', e);
            Components.toast('Error cargando eventos', 'error');
        }
    }

    function updateStats() {
        const sorteos = allEvents.filter(e => e.event_type === 'sorteo');
        const recurrentes = allEvents.filter(e => e.event_type === 'recurrente');
        const activeSorteos = sorteos.filter(e => e.status === 'activo');

        document.getElementById('total-sorteos').textContent = activeSorteos.length;
        document.getElementById('total-recurrentes').textContent = recurrentes.filter(e => e.status === 'activo').length;

        const totalParticipants = sorteos.reduce((sum, s) => sum + (s.participants_count || 0), 0);
        document.getElementById('total-participants').textContent = totalParticipants;

        // Para ganadores necesitariamos otra query, por ahora mostramos 0
        document.getElementById('total-winners').textContent = sorteos.filter(s => s.status === 'finalizado').length;
    }

    // =============================================
    // RENDERIZADO
    // =============================================

    function renderSorteos() {
        const container = document.getElementById('sorteos-list');
        const statusFilter = document.getElementById('filter-sorteo-status')?.value || '';

        let sorteos = allEvents.filter(e => e.event_type === 'sorteo');

        if (statusFilter) {
            sorteos = sorteos.filter(e => e.status === statusFilter);
        }

        if (sorteos.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No hay sorteos</p>';
            return;
        }

        container.innerHTML = sorteos.map(sorteo => `
            <div class="special-event-card">
                <div class="special-event-header">
                    <span class="special-event-type sorteo">&#127922; SORTEO</span>
                    <span class="special-event-title">${Utils.escapeHtml(sorteo.title)}</span>
                    <span class="badge badge-${sorteo.status}">${getStatusLabel(sorteo.status)}</span>
                </div>
                ${sorteo.prize_description ? `<p class="text-muted mb-2">&#127873; ${Utils.escapeHtml(sorteo.prize_description)}</p>` : ''}
                <div class="special-event-meta">
                    <span>&#128101; ${sorteo.participants_count || 0} participantes</span>
                    <span>&#127942; ${sorteo.winners_count || 1} ganador(es)</span>
                    ${sorteo.draw_date ? `<span>&#128197; Sorteo: ${formatDateShort(new Date(sorteo.draw_date))}</span>` : ''}
                    ${sorteo.max_participants ? `<span>&#128274; Max: ${sorteo.max_participants}</span>` : ''}
                </div>
                <div class="special-event-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewParticipants(${sorteo.id})">
                        &#128101; Ver participantes
                    </button>
                    ${sorteo.status === 'activo' ? `
                        <button class="btn btn-primary btn-sm" onclick="selectWinnersForSorteo(${sorteo.id})">
                            &#127942; Sortear
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-sm" onclick="editEvent(${sorteo.id})">
                        &#9998; Editar
                    </button>
                    <button class="btn btn-outline btn-sm text-danger" onclick="deleteEvent(${sorteo.id})">
                        &#128465; Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    function renderRecurrentes() {
        const container = document.getElementById('recurrentes-list');
        const statusFilter = document.getElementById('filter-recurrente-status')?.value || '';

        let recurrentes = allEvents.filter(e => e.event_type === 'recurrente');

        if (statusFilter) {
            recurrentes = recurrentes.filter(e => e.status === statusFilter);
        }

        if (recurrentes.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No hay eventos recurrentes</p>';
            return;
        }

        const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

        container.innerHTML = recurrentes.map(event => {
            const generatedCount = event.generated_event_ids ? JSON.parse(event.generated_event_ids).length : 0;

            return `
                <div class="special-event-card">
                    <div class="special-event-header">
                        <span class="special-event-type recurrente">&#128260; RECURRENTE</span>
                        <span class="special-event-title">${Utils.escapeHtml(event.title)}</span>
                        <span class="badge badge-${event.status}">${getStatusLabel(event.status)}</span>
                    </div>
                    <div class="special-event-meta">
                        <span>&#128197; ${dayNames[event.recurrence_day]} a las ${event.recurrence_time || '21:00'}</span>
                        <span>&#128203; ${generatedCount} eventos generados</span>
                        ${event.location ? `<span>&#128205; ${Utils.escapeHtml(event.location)}</span>` : ''}
                        ${event.price > 0 ? `<span>&#128176; $${Number(event.price).toLocaleString('es-AR')}</span>` : '<span>&#128176; Gratis</span>'}
                    </div>
                    <div class="special-event-actions">
                        <button class="btn btn-outline btn-sm" onclick="editEvent(${event.id})">
                            &#9998; Editar
                        </button>
                        <button class="btn btn-outline btn-sm text-danger" onclick="deleteEvent(${event.id})">
                            &#128465; Eliminar
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getStatusLabel(status) {
        const labels = {
            'activo': 'Activo',
            'pausado': 'Pausado',
            'finalizado': 'Finalizado',
            'cancelado': 'Cancelado'
        };
        return labels[status] || status;
    }

    // =============================================
    // MODAL CREAR/EDITAR
    // =============================================

    window.showCreateModal = function() {
        editingId = null;
        document.getElementById('modal-title').textContent = 'Nuevo Evento Especial';
        document.getElementById('event-form').reset();
        document.getElementById('event-image-url').value = '';
        document.getElementById('image-preview').innerHTML = '<span class="image-placeholder">&#128247; Click para subir imagen</span>';

        // Defaults
        document.querySelector('input[name="event_type"][value="sorteo"]').checked = true;
        toggleEventType();

        // Fecha inicio por defecto: hoy
        document.getElementById('recurrence-start').value = new Date().toISOString().split('T')[0];

        document.getElementById('event-modal').classList.add('active');
    };

    window.editEvent = async function(id) {
        editingId = id;
        const event = allEvents.find(e => e.id === id);
        if (!event) return;

        document.getElementById('modal-title').textContent = 'Editar Evento Especial';

        // Tipo de evento
        const typeRadio = document.querySelector(`input[name="event_type"][value="${event.event_type}"]`);
        if (typeRadio) typeRadio.checked = true;
        toggleEventType();

        // Info basica
        document.getElementById('event-title').value = event.title || '';
        document.getElementById('event-description').value = event.description || '';
        document.getElementById('event-location').value = event.location || '';
        document.getElementById('event-address').value = event.address || '';
        document.getElementById('event-category').value = event.category_id || '';
        document.getElementById('event-zone').value = event.zone_id || '';

        // Contacto
        document.getElementById('event-phone').value = event.phone || '';
        document.getElementById('event-whatsapp').value = event.whatsapp || '';
        document.getElementById('event-website').value = event.website || '';

        // Estado
        document.getElementById('event-status').value = event.status || 'activo';

        // Imagen
        if (event.image_url) {
            document.getElementById('event-image-url').value = event.image_url;
            document.getElementById('image-preview').innerHTML = `<img src="${event.image_url}" alt="Preview">`;
        } else {
            document.getElementById('event-image-url').value = '';
            document.getElementById('image-preview').innerHTML = '<span class="image-placeholder">&#128247; Click para subir imagen</span>';
        }

        // Campos sorteo
        if (event.event_type === 'sorteo') {
            document.getElementById('prize-description').value = event.prize_description || '';
            document.getElementById('prize-value').value = event.prize_value || '';
            document.getElementById('max-participants').value = event.max_participants || '';
            document.getElementById('draw-date').value = event.draw_date || '';
            document.getElementById('draw-time').value = event.draw_time || '';
            document.getElementById('winners-count').value = event.winners_count || 1;
            document.getElementById('registration-deadline').value = event.registration_deadline || '';
        }

        // Campos recurrente
        if (event.event_type === 'recurrente') {
            document.getElementById('recurrence-day').value = event.recurrence_day || 6;
            document.getElementById('recurrence-time').value = event.recurrence_time || '21:00';
            document.getElementById('recurrence-start').value = event.recurrence_start_date || '';
            document.getElementById('recurrence-weeks').value = event.recurrence_weeks || 8;
            document.getElementById('event-price').value = event.price || 0;

            // Actualizar selector de dia
            document.querySelectorAll('.day-btn').forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.day == event.recurrence_day);
            });

            updateRecurrencePreview();
        }

        document.getElementById('event-modal').classList.add('active');
    };

    window.closeModal = function() {
        document.getElementById('event-modal').classList.remove('active');
        editingId = null;
    };

    window.toggleEventType = function() {
        const type = document.querySelector('input[name="event_type"]:checked')?.value || 'sorteo';

        document.querySelectorAll('.sorteo-fields').forEach(el => {
            el.classList.toggle('show', type === 'sorteo');
        });

        document.querySelectorAll('.recurrente-fields').forEach(el => {
            el.classList.toggle('show', type === 'recurrente');
        });
    };

    // =============================================
    // GUARDAR EVENTO
    // =============================================

    window.saveEvent = async function(e) {
        e.preventDefault();

        const eventType = document.querySelector('input[name="event_type"]:checked')?.value;
        const title = document.getElementById('event-title').value.trim();

        if (!title) {
            Components.toast('El titulo es requerido', 'error');
            return;
        }

        const data = {
            event_type: eventType,
            title,
            description: document.getElementById('event-description').value.trim() || null,
            location: document.getElementById('event-location').value.trim() || null,
            address: document.getElementById('event-address').value.trim() || null,
            category_id: document.getElementById('event-category').value || null,
            zone_id: document.getElementById('event-zone').value || null,
            phone: document.getElementById('event-phone').value.trim() || null,
            whatsapp: document.getElementById('event-whatsapp').value.trim() || null,
            website: document.getElementById('event-website').value.trim() || null,
            image_url: document.getElementById('event-image-url').value || null,
            status: document.getElementById('event-status').value
        };

        // Campos sorteo
        if (eventType === 'sorteo') {
            data.prize_description = document.getElementById('prize-description').value.trim() || null;
            data.prize_value = parseFloat(document.getElementById('prize-value').value) || null;
            data.max_participants = parseInt(document.getElementById('max-participants').value) || null;
            data.draw_date = document.getElementById('draw-date').value || null;
            data.draw_time = document.getElementById('draw-time').value || null;
            data.winners_count = parseInt(document.getElementById('winners-count').value) || 1;
            data.registration_deadline = document.getElementById('registration-deadline').value || null;
        }

        // Campos recurrente
        if (eventType === 'recurrente') {
            data.recurrence_day = parseInt(document.getElementById('recurrence-day').value);
            data.recurrence_time = document.getElementById('recurrence-time').value || '21:00';
            data.recurrence_start_date = document.getElementById('recurrence-start').value;
            data.recurrence_weeks = parseInt(document.getElementById('recurrence-weeks').value) || 8;
            data.price = parseFloat(document.getElementById('event-price').value) || 0;

            if (!data.recurrence_start_date) {
                Components.toast('La fecha de inicio es requerida', 'error');
                return;
            }
        }

        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';

        try {
            let response;
            if (editingId) {
                response = await api.put(`/api/admin/special-events/${editingId}`, data);
            } else {
                response = await api.post('/api/admin/special-events', data);
            }

            if (response.success) {
                Components.toast(editingId ? 'Evento actualizado' : 'Evento creado', 'success');
                closeModal();
                await loadEvents();
            } else {
                Components.toast(response.error || 'Error guardando evento', 'error');
            }
        } catch (e) {
            console.error('Error saving event:', e);
            Components.toast(e.message || 'Error guardando evento', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar';
        }
    };

    // =============================================
    // ELIMINAR EVENTO
    // =============================================

    window.deleteEvent = async function(id) {
        const event = allEvents.find(e => e.id === id);
        if (!event) return;

        let confirmMsg = `¿Eliminar "${event.title}"?`;
        if (event.event_type === 'recurrente' && event.generated_event_ids) {
            const count = JSON.parse(event.generated_event_ids).length;
            confirmMsg += `\n\nEsto tambien eliminara ${count} eventos generados.`;
        }

        if (!confirm(confirmMsg)) return;

        try {
            const response = await api.delete(`/api/admin/special-events/${id}`);
            if (response.success) {
                Components.toast('Evento eliminado', 'success');
                await loadEvents();
            }
        } catch (e) {
            console.error('Error deleting event:', e);
            Components.toast(e.message || 'Error eliminando evento', 'error');
        }
    };

    // =============================================
    // PARTICIPANTES DEL SORTEO
    // =============================================

    window.viewParticipants = async function(sorteoId) {
        currentSorteoId = sorteoId;
        const sorteo = allEvents.find(e => e.id === sorteoId);

        document.getElementById('participants-modal').classList.add('active');
        document.getElementById('participants-list').innerHTML = '<div class="text-center p-4"><div class="spinner"></div></div>';

        // Mostrar/ocultar boton de sortear
        const selectBtn = document.getElementById('select-winners-btn');
        selectBtn.style.display = sorteo?.status === 'activo' ? 'inline-block' : 'none';

        try {
            const response = await api.get(`/api/admin/sorteos/${sorteoId}/participants`);

            if (response.success) {
                const participants = response.data?.participants || [];
                renderParticipants(participants);
            }
        } catch (e) {
            console.error('Error loading participants:', e);
            document.getElementById('participants-list').innerHTML = '<p class="text-center text-danger p-4">Error cargando participantes</p>';
        }
    };

    function renderParticipants(participants) {
        const container = document.getElementById('participants-list');

        if (participants.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No hay participantes</p>';
            return;
        }

        container.innerHTML = participants.map(p => `
            <div class="participant-card ${p.is_winner ? 'winner' : ''} ${p.status === 'descalificado' ? 'disqualified' : ''}">
                <div class="participant-info">
                    <div class="participant-name">${Utils.escapeHtml(p.user_name)}</div>
                    <div class="participant-email">${Utils.escapeHtml(p.user_email)}</div>
                    ${p.user_phone ? `<div class="participant-email">&#128222; ${Utils.escapeHtml(p.user_phone)}</div>` : ''}
                </div>
                ${p.is_winner ? '<span class="winner-badge">&#127942; GANADOR</span>' : ''}
                ${p.status === 'descalificado' ? '<span class="badge badge-danger">Descalificado</span>' : ''}
                ${p.is_winner && !p.prize_claimed ? `
                    <button class="btn btn-sm btn-outline" onclick="markPrizeClaimed(${p.id})">
                        &#9989; Marcar reclamado
                    </button>
                ` : ''}
                ${!p.is_winner && p.status !== 'descalificado' ? `
                    <button class="btn btn-sm btn-outline text-danger" onclick="disqualifyParticipant(${p.id})">
                        &#10060;
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    window.closeParticipantsModal = function() {
        document.getElementById('participants-modal').classList.remove('active');
        currentSorteoId = null;
    };

    window.selectWinnersForSorteo = async function(sorteoId) {
        currentSorteoId = sorteoId;
        await selectWinners();
    };

    window.selectWinners = async function() {
        if (!currentSorteoId) return;

        if (!confirm('¿Sortear ganadores ahora? Esto finalizara el sorteo.')) return;

        try {
            const response = await api.post(`/api/admin/sorteos/${currentSorteoId}/select-winners`);

            if (response.success) {
                Components.toast(`Se seleccionaron ${response.data?.winners_selected || 0} ganador(es)`, 'success');
                await loadEvents();
                viewParticipants(currentSorteoId);
            }
        } catch (e) {
            console.error('Error selecting winners:', e);
            Components.toast(e.message || 'Error sorteando ganadores', 'error');
        }
    };

    window.markPrizeClaimed = async function(participantId) {
        try {
            const response = await api.put(`/api/admin/sorteos/participants/${participantId}/claim`);

            if (response.success) {
                Components.toast('Premio marcado como reclamado', 'success');
                if (currentSorteoId) viewParticipants(currentSorteoId);
            }
        } catch (e) {
            console.error('Error marking prize claimed:', e);
            Components.toast(e.message || 'Error', 'error');
        }
    };

    window.disqualifyParticipant = async function(participantId) {
        const notes = prompt('Motivo de descalificacion (opcional):');
        if (notes === null) return; // Cancelado

        try {
            const response = await api.put(`/api/admin/sorteos/participants/${participantId}/disqualify`, { notes });

            if (response.success) {
                Components.toast('Participante descalificado', 'success');
                if (currentSorteoId) viewParticipants(currentSorteoId);
            }
        } catch (e) {
            console.error('Error disqualifying participant:', e);
            Components.toast(e.message || 'Error', 'error');
        }
    };

    // =============================================
    // UPLOAD DE IMAGEN
    // =============================================

    window.handleImageUpload = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const preview = document.getElementById('image-preview');
        preview.innerHTML = '<div class="spinner"></div>';

        try {
            // Comprimir imagen
            const compressed = await Utils.compressImage(file, 800, 0.8);

            // Mostrar preview
            preview.innerHTML = `<img src="${compressed}" alt="Preview">`;
            document.getElementById('event-image-url').value = compressed;

        } catch (e) {
            console.error('Error uploading image:', e);
            preview.innerHTML = '<span class="image-placeholder">&#128247; Error subiendo imagen</span>';
            Components.toast('Error subiendo imagen', 'error');
        }
    };

    // =============================================
    // INICIAR
    // =============================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
