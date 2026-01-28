-- EXCENTRICA - Categorias para Puntos de Interes Turistico
-- Ejecutar con: wrangler d1 execute excentrica-db --remote --file=migrations/turismo-categories.sql

-- Crear categorias para la seccion puntos-interes
INSERT OR IGNORE INTO categories (name, slug, section, icon, is_active)
VALUES
('Historico', 'historico', 'puntos-interes', '🏛️', 1),
('Religioso', 'religioso', 'puntos-interes', '⛪', 1),
('Museo', 'museo', 'puntos-interes', '🖼️', 1),
('Naturaleza', 'naturaleza', 'puntos-interes', '🌳', 1),
('Termas', 'termas', 'puntos-interes', '♨️', 1),
('Cultural', 'cultural', 'puntos-interes', '🎭', 1),
('Folklore', 'folklore', 'puntos-interes', '🎸', 1),
('Gastronomia', 'gastronomia', 'puntos-interes', '🍽️', 1),
('Aventura', 'aventura', 'puntos-interes', '🧗', 1),
('Playa', 'playa', 'puntos-interes', '🏖️', 1);

-- Asignar categorias a los POIs existentes basado en su nombre/descripcion
-- Historicos
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'historico' AND section = 'puntos-interes')
WHERE name IN ('Plaza Libertad', 'Casa de Gobierno');

-- Religiosos
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'religioso' AND section = 'puntos-interes')
WHERE name IN ('Catedral Basilica', 'Convento de San Francisco', 'Sumampa');

-- Museos
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'museo' AND section = 'puntos-interes')
WHERE name IN ('Museo de Ciencias Antropologicas y Naturales', 'Museo Historico Provincial');

-- Cultural
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'cultural' AND section = 'puntos-interes')
WHERE name IN ('Centro Cultural del Bicentenario');

-- Naturaleza
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'naturaleza' AND section = 'puntos-interes')
WHERE name IN ('Parque Aguirre', 'Dique Los Quiroga', 'Embalse de Rio Hondo');

-- Termas
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'termas' AND section = 'puntos-interes')
WHERE name IN ('Termas de Rio Hondo', 'Ojo de Agua');

-- Folklore
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'folklore' AND section = 'puntos-interes')
WHERE name IN ('Patio del Indio Froilan', 'Festival de La Salamanca');

-- Gastronomia
UPDATE points_of_interest SET category_id = (SELECT id FROM categories WHERE slug = 'gastronomia' AND section = 'puntos-interes')
WHERE name LIKE 'Mercado Armon%';
