-- Migración: Agregar campos de coordenadas a la tabla transport
-- Para permitir ubicación en mapa de transporte privado

ALTER TABLE transport ADD COLUMN latitude REAL;
ALTER TABLE transport ADD COLUMN longitude REAL;
