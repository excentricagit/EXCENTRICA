-- Migración: Sistema completo de Servicios
-- Actualiza la tabla services y crea service_providers

-- Agregar nuevos campos a services
ALTER TABLE services ADD COLUMN latitude REAL;
ALTER TABLE services ADD COLUMN longitude REAL;
ALTER TABLE services ADD COLUMN whatsapp TEXT;
ALTER TABLE services ADD COLUMN facebook TEXT;
ALTER TABLE services ADD COLUMN price_unit TEXT;
ALTER TABLE services ADD COLUMN schedule TEXT;
ALTER TABLE services ADD COLUMN experience_years INTEGER;

-- Hacer description opcional (ya tiene datos, no se puede cambiar a NULL directamente en SQLite)
-- Se mantiene como está

-- Crear tabla de proveedores (datos privados)
CREATE TABLE IF NOT EXISTS service_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    dni TEXT,
    address TEXT,
    phone_personal TEXT,
    photo1 TEXT,
    photo2 TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_service_providers_service ON service_providers(service_id);

-- Nuevas categorías de servicios
INSERT OR IGNORE INTO categories (name, slug, section, icon) VALUES
('Plomería', 'plomeria', 'servicios', '🔧'),
('Electricista', 'electricista', 'servicios', '⚡'),
('Gasista', 'gasista', 'servicios', '🔥'),
('Albañilería', 'albanileria', 'servicios', '🧱'),
('Pintura', 'pintura', 'servicios', '🎨'),
('Carpintería', 'carpinteria', 'servicios', '🪚'),
('Cerrajería', 'cerrajeria', 'servicios', '🔑'),
('Aire Acondicionado', 'aire-acondicionado', 'servicios', '❄️'),
('Jardinería', 'jardineria', 'servicios', '🌱'),
('Limpieza', 'limpieza', 'servicios', '🧹'),
('Mudanzas', 'mudanzas', 'servicios', '📦'),
('Técnico PC/Celulares', 'tecnico-pc', 'servicios', '💻'),
('Mecánico', 'mecanico', 'servicios', '🚗'),
('Otros', 'otros-servicios', 'servicios', '🛠️');
