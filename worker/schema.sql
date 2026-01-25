-- =============================================
-- EXCENTRICA - Esquema de Base de Datos
-- Version: 1.2.0
-- Base de datos: Cloudflare D1 (SQLite)
-- =============================================

-- =============================================
-- TABLA: users
-- Usuarios del sistema
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    zone_id INTEGER,
    role TEXT DEFAULT 'user',
    email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: zones
-- Zonas geográficas de Santiago del Estero
-- =============================================
CREATE TABLE IF NOT EXISTS zones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLA: categories
-- Categorías por sección
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    section TEXT NOT NULL,
    icon TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(slug, section)
);

-- =============================================
-- TABLA: news
-- Noticias y artículos
-- =============================================
CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    published_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: products
-- Productos del marketplace
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    condition TEXT DEFAULT 'new',
    status TEXT DEFAULT 'pending',
    accepts_offers INTEGER DEFAULT 0,
    phone TEXT,
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: events
-- Eventos y actividades
-- =============================================
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    location TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    event_date TEXT NOT NULL,
    event_time TEXT,
    end_date TEXT,
    end_time TEXT,
    price REAL DEFAULT 0,
    ticket_url TEXT,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: videos
-- Videos (YouTube, etc)
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: accommodations
-- Alojamientos y hospedajes
-- =============================================
CREATE TABLE IF NOT EXISTS accommodations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    address TEXT,
    latitude REAL,
    longitude REAL,
    phone TEXT,
    email TEXT,
    website TEXT,
    price_per_night REAL,
    amenities TEXT,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: gastronomy
-- Restaurantes y locales de comida
-- =============================================
CREATE TABLE IF NOT EXISTS gastronomy (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    address TEXT,
    latitude REAL,
    longitude REAL,
    phone TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    price_range TEXT,
    schedule TEXT,
    has_delivery INTEGER DEFAULT 0,
    has_takeaway INTEGER DEFAULT 0,
    specialties TEXT,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: transport
-- Transporte público
-- =============================================
CREATE TABLE IF NOT EXISTS transport (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    schedule TEXT,
    routes TEXT,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: transport_private
-- Transporte privado (remises, taxis)
-- =============================================
CREATE TABLE IF NOT EXISTS transport_private (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    phone TEXT NOT NULL,
    vehicle_type TEXT,
    vehicle_model TEXT,
    vehicle_year INTEGER,
    has_ac INTEGER DEFAULT 0,
    price_per_km REAL,
    price_per_hour REAL,
    available_24h INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: services
-- Servicios profesionales
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    price_from REAL,
    price_to REAL,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: points_of_interest
-- Puntos de interés turístico
-- =============================================
CREATE TABLE IF NOT EXISTS points_of_interest (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    images TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    zone_id INTEGER,
    address TEXT,
    latitude REAL,
    longitude REAL,
    phone TEXT,
    website TEXT,
    schedule TEXT,
    entry_fee REAL DEFAULT 0,
    is_free INTEGER DEFAULT 1,
    accessibility TEXT,
    status TEXT DEFAULT 'pending',
    featured INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- =============================================
-- TABLA: likes
-- Sistema de likes polimórfico
-- =============================================
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, content_type, content_id)
);

-- =============================================
-- TABLA: offers
-- Ofertas en productos
-- =============================================
CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    responded_at TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: ads
-- Sistema de publicidad
-- =============================================
CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT DEFAULT 'sidebar',
    priority INTEGER DEFAULT 0,
    author_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    start_date TEXT,
    end_date TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: media
-- Archivos multimedia (R2)
-- =============================================
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    url TEXT NOT NULL,
    filename TEXT,
    content_type TEXT,
    size INTEGER DEFAULT 0,
    uploaded_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- =============================================
-- TABLA: subscriptions
-- Suscripciones de usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    start_date TEXT DEFAULT (datetime('now')),
    end_date TEXT,
    payment_method TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: audit_logs
-- Logs de auditoría
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: settings
-- Configuraciones del sistema
-- =============================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    updated_by INTEGER,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- =============================================
-- TABLA: statistics
-- Estadísticas diarias
-- =============================================
CREATE TABLE IF NOT EXISTS statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    new_publications INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_author ON news(author_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_author ON products(author_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_categories_section ON categories(section);
CREATE INDEX IF NOT EXISTS idx_likes_content ON likes(content_type, content_id);

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Usuario administrador (password: Admin123!)
INSERT OR IGNORE INTO users (id, username, email, password_hash, name, role, email_verified, is_active)
VALUES (1, 'admin', 'admin@excentrica.com.ar', '240be518fabd2724ddb6f04eeb9d5b057e7d208ab32ea2d8b3f7e5a4d1f3f6c7', 'Administrador', 'admin', 1, 1);

-- Zonas de Santiago del Estero
INSERT OR IGNORE INTO zones (name, slug, description) VALUES
('Capital', 'capital', 'Ciudad de Santiago del Estero'),
('La Banda', 'la-banda', 'Ciudad de La Banda'),
('Termas de Río Hondo', 'termas', 'Ciudad termal'),
('Añatuya', 'anatuya', 'Ciudad de Añatuya'),
('Frías', 'frias', 'Ciudad de Frías'),
('Interior', 'interior', 'Otras localidades del interior');

-- Categorías de Noticias
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Política', 'politica', 'noticias', '🏛️'),
('Deportes', 'deportes', 'noticias', '⚽'),
('Espectáculos', 'espectaculos', 'noticias', '🎭'),
('Economía', 'economia', 'noticias', '💰'),
('Policiales', 'policiales', 'noticias', '🚔'),
('Sociedad', 'sociedad', 'noticias', '👥');

-- Categorías de Mercadería
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Electrónica', 'electronica', 'mercaderia', '📱'),
('Vehículos', 'vehiculos', 'mercaderia', '🚗'),
('Hogar', 'hogar', 'mercaderia', '🏠'),
('Ropa', 'ropa', 'mercaderia', '👕'),
('Deportes', 'deportes-merc', 'mercaderia', '🏃'),
('Otros', 'otros', 'mercaderia', '📦');

-- Categorías de Eventos
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Música', 'musica', 'eventos', '🎵'),
('Teatro', 'teatro', 'eventos', '🎭'),
('Deportivo', 'deportivo', 'eventos', '🏆'),
('Cultural', 'cultural', 'eventos', '🎨'),
('Gastronómico', 'gastronomico', 'eventos', '🍽️'),
('Ferias', 'ferias', 'eventos', '🎪');

-- Categorías de Gastronomía
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Restaurantes', 'restaurantes', 'gastronomia', '🍽️'),
('Pizzerías', 'pizzerias', 'gastronomia', '🍕'),
('Parrillas', 'parrillas', 'gastronomia', '🥩'),
('Cafeterías', 'cafeterias', 'gastronomia', '☕'),
('Heladerías', 'heladerias', 'gastronomia', '🍦'),
('Delivery', 'delivery', 'gastronomia', '🛵');

-- Categorías de Alojamiento
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Hoteles', 'hoteles', 'alojamiento', '🏨'),
('Cabañas', 'cabanas', 'alojamiento', '🏡'),
('Departamentos', 'departamentos', 'alojamiento', '🏢'),
('Hostels', 'hostels', 'alojamiento', '🛏️'),
('Camping', 'camping', 'alojamiento', '⛺');

-- Categorías de Servicios
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Salud', 'salud', 'servicios', '🏥'),
('Educación', 'educacion', 'servicios', '📚'),
('Legales', 'legales', 'servicios', '⚖️'),
('Técnicos', 'tecnicos', 'servicios', '🔧'),
('Belleza', 'belleza', 'servicios', '💅'),
('Profesionales', 'profesionales', 'servicios', '👔');

-- Categorías de Puntos de Interés
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Museos', 'museos', 'puntos-interes', '🏛️'),
('Parques', 'parques', 'puntos-interes', '🌳'),
('Monumentos', 'monumentos', 'puntos-interes', '🗿'),
('Iglesias', 'iglesias', 'puntos-interes', '⛪'),
('Naturaleza', 'naturaleza', 'puntos-interes', '🏞️'),
('Históricos', 'historicos', 'puntos-interes', '📜');

-- Categorías de Videos
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Noticias', 'noticias-video', 'videos', '📰'),
('Entretenimiento', 'entretenimiento', 'videos', '🎬'),
('Turismo', 'turismo', 'videos', '✈️'),
('Música', 'musica-video', 'videos', '🎵'),
('Documentales', 'documentales', 'videos', '🎥');
