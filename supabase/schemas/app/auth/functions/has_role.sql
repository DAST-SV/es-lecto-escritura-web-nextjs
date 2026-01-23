-- ============================================================================
-- FUNCIÓN: has_role
-- DESCRIPCIÓN: Verifica si un usuario tiene un rol específico
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.has_role(p_user_id UUID, p_role app.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = p_role
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION app.has_role IS 'Verifica si un usuario tiene un rol específico activo';

SELECT 'AUTH: Función has_role creada' AS status;
