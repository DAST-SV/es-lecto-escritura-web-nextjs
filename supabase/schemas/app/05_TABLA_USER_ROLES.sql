-- ============================================
-- SCRIPT 05: TABLA USER_ROLES
-- ============================================
-- Asigna roles a usuarios
-- ✅ Incluye RLS y permisos de CRUD
-- ============================================

CREATE TABLE app.user_roles (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
  
  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  revoked_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  notes TEXT,
  
  -- Constraints
  CONSTRAINT user_roles_unique UNIQUE (user_id, role_id)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_user_roles_user_id ON app.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON app.user_roles(role_id);
CREATE INDEX idx_user_roles_is_active ON app.user_roles(is_active);
CREATE INDEX idx_user_roles_revoked_at ON app.user_roles(revoked_at);

-- ============================================
-- TRIGGER updated_at
-- ============================================

CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- TRIGGER: Auto-asignar assigned_by y revoked_by
-- ============================================

CREATE OR REPLACE FUNCTION app.set_user_roles_assigned_by()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_by IS NULL THEN
    NEW.assigned_by = auth.uid();
  END IF;
  
  IF TG_OP = 'UPDATE' AND NEW.revoked_at IS NOT NULL AND OLD.revoked_at IS NULL THEN
    NEW.revoked_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_user_roles_assigned_by_trigger
  BEFORE INSERT OR UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_user_roles_assigned_by();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Ver tus propios roles O ser super_admin
CREATE POLICY "user_roles_select_policy" ON app.user_roles
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

-- INSERT: Solo super_admin puede asignar roles
CREATE POLICY "user_roles_insert_policy" ON app.user_roles
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

-- UPDATE: Solo super_admin puede actualizar roles
CREATE POLICY "user_roles_update_policy" ON app.user_roles
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

-- DELETE: Solo super_admin puede eliminar roles
CREATE POLICY "user_roles_delete_policy" ON app.user_roles
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

GRANT SELECT ON app.user_roles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.user_roles TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios - Un usuario puede tener múltiples roles';
COMMENT ON COLUMN app.user_roles.revoked_at IS 'Fecha en que se revocó el rol (soft delete)';
COMMENT ON COLUMN app.user_roles.assigned_by IS 'Usuario que asignó el rol';

-- ============================================
-- VERIFICAR
-- ============================================

SELECT COUNT(*) FROM app.user_roles;
-- Debe ser 0 (aún no hay usuarios con roles)
