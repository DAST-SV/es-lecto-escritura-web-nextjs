-- supabase/schemas/app/role_language_access/data.sql
-- ============================================
-- DATOS INICIALES: role_language_access
-- ============================================

-- super_admin: TODOS los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('super_admin', 'es'),
  ('super_admin', 'en'),
  ('super_admin', 'fr'),
  ('super_admin', 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- admin: TODOS los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('admin', 'es'),
  ('admin', 'en'),
  ('admin', 'fr'),
  ('admin', 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- teacher: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('teacher', 'es'),
  ('teacher', 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- student: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('student', 'es'),
  ('student', 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- guest: Solo ES
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('guest', 'es')
ON CONFLICT (role_name, language_code) DO NOTHING;
