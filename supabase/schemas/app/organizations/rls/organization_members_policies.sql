-- supabase/schemas/app/organizations/rls/organization_members_policies.sql
-- ============================================================================
-- RLS: organization_members
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_org_members" ON app.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM app.organization_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Service role tiene acceso completo
CREATE POLICY "service_role_all_organization_members" ON app.organization_members
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT ON app.organization_members TO authenticated;
GRANT INSERT, UPDATE, DELETE ON app.organization_members TO authenticated;
GRANT ALL ON app.organization_members TO service_role;

SELECT 'ORGANIZATIONS: RLS policies para organization_members creadas' AS status;
