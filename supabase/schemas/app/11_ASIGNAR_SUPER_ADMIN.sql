-- ============================================
-- SCRIPT 11: ASIGNAR ROL SUPER_ADMIN
-- ============================================
-- ⚠️ IMPORTANTE: Cambia el email por el tuyo
-- Después de ejecutar: CIERRA SESIÓN y vuelve a entrar
-- ============================================

-- ============================================
-- PASO 1: Ver tu usuario
-- ============================================

SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'TU_EMAIL@example.com';  -- ⚠️ CAMBIA ESTO

-- Copia el UUID (user_id) para verificar después

-- ============================================
-- PASO 2: Ver roles disponibles
-- ============================================

SELECT 
  id,
  name,
  display_name,
  hierarchy_level
FROM app.roles
ORDER BY hierarchy_level DESC;

-- ============================================
-- PASO 3: Asignar rol super_admin
-- ============================================

INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
SELECT 
  au.id,
  r.id,
  true,
  'Rol asignado manualmente - Usuario principal del sistema'
FROM auth.users au
CROSS JOIN app.roles r
WHERE au.email = 'TU_EMAIL@example.com'  -- ⚠️ CAMBIA ESTO
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) 
DO UPDATE SET 
  is_active = true,
  revoked_at = NULL,
  notes = 'Rol reasignado manualmente';

-- ============================================
-- PASO 4: Verificar que se asignó correctamente
-- ============================================

SELECT 
  ur.id,
  au.email,
  r.name as role_name,
  r.display_name as role_display_name,
  ur.is_active,
  ur.revoked_at,
  ur.created_at
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE au.email = 'TU_EMAIL@example.com'  -- ⚠️ CAMBIA ESTO
  AND ur.revoked_at IS NULL;

-- Debe mostrar tu usuario con rol 'super_admin'

-- ============================================
-- PASO 5: Probar acceso
-- ============================================

-- Ver si puedes acceder a rutas
SELECT can_access_route(
  (SELECT id FROM auth.users WHERE email = 'TU_EMAIL@example.com'),
  '/admin',
  'es'
);
-- Debe retornar: true

-- ============================================
-- ⚠️ IMPORTANTE: SIGUIENTE PASO
-- ============================================
-- 1. CIERRA SESIÓN en tu aplicación
-- 2. VUELVE A INICIAR SESIÓN
-- 3. Ahora tendrás permisos de super_admin
-- ============================================
