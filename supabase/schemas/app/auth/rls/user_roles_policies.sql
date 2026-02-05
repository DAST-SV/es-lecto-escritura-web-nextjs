-- supabase/schemas/app/auth/rls/user_roles_policies.sql
-- ============================================================================
-- RLS: user_roles
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver sus propios roles
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Service role tiene acceso completo
CREATE POLICY "service_role_all_user_roles" ON app.user_roles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- GRANTS
-- ============================================================================
GRANT SELECT ON app.user_roles TO authenticated;
GRANT ALL ON app.user_roles TO service_role;

SELECT 'AUTH: RLS policies para user_roles creadas' AS status;
