-- supabase/schemas/app/translations/data/auth/08_complete_profile.sql
-- ============================================================================
-- TRANSLATIONS DATA: AUTH - COMPLETE PROFILE PAGE
-- DESCRIPCION: Traducciones para la pagina de completar perfil
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- COMPLETE PROFILE PAGE (namespace: auth.form)
-- ============================================

-- Titulo principal
SELECT insert_translation('auth.form', 'complete_profile_title',
    '¡Bienvenido!',
    'Welcome!',
    'Bienvenue !',
    'ui-components',
    'Titulo de la pagina completar perfil'
);

-- Subtitulo
SELECT insert_translation('auth.form', 'complete_profile_subtitle',
    'Selecciona tu tipo de usuario para continuar',
    'Select your user type to continue',
    'Selectionnez votre type d''utilisateur pour continuer',
    'ui-components',
    'Subtitulo de la pagina completar perfil'
);

-- Boton de envio
SELECT insert_translation('auth.form', 'complete_profile_submit',
    '¡Empezar a aprender!',
    'Start learning!',
    'Commencer a apprendre !',
    'ui-components',
    'Texto del boton de envio en completar perfil'
);

-- Texto de cargando
SELECT insert_translation('auth.form', 'complete_profile_loading',
    'Guardando...',
    'Saving...',
    'Enregistrement...',
    'ui-components',
    'Texto de cargando en completar perfil'
);

SELECT 'TRANSLATIONS: Auth complete-profile - 4 traducciones insertadas' AS status;
