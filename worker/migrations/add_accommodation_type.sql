-- Agregar columna accommodation_type a la tabla accommodations
ALTER TABLE accommodations ADD COLUMN accommodation_type TEXT DEFAULT 'hotel';

-- Crear indice para mejorar rendimiento en filtros
CREATE INDEX IF NOT EXISTS idx_accommodations_type ON accommodations(accommodation_type);
