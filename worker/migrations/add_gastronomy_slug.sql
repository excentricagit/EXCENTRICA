-- =============================================
-- EXCENTRICA - Agregar slug a gastronomy
-- Version: 1.0.0
-- Date: 2026-01-26
-- =============================================

-- Agregar campo slug a la tabla gastronomy
ALTER TABLE gastronomy ADD COLUMN slug TEXT;

-- Crear indice para slug
CREATE INDEX IF NOT EXISTS idx_gastronomy_slug ON gastronomy(slug);

-- Crear indice para zona
CREATE INDEX IF NOT EXISTS idx_gastronomy_zone ON gastronomy(zone_id);

-- Crear indice para estado
CREATE INDEX IF NOT EXISTS idx_gastronomy_status ON gastronomy(status);

-- Agregar campo is_active si no existe
ALTER TABLE gastronomy ADD COLUMN is_active INTEGER DEFAULT 1;
