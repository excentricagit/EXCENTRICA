-- =============================================
-- ALOJAMIENTOS DE EJEMPLO
-- Ejecutar: npx wrangler d1 execute excentrica-db --remote --file=migrations/alojamientos-ejemplo.sql
-- =============================================

-- Zonas disponibles:
-- 2 = La Banda
-- 3 = Termas de Rio Hondo
-- 8 = Santiago del Estero

-- =============================================
-- ALOJAMIENTOS DESTACADOS (featured = 1)
-- =============================================

INSERT INTO accommodations (
    name, description, image_url, accommodation_type, zone_id, address,
    phone, email, website, price_per_night, amenities, star_rating,
    author_id, status, featured, created_at, updated_at
) VALUES
(
    'Hotel Casino Carlos V',
    'Hotel 5 estrellas con casino, spa y vista panoramica a las Termas. El mejor alojamiento de lujo en la region con todas las comodidades para una estadia inolvidable.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'hotel',
    3,
    'Av. San Martin 123, Termas de Rio Hondo',
    '3858421234',
    'reservas@hotelcarlosv.com',
    'https://hotelcarlosv.com',
    85000,
    '["wifi","parking","pool","breakfast","ac","spa","restaurant","gym"]',
    5,
    1,
    'approved',
    1,
    datetime('now'),
    datetime('now')
),
(
    'Gran Hotel Amerian',
    'Elegante hotel de 4 estrellas en el centro de Santiago. Habitaciones amplias, desayuno buffet incluido y excelente atencion.',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    'hotel',
    8,
    'Av. Belgrano 456, Santiago del Estero',
    '3854567890',
    'info@granhotel.com',
    'https://granhotel.com',
    45000,
    '["wifi","parking","breakfast","ac","restaurant"]',
    4,
    1,
    'approved',
    1,
    datetime('now'),
    datetime('now')
),
(
    'Cabanas del Bosque',
    'Hermosas cabanas en medio de la naturaleza. Ideales para escapadas romanticas o vacaciones en familia. Pileta, quincho y total privacidad.',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
    'cabanas',
    3,
    'Ruta 9 Km 15, Las Termas',
    '3858445566',
    'cabanasdelbosque@gmail.com',
    NULL,
    35000,
    '["wifi","parking","pool","ac"]',
    0,
    1,
    'approved',
    1,
    datetime('now'),
    datetime('now')
),
(
    'Apart Hotel Los Pinos',
    'Departamentos totalmente equipados para estadias cortas o largas. Cocina completa, living y dormitorios separados.',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'apart-hotel',
    8,
    'Calle Independencia 789, Santiago del Estero',
    '3854112233',
    'lospinos@apart.com',
    'https://lospinos.com.ar',
    28000,
    '["wifi","parking","ac","tv"]',
    3,
    1,
    'approved',
    1,
    datetime('now'),
    datetime('now')
);

-- =============================================
-- ALOJAMIENTOS NO DESTACADOS (featured = 0)
-- =============================================

INSERT INTO accommodations (
    name, description, image_url, accommodation_type, zone_id, address,
    phone, email, website, price_per_night, amenities, star_rating,
    author_id, status, featured, created_at, updated_at
) VALUES
(
    'Hostel El Viajero',
    'Hostel economico y comodo para mochileros. Habitaciones compartidas y privadas, cocina compartida y ambiente juvenil.',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'hostel',
    8,
    'Calle Tucuman 234, Santiago del Estero',
    '3854998877',
    'hostelviajero@gmail.com',
    NULL,
    8000,
    '["wifi","ac"]',
    0,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
),
(
    'Hotel Sol de Mayo',
    'Hotel familiar de 3 estrellas con excelente ubicacion. A pocas cuadras de la plaza principal y terminal de omnibus.',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
    'hotel',
    8,
    'Av. Moreno 567, Santiago del Estero',
    '3854334455',
    'soldemayo@hotel.com',
    NULL,
    22000,
    '["wifi","parking","breakfast","ac"]',
    3,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
),
(
    'Residencial La Abuela',
    'Alojamiento economico y familiar. Habitaciones limpias y comodas con atencion personalizada.',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    'residencial',
    2,
    'Calle Salta 890, La Banda',
    '3854776655',
    NULL,
    NULL,
    12000,
    '["wifi","ac"]',
    0,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
),
(
    'Hotel Termas Palace',
    'Ubicado frente a los banos termales. Piscina climatizada y spa con tratamientos termales.',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
    'hotel',
    3,
    'Av. Costanera 100, Termas de Rio Hondo',
    '3858667788',
    'termaspalace@hotel.com',
    'https://termaspalace.com',
    55000,
    '["wifi","parking","pool","breakfast","ac","spa","restaurant"]',
    4,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
),
(
    'Camping Municipal',
    'Camping con todas las comodidades. Parcelas amplias, banos con agua caliente, electricidad y seguridad 24hs.',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    'camping',
    8,
    'Parque Aguirre, Santiago del Estero',
    '3854000111',
    'camping@municipio.gob.ar',
    NULL,
    3000,
    '["parking"]',
    0,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
),
(
    'B&B Casa Colonial',
    'Encantador bed & breakfast en una casona historica restaurada. Desayuno casero incluido.',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    'bed-breakfast',
    8,
    'Calle Libertad 456, Santiago del Estero',
    '3854223344',
    'casacolonial@bnb.com',
    NULL,
    18000,
    '["wifi","breakfast","ac"]',
    0,
    1,
    'approved',
    0,
    datetime('now'),
    datetime('now')
);

-- Verificar los datos insertados
SELECT
    id,
    name,
    accommodation_type,
    star_rating,
    price_per_night,
    featured,
    status
FROM accommodations
ORDER BY featured DESC, created_at DESC;
