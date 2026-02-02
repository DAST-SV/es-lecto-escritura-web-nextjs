-- supabase/schemas/app/auth/functions/is_super_admin.sql
-- ============================================================================
-- FUNCION: is_super_admin
-- DESCRIPCION: Verifica si un usuario tiene el rol de super administrador
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Utiliza la funcion has_role para verificar el rol super_admin
  RETURN app.has_role(p_user_id, 'super_admin'::app.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION app.is_super_admin IS 'Verifica si un usuario es super administrador de la plataforma';

-- Grant para que los usuarios autenticados puedan usar esta funcion
GRANT EXECUTE ON FUNCTION app.is_super_admin(UUID) TO authenticated;

SELECT 'AUTH: Funcion is_super_admin creada' AS status;
