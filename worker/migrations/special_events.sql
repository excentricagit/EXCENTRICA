-- =============================================
-- SPECIAL EVENTS - Sorteos y Eventos Recurrentes
-- Migracion: special_events.sql
-- Fecha: 2026-01-29
-- =============================================

-- Tabla para eventos especiales (sorteos, eventos recurrentes/semanales)
CREATE TABLE IF NOT EXISTS special_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Tipo de evento especial
    event_type TEXT NOT NULL DEFAULT 'sorteo',  -- 'sorteo', 'recurrente'

    -- Informacion basica (similar a events)
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,

    -- Ubicacion
    location TEXT,
    address TEXT,
    zone_id INTEGER,

    -- Categoria
    category_id INTEGER,

    -- Contacto
    phone TEXT,
    whatsapp TEXT,
    website TEXT,

    -- Precio (0 = gratis)
    price REAL DEFAULT 0,

    -- =============================================
    -- CAMPOS PARA SORTEOS
    -- =============================================
    prize_description TEXT,           -- Descripcion del premio
    prize_value REAL,                 -- Valor estimado del premio
    max_participants INTEGER,         -- Maximo de participantes (NULL = ilimitado)
    draw_date TEXT,                   -- Fecha del sorteo
    draw_time TEXT,                   -- Hora del sorteo
    winners_count INTEGER DEFAULT 1,  -- Cantidad de ganadores
    registration_deadline TEXT,       -- Fecha limite para inscribirse

    -- =============================================
    -- CAMPOS PARA EVENTOS RECURRENTES
    -- =============================================
    recurrence_day INTEGER,           -- Dia de la semana (0=Domingo, 1=Lunes, ..., 6=Sabado)
    recurrence_time TEXT,             -- Hora del evento recurrente (HH:MM)
    recurrence_start_date TEXT,       -- Fecha de inicio de la recurrencia
    recurrence_end_date TEXT,         -- Fecha fin de la recurrencia
    recurrence_weeks INTEGER,         -- Cantidad de semanas a generar
    generated_event_ids TEXT,         -- JSON array con IDs de eventos generados

    -- =============================================
    -- METADATA
    -- =============================================
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'activo',     -- 'activo', 'pausado', 'finalizado', 'cancelado'
    is_featured INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE SET NULL
);

-- Tabla de participantes en sorteos
CREATE TABLE IF NOT EXISTS sorteo_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sorteo_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    -- Estado del participante
    status TEXT DEFAULT 'participando',  -- 'participando', 'ganador', 'descalificado'

    -- Datos del ganador
    is_winner INTEGER DEFAULT 0,
    prize_claimed INTEGER DEFAULT 0,
    claimed_at TEXT,

    -- Notas (motivo de descalificacion, etc)
    notes TEXT,

    registered_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (sorteo_id) REFERENCES special_events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(sorteo_id, user_id)
);

-- Indices para special_events
CREATE INDEX IF NOT EXISTS idx_special_events_type ON special_events(event_type);
CREATE INDEX IF NOT EXISTS idx_special_events_author ON special_events(author_id);
CREATE INDEX IF NOT EXISTS idx_special_events_status ON special_events(status);
CREATE INDEX IF NOT EXISTS idx_special_events_draw_date ON special_events(draw_date);
CREATE INDEX IF NOT EXISTS idx_special_events_category ON special_events(category_id);
CREATE INDEX IF NOT EXISTS idx_special_events_zone ON special_events(zone_id);

-- Indices para sorteo_participants
CREATE INDEX IF NOT EXISTS idx_sorteo_participants_sorteo ON sorteo_participants(sorteo_id);
CREATE INDEX IF NOT EXISTS idx_sorteo_participants_user ON sorteo_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_sorteo_participants_winner ON sorteo_participants(is_winner);
