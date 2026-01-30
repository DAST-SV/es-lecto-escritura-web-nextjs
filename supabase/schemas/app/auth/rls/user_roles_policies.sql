-- supabase/schemas/app/auth/rls/user_roles_policies.sql
-- ============================================================================
-- RLS: user_roles
-- DESCRIPCIÓN: Políticas de seguridad para tabla user_roles
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_view_own_roles" ON app.user_roles;
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

SELECT 'AUTH: RLS policies para user_roles creadas' AS status;
