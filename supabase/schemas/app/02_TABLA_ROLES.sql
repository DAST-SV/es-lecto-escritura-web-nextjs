-- ============================================
-- SCRIPT 02: TABLA ROLES
-- ============================================

CREATE TABLE app.roles (
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

-- Índices
CREATE INDEX idx_roles_name ON app.roles(name);
CREATE INDEX idx_roles_is_active ON app.roles(is_active);
CREATE INDEX idx_roles_hierarchy ON app.roles(hierarchy_level);

-- Trigger
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;

-- Política: SELECT (todos pueden ver roles activos)
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Datos iniciales
INSERT INTO app.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('super_admin', 'Super Administrador', 'Control total del sistema', 100, true),
  ('admin', 'Administrador', 'Gestión general del sistema', 90, false),
  ('teacher', 'Profesor', 'Gestión de clases y estudiantes', 50, false),
  ('student', 'Estudiante', 'Acceso a contenido educativo', 10, false),
  ('guest', 'Invitado', 'Acceso limitado solo lectura', 1, false);

-- Permisos
GRANT SELECT ON app.roles TO authenticated;

-- Comentarios
COMMENT ON TABLE app.roles IS 'Roles del sistema';
COMMENT ON COLUMN app.roles.hierarchy_level IS 'Nivel jerárquico (mayor = más permisos)';

-- Verificar
SELECT * FROM app.roles ORDER BY hierarchy_level DESC;