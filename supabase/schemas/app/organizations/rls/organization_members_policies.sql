-- supabase/schemas/app/organizations/rls/organization_members_policies.sql
-- ============================================================================
-- RLS: organization_members
-- DESCRIPCIÓN: Políticas de seguridad para tabla organization_members
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_org_members" ON app.organization_members;
CREATE POLICY "users_view_org_members" ON app.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM app.organization_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

SELECT 'ORGANIZATIONS: RLS policies para organization_members creadas' AS status;
