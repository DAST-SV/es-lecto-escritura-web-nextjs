-- supabase/schemas/app/role_language_access/data.sql
-- ============================================
-- DATOS INICIALES: role_language_access
-- ============================================

-- super_admin: TODOS los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('super_admin'::app.user_role, 'es'),
  ('super_admin'::app.user_role, 'en'),
  ('super_admin'::app.user_role, 'fr'),
  ('super_admin'::app.user_role, 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- school: TODOS los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('school'::app.user_role, 'es'),
  ('school'::app.user_role, 'en'),
  ('school'::app.user_role, 'fr'),
  ('school'::app.user_role, 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- teacher
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('teacher'::app.user_role, 'es'),
  ('teacher'::app.user_role, 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- parent
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('parent'::app.user_role, 'es'),
  ('parent'::app.user_role, 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- student
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('student'::app.user_role, 'es'),
  ('student'::app.user_role, 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- individual
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('individual'::app.user_role, 'es'),
  ('individual'::app.user_role, 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;
