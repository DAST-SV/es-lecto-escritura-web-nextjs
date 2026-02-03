-- supabase/schemas/app/auth/triggers/handle_new_user.sql
-- ============================================================================
-- TRIGGER: handle_new_user
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_oauth_provider app.oauth_provider;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF NEW.app_metadata->>'provider' IS NOT NULL THEN
    BEGIN
      v_oauth_provider := (NEW.app_metadata->>'provider')::app.oauth_provider;
    EXCEPTION WHEN OTHERS THEN
      v_oauth_provider := NULL;
    END;
  END IF;

  INSERT INTO app.user_profiles (
    user_id, full_name, display_name, oauth_provider, oauth_provider_id,
    language_preference, last_login_at
  ) VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_oauth_provider,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET last_login_at = NOW();

  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO app.user_roles (user_id, role_id, assigned_by)
    SELECT NEW.id, r.id, NEW.id
    FROM app.roles r
    WHERE r.name = (NEW.raw_user_meta_data->>'role')::app.user_role
    ON CONFLICT (user_id, role_id, organization_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app.handle_new_user();

SELECT 'AUTH: Trigger handle_new_user creado' AS status;
