-- ============================================
-- SCRIPT 09: FUNCIÓN CAN_ACCESS_ROUTE
-- ✅ Versión internacional: verifica por ruta TRADUCIDA
-- ============================================

DROP FUNCTION IF EXISTS public.can_access_route(uuid, text, text) CASCADE;
DROP FUNCTION IF EXISTS app.can_access_route(uuid, text, text) CASCADE;

CREATE OR REPLACE FUNCTION app.can_access_route(
  p_user_id uuid,
  p_translated_path text,  -- ✅ Ruta TRADUCIDA
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

  -- 1. Buscar ruta por traducción o pathname
  SELECT r.id, r.is_public 
  INTO v_route_id, v_is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt ON rt.route_id = r.id 
    AND rt.language_code = v_lang_code
    AND rt.is_active = true
  WHERE (
    rt.translated_path = p_translated_path 
    OR 
    r.pathname = p_translated_path
  )
    AND r.is_active = true
    AND r.deleted_at IS NULL
  LIMIT 1;

  IF v_route_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_is_public = true THEN
    RETURN true;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- 2. DENY individual (idioma específico O genérico)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND (
        urp.language_code IS NULL
        OR urp.language_code = v_lang_code
      )
  ) INTO v_has_deny;

  IF v_has_deny THEN
    RETURN false;
  END IF;

  -- 3. GRANT individual (idioma específico O genérico)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND (
        urp.language_code IS NULL
        OR urp.language_code = v_lang_code
      )
  ) INTO v_has_grant;

  IF v_has_grant THEN
    RETURN true;
  END IF;

  -- 4. Permisos por ROL
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

  -- 5. Si tiene permiso por rol, verificar idioma
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

    IF NOT v_can_use_language THEN
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

-- Comentario
COMMENT ON FUNCTION app.can_access_route IS 
'Verifica acceso por ruta TRADUCIDA. Prioridad: DENY > GRANT > ROL > IDIOMA';

-- Probar
SELECT public.can_access_route(NULL, '/', 'es') as test_public;