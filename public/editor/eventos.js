/* =============================================
   EDITOR EVENTOS - Logica de gestion de eventos
   ============================================= */

(function() {
    'use strict';

    // Verificar autenticacion
    if (!auth.getUser()) {
        return;
    }

    document.getElementById('user-name').textContent = auth.getUser()?.name || 'Editor';

    let allEvents = [];
    let filteredEvents = [];
    let categories = [];
    let zones = [];
    let allSorteos = [];
    let currentTab = 'eventos';
    let currentSorteoId = null;
    let duplicarEventData = null;
    let lastCreatedEventIds = []; // Para poder deshacer

    // Cargar datos iniciales
    async function loadData() {
        try {
            const [eventsResponse, categoriesResponse, zonesResponse] = await Promise.all([
                api.getAdminEvents(),
                api.getAdminCategories('eventos'),
                api.getAdminZones()
            ]);

            if (eventsResponse.success) {
                allEvents = eventsResponse.data.events || eventsResponse.data || [];
                applyFilters();
                updateStats();
            }

            if (categoriesResponse.success) {
                categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
                categories = categories.filter(cat => cat.is_active !== 0);
                renderCategoryOptions();
            }

            if (zonesResponse.success) {
                zones = Array.isArray(zonesResponse.data) ? zonesResponse.data : [];
                zones = zones.filter(zone => zone.is_active !== 0);
                renderZoneOptions();
            }
        } catch (e) {
            console.error('Error loading data:', e);
            Components.toast('Error cargando datos', 'error');
        }
    }

    function renderCategoryOptions() {
        const select = document.getElementById('event-categoria');
        if (!select) return;
        select.innerHTML = '<option value="">Sin categoria</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    }

    function renderZoneOptions() {
        const select = document.getElementById('event-zona');
        if (!select) return;
        select.innerHTML = '<option value="">Sin zona especifica</option>' +
            zones.map(zone => `<option value="${zone.id}">${zone.name}</option>`).join('');
    }

    function applyFilters() {
        const searchEl = document.getElementById('search');
        const statusEl = document.getElementById('filter-status');
        const dateEl = document.getElementById('filter-date');

        const search = searchEl ? searchEl.value.toLowerCase() : '';
        const status = statusEl ? statusEl.value : '';
        const dateFilter = dateEl ? dateEl.value : '';
        const now = new Date();

        filteredEvents = allEvents.filter(event => {
            const matchSearch = !search ||
                event.title.toLowerCase().includes(search) ||
                (event.description && event.description.toLowerCase().includes(search));

            const matchStatus = !status || event.status === status;

            let matchDate = true;
            if (dateFilter === 'upcoming') {
                matchDate = new Date(event.event_date) >= now;
            } else if (dateFilter === 'past') {
                matchDate = new Date(event.event_date) < now;
            }

            return matchSearch && matchStatus && matchDate;
        });

        renderTable();
    }

    function renderTable() {
        const container = document.getElementById('events-table-container');
        if (!container) return;

        if (filteredEvents.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No se encontraron eventos</p>';
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Organizador</th>
                        <th>Fecha</th>
                        <th>Lugar</th>
                        <th>Estado</th>
                        <th>Creado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredEvents.map(event => `
                        <tr>
                            <td>
                                <div class="event-info">
                                    <strong>${event.title}</strong>
                                    ${event.is_featured ? '<span class="badge badge-primary" style="margin-left:0.5rem;">⭐ Destacado</span>' : ''}
                                    ${event.is_special ? '<span class="badge badge-info" style="margin-left:0.5rem;">✨ Especial</span>' : ''}
                                    ${event.description ? `<br><small class="text-muted">${truncate(event.description, 60)}</small>` : ''}
                                </div>
                            </td>
                            <td>${event.author_name || '-'}</td>
                            <td>
                                <strong>${formatEventDate(event.event_date)}</strong>
                                ${isUpcoming(event.event_date) ? '<br><span class="badge badge-info">Proximo</span>' : ''}
                            </td>
                            <td>${event.location || '-'}</td>
                            <td>
                                <span class="badge badge-${getStatusBadgeClass(event.status)}">
                                    ${getStatusLabel(event.status)}
                                </span>
                            </td>
                            <td>${formatDate(event.created_at)}</td>
                            <td>
                                <div class="btn-group">
                                    ${event.status === 'pending' ? `
                                        <button class="btn btn-sm btn-success" onclick="approveEvent(${event.id})" title="Aprobar">
                                            ✅
                                        </button>
                                        <button class="btn btn-sm btn-danger" onclick="rejectEvent(${event.id})" title="Rechazar">
                                            ❌
                                        </button>
                                    ` : ''}
                                    <button class="btn btn-sm btn-outline" onclick="editEvent(${event.id})" title="Editar">
                                        ✏️
                                    </button>
                                    <button class="btn btn-sm btn-outline" onclick="showDuplicarModal(${event.id})" title="Duplicar semanalmente" style="color: #3b82f6; border-color: #3b82f6;">
                                        🔄
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})" title="Eliminar">
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

    function updateStats() {
        const now = new Date();
        const totalEl = document.getElementById('total-events');
        const pendingEl = document.getElementById('pending-events');
        const approvedEl = document.getElementById('approved-events');
        const upcomingEl = document.getElementById('upcoming-events');

        if (totalEl) totalEl.textContent = allEvents.length;
        if (pendingEl) pendingEl.textContent = allEvents.filter(e => e.status === 'pending').length;
        if (approvedEl) approvedEl.textContent = allEvents.filter(e => e.status === 'approved').length;
        if (upcomingEl) upcomingEl.textContent = allEvents.filter(e => new Date(e.event_date) >= now).length;
    }

    function getStatusBadgeClass(status) {
        const classes = {
            pending: 'warning',
            approved: 'success',
            rejected: 'danger'
        };
        return classes[status] || 'secondary';
    }

    function getStatusLabel(status) {
        const labels = {
            pending: 'Pendiente',
            approved: 'Aprobado',
            rejected: 'Rechazado'
        };
        return labels[status] || status;
    }

    function truncate(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function formatEventDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function isUpcoming(dateString) {
        return new Date(dateString) >= new Date();
    }

    // Funciones globales
    window.resetFilters = function() {
        const searchEl = document.getElementById('search');
        const statusEl = document.getElementById('filter-status');
        const dateEl = document.getElementById('filter-date');

        if (searchEl) searchEl.value = '';
        if (statusEl) statusEl.value = '';
        if (dateEl) dateEl.value = '';
        applyFilters();
    };

    window.approveEvent = async function(eventId) {
        if (!confirm('¿Aprobar este evento?')) return;

        try {
            const response = await api.updateEvent(eventId, { status: 'approved' });
            if (response.success) {
                Components.toast('Evento aprobado exitosamente', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error approving event:', e);
            Components.toast('Error aprobando evento', 'error');
        }
    };

    window.rejectEvent = async function(eventId) {
        if (!confirm('¿Rechazar este evento?')) return;

        try {
            const response = await api.updateEvent(eventId, { status: 'rejected' });
            if (response.success) {
                Components.toast('Evento rechazado', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error rejecting event:', e);
            Components.toast('Error rechazando evento', 'error');
        }
    };

    window.deleteEvent = async function(eventId) {
        if (!confirm('¿Eliminar este evento? Esta accion no se puede deshacer.')) return;

        try {
            const response = await api.deleteEvent(eventId);
            if (response.success) {
                Components.toast('Evento eliminado exitosamente', 'success');
                loadData();
            }
        } catch (e) {
            console.error('Error deleting event:', e);
            Components.toast('Error eliminando evento', 'error');
        }
    };

    // Comprimir imagen antes de convertir a base64
    function compressImage(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Subir imagen del evento
    window.uploadEventImage = async function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            Components.toast('Tipo de archivo no permitido. Usa JPG, PNG, GIF o WebP', 'error');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            Components.toast('El archivo excede el tamano maximo de 10MB', 'error');
            event.target.value = '';
            return;
        }

        try {
            Components.toast('Procesando imagen...', 'info');

            const base64String = await compressImage(file, 800, 0.75);
            document.getElementById('event-imagen').value = base64String;
            showImagePreview('event-image-preview', base64String);
            event.target.required = false;
            Components.toast('Imagen cargada correctamente', 'success');

        } catch (e) {
            console.error('Error uploading image:', e);
            Components.toast('Error procesando imagen: ' + e.message, 'error');
            event.target.value = '';
        }
    };

    function showImagePreview(containerId, url) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const inputId = containerId.replace('-preview', '-file');
        const fileInput = document.getElementById(inputId);
        if (fileInput) {
            fileInput.style.display = 'none';
        }

        container.innerHTML = '';
        container.style.display = 'flex';

        const img = document.createElement('img');
        img.src = url;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '280px';
        img.style.objectFit = 'contain';

        container.appendChild(img);
    }

    window.showCreateModal = function() {
        document.getElementById('modal-title').textContent = 'Nuevo Evento';
        document.getElementById('event-form').reset();
        document.getElementById('event-id').value = '';
        document.getElementById('event-imagen').value = '';
        document.getElementById('event-precio').value = '0';
        document.getElementById('event-estado').value = 'pending';
        document.getElementById('event-is-featured').checked = false;
        document.getElementById('event-is-special').checked = false;

        const previewContainer = document.getElementById('event-image-preview');
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'flex';

        const fileInput = document.getElementById('event-imagen-file');
        fileInput.style.display = 'block';
        fileInput.value = '';
        fileInput.required = true;

        openModal();
    };

    window.editEvent = function(eventId) {
        const event = allEvents.find(e => e.id === eventId);
        if (!event) return;

        document.getElementById('modal-title').textContent = 'Editar Evento';
        document.getElementById('event-id').value = event.id;
        document.getElementById('event-titulo').value = event.title || '';
        document.getElementById('event-descripcion').value = event.description || '';

        if (event.event_date) {
            const date = new Date(event.event_date);
            const formattedDate = date.toISOString().slice(0, 16);
            document.getElementById('event-fecha').value = formattedDate;
        }

        document.getElementById('event-lugar').value = event.location || '';
        document.getElementById('event-direccion').value = event.address || '';
        document.getElementById('event-precio').value = event.price || '0';
        document.getElementById('event-imagen').value = event.image_url || '';
        document.getElementById('event-categoria').value = event.category_id || '';
        document.getElementById('event-zona').value = event.zone_id || '';
        document.getElementById('event-telefono').value = event.phone || '';
        document.getElementById('event-whatsapp').value = event.whatsapp || '';
        document.getElementById('event-web').value = event.website || '';
        document.getElementById('event-estado').value = event.status || 'pending';
        document.getElementById('event-is-featured').checked = event.is_featured === 1;
        document.getElementById('event-is-special').checked = event.is_special === 1;

        const fileInput = document.getElementById('event-imagen-file');

        if (event.image_url) {
            showImagePreview('event-image-preview', event.image_url);
            fileInput.required = false;
        } else {
            const previewContainer = document.getElementById('event-image-preview');
            previewContainer.innerHTML = '';
            previewContainer.style.display = 'flex';
            fileInput.style.display = 'block';
            fileInput.required = true;
        }

        openModal();
    };

    window.saveEvent = async function(event) {
        event.preventDefault();

        const eventId = document.getElementById('event-id').value;
        const imagenUrl = document.getElementById('event-imagen').value;

        if (!eventId && !imagenUrl) {
            Components.toast('Debe subir una imagen del evento', 'error');
            return;
        }

        const fechaEvento = document.getElementById('event-fecha').value;
        let eventDate = null;
        let eventTime = null;

        if (fechaEvento) {
            const dateObj = new Date(fechaEvento);
            eventDate = dateObj.toISOString().split('T')[0];
            eventTime = dateObj.toTimeString().split(' ')[0].substring(0, 5);
        }

        const data = {
            title: document.getElementById('event-titulo').value,
            description: document.getElementById('event-descripcion').value,
            event_date: eventDate,
            event_time: eventTime,
            location: document.getElementById('event-lugar').value,
            address: document.getElementById('event-direccion').value || null,
            price: parseFloat(document.getElementById('event-precio').value) || 0,
            image_url: imagenUrl || null,
            category_id: document.getElementById('event-categoria').value || null,
            zone_id: document.getElementById('event-zona').value || null,
            phone: document.getElementById('event-telefono').value || null,
            whatsapp: document.getElementById('event-whatsapp').value || null,
            website: document.getElementById('event-web').value || null,
            status: document.getElementById('event-estado').value,
            is_featured: document.getElementById('event-is-featured').checked ? 1 : 0,
            is_special: document.getElementById('event-is-special').checked ? 1 : 0
        };

        try {
            let response;
            if (eventId) {
                response = await api.updateEvent(eventId, data);
            } else {
                response = await api.createEvent(data);
            }

            if (response.success) {
                Components.toast(eventId ? 'Evento actualizado exitosamente' : 'Evento creado exitosamente', 'success');
                closeModal();
                loadData();
            }
        } catch (e) {
            console.error('Error saving event:', e);
            Components.toast(e.message || 'Error guardando evento', 'error');
        }
    };

    function openModal() {
        document.getElementById('event-modal').classList.add('active');
        document.getElementById('event-modal-backdrop').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closeModal = function() {
        document.getElementById('event-modal').classList.remove('active');
        document.getElementById('event-modal-backdrop').classList.remove('active');
        document.body.style.overflow = '';
    };

    // =============================================
    // TAB SWITCHING
    // =============================================
    window.switchTab = function(tab) {
        currentTab = tab;

        // Update tab buttons
        document.querySelectorAll('.event-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tab}`);
            content.style.display = content.id === `tab-${tab}` ? 'block' : 'none';
        });

        // Load data if needed
        if (tab === 'sorteos' && allSorteos.length === 0) {
            loadSorteos();
        }
    };

    // =============================================
    // SORTEOS FUNCTIONS
    // =============================================
    async function loadSorteos() {
        const container = document.getElementById('sorteos-container');
        if (!container) return;

        try {
            const status = document.getElementById('filter-sorteo-status')?.value || '';
            const response = await api.getAdminSpecialEvents({ type: 'sorteo', status });

            if (response.success) {
                allSorteos = response.data.events || [];
                renderSorteos();
                updateSorteosStats();
            }
        } catch (e) {
            console.error('Error loading sorteos:', e);
            container.innerHTML = '<p class="text-center text-muted p-4">Error cargando sorteos</p>';
        }
    }

    function renderSorteos() {
        const container = document.getElementById('sorteos-container');
        if (!container) return;

        if (allSorteos.length === 0) {
            container.innerHTML = '<p class="text-center text-muted p-4">No hay sorteos creados</p>';
            return;
        }

        container.innerHTML = allSorteos.map(sorteo => `
            <div class="sorteo-card">
                <div class="sorteo-card-header">
                    <div>
                        <h4 class="sorteo-card-title">${sorteo.title}</h4>
                        <p class="sorteo-card-prize">🎁 ${sorteo.prize_description || 'Sin descripcion'}</p>
                    </div>
                    <span class="badge badge-${getSorteoStatusBadge(sorteo.status)}">${getSorteoStatusLabel(sorteo.status)}</span>
                </div>
                <div class="sorteo-card-info">
                    <span>📅 ${sorteo.draw_date ? formatDate(sorteo.draw_date) : 'Sin fecha'}</span>
                    <span>⏰ ${sorteo.draw_time || '--:--'}</span>
                    <span>👥 ${sorteo.participants_count || 0} participantes</span>
                    <span>🏆 ${sorteo.winners_count || 1} ganador(es)</span>
                    ${sorteo.prize_value ? `<span>💰 $${sorteo.prize_value}</span>` : ''}
                </div>
                <div class="sorteo-card-actions">
                    <button class="btn btn-sm btn-outline" onclick="showParticipantsModal(${sorteo.id})">
                        👥 Ver Participantes
                    </button>
                    ${sorteo.status === 'activo' ? `
                        <button class="btn btn-sm btn-primary" onclick="selectWinners(${sorteo.id})">
                            🏆 Sortear
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline" onclick="editSorteo(${sorteo.id})">
                        ✏️ Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSorteo(${sorteo.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    function updateSorteosStats() {
        const totalEl = document.getElementById('total-sorteos');
        const participantsEl = document.getElementById('total-participants');
        const finalizadosEl = document.getElementById('total-finalizados');

        if (totalEl) totalEl.textContent = allSorteos.filter(s => s.status === 'activo').length;
        if (participantsEl) {
            const total = allSorteos.reduce((sum, s) => sum + (s.participants_count || 0), 0);
            participantsEl.textContent = total;
        }
        if (finalizadosEl) finalizadosEl.textContent = allSorteos.filter(s => s.status === 'finalizado').length;
    }

    function getSorteoStatusBadge(status) {
        const badges = {
            activo: 'success',
            pausado: 'warning',
            finalizado: 'info',
            cancelado: 'danger'
        };
        return badges[status] || 'secondary';
    }

    function getSorteoStatusLabel(status) {
        const labels = {
            activo: 'Activo',
            pausado: 'Pausado',
            finalizado: 'Finalizado',
            cancelado: 'Cancelado'
        };
        return labels[status] || status;
    }

    window.showSorteoModal = function(sorteoId = null) {
        currentSorteoId = sorteoId;
        const form = document.getElementById('sorteo-form');
        form.reset();
        document.getElementById('sorteo-id').value = sorteoId || '';

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        document.getElementById('sorteo-fecha').value = tomorrow.toISOString().split('T')[0];

        if (sorteoId) {
            const sorteo = allSorteos.find(s => s.id === sorteoId);
            if (sorteo) {
                document.getElementById('sorteo-titulo').value = sorteo.title || '';
                document.getElementById('sorteo-premio').value = sorteo.prize_description || '';
                document.getElementById('sorteo-valor').value = sorteo.prize_value || '';
                document.getElementById('sorteo-lugar').value = sorteo.location || '';
                document.getElementById('sorteo-whatsapp').value = sorteo.whatsapp || '';
                document.getElementById('sorteo-fecha').value = sorteo.draw_date || '';
                document.getElementById('sorteo-hora').value = sorteo.draw_time || '20:00';
                document.getElementById('sorteo-ganadores').value = sorteo.winners_count || 1;
                document.getElementById('sorteo-max').value = sorteo.max_participants || '';
                document.getElementById('sorteo-deadline').value = sorteo.registration_deadline || '';
            }
        }

        document.getElementById('sorteo-modal').classList.add('active');
        document.getElementById('sorteo-modal-backdrop').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeSorteoModal = function() {
        document.getElementById('sorteo-modal').classList.remove('active');
        document.getElementById('sorteo-modal-backdrop').classList.remove('active');
        document.body.style.overflow = '';
        currentSorteoId = null;
    };

    window.editSorteo = function(sorteoId) {
        showSorteoModal(sorteoId);
    };

    window.saveSorteo = async function(event) {
        event.preventDefault();

        const sorteoId = document.getElementById('sorteo-id').value;
        const data = {
            event_type: 'sorteo',
            title: document.getElementById('sorteo-titulo').value,
            prize_description: document.getElementById('sorteo-premio').value,
            prize_value: parseFloat(document.getElementById('sorteo-valor').value) || null,
            location: document.getElementById('sorteo-lugar').value || null,
            whatsapp: document.getElementById('sorteo-whatsapp').value || null,
            draw_date: document.getElementById('sorteo-fecha').value,
            draw_time: document.getElementById('sorteo-hora').value || null,
            winners_count: parseInt(document.getElementById('sorteo-ganadores').value) || 1,
            max_participants: parseInt(document.getElementById('sorteo-max').value) || null,
            registration_deadline: document.getElementById('sorteo-deadline').value || null
        };

        try {
            let response;
            if (sorteoId) {
                response = await api.updateSpecialEvent(sorteoId, data);
            } else {
                response = await api.createSpecialEvent(data);
            }

            if (response.success) {
                Components.toast(sorteoId ? 'Sorteo actualizado' : 'Sorteo creado', 'success');
                closeSorteoModal();
                loadSorteos();
            }
        } catch (e) {
            console.error('Error saving sorteo:', e);
            Components.toast(e.message || 'Error guardando sorteo', 'error');
        }
    };

    window.deleteSorteo = async function(sorteoId) {
        if (!confirm('¿Eliminar este sorteo? Se eliminaran tambien todos los participantes.')) return;

        try {
            const response = await api.deleteSpecialEvent(sorteoId);
            if (response.success) {
                Components.toast('Sorteo eliminado', 'success');
                loadSorteos();
            }
        } catch (e) {
            console.error('Error deleting sorteo:', e);
            Components.toast('Error eliminando sorteo', 'error');
        }
    };

    // =============================================
    // PARTICIPANTS MODAL
    // =============================================
    window.showParticipantsModal = async function(sorteoId) {
        currentSorteoId = sorteoId;
        const modal = document.getElementById('participants-modal');
        const backdrop = document.getElementById('participants-modal-backdrop');
        const list = document.getElementById('participants-list');

        modal.classList.add('active');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';

        list.innerHTML = '<div class="text-center p-4"><div class="spinner"></div></div>';

        try {
            const response = await api.getSorteoParticipants(sorteoId);
            if (response.success) {
                const { participants, winners } = response.data;

                if (participants.length === 0) {
                    list.innerHTML = '<p class="text-center text-muted p-4">No hay participantes aun</p>';
                    return;
                }

                list.innerHTML = participants.map(p => `
                    <div class="participant-item ${p.is_winner ? 'winner' : ''}">
                        <div class="participant-info">
                            <span class="participant-name">
                                ${p.is_winner ? '🏆 ' : ''}${p.user_name || 'Usuario'}
                            </span>
                            <span class="participant-email">${p.user_email || ''}</span>
                            ${p.user_phone ? `<span class="participant-email">📱 ${p.user_phone}</span>` : ''}
                        </div>
                        <div class="btn-group">
                            ${p.is_winner && !p.prize_claimed ? `
                                <button class="btn btn-sm btn-success" onclick="markPrizeClaimed(${p.id})">
                                    ✓ Entregado
                                </button>
                            ` : ''}
                            ${p.is_winner && p.prize_claimed ? `
                                <span class="badge badge-success">Premio entregado</span>
                            ` : ''}
                            ${!p.is_winner && p.status !== 'descalificado' ? `
                                <button class="btn btn-sm btn-danger" onclick="disqualifyParticipant(${p.id})">
                                    Descalificar
                                </button>
                            ` : ''}
                            ${p.status === 'descalificado' ? `
                                <span class="badge badge-danger">Descalificado</span>
                            ` : ''}
                        </div>
                    </div>
                `).join('');

                // Update sortear button visibility
                const sorteo = allSorteos.find(s => s.id === sorteoId);
                const btnSortear = document.getElementById('btn-sortear');
                if (btnSortear) {
                    btnSortear.style.display = sorteo?.status === 'activo' ? 'block' : 'none';
                }
            }
        } catch (e) {
            console.error('Error loading participants:', e);
            list.innerHTML = '<p class="text-center text-danger p-4">Error cargando participantes</p>';
        }
    };

    window.closeParticipantsModal = function() {
        document.getElementById('participants-modal').classList.remove('active');
        document.getElementById('participants-modal-backdrop').classList.remove('active');
        document.body.style.overflow = '';
    };

    window.selectWinners = async function(sorteoId = null) {
        const id = sorteoId || currentSorteoId;
        if (!id) return;

        if (!confirm('¿Realizar el sorteo y seleccionar ganadores aleatoriamente?')) return;

        try {
            const response = await api.selectSorteoWinners(id);
            if (response.success) {
                Components.toast(response.message || 'Ganadores seleccionados', 'success');
                loadSorteos();
                if (currentSorteoId === id) {
                    showParticipantsModal(id);
                }
            }
        } catch (e) {
            console.error('Error selecting winners:', e);
            Components.toast(e.message || 'Error al sortear', 'error');
        }
    };

    window.markPrizeClaimed = async function(participantId) {
        if (!confirm('¿Marcar premio como entregado?')) return;

        try {
            const response = await api.markSorteoPrizeClaimed(participantId);
            if (response.success) {
                Components.toast('Premio marcado como entregado', 'success');
                if (currentSorteoId) {
                    showParticipantsModal(currentSorteoId);
                }
            }
        } catch (e) {
            console.error('Error marking prize claimed:', e);
            Components.toast('Error al marcar premio', 'error');
        }
    };

    window.disqualifyParticipant = async function(participantId) {
        const notes = prompt('Motivo de descalificacion (opcional):');
        if (notes === null) return; // Cancelled

        try {
            const response = await api.disqualifySorteoParticipant(participantId, notes);
            if (response.success) {
                Components.toast('Participante descalificado', 'success');
                if (currentSorteoId) {
                    showParticipantsModal(currentSorteoId);
                }
            }
        } catch (e) {
            console.error('Error disqualifying:', e);
            Components.toast('Error al descalificar', 'error');
        }
    };

    // =============================================
    // DUPLICAR EVENTO SEMANAL
    // =============================================
    window.showRecurrenteModal = function() {
        // Redirect to duplicar modal but first need to select an event
        Components.toast('Selecciona un evento de la tabla y usa el boton "🔄" para duplicarlo semanalmente', 'info');
    };

    window.showDuplicarModal = function(eventId) {
        const event = allEvents.find(e => e.id === eventId);
        if (!event) {
            Components.toast('Evento no encontrado', 'error');
            return;
        }

        duplicarEventData = event;
        document.getElementById('duplicar-evento-id').value = eventId;
        document.getElementById('duplicar-evento-info').innerHTML = `
            <strong>${event.title}</strong><br>
            📅 ${formatEventDate(event.event_date)}
        `;
        document.getElementById('duplicar-semanas').value = 4;

        previewDuplicar();

        document.getElementById('duplicar-modal').classList.add('active');
        document.getElementById('duplicar-modal-backdrop').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeDuplicarModal = function() {
        document.getElementById('duplicar-modal').classList.remove('active');
        document.getElementById('duplicar-modal-backdrop').classList.remove('active');
        document.body.style.overflow = '';
        duplicarEventData = null;
    };

    window.previewDuplicar = function() {
        if (!duplicarEventData) return;

        const semanas = parseInt(document.getElementById('duplicar-semanas').value) || 4;
        const preview = document.getElementById('duplicar-preview');
        const originalDate = new Date(duplicarEventData.event_date);

        let html = '';
        for (let i = 1; i <= semanas; i++) {
            const newDate = new Date(originalDate);
            newDate.setDate(newDate.getDate() + (i * 7));
            html += `<div class="preview-date">Semana ${i}: ${formatEventDate(newDate.toISOString())}</div>`;
        }

        preview.innerHTML = html;
    };

    window.duplicarEvento = async function(event) {
        event.preventDefault();

        if (!duplicarEventData) {
            Components.toast('No hay evento seleccionado', 'error');
            return;
        }

        const semanas = parseInt(document.getElementById('duplicar-semanas').value) || 4;
        const originalDate = new Date(duplicarEventData.event_date);

        // Create array of events to create
        const eventsToCreate = [];
        for (let i = 1; i <= semanas; i++) {
            const newDate = new Date(originalDate);
            newDate.setDate(newDate.getDate() + (i * 7));

            eventsToCreate.push({
                title: duplicarEventData.title,
                description: duplicarEventData.description,
                image_url: duplicarEventData.image_url,
                category_id: duplicarEventData.category_id,
                zone_id: duplicarEventData.zone_id,
                location: duplicarEventData.location,
                address: duplicarEventData.address,
                event_date: newDate.toISOString().split('T')[0],
                event_time: duplicarEventData.event_time,
                price: duplicarEventData.price,
                phone: duplicarEventData.phone,
                whatsapp: duplicarEventData.whatsapp,
                website: duplicarEventData.website,
                status: 'approved',
                is_featured: duplicarEventData.is_featured,
                is_special: duplicarEventData.is_special
            });
        }

        try {
            const response = await api.createEventsBulk(eventsToCreate);
            if (response.success) {
                lastCreatedEventIds = response.data.ids || [];
                closeDuplicarModal();
                loadData();

                // Mostrar toast con opcion de deshacer
                if (lastCreatedEventIds.length > 0) {
                    showUndoToast(response.data.created);
                } else {
                    Components.toast(`Se crearon ${response.data.created} eventos`, 'success');
                }
            }
        } catch (e) {
            console.error('Error duplicating events:', e);
            Components.toast(e.message || 'Error al duplicar eventos', 'error');
        }
    };

    function showUndoToast(count) {
        // Crear toast personalizado con boton deshacer
        const toastContainer = document.getElementById('toast-container') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
            <span>Se crearon ${count} eventos</span>
            <button onclick="undoLastBulkCreate()" style="margin-left: 1rem; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); padding: 0.25rem 0.75rem; border-radius: 4px; color: white; cursor: pointer;">
                ↩️ Deshacer
            </button>
        `;
        toastContainer.appendChild(toast);

        // Auto-remover despues de 10 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
                lastCreatedEventIds = []; // Limpiar IDs
            }
        }, 10000);
    }

    function createToastContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = 'position: fixed; top: 1rem; right: 1rem; z-index: 9999;';
            document.body.appendChild(container);
        }
        return container;
    }

    window.undoLastBulkCreate = async function() {
        if (lastCreatedEventIds.length === 0) {
            Components.toast('No hay eventos para deshacer', 'warning');
            return;
        }

        if (!confirm(`¿Eliminar los ${lastCreatedEventIds.length} eventos recien creados?`)) return;

        try {
            const response = await api.deleteEventsBulk(lastCreatedEventIds);

            if (response.success) {
                Components.toast(`Se eliminaron ${response.data.deleted} eventos`, 'success');
                lastCreatedEventIds = [];
                loadData();

                // Remover el toast de deshacer si existe
                const toasts = document.querySelectorAll('.toast');
                toasts.forEach(t => t.remove());
            }
        } catch (e) {
            console.error('Error undoing:', e);
            Components.toast('Error al deshacer', 'error');
        }
    };

    // Event listeners
    function init() {
        const searchEl = document.getElementById('search');
        const statusEl = document.getElementById('filter-status');
        const dateEl = document.getElementById('filter-date');

        if (searchEl) searchEl.addEventListener('input', applyFilters);
        if (statusEl) statusEl.addEventListener('change', applyFilters);
        if (dateEl) dateEl.addEventListener('change', applyFilters);

        loadData();
    }

    // Inicializar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
