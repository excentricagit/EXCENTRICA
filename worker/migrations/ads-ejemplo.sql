-- =============================================
-- ANUNCIOS DE EJEMPLO PARA PRUEBAS
-- Ejecutar: npx wrangler d1 execute excentrica-db --remote --file=migrations/ads-ejemplo.sql
-- =============================================

-- Anuncio de prueba para mercaderia (video corto de YouTube)
INSERT INTO ads (
    title,
    description,
    video_url,
    link_url,
    position,
    priority,
    author_id,
    is_active,
    start_date,
    end_date,
    impressions,
    clicks,
    created_at,
    updated_at
) VALUES
(
    'Video Publicitario Demo',
    'Anuncio de prueba para el sistema de publicidad',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://excentrica.com.ar',
    'mercaderia-sidebar',
    1,
    1,
    1,
    NULL,
    NULL,
    0,
    0,
    datetime('now'),
    datetime('now')
);

-- Verificar
SELECT id, title, position, is_active FROM ads ORDER BY created_at DESC LIMIT 5;
