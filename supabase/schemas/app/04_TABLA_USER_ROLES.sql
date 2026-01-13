-- ============================================
-- SCRIPT 04: TABLA USER_ROLES
-- ============================================
-- Asigna roles a usuarios específicos
-- Un usuario puede tener múltiples roles
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS app.user_roles CASCADE;

-- ============================================
-- CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS app.user_roles (
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

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON app.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON app.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON app.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_revoked_at ON app.user_roles(revoked_at);

-- ============================================
-- TRIGGER updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Ver tus propios roles O ser super_admin
DROP POLICY IF EXISTS "user_roles_select_policy" ON app.user_roles;
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
DROP POLICY IF EXISTS "user_roles_insert_policy" ON app.user_roles;
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
DROP POLICY IF EXISTS "user_roles_update_policy" ON app.user_roles;
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

-- ============================================
-- TRIGGER: Auto-asignar assigned_by
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

DROP TRIGGER IF EXISTS set_user_roles_assigned_by_trigger ON app.user_roles;
CREATE TRIGGER set_user_roles_assigned_by_trigger
  BEFORE INSERT OR UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_user_roles_assigned_by();

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios - Un usuario puede tener múltiples roles';
COMMENT ON COLUMN app.user_roles.user_id IS 'Usuario al que se le asigna el rol';
COMMENT ON COLUMN app.user_roles.role_id IS 'Rol asignado';
COMMENT ON COLUMN app.user_roles.is_active IS 'Si el rol está activo para este usuario';
COMMENT ON COLUMN app.user_roles.revoked_at IS 'Fecha en que se revocó el rol (soft delete)';
COMMENT ON COLUMN app.user_roles.assigned_by IS 'Usuario que asignó el rol';
COMMENT ON COLUMN app.user_roles.revoked_by IS 'Usuario que revocó el rol';

-- ============================================
-- VERIFICAR
-- ============================================

-- SELECT 
--   ur.id,
--   au.email,
--   r.name as role_name,
--   r.display_name as role_display_name,
--   ur.is_active,
--   ur.created_at
-- FROM app.user_roles ur
-- JOIN auth.users au ON au.id = ur.user_id
-- JOIN app.roles r ON r.id = ur.role_id
-- WHERE ur.revoked_at IS NULL
-- ORDER BY au.email, r.hierarchy_level DESC;
