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

            const base64String = await compressImage(file, 600, 0.6);
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
            status: document.getElementById('event-estado').value
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
