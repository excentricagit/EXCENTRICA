-- =============================================
-- EXCENTRICA - Módulo de Cines
-- Version: 1.0.0
-- Date: 2026-01-26
-- =============================================

-- =============================================
-- TABLA: cinemas
-- Cines y salas de cine
-- =============================================
CREATE TABLE IF NOT EXISTS cinemas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    image_url TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    zone_id INTEGER,
    phone TEXT,
    whatsapp TEXT,
    website TEXT,
    instagram TEXT,
    total_screens INTEGER DEFAULT 1,
    features TEXT, -- JSON: ["3D", "IMAX", "Dolby Atmos", "Candy Bar", "Estacionamiento"]
    schedule TEXT, -- Horarios de atención
    owner_id INTEGER, -- Futuro: usuario dueño del cine
    status TEXT DEFAULT 'pending',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (zone_id) REFERENCES zones(id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- =============================================
-- TABLA: movies
-- Películas en cartelera
-- =============================================
CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    original_title TEXT,
    slug TEXT UNIQUE NOT NULL,
    synopsis TEXT,
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT, -- URL de YouTube
    duration INTEGER, -- Duración en minutos
    rating TEXT, -- ATP, +13, +16, +18
    genre TEXT, -- JSON array: ["Acción", "Aventura"]
    director TEXT,
    cast TEXT, -- JSON array de actores
    release_date TEXT,
    country TEXT,
    language TEXT,
    imdb_id TEXT,
    status TEXT DEFAULT 'now_showing', -- now_showing, coming_soon, archived
    is_active INTEGER DEFAULT 1,
    like_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- TABLA: showtimes
-- Funciones (cartelera)
-- =============================================
CREATE TABLE IF NOT EXISTS showtimes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cinema_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    screen_number INTEGER DEFAULT 1, -- Número de sala
    show_date TEXT NOT NULL, -- Fecha de la función
    show_time TEXT NOT NULL, -- Hora de la función
    format TEXT DEFAULT '2D', -- 2D, 3D, IMAX, 4DX
    language TEXT DEFAULT 'subtitulada', -- subtitulada, doblada, original
    price REAL DEFAULT 0,
    price_promo REAL, -- Precio promocional (miércoles, etc)
    available_seats INTEGER,
    is_active INTEGER DEFAULT 1,
    valid_from TEXT, -- Cartelera válida desde
    valid_until TEXT, -- Cartelera válida hasta
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cinema_id) REFERENCES cinemas(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_cinemas_zone ON cinemas(zone_id);
CREATE INDEX IF NOT EXISTS idx_cinemas_status ON cinemas(status);
CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status);
CREATE INDEX IF NOT EXISTS idx_movies_release ON movies(release_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_cinema ON showtimes(cinema_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_movie ON showtimes(movie_id);
CREATE INDEX IF NOT EXISTS idx_showtimes_date ON showtimes(show_date);
CREATE INDEX IF NOT EXISTS idx_showtimes_lookup ON showtimes(cinema_id, movie_id, show_date);

-- =============================================
-- CATEGORÍAS DE CINE (géneros)
-- =============================================
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Acción', 'accion', 'cine', '💥'),
('Aventura', 'aventura', 'cine', '🗺️'),
('Comedia', 'comedia', 'cine', '😂'),
('Drama', 'drama', 'cine', '🎭'),
('Terror', 'terror', 'cine', '👻'),
('Ciencia Ficción', 'ciencia-ficcion', 'cine', '🚀'),
('Romance', 'romance', 'cine', '💕'),
('Animación', 'animacion', 'cine', '🎬'),
('Documental', 'documental', 'cine', '📹'),
('Suspenso', 'suspenso', 'cine', '🔍'),
('Infantil', 'infantil', 'cine', '👶'),
('Musical', 'musical', 'cine', '🎵');
