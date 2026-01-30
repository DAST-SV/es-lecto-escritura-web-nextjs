-- supabase/schemas/app/auth/tables/roles.sql
-- ============================================================================
-- TABLA: roles
-- DESCRIPCIÓN: Catálogo de roles del sistema
-- ============================================================================

SET search_path TO app, public;

CREATE TABLE IF NOT EXISTS app.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name app.user_role NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_role BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT roles_hierarchy_positive CHECK (hierarchy_level >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_name ON app.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON app.roles(is_active);

COMMENT ON TABLE app.roles IS 'Catálogo de roles del sistema';

-- Datos iniciales
INSERT INTO app.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('super_admin'::app.user_role, 'Super Administrador', 'Control total de la plataforma', 100, true),
  ('school'::app.user_role, 'Administrador Escolar', 'Gestión de escuela y personal', 80, false),
  ('teacher'::app.user_role, 'Maestro/a', 'Gestión de clases y estudiantes', 50, false),
  ('parent'::app.user_role, 'Padre/Madre', 'Seguimiento de hijos', 30, false),
  ('student'::app.user_role, 'Estudiante', 'Acceso a contenido educativo', 10, false),
  ('individual'::app.user_role, 'Usuario Individual', 'Aprendizaje autónomo', 10, false)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = NOW();

SELECT 'AUTH: Tabla roles creada con' || (SELECT COUNT(*) FROM app.roles) || ' roles' AS status;
