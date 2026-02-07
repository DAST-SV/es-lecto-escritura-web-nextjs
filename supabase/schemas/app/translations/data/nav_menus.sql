-- supabase/schemas/app/translations/data/nav_menus.sql
-- ============================================================================
-- TRANSLATIONS DATA: NAV MENUS
-- DESCRIPCION: Traducciones de menus de navegacion (namespace: nav)
-- Usado por useNavigation hook con estructura: key.text, key.href, key.title
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- NAMESPACE: nav
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('nav', 'Navigation Menus', 'Traducciones de menus de navegacion con href', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- PUBLIC MENU ITEMS (no autenticado)
-- ============================================

-- About
SELECT insert_translation('nav', 'about.text', 'Acerca de', 'About', 'A propos');
SELECT insert_translation('nav', 'about.href', '/acerca-de', '/about', '/a-propos');
SELECT insert_translation('nav', 'about.title', 'Conoce nuestra plataforma', 'Learn about our platform', 'Decouvrez notre plateforme');

-- Login
SELECT insert_translation('nav', 'auth.login.text', 'Ingresar', 'Login', 'Connexion');
SELECT insert_translation('nav', 'auth.login.href', '/auth/ingresar', '/auth/login', '/auth/connexion');
SELECT insert_translation('nav', 'auth.login.title', 'Iniciar sesion', 'Sign in to your account', 'Connectez-vous a votre compte');

-- Register
SELECT insert_translation('nav', 'auth.register.text', 'Registrarse', 'Sign up', 'Inscription');
SELECT insert_translation('nav', 'auth.register.href', '/auth/registro', '/auth/register', '/auth/inscription');
SELECT insert_translation('nav', 'auth.register.title', 'Crear una cuenta nueva', 'Create a new account', 'Creer un nouveau compte');

-- ============================================
-- PRIVATE MENU ITEMS (autenticado)
-- ============================================

-- Library (Biblioteca)
SELECT insert_translation('nav', 'library.text', 'Biblioteca', 'Library', 'Bibliotheque');
SELECT insert_translation('nav', 'library.href', '/library', '/library', '/library');
SELECT insert_translation('nav', 'library.title', 'Explora nuestra biblioteca de libros', 'Explore our book library', 'Explorez notre bibliotheque de livres');

-- My World (Mi Mundo)
SELECT insert_translation('nav', 'myWorld.text', 'Mi Mundo', 'My World', 'Mon Monde');
SELECT insert_translation('nav', 'myWorld.href', '/mi-mundo', '/my-world', '/mon-monde');
SELECT insert_translation('nav', 'myWorld.title', 'Tu espacio personal de lectura', 'Your personal reading space', 'Votre espace de lecture personnel');

-- My Progress (Mi Proceso)
SELECT insert_translation('nav', 'myProgress.text', 'Mi Proceso', 'My Progress', 'Mon Progres');
SELECT insert_translation('nav', 'myProgress.href', '/mi-proceso', '/my-progress', '/mon-progres');
SELECT insert_translation('nav', 'myProgress.title', 'Sigue tu progreso de lectura', 'Track your reading progress', 'Suivez votre progres de lecture');

SELECT 'TRANSLATIONS: Nav menus - traducciones insertadas' AS status;
