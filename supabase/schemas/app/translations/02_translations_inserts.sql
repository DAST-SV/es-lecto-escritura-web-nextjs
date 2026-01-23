-- ============================================================================
-- INSERTS DE TRADUCCIONES COMPLETAS - ES LECTO ESCRITURA
-- ============================================================================
-- Este script inserta todas las claves y traducciones necesarias para:
-- - auth (login, register, providers, errors, messages)
-- - navigation (navbar, menu items)
-- - common (botones, labels comunes)
-- - errors (mensajes de error del sistema)
-- ============================================================================

-- ============================================================================
-- HELPERS: Funciones para insertar claves y traducciones fácilmente
-- ============================================================================

-- Función helper para insertar una clave con sus traducciones
CREATE OR REPLACE FUNCTION insert_translation(
    p_namespace VARCHAR(100),
    p_key_name VARCHAR(500),
    p_es TEXT,
    p_en TEXT,
    p_fr TEXT,
    p_category VARCHAR(100) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    v_key_id UUID;
    v_category_id UUID;
BEGIN
    -- Obtener category_id si se proporciona
    IF p_category IS NOT NULL THEN
        SELECT id INTO v_category_id FROM app.translation_categories WHERE slug = p_category;
    END IF;

    -- Insertar la clave (o obtener si ya existe)
    INSERT INTO app.translation_keys (namespace_slug, key_name, category_id, description, is_system_key, is_active)
    VALUES (p_namespace, p_key_name, v_category_id, p_description, true, true)
    ON CONFLICT (namespace_slug, key_name) DO UPDATE
    SET description = EXCLUDED.description, category_id = EXCLUDED.category_id
    RETURNING id INTO v_key_id;

    -- Insertar traducciones en español
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'es', p_es, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;

    -- Insertar traducciones en inglés
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'en', p_en, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;

    -- Insertar traducciones en francés
    INSERT INTO app.translations (translation_key_id, language_code, value, is_active, is_verified)
    VALUES (v_key_id, 'fr', p_fr, true, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value, is_verified = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. TRADUCCIONES DE AUTH - FORMULARIOS
-- ============================================================================

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

-- ============================================================================
-- 2. TRADUCCIONES DE AUTH - LOGIN
-- ============================================================================

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

-- ============================================================================
-- 3. TRADUCCIONES DE AUTH - REGISTER
-- ============================================================================

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

-- ============================================================================
-- 4. TRADUCCIONES DE AUTH - ROLES
-- ============================================================================

-- auth.roles.student.name
SELECT insert_translation('auth', 'roles.student.name',
    'Estudiante',
    'Student',
    'Étudiant',
    'ui-components',
    'Nombre del rol estudiante'
);

-- auth.roles.student.description
SELECT insert_translation('auth', 'roles.student.description',
    'Quiero aprender a leer y escribir',
    'I want to learn reading and writing',
    'Je veux apprendre à lire et écrire',
    'ui-components',
    'Descripción del rol estudiante'
);

-- auth.roles.teacher.name
SELECT insert_translation('auth', 'roles.teacher.name',
    'Maestro/a',
    'Teacher',
    'Enseignant',
    'ui-components',
    'Nombre del rol maestro'
);

-- auth.roles.teacher.description
SELECT insert_translation('auth', 'roles.teacher.description',
    'Quiero enseñar a mis estudiantes',
    'I want to teach my students',
    'Je veux enseigner à mes élèves',
    'ui-components',
    'Descripción del rol maestro'
);

-- auth.roles.parent.name
SELECT insert_translation('auth', 'roles.parent.name',
    'Padre/Madre',
    'Parent',
    'Parent',
    'ui-components',
    'Nombre del rol padre'
);

-- auth.roles.parent.description
SELECT insert_translation('auth', 'roles.parent.description',
    'Quiero ayudar a mis hijos',
    'I want to help my children',
    'Je veux aider mes enfants',
    'ui-components',
    'Descripción del rol padre'
);

-- auth.roles.school.name
SELECT insert_translation('auth', 'roles.school.name',
    'Escuela',
    'School',
    'École',
    'ui-components',
    'Nombre del rol escuela'
);

-- auth.roles.school.description
SELECT insert_translation('auth', 'roles.school.description',
    'Quiero gestionar mi institución',
    'I want to manage my institution',
    'Je veux gérer mon institution',
    'ui-components',
    'Descripción del rol escuela'
);

-- auth.roles.individual.name
SELECT insert_translation('auth', 'roles.individual.name',
    'Usuario Individual',
    'Individual User',
    'Utilisateur Individuel',
    'ui-components',
    'Nombre del rol individual'
);

-- auth.roles.individual.description
SELECT insert_translation('auth', 'roles.individual.description',
    'Quiero aprender por mi cuenta',
    'I want to learn on my own',
    'Je veux apprendre par moi-même',
    'ui-components',
    'Descripción del rol individual'
);

-- ============================================================================
-- 5. TRADUCCIONES DE AUTH - PROVIDERS
-- ============================================================================

-- auth.providers.google
SELECT insert_translation('auth', 'providers.google',
    'Google',
    'Google',
    'Google',
    'ui-components',
    'Nombre del proveedor Google'
);

-- auth.providers.facebook
SELECT insert_translation('auth', 'providers.facebook',
    'Facebook',
    'Facebook',
    'Facebook',
    'ui-components',
    'Nombre del proveedor Facebook'
);

-- auth.providers.github
SELECT insert_translation('auth', 'providers.github',
    'GitHub',
    'GitHub',
    'GitHub',
    'ui-components',
    'Nombre del proveedor GitHub'
);

-- auth.providers.apple
SELECT insert_translation('auth', 'providers.apple',
    'Apple',
    'Apple',
    'Apple',
    'ui-components',
    'Nombre del proveedor Apple'
);

-- auth.providers.microsoft
SELECT insert_translation('auth', 'providers.microsoft',
    'Microsoft',
    'Microsoft',
    'Microsoft',
    'ui-components',
    'Nombre del proveedor Microsoft'
);

-- ============================================================================
-- 6. TRADUCCIONES DE AUTH - ERRORES
-- ============================================================================

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

-- ============================================================================
-- 7. TRADUCCIONES DE AUTH - MENSAJES
-- ============================================================================

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

-- ============================================================================
-- 8. TRADUCCIONES DE NAVIGATION - NAVBAR
-- ============================================================================

-- navigation.home
SELECT insert_translation('navigation', 'home',
    'Inicio',
    'Home',
    'Accueil',
    'navigation',
    'Link de inicio'
);

-- navigation.login
SELECT insert_translation('navigation', 'login',
    'Iniciar sesión',
    'Login',
    'Connexion',
    'navigation',
    'Link de login'
);

-- navigation.register
SELECT insert_translation('navigation', 'register',
    'Registrarse',
    'Sign up',
    'Inscription',
    'navigation',
    'Link de registro'
);

-- navigation.logout
SELECT insert_translation('navigation', 'logout',
    'Cerrar sesión',
    'Logout',
    'Déconnexion',
    'navigation',
    'Link de cerrar sesión'
);

-- navigation.profile
SELECT insert_translation('navigation', 'profile',
    'Perfil',
    'Profile',
    'Profil',
    'navigation',
    'Link de perfil'
);

-- navigation.settings
SELECT insert_translation('navigation', 'settings',
    'Configuración',
    'Settings',
    'Paramètres',
    'navigation',
    'Link de configuración'
);

-- navigation.library
SELECT insert_translation('navigation', 'library',
    'Biblioteca',
    'Library',
    'Bibliothèque',
    'navigation',
    'Link de biblioteca'
);

-- navigation.my_world
SELECT insert_translation('navigation', 'my_world',
    'Mi Mundo',
    'My World',
    'Mon Monde',
    'navigation',
    'Link de mi mundo'
);

-- navigation.my_progress
SELECT insert_translation('navigation', 'my_progress',
    'Mi Progreso',
    'My Progress',
    'Mes Progrès',
    'navigation',
    'Link de mi progreso'
);

-- navigation.about
SELECT insert_translation('navigation', 'about',
    'Acerca de',
    'About',
    'À propos',
    'navigation',
    'Link de acerca de'
);

-- navigation.virtual_tour
SELECT insert_translation('navigation', 'virtual_tour',
    'Tour Virtual',
    'Virtual Tour',
    'Visite Virtuelle',
    'navigation',
    'Link de tour virtual'
);

-- ============================================================================
-- 9. TRADUCCIONES COMUNES
-- ============================================================================

-- common.save
SELECT insert_translation('common', 'save',
    'Guardar',
    'Save',
    'Enregistrer',
    'actions',
    'Botón guardar'
);

-- common.cancel
SELECT insert_translation('common', 'cancel',
    'Cancelar',
    'Cancel',
    'Annuler',
    'actions',
    'Botón cancelar'
);

-- common.delete
SELECT insert_translation('common', 'delete',
    'Eliminar',
    'Delete',
    'Supprimer',
    'actions',
    'Botón eliminar'
);

-- common.edit
SELECT insert_translation('common', 'edit',
    'Editar',
    'Edit',
    'Modifier',
    'actions',
    'Botón editar'
);

-- common.submit
SELECT insert_translation('common', 'submit',
    'Enviar',
    'Submit',
    'Soumettre',
    'actions',
    'Botón enviar'
);

-- common.loading
SELECT insert_translation('common', 'loading',
    'Cargando...',
    'Loading...',
    'Chargement...',
    'ui-components',
    'Texto de cargando'
);

-- common.search
SELECT insert_translation('common', 'search',
    'Buscar',
    'Search',
    'Rechercher',
    'actions',
    'Botón/campo buscar'
);

-- common.close
SELECT insert_translation('common', 'close',
    'Cerrar',
    'Close',
    'Fermer',
    'actions',
    'Botón cerrar'
);

-- common.back
SELECT insert_translation('common', 'back',
    'Atrás',
    'Back',
    'Retour',
    'navigation',
    'Botón atrás'
);

-- common.next
SELECT insert_translation('common', 'next',
    'Siguiente',
    'Next',
    'Suivant',
    'navigation',
    'Botón siguiente'
);

-- common.previous
SELECT insert_translation('common', 'previous',
    'Anterior',
    'Previous',
    'Précédent',
    'navigation',
    'Botón anterior'
);

-- common.confirm
SELECT insert_translation('common', 'confirm',
    'Confirmar',
    'Confirm',
    'Confirmer',
    'actions',
    'Botón confirmar'
);

-- common.yes
SELECT insert_translation('common', 'yes',
    'Sí',
    'Yes',
    'Oui',
    'actions',
    'Respuesta sí'
);

-- common.no
SELECT insert_translation('common', 'no',
    'No',
    'No',
    'Non',
    'actions',
    'Respuesta no'
);

-- ============================================================================
-- 10. TRADUCCIONES DE ERRORES COMUNES
-- ============================================================================

-- errors.required_field
SELECT insert_translation('errors', 'required_field',
    'Este campo es obligatorio',
    'This field is required',
    'Ce champ est obligatoire',
    'errors',
    'Error de campo requerido'
);

-- errors.invalid_format
SELECT insert_translation('errors', 'invalid_format',
    'Formato inválido',
    'Invalid format',
    'Format invalide',
    'errors',
    'Error de formato inválido'
);

-- errors.generic_error
SELECT insert_translation('errors', 'generic_error',
    'Ocurrió un error inesperado. Intenta de nuevo.',
    'An unexpected error occurred. Please try again.',
    'Une erreur inattendue s''est produite. Veuillez réessayer.',
    'errors',
    'Error genérico'
);

-- errors.network_error
SELECT insert_translation('errors', 'network_error',
    'Error de conexión. Verifica tu internet.',
    'Connection error. Please check your internet.',
    'Erreur de connexion. Vérifiez votre connexion internet.',
    'errors',
    'Error de red'
);

-- ============================================================================
-- LIMPIEZA: Eliminar función helper
-- ============================================================================

DROP FUNCTION IF EXISTS insert_translation;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver cantidad de claves por namespace
SELECT
    namespace_slug,
    COUNT(*) as total_keys
FROM app.translation_keys
GROUP BY namespace_slug
ORDER BY namespace_slug;

-- Ver cantidad de traducciones por idioma
SELECT
    language_code,
    COUNT(*) as total_translations
FROM app.translations
GROUP BY language_code
ORDER BY language_code;

-- Ver muestra de traducciones de auth
SELECT
    tk.namespace_slug,
    tk.key_name,
    t.language_code,
    t.value
FROM app.translation_keys tk
JOIN app.translations t ON tk.id = t.translation_key_id
WHERE tk.namespace_slug = 'auth'
ORDER BY tk.key_name, t.language_code
LIMIT 30;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- auth: ~60 claves
-- navigation: ~11 claves
-- common: ~14 claves
-- errors: ~4 claves
-- TOTAL: ~89 claves x 3 idiomas = ~267 traducciones
-- ============================================================================
