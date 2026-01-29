// EXCENTRICA - Service Worker
// Version para control de actualizaciones
const SW_VERSION = '1.0.3';

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

// Instalacion - activar inmediatamente
self.addEventListener('install', (event) => {
    console.log('[SW] Installing version:', SW_VERSION);
    // skipWaiting hace que el nuevo SW tome control inmediatamente
    self.skipWaiting();
});

// Activacion - tomar control de todos los clientes
self.addEventListener('activate', (event) => {
    console.log('[SW] Activated version:', SW_VERSION);
    event.waitUntil(
        Promise.all([
            // Tomar control de todas las pestanas abiertas
            clients.claim(),
            // Notificar a todos los clientes que hay una actualizacion
            notifyClientsOfUpdate()
        ])
    );
});

// Notificar a los clientes sobre la actualizacion
async function notifyClientsOfUpdate() {
    const allClients = await clients.matchAll({ type: 'window' });
    allClients.forEach(client => {
        client.postMessage({
            type: 'SW_UPDATED',
            version: SW_VERSION
        });
    });
}

// Escuchar mensajes de los clientes
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'GET_VERSION') {
        event.source.postMessage({
            type: 'SW_VERSION',
            version: SW_VERSION
        });
    }
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
