-- ============================================
-- SCRIPT 01: TABLA DE ROLES
-- ============================================
-- Define los roles del sistema (admin, teacher, student, etc.)
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS app.roles CASCADE;

-- ============================================
-- CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS app.roles (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  
  -- Información
  description TEXT,
  hierarchy_level INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_role BOOLEAN NOT NULL DEFAULT false,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT roles_name_lowercase CHECK (name = LOWER(name)),
  CONSTRAINT roles_hierarchy_positive CHECK (hierarchy_level >= 0)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON app.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON app.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_hierarchy ON app.roles(hierarchy_level);

-- ============================================
-- TRIGGER updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_roles_updated_at ON app.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "roles_insert_policy" ON app.roles;
CREATE POLICY "roles_insert_policy" ON app.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

DROP POLICY IF EXISTS "roles_update_policy" ON app.roles;
CREATE POLICY "roles_update_policy" ON app.roles
  FOR UPDATE
  TO authenticated
  USING (
    NOT is_system_role
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO app.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('super_admin', 'Super Administrador', 'Control total del sistema', 100, true),
  ('admin', 'Administrador', 'Gestión general del sistema', 90, false),
  ('teacher', 'Profesor', 'Gestión de clases y estudiantes', 50, false),
  ('student', 'Estudiante', 'Acceso a contenido educativo', 10, false),
  ('guest', 'Invitado', 'Acceso limitado solo lectura', 1, false)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.roles IS 'Roles del sistema - Define permisos base por grupo de usuarios';
COMMENT ON COLUMN app.roles.id IS 'UUID único del rol';
COMMENT ON COLUMN app.roles.name IS 'Nombre técnico del rol (snake_case, único)';
COMMENT ON COLUMN app.roles.display_name IS 'Nombre visible para usuarios';
COMMENT ON COLUMN app.roles.hierarchy_level IS 'Nivel jerárquico (mayor = más permisos)';
COMMENT ON COLUMN app.roles.is_system_role IS 'Si es true, no se puede modificar ni eliminar';

-- ============================================
-- VERIFICAR
-- ============================================

-- SELECT * FROM app.roles ORDER BY hierarchy_level DESC;
