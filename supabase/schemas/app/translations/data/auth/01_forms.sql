-- supabase/schemas/app/translations/data/auth/01_forms.sql
-- ============================================================================
-- TRANSLATIONS DATA: AUTH - FORMULARIOS
-- DESCRIPCIÓN: Traducciones de campos de formularios de autenticación
-- ============================================================================

SET search_path TO app, public;

-- auth.form.email_label
SELECT insert_translation('auth', 'form.email_label',
    'Correo electrónico',
    'Email',
    'Email',
    'forms',
    'Label para campo de email'
);

-- auth.form.email_placeholder
SELECT insert_translation('auth', 'form.email_placeholder',
    'Tu correo electrónico',
    'Your email address',
    'Votre adresse email',
    'forms',
    'Placeholder para campo de email'
);

-- auth.form.password_label
SELECT insert_translation('auth', 'form.password_label',
    'Contraseña',
    'Password',
    'Mot de passe',
    'forms',
    'Label para campo de contraseña'
);

-- auth.form.password_placeholder
SELECT insert_translation('auth', 'form.password_placeholder',
    'Tu contraseña',
    'Your password',
    'Votre mot de passe',
    'forms',
    'Placeholder para campo de contraseña'
);

-- auth.form.remember_me
SELECT insert_translation('auth', 'form.remember_me',
    'Recordarme',
    'Remember me',
    'Se souvenir de moi',
    'forms',
    'Texto para checkbox de recordarme'
);

-- auth.form.forgot_password
SELECT insert_translation('auth', 'form.forgot_password',
    '¿Olvidaste tu contraseña?',
    'Forgot your password?',
    'Mot de passe oublié?',
    'forms',
    'Link para recuperar contraseña'
);

-- auth.form.login_button
SELECT insert_translation('auth', 'form.login_button',
    '¡ENTRAR A APRENDER! 📚',
    'LOGIN TO LEARN! 📚',
    'CONNEXION POUR APPRENDRE! 📚',
    'actions',
    'Texto del botón de login'
);

-- auth.form.login_button_loading
SELECT insert_translation('auth', 'form.login_button_loading',
    'Ingresando...',
    'Logging in...',
    'Connexion...',
    'actions',
    'Texto del botón de login mientras carga'
);

-- auth.form.connect_with
SELECT insert_translation('auth', 'form.connect_with',
    'Conéctate con',
    'Connect with',
    'Connectez-vous avec',
    'ui-components',
    'Texto para sección de OAuth providers'
);

-- auth.form.or_use_email
SELECT insert_translation('auth', 'form.or_use_email',
    'o usa tu email',
    'or use your email',
    'ou utilisez votre email',
    'ui-components',
    'Texto divisor entre OAuth y email'
);

SELECT 'TRANSLATIONS: Auth forms - 10 traducciones insertadas' AS status;
