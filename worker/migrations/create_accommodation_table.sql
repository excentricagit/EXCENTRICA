-- =============================================
-- EXCENTRICA - Tabla de Alojamiento
-- Version: 1.0.0
-- Date: 2026-01-26
-- =============================================

-- Crear tabla de alojamiento
CREATE TABLE IF NOT EXISTS accommodation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    image_url TEXT,
    images TEXT, -- JSON array de imagenes adicionales

    -- Clasificacion
    category_id INTEGER,
    author_id INTEGER,
    zone_id INTEGER,

    -- Ubicacion
    address TEXT,
    latitude REAL,
    longitude REAL,

    -- Contacto
    phone TEXT,
    email TEXT,
    website TEXT,
    instagram TEXT,
    whatsapp TEXT,

    -- Detalles del alojamiento
    accommodation_type TEXT DEFAULT 'hotel', -- hotel, hostel, apart, cabin, camping
    star_rating INTEGER DEFAULT 0, -- 1-5 estrellas
    price_range TEXT, -- $, $$, $$$, $$$$
    price_from REAL, -- Precio desde

    -- Servicios
    has_wifi INTEGER DEFAULT 0,
    has_pool INTEGER DEFAULT 0,
    has_parking INTEGER DEFAULT 0,
    has_breakfast INTEGER DEFAULT 0,
    has_ac INTEGER DEFAULT 0,
    has_pet_friendly INTEGER DEFAULT 0,
    amenities TEXT, -- JSON array de amenities adicionales

    -- Horarios y capacidad
    check_in_time TEXT,
    check_out_time TEXT,
    total_rooms INTEGER,

    -- Estado y moderacion
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    is_active INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (zone_id) REFERENCES zones(id)
);

-- Indices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_accommodation_slug ON accommodation(slug);
CREATE INDEX IF NOT EXISTS idx_accommodation_zone ON accommodation(zone_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_category ON accommodation(category_id);
CREATE INDEX IF NOT EXISTS idx_accommodation_status ON accommodation(status);
CREATE INDEX IF NOT EXISTS idx_accommodation_type ON accommodation(accommodation_type);
CREATE INDEX IF NOT EXISTS idx_accommodation_featured ON accommodation(featured);
