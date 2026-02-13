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

-- auth.form.login_subtitle
SELECT insert_translation('auth', 'form.login_subtitle',
    'Inicia sesion para continuar',
    'Sign in to continue',
    'Connectez-vous pour continuer',
    'forms',
    'Subtitulo de la pagina de login'
);

-- auth.form.back_to_login
SELECT insert_translation('auth', 'form.back_to_login',
    'Volver al inicio de sesion',
    'Back to sign in',
    'Retour a la connexion',
    'forms',
    'Link para volver al login'
);

-- ============================================
-- FORGOT PASSWORD
-- ============================================

-- auth.form.forgot_password_title
SELECT insert_translation('auth', 'form.forgot_password_title',
    '¿Olvidaste tu contraseña?',
    'Forgot your password?',
    'Mot de passe oublie?',
    'forms',
    'Titulo de la pagina de recuperar contraseña'
);

-- auth.form.forgot_password_subtitle
SELECT insert_translation('auth', 'form.forgot_password_subtitle',
    'Ingresa tu correo y te enviaremos un enlace para recuperarla',
    'Enter your email and we will send you a recovery link',
    'Entrez votre email et nous vous enverrons un lien de recuperation',
    'forms',
    'Subtitulo de la pagina de recuperar contraseña'
);

-- auth.form.forgot_password_submit
SELECT insert_translation('auth', 'form.forgot_password_submit',
    'Enviar enlace de recuperacion',
    'Send recovery link',
    'Envoyer le lien de recuperation',
    'actions',
    'Boton para enviar enlace de recuperacion'
);

-- auth.form.forgot_password_loading
SELECT insert_translation('auth', 'form.forgot_password_loading',
    'Enviando...',
    'Sending...',
    'Envoi...',
    'actions',
    'Texto del boton mientras envia el enlace'
);

-- auth.form.forgot_password_success_title
SELECT insert_translation('auth', 'form.forgot_password_success_title',
    'Revisa tu correo',
    'Check your email',
    'Verifiez votre email',
    'forms',
    'Titulo de exito al enviar enlace'
);

-- auth.form.forgot_password_success_message
SELECT insert_translation('auth', 'form.forgot_password_success_message',
    'Te enviamos un enlace para restablecer tu contraseña',
    'We sent you a link to reset your password',
    'Nous vous avons envoye un lien pour reinitialiser votre mot de passe',
    'forms',
    'Mensaje de exito al enviar enlace'
);

-- ============================================
-- RESET PASSWORD
-- ============================================

-- auth.form.reset_password_title
SELECT insert_translation('auth', 'form.reset_password_title',
    'Nueva contraseña',
    'New password',
    'Nouveau mot de passe',
    'forms',
    'Titulo de la pagina de nueva contraseña'
);

-- auth.form.reset_password_subtitle
SELECT insert_translation('auth', 'form.reset_password_subtitle',
    'Ingresa tu nueva contraseña',
    'Enter your new password',
    'Entrez votre nouveau mot de passe',
    'forms',
    'Subtitulo de la pagina de nueva contraseña'
);

-- auth.form.new_password_placeholder
SELECT insert_translation('auth', 'form.new_password_placeholder',
    'Nueva contraseña',
    'New password',
    'Nouveau mot de passe',
    'forms',
    'Placeholder para nueva contraseña'
);

-- auth.form.confirm_password_placeholder
SELECT insert_translation('auth', 'form.confirm_password_placeholder',
    'Confirmar contraseña',
    'Confirm password',
    'Confirmer le mot de passe',
    'forms',
    'Placeholder para confirmar contraseña'
);

-- auth.form.reset_password_submit
SELECT insert_translation('auth', 'form.reset_password_submit',
    'Restablecer contraseña',
    'Reset password',
    'Reinitialiser le mot de passe',
    'actions',
    'Boton para restablecer contraseña'
);

-- auth.form.reset_password_loading
SELECT insert_translation('auth', 'form.reset_password_loading',
    'Guardando...',
    'Saving...',
    'Sauvegarde...',
    'actions',
    'Texto del boton mientras guarda la contraseña'
);

-- auth.form.reset_password_success_title
SELECT insert_translation('auth', 'form.reset_password_success_title',
    'Contraseña actualizada',
    'Password updated',
    'Mot de passe mis a jour',
    'forms',
    'Titulo de exito al restablecer contraseña'
);

-- auth.form.reset_password_success_message
SELECT insert_translation('auth', 'form.reset_password_success_message',
    'Ya puedes iniciar sesion con tu nueva contraseña',
    'You can now sign in with your new password',
    'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe',
    'forms',
    'Mensaje de exito al restablecer contraseña'
);

-- ============================================
-- COMPLETE PROFILE (post-OAuth)
-- ============================================

-- auth.form.complete_profile_title
SELECT insert_translation('auth', 'form.complete_profile_title',
    '¡Bienvenido! Completa tu perfil',
    'Welcome! Complete your profile',
    'Bienvenue! Completez votre profil',
    'forms',
    'Titulo de la pagina de completar perfil post-OAuth'
);

-- auth.form.complete_profile_subtitle
SELECT insert_translation('auth', 'form.complete_profile_subtitle',
    'Selecciona tu tipo de usuario para continuar',
    'Select your user type to continue',
    'Selectionnez votre type utilisateur pour continuer',
    'forms',
    'Subtitulo de la pagina de completar perfil'
);

-- auth.form.complete_profile_submit
SELECT insert_translation('auth', 'form.complete_profile_submit',
    '¡Empezar a aprender! 🚀',
    'Start learning! 🚀',
    'Commencer a apprendre! 🚀',
    'actions',
    'Boton para completar perfil y continuar'
);

-- auth.form.complete_profile_loading
SELECT insert_translation('auth', 'form.complete_profile_loading',
    'Guardando...',
    'Saving...',
    'Sauvegarde...',
    'actions',
    'Texto del boton mientras guarda el perfil'
);

SELECT 'TRANSLATIONS: Auth forms - 29 traducciones insertadas' AS status;
