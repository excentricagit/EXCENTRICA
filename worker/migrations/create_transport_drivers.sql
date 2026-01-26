-- Migración: Crear tabla transport_drivers
-- Datos privados de conductores para seguridad interna

CREATE TABLE IF NOT EXISTS transport_drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transport_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    dni TEXT,
    address TEXT,
    photo1 TEXT,
    photo2 TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (transport_id) REFERENCES transport(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transport_drivers_transport ON transport_drivers(transport_id);
