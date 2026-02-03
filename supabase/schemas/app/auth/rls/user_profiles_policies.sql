-- supabase/schemas/app/auth/rls/user_profiles_policies.sql
-- ============================================================================
-- RLS: user_profiles
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_profile" ON app.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_public_profile = true);

CREATE POLICY "users_update_own_profile" ON app.user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_profile" ON app.user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

SELECT 'AUTH: RLS policies para user_profiles creadas' AS status;
