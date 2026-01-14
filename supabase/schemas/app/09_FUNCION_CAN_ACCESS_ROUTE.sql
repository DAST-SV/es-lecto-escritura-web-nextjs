-- ============================================
-- SCRIPT 09: FUNCIÓN CAN_ACCESS_ROUTE
-- ============================================
-- ⚠️ EJECUTAR DESPUÉS DEL SCRIPT 08B (limpiar funciones)
-- Verifica si un usuario puede acceder a una ruta
-- Lógica: DENY > GRANT > ROL > Sin acceso
-- ============================================

-- ============================================
-- CREAR FUNCIÓN EN SCHEMA APP
-- ============================================

CREATE FUNCTION app.can_access_route(
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

  -- 2. Verificar DENY individual (máxima prioridad)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
  ) INTO v_has_deny;

  -- Si tiene DENY, bloquear inmediatamente
  IF v_has_deny THEN
    RETURN false;
  END IF;

  -- 3. Verificar GRANT individual (segunda prioridad)
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

  -- 4. Verificar permisos por ROL (tercera prioridad)
  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.roles rol ON rol.id = ur.role_id
    JOIN app.route_permissions rp ON rp.role_name = rol.name
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
      AND rp.route_id = v_route_id
      AND rp.is_active = true
  ) INTO v_has_from_role;

  -- Retornar resultado basado en rol
  RETURN v_has_from_role;
END;
$$;

-- ============================================
-- CREAR WRAPPER EN PUBLIC
-- ============================================

CREATE FUNCTION public.can_access_route(
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
-- DAR PERMISOS EXECUTE (especificando parámetros)
-- ============================================

-- Permisos con los 3 parámetros explícitos
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, character varying, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, character varying, character varying) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, character varying, character varying) TO anon;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, character varying, character varying) TO anon;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON FUNCTION app.can_access_route(uuid, character varying, character varying) IS 'Verifica si un usuario puede acceder a una ruta. Lógica: DENY > GRANT > ROL';

-- ============================================
-- VERIFICAR CREACIÓN
-- ============================================

SELECT 
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname = 'can_access_route';

-- Debe mostrar 2 funciones (app y public) con los mismos argumentos

-- ============================================
-- PROBAR (después de asignar rol)
-- ============================================

-- Con 3 parámetros explícitos
SELECT can_access_route(auth.uid(), '/', 'es');

-- Con 2 parámetros (usa DEFAULT 'es')
SELECT can_access_route(auth.uid(), '/');

-- Ambas formas deben funcionar
