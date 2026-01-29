// EXCENTRICA - Service Worker
// Solo maneja estado offline, NO cachea archivos

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#ef4444">
    <title>Sin Conexion - Excentrica</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f15;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        .offline-container {
            text-align: center;
            max-width: 320px;
        }
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
        }
        .offline-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #fff;
        }
        .offline-message {
            color: #94a3b8;
            margin-bottom: 2rem;
            line-height: 1.5;
        }
        .offline-btn {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: #fff;
            border: none;
            padding: 0.875rem 2rem;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1 class="offline-title">Sin Conexion</h1>
        <p class="offline-message">Conectate a internet para usar Excentrica</p>
        <button class="offline-btn" onclick="location.reload()">Reintentar</button>
    </div>
</body>
</html>
`;

// Instalacion
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Activacion
self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
    // Solo interceptar requests de navegacion (paginas HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(OFFLINE_PAGE, {
                    headers: { 'Content-Type': 'text/html; charset=utf-8' }
                });
            })
        );
    }
});
