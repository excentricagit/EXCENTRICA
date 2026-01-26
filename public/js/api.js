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
    async getZones(params = {}) {
        return this.get('/api/zones', params);
    }

    // ========== PROVINCES ==========
    async getProvinces() {
        return this.get('/api/provinces');
    }

    async getProvinceById(id) {
        return this.get(`/api/provinces/${id}`);
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

    // Alias for getAdminUsers
    async getUsers(params = {}) {
        return this.getAdminUsers(params);
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

    async getAdminZones(params = {}) {
        return this.get('/api/admin/zones', params);
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

    async mergeZone(id, targetZoneId) {
        return this.post(`/api/admin/zones/${id}/merge`, { target_zone_id: targetZoneId });
    }

    // Admin - Provinces
    async createProvince(data) {
        return this.post('/api/admin/provinces', data);
    }

    async updateProvince(id, data) {
        return this.put(`/api/admin/provinces/${id}`, data);
    }

    async deleteProvince(id) {
        return this.delete(`/api/admin/provinces/${id}`);
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

    // ========== CINEMA ==========

    // Public
    async getCinemas(params = {}) {
        return this.get('/api/cinemas', params);
    }

    async getCinemaById(id) {
        return this.get(`/api/cinemas/${id}`);
    }

    async getMovies(params = {}) {
        return this.get('/api/movies', params);
    }

    async getMovieById(id) {
        return this.get(`/api/movies/${id}`);
    }

    async getShowtimes(params = {}) {
        return this.get('/api/showtimes', params);
    }

    // Admin - Cinemas
    async getAdminCinemas() {
        return this.get('/api/admin/cinemas');
    }

    async createCinema(data) {
        return this.post('/api/admin/cinemas', data);
    }

    async updateCinema(id, data) {
        return this.put(`/api/admin/cinemas/${id}`, data);
    }

    async deleteCinema(id) {
        return this.delete(`/api/admin/cinemas/${id}`);
    }

    // Admin - Movies
    async getAdminMovies(params = {}) {
        return this.get('/api/admin/movies', params);
    }

    async createMovie(data) {
        return this.post('/api/admin/movies', data);
    }

    async updateMovie(id, data) {
        return this.put(`/api/admin/movies/${id}`, data);
    }

    async deleteMovie(id) {
        return this.delete(`/api/admin/movies/${id}`);
    }

    // Admin - Showtimes
    async getAdminShowtimes(params = {}) {
        return this.get('/api/admin/showtimes', params);
    }

    async createShowtime(data) {
        return this.post('/api/admin/showtimes', data);
    }

    async createShowtimesBulk(showtimes) {
        return this.post('/api/admin/showtimes/bulk', { showtimes });
    }

    async updateShowtime(id, data) {
        return this.put(`/api/admin/showtimes/${id}`, data);
    }

    async deleteShowtime(id) {
        return this.delete(`/api/admin/showtimes/${id}`);
    }

    async deleteShowtimesBulk(ids) {
        return this.post('/api/admin/showtimes/bulk-delete', { ids });
    }

    // ========== GASTRONOMY ==========

    // Public
    async getGastronomy(params = {}) {
        return this.get('/api/gastronomy', params);
    }

    async getGastronomyById(id) {
        return this.get(`/api/gastronomy/${id}`);
    }

    async getGastronomyBySlug(slug) {
        return this.get(`/api/gastronomy/slug/${slug}`);
    }

    // Admin
    async getAdminGastronomy(params = {}) {
        return this.get('/api/admin/gastronomy', params);
    }

    async createGastronomy(data) {
        return this.post('/api/admin/gastronomy', data);
    }

    async updateGastronomy(id, data) {
        return this.put(`/api/admin/gastronomy/${id}`, data);
    }

    async deleteGastronomy(id) {
        return this.delete(`/api/admin/gastronomy/${id}`);
    }

    async updateGastronomyStatus(id, status) {
        return this.patch(`/api/admin/gastronomy/${id}/status`, { status });
    }

    async toggleGastronomyFeatured(id) {
        return this.patch(`/api/admin/gastronomy/${id}/featured`);
    }

    // ========== ACCOMMODATION ==========

    // Public
    async getAccommodations(params = {}) {
        return this.get('/api/accommodations', params);
    }

    async getAccommodationById(id) {
        return this.get(`/api/accommodations/${id}`);
    }

    async getAccommodationBySlug(slug) {
        return this.get(`/api/accommodations/slug/${slug}`);
    }

    // Admin
    async getAdminAccommodations(params = {}) {
        return this.get('/api/admin/accommodations', params);
    }

    async createAccommodation(data) {
        return this.post('/api/admin/accommodations', data);
    }

    async updateAccommodation(id, data) {
        return this.put(`/api/admin/accommodations/${id}`, data);
    }

    async deleteAccommodation(id) {
        return this.delete(`/api/admin/accommodations/${id}`);
    }

    async updateAccommodationStatus(id, status) {
        return this.patch(`/api/admin/accommodations/${id}/status`, { status });
    }

    async toggleAccommodationFeatured(id) {
        return this.patch(`/api/admin/accommodations/${id}/featured`);
    }

    // ========== TRANSPORT ==========

    async getTransport(params = {}) {
        return this.get('/api/transport', params);
    }

    async getTransportById(id) {
        return this.get(`/api/transport/${id}`);
    }

    // Admin Transport
    async getAdminTransport(params = {}) {
        return this.get('/api/admin/transport', params);
    }

    async createTransport(data) {
        return this.post('/api/admin/transport', data);
    }

    async updateTransport(id, data) {
        return this.put(`/api/admin/transport/${id}`, data);
    }

    async deleteTransport(id) {
        return this.delete(`/api/admin/transport/${id}`);
    }

    async updateTransportStatus(id, status) {
        return this.patch(`/api/admin/transport/${id}/status`, { status });
    }

    async toggleTransportFeatured(id) {
        return this.patch(`/api/admin/transport/${id}/featured`);
    }

    // Transport Drivers (datos privados)
    async getTransportDriver(transportId) {
        return this.get(`/api/admin/transport/${transportId}/driver`);
    }

    async saveTransportDriver(transportId, data) {
        return this.post(`/api/admin/transport/${transportId}/driver`, data);
    }

    async deleteTransportDriver(transportId) {
        return this.delete(`/api/admin/transport/${transportId}/driver`);
    }

    // ========== SERVICES (Servicios profesionales) ==========

    // Public
    async getServices(params = {}) {
        return this.get('/api/services', params);
    }

    async getServiceById(id) {
        return this.get(`/api/services/${id}`);
    }

    // Admin
    async getAdminServices(params = {}) {
        return this.get('/api/admin/services', params);
    }

    async createService(data) {
        return this.post('/api/admin/services', data);
    }

    async updateService(id, data) {
        return this.put(`/api/admin/services/${id}`, data);
    }

    async deleteService(id) {
        return this.delete(`/api/admin/services/${id}`);
    }

    async updateServiceStatus(id, status) {
        return this.patch(`/api/admin/services/${id}/status`, { status });
    }

    async toggleServiceFeatured(id) {
        return this.patch(`/api/admin/services/${id}/featured`);
    }

    // Service Providers (datos privados)
    async getServiceProvider(serviceId) {
        return this.get(`/api/admin/services/${serviceId}/provider`);
    }

    async saveServiceProvider(serviceId, data) {
        return this.post(`/api/admin/services/${serviceId}/provider`, data);
    }

    async deleteServiceProvider(serviceId) {
        return this.delete(`/api/admin/services/${serviceId}/provider`);
    }

    // ========== BUS LINES (Colectivos) ==========

    // Public
    async getBusLines(params = {}) {
        return this.get('/api/bus-lines', params);
    }

    async getBusLineById(id) {
        return this.get(`/api/bus-lines/${id}`);
    }

    async getBusStops(params = {}) {
        return this.get('/api/bus-stops', params);
    }

    // Admin - Bus Lines
    async getAdminBusLines(params = {}) {
        return this.get('/api/admin/bus-lines', params);
    }

    async createBusLine(data) {
        return this.post('/api/admin/bus-lines', data);
    }

    async updateBusLine(id, data) {
        return this.put(`/api/admin/bus-lines/${id}`, data);
    }

    async deleteBusLine(id) {
        return this.delete(`/api/admin/bus-lines/${id}`);
    }

    async updateBusLineStatus(id, status) {
        return this.patch(`/api/admin/bus-lines/${id}/status`, { status });
    }

    async toggleBusLineFeatured(id) {
        return this.patch(`/api/admin/bus-lines/${id}/featured`);
    }

    // Admin - Bus Stops
    async getAdminBusStops(params = {}) {
        return this.get('/api/admin/bus-stops', params);
    }

    async createBusStop(data) {
        return this.post('/api/admin/bus-stops', data);
    }

    async updateBusStop(id, data) {
        return this.put(`/api/admin/bus-stops/${id}`, data);
    }

    async deleteBusStop(id) {
        return this.delete(`/api/admin/bus-stops/${id}`);
    }

    async reorderBusStops(stopIds) {
        return this.post('/api/admin/bus-stops/reorder', { stops: stopIds });
    }

    // ========== POI (Puntos de Interés Turístico) ==========

    // Public
    async getPoi(params = {}) {
        return this.get('/api/poi', params);
    }

    async getPoiById(id) {
        return this.get(`/api/poi/${id}`);
    }

    // Admin
    async getAdminPoi(params = {}) {
        return this.get('/api/admin/poi', params);
    }

    async createPoi(data) {
        return this.post('/api/admin/poi', data);
    }

    async updatePoi(id, data) {
        return this.put(`/api/admin/poi/${id}`, data);
    }

    async deletePoi(id) {
        return this.delete(`/api/admin/poi/${id}`);
    }
}

// Crear instancia global
const api = new ApiService();
