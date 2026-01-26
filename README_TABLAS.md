# EXCENTRICA - Documentación de Tablas de Base de Datos

> **Base de datos:** Cloudflare D1 (SQLite)
> **Nombre:** excentrica-db
> **ID:** 7616d9fe-1043-4b69-9751-7026d89b8c81
> **Versión:** 1.4.0
> **Última actualización:** 2026-01-26

---

## Resumen de Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema |
| `news` | Noticias y artículos |
| `events` | Eventos y actividades |
| `videos` | Videos (YouTube, etc) |
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
| `audit_logs` | Logs de auditoría |

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
- `editor` - Puede crear/editar contenido
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

### `audit_logs`
Logs de auditoría.

| Campo | Tipo | NOT NULL | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | INTEGER | PK | - | ID único |
| user_id | INTEGER | - | - | FK → users |
| action | TEXT | ✓ | - | Acción realizada |
| entity_type | TEXT | - | - | Tipo de entidad afectada |
| entity_id | INTEGER | - | - | ID de la entidad |
| details | TEXT | - | - | Detalles JSON |
| ip_address | TEXT | - | - | IP del usuario |
| user_agent | TEXT | - | - | User agent del navegador |
| created_at | TEXT | - | datetime('now') | Fecha creación |

---

## Relaciones Principales

```
users ─────┬───> news
           ├───> products
           ├───> events
           ├───> videos
           ├───> services
           ├───> accommodations
           ├───> gastronomy
           ├───> transport
           ├───> transport_private
           ├───> bus_lines
           ├───> points_of_interest
           └───> cinemas (owner_id - futuro)

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
