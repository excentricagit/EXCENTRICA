-- Migración: Sistema de Playlists de Videos
-- Fecha: 2026-01-28
-- Descripción: Crea las tablas para gestionar playlists de videos

-- Tabla principal de playlists
CREATE TABLE IF NOT EXISTS video_playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    cover_image TEXT,
    author_id INTEGER NOT NULL,
    is_public INTEGER DEFAULT 1,
    video_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de items (videos en playlists)
-- Un video puede estar en múltiples playlists
CREATE TABLE IF NOT EXISTS video_playlist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    video_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    added_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (playlist_id) REFERENCES video_playlists(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE(playlist_id, video_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_video_playlists_author ON video_playlists(author_id);
CREATE INDEX IF NOT EXISTS idx_video_playlists_slug ON video_playlists(slug);
CREATE INDEX IF NOT EXISTS idx_video_playlists_public ON video_playlists(is_public);
CREATE INDEX IF NOT EXISTS idx_video_playlist_items_playlist ON video_playlist_items(playlist_id);
CREATE INDEX IF NOT EXISTS idx_video_playlist_items_video ON video_playlist_items(video_id);
CREATE INDEX IF NOT EXISTS idx_video_playlist_items_position ON video_playlist_items(playlist_id, position);

-- Trigger para actualizar video_count al agregar item
CREATE TRIGGER IF NOT EXISTS update_playlist_count_insert
AFTER INSERT ON video_playlist_items
BEGIN
    UPDATE video_playlists
    SET video_count = (SELECT COUNT(*) FROM video_playlist_items WHERE playlist_id = NEW.playlist_id),
        updated_at = datetime('now')
    WHERE id = NEW.playlist_id;
END;

-- Trigger para actualizar video_count al eliminar item
CREATE TRIGGER IF NOT EXISTS update_playlist_count_delete
AFTER DELETE ON video_playlist_items
BEGIN
    UPDATE video_playlists
    SET video_count = (SELECT COUNT(*) FROM video_playlist_items WHERE playlist_id = OLD.playlist_id),
        updated_at = datetime('now')
    WHERE id = OLD.playlist_id;
END;
