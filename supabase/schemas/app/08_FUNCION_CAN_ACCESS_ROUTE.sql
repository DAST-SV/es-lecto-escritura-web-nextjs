-- ============================================
-- SCRIPT 08: FUNCIÓN CAN_ACCESS_ROUTE
-- ============================================
-- Verifica si un usuario puede acceder a una ruta
-- Lógica: DENY > GRANT > ROL
-- ============================================

-- Eliminar función si existe
DROP FUNCTION IF EXISTS app.can_access_route(uuid, varchar, varchar);
DROP FUNCTION IF EXISTS public.can_access_route(uuid, varchar, varchar);

-- ============================================
-- CREAR FUNCIÓN EN SCHEMA APP
-- ============================================

CREATE OR REPLACE FUNCTION app.can_access_route(
  p_user_id uuid,
  p_pathname varchar,
  p_language_code varchar DEFAULT 'es'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, app, auth
AS $$
DECLARE
  v_route_id uuid;
  v_has_deny boolean;
  v_has_grant boolean;
  v_has_from_role boolean;
  v_is_public boolean;
BEGIN
  -- 1. Buscar la ruta (por pathname o traducción)
  SELECT r.id, r.is_public INTO v_route_id, v_is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt ON rt.route_id = r.id AND rt.language_code = p_language_code::app.language_code
  WHERE (r.pathname = p_pathname OR rt.translated_path = p_pathname)
    AND r.is_active = true
    AND r.deleted_at IS NULL
  LIMIT 1;

  -- Si no existe la ruta, denegar
  IF v_route_id IS NULL THEN
    RETURN false;
  END IF;

  -- Si es ruta pública, permitir
  IF v_is_public = true THEN
    RETURN true;
  END IF;

  -- Si no hay usuario, denegar
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. Verificar DENY individual
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
  ) INTO v_has_deny;

  -- Si tiene DENY, bloquear
  IF v_has_deny THEN
    RETURN false;
  END IF;

  -- 3. Verificar GRANT individual
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
  ) INTO v_has_grant;

  -- Si tiene GRANT, permitir
  IF v_has_grant THEN
    RETURN true;
  END IF;

  -- 4. Verificar permisos por ROL
  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.route_permissions rp ON rp.role_name = (
      SELECT r.name FROM app.roles r WHERE r.id = ur.role_id
    )
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
      AND rp.route_id = v_route_id
      AND rp.is_active = true
  ) INTO v_has_from_role;

  -- Retornar resultado
  RETURN v_has_from_role;
END;
$$;

-- ============================================
-- CREAR WRAPPER EN PUBLIC
-- ============================================

CREATE OR REPLACE FUNCTION public.can_access_route(
  p_user_id uuid,
  p_pathname varchar,
  p_language_code varchar DEFAULT 'es'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN app.can_access_route(p_user_id, p_pathname, p_language_code);
END;
$$;

-- ============================================
-- DAR PERMISOS
-- ============================================

GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, varchar, varchar) TO authenticated;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, varchar, varchar) TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON FUNCTION app.can_access_route IS 'Verifica si un usuario puede acceder a una ruta - Lógica: DENY > GRANT > ROL';

-- ============================================
-- TEST
-- ============================================

-- Ejemplo de uso:
-- SELECT can_access_route(
--   'user-uuid-here',  -- ID del usuario
--   '/library',        -- Pathname o ruta traducida
--   'es'               -- Idioma
-- );
