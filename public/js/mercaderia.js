/**
 * MERCADERIA - Logica de productos y marketplace
 */

// Estado global
let currentPage = 1;
let categories = [];
let currentCategory = '';
let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];

// Configuracion de pago
const PAYMENT_CONFIG = {
    CBU: '0000003100010599845201',
    ALIAS: 'EXCENTRICA.PAGOS',
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

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCondition(condition) {
    const conditions = {
        'new': 'Nuevo', 'nuevo': 'Nuevo',
        'used': 'Usado', 'usado': 'Usado',
        'refurbished': 'Reacondicionado', 'reacondicionado': 'Reacondicionado'
    };
    return conditions[condition] || condition || 'Sin especificar';
}

function getProductImage(product) {
    const img = product.front_image_url || product.image_url;
    return img || '/images/placeholder.svg';
}

// =============================================
// WHATSAPP
// =============================================

function getQuickWhatsAppLink(product) {
    const whatsappNumber = product.whatsapp || PAYMENT_CONFIG.WHATSAPP;
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const fullNumber = cleanNumber.startsWith('549') ? cleanNumber : `549${cleanNumber}`;
    const message = encodeURIComponent(`Hola! Me interesa "${product.title}" a ${formatPrice(product.price)}. Esta disponible?`);
    return `https://wa.me/${fullNumber}?text=${message}`;
}

function generateWhatsAppMessage(product) {
    const price = formatPrice(product.price);
    const condition = formatCondition(product.condition);

    const message = `*PEDIDO DE COMPRA - EXCENTRICA*

Hola! Estoy interesado/a en comprar el siguiente producto:

*Producto:* ${product.title}
*Precio:* ${price}
*Condicion:* ${condition}
${product.category_name ? `*Categoria:* ${product.category_name}` : ''}

---

*DATOS PARA TRANSFERENCIA:*
CBU: ${PAYMENT_CONFIG.CBU}
Alias: ${PAYMENT_CONFIG.ALIAS}

---

*IMPORTANTE:* Para confirmar tu compra, por favor realiza la transferencia y envia el comprobante a este chat.

Una vez verificado el pago, preparamos tu pedido y coordinamos el envio o retiro.

Gracias por elegir Excentrica!`;

    return encodeURIComponent(message);
}

// =============================================
// RENDERIZADO
// =============================================

function renderProductCard(product) {
    const imageUrl = getProductImage(product);
    const whatsappLink = getQuickWhatsAppLink(product);
    const whatsappSvg = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

    return `
        <article class="product-card">
            <div class="product-card-image-container" onclick="openModal(${product.id})">
                <img src="${imageUrl}" alt="${escapeHtml(product.title)}" class="product-card-image" onerror="this.src='/images/placeholder.svg'">
                ${product.condition ? `<span class="product-card-condition">${formatCondition(product.condition)}</span>` : ''}
            </div>
            <div class="product-card-body">
                ${product.category_name ? `<span class="product-card-category">${escapeHtml(product.category_name)}</span>` : ''}
                <h3 class="product-card-title" onclick="openModal(${product.id})" style="cursor:pointer;">${escapeHtml(product.title)}</h3>
                <div class="product-card-price">${formatPrice(product.price)}</div>
                ${product.zone_name ? `<div class="product-card-location"><span>📍</span> ${escapeHtml(product.zone_name)}</div>` : ''}
                <div class="product-card-actions">
                    <a href="${whatsappLink}" target="_blank" class="btn-card-whatsapp" onclick="event.stopPropagation();">
                        ${whatsappSvg} Consultar
                    </a>
                    <button class="btn-card-view" onclick="openModal(${product.id})">Ver</button>
                </div>
            </div>
        </article>
    `;
}

function renderPagination(current, total) {
    const container = document.getElementById('pagination');
    if (!container) return;

    if (total <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';
    html += `<button class="pagination-btn" onclick="loadProducts(${current - 1})" ${current <= 1 ? 'disabled' : ''}>Anterior</button>`;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
            html += `<button class="pagination-btn ${i === current ? 'active' : ''}" onclick="loadProducts(${i})">${i}</button>`;
        } else if (i === current - 2 || i === current + 2) {
            html += '<span style="color: #6b7280; padding: 0.5rem;">...</span>';
        }
    }

    html += `<button class="pagination-btn" onclick="loadProducts(${current + 1})" ${current >= total ? 'disabled' : ''}>Siguiente</button>`;
    html += '</div>';

    container.innerHTML = html;
}

// =============================================
// GALERIA DE IMAGENES
// =============================================

function buildProductImages(product) {
    const images = [];
    if (product.front_image_url) images.push({ url: product.front_image_url, label: 'Frente' });
    if (product.back_image_url) images.push({ url: product.back_image_url, label: 'Atras' });
    if (product.image_url && !product.front_image_url) images.push({ url: product.image_url, label: 'Principal' });

    if (product.images) {
        try {
            const extraImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
            if (Array.isArray(extraImages)) {
                extraImages.forEach((img, i) => images.push({ url: img, label: `Imagen ${i + 1}` }));
            }
        } catch (e) {}
    }

    return images.length > 0 ? images : [{ url: '/images/placeholder.svg', label: 'Sin imagen' }];
}

function updateGalleryDisplay() {
    const mainImg = document.getElementById('modal-main-image');
    if (mainImg) {
        mainImg.src = productImages[currentImageIndex]?.url || '/images/placeholder.svg';
    }

    document.querySelectorAll('.modal-gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === currentImageIndex);
    });
}

function prevImage() {
    if (productImages.length > 1) {
        currentImageIndex = (currentImageIndex - 1 + productImages.length) % productImages.length;
        updateGalleryDisplay();
    }
}

function nextImage() {
    if (productImages.length > 1) {
        currentImageIndex = (currentImageIndex + 1) % productImages.length;
        updateGalleryDisplay();
    }
}

function selectImage(index) {
    currentImageIndex = index;
    updateGalleryDisplay();
}

// =============================================
// MODAL
// =============================================

async function openModal(productId) {
    try {
        const response = await api.getProductById(productId);
        if (response.success && response.data) {
            const product = response.data;
            currentProduct = product;
            currentImageIndex = 0;

            productImages = buildProductImages(product);

            document.getElementById('modal-main-image').src = productImages[0].url;

            const thumbsContainer = document.getElementById('modal-thumbs');
            if (productImages.length > 1) {
                thumbsContainer.innerHTML = productImages.map((img, i) =>
                    `<img src="${img.url}" alt="${img.label}" class="modal-gallery-thumb ${i === 0 ? 'active' : ''}" onclick="selectImage(${i})" onerror="this.style.display='none'">`
                ).join('');
                thumbsContainer.style.display = 'flex';
            } else {
                thumbsContainer.innerHTML = '';
                thumbsContainer.style.display = 'none';
            }

            document.querySelectorAll('.modal-gallery-nav').forEach(btn => {
                btn.style.display = productImages.length > 1 ? 'flex' : 'none';
            });

            document.getElementById('modal-category').textContent = product.category_name || 'Producto';
            document.getElementById('modal-title').textContent = product.title;
            document.getElementById('modal-price').textContent = formatPrice(product.price);
            document.getElementById('modal-description').textContent = product.description || 'Sin descripcion disponible.';
            document.getElementById('modal-condition').textContent = formatCondition(product.condition);
            document.getElementById('modal-location').textContent = product.zone_name || product.address || 'Santiago del Estero';
            document.getElementById('modal-date').textContent = formatDate(product.created_at);
            document.getElementById('modal-seller').textContent = product.author_name || 'Excentrica';

            const originalPriceEl = document.getElementById('modal-price-original');
            const discountEl = document.getElementById('modal-discount');
            if (product.original_price && product.original_price > product.price) {
                originalPriceEl.textContent = formatPrice(product.original_price);
                originalPriceEl.style.display = 'inline';
                const discount = Math.round((1 - product.price / product.original_price) * 100);
                discountEl.textContent = `-${discount}%`;
                discountEl.style.display = 'inline';
            } else {
                originalPriceEl.style.display = 'none';
                discountEl.style.display = 'none';
            }

            const whatsappNumber = product.whatsapp || PAYMENT_CONFIG.WHATSAPP;
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const fullNumber = cleanNumber.startsWith('549') ? cleanNumber : `549${cleanNumber}`;
            const message = generateWhatsAppMessage(product);
            document.getElementById('modal-whatsapp').href = `https://wa.me/${fullNumber}?text=${message}`;

            const phoneEl = document.getElementById('modal-phone');
            if (product.phone || product.whatsapp) {
                phoneEl.textContent = product.phone || product.whatsapp;
                phoneEl.parentElement.style.display = 'block';
            } else {
                phoneEl.parentElement.style.display = 'none';
            }

            document.getElementById('product-modal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    } catch (e) {
        console.error('Error loading product:', e);
    }
}

function closeModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
    currentProduct = null;
    productImages = [];
    currentImageIndex = 0;
}

// =============================================
// CARGA DE DATOS
// =============================================

async function loadProducts(page = 1) {
    currentPage = page;
    const search = document.getElementById('search-input')?.value || '';
    const category = document.getElementById('category-filter')?.value || '';
    const zone = document.getElementById('zone-filter')?.value || '';
    const condition = document.getElementById('condition-filter')?.value || '';
    const productsGrid = document.getElementById('products-grid');

    if (!productsGrid) return;

    productsGrid.innerHTML = '<div class="text-center p-5"><div class="spinner spinner-lg mx-auto"></div></div>';

    try {
        const response = await api.getProducts({ page, limit: 12, search, category, zone, condition });

        if (response.success && response.data.products && response.data.products.length > 0) {
            const products = response.data.products;
            productsGrid.innerHTML = products.map(p => renderProductCard(p)).join('');

            const total = response.data.pagination.total;
            const resultsEl = document.getElementById('results-count');
            if (resultsEl) {
                resultsEl.textContent = `${total} producto${total !== 1 ? 's' : ''}`;
            }

            renderPagination(response.data.pagination.page, response.data.pagination.pages);
        } else {
            productsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #94a3b8;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
                    <h3 style="color: #e2e8f0; margin-bottom: 0.5rem;">No hay productos</h3>
                    <p>No se encontraron productos con los filtros seleccionados.</p>
                </div>
            `;
            const resultsEl = document.getElementById('results-count');
            if (resultsEl) resultsEl.textContent = '0 productos';
            const paginationEl = document.getElementById('pagination');
            if (paginationEl) paginationEl.innerHTML = '';
        }
    } catch (e) {
        console.error('Error loading products:', e);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ef4444;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="margin-bottom: 0.5rem;">Error cargando productos</h3>
                <p>Por favor, intenta de nuevo mas tarde.</p>
            </div>
        `;
    }

    if (typeof Utils !== 'undefined') {
        Utils.updateUrl({ page: page > 1 ? page : null, category: category || null, zone: zone || null });
    }
}

async function loadCategories() {
    try {
        const response = await api.getCategories('productos');
        if (response.success && response.data) {
            categories = response.data;

            // Renderizar chips de categorias
            renderCategoryChips();

            // Mantener select oculto para compatibilidad
            const select = document.getElementById('category-filter');
            if (select) {
                select.innerHTML = '<option value="">Categoria</option>';
                categories.forEach(cat => {
                    select.innerHTML += `<option value="${cat.slug}">${cat.icon || ''} ${cat.name}</option>`;
                });
            }

            // Widget del sidebar
            const widget = document.getElementById('categories-widget');
            if (widget) {
                widget.innerHTML = categories.map(cat => `
                    <a href="#" class="widget-item ${currentCategory === cat.slug ? 'active' : ''}" onclick="filterByCategory('${cat.slug}'); return false;">
                        <span>${cat.icon || '📦'}</span>
                        <span>${escapeHtml(cat.name)}</span>
                    </a>
                `).join('');
            }
        }
    } catch (e) {
        console.error('Error loading categories:', e);
    }
}

function renderCategoryChips() {
    const chipsContainer = document.getElementById('category-chips');
    if (!chipsContainer) return;

    chipsContainer.innerHTML = `
        <button class="category-chip ${!currentCategory ? 'active' : ''}" data-category="">
            <span>🛒</span> Todos
        </button>
        ${categories.map(cat => `
            <button class="category-chip ${currentCategory === cat.slug ? 'active' : ''}" data-category="${cat.slug}">
                <span>${cat.icon || '📦'}</span> ${escapeHtml(cat.name)}
            </button>
        `).join('')}
    `;

    // Event listeners para chips
    chipsContainer.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            currentCategory = chip.dataset.category;

            // Actualizar visual de chips
            chipsContainer.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Actualizar select oculto
            const select = document.getElementById('category-filter');
            if (select) select.value = currentCategory;

            // Actualizar widget sidebar
            document.querySelectorAll('#categories-widget .widget-item').forEach(item => {
                const itemCat = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || '';
                item.classList.toggle('active', itemCat === currentCategory);
            });

            loadProducts(1);
        });
    });
}

async function loadZones() {
    try {
        const response = await api.getZones();
        if (response.success && response.data) {
            const select = document.getElementById('zone-filter');
            if (select) {
                select.innerHTML = '<option value="">Zona</option>';
                response.data.forEach(zone => {
                    select.innerHTML += `<option value="${zone.slug}">${zone.name}</option>`;
                });
            }
        }
    } catch (e) {
        console.error('Error loading zones:', e);
    }
}

function filterByCategory(slug) {
    currentCategory = slug;

    // Actualizar select oculto
    const select = document.getElementById('category-filter');
    if (select) select.value = slug;

    // Actualizar chips
    const chipsContainer = document.getElementById('category-chips');
    if (chipsContainer) {
        chipsContainer.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.category === slug);
        });
    }

    // Actualizar widget
    document.querySelectorAll('#categories-widget .widget-item').forEach(item => {
        const itemCat = item.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] || '';
        item.classList.toggle('active', itemCat === slug);
    });

    loadProducts(1);
}

function clearFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const zoneFilter = document.getElementById('zone-filter');
    const conditionFilter = document.getElementById('condition-filter');
    const searchInput = document.getElementById('search-input');

    if (categoryFilter) categoryFilter.value = '';
    if (zoneFilter) zoneFilter.value = '';
    if (conditionFilter) conditionFilter.value = '';
    if (searchInput) searchInput.value = '';

    loadProducts(1);
}

// =============================================
// INICIALIZACION
// =============================================

function initMercaderia() {
    // Event listeners del modal
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
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
            searchTimeout = setTimeout(() => loadProducts(1), 500);
        });
    }

    // Filter change listeners
    ['category-filter', 'zone-filter', 'condition-filter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => loadProducts(1));
    });
}

// Auto-inicializar cuando el DOM este listo
document.addEventListener('DOMContentLoaded', async () => {
    initMercaderia();

    // Obtener params de URL
    const params = typeof Utils !== 'undefined' ? Utils.getUrlParams() : {};

    // Establecer categoria inicial desde URL
    if (params.category) {
        currentCategory = params.category;
    }

    await Promise.all([loadCategories(), loadZones()]);

    const categoryFilter = document.getElementById('category-filter');
    const zoneFilter = document.getElementById('zone-filter');

    if (params.category && categoryFilter) categoryFilter.value = params.category;
    if (params.zone && zoneFilter) zoneFilter.value = params.zone;

    loadProducts(parseInt(params.page) || 1);

    // Update user widget si existe la funcion
    if (typeof updateUserWidget === 'function') {
        updateUserWidget();
    }
});
