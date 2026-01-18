-- ============================================
-- ARCHIVO: supabase/schemas/app/09_FUNCION_CAN_ACCESS_ROUTE_INTERNACIONAL.sql
-- ACCIÓN: EJECUTAR EN SUPABASE
-- PROPÓSITO: Verificar acceso por RUTA TRADUCIDA + IDIOMA
-- ============================================

DROP FUNCTION IF EXISTS public.can_access_route(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS app.can_access_route(uuid, text, text) CASCADE;

CREATE OR REPLACE FUNCTION app.can_access_route(
  p_user_id uuid,
  p_translated_path text,  -- ✅ RUTA TRADUCIDA (/exclusive, /exclusivo, etc)
  p_language_code text DEFAULT 'es'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, auth, public
AS $$
DECLARE
  v_route_id uuid;
  v_is_public boolean;
  v_has_deny boolean;
  v_has_grant boolean;
  v_has_from_role boolean;
  v_lang_code app.language_code;
  v_can_use_language boolean;
BEGIN
  -- Convertir language_code
  BEGIN
    v_lang_code := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang_code := 'es'::app.language_code;
  END;

  -- 1. ✅ Buscar ruta por TRADUCCIÓN o por pathname directo
  SELECT r.id, r.is_public 
  INTO v_route_id, v_is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt ON rt.route_id = r.id 
    AND rt.language_code = v_lang_code
    AND rt.is_active = true
  WHERE (
    rt.translated_path = p_translated_path  -- Buscar por traducción
    OR 
    r.pathname = p_translated_path          -- O por pathname directo
  )
    AND r.is_active = true
    AND r.deleted_at IS NULL
  LIMIT 1;

  IF v_route_id IS NULL THEN
    RAISE NOTICE 'Ruta no encontrada: % (idioma: %)', p_translated_path, v_lang_code;
    RETURN false;
  END IF;

  RAISE NOTICE 'Ruta encontrada: % → route_id: %', p_translated_path, v_route_id;

  IF v_is_public = true THEN
    RETURN true;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. ✅ DENY individual (con soporte de idioma específico)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND (
        urp.language_code IS NULL           -- DENY global (todos los idiomas)
        OR urp.language_code = v_lang_code  -- DENY específico del idioma
      )
  ) INTO v_has_deny;

  IF v_has_deny THEN
    RAISE NOTICE 'DENY individual encontrado';
    RETURN false;
  END IF;

  -- 3. ✅ GRANT individual (con soporte de idioma específico)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND (
        urp.language_code IS NULL           -- GRANT global (todos los idiomas)
        OR urp.language_code = v_lang_code  -- GRANT específico del idioma
      )
  ) INTO v_has_grant;

  IF v_has_grant THEN
    RAISE NOTICE 'GRANT individual encontrado';
    RETURN true;
  END IF;

  -- 4. ✅ Permisos por ROL
  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.roles rol ON rol.id = ur.role_id
    JOIN app.route_permissions rp ON rp.role_name = rol.name
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
      AND rol.is_active = true
      AND rp.route_id = v_route_id
      AND rp.is_active = true
  ) INTO v_has_from_role;

  RAISE NOTICE 'Permiso por rol: %', v_has_from_role;

  -- 5. ✅ Si tiene permiso por rol, VERIFICAR SI PUEDE USAR ESTE IDIOMA
  IF v_has_from_role THEN
    SELECT EXISTS (
      SELECT 1
      FROM app.user_roles ur
      JOIN app.roles rol ON rol.id = ur.role_id
      JOIN app.role_language_access rla ON rla.role_name = rol.name
      WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
        AND rla.language_code = v_lang_code
        AND rla.is_active = true
    ) INTO v_can_use_language;

    RAISE NOTICE 'Puede usar idioma %: %', v_lang_code, v_can_use_language;

    IF NOT v_can_use_language THEN
      RAISE NOTICE 'Usuario no tiene acceso al idioma %', v_lang_code;
      RETURN false;
    END IF;
  END IF;

  RETURN v_has_from_role;
END;
$$;

-- Wrapper público
CREATE OR REPLACE FUNCTION public.can_access_route(
  p_user_id uuid,
  p_translated_path text,
  p_language_code text DEFAULT 'es'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT app.can_access_route(p_user_id, p_translated_path, p_language_code);
$$;

-- Permisos
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, text, text) TO anon;

COMMENT ON FUNCTION app.can_access_route IS 
'✅ Verifica acceso por RUTA TRADUCIDA + IDIOMA. Permite /en/exclusive pero bloquea /es/exclusive';