-- Datos de prueba para Excentrica
-- Este script crea un dato de ejemplo en cada sección del panel editor

-- 1. CATEGORÍAS FALTANTES (solo las que no existen)
INSERT OR IGNORE INTO categories (name, slug, section, icon, is_active) VALUES
('Colectivos', 'colectivos', 'transporte', '🚌', 1),
('Plomería', 'plomeria', 'servicios', '🔧', 1);

-- 2. NOTICIA DE PRUEBA
INSERT INTO news (
    title, slug, summary, content, image_url,
    category_id, author_id,
    status, featured, view_count,
    published_at, created_at
) VALUES (
    'Inauguran nueva plaza en el centro de Santiago',
    'inauguran-nueva-plaza-en-el-centro-de-santiago',
    'La Municipalidad inauguró hoy una nueva plaza con juegos infantiles y espacios verdes en el corazón de la ciudad.',
    'La Municipalidad de Santiago del Estero inauguró hoy una nueva plaza ubicada en pleno centro de la ciudad. El espacio cuenta con modernos juegos infantiles, canchas deportivas, y amplios espacios verdes para el disfrute de toda la familia.\n\nEl intendente destacó la importancia de estos espacios públicos para la recreación de los santiagueños y remarcó que es el primero de varios proyectos de espacios verdes que se desarrollarán durante este año.\n\nLa plaza cuenta con iluminación LED, bancos, y un sector especialmente diseñado para personas con movilidad reducida. Se espera que se convierta en un nuevo punto de encuentro para los vecinos del centro.',
    'https://images.unsplash.com/photo-1587502537147-2ba64a117c9a?w=800',
    (SELECT id FROM categories WHERE slug = 'politica' AND section = 'noticias' LIMIT 1),
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    'published',
    1,
    45,
    datetime('now'),
    datetime('now')
);

-- 3. PRODUCTO DE PRUEBA
INSERT INTO products (
    title, slug, description, price, original_price,
    image_url, category_id, zone_id, author_id,
    status, condition, phone, whatsapp, address,
    created_at
) VALUES (
    'Notebook HP Pavilion 15.6" i5 8GB RAM',
    'notebook-hp-pavilion-156-i5-8gb-ram',
    'Notebook HP Pavilion en excelente estado. Procesador Intel Core i5 de 10ma generación, 8GB de RAM, disco SSD de 256GB. Pantalla Full HD de 15.6 pulgadas. Ideal para trabajo, estudio y entretenimiento. Incluye cargador original.',
    350000,
    450000,
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
    (SELECT id FROM categories WHERE slug = 'electronica' AND section = 'mercaderia' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'published',
    'usado',
    '385-4000001',
    '5493854000001',
    'Av. Belgrano 123, Santiago del Estero',
    datetime('now')
);

-- 4. EVENTO DE PRUEBA
INSERT INTO events (
    title, slug, description, image_url,
    category_id, zone_id, author_id,
    event_date, end_date, event_time, end_time,
    location, price, organizer, phone, whatsapp,
    status, featured, view_count,
    created_at
) VALUES (
    'Festival de Folklore - Noche Santiagueña',
    'festival-de-folklore-noche-santiaguena',
    'Gran festival de folklore con la participación de artistas locales y regionales. Una noche llena de música, danza y tradición santiagueña. Habrá stands de comida típica y artesanías. Entrada libre y gratuita para toda la familia.',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    (SELECT id FROM categories WHERE slug = 'musica' AND section = 'eventos' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    date('now', '+7 days'),
    date('now', '+7 days'),
    '20:00',
    '02:00',
    'Plaza Libertad',
    NULL,
    'Municipalidad de Santiago del Estero',
    '385-4211234',
    NULL,
    'published',
    1,
    123,
    datetime('now')
);

-- 5. RESTAURANTE DE PRUEBA (Gastronomía)
INSERT INTO gastronomy (
    name, slug, description, cuisine_type,
    address, phone, whatsapp, email,
    image_url, category_id, zone_id, author_id,
    opening_hours, price_range, capacity,
    accepts_cards, has_delivery, has_parking, has_wifi,
    status, featured, rating, view_count,
    created_at
) VALUES (
    'La Casona del Norte',
    'la-casona-del-norte',
    'Restaurante de comida regional santiagueña. Especialidad en locro, empanadas y asado. Ambiente familiar y acogedor con decoración típica. Terraza al aire libre disponible.',
    'Regional',
    'Calle Tucumán 456',
    '385-4223344',
    '5493854223344',
    'lacasonadelnorte@gmail.com',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    (SELECT id FROM categories WHERE slug = 'restaurantes' AND section = 'gastronomia' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'Lunes a Domingo 11:00-15:00 y 19:00-00:00',
    '$$',
    80,
    1,
    1,
    1,
    1,
    'published',
    1,
    4.5,
    234,
    datetime('now')
);

-- 6. ALOJAMIENTO DE PRUEBA
INSERT INTO accommodations (
    name, slug, description, accommodation_type,
    address, phone, whatsapp, email, website,
    image_url, category_id, zone_id, author_id,
    check_in, check_out, total_rooms, price_per_night,
    has_wifi, has_parking, has_pool, has_breakfast, has_ac,
    status, featured, rating, view_count,
    created_at
) VALUES (
    'Hotel Plaza Santiago',
    'hotel-plaza-santiago',
    'Hotel céntrico de 3 estrellas ubicado en el corazón de Santiago del Estero. Habitaciones confortables con aire acondicionado, TV cable y wifi. Desayuno buffet incluido. A pasos de los principales atractivos turísticos.',
    'hotel',
    'Av. Libertad 789',
    '385-4225566',
    '5493854225566',
    'reservas@hotelplazasantiago.com.ar',
    'https://hotelplazasantiago.com.ar',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    (SELECT id FROM categories WHERE slug = 'hoteles' AND section = 'alojamiento' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    '14:00',
    '10:00',
    45,
    25000,
    1,
    1,
    0,
    1,
    1,
    'published',
    1,
    4.2,
    567,
    datetime('now')
);

-- 7. TRANSPORTE DE PRUEBA
INSERT INTO transport (
    name, slug, description, transport_type,
    phone, whatsapp, email, website,
    image_url, category_id, zone_id, author_id,
    routes, schedule, base_fare,
    has_wifi, has_ac, accepts_cards,
    status, rating, view_count,
    created_at
) VALUES (
    'Empresa 13 de Junio',
    'empresa-13-de-junio',
    'Empresa de transporte urbano que conecta el centro con los principales barrios de la ciudad. Unidades modernas con aire acondicionado. Frecuencia cada 15 minutos en horarios pico.',
    'bus',
    '385-4227788',
    NULL,
    'contacto@13dejunio.com.ar',
    NULL,
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800',
    (SELECT id FROM categories WHERE slug = 'colectivos' AND section = 'transporte' LIMIT 1),
    NULL,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'Centro - Villa Mailin - Banda del Río Salí',
    'Lunes a Viernes 5:00-23:00, Sábados 6:00-22:00, Domingos 7:00-21:00',
    450,
    0,
    1,
    0,
    'published',
    4.0,
    189,
    datetime('now')
);

-- 8. SERVICIO DE PRUEBA
INSERT INTO services (
    name, slug, description, service_type,
    phone, whatsapp, email,
    image_url, category_id, zone_id, author_id,
    address, working_hours, price_info,
    has_emergency, has_warranty, accepts_cards,
    status, rating, view_count,
    created_at
) VALUES (
    'Plomería Rodriguez - Servicio 24hs',
    'plomeria-rodriguez-servicio-24hs',
    'Servicio de plomería profesional con más de 20 años de experiencia. Destapaciones, instalaciones, reparaciones de cañerías y artefactos sanitarios. Servicio de emergencia las 24 horas. Garantía en todos los trabajos.',
    'plomeria',
    '385-4229900',
    '5493854229900',
    'plomeriarodriguez@gmail.com',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    (SELECT id FROM categories WHERE slug = 'plomeria' AND section = 'servicios' LIMIT 1),
    NULL,
    (SELECT id FROM users WHERE role = 'comerciante' LIMIT 1),
    'Zona centro y alrededores',
    'Lunes a Sábado 8:00-20:00, Emergencias 24hs',
    'Presupuesto sin cargo. Precios por trabajo realizado.',
    1,
    1,
    1,
    'published',
    4.7,
    321,
    datetime('now')
);

-- 9. PUNTO TURÍSTICO DE PRUEBA
INSERT INTO points_of_interest (
    name, slug, description,
    address, phone, email, website,
    image_url, category_id, zone_id, author_id,
    opening_hours, entry_fee, duration_minutes,
    has_guide, has_accessibility, has_parking,
    latitude, longitude,
    status, featured, rating, view_count,
    created_at
) VALUES (
    'Catedral Basílica de Santiago del Estero',
    'catedral-basilica-de-santiago-del-estero',
    'Patrimonio histórico nacional, la Catedral Basílica Nuestra Señora del Carmen es uno de los templos más antiguos de Argentina. Construida en estilo neoclásico, alberga importantes obras de arte religioso y es sede de la Arquidiócesis.',
    'Plaza Libertad s/n',
    '385-4214567',
    'catedralstgo@gmail.com',
    'https://catedralsantiago.org.ar',
    'https://images.unsplash.com/photo-1548625361-6f2687b72382?w=800',
    (SELECT id FROM categories WHERE slug = 'monumentos' AND section = 'puntos-interes' LIMIT 1),
    1,
    (SELECT id FROM users WHERE role IN ('editor', 'periodista') LIMIT 1),
    'Lunes a Viernes 8:00-12:00 y 17:00-20:00, Domingos 8:00-13:00',
    NULL,
    30,
    0,
    1,
    0,
    -27.7834,
    -64.2642,
    'published',
    1,
    4.8,
    892,
    datetime('now')
);
