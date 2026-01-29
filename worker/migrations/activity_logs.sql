-- =============================================
-- ACTIVITY LOGS - Sistema de auditoria
-- =============================================
-- Registra todas las acciones importantes de los usuarios
-- para control, trazabilidad y resolucion de disputas

CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Usuario que realizo la accion
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,

    -- Accion realizada
    action TEXT NOT NULL,  -- create, update, delete, approve, reject, activate, deactivate, login, etc.

    -- Entidad afectada
    entity_type TEXT NOT NULL,  -- ad, event, registration, user, news, product, etc.
    entity_id INTEGER,
    entity_name TEXT,  -- Titulo/nombre para referencia rapida

    -- Detalles adicionales (JSON)
    details TEXT,  -- {"old_status": "pending", "new_status": "approved", ...}

    -- Metadata
    ip_address TEXT,
    user_agent TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_role ON activity_logs(user_role);

-- Ejemplos de registros:
-- INSERT INTO activity_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, details)
-- VALUES (5, 'Juan Perez', 'publicista', 'approve', 'registration', 45, 'Inscripcion a Fiesta X', '{"event_id": 12}');
--
-- INSERT INTO activity_logs (user_id, user_name, user_role, action, entity_type, entity_id, entity_name, details)
-- VALUES (5, 'Juan Perez', 'publicista', 'deactivate', 'ad', 23, 'Promo Verano', '{"reason": "contenido inapropiado"}');
