-- supabase/schemas/app/organizations/rls/user_relationships_policies.sql
-- ============================================================================
-- RLS: user_relationships
-- DESCRIPCIÓN: Políticas de seguridad para tabla user_relationships
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_relationships" ON app.user_relationships;
CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT TO authenticated
  USING (primary_user_id = auth.uid() OR related_user_id = auth.uid());

SELECT 'ORGANIZATIONS: RLS policies para user_relationships creadas' AS status;
