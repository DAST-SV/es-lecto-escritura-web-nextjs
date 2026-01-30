-- supabase/schemas/app/auth/triggers/set_updated_at.sql
-- ============================================================================
-- TRIGGERS: set_updated_at
-- DESCRIPCIÓN: Triggers para actualizar updated_at automáticamente
-- ============================================================================

SET search_path TO app, public;

-- Trigger para roles
DROP TRIGGER IF EXISTS set_roles_updated_at ON app.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- Trigger para user_profiles
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON app.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- Trigger para user_roles
DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

SELECT 'AUTH: Triggers set_updated_at creados' AS status;
