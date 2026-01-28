-- =============================================
-- DATOS DE PRUEBA - Cines, Peliculas y Horarios
-- =============================================

-- =============================================
-- CINES
-- =============================================
INSERT OR IGNORE INTO cinemas (name, slug, description, logo_url, image_url, address, latitude, longitude, zone_id, phone, whatsapp, website, instagram, total_screens, features, schedule, status, is_active) VALUES
(
    'Cinemark Santiago',
    'cinemark-santiago',
    'El cine mas moderno de Santiago del Estero con tecnologia de punta y las mejores peliculas.',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    'Shopping del Estero, Av. Belgrano 1850',
    -27.7833,
    -64.2667,
    NULL,
    '0385-4223456',
    '5493854223456',
    'https://www.cinemark.com.ar',
    '@cinemarksantiago',
    6,
    '["3D", "IMAX", "Dolby Atmos", "Candy Bar", "Estacionamiento"]',
    'Lunes a Domingo: 14:00 - 00:00',
    'approved',
    1
),
(
    'Cine Atlas Santiago',
    'cine-atlas-santiago',
    'Cine tradicional en el centro de la ciudad con precios accesibles.',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=200',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
    'Av. Independencia 450, Centro',
    -27.7850,
    -64.2600,
    NULL,
    '0385-4215678',
    '5493854215678',
    NULL,
    '@cineatlas_sde',
    4,
    '["3D", "Candy Bar"]',
    'Lunes a Domingo: 15:00 - 23:30',
    'approved',
    1
),
(
    'Cine La Banda',
    'cine-la-banda',
    'El unico cine de La Banda, con las mejores peliculas para toda la familia.',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=200',
    'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800',
    'Av. Besares 1200, La Banda',
    -27.7350,
    -64.2450,
    NULL,
    '0385-4271234',
    '5493854271234',
    NULL,
    '@cinelabanda',
    3,
    '["3D", "Candy Bar", "Estacionamiento"]',
    'Miercoles a Domingo: 16:00 - 23:00',
    'approved',
    1
);

-- =============================================
-- PELICULAS
-- =============================================
INSERT OR IGNORE INTO movies (title, original_title, slug, synopsis, poster_url, backdrop_url, trailer_url, duration, rating, genre, director, "cast", release_date, country, language, imdb_id, status, is_active) VALUES
(
    'Gladiador II',
    'Gladiator II',
    'gladiador-ii',
    'Lucio, hijo de Lucila y nieto del emperador Marco Aurelio, vive una vida tranquila hasta que el General Romano Marcus Acacius invade su hogar. Forzado a entrar a la arena como gladiador, Lucio debe enfrentar su pasado para encontrar la fuerza necesaria para devolver la gloria de Roma a su pueblo.',
    'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
    'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL6ovhZ.jpg',
    'https://www.youtube.com/watch?v=4rgYUipGJNo',
    148,
    '+13',
    '["Accion", "Drama", "Aventura"]',
    'Ridley Scott',
    '["Paul Mescal", "Pedro Pascal", "Denzel Washington", "Connie Nielsen"]',
    '2024-11-15',
    'Estados Unidos',
    'Ingles',
    'tt9218128',
    'now_showing',
    1
),
(
    'Moana 2',
    'Moana 2',
    'moana-2',
    'Moana zarpa en un nuevo viaje epico junto a una tripulacion de navegantes improbables. Tras recibir una llamada inesperada de sus ancestros, debe viajar a los mares lejanos de Oceania y adentrarse en aguas peligrosas para cumplir una mision ancestral.',
    'https://image.tmdb.org/t/p/w500/4YZpsylmjHbqeWzjKpUEF8gcLNW.jpg',
    'https://image.tmdb.org/t/p/original/tElnmtQ6yz1PjN1kePNl8yMSb59.jpg',
    'https://www.youtube.com/watch?v=hDZ7y8RP5HE',
    100,
    'ATP',
    '["Animacion", "Aventura", "Comedia", "Infantil"]',
    'David Derrick Jr., Jason Hand, Dana Ledoux Miller',
    '["Aulii Cravalho", "Dwayne Johnson", "Alan Tudyk"]',
    '2024-11-27',
    'Estados Unidos',
    'Ingles',
    'tt13622970',
    'now_showing',
    1
),
(
    'Wicked',
    'Wicked',
    'wicked',
    'Elphaba, una joven incomprendida por su inusual piel verde, y Glinda, una joven popular, se conocen como estudiantes en la Universidad de Shiz en la tierra de Oz y forjan una amistad improbable pero profunda.',
    'https://image.tmdb.org/t/p/w500/c5Tqxeo1UpBvnAc3csUm7j3hlQl.jpg',
    'https://image.tmdb.org/t/p/original/uKb22E0nlzr914bA9KyA5CVCCir.jpg',
    'https://www.youtube.com/watch?v=6COmYeLsz4c',
    160,
    'ATP',
    '["Musical", "Drama", "Romance"]',
    'Jon M. Chu',
    '["Cynthia Erivo", "Ariana Grande", "Jonathan Bailey", "Jeff Goldblum"]',
    '2024-11-22',
    'Estados Unidos',
    'Ingles',
    'tt1262426',
    'now_showing',
    1
),
(
    'Kraven: El Cazador',
    'Kraven the Hunter',
    'kraven-el-cazador',
    'Sergei Kravinoff, conocido como Kraven, es un cazador que busca demostrar que es el depredador mas grande del mundo. Tras una transformacion que le otorga habilidades sobrehumanas, se embarca en una mision sangrienta.',
    'https://image.tmdb.org/t/p/w500/i47IUSsN126K11JUzqQIOi1Mg1M.jpg',
    'https://image.tmdb.org/t/p/original/v9Du2HC3hlknAvGlWhquRbeifwW.jpg',
    'https://www.youtube.com/watch?v=gneDVprNmao',
    127,
    '+16',
    '["Accion", "Suspenso", "Ciencia Ficcion"]',
    'J.C. Chandor',
    '["Aaron Taylor-Johnson", "Ariana DeBose", "Russell Crowe"]',
    '2024-12-13',
    'Estados Unidos',
    'Ingles',
    'tt8790086',
    'now_showing',
    1
),
(
    'Sonic 3: La Pelicula',
    'Sonic the Hedgehog 3',
    'sonic-3-la-pelicula',
    'Sonic, Knuckles y Tails se reunen para enfrentar a un nuevo y poderoso adversario, Shadow, un misterioso villano con poderes que nunca han visto antes. Con sus habilidades superadas, el equipo debe buscar una alianza inesperada.',
    'https://image.tmdb.org/t/p/w500/d8Ryb8AunYAuycVKDp5HpdWPKgC.jpg',
    'https://image.tmdb.org/t/p/original/zOpe0eHsq0A2NvNyBbtT6sj53qV.jpg',
    'https://www.youtube.com/watch?v=qSu6i2iFMO0',
    110,
    'ATP',
    '["Animacion", "Aventura", "Comedia", "Infantil"]',
    'Jeff Fowler',
    '["Ben Schwartz", "Jim Carrey", "Keanu Reeves", "Idris Elba"]',
    '2024-12-20',
    'Estados Unidos',
    'Ingles',
    'tt18259086',
    'now_showing',
    1
),
(
    'Mufasa: El Rey Leon',
    'Mufasa: The Lion King',
    'mufasa-el-rey-leon',
    'La historia de origenes de Mufasa, desde su infancia como cachorro huerfano hasta convertirse en el legendario rey de la Tierra del Reino.',
    'https://image.tmdb.org/t/p/w500/lurEK87kukWNaHd0zYnsi3yzJrs.jpg',
    'https://image.tmdb.org/t/p/original/ctp6OtmqzVGkfkMcx5rpzHrEwvN.jpg',
    'https://www.youtube.com/watch?v=o17MF9vnabg',
    118,
    'ATP',
    '["Animacion", "Drama", "Aventura", "Infantil"]',
    'Barry Jenkins',
    '["Aaron Pierre", "Kelvin Harrison Jr.", "Seth Rogen", "Billy Eichner"]',
    '2024-12-20',
    'Estados Unidos',
    'Ingles',
    'tt13186482',
    'now_showing',
    1
),
(
    'Capitan America: Un Nuevo Mundo',
    'Captain America: Brave New World',
    'capitan-america-un-nuevo-mundo',
    'Sam Wilson, quien ahora es el Capitan America, se encuentra en medio de un incidente internacional y debe descubrir la razon detras de un complot global.',
    'https://image.tmdb.org/t/p/w500/pzIddUEMWhWzfvLI3TwxUG2Vmf5.jpg',
    'https://image.tmdb.org/t/p/original/gsVC7HnJKzrfRIqXTDOTbw6MSCB.jpg',
    'https://www.youtube.com/watch?v=N_k0zWR27Xk',
    140,
    '+13',
    '["Accion", "Ciencia Ficcion", "Aventura"]',
    'Julius Onah',
    '["Anthony Mackie", "Harrison Ford", "Tim Blake Nelson", "Danny Ramirez"]',
    '2025-02-14',
    'Estados Unidos',
    'Ingles',
    'tt14513804',
    'coming_soon',
    1
);

-- =============================================
-- HORARIOS/FUNCIONES (para hoy y proximos dias)
-- =============================================

-- Cinemark Santiago - Gladiador II
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now'), '14:30', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now'), '17:45', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 2, date('now'), '20:30', 'IMAX', 'subtitulada', 6000, 5000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 2, date('now'), '23:15', 'IMAX', 'subtitulada', 6000, 5000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now', '+1 day'), '15:00', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 2, date('now', '+1 day'), '21:00', 'IMAX', 'subtitulada', 6000, 5000, 1);

-- Cinemark Santiago - Moana 2
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 3, date('now'), '14:00', '3D', 'doblada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 3, date('now'), '16:15', '3D', 'doblada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 4, date('now'), '18:30', '2D', 'doblada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 3, date('now'), '20:45', '3D', 'subtitulada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 3, date('now', '+1 day'), '14:30', '3D', 'doblada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 4, date('now', '+1 day'), '17:00', '2D', 'doblada', 4500, 3500, 1);

-- Cinemark Santiago - Wicked
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'wicked'), 5, date('now'), '15:30', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'wicked'), 5, date('now'), '19:00', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'wicked'), 5, date('now'), '22:30', '2D', 'subtitulada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'wicked'), 5, date('now', '+1 day'), '16:00', '2D', 'subtitulada', 4500, 3500, 1);

-- Cinemark Santiago - Sonic 3
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 6, date('now'), '14:15', '3D', 'doblada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 6, date('now'), '16:30', '3D', 'doblada', 5000, 4000, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 6, date('now'), '18:45', '2D', 'doblada', 4500, 3500, 1),
((SELECT id FROM cinemas WHERE slug = 'cinemark-santiago'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 6, date('now', '+1 day'), '15:00', '3D', 'doblada', 5000, 4000, 1);

-- Cine Atlas - Gladiador II
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now'), '15:00', '2D', 'subtitulada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now'), '18:30', '2D', 'subtitulada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now'), '21:45', '2D', 'subtitulada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'gladiador-ii'), 1, date('now', '+1 day'), '16:00', '2D', 'subtitulada', 3500, 2800, 1);

-- Cine Atlas - Moana 2
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 2, date('now'), '15:30', '2D', 'doblada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 2, date('now'), '17:45', '2D', 'doblada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 2, date('now'), '20:00', '2D', 'doblada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'moana-2'), 2, date('now', '+1 day'), '16:30', '2D', 'doblada', 3500, 2800, 1);

-- Cine Atlas - Kraven
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'kraven-el-cazador'), 3, date('now'), '16:00', '2D', 'subtitulada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'kraven-el-cazador'), 3, date('now'), '19:00', '2D', 'subtitulada', 3500, 2800, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-atlas-santiago'), (SELECT id FROM movies WHERE slug = 'kraven-el-cazador'), 3, date('now'), '22:00', '2D', 'subtitulada', 3500, 2800, 1);

-- Cine La Banda - Moana 2
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'moana-2'), 1, date('now'), '16:00', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'moana-2'), 1, date('now'), '18:15', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'moana-2'), 1, date('now'), '20:30', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'moana-2'), 1, date('now', '+1 day'), '17:00', '2D', 'doblada', 3000, 2500, 1);

-- Cine La Banda - Sonic 3
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 2, date('now'), '16:30', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 2, date('now'), '18:45', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'sonic-3-la-pelicula'), 2, date('now', '+1 day'), '16:00', '2D', 'doblada', 3000, 2500, 1);

-- Cine La Banda - Mufasa
INSERT INTO showtimes (cinema_id, movie_id, screen_number, show_date, show_time, format, language, price, price_promo, is_active) VALUES
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'mufasa-el-rey-leon'), 3, date('now'), '17:00', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'mufasa-el-rey-leon'), 3, date('now'), '19:30', '2D', 'doblada', 3000, 2500, 1),
((SELECT id FROM cinemas WHERE slug = 'cine-la-banda'), (SELECT id FROM movies WHERE slug = 'mufasa-el-rey-leon'), 3, date('now'), '22:00', '2D', 'doblada', 3000, 2500, 1);
