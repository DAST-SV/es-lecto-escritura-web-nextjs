-- supabase/schemas/app/translations/data/auth/02_login.sql
-- ============================================================================
-- TRANSLATIONS DATA: AUTH - LOGIN
-- DESCRIPCIÓN: Traducciones de la página de inicio de sesión
-- ============================================================================

SET search_path TO app, public;

-- auth.login.title
SELECT insert_translation('auth', 'login.title',
    '¡Bienvenido de vuelta!',
    'Welcome back!',
    'Bon retour!',
    'ui-components',
    'Título de la página de login'
);

-- auth.login.subtitle
SELECT insert_translation('auth', 'login.subtitle',
    'Inicia sesión para continuar tu aventura de aprendizaje',
    'Log in to continue your learning adventure',
    'Connectez-vous pour continuer votre aventure d''apprentissage',
    'ui-components',
    'Subtítulo de la página de login'
);

-- auth.login.no_account
SELECT insert_translation('auth', 'login.no_account',
    '¿No tienes cuenta?',
    'Don''t have an account?',
    'Pas de compte?',
    'navigation',
    'Texto para ir a registro'
);

-- auth.login.register_link
SELECT insert_translation('auth', 'login.register_link',
    'Regístrate aquí',
    'Sign up here',
    'Inscrivez-vous ici',
    'navigation',
    'Link para ir a registro'
);

SELECT 'TRANSLATIONS: Auth login - 4 traducciones insertadas' AS status;
