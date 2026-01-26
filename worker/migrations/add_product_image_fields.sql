-- Migración: Agregar campos de imágenes a productos
ALTER TABLE products ADD COLUMN front_image_url TEXT;
ALTER TABLE products ADD COLUMN back_image_url TEXT;
ALTER TABLE products ADD COLUMN address TEXT;
ALTER TABLE products ADD COLUMN whatsapp TEXT;
