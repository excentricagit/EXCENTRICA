-- ==============================================
-- EXCENTRICA - VideoEditor Test User Migration
-- ==============================================
-- Ejecutar: npx wrangler d1 execute excentrica-db --local --file=migrations/videoeditor-user.sql
-- Produccion: npx wrangler d1 execute excentrica-db --file=migrations/videoeditor-user.sql

-- Crear usuario videoeditor de prueba
-- Password: test1234 (hasheado con bcrypt)
INSERT INTO users (username, email, password_hash, name, phone, role, is_active, email_verified)
VALUES (
    'videoeditor',
    'videoeditor@excentrica.com',
    '$2a$10$8K1p/a0dL1LXMIZ3G8LwNuGUxLCm8K1p/a0dL1LXMIgoGXmZQZwKi',
    'Video Editor Test',
    '3854000006',
    'videoeditor',
    1,
    1
) ON CONFLICT(email) DO UPDATE SET
    role = 'videoeditor',
    is_active = 1;

-- Nota: Si el hash no funciona, usar este comando para generar uno nuevo:
-- import bcrypt from 'bcryptjs'; console.log(bcrypt.hashSync('test1234', 10));
