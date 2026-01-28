-- Agregar campos para diferenciar transporte publico/privado
-- transport_type: 'public' (colectivos) o 'private' (taxis, remises, combis)

ALTER TABLE transport ADD COLUMN transport_type TEXT DEFAULT 'private';
ALTER TABLE transport ADD COLUMN line_number TEXT;
ALTER TABLE transport ADD COLUMN fare TEXT;
ALTER TABLE transport ADD COLUMN frequency TEXT;

-- Crear indice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_transport_type ON transport(transport_type);
