# EXCENTRICA - Documentación de Tablas de Base de Datos

> **Base de datos:** Cloudflare D1 (SQLite)
> **Nombre:** excentrica-db
> **ID:** 7616d9fe-1043-4b69-9751-7026d89b8c81
> **Versión:** 1.8.0
> **Última actualización:** 2026-01-29

---

## Resumen de Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema |
| `news` | Noticias y artículos |
| `events` | Eventos y actividades |
| `videos` | Videos (YouTube, etc) |
| `video_playlists` | Playlists de videos |
| `video_playlist_items` | Videos en playlists |
| `products` | Productos del marketplace |
| `services` | Servicios profesionales |
| `accommodation` | Alojamientos (versión extendida) |
| `accommodations` | Alojamientos (versión básica) |
| `gastronomy` | Restaurantes y comida |
| `transport` | Transporte genérico |
| `transport_private` | Remises y taxis |
| `bus_lines` | Líneas de colectivos |
| `bus_stops` | Paradas de colectivos |
| `cinemas` | Cines |
| `movies` | Películas |
| `showtimes` | Funciones/Cartelera |
| `points_of_interest` | Puntos de interés turístico |
| `categories` | Categorías por sección |
| `zones` | Zonas geográficas |
| `likes` | Sistema de likes |
| `offers` | Ofertas de compra |
| `media` | Archivos multimedia |
| `ads` | Publicidad |
| `subscriptions` | Suscripciones de usuarios |
| `settings` | Configuraciones del sistema |
| `statistics` | Estadísticas diarias |
| `activity_logs` | Logs de actividad (auditoría) |
| `special_events` | Sorteos y eventos recurrentes |
| `sorteo_participants` | Participantes en sorteos |

---

## Índice

1. [Usuarios y Autenticación](#usuarios-y-autenticación)
2. [Contenido Principal](#contenido-principal)
3. [Comercio y Servicios](#comercio-y-servicios)
4. [Transporte](#transporte)
5. [Entretenimiento](#entretenimiento)
6. [Configuración y Sistema](#configuración-y-sistema)

---

## Usuarios y Autenticación

### `users`
Usuarios del sistema (admins, editores, usuarios, y futuros roles como cines).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| username | TEXT | ✓ | - | Nombre de usuario (UNIQUE) |
| email | TEXT | ✓ | - | Correo electrónico (UNIQUE) |
| password_hash | TEXT | ✓ | - | Contraseña hasheada |
| name | TEXT | ✓ | - | Nombre completo |
| phone | TEXT | - | - | Teléfono |
| avatar_url | TEXT | - | - | URL del avatar |
| bio | TEXT | - | - | Biografía |
| zone_id | INTEGER | - | - | FK → zones |
| role | TEXT | - | 'user' | Rol del usuario |
| email_verified | INTEGER | - | 0 | 0/1 |
| is_active | INTEGER | - | 1 | 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| last_login | TEXT | - | - | Último login |

**Roles disponibles:**
- `admin` - Acceso total
- `editor` - Puede crear/editar contenido (noticias, eventos, productos, etc.)
- `periodista` - Igual que editor
- `comerciante` - Puede gestionar sus propios productos y servicios
- `publicista` - Puede gestionar anuncios publicitarios
- `videoeditor` - Puede subir y gestionar videos de la plataforma
- `user` - Usuario regular
- `cinema` - (Futuro) Dueño de cine

### `subscriptions`
Suscripciones de usuarios (planes premium).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| user_id | INTEGER | ✓ | - | FK → users |
| plan | TEXT | - | 'free' | Plan: `free`, `basic`, `premium` |
| status | TEXT | - | 'active' | Estado: `active`, `cancelled`, `expired` |
| start_date | TEXT | - | datetime('now') | Inicio de suscripción |
| end_date | TEXT | - | - | Fin de suscripción |
| payment_method | TEXT | - | - | Método de pago |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| updated_at | TEXT | - | datetime('now') | Última actualización |

---

## Contenido Principal

### `news`
Noticias y artículos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| slug | TEXT | ✓ | - | URL amigable (UNIQUE) |
| summary | TEXT | - | - | Resumen |
| content | TEXT | ✓ | - | Contenido completo |
| image_url | TEXT | - | - | Imagen principal |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado 0/1 |
| like_count | INTEGER | - | 0 | Contador likes |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| published_at | TEXT | - | - | Fecha publicación |

### `events`
Eventos y actividades.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| description | TEXT | ✓ | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| location | TEXT | - | - | Nombre del lugar |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| event_date | TEXT | - | - | Fecha del evento |
| event_time | TEXT | - | - | Hora inicio |
| end_date | TEXT | - | - | Fecha fin |
| end_time | TEXT | - | - | Hora fin |
| price | REAL | - | - | Precio entrada |
| ticket_url | TEXT | - | - | Link de tickets |
| phone | TEXT | - | - | Teléfono |
| whatsapp | TEXT | - | - | WhatsApp |
| website | TEXT | - | - | Sitio web |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado 0/1 |
| like_count | INTEGER | - | 0 | Contador likes |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `videos`
Videos (YouTube, etc).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| description | TEXT | - | - | Descripción |
| video_url | TEXT | ✓ | - | URL del video |
| thumbnail_url | TEXT | - | - | Miniatura |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| like_count | INTEGER | - | 0 | Contador likes |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `video_playlists`
Playlists de videos creadas por videoeditors.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre de la playlist |
| slug | TEXT | ✓ | - | URL amigable (UNIQUE) |
| description | TEXT | - | - | Descripción |
| cover_image | TEXT | - | - | Imagen de portada |
| author_id | INTEGER | ✓ | - | FK → users (videoeditor) |
| is_public | INTEGER | - | 1 | Visible públicamente 0/1 |
| video_count | INTEGER | - | 0 | Cantidad de videos (auto) |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| updated_at | TEXT | - | datetime('now') | Última actualización |

**Triggers:**
- `update_playlist_count_insert` - Actualiza video_count al agregar video
- `update_playlist_count_delete` - Actualiza video_count al eliminar video

### `video_playlist_items`
Relación entre playlists y videos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| playlist_id | INTEGER | ✓ | - | FK → video_playlists |
| video_id | INTEGER | ✓ | - | FK → videos |
| position | INTEGER | - | 0 | Orden del video en playlist |
| added_at | TEXT | - | datetime('now') | Fecha agregado |

**Restricción UNIQUE:** `(playlist_id, video_id)` - Un video solo puede estar una vez en cada playlist.

---

## Comercio y Servicios

### `products`
Productos del marketplace.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| description | TEXT | ✓ | - | Descripción |
| price | REAL | ✓ | - | Precio |
| original_price | REAL | - | - | Precio original (descuentos) |
| image_url | TEXT | - | - | Imagen principal |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| phone | TEXT | - | - | Teléfono |
| whatsapp | TEXT | - | - | WhatsApp |
| condition | TEXT | - | 'new' | `new`, `used`, `refurbished` |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| accepts_offers | INTEGER | - | 0 | Acepta ofertas 0/1 |
| like_count | INTEGER | - | 0 | Contador likes |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `offers`
Ofertas de compra para productos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| product_id | INTEGER | ✓ | - | FK → products |
| user_id | INTEGER | ✓ | - | FK → users (comprador) |
| amount | REAL | ✓ | - | Monto ofrecido |
| message | TEXT | - | - | Mensaje del comprador |
| status | TEXT | - | 'pending' | `pending`, `accepted`, `rejected` |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| responded_at | TEXT | - | - | Fecha de respuesta |

### `services`
Servicios profesionales.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| description | TEXT | ✓ | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| phone | TEXT | - | - | Teléfono |
| email | TEXT | - | - | Email |
| website | TEXT | - | - | Sitio web |
| whatsapp | TEXT | - | - | WhatsApp |
| instagram | TEXT | - | - | Instagram |
| price_from | REAL | - | - | Precio desde |
| price_to | REAL | - | - | Precio hasta |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `accommodation` (Versión Extendida)
Alojamientos con campos detallados de amenities.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| slug | TEXT | - | - | URL amigable |
| description | TEXT | - | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | - | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| phone | TEXT | - | - | Teléfono |
| email | TEXT | - | - | Email |
| website | TEXT | - | - | Sitio web |
| instagram | TEXT | - | - | Instagram |
| whatsapp | TEXT | - | - | WhatsApp |
| accommodation_type | TEXT | - | 'hotel' | `hotel`, `hostel`, `cabin`, `apart`, `camping` |
| star_rating | INTEGER | - | 0 | Estrellas (0-5) |
| price_range | TEXT | - | - | Rango de precios texto |
| price_from | REAL | - | - | Precio desde |
| has_wifi | INTEGER | - | 0 | Tiene WiFi 0/1 |
| has_pool | INTEGER | - | 0 | Tiene pileta 0/1 |
| has_parking | INTEGER | - | 0 | Tiene estacionamiento 0/1 |
| has_breakfast | INTEGER | - | 0 | Incluye desayuno 0/1 |
| has_ac | INTEGER | - | 0 | Tiene aire acondicionado 0/1 |
| has_pet_friendly | INTEGER | - | 0 | Acepta mascotas 0/1 |
| amenities | TEXT | - | - | Amenities adicionales JSON |
| check_in_time | TEXT | - | - | Hora de check-in |
| check_out_time | TEXT | - | - | Hora de check-out |
| total_rooms | INTEGER | - | - | Total de habitaciones |
| status | TEXT | - | 'pending' | Estado |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | DATETIME | - | CURRENT_TIMESTAMP | Fecha creación |
| updated_at | DATETIME | - | CURRENT_TIMESTAMP | Última actualización |

### `accommodations` (Versión Básica)
Alojamientos con estructura simplificada.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| description | TEXT | ✓ | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| phone | TEXT | - | - | Teléfono |
| email | TEXT | - | - | Email |
| website | TEXT | - | - | Sitio web |
| whatsapp | TEXT | - | - | WhatsApp |
| instagram | TEXT | - | - | Instagram |
| price_per_night | REAL | - | - | Precio por noche |
| amenities | TEXT | - | - | Amenities JSON |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `gastronomy`
Restaurantes y locales de comida.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| description | TEXT | ✓ | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| phone | TEXT | - | - | Teléfono |
| email | TEXT | - | - | Email |
| website | TEXT | - | - | Sitio web |
| whatsapp | TEXT | - | - | WhatsApp |
| instagram | TEXT | - | - | Instagram |
| price_range | TEXT | - | - | Rango de precios |
| schedule | TEXT | - | - | Horarios JSON |
| has_delivery | INTEGER | - | 0 | Tiene delivery 0/1 |
| has_takeaway | INTEGER | - | 0 | Tiene takeaway 0/1 |
| specialties | TEXT | - | - | Especialidades |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

---

## Transporte

### `bus_lines`
Líneas de colectivos urbanos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| line_number | TEXT | ✓ | - | Número de línea (ej: "A", "101") |
| name | TEXT | ✓ | - | Nombre descriptivo |
| company | TEXT | - | - | Empresa operadora |
| description | TEXT | - | - | Descripción |
| route_description | TEXT | - | - | Descripción del recorrido |
| color | TEXT | - | '#a855f7' | Color de la línea (hex) |
| schedule | TEXT | - | - | Horarios JSON |
| price | REAL | - | - | Precio del boleto |
| zone_id | INTEGER | - | - | FK → zones |
| author_id | INTEGER | ✓ | - | FK → users |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| updated_at | TEXT | - | datetime('now') | Última actualización |

### `bus_stops`
Paradas de colectivos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| bus_line_id | INTEGER | ✓ | - | FK → bus_lines |
| name | TEXT | ✓ | - | Nombre de la parada |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| stop_order | INTEGER | - | 0 | Orden en el recorrido |
| arrival_times | TEXT | - | - | Horarios de llegada JSON |
| stop_type | TEXT | - | 'normal' | `normal`, `terminal`, `transfer` |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| updated_at | TEXT | - | datetime('now') | Última actualización |

### `transport`
Transporte genérico (terminales, empresas).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| description | TEXT | - | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| phone | TEXT | - | - | Teléfono |
| whatsapp | TEXT | - | - | WhatsApp |
| website | TEXT | - | - | Sitio web |
| schedule | TEXT | - | - | Horarios JSON |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `transport_private`
Remises, taxis y transporte privado.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título/Nombre |
| description | TEXT | - | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| phone | TEXT | ✓ | - | Teléfono (requerido) |
| vehicle_type | TEXT | - | - | Tipo: `remis`, `taxi`, `uber`, `particular` |
| vehicle_model | TEXT | - | - | Modelo del vehículo |
| vehicle_year | INTEGER | - | - | Año del vehículo |
| license_plate | TEXT | - | - | Patente |
| has_ac | INTEGER | - | 0 | Tiene aire acondicionado 0/1 |
| accepts_cards | INTEGER | - | 0 | Acepta tarjetas 0/1 |
| is_24h | INTEGER | - | 0 | Servicio 24hs 0/1 |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

---

## Entretenimiento

### `cinemas`
Cines (establecimientos).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre del cine |
| slug | TEXT | ✓ | - | URL amigable (UNIQUE) |
| description | TEXT | - | - | Descripción |
| logo_url | TEXT | - | - | Logo |
| image_url | TEXT | - | - | Imagen fachada |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| zone_id | INTEGER | - | - | FK → zones |
| phone | TEXT | - | - | Teléfono |
| whatsapp | TEXT | - | - | WhatsApp |
| website | TEXT | - | - | Sitio web |
| instagram | TEXT | - | - | Instagram |
| total_screens | INTEGER | - | - | Cantidad de salas |
| features | TEXT | - | - | Características JSON (3D, IMAX, etc) |
| schedule | TEXT | - | - | Horarios de atención |
| owner_id | INTEGER | - | - | FK → users (futuro) |
| status | TEXT | - | 'pending' | Estado |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `movies`
Películas en cartelera.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| original_title | TEXT | - | - | Título original |
| slug | TEXT | ✓ | - | URL amigable (UNIQUE) |
| synopsis | TEXT | - | - | Sinopsis |
| poster_url | TEXT | - | - | Poster |
| backdrop_url | TEXT | - | - | Imagen de fondo |
| trailer_url | TEXT | - | - | URL trailer YouTube |
| duration | INTEGER | - | - | Duración en minutos |
| rating | TEXT | - | - | Clasificación (ATP, +13, +16, +18) |
| genre | TEXT | - | - | Géneros JSON |
| director | TEXT | - | - | Director |
| cast | TEXT | - | - | Actores JSON |
| release_date | TEXT | - | - | Fecha de estreno |
| country | TEXT | - | - | País de origen |
| language | TEXT | - | - | Idioma original |
| imdb_id | TEXT | - | - | ID de IMDB |
| status | TEXT | - | 'now_showing' | `now_showing`, `coming_soon`, `archived` |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `showtimes`
Funciones/Cartelera (relaciona películas con cines).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| cinema_id | INTEGER | ✓ | - | FK → cinemas |
| movie_id | INTEGER | ✓ | - | FK → movies |
| screen_number | INTEGER | - | 1 | Número de sala |
| show_date | TEXT | ✓ | - | Fecha de la función |
| show_time | TEXT | ✓ | - | Hora de la función |
| format | TEXT | - | '2D' | `2D`, `3D`, `IMAX`, `4DX` |
| language | TEXT | - | 'subtitulada' | `subtitulada`, `doblada`, `original` |
| price | REAL | - | 0 | Precio entrada |
| price_promo | REAL | - | - | Precio promocional |
| available_seats | INTEGER | - | - | Asientos disponibles |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| valid_from | TEXT | - | - | Válido desde |
| valid_until | TEXT | - | - | Válido hasta |
| created_at | TEXT | - | datetime('now') | Fecha creación |

**Índice:** `(cinema_id, movie_id, show_date)` para búsquedas rápidas.

### `points_of_interest`
Puntos de interés turístico.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| description | TEXT | ✓ | - | Descripción |
| image_url | TEXT | - | - | Imagen |
| images | TEXT | - | - | Galería JSON |
| category_id | INTEGER | - | - | FK → categories |
| author_id | INTEGER | ✓ | - | FK → users |
| zone_id | INTEGER | - | - | FK → zones |
| address | TEXT | - | - | Dirección |
| latitude | REAL | - | - | Coordenada lat |
| longitude | REAL | - | - | Coordenada lng |
| phone | TEXT | - | - | Teléfono |
| website | TEXT | - | - | Sitio web |
| schedule | TEXT | - | - | Horarios JSON |
| entry_fee | REAL | - | - | Precio entrada |
| status | TEXT | - | 'pending' | Estado |
| featured | INTEGER | - | 0 | Destacado |
| view_count | INTEGER | - | 0 | Contador vistas |
| created_at | TEXT | - | datetime('now') | Fecha creación |

---

## Configuración y Sistema

### `categories`
Categorías por sección.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| slug | TEXT | ✓ | - | URL amigable |
| section | TEXT | ✓ | - | Sección a la que pertenece |
| icon | TEXT | - | - | Emoji icono |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |

**Secciones disponibles:**
- `noticias` - Categorías de noticias
- `productos` / `mercaderia` - Categorías del marketplace
- `eventos` - Categorías de eventos
- `cine` - Géneros de películas
- `gastronomia` - Tipos de restaurantes
- `alojamiento` - Tipos de hospedaje
- `servicios` - Tipos de servicios
- `puntos-interes` - Tipos de atracciones
- `videos` - Categorías de videos
- `transporte` - Tipos de transporte

### `zones`
Zonas geográficas de Santiago del Estero.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| name | TEXT | ✓ | - | Nombre |
| slug | TEXT | ✓ | - | URL amigable (UNIQUE) |
| description | TEXT | - | - | Descripción |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| created_at | TEXT | - | datetime('now') | Fecha creación |

**Zonas predefinidas:** Capital, La Banda, Termas de Río Hondo, Añatuya, Frías, Interior.

### `likes`
Sistema de likes polimórfico.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| user_id | INTEGER | ✓ | - | FK → users |
| content_type | TEXT | ✓ | - | Tipo: `news`, `product`, `event`, `movie`, etc |
| content_id | INTEGER | ✓ | - | ID del contenido |
| created_at | TEXT | - | datetime('now') | Fecha creación |

**Índice único:** `(user_id, content_type, content_id)`

### `media`
Archivos multimedia.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| key | TEXT | ✓ | - | Identificador único (UNIQUE) |
| url | TEXT | ✓ | - | URL o base64 |
| filename | TEXT | - | - | Nombre archivo |
| content_type | TEXT | - | - | MIME type |
| size | INTEGER | - | 0 | Tamaño en bytes |
| uploaded_by | INTEGER | - | - | FK → users |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `ads`
Sistema de publicidad.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| title | TEXT | ✓ | - | Título |
| description | TEXT | - | - | Descripción |
| video_url | TEXT | ✓ | - | URL del video/imagen |
| link_url | TEXT | - | - | URL destino al hacer click |
| position | TEXT | - | 'sidebar' | `sidebar`, `header`, `footer`, `interstitial` |
| priority | INTEGER | - | 0 | Orden de aparición |
| author_id | INTEGER | ✓ | - | FK → users (anunciante) |
| is_active | INTEGER | - | 1 | Activo 0/1 |
| start_date | TEXT | - | - | Fecha inicio |
| end_date | TEXT | - | - | Fecha fin |
| impressions | INTEGER | - | 0 | Contador impresiones |
| clicks | INTEGER | - | 0 | Contador clicks |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `settings`
Configuraciones del sistema.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| key | TEXT | ✓ | - | Clave (UNIQUE) |
| value | TEXT | ✓ | - | Valor |
| type | TEXT | - | 'string' | Tipo: `string`, `number`, `boolean`, `json` |
| description | TEXT | - | - | Descripción |
| updated_at | TEXT | - | datetime('now') | Última actualización |
| updated_by | INTEGER | - | - | FK → users |

### `statistics`
Estadísticas diarias.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| date | TEXT | ✓ | - | Fecha (UNIQUE) |
| page_views | INTEGER | - | 0 | Vistas de página |
| unique_visitors | INTEGER | - | 0 | Visitantes únicos |
| new_users | INTEGER | - | 0 | Nuevos usuarios |
| new_publications | INTEGER | - | 0 | Nuevas publicaciones |
| total_likes | INTEGER | - | 0 | Total de likes |
| data | TEXT | - | - | Datos adicionales JSON |
| created_at | TEXT | - | datetime('now') | Fecha creación |

### `activity_logs`
Logs de actividad para auditoría y control. Registra todas las acciones importantes de los usuarios (especialmente publicistas y editores).

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| user_id | INTEGER | ✓ | - | FK → users (quién hizo la acción) |
| user_name | TEXT | ✓ | - | Nombre del usuario (cache) |
| user_role | TEXT | ✓ | - | Rol del usuario al momento de la acción |
| action | TEXT | ✓ | - | Acción: `create`, `update`, `delete`, `approve`, `reject`, `activate`, `deactivate` |
| entity_type | TEXT | ✓ | - | Tipo: `ad`, `event`, `registration`, `user`, `news`, `product` |
| entity_id | INTEGER | - | - | ID de la entidad afectada |
| entity_name | TEXT | - | - | Nombre/título de la entidad (referencia rápida) |
| details | TEXT | - | - | Detalles JSON (old_status, new_status, etc) |
| ip_address | TEXT | - | - | IP del usuario |
| user_agent | TEXT | - | - | User agent del navegador |
| created_at | TEXT | - | datetime('now') | Fecha creación |

**Índices:**
- `idx_activity_logs_user_id` - Búsqueda por usuario
- `idx_activity_logs_action` - Búsqueda por acción
- `idx_activity_logs_entity_type` - Búsqueda por tipo de entidad
- `idx_activity_logs_created_at` - Ordenamiento cronológico
- `idx_activity_logs_user_role` - Filtrado por rol

**Uso principal:** Panel Admin → Logs - Para ver qué acciones realizan los publicistas y otros usuarios con permisos especiales.

### `special_events`
Eventos especiales: sorteos (rifas/giveaways) y eventos recurrentes (semanales). Separados de la tabla `events` principal para mantener la lógica diferenciada.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| event_type | TEXT | ✓ | 'sorteo' | Tipo: `sorteo`, `recurrente` |
| title | TEXT | ✓ | - | Título del evento |
| description | TEXT | - | - | Descripción |
| image_url | TEXT | - | - | Imagen del evento |
| location | TEXT | - | - | Lugar |
| address | TEXT | - | - | Dirección |
| zone_id | INTEGER | - | - | FK → zones |
| category_id | INTEGER | - | - | FK → categories |
| phone | TEXT | - | - | Teléfono de contacto |
| whatsapp | TEXT | - | - | WhatsApp |
| website | TEXT | - | - | Sitio web |
| price | REAL | - | 0 | Precio (0 = gratis) |
| **Campos Sorteo** |
| prize_description | TEXT | - | - | Descripción del premio |
| prize_value | REAL | - | - | Valor estimado del premio |
| max_participants | INTEGER | - | - | Máximo participantes (NULL = ilimitado) |
| draw_date | TEXT | - | - | Fecha del sorteo |
| draw_time | TEXT | - | - | Hora del sorteo |
| winners_count | INTEGER | - | 1 | Cantidad de ganadores |
| registration_deadline | TEXT | - | - | Fecha límite inscripción |
| **Campos Recurrente** |
| recurrence_day | INTEGER | - | - | Día semana (0=Dom, 1=Lun, ..., 6=Sab) |
| recurrence_time | TEXT | - | - | Hora del evento (HH:MM) |
| recurrence_start_date | TEXT | - | - | Fecha inicio recurrencia |
| recurrence_end_date | TEXT | - | - | Fecha fin recurrencia |
| recurrence_weeks | INTEGER | - | - | Semanas a generar |
| generated_event_ids | TEXT | - | - | JSON array de IDs generados |
| **Metadata** |
| author_id | INTEGER | ✓ | - | FK → users |
| status | TEXT | - | 'activo' | Estado: `activo`, `pausado`, `finalizado`, `cancelado` |
| is_featured | INTEGER | - | 0 | Destacado |
| created_at | TEXT | - | datetime('now') | Fecha creación |
| updated_at | TEXT | - | datetime('now') | Fecha actualización |

**Índices:**
- `idx_special_events_type` - Por tipo de evento
- `idx_special_events_author` - Por autor
- `idx_special_events_status` - Por estado
- `idx_special_events_draw_date` - Por fecha de sorteo
- `idx_special_events_category` - Por categoría
- `idx_special_events_zone` - Por zona

**Uso principal:** Panel Editor → Crear sorteos y eventos semanales recurrentes.

### `sorteo_participants`
Participantes registrados en sorteos.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| sorteo_id | INTEGER | ✓ | - | FK → special_events |
| user_id | INTEGER | ✓ | - | FK → users |
| status | TEXT | - | 'participando' | Estado: `participando`, `ganador`, `descalificado` |
| is_winner | INTEGER | - | 0 | Si es ganador |
| prize_claimed | INTEGER | - | 0 | Si reclamó el premio |
| claimed_at | TEXT | - | - | Fecha que reclamó |
| notes | TEXT | - | - | Notas/motivo descalificación |
| registered_at | TEXT | - | datetime('now') | Fecha registro |

**Índices:**
- `idx_sorteo_participants_sorteo` - Por sorteo
- `idx_sorteo_participants_user` - Por usuario
- `idx_sorteo_participants_winner` - Por ganadores

**Constraint:** `UNIQUE(sorteo_id, user_id)` - Un usuario solo puede participar una vez por sorteo.

---

## Relaciones Principales

```
users ─────┬───> news
           ├───> products
           ├───> events
           ├───> special_events ───> sorteo_participants
           ├───> videos
           ├───> video_playlists
           ├───> services
           ├───> accommodations
           ├───> gastronomy
           ├───> transport
           ├───> transport_private
           ├───> bus_lines
           ├───> points_of_interest
           └───> cinemas (owner_id - futuro)

video_playlists ───> video_playlist_items ───> videos

categories ────> news, products, events, movies, services,
                 accommodations, gastronomy, points_of_interest

zones ─────────> users, products, events, cinemas,
                 accommodations, gastronomy, transport, bus_lines

cinemas ───┬───> showtimes
movies ────┘

bus_lines ─────> bus_stops

products ──────> offers
```

---

## Notas de Implementación

### Imágenes
- Se almacenan como **base64** directamente en los campos `image_url`, `poster_url`, etc.
- También se puede usar R2 para almacenamiento externo (bucket: `excentrica-media`)
- Máximo 10MB por imagen
- Formatos: JPEG, PNG, GIF, WebP

### Estados de contenido
- `pending` - Pendiente de aprobación
- `approved` - Aprobado y visible
- `rejected` - Rechazado

### Fechas
- Formato ISO 8601: `YYYY-MM-DD` para fechas, `HH:MM` para horas
- Almacenadas como TEXT (SQLite no tiene tipo DATE nativo)
- Se usa `datetime('now')` como default

### Duplicación de tablas
- Existen dos tablas de alojamiento: `accommodation` (extendida) y `accommodations` (básica)
- Se recomienda migrar todo a `accommodation` en el futuro

---

## Próximas Mejoras Planificadas

1. **Rol `cinema`** - Permitir que dueños de cines gestionen su cartelera
2. **Notificaciones** - Sistema de notificaciones push
3. **Comentarios** - Sistema de comentarios en noticias/eventos
4. **Reservas** - Sistema de reservas para eventos/cines
5. **Unificar tablas** - Consolidar `accommodation` y `accommodations`

---

*Documento actualizado automáticamente - EXCENTRICA 2026*
