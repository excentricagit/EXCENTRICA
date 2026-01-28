-- EXCENTRICA - Datos de prueba para Turismo / Puntos de Interes
-- Santiago del Estero - La Madre de Ciudades
-- Ejecutar con: wrangler d1 execute excentrica-db --remote --file=migrations/turismo-test-data.sql

-- Usando author_id = 1 (admin@excentrica.com.ar)

INSERT INTO points_of_interest (name, description, image_url, category_id, author_id, zone_id, address, latitude, longitude, phone, website, schedule, entry_fee, is_free, status, featured, created_at)
VALUES

-- LUGARES HISTORICOS
('Plaza Libertad', 'Plaza principal de Santiago del Estero, corazon historico de la ciudad mas antigua de Argentina. Rodeada de edificios emblematicos como la Catedral Basilica y la Casa de Gobierno. Punto de encuentro tradicional de los santiaguenos.', 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano y Av. Roca, Centro', -27.7834, -64.2642, NULL, NULL, 'Abierta las 24 horas', 0, 1, 'approved', 1, datetime('now')),

('Catedral Basilica', 'Catedral Basilica de Santiago del Estero, templo catolico principal de la provincia. De estilo neoclasico, alberga la imagen del Santo Cristo de los Milagros, patrono de la ciudad. Declarada Monumento Historico Nacional.', 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano 350, Centro', -27.7831, -64.2647, '0385-4214567', NULL, 'Lunes a Domingo: 7:00 - 20:00', 0, 1, 'approved', 1, datetime('now')),

('Convento de San Francisco', 'Convento e iglesia franciscana fundada en 1553, una de las construcciones religiosas mas antiguas de Argentina. Conserva reliquias historicas y arte colonial. Su claustro es un remanso de paz en el centro de la ciudad.', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano 150, Centro', -27.7840, -64.2655, '0385-4215890', NULL, 'Martes a Domingo: 9:00 - 12:00 y 17:00 - 20:00', 0, 1, 'approved', 1, datetime('now')),

('Casa de Gobierno', 'Sede del Poder Ejecutivo Provincial, edificio de estilo italianizante construido a fines del siglo XIX. Su arquitectura imponente domina uno de los costados de la Plaza Libertad. Se pueden realizar visitas guiadas.', 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano 450, Centro', -27.7830, -64.2640, '0385-4503000', 'https://www.sde.gob.ar', 'Lunes a Viernes: 8:00 - 13:00', 0, 1, 'approved', 1, datetime('now')),

-- MUSEOS Y CULTURA
('Museo de Ciencias Antropologicas y Naturales', 'Museo que alberga colecciones de arqueologia, paleontologia y etnografia de la region. Destaca la muestra sobre culturas originarias del NOA y fosiles encontrados en la provincia.', 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&h=400&fit=crop', NULL, 1, NULL, 'Avellaneda 350, Centro', -27.7850, -64.2620, '0385-4214380', NULL, 'Martes a Viernes: 8:00 - 13:00 y 16:00 - 20:00, Sabados: 9:00 - 13:00', 0, 1, 'approved', 1, datetime('now')),

('Museo Historico Provincial', 'Ubicado en una casona colonial, exhibe piezas de la historia santiaguena desde la fundacion hasta la actualidad. Incluye objetos de los pueblos originarios, epoca colonial y personalidades locales.', 'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=600&h=400&fit=crop', NULL, 1, NULL, 'Urquiza 354, Centro', -27.7845, -64.2630, '0385-4218780', NULL, 'Martes a Viernes: 8:00 - 13:00, Sabados: 9:00 - 12:00', 0, 1, 'approved', 1, datetime('now')),

('Centro Cultural del Bicentenario', 'Moderno espacio cultural con salas de exposiciones, auditorio y espacios para eventos artisticos. Sede de importantes muestras y espectaculos de la provincia.', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano Sur 1800', -27.7900, -64.2650, '0385-4503500', NULL, 'Martes a Domingo: 10:00 - 20:00', 0, 1, 'approved', 1, datetime('now')),

-- NATURALEZA Y PARQUES
('Parque Aguirre', 'El pulmon verde mas grande de la ciudad con mas de 30 hectareas. Ideal para caminatas, picnics y actividades al aire libre. Cuenta con lago artificial, zoologico y espacios recreativos.', 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Belgrano Norte, Barrio Aguirre', -27.7700, -64.2600, NULL, NULL, 'Abierto todos los dias: 6:00 - 22:00', 0, 1, 'approved', 1, datetime('now')),

('Dique Los Quiroga', 'Embalse ubicado a pocos kilometros de la capital, ideal para la pesca deportiva y deportes nauticos. Sus costas ofrecen espacios para acampar y disfrutar de la naturaleza.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop', NULL, 1, NULL, 'Ruta Provincial 5, Los Quiroga', -27.7200, -64.2300, NULL, NULL, 'Abierto todos los dias', 0, 1, 'approved', 1, datetime('now')),

('Termas de Rio Hondo', 'Ciudad termal mas importante de Argentina, famosa por sus aguas termales con propiedades curativas. Ofrece hoteles con spa, balnearios y tratamientos de salud. A solo 65 km de la capital.', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', NULL, 1, NULL, 'Rio Hondo, Santiago del Estero', -27.4967, -64.8600, '0385-4421000', 'https://termasriohondo.com', 'Todo el año', 0, 0, 'approved', 1, datetime('now')),

('Embalse de Rio Hondo', 'Lago artificial de gran extension, perfecto para pesca de pejerrey y dorado. En sus costas se encuentran balnearios, campings y restaurantes con vista al lago.', 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop', NULL, 1, NULL, 'Termas de Rio Hondo', -27.5100, -64.8500, NULL, NULL, 'Abierto todos los dias', 0, 1, 'approved', 1, datetime('now')),

-- TRADICION Y FOLKLORE
('Patio del Indio Froilan', 'Emblematico patio de comidas y penas folkloricas donde se puede disfrutar de musica en vivo, chacarera y comidas tipicas santiaguenas. Lugar de encuentro de artistas locales.', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop', NULL, 1, NULL, 'Av. Libertad 450, Centro', -27.7860, -64.2635, '0385-4223456', NULL, 'Viernes y Sabados: 21:00 - 03:00', 0, 0, 'approved', 1, datetime('now')),

('Festival de La Salamanca', 'Escenario permanente del famoso Festival Nacional de la Salamanca en La Banda. Cada febrero reune a los mejores artistas del folklore argentino.', 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop', NULL, 1, NULL, 'Anfiteatro, La Banda', -27.7350, -64.2450, NULL, 'https://salamanca.gob.ar', 'Febrero (Festival)', 0, 0, 'approved', 1, datetime('now')),

-- GASTRONOMIA LOCAL
('Mercado Armonía', 'Mercado tradicional donde encontrar productos regionales, empanadas santiaguenas, quesos de cabra, dulces y artesanias. Experiencia autentica de la cultura local.', 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=600&h=400&fit=crop', NULL, 1, NULL, 'Pellegrini 580, Centro', -27.7855, -64.2610, NULL, NULL, 'Lunes a Sabado: 7:00 - 14:00', 0, 1, 'approved', 1, datetime('now')),

-- ATRACTIVOS CERCANOS
('Ojo de Agua', 'Localidad famosa por sus aguas termales y el balneario municipal. Destino ideal para un dia de relax a 180 km de la capital.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', NULL, 1, NULL, 'Ojo de Agua, Santiago del Estero', -29.5000, -63.7000, NULL, NULL, 'Todo el año', 500, 0, 'approved', 1, datetime('now')),

('Sumampa', 'Pueblo historico con su famosa Basilica de la Virgen de la Consolacion. Importante centro de peregrinacion y festividad religiosa cada noviembre.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', NULL, 1, NULL, 'Sumampa, Santiago del Estero', -29.3833, -63.4667, NULL, NULL, 'Todo el año', 0, 1, 'approved', 1, datetime('now'));
