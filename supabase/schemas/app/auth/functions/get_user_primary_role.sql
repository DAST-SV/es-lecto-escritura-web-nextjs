-- ============================================================================
-- FUNCIÓN: get_user_primary_role
-- DESCRIPCIÓN: Obtiene el rol principal de un usuario
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.get_user_primary_role(p_user_id UUID)
RETURNS app.user_role AS $$
DECLARE
  v_role app.user_role;
BEGIN
  SELECT r.name INTO v_role
  FROM app.user_roles ur
  JOIN app.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ORDER BY r.hierarchy_level DESC
  LIMIT 1;
  RETURN COALESCE(v_role, 'individual'::app.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION app.get_user_primary_role IS 'Obtiene el rol principal de un usuario basado en jerarquía';

SELECT 'AUTH: Función get_user_primary_role creada' AS status;
