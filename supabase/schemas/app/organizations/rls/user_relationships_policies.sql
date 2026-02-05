-- supabase/schemas/app/organizations/rls/user_relationships_policies.sql
-- ============================================================================
-- RLS: user_relationships
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT TO authenticated
  USING (primary_user_id = auth.uid() OR related_user_id = auth.uid());

-- Service role tiene acceso completo
CREATE POLICY "service_role_all_user_relationships" ON app.user_relationships
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT ON app.user_relationships TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.user_relationships TO authenticated;
GRANT ALL ON app.user_relationships TO service_role;

SELECT 'ORGANIZATIONS: RLS policies para user_relationships creadas' AS status;
