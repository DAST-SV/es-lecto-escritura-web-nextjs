-- supabase/schemas/app/admin/rls/admin_policies.sql
-- ============================================
-- RLS: Políticas adicionales para admin
-- ============================================

-- ROLES
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
CREATE POLICY "routes_insert_policy" ON app.routes
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_update_policy" ON app.routes
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_delete_policy" ON app.routes
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "routes_select_anon_policy" ON app.routes
  FOR SELECT TO anon
  USING (is_active = true AND deleted_at IS NULL);

GRANT INSERT, UPDATE, DELETE ON app.routes TO authenticated;
GRANT SELECT ON app.routes TO anon;

-- ROUTE_TRANSLATIONS
CREATE POLICY "route_translations_insert_policy" ON app.route_translations
  FOR INSERT TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_update_policy" ON app.route_translations
  FOR UPDATE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_delete_policy" ON app.route_translations
  FOR DELETE TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_translations_select_anon_policy" ON app.route_translations
  FOR SELECT TO anon
  USING (is_active = true);

GRANT INSERT, UPDATE, DELETE ON app.route_translations TO authenticated;
GRANT SELECT ON app.route_translations TO anon;
