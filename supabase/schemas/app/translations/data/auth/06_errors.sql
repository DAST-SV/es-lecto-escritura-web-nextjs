-- supabase/schemas/app/translations/data/auth/06_errors.sql
-- ============================================================================
-- TRANSLATIONS DATA: AUTH - ERRORES
-- DESCRIPCIÓN: Mensajes de error de autenticación
-- ============================================================================

SET search_path TO app, public;

-- auth.errors.invalid_credentials
SELECT insert_translation('auth', 'errors.invalid_credentials',
    'Credenciales inválidas. Verifica tu email y contraseña.',
    'Invalid credentials. Please check your email and password.',
    'Identifiants invalides. Veuillez vérifier votre email et mot de passe.',
    'errors',
    'Error de credenciales inválidas'
);

-- auth.errors.email_not_confirmed
SELECT insert_translation('auth', 'errors.email_not_confirmed',
    'Por favor confirma tu email antes de iniciar sesión.',
    'Please confirm your email before signing in.',
    'Veuillez confirmer votre email avant de vous connecter.',
    'errors',
    'Error de email no confirmado'
);

-- auth.errors.user_not_found
SELECT insert_translation('auth', 'errors.user_not_found',
    'No encontramos una cuenta con este email.',
    'No account found with this email.',
    'Aucun compte trouvé avec cet email.',
    'errors',
    'Error de usuario no encontrado'
);

-- auth.errors.invalid_email
SELECT insert_translation('auth', 'errors.invalid_email',
    'El formato del email no es válido.',
    'Invalid email format.',
    'Format d''email invalide.',
    'errors',
    'Error de formato de email'
);

-- auth.errors.weak_password
SELECT insert_translation('auth', 'errors.weak_password',
    'La contraseña debe tener al menos 6 caracteres.',
    'Password must be at least 6 characters long.',
    'Le mot de passe doit contenir au moins 6 caractères.',
    'errors',
    'Error de contraseña débil'
);

-- auth.errors.password_mismatch
SELECT insert_translation('auth', 'errors.password_mismatch',
    'Las contraseñas no coinciden.',
    'Passwords don''t match.',
    'Les mots de passe ne correspondent pas.',
    'errors',
    'Error de contraseñas no coinciden'
);

-- auth.errors.email_already_registered
SELECT insert_translation('auth', 'errors.email_already_registered',
    'Ya existe una cuenta con este email.',
    'An account with this email already exists.',
    'Un compte avec cet email existe déjà.',
    'errors',
    'Error de email ya registrado'
);

-- auth.errors.role_required
SELECT insert_translation('auth', 'errors.role_required',
    'Por favor selecciona un rol.',
    'Please select a role.',
    'Veuillez sélectionner un rôle.',
    'errors',
    'Error de rol requerido'
);

-- auth.errors.name_required
SELECT insert_translation('auth', 'errors.name_required',
    'Por favor ingresa tu nombre completo.',
    'Please enter your full name.',
    'Veuillez entrer votre nom complet.',
    'errors',
    'Error de nombre requerido'
);

-- auth.errors.terms_required
SELECT insert_translation('auth', 'errors.terms_required',
    'Debes aceptar los términos y condiciones.',
    'You must accept the terms and conditions.',
    'Vous devez accepter les termes et conditions.',
    'errors',
    'Error de términos requeridos'
);

-- auth.errors.oauth_error
SELECT insert_translation('auth', 'errors.oauth_error',
    'Error al iniciar sesión con el proveedor. Intenta de nuevo.',
    'Error signing in with provider. Please try again.',
    'Erreur de connexion avec le fournisseur. Veuillez réessayer.',
    'errors',
    'Error genérico de OAuth'
);

SELECT 'TRANSLATIONS: Auth errors - 11 traducciones insertadas' AS status;
