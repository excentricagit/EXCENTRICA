# EXCENTRICA - Documentación de Tablas de Base de Datos

> **Base de datos:** Cloudflare D1 (SQLite)
> **Versión:** 1.3.0
> **Última actualización:** 2026-01-26

---

## Índice

1. [Usuarios y Autenticación](#usuarios-y-autenticación)
2. [Contenido Principal](#contenido-principal)
3. [Comercio y Servicios](#comercio-y-servicios)
4. [Entretenimiento](#entretenimiento)
5. [Configuración y Sistema](#configuración-y-sistema)

---

## Usuarios y Autenticación

### `users`
Usuarios del sistema (admins, editores, usuarios, y futuros roles como cines).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| username | TEXT UNIQUE | Nombre de usuario |
| email | TEXT UNIQUE | Correo electrónico |
| password_hash | TEXT | Contraseña hasheada |
| name | TEXT | Nombre completo |
| phone | TEXT | Teléfono |
| avatar_url | TEXT | URL del avatar |
| bio | TEXT | Biografía |
| zone_id | INTEGER FK | Zona geográfica |
| role | TEXT | Rol: `admin`, `editor`, `user`, `cinema` (futuro) |
| email_verified | INTEGER | 0/1 |
| is_active | INTEGER | 0/1 |
| created_at | TEXT | Fecha creación |
| last_login | TEXT | Último login |

**Roles disponibles:**
- `admin` - Acceso total
- `editor` - Puede crear/editar contenido
- `user` - Usuario regular
- `cinema` - (Futuro) Dueño de cine, solo gestiona su cartelera

---

## Contenido Principal

### `news`
Noticias y artículos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| slug | TEXT UNIQUE | URL amigable |
| summary | TEXT | Resumen |
| content | TEXT | Contenido completo |
| image_url | TEXT | Imagen principal (base64 o URL) |
| images | TEXT | Galería JSON |
| category_id | INTEGER FK | Categoría |
| author_id | INTEGER FK | Autor |
| status | TEXT | `pending`, `approved`, `rejected` |
| featured | INTEGER | Destacado 0/1 |
| like_count | INTEGER | Contador likes |
| view_count | INTEGER | Contador vistas |
| published_at | TEXT | Fecha publicación |

### `events`
Eventos y actividades.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| description | TEXT | Descripción |
| image_url | TEXT | Imagen (base64) |
| images | TEXT | Galería JSON |
| category_id | INTEGER FK | Categoría |
| author_id | INTEGER FK | Autor |
| zone_id | INTEGER FK | Zona |
| location | TEXT | Nombre del lugar |
| address | TEXT | Dirección |
| latitude/longitude | REAL | Coordenadas |
| event_date | TEXT | Fecha del evento |
| event_time | TEXT | Hora inicio |
| end_date/end_time | TEXT | Fecha/hora fin |
| price | REAL | Precio entrada |
| ticket_url | TEXT | Link de tickets |
| phone | TEXT | Teléfono contacto |
| whatsapp | TEXT | WhatsApp |
| website | TEXT | Sitio web |
| status | TEXT | `pending`, `approved`, `rejected` |
| featured | INTEGER | Destacado 0/1 |

### `videos`
Videos (YouTube, etc).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| description | TEXT | Descripción |
| video_url | TEXT | URL del video |
| thumbnail_url | TEXT | Miniatura |
| category_id | INTEGER FK | Categoría |
| author_id | INTEGER FK | Autor |
| status | TEXT | Estado |
| featured | INTEGER | Destacado |

---

## Comercio y Servicios

### `products`
Productos del marketplace.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| description | TEXT | Descripción |
| price | REAL | Precio |
| original_price | REAL | Precio original (para descuentos) |
| image_url | TEXT | Imagen principal |
| front_image_url | TEXT | Imagen frontal |
| back_image_url | TEXT | Imagen trasera |
| images | TEXT | Galería JSON |
| category_id | INTEGER FK | Categoría |
| author_id | INTEGER FK | Vendedor |
| zone_id | INTEGER FK | Zona |
| address | TEXT | Dirección |
| phone | TEXT | Teléfono |
| whatsapp | TEXT | WhatsApp |
| condition | TEXT | `new`, `used`, `refurbished` |
| status | TEXT | Estado |
| accepts_offers | INTEGER | Acepta ofertas 0/1 |

### `services`
Servicios profesionales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| description | TEXT | Descripción |
| image_url | TEXT | Imagen |
| category_id | INTEGER FK | Categoría |
| author_id | INTEGER FK | Proveedor |
| zone_id | INTEGER FK | Zona |
| phone/email/website | TEXT | Contacto |
| price_from/price_to | REAL | Rango de precios |
| status | TEXT | Estado |

### `accommodations`
Alojamientos y hospedajes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| name | TEXT | Nombre |
| description | TEXT | Descripción |
| image_url | TEXT | Imagen |
| zone_id | INTEGER FK | Zona |
| address | TEXT | Dirección |
| latitude/longitude | REAL | Coordenadas |
| phone/email/website | TEXT | Contacto |
| price_per_night | REAL | Precio por noche |
| amenities | TEXT | Servicios JSON |
| status | TEXT | Estado |

### `gastronomy`
Restaurantes y locales de comida.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| name | TEXT | Nombre |
| description | TEXT | Descripción |
| image_url | TEXT | Imagen |
| zone_id | INTEGER FK | Zona |
| address | TEXT | Dirección |
| phone/website/instagram | TEXT | Contacto |
| price_range | TEXT | Rango de precios |
| schedule | TEXT | Horarios |
| has_delivery | INTEGER | Tiene delivery 0/1 |
| has_takeaway | INTEGER | Tiene takeaway 0/1 |
| specialties | TEXT | Especialidades |

### `transport` / `transport_private`
Transporte público y privado (remises, taxis).

---

## Entretenimiento

### `cinemas`
Cines (establecimientos).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| name | TEXT | Nombre del cine |
| slug | TEXT UNIQUE | URL amigable |
| description | TEXT | Descripción |
| logo_url | TEXT | Logo (base64) |
| image_url | TEXT | Imagen fachada |
| address | TEXT | Dirección |
| latitude/longitude | REAL | Coordenadas |
| zone_id | INTEGER FK | Zona |
| phone | TEXT | Teléfono |
| whatsapp | TEXT | WhatsApp |
| website | TEXT | Sitio web |
| instagram | TEXT | Instagram |
| total_screens | INTEGER | Cantidad de salas |
| features | TEXT | Características JSON (3D, IMAX, etc) |
| schedule | TEXT | Horarios de atención |
| owner_id | INTEGER FK | (Futuro) Usuario dueño del cine |
| status | TEXT | `pending`, `approved`, `rejected` |
| is_active | INTEGER | Activo 0/1 |
| created_at | TEXT | Fecha creación |

**Nota:** El campo `owner_id` está preparado para cuando los cines puedan gestionar su propia cartelera.

### `movies`
Películas en cartelera.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| original_title | TEXT | Título original |
| slug | TEXT UNIQUE | URL amigable |
| synopsis | TEXT | Sinopsis |
| poster_url | TEXT | Poster (base64) |
| backdrop_url | TEXT | Imagen de fondo |
| trailer_url | TEXT | URL trailer YouTube |
| duration | INTEGER | Duración en minutos |
| rating | TEXT | Clasificación (ATP, +13, +16, +18) |
| genre | TEXT | Géneros (JSON array) |
| director | TEXT | Director |
| cast | TEXT | Actores principales (JSON) |
| release_date | TEXT | Fecha de estreno |
| country | TEXT | País de origen |
| language | TEXT | Idioma original |
| imdb_id | TEXT | ID de IMDB (opcional) |
| status | TEXT | `now_showing`, `coming_soon`, `archived` |
| is_active | INTEGER | Activo 0/1 |
| created_at | TEXT | Fecha creación |

### `showtimes`
Funciones/Cartelera (relaciona películas con cines).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| cinema_id | INTEGER FK | Cine |
| movie_id | INTEGER FK | Película |
| screen_number | INTEGER | Número de sala |
| show_date | TEXT | Fecha de la función |
| show_time | TEXT | Hora de la función |
| format | TEXT | `2D`, `3D`, `IMAX`, `4DX` |
| language | TEXT | `subtitulada`, `doblada`, `original` |
| price | REAL | Precio entrada |
| price_promo | REAL | Precio promocional |
| available_seats | INTEGER | Asientos disponibles |
| is_active | INTEGER | Activo 0/1 |
| valid_from | TEXT | Válido desde |
| valid_until | TEXT | Válido hasta |
| created_at | TEXT | Fecha creación |

**Índice:** `(cinema_id, movie_id, show_date)` para búsquedas rápidas.

### `points_of_interest`
Puntos de interés turístico.

---

## Configuración y Sistema

### `categories`
Categorías por sección.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| name | TEXT | Nombre |
| slug | TEXT | URL amigable |
| section | TEXT | Sección: `noticias`, `productos`, `eventos`, `cine`, etc |
| icon | TEXT | Emoji icono |
| is_active | INTEGER | Activo 0/1 |

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

### `zones`
Zonas geográficas de Santiago del Estero.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| name | TEXT | Nombre |
| slug | TEXT UNIQUE | URL amigable |
| description | TEXT | Descripción |
| is_active | INTEGER | Activo 0/1 |

**Zonas predefinidas:** Capital, La Banda, Termas de Río Hondo, Añatuya, Frías, Interior.

### `likes`
Sistema de likes polimórfico.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| user_id | INTEGER FK | Usuario |
| content_type | TEXT | Tipo: `news`, `product`, `event`, `movie`, etc |
| content_id | INTEGER | ID del contenido |

### `media`
Archivos multimedia.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| key | TEXT UNIQUE | Identificador único |
| url | TEXT | URL o base64 |
| filename | TEXT | Nombre archivo |
| content_type | TEXT | MIME type |
| size | INTEGER | Tamaño en bytes |
| uploaded_by | INTEGER FK | Usuario |

### `ads`
Sistema de publicidad.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | ID único |
| title | TEXT | Título |
| video_url | TEXT | URL del video |
| link_url | TEXT | URL destino |
| position | TEXT | `sidebar`, `header`, `footer`, `interstitial` |
| priority | INTEGER | Orden de aparición |
| impressions | INTEGER | Contador impresiones |
| clicks | INTEGER | Contador clicks |
| start_date/end_date | TEXT | Período activo |

### `settings`
Configuraciones del sistema.

### `statistics`
Estadísticas diarias.

### `audit_logs`
Logs de auditoría.

---

## Relaciones Principales

```
users ─────┬───> news
           ├───> products
           ├───> events
           ├───> videos
           └───> cinemas (owner_id - futuro)

categories ────> news, products, events, movies

zones ─────────> users, products, events, cinemas, etc.

cinemas ───┬───> showtimes
movies ────┘
```

---

## Notas de Implementación

### Imágenes
- Se almacenan como **base64** directamente en los campos `image_url`, `poster_url`, etc.
- Máximo 10MB por imagen
- Formatos: JPEG, PNG, GIF, WebP

### Estados de contenido
- `pending` - Pendiente de aprobación
- `approved` - Aprobado y visible
- `rejected` - Rechazado

### Fechas
- Formato ISO 8601: `YYYY-MM-DD` para fechas, `HH:MM` para horas
- Almacenadas como TEXT (SQLite no tiene tipo DATE nativo)

---

## Próximas Mejoras Planificadas

1. **Rol `cinema`** - Permitir que dueños de cines gestionen su cartelera
2. **Notificaciones** - Sistema de notificaciones push
3. **Comentarios** - Sistema de comentarios en noticias/eventos
4. **Reservas** - Sistema de reservas para eventos/cines

---

*Documento generado automáticamente - EXCENTRICA 2026*
