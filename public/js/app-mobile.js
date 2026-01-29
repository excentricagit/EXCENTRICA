// EXCENTRICA - App Mobile
// Inicializacion y estado global

const MobileApp = {
    currentPage: null,
    user: null,

    // Inicializar app
    init(options = {}) {
        this.currentPage = options.page || 'home';
        this.user = Auth.getUser();

        // Inicializar navegacion
        MobileNav.init(this.currentPage);

        // Ejecutar callback de pagina si existe
        if (options.onReady && typeof options.onReady === 'function') {
            options.onReady();
        }
    },

    // Obtener usuario actual
    getUser() {
        if (!this.user) {
            this.user = Auth.getUser();
        }
        return this.user;
    },

    // Verificar si esta logueado
    isLoggedIn() {
        return !!this.getUser();
    },

    // Verificar si es periodista
    isPeriodista() {
        const user = this.getUser();
        return user && user.role === 'periodista';
    },

    // Verificar si puede publicar noticias (periodista, editor, admin)
    canPublishNews() {
        const user = this.getUser();
        return user && ['periodista', 'editor', 'admin', 'reporter'].includes(user.role);
    },

    // Redirigir a home si no puede publicar
    requireCanPublish() {
        if (!this.requireAuth()) return false;

        if (!this.canPublishNews()) {
            MobileUI.toast('No tienes permisos para publicar', 'error');
            window.location.href = '/mobile/index-mobile.html';
            return false;
        }
        return true;
    },

    // Redirigir a login si no esta autenticado
    requireAuth(redirectUrl = null) {
        if (!this.isLoggedIn()) {
            const redirect = redirectUrl || window.location.pathname;
            window.location.href = `/mobile/login-mobile.html?redirect=${encodeURIComponent(redirect)}`;
            return false;
        }
        return true;
    },

    // Redirigir a home si no es periodista
    requirePeriodista() {
        if (!this.requireAuth()) return false;

        if (!this.isPeriodista()) {
            MobileUI.toast('No tienes permisos para acceder', 'error');
            window.location.href = '/mobile/index-mobile.html';
            return false;
        }
        return true;
    },

    // Logout
    logout() {
        Auth.logout();
        this.user = null;
        window.location.href = '/mobile/index-mobile.html';
    },

    // Compartir contenido
    async share(data) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data.title || 'Excentrica',
                    text: data.text || '',
                    url: data.url || window.location.href
                });
                return true;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                }
            }
        }

        // Fallback: copiar URL
        await Utils.copyToClipboard(data.url || window.location.href);
        MobileUI.toast('Enlace copiado');
        return true;
    },

    // Abrir WhatsApp
    openWhatsApp(phone, message = '') {
        const cleanPhone = phone.replace(/\D/g, '');
        const url = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
        window.open(url, '_blank');
    },

    // Llamar telefono
    callPhone(phone) {
        window.location.href = `tel:${phone}`;
    },

    // Abrir mapa
    openMap(address) {
        const encoded = encodeURIComponent(address);
        window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
    },

    // Ir atras
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = '/mobile/index-mobile.html';
        }
    }
};

// Helpers globales para HTML onclick
function mobileShare(title, text, url) {
    MobileApp.share({ title, text, url });
}

function mobileWhatsApp(phone, message) {
    MobileApp.openWhatsApp(phone, message);
}

function mobileCall(phone) {
    MobileApp.callPhone(phone);
}

function mobileMap(address) {
    MobileApp.openMap(address);
}

function mobileLogout() {
    MobileApp.logout();
}

function mobileGoBack() {
    MobileApp.goBack();
}

// ============================================
// EVENTOS - Sistema de inscripciones
// ============================================

// Estado global de inscripciones
window.mobileEventRegistrations = {};

// Cargar inscripciones del usuario
async function loadMobileEventRegistrations() {
    if (!Auth.isAuthenticated()) return;

    try {
        const response = await Api.getMyEventRegistrations({ upcoming: 1 });
        if (response.success && response.data && response.data.registrations) {
            response.data.registrations.forEach(reg => {
                window.mobileEventRegistrations[reg.event_id] = {
                    status: reg.registration_status,
                    registration_code: reg.registration_code
                };
            });
        }
    } catch (e) {
        console.error('Error loading event registrations:', e);
    }
}

// Inscribirse a un evento
async function mobileSubscribeEvent(eventId, btn, e) {
    if (e) e.stopPropagation();

    if (!Auth.isAuthenticated()) {
        window.location.href = '/mobile/login-mobile.html';
        return;
    }

    // Deshabilitar botón y mostrar loading
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Procesando...';
    }

    try {
        const response = await Api.registerToEvent(eventId);

        if (response.success) {
            const data = response.data;

            // Guardar en estado global
            window.mobileEventRegistrations[eventId] = {
                status: data.status,
                registration_code: data.registration_code
            };

            // Obtener datos del evento para el modal
            let eventData = null;
            try {
                const eventResponse = await Api.getEventById(eventId);
                if (eventResponse.success && eventResponse.data) {
                    eventData = eventResponse.data;
                }
            } catch (err) {
                console.error('Error getting event data:', err);
            }

            // Actualizar botón
            if (btn) {
                const statusText = data.status === 'confirmado' ? 'Inscrito' : 'Pendiente';
                btn.innerHTML = `✓ ${statusText}`;
                btn.className = 'mobile-btn-event mobile-btn-event-subscribed';
                btn.disabled = true;
                btn.onclick = null;

                // Si es pendiente, agregar botón de WhatsApp
                if (data.status === 'pendiente' && eventData && (eventData.whatsapp || eventData.phone)) {
                    const phone = (eventData.whatsapp || eventData.phone).replace(/\D/g, '');
                    const fullPhone = phone.startsWith('54') ? phone : '54' + phone;
                    const msg = encodeURIComponent(`Hola! Me inscribí al evento "${eventData.title}" y mi inscripción está pendiente. ¿Cómo coordino?`);

                    const actionsContainer = btn.parentElement;
                    if (actionsContainer && !actionsContainer.querySelector('.mobile-btn-event-whatsapp')) {
                        const whatsappBtn = document.createElement('a');
                        whatsappBtn.href = `https://wa.me/${fullPhone}?text=${msg}`;
                        whatsappBtn.target = '_blank';
                        whatsappBtn.className = 'mobile-btn-event mobile-btn-event-whatsapp';
                        whatsappBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp';
                        whatsappBtn.onclick = (e) => e.stopPropagation();
                        btn.insertAdjacentElement('afterend', whatsappBtn);
                    }
                }
            }

            // Mostrar modal con información del evento y código
            showEventRegistrationModal(eventData, data);
        }
    } catch (error) {
        console.error('Error subscribing to event:', error);
        MobileUI.toast(error.message || 'Error al inscribirse', 'error');

        // Restaurar botón
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '📝 Inscribirse';
        }
    }
}

// Mostrar modal con información del evento y código de registro
function showEventRegistrationModal(eventData, registrationData) {
    // Remover modal existente si hay
    const existingModal = document.getElementById('event-registration-modal');
    if (existingModal) existingModal.remove();

    const isConfirmed = registrationData.status === 'confirmado';
    const eventTitle = eventData?.title || 'Evento';
    const eventDate = eventData?.event_date ? Utils.formatDate(eventData.event_date) : '';
    const eventTime = eventData?.event_time || '';
    const eventLocation = eventData?.location || '';

    // Crear WhatsApp link si es pendiente
    let whatsappLink = '';
    if (!isConfirmed && eventData && (eventData.whatsapp || eventData.phone)) {
        const phone = (eventData.whatsapp || eventData.phone).replace(/\D/g, '');
        const fullPhone = phone.startsWith('54') ? phone : '54' + phone;
        const msg = encodeURIComponent(`Hola! Me inscribí al evento "${eventTitle}" y mi código es ${registrationData.registration_code}. ¿Cómo coordino el pago?`);
        whatsappLink = `https://wa.me/${fullPhone}?text=${msg}`;
    }

    const modal = document.createElement('div');
    modal.id = 'event-registration-modal';
    modal.className = 'mobile-modal-overlay';
    modal.innerHTML = `
        <div class="mobile-modal-content mobile-registration-modal">
            <div class="mobile-modal-header">
                <span class="mobile-modal-icon">${isConfirmed ? '✅' : '⏳'}</span>
                <h2 class="mobile-modal-title">${isConfirmed ? '¡Inscripción Confirmada!' : 'Inscripción Pendiente'}</h2>
            </div>

            <div class="mobile-modal-body">
                <div class="registration-event-info">
                    <h3 class="registration-event-title">${Utils.escapeHtml(eventTitle)}</h3>
                    ${eventDate ? `<p class="registration-event-detail">📅 ${eventDate}${eventTime ? ' - ' + eventTime : ''}</p>` : ''}
                    ${eventLocation ? `<p class="registration-event-detail">📍 ${Utils.escapeHtml(eventLocation)}</p>` : ''}
                </div>

                <div class="registration-code-box">
                    <span class="registration-code-label">Tu código de entrada</span>
                    <span class="registration-code-value">${registrationData.registration_code}</span>
                    <button class="registration-code-copy" onclick="copyRegistrationCode('${registrationData.registration_code}')">
                        Copiar código
                    </button>
                </div>

                ${!isConfirmed ? `
                    <div class="registration-pending-notice">
                        <p>Tu inscripción está pendiente de confirmación.</p>
                        ${whatsappLink ? `<p>Contacta al organizador para coordinar el pago.</p>` : ''}
                    </div>
                    ${whatsappLink ? `
                        <a href="${whatsappLink}" target="_blank" class="mobile-btn mobile-btn-whatsapp-large">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Contactar por WhatsApp
                        </a>
                    ` : ''}
                ` : `
                    <div class="registration-confirmed-notice">
                        <p>Presenta este código en la entrada del evento.</p>
                    </div>
                `}
            </div>

            <button class="mobile-modal-close" onclick="closeEventRegistrationModal()">
                Entendido
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    // Animar entrada
    requestAnimationFrame(() => {
        modal.classList.add('active');
    });
}

// Cerrar modal de registro
function closeEventRegistrationModal() {
    const modal = document.getElementById('event-registration-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Copiar código de registro
async function copyRegistrationCode(code) {
    try {
        await navigator.clipboard.writeText(code);
        MobileUI.toast('Código copiado', 'success');
    } catch (e) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        MobileUI.toast('Código copiado', 'success');
    }
}
