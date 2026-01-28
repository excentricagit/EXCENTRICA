-- EXCENTRICA - Datos de prueba para Productos
-- Ejecutar con: wrangler d1 execute excentrica-db --remote --file=migrations/products-test-data.sql

-- Insertar productos de prueba con imágenes de Unsplash (gratuitas)
-- Usando author_id = 1 (admin@excentrica.com.ar)
INSERT INTO products (title, description, price, original_price, image_url, category_id, author_id, zone_id, condition, status, featured, created_at)
VALUES
-- Electrónica
('iPhone 14 Pro Max 256GB', 'iPhone 14 Pro Max en excelente estado, con caja y accesorios originales. Batería al 95%. Color Space Black.', 1850000, 2100000, 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('MacBook Air M2 2023', 'MacBook Air con chip M2, 8GB RAM, 256GB SSD. Prácticamente nueva, solo 3 meses de uso.', 2200000, 2500000, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Samsung Galaxy S23 Ultra', 'Samsung Galaxy S23 Ultra 256GB, color negro. Incluye cargador y funda original.', 1650000, NULL, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop', NULL, 1, NULL, 'new', 'approved', 1, datetime('now')),

('AirPods Pro 2da Generación', 'AirPods Pro nuevos en caja sellada. Cancelación de ruido activa.', 380000, 450000, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&h=400&fit=crop', NULL, 1, NULL, 'new', 'approved', 1, datetime('now')),

-- Hogar
('Smart TV Samsung 55" 4K', 'Smart TV Samsung 55 pulgadas, 4K UHD, con control remoto. Excelente estado.', 650000, 800000, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Heladera No Frost Samsung', 'Heladera Samsung No Frost 350 litros. Color inox, muy buen estado.', 750000, NULL, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Lavarropas Automático LG', 'Lavarropas LG 8kg, inverter, con vapor. 2 años de uso, funciona perfecto.', 450000, 550000, 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 0, datetime('now')),

-- Ropa
('Campera The North Face Original', 'Campera The North Face modelo Nuptse, talle L. Color negro, como nueva.', 280000, 350000, 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Zapatillas Nike Air Max', 'Nike Air Max 90, talle 42. Usadas 2 veces, prácticamente nuevas.', 150000, 200000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Remera Adidas Original', 'Remera Adidas Originals, talle M. Nueva con etiquetas.', 45000, NULL, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', NULL, 1, NULL, 'new', 'approved', 0, datetime('now')),

-- Deportes
('Bicicleta Mountain Bike R29', 'Mountain Bike rodado 29, cuadro aluminio, 21 velocidades Shimano.', 320000, 400000, 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Set de Pesas y Mancuernas', 'Set completo de pesas: 2 mancuernas + barra + 30kg en discos. Poco uso.', 85000, NULL, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Raqueta de Tenis Wilson', 'Raqueta Wilson Blade 98, usada por profesional. Incluye estuche.', 120000, 180000, 'https://images.unsplash.com/photo-1617083934551-ac99c3f753ca?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 0, datetime('now')),

-- Vehículos
('Honda CB 250 Twister 2022', 'Honda CB 250 Twister, 15.000km. Service al día, excelente estado.', 4500000, NULL, 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

('Fiat Cronos 1.3 2021', 'Fiat Cronos Drive 1.3, único dueño, 45.000km. Color gris plata.', 18500000, 20000000, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop', NULL, 1, NULL, 'used', 'approved', 1, datetime('now')),

-- Servicios
('Clases de Inglés Particulares', 'Profesora certificada ofrece clases de inglés todos los niveles. Presencial u online.', 15000, NULL, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=400&fit=crop', NULL, 1, NULL, 'new', 'approved', 1, datetime('now'));
