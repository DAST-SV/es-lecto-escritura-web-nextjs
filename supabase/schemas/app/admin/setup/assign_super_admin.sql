-- supabase/schemas/app/admin/setup/assign_super_admin.sql
-- ============================================
-- SCRIPT: Asignar rol super_admin a un usuario
-- ⚠️ CAMBIAR EL EMAIL ANTES DE EJECUTAR
-- ============================================

-- Paso 1: Ver usuarios recientes
SELECT
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Paso 2: Asignar super_admin
-- ⚠️ CAMBIAR 'TU_EMAIL@example.com' por tu email real
INSERT INTO app.user_roles (user_id, role_id, is_active)
SELECT
  au.id,
  r.id,
  true
FROM auth.users au
CROSS JOIN app.roles r
WHERE au.email = 'TU_EMAIL@example.com'  -- ⚠️ CAMBIAR AQUÍ
  AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id, organization_id)
DO UPDATE SET
  is_active = true,
  revoked_at = NULL;

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
WHERE au.email = 'TU_EMAIL@example.com'  -- ⚠️ CAMBIAR AQUÍ
  AND ur.revoked_at IS NULL;

-- Paso 4: Probar acceso
SELECT can_access_route(
  (SELECT id FROM auth.users WHERE email = 'TU_EMAIL@example.com'),  -- ⚠️ CAMBIAR
  '/admin',
  'es'
) as puede_acceder_admin;

-- Debe retornar: true
