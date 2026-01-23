-- ============================================================================
-- TRANSLATIONS DATA: AUTH - MENSAJES
-- DESCRIPCIÓN: Mensajes del sistema de autenticación
-- ============================================================================

SET search_path TO app, public;

-- auth.messages.login_success
SELECT insert_translation('auth', 'messages.login_success',
    '¡Bienvenido de vuelta!',
    'Welcome back!',
    'Bon retour!',
    'messages',
    'Mensaje de login exitoso'
);

-- auth.messages.register_success
SELECT insert_translation('auth', 'messages.register_success',
    '¡Cuenta creada exitosamente!',
    'Account created successfully!',
    'Compte créé avec succès!',
    'messages',
    'Mensaje de registro exitoso'
);

-- auth.messages.logout_success
SELECT insert_translation('auth', 'messages.logout_success',
    'Sesión cerrada exitosamente',
    'Successfully logged out',
    'Déconnexion réussie',
    'messages',
    'Mensaje de logout exitoso'
);

-- auth.messages.check_email
SELECT insert_translation('auth', 'messages.check_email',
    'Revisa tu correo electrónico',
    'Check your email',
    'Vérifiez votre email',
    'messages',
    'Mensaje para revisar email'
);

-- auth.messages.check_email_description
SELECT insert_translation('auth', 'messages.check_email_description',
    'Te enviamos un enlace de confirmación. Por favor revisa tu bandeja de entrada.',
    'We sent you a confirmation link. Please check your inbox.',
    'Nous vous avons envoyé un lien de confirmation. Veuillez vérifier votre boîte de réception.',
    'messages',
    'Descripción de revisar email'
);

SELECT 'TRANSLATIONS: Auth messages - 5 traducciones insertadas' AS status;
