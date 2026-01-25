-- Usuarios de prueba para Excentrica
-- Contraseña para todos: test1234

-- Eliminar usuarios de prueba si existen
DELETE FROM users WHERE username IN ('admin', 'editor', 'periodista', 'comerciante', 'publicista', 'usuario')
    OR email IN ('admin@excentrica.com', 'editor@excentrica.com', 'periodista@excentrica.com', 'comerciante@excentrica.com', 'publicista@excentrica.com', 'usuario@excentrica.com');

-- Insertar usuarios de prueba
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('admin', 'admin@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'Administrador Sistema', '+54 385 400-0000', 'admin', 1);
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('editor', 'editor@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'Juan Editor', '+54 385 400-0001', 'editor', 1);
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('periodista', 'periodista@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'María Periodista', '+54 385 400-0002', 'periodista', 1);
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('comerciante', 'comerciante@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'Pedro Comerciante', '+54 385 400-0003', 'comerciante', 1);
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('publicista', 'publicista@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'Ana Publicista', '+54 385 400-0004', 'publicista', 1);
INSERT INTO users (username, email, password_hash, name, phone, role, is_active) VALUES ('usuario', 'usuario@excentrica.com', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', 'Carlos Usuario', '+54 385 400-0005', 'user', 1);
