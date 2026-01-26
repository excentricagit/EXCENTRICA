-- =============================================
-- Migration: Add provinces table
-- =============================================

-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    country TEXT DEFAULT 'Argentina',
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Add province_id to zones table
ALTER TABLE zones ADD COLUMN province_id INTEGER REFERENCES provinces(id);

-- Insert default provinces
INSERT INTO provinces (name, slug) VALUES
    ('Santiago del Estero', 'santiago-del-estero'),
    ('Tucumán', 'tucuman'),
    ('Córdoba', 'cordoba'),
    ('Catamarca', 'catamarca'),
    ('Salta', 'salta'),
    ('La Rioja', 'la-rioja'),
    ('Santa Fe', 'santa-fe'),
    ('Chaco', 'chaco');

-- Update existing zones to Santiago del Estero (id=1)
UPDATE zones SET province_id = 1 WHERE province_id IS NULL;
