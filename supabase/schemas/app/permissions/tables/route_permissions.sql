-- supabase/schemas/app/permissions/tables/route_permissions.sql
-- ============================================
-- TABLA: route_permissions
-- ============================================

CREATE TABLE app.route_permissions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,

  -- Idioma específico (NULL = todos los idiomas)
  language_code app.language_code NULL,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT route_permissions_unique UNIQUE (role_name, route_id, language_code)
);

-- Índices
CREATE INDEX idx_route_permissions_role_name ON app.route_permissions(role_name);
CREATE INDEX idx_route_permissions_route_id ON app.route_permissions(route_id);
CREATE INDEX idx_route_permissions_is_active ON app.route_permissions(is_active);
CREATE INDEX idx_route_permissions_language ON app.route_permissions(language_code);

-- Trigger
CREATE TRIGGER set_route_permissions_updated_at
  BEFORE UPDATE ON app.route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.route_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_permissions_select_policy" ON app.route_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "route_permissions_insert_policy" ON app.route_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "route_permissions_update_policy" ON app.route_permissions
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_permissions_delete_policy" ON app.route_permissions
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.route_permissions TO authenticated;

-- Comentarios
COMMENT ON TABLE app.route_permissions IS 'Permisos por ROL';
COMMENT ON COLUMN app.route_permissions.language_code IS 'Idioma específico. NULL = todos los idiomas';
