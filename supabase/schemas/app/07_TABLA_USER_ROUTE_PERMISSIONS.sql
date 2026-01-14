-- ============================================
-- SCRIPT 07: TABLA USER_ROUTE_PERMISSIONS
-- ============================================
-- Permisos INDIVIDUALES por usuario (GRANT/DENY)
-- ✅ Incluye RLS y permisos de CRUD
-- ============================================

CREATE TABLE app.user_route_permissions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  
  -- Permiso
  permission_type app.permission_type NOT NULL,
  reason TEXT,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT user_route_permissions_unique UNIQUE (user_id, route_id)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_user_route_permissions_user_id ON app.user_route_permissions(user_id);
CREATE INDEX idx_user_route_permissions_route_id ON app.user_route_permissions(route_id);
CREATE INDEX idx_user_route_permissions_type ON app.user_route_permissions(permission_type);
CREATE INDEX idx_user_route_permissions_expires ON app.user_route_permissions(expires_at);

-- ============================================
-- TRIGGER updated_at
-- ============================================

CREATE TRIGGER set_user_route_permissions_updated_at
  BEFORE UPDATE ON app.user_route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- TRIGGER: Auto-asignar granted_by
-- ============================================

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

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.user_route_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Ver tus propios permisos O ser super_admin
CREATE POLICY "user_route_permissions_select_policy" ON app.user_route_permissions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- INSERT: Solo super_admin puede dar permisos individuales
CREATE POLICY "user_route_permissions_insert_policy" ON app.user_route_permissions
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

-- UPDATE: Solo super_admin puede actualizar permisos
CREATE POLICY "user_route_permissions_update_policy" ON app.user_route_permissions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- DELETE: Solo super_admin puede eliminar permisos
CREATE POLICY "user_route_permissions_delete_policy" ON app.user_route_permissions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- PERMISOS GRANT
-- ============================================

GRANT SELECT ON app.user_route_permissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.user_route_permissions TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.user_route_permissions IS 'Permisos individuales - GRANT (dar acceso extra) o DENY (bloquear)';
COMMENT ON COLUMN app.user_route_permissions.permission_type IS 'grant (dar acceso) o deny (bloquear)';
COMMENT ON COLUMN app.user_route_permissions.expires_at IS 'Fecha de expiración del permiso (opcional)';

-- ============================================
-- VERIFICAR
-- ============================================

SELECT COUNT(*) FROM app.user_route_permissions;
-- Debe ser 0 (aún no hay permisos individuales)
