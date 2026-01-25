// EXCENTRICA - API Service

class ApiService {
    constructor() {
        this.baseUrl = CONFIG.API_URL;
    }

    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_TOKEN);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const headers = {
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Si no es FormData, agregar Content-Type
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la solicitud');
            }

            return data;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // GET request
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data)
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // PATCH request
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ========== AUTH ==========
    async login(email, password) {
        return this.post('/api/auth/login', { email, password });
    }

    async register(data) {
        return this.post('/api/auth/register', data);
    }

    async getMe() {
        return this.get('/api/auth/me');
    }

    async updateProfile(data) {
        return this.put('/api/auth/profile', data);
    }

    async changePassword(currentPassword, newPassword) {
        return this.put('/api/auth/password', { currentPassword, newPassword });
    }

    // ========== NEWS ==========
    async getNews(params = {}) {
        return this.get('/api/news', params);
    }

    async getNewsById(id) {
        return this.get(`/api/news/${id}`);
    }

    async getNewsBySlug(slug) {
        return this.get(`/api/news/slug/${slug}`);
    }

    // ========== PRODUCTS ==========
    async getProducts(params = {}) {
        return this.get('/api/products', params);
    }

    async getProductById(id) {
        return this.get(`/api/products/${id}`);
    }

    async createProduct(data) {
        return this.post('/api/products', data);
    }

    async updateProduct(id, data) {
        return this.put(`/api/products/${id}`, data);
    }

    async deleteProduct(id) {
        return this.delete(`/api/products/${id}`);
    }

    // ========== EVENTS ==========
    async getEvents(params = {}) {
        return this.get('/api/events', params);
    }

    async getEventById(id) {
        return this.get(`/api/events/${id}`);
    }

    // ========== VIDEOS ==========
    async getVideos(params = {}) {
        return this.get('/api/videos', params);
    }

    async getVideoById(id) {
        return this.get(`/api/videos/${id}`);
    }

    // ========== CATEGORIES ==========
    async getCategories(section = null) {
        const params = section ? { section } : {};
        return this.get('/api/categories', params);
    }

    // ========== ZONES ==========
    async getZones() {
        return this.get('/api/zones');
    }

    // ========== LIKES ==========
    async toggleLike(contentType, contentId) {
        return this.post('/api/likes', { content_type: contentType, content_id: contentId });
    }

    async getLikeStatus(contentType, contentId) {
        return this.get('/api/likes/status', { content_type: contentType, content_id: contentId });
    }

    // ========== UPLOAD ==========
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.post('/api/upload', formData);
    }

    // ========== ADS ==========
    async getAds(position = null) {
        const params = position ? { position } : {};
        return this.get('/api/ads', params);
    }

    async trackAdImpression(id) {
        return this.post(`/api/ads/${id}/impression`);
    }

    async trackAdClick(id) {
        return this.post(`/api/ads/${id}/click`);
    }

    // ========== ADMIN ==========
    async getAdminStats() {
        return this.get('/api/admin/stats');
    }

    async getAdminUsers(params = {}) {
        return this.get('/api/admin/users', params);
    }

    async createUser(data) {
        return this.post('/api/admin/users', data);
    }

    async updateUser(id, data) {
        return this.put(`/api/admin/users/${id}`, data);
    }

    async deleteUser(id) {
        return this.delete(`/api/admin/users/${id}`);
    }

    async toggleUserStatus(id) {
        return this.patch(`/api/admin/users/${id}/toggle`);
    }

    async getAdminNews(params = {}) {
        return this.get('/api/admin/news', params);
    }

    async createNews(data) {
        return this.post('/api/admin/news', data);
    }

    async updateNews(id, data) {
        return this.put(`/api/admin/news/${id}`, data);
    }

    async deleteNews(id) {
        return this.delete(`/api/admin/news/${id}`);
    }

    async getAdminProducts(params = {}) {
        return this.get('/api/admin/products', params);
    }

    async adminCreateProduct(data) {
        return this.post('/api/admin/products', data);
    }

    async adminUpdateProduct(id, data) {
        return this.put(`/api/admin/products/${id}`, data);
    }

    async updateProductStatus(id, status) {
        return this.patch(`/api/admin/products/${id}/status`, { status });
    }

    async getAdminEvents(params = {}) {
        return this.get('/api/admin/events', params);
    }

    async createEvent(data) {
        return this.post('/api/admin/events', data);
    }

    async updateEvent(id, data) {
        return this.put(`/api/admin/events/${id}`, data);
    }

    async deleteEvent(id) {
        return this.delete(`/api/admin/events/${id}`);
    }

    async getAdminCategories(section = null) {
        const params = section ? { section } : {};
        return this.get('/api/admin/categories', params);
    }

    async createCategory(data) {
        return this.post('/api/admin/categories', data);
    }

    async updateCategory(id, data) {
        return this.put(`/api/admin/categories/${id}`, data);
    }

    async deleteCategory(id) {
        return this.delete(`/api/admin/categories/${id}`);
    }

    async getAdminZones() {
        return this.get('/api/admin/zones');
    }

    async createZone(data) {
        return this.post('/api/admin/zones', data);
    }

    async updateZone(id, data) {
        return this.put(`/api/admin/zones/${id}`, data);
    }

    async deleteZone(id) {
        return this.delete(`/api/admin/zones/${id}`);
    }

    async getAdminAds() {
        return this.get('/api/admin/ads');
    }

    async createAd(data) {
        return this.post('/api/admin/ads', data);
    }

    async updateAd(id, data) {
        return this.put(`/api/admin/ads/${id}`, data);
    }

    async deleteAd(id) {
        return this.delete(`/api/admin/ads/${id}`);
    }

    async getStorageStats() {
        return this.get('/api/admin/storage');
    }
}

// Crear instancia global
const api = new ApiService();
