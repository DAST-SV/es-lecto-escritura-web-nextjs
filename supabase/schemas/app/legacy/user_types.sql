-- supabase/schemas/app/legacy/user_types.sql
-- ============================================================================
-- MÓDULO: LEGACY - USER TYPES
-- DESCRIPCIÓN: Tabla legacy para compatibilidad con código antiguo
-- VERSIÓN: 3.0
-- NOTA: Se mantiene por compatibilidad, usar app.roles en código nuevo
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- TABLA: user_types (LEGACY - Mantener compatibilidad)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.user_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_types_deleted_at ON app.user_types(deleted_at) WHERE deleted_at IS NULL;

COMMENT ON TABLE app.user_types IS 'Tabla legacy de tipos de usuario (usar app.roles en código nuevo)';

-- ============================================================================
-- VISTA: user_types activos
-- ============================================================================

CREATE OR REPLACE VIEW app.v_active_user_types AS
SELECT id, name, description, is_active, created_at, updated_at
FROM app.user_types
WHERE deleted_at IS NULL
ORDER BY id;

COMMENT ON VIEW app.v_active_user_types IS 'Vista de tipos de usuario activos (legacy)';

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

INSERT INTO app.user_types (name, description) VALUES
    ('Estudiante', 'Usuario que accede para aprender y mejorar lectoescritura'),
    ('Docente', 'Profesional educativo que guía y supervisa el progreso'),
    ('Padre/Tutor', 'Responsable que supervisa el progreso de menores'),
    ('Lector', 'Usuario independiente que utiliza la plataforma libremente'),
    ('Administrador', 'Usuario con permisos administrativos completos')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Módulo LEGACY instalado correctamente' AS status,
  (SELECT COUNT(*) FROM app.user_types) AS total_user_types,
  NOW() AS timestamp;
