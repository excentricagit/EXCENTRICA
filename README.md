# EXCENTRICA v1.2.0

> Red social y marketplace para Santiago del Estero, Argentina

## Despliegue Rápido

### 1. Primera vez - Subir a GitHub
```batch
deploy-github.bat
```

### 2. Configurar Cloudflare
```batch
deploy-cloudflare.bat
```

### 3. Actualizaciones
```batch
Actualizar.bat
```

## Estructura

```
├── public/           # Frontend (Cloudflare Pages)
│   ├── css/         # Estilos CSS
│   ├── js/          # JavaScript
│   ├── admin/       # Panel de administración
│   └── *.html       # Páginas públicas
│
├── worker/          # Backend (Cloudflare Workers)
│   ├── src/         # Código fuente
│   ├── schema.sql   # Esquema de BD
│   └── wrangler.toml
│
├── deploy-github.bat      # Deploy inicial a GitHub
├── deploy-cloudflare.bat  # Configurar Cloudflare
└── Actualizar.bat         # Subir cambios a GitHub
```

## URLs

- **Frontend**: https://excentrica.pages.dev
- **API**: https://excentrica-api.{tu-cuenta}.workers.dev
- **Admin**: https://excentrica.pages.dev/admin/

## Credenciales Admin

- Email: admin@excentrica.com.ar
- Password: Admin123!

## Tecnologías

- Frontend: HTML, CSS, JavaScript (vanilla)
- Backend: Cloudflare Workers
- Base de datos: Cloudflare D1 (SQLite)
- Almacenamiento: Cloudflare R2
