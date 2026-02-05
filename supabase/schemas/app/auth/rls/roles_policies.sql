-- supabase/schemas/app/auth/rls/roles_policies.sql
-- ============================================================================
-- RLS: roles
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT TO authenticated USING (is_active = true);

-- Service role tiene acceso completo
CREATE POLICY "service_role_all_roles" ON app.roles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT ON app.roles TO authenticated;
GRANT ALL ON app.roles TO service_role;

SELECT 'AUTH: RLS policies para roles creadas' AS status;
