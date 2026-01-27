-- ============================================
-- TABLA: user_route_permissions
-- Archivo: permissions/tables/user_route_permissions.sql
-- ============================================

CREATE TABLE app.user_route_permissions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,

  -- Permiso
  permission_type app.permission_type NOT NULL,
  reason TEXT,

  -- Idioma específico (NULL = todos los idiomas)
  language_code app.language_code NULL,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,

  -- Constraints (incluye language_code)
  CONSTRAINT user_route_permissions_unique UNIQUE (user_id, route_id, language_code)
);

-- Índices
CREATE INDEX idx_user_route_permissions_user_id ON app.user_route_permissions(user_id);
CREATE INDEX idx_user_route_permissions_route_id ON app.user_route_permissions(route_id);
CREATE INDEX idx_user_route_permissions_type ON app.user_route_permissions(permission_type);
CREATE INDEX idx_user_route_permissions_expires ON app.user_route_permissions(expires_at);
CREATE INDEX idx_user_route_permissions_language ON app.user_route_permissions(language_code);

-- Trigger: updated_at
CREATE TRIGGER set_user_route_permissions_updated_at
  BEFORE UPDATE ON app.user_route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- Trigger: granted_by
CREATE OR REPLACE FUNCTION app.set_user_route_permissions_granted_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.granted_by IS NULL THEN
    NEW.granted_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_user_route_permissions_granted_by_trigger
  BEFORE INSERT ON app.user_route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_user_route_permissions_granted_by();

-- RLS
ALTER TABLE app.user_route_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_route_permissions_select_policy" ON app.user_route_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR app.is_super_admin(auth.uid())
  );

CREATE POLICY "user_route_permissions_insert_policy" ON app.user_route_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "user_route_permissions_update_policy" ON app.user_route_permissions
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "user_route_permissions_delete_policy" ON app.user_route_permissions
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_route_permissions TO authenticated;

-- Comentarios
COMMENT ON TABLE app.user_route_permissions IS 'Permisos individuales (GRANT/DENY)';
COMMENT ON COLUMN app.user_route_permissions.language_code IS 'Idioma específico. NULL = todos los idiomas';
