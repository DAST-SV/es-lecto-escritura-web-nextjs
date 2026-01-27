-- ============================================
-- TABLA: role_language_access
-- Archivo: role_language_access/tables/role_language_access.sql
-- ============================================

CREATE TABLE app.role_language_access (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT role_language_access_unique UNIQUE (role_name, language_code)
);

-- Índices
CREATE INDEX idx_role_language_access_role_name ON app.role_language_access(role_name);
CREATE INDEX idx_role_language_access_language ON app.role_language_access(language_code);
CREATE INDEX idx_role_language_access_is_active ON app.role_language_access(is_active);

-- Trigger
CREATE TRIGGER set_role_language_access_updated_at
  BEFORE UPDATE ON app.role_language_access
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.role_language_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_language_access_select_policy" ON app.role_language_access
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "role_language_access_insert_policy" ON app.role_language_access
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "role_language_access_update_policy" ON app.role_language_access
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "role_language_access_delete_policy" ON app.role_language_access
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.role_language_access TO authenticated;

-- Comentarios
COMMENT ON TABLE app.role_language_access IS 'Idiomas permitidos por rol';
