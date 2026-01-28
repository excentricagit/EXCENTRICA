-- Datos de prueba simplificados para Excentrica

-- Categorías faltantes
INSERT OR IGNORE INTO categories (name, slug, section, icon, is_active) VALUES
('Colectivos', 'colectivos', 'transporte', '🚌', 1),
('Plomería', 'plomeria', 'servicios', '🔧', 1);

-- Noticia de prueba
INSERT INTO news (title, slug, summary, content, image_url, category_id, author_id, status, featured, published_at)
VALUES (
    'Inauguran nueva plaza en el centro de Santiago',
    'inauguran-nueva-plaza-en-el-centro-de-santiago',
    'La Municipalidad inauguró hoy una nueva plaza con juegos infantiles y espacios verdes.',
    'La Municipalidad de Santiago del Estero inauguró hoy una nueva plaza ubicada en pleno centro de la ciudad.',
    'https://images.unsplash.com/photo-1587502537147-2ba64a117c9a?w=800',
    (SELECT id FROM categories WHERE slug = 'politica' LIMIT 1),
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    'published',
    1,
    datetime('now')
);

-- Producto de prueba
INSERT INTO products (title, description, price, original_price, image_url, category_id, zone_id, author_id, status, condition, phone)
VALUES (
    'Notebook HP Pavilion 15.6" i5 8GB RAM',
    'Notebook HP Pavilion en excelente estado. Intel Core i5, 8GB RAM, SSD 256GB.',
    350000,
    450000,
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    (SELECT id FROM categories WHERE slug = 'electronica' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'published',
    'usado',
    '385-4000001'
);

-- Evento de prueba
INSERT INTO events (title, slug, description, image_url, category_id, zone_id, author_id, event_date, event_time, location, organizer, phone, status, featured)
VALUES (
    'Festival de Folklore - Noche Santiagueña',
    'festival-de-folklore-noche-santiaguena',
    'Gran festival de folklore con artistas locales. Música, danza y tradición santiagueña.',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    (SELECT id FROM categories WHERE slug = 'musica' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    date('now', '+7 days'),
    '20:00',
    'Plaza Libertad',
    'Municipalidad de Santiago del Estero',
    '385-4211234',
    'published',
    1
);

-- Gastronomía de prueba
INSERT INTO gastronomy (name, slug, description, cuisine_type, address, phone, image_url, category_id, zone_id, author_id, status, featured)
VALUES (
    'La Casona del Norte',
    'la-casona-del-norte',
    'Restaurante de comida regional santiagueña. Especialidad en locro, empanadas y asado.',
    'Regional',
    'Calle Tucumán 456',
    '385-4223344',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    (SELECT id FROM categories WHERE slug = 'restaurantes' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'published',
    1
);

-- Alojamiento de prueba
INSERT INTO accommodations (name, slug, description, accommodation_type, address, phone, image_url, category_id, zone_id, author_id, status, featured)
VALUES (
    'Hotel Plaza Santiago',
    'hotel-plaza-santiago',
    'Hotel céntrico de 3 estrellas. Habitaciones confortables con aire acondicionado, TV cable y wifi.',
    'hotel',
    'Av. Libertad 789',
    '385-4225566',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    (SELECT id FROM categories WHERE slug = 'hoteles' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'published',
    1
);

-- Transporte de prueba
INSERT INTO transport (name, slug, description, transport_type, phone, image_url, category_id, author_id, routes, schedule, status)
VALUES (
    'Empresa 13 de Junio',
    'empresa-13-de-junio',
    'Empresa de transporte urbano que conecta el centro con los principales barrios.',
    'bus',
    '385-4227788',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
    (SELECT id FROM categories WHERE slug = 'colectivos' LIMIT 1),
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'Centro - Villa Mailin - Banda',
    'Lunes a Viernes 5:00-23:00',
    'published'
);

-- Servicio de prueba
INSERT INTO services (name, slug, description, service_type, phone, image_url, category_id, author_id, address, working_hours, status)
VALUES (
    'Plomería Rodriguez - Servicio 24hs',
    'plomeria-rodriguez-servicio-24hs',
    'Servicio de plomería profesional. Destapaciones, instalaciones, reparaciones.',
    'plomeria',
    '385-4229900',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    (SELECT id FROM categories WHERE slug = 'plomeria' LIMIT 1),
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'Zona centro y alrededores',
    'Lunes a Sábado 8:00-20:00, Emergencias 24hs',
    'published'
);

-- Punto turístico de prueba
INSERT INTO points_of_interest (name, slug, description, address, phone, image_url, category_id, zone_id, author_id, status, featured)
VALUES (
    'Catedral Basílica de Santiago del Estero',
    'catedral-basilica-de-santiago-del-estero',
    'Patrimonio histórico nacional, uno de los templos más antiguos de Argentina.',
    'Plaza Libertad s/n',
    '385-4214567',
    'https://images.unsplash.com/photo-1548625361-6f2687b72382?w=800',
    (SELECT id FROM categories WHERE slug = 'monumentos' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    'published',
    1
);
