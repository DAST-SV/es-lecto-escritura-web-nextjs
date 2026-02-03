-- supabase/schemas/app/permissions/functions/can_access_route.sql
-- ============================================
-- FUNCIÓN: can_access_route
-- ============================================

CREATE OR REPLACE FUNCTION app.can_access_route(
  p_user_id uuid,
  p_translated_path text,
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
  v_lang_code app.language_code;
  v_has_deny_global boolean := false;
  v_has_deny_specific boolean := false;
  v_has_grant_global boolean := false;
  v_has_grant_specific boolean := false;
  v_has_from_role boolean := false;
  v_can_use_language boolean := false;
BEGIN
  BEGIN
    v_lang_code := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang_code := 'es'::app.language_code;
  END;

  -- PASO 1: Buscar ruta
  SELECT r.id, r.is_public
  INTO v_route_id, v_is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt ON rt.route_id = r.id
    AND rt.language_code = v_lang_code
    AND rt.is_active = true
  WHERE (rt.translated_path = p_translated_path OR r.pathname = p_translated_path)
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

  -- PASO 2: DENY global
  SELECT EXISTS (
    SELECT 1 FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code IS NULL
  ) INTO v_has_deny_global;

  IF v_has_deny_global THEN
    RETURN false;
  END IF;

  -- DENY específico
  SELECT EXISTS (
    SELECT 1 FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code = v_lang_code
  ) INTO v_has_deny_specific;

  IF v_has_deny_specific THEN
    RETURN false;
  END IF;

  -- PASO 3: GRANT global
  SELECT EXISTS (
    SELECT 1 FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code IS NULL
  ) INTO v_has_grant_global;

  IF v_has_grant_global THEN
    RETURN true;
  END IF;

  -- GRANT específico
  SELECT EXISTS (
    SELECT 1 FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code = v_lang_code
  ) INTO v_has_grant_specific;

  IF v_has_grant_specific THEN
    RETURN true;
  END IF;

  -- PASO 4: Permisos por ROL
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
      AND (rp.language_code IS NULL OR rp.language_code = v_lang_code)
  ) INTO v_has_from_role;

  IF NOT v_has_from_role THEN
    RETURN false;
  END IF;

  -- PASO 5: Verificar idioma del ROL
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

  RETURN v_can_use_language;
END;
$$;

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

GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION app.can_access_route(uuid, text, text) TO anon;

COMMENT ON FUNCTION app.can_access_route IS 'Verifica permisos de acceso a rutas';
