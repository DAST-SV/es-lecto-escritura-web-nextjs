-- supabase/schemas/app/auth/triggers/set_updated_at.sql
-- ============================================================================
-- TRIGGERS: set_updated_at
-- ============================================================================

SET search_path TO app, public;

CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

SELECT 'AUTH: Triggers set_updated_at creados' AS status;
