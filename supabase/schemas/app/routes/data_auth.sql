-- supabase/schemas/app/routes/data_auth.sql
-- ============================================
-- RUTAS DE AUTENTICACIÓN con traducciones
-- ============================================

-- Insertar rutas de autenticación
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  ('/auth/login', 'Login', 'Página de inicio de sesión', false, 0, true),
  ('/auth/register', 'Register', 'Página de registro', false, 0, true),
  ('/auth/forgot-password', 'Forgot Password', 'Recuperar contraseña', false, 0, true),
  ('/auth/reset-password', 'Reset Password', 'Restablecer contraseña', false, 0, true),
  ('/auth/complete-profile', 'Complete Profile', 'Completar perfil', false, 0, true),
  ('/auth/callback', 'Auth Callback', 'Callback de autenticación', false, 0, true)
ON CONFLICT (pathname) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/login
-- ============================================
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/ingresar', 'Iniciar Sesión'
FROM app.routes r WHERE r.pathname = '/auth/login'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/login', 'Login'
FROM app.routes r WHERE r.pathname = '/auth/login'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/connexion', 'Connexion'
FROM app.routes r WHERE r.pathname = '/auth/login'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/register
-- ============================================
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/registro', 'Registro'
FROM app.routes r WHERE r.pathname = '/auth/register'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/register', 'Register'
FROM app.routes r WHERE r.pathname = '/auth/register'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/inscription', 'Inscription'
FROM app.routes r WHERE r.pathname = '/auth/register'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/forgot-password
-- ============================================
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/olvide-contrasena', 'Olvidé mi Contraseña'
FROM app.routes r WHERE r.pathname = '/auth/forgot-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/forgot-password', 'Forgot Password'
FROM app.routes r WHERE r.pathname = '/auth/forgot-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/mot-de-passe-oublie', 'Mot de passe oublié'
FROM app.routes r WHERE r.pathname = '/auth/forgot-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/reset-password
-- ============================================
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/restablecer-contrasena', 'Restablecer Contraseña'
FROM app.routes r WHERE r.pathname = '/auth/reset-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/reset-password', 'Reset Password'
FROM app.routes r WHERE r.pathname = '/auth/reset-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/reinitialiser-mot-de-passe', 'Réinitialiser le mot de passe'
FROM app.routes r WHERE r.pathname = '/auth/reset-password'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/complete-profile
-- ============================================
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/completar-perfil', 'Completar Perfil'
FROM app.routes r WHERE r.pathname = '/auth/complete-profile'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/complete-profile', 'Complete Profile'
FROM app.routes r WHERE r.pathname = '/auth/complete-profile'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/completer-profil', 'Compléter le profil'
FROM app.routes r WHERE r.pathname = '/auth/complete-profile'
ON CONFLICT (route_id, language_code) DO NOTHING;

-- ============================================
-- TRADUCCIONES: /auth/callback
-- ============================================
-- Esta ruta NO se traduce, debe mantenerse igual en todos los idiomas
INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'es'::app.language_code, '/auth/callback', 'Callback'
FROM app.routes r WHERE r.pathname = '/auth/callback'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'en'::app.language_code, '/auth/callback', 'Callback'
FROM app.routes r WHERE r.pathname = '/auth/callback'
ON CONFLICT (route_id, language_code) DO NOTHING;

INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
SELECT r.id, 'fr'::app.language_code, '/auth/callback', 'Callback'
FROM app.routes r WHERE r.pathname = '/auth/callback'
ON CONFLICT (route_id, language_code) DO NOTHING;
