-- ============================================
-- PARTE 3: Funciones de Verificación de Permisos
-- Sistema de autorización en tiempo real
-- ============================================

-- ============================================
-- 15. FUNCIÓN: Verificar si usuario tiene permiso
-- ============================================
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id UUID,
  p_permission_name TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := false;
BEGIN
  -- 1. Verificar permiso DIRECTO del usuario (más específico)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_permissions up
    JOIN app.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
      AND p.name = p_permission_name
      AND (p_organization_id IS NULL OR up.organization_id = p_organization_id)
      AND (p_resource_id IS NULL OR up.resource_id = p_resource_id)
      AND up.permission_type = 'grant'
      AND (up.valid_from IS NULL OR up.valid_from <= NOW())
      AND (up.valid_until IS NULL OR up.valid_until > NOW())
      AND up.revoked_at IS NULL
  ) INTO v_has_permission;

  IF v_has_permission THEN
    RETURN true;
  END IF;

  -- 2. Verificar permiso DENY directo (tiene precedencia)
  SELECT EXISTS (
    SELECT 1 
    FROM app.user_permissions up
    JOIN app.permissions p ON up.permission_id = p.id
    WHERE up.user_id = p_user_id
      AND p.name = p_permission_name
      AND (p_organization_id IS NULL OR up.organization_id = p_organization_id)
      AND (p_resource_id IS NULL OR up.resource_id = p_resource_id)
      AND up.permission_type = 'deny'
      AND (up.valid_from IS NULL OR up.valid_from <= NOW())
      AND (up.valid_until IS NULL OR up.valid_until > NOW())
      AND up.revoked_at IS NULL
  ) INTO v_has_permission;

  IF v_has_permission THEN
    RETURN false;
  END IF;

  -- 3. Verificar permiso por ROL
  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.role_permissions rp ON ur.role_id = rp.role_id
    JOIN app.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = p_user_id
      AND p.name = p_permission_name
      AND ur.is_active = true
      AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
      AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
      AND ur.revoked_at IS NULL
      AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id)
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 16. FUNCIÓN: Obtener todos los permisos de un usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL
) RETURNS TABLE (
  permission_name TEXT,
  permission_type TEXT,
  source TEXT, -- 'role' o 'direct'
  role_name TEXT,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  
  -- Permisos desde roles
  SELECT DISTINCT
    p.name as permission_name,
    'grant'::TEXT as permission_type,
    'role'::TEXT as source,
    r.display_name as role_name,
    ur.valid_from,
    ur.valid_until
  FROM app.user_roles ur
  JOIN app.roles r ON ur.role_id = r.id
  JOIN app.role_permissions rp ON r.id = rp.role_id
  JOIN app.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    AND ur.revoked_at IS NULL
    AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id)
    AND p.is_active = true
    AND p.deleted_at IS NULL
  
  UNION
  
  -- Permisos directos
  SELECT DISTINCT
    p.name as permission_name,
    up.permission_type::TEXT,
    'direct'::TEXT as source,
    NULL as role_name,
    up.valid_from,
    up.valid_until
  FROM app.user_permissions up
  JOIN app.permissions p ON up.permission_id = p.id
  WHERE up.user_id = p_user_id
    AND (up.valid_from IS NULL OR up.valid_from <= NOW())
    AND (up.valid_until IS NULL OR up.valid_until > NOW())
    AND up.revoked_at IS NULL
    AND (p_organization_id IS NULL OR up.organization_id = p_organization_id)
    AND p.is_active = true
  
  ORDER BY permission_name, source;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 17. FUNCIÓN: Verificar acceso a ruta
-- ============================================
CREATE OR REPLACE FUNCTION can_access_route(
  p_user_id UUID,
  p_pathname TEXT,
  p_organization_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_route RECORD;
  v_required_permissions TEXT[];
  v_requires_all BOOLEAN;
  v_has_all_permissions BOOLEAN := true;
  v_has_any_permission BOOLEAN := false;
  v_permission TEXT;
BEGIN
  -- Obtener configuración de la ruta
  SELECT 
    is_public,
    requires_permissions,
    requires_all_permissions
  INTO v_route
  FROM app.routes
  WHERE pathname = p_pathname
    AND is_active = true
    AND deleted_at IS NULL;

  -- Si la ruta no existe, denegar acceso
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Si es ruta pública, permitir acceso
  IF v_route.is_public THEN
    RETURN true;
  END IF;

  -- Si no hay usuario, denegar acceso
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Si no requiere permisos específicos, permitir acceso a usuarios autenticados
  IF v_route.requires_permissions IS NULL OR array_length(v_route.requires_permissions, 1) = 0 THEN
    RETURN true;
  END IF;

  -- Verificar permisos requeridos
  v_required_permissions := v_route.requires_permissions;
  v_requires_all := COALESCE(v_route.requires_all_permissions, true);

  -- Iterar sobre permisos requeridos
  FOREACH v_permission IN ARRAY v_required_permissions
  LOOP
    IF has_permission(p_user_id, v_permission, p_organization_id) THEN
      v_has_any_permission := true;
    ELSE
      v_has_all_permissions := false;
    END IF;
  END LOOP;

  -- Retornar según el tipo de verificación
  IF v_requires_all THEN
    RETURN v_has_all_permissions;
  ELSE
    RETURN v_has_any_permission;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 18. FUNCIÓN: Obtener rutas accesibles para usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_accessible_routes(
  p_user_id UUID,
  p_language_code TEXT DEFAULT 'es',
  p_organization_id UUID DEFAULT NULL,
  p_show_in_menu_only BOOLEAN DEFAULT false
) RETURNS TABLE (
  route_id UUID,
  pathname TEXT,
  translated_path TEXT,
  display_name TEXT,
  icon TEXT,
  menu_order INTEGER,
  parent_route_id UUID,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as route_id,
    r.pathname,
    COALESCE(rt.translated_path, r.pathname) as translated_path,
    COALESCE(rt.translated_name, r.display_name) as display_name,
    r.icon,
    r.menu_order,
    r.parent_route_id,
    r.is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt 
    ON r.id = rt.route_id 
    AND rt.language_code = p_language_code
    AND rt.is_active = true
  WHERE r.is_active = true
    AND r.deleted_at IS NULL
    AND (NOT p_show_in_menu_only OR r.show_in_menu = true)
    AND can_access_route(p_user_id, r.pathname, p_organization_id)
  ORDER BY r.menu_order, r.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 19. FUNCIÓN: Asignar rol a usuario (con validación)
-- ============================================
CREATE OR REPLACE FUNCTION assign_role_to_user(
  p_user_id UUID,
  p_role_name TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_assigned_by UUID DEFAULT NULL,
  p_valid_from TIMESTAMPTZ DEFAULT NOW(),
  p_valid_until TIMESTAMPTZ DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_role_id UUID;
  v_user_role_id UUID;
BEGIN
  -- Obtener role_id
  SELECT id INTO v_role_id
  FROM app.roles
  WHERE name = p_role_name
    AND is_active = true
    AND deleted_at IS NULL;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found or inactive', p_role_name;
  END IF;

  -- Insertar o actualizar user_role
  INSERT INTO app.user_roles (
    user_id,
    role_id,
    organization_id,
    valid_from,
    valid_until,
    assigned_by,
    is_active
  ) VALUES (
    p_user_id,
    v_role_id,
    p_organization_id,
    p_valid_from,
    p_valid_until,
    COALESCE(p_assigned_by, auth.uid()),
    true
  )
  ON CONFLICT (user_id, role_id, organization_id)
  DO UPDATE SET
    is_active = true,
    valid_from = EXCLUDED.valid_from,
    valid_until = EXCLUDED.valid_until,
    revoked_at = NULL,
    revoked_by = NULL
  RETURNING id INTO v_user_role_id;

  RETURN v_user_role_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 20. FUNCIÓN: Revocar rol de usuario
-- ============================================
CREATE OR REPLACE FUNCTION revoke_role_from_user(
  p_user_id UUID,
  p_role_name TEXT,
  p_organization_id UUID DEFAULT NULL,
  p_revoked_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_role_id UUID;
BEGIN
  -- Obtener role_id
  SELECT id INTO v_role_id
  FROM app.roles
  WHERE name = p_role_name;

  IF v_role_id IS NULL THEN
    RETURN false;
  END IF;

  -- Revocar rol
  UPDATE app.user_roles
  SET 
    is_active = false,
    revoked_at = NOW(),
    revoked_by = COALESCE(p_revoked_by, auth.uid())
  WHERE user_id = p_user_id
    AND role_id = v_role_id
    AND (p_organization_id IS NULL OR organization_id = p_organization_id);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 21. FUNCIÓN: Obtener rol más alto del usuario
-- ============================================
CREATE OR REPLACE FUNCTION get_user_highest_role(
  p_user_id UUID,
  p_organization_id UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_role_name TEXT;
BEGIN
  SELECT r.name INTO v_role_name
  FROM app.user_roles ur
  JOIN app.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
    AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
    AND ur.revoked_at IS NULL
    AND (p_organization_id IS NULL OR ur.organization_id = p_organization_id)
    AND r.is_active = true
    AND r.deleted_at IS NULL
  ORDER BY r.hierarchy_level DESC
  LIMIT 1;

  RETURN COALESCE(v_role_name, 'guest');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 22. VISTA: Resumen de permisos por usuario
-- ============================================
CREATE OR REPLACE VIEW user_permissions_summary AS
SELECT 
  ur.user_id,
  r.name as role_name,
  r.display_name as role_display_name,
  r.hierarchy_level,
  COUNT(DISTINCT rp.permission_id) as permissions_count,
  array_agg(DISTINCT p.name ORDER BY p.name) as permissions,
  ur.organization_id,
  ur.is_active,
  ur.valid_from,
  ur.valid_until
FROM app.user_roles ur
JOIN app.roles r ON ur.role_id = r.id
LEFT JOIN app.role_permissions rp ON r.id = rp.role_id
LEFT JOIN app.permissions p ON rp.permission_id = p.id
WHERE ur.is_active = true
  AND (ur.valid_from IS NULL OR ur.valid_from <= NOW())
  AND (ur.valid_until IS NULL OR ur.valid_until > NOW())
  AND ur.revoked_at IS NULL
GROUP BY ur.user_id, r.name, r.display_name, r.hierarchy_level, ur.organization_id, ur.is_active, ur.valid_from, ur.valid_until;

-- ============================================
-- 23. COMENTARIOS
-- ============================================
COMMENT ON FUNCTION has_permission IS 'Verifica si un usuario tiene un permiso específico';
COMMENT ON FUNCTION get_user_permissions IS 'Obtiene todos los permisos de un usuario';
COMMENT ON FUNCTION can_access_route IS 'Verifica si un usuario puede acceder a una ruta';
COMMENT ON FUNCTION get_accessible_routes IS 'Obtiene todas las rutas accesibles para un usuario';
COMMENT ON FUNCTION assign_role_to_user IS 'Asigna un rol a un usuario con validación';
COMMENT ON FUNCTION revoke_role_from_user IS 'Revoca un rol de un usuario';
COMMENT ON FUNCTION get_user_highest_role IS 'Obtiene el rol de mayor jerarquía de un usuario';

-- ============================================
-- ✅ SISTEMA COMPLETO INSTALADO
-- ============================================
