-- ============================================
-- SCRIPT 12: POLÍTICAS RLS COMPLETAS
-- ✅ ACTUALIZADO: Incluye políticas para anon (middleware)
-- Solo super_admin puede modificar + anon puede leer
-- ============================================

-- ============================================
-- ROLES
-- ============================================
DROP POLICY IF EXISTS "roles_insert_policy" ON app.roles;
DROP POLICY IF EXISTS "roles_update_policy" ON app.roles;
DROP POLICY IF EXISTS "roles_delete_policy" ON app.roles;

CREATE POLICY "roles_insert_policy" ON app.roles
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "roles_update_policy" ON app.roles
  FOR UPDATE TO authenticated
  USING (NOT is_system_role AND app.is_super_admin(auth.uid()));

CREATE POLICY "roles_delete_policy" ON app.roles
  FOR DELETE TO authenticated
  USING (NOT is_system_role AND app.is_super_admin(auth.uid()));

GRANT INSERT, UPDATE, DELETE ON app.roles TO authenticated;

-- ============================================
-- ROUTES
-- ============================================
DROP POLICY IF EXISTS "routes_insert_policy" ON app.routes;
DROP POLICY IF EXISTS "routes_update_policy" ON app.routes;
DROP POLICY IF EXISTS "routes_delete_policy" ON app.routes;
DROP POLICY IF EXISTS "routes_select_anon_policy" ON app.routes;

CREATE POLICY "routes_insert_policy" ON app.routes
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_update_policy" ON app.routes
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_delete_policy" ON app.routes
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- ✅ NUEVA: Permitir a anon leer rutas activas (para middleware)
CREATE POLICY "routes_select_anon_policy" ON app.routes
  FOR SELECT TO anon
  USING (is_active = true AND deleted_at IS NULL);

GRANT INSERT, UPDATE, DELETE ON app.routes TO authenticated;
GRANT SELECT ON app.routes TO anon;

-- ============================================
-- ROUTE_TRANSLATIONS
-- ============================================
DROP POLICY IF EXISTS "route_translations_insert_policy" ON app.route_translations;
DROP POLICY IF EXISTS "route_translations_update_policy" ON app.route_translations;
DROP POLICY IF EXISTS "route_translations_delete_policy" ON app.route_translations;
DROP POLICY IF EXISTS "route_translations_select_anon_policy" ON app.route_translations;

CREATE POLICY "route_translations_insert_policy" ON app.route_translations
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_update_policy" ON app.route_translations
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_delete_policy" ON app.route_translations
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- ✅ NUEVA: Permitir a anon leer traducciones activas (para middleware)
CREATE POLICY "route_translations_select_anon_policy" ON app.route_translations
  FOR SELECT TO anon
  USING (is_active = true);

GRANT INSERT, UPDATE, DELETE ON app.route_translations TO authenticated;
GRANT SELECT ON app.route_translations TO anon;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON POLICY "routes_select_anon_policy" ON app.routes IS 
'Permite a usuarios anónimos leer rutas activas para el middleware de routing';

COMMENT ON POLICY "route_translations_select_anon_policy" ON app.route_translations IS 
'Permite a usuarios anónimos leer traducciones activas para el middleware de routing';

-- ============================================
-- VERIFICACIONES
-- ============================================

-- 1. Verificar políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'app'
  AND tablename IN ('roles', 'routes', 'route_translations')
ORDER BY tablename, policyname;

-- 2. Probar como anon (simular middleware)
SET ROLE anon;

SELECT 
  'PRUEBA ANON' as test,
  COUNT(*) as rutas_visibles
FROM app.routes
WHERE is_active = true
  AND deleted_at IS NULL;

RESET ROLE;

-- Debe retornar: rutas_visibles > 0

-- 3. Resumen
SELECT 
  '✅ Script 12 completado' as status,
  COUNT(DISTINCT policyname) as total_politicas
FROM pg_policies
WHERE schemaname = 'app'
  AND tablename IN ('roles', 'routes', 'route_translations');