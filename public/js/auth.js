// EXCENTRICA - Auth Service

class AuthService {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        // Cargar usuario desde localStorage
        const userData = localStorage.getItem(CONFIG.STORAGE_USER);
        if (userData) {
            try {
                this.user = JSON.parse(userData);
            } catch (e) {
                this.logout();
            }
        }
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_TOKEN);
    }

    getUser() {
        return this.user;
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    isEditor() {
        return this.user && (
            this.user.role === 'admin' ||
            this.user.role === 'editor' ||
            this.user.role === 'reporter' ||
            this.user.role === 'periodista'
        );
    }

    isComerciante() {
        return this.user && (
            this.user.role === 'admin' ||
            this.user.role === 'merchant' ||
            this.user.role === 'comerciante'
        );
    }

    isPublicista() {
        return this.user && (
            this.user.role === 'admin' ||
            this.user.role === 'publicista'
        );
    }

    isVideoEditor() {
        return this.user && (
            this.user.role === 'admin' ||
            this.user.role === 'videoeditor'
        );
    }

    // Get panel URL for current user role
    getPanelUrl() {
        if (!this.user) return '/';
        switch(this.user.role) {
            case 'admin':
                return '/admin/';
            case 'editor':
            case 'reporter':
                return '/editor/';
            case 'periodista':
                return '/periodista/';
            case 'merchant':
            case 'comerciante':
                return '/comerciante/';
            case 'publicista':
                return '/publicista/';
            case 'videoeditor':
                return '/videoeditor/';
            default:
                return '/';
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);

            if (response.success && response.data) {
                this.setSession(response.data.token, response.data.user);
                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.error || 'Error de autenticación' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(data) {
        try {
            const response = await api.register(data);

            if (response.success && response.data) {
                this.setSession(response.data.token, response.data.user);
                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.error || 'Error en el registro' };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async refreshUser() {
        try {
            const response = await api.getMe();
            if (response.success && response.data) {
                this.user = response.data;
                localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(this.user));
                return this.user;
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
        return null;
    }

    setSession(token, user) {
        localStorage.setItem(CONFIG.STORAGE_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_USER, JSON.stringify(user));
        this.user = user;
    }

    logout() {
        localStorage.removeItem(CONFIG.STORAGE_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_USER);
        this.user = null;
        window.location.href = '/';
    }

    // Verificar autenticación y redirigir si no está autenticado
    requireAuth(redirectTo = '/login.html') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // Verificar rol de admin
    requireAdmin(redirectTo = '/') {
        if (!this.isAuthenticated() || !this.isAdmin()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    // Verificar rol de editor
    requireEditor(redirectTo = '/') {
        if (!this.isAuthenticated() || !this.isEditor()) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }
}

// Crear instancia global
const auth = new AuthService();
const Auth = auth; // Alias para compatibilidad con mobile
