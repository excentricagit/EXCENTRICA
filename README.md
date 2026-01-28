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

## Base de Datos

### Información de conexión
- **Database name**: excentrica-db
- **Database ID**: 7616d9fe-1043-4b69-9751-7026d89b8c81

### Comandos útiles de Wrangler D1

```bash
# Listar todas las tablas
npx wrangler d1 execute excentrica-db --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# Ver estructura de una tabla
npx wrangler d1 execute excentrica-db --remote --command="PRAGMA table_info(nombre_tabla);"

# Consultar datos de una tabla
npx wrangler d1 execute excentrica-db --remote --command="SELECT * FROM nombre_tabla LIMIT 10;"

# Ejecutar archivo SQL
npx wrangler d1 execute excentrica-db --remote --file=worker/schema.sql
```

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (admin, editor, publicista, user) |
| `zones` | Zonas geográficas de Santiago del Estero |
| `categories` | Categorías por sección (noticias, mercaderia, eventos, etc) |
| `news` | Noticias y artículos |
| `products` | Productos del marketplace |
| `events` | Eventos y actividades |
| `event_registrations` | Inscripciones a eventos |
| `videos` | Videos (YouTube, etc) |
| `accommodations` | Alojamientos y hospedajes |
| `gastronomy` | Restaurantes y locales de comida |
| `transport` | Transporte público (colectivos) |
| `transport_private` | Transporte privado (remises, taxis) |
| `transport_drivers` | Datos privados de conductores |
| `services` | Servicios profesionales |
| `service_providers` | Datos privados de proveedores |
| `points_of_interest` | Puntos de interés turístico |
| `ads` | Sistema de publicidad (videos YouTube) |
| `likes` | Sistema de likes polimórfico |
| `offers` | Ofertas en productos |
| `media` | Archivos multimedia (R2) |
| `subscriptions` | Suscripciones de usuarios |
| `audit_logs` | Logs de auditoría |
| `settings` | Configuraciones del sistema |
| `statistics` | Estadísticas diarias |
| `cinemas` | Cines |
| `movies` | Películas |
| `showtimes` | Horarios de funciones |

### Tabla: ads (Sistema de Publicidad)

```sql
CREATE TABLE ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,          -- URL de YouTube
    link_url TEXT,                     -- Link destino al hacer click
    position TEXT DEFAULT 'sidebar',  -- Posición/sección del anuncio
    priority INTEGER DEFAULT 0,        -- Prioridad (mayor = más arriba)
    author_id INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,       -- 0=pendiente, 1=activo
    start_date TEXT,                   -- Fecha inicio (opcional)
    end_date TEXT,                     -- Fecha fin (opcional)
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
);
```

**Posiciones válidas para ads:**
- `sidebar` - General (aparece en index.html)
- `mercaderia-sidebar` - Sección Mercadería
- `alojamiento-sidebar` - Sección Alojamiento
- `gastronomia-sidebar` - Sección Gastronomía
- `servicios-sidebar` - Sección Servicios
- `transporte-sidebar` - Sección Transporte
- `eventos-sidebar` - Sección Eventos
- `turismo-sidebar` - Sección Turismo
