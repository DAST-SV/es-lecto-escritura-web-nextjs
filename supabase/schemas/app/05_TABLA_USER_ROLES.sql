-- ============================================
-- SCRIPT 05: TABLA USER_ROLES
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

-- Índices
CREATE INDEX idx_user_roles_user_id ON app.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON app.user_roles(role_id);
CREATE INDEX idx_user_roles_is_active ON app.user_roles(is_active);
CREATE INDEX idx_user_roles_revoked_at ON app.user_roles(revoked_at);

-- Trigger: updated_at
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- Trigger: assigned_by y revoked_by
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

-- Función auxiliar SIN RLS
CREATE OR REPLACE FUNCTION app.is_super_admin(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_roles ur
    JOIN app.roles r ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id
      AND r.name = 'super_admin'
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
  );
$$;

-- RLS
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas SIN recursión
CREATE POLICY "user_roles_select_policy" ON app.user_roles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR app.is_super_admin(auth.uid())
  );

CREATE POLICY "user_roles_insert_policy" ON app.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "user_roles_update_policy" ON app.user_roles
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "user_roles_delete_policy" ON app.user_roles
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION app.is_super_admin(uuid) TO authenticated;

-- Comentarios
COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios';

-- Verificar
SELECT COUNT(*) FROM app.user_roles;