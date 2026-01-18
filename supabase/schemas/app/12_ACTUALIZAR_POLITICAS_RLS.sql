-- ============================================
-- SCRIPT 12: POLÍTICAS RLS RESTRICTIVAS
-- Solo super_admin puede modificar
-- ============================================

-- ROLES
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

-- ROUTES
DROP POLICY IF EXISTS "routes_insert_policy" ON app.routes;
DROP POLICY IF EXISTS "routes_update_policy" ON app.routes;
DROP POLICY IF EXISTS "routes_delete_policy" ON app.routes;

CREATE POLICY "routes_insert_policy" ON app.routes
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_update_policy" ON app.routes
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_delete_policy" ON app.routes
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

GRANT INSERT, UPDATE, DELETE ON app.routes TO authenticated;

-- ROUTE_TRANSLATIONS
DROP POLICY IF EXISTS "route_translations_insert_policy" ON app.route_translations;
DROP POLICY IF EXISTS "route_translations_update_policy" ON app.route_translations;
DROP POLICY IF EXISTS "route_translations_delete_policy" ON app.route_translations;

CREATE POLICY "route_translations_insert_policy" ON app.route_translations
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_update_policy" ON app.route_translations
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_delete_policy" ON app.route_translations
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

GRANT INSERT, UPDATE, DELETE ON app.route_translations TO authenticated;

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'app'
ORDER BY tablename, policyname;