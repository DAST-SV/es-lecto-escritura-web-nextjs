-- ============================================================================
-- TRANSLATIONS DATA: AUTH - REGISTER
-- DESCRIPCIÓN: Traducciones de la página de registro
-- ============================================================================

SET search_path TO app, public;

-- auth.register.title
SELECT insert_translation('auth', 'register.title',
    '¡Únete a la aventura!',
    'Join the adventure!',
    'Rejoignez l''aventure!',
    'ui-components',
    'Título de la página de registro'
);

-- auth.register.subtitle
SELECT insert_translation('auth', 'register.subtitle',
    'Crea tu cuenta y comienza a aprender',
    'Create your account and start learning',
    'Créez votre compte et commencez à apprendre',
    'ui-components',
    'Subtítulo de la página de registro'
);

-- auth.register.name_label
SELECT insert_translation('auth', 'register.name_label',
    'Nombre completo',
    'Full name',
    'Nom complet',
    'forms',
    'Label para campo de nombre'
);

-- auth.register.name_placeholder
SELECT insert_translation('auth', 'register.name_placeholder',
    'Tu nombre completo',
    'Your full name',
    'Votre nom complet',
    'forms',
    'Placeholder para campo de nombre'
);

-- auth.register.confirm_password_label
SELECT insert_translation('auth', 'register.confirm_password_label',
    'Confirmar contraseña',
    'Confirm password',
    'Confirmer le mot de passe',
    'forms',
    'Label para confirmar contraseña'
);

-- auth.register.confirm_password_placeholder
SELECT insert_translation('auth', 'register.confirm_password_placeholder',
    'Repite tu contraseña',
    'Repeat your password',
    'Répétez votre mot de passe',
    'forms',
    'Placeholder para confirmar contraseña'
);

-- auth.register.role_label
SELECT insert_translation('auth', 'register.role_label',
    '¿Cómo vas a usar la plataforma?',
    'How will you use the platform?',
    'Comment allez-vous utiliser la plateforme?',
    'forms',
    'Label para selección de rol'
);

-- auth.register.role_description
SELECT insert_translation('auth', 'register.role_description',
    'Esto nos ayuda a personalizar tu experiencia',
    'This helps us personalize your experience',
    'Cela nous aide à personnaliser votre expérience',
    'forms',
    'Descripción de selección de rol'
);

-- auth.register.register_button
SELECT insert_translation('auth', 'register.register_button',
    '¡CREAR MI CUENTA! 🚀',
    'CREATE MY ACCOUNT! 🚀',
    'CRÉER MON COMPTE! 🚀',
    'actions',
    'Botón de registro'
);

-- auth.register.register_button_loading
SELECT insert_translation('auth', 'register.register_button_loading',
    'Creando cuenta...',
    'Creating account...',
    'Création du compte...',
    'actions',
    'Botón de registro mientras carga'
);

-- auth.register.already_have_account
SELECT insert_translation('auth', 'register.already_have_account',
    '¿Ya tienes cuenta?',
    'Already have an account?',
    'Vous avez déjà un compte?',
    'navigation',
    'Texto para ir a login'
);

-- auth.register.login_link
SELECT insert_translation('auth', 'register.login_link',
    'Inicia sesión aquí',
    'Log in here',
    'Connectez-vous ici',
    'navigation',
    'Link para ir a login'
);

-- auth.register.terms_acceptance
SELECT insert_translation('auth', 'register.terms_acceptance',
    'Acepto los',
    'I accept the',
    'J''accepte les',
    'forms',
    'Texto para aceptar términos'
);

-- auth.register.terms_link
SELECT insert_translation('auth', 'register.terms_link',
    'términos y condiciones',
    'terms and conditions',
    'termes et conditions',
    'navigation',
    'Link de términos y condiciones'
);

-- auth.register.privacy_link
SELECT insert_translation('auth', 'register.privacy_link',
    'política de privacidad',
    'privacy policy',
    'politique de confidentialité',
    'navigation',
    'Link de política de privacidad'
);

-- auth.register.and
SELECT insert_translation('auth', 'register.and',
    'y la',
    'and',
    'et la',
    'common',
    'Conjunción "y"'
);

SELECT 'TRANSLATIONS: Auth register - 16 traducciones insertadas' AS status;
