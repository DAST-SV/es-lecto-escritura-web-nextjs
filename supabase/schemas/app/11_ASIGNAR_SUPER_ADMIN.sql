-- ============================================
-- SCRIPT 11: ASIGNAR ROL SUPER_ADMIN
-- ⚠️ CAMBIAR EL EMAIL
-- ============================================

-- Paso 1: Ver tu usuario
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email = 'tomac22753@ncien.com';  -- ⚠️ CAMBIAR

-- Paso 2: Asignar super_admin
INSERT INTO app.user_roles (user_id, role_id, is_active, notes)
SELECT 
  au.id,
  r.id,
  true,
  'Rol asignado - Setup inicial'
FROM auth.users au
CROSS JOIN app.roles r
WHERE au.email = 'TU_EMAIL@example.com'  -- ⚠️ CAMBIAR
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) 
DO UPDATE SET 
  is_active = true,
  revoked_at = NULL,
  notes = 'Rol reasignado';

-- Paso 3: Verificar
SELECT 
  au.email,
  r.name as role_name,
  r.display_name,
  ur.is_active,
  ur.created_at
FROM app.user_roles ur
JOIN auth.users au ON au.id = ur.user_id
JOIN app.roles r ON r.id = ur.role_id
WHERE au.email = 'tomac22753@ncien.com'  -- ⚠️ CAMBIAR
  AND ur.revoked_at IS NULL;

-- Paso 4: Probar acceso
SELECT can_access_route(
  (SELECT id FROM auth.users WHERE email = 'tomac22753@ncien.com'),  -- ⚠️ CAMBIAR
  '/admin',
  'es'
) as puede_acceder_admin;

-- Debe retornar: true