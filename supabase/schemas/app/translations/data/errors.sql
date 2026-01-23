-- ============================================================================
-- TRANSLATIONS DATA: ERRORS
-- DESCRIPCIÓN: Mensajes de error comunes del sistema
-- ============================================================================

SET search_path TO app, public;

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

SELECT 'TRANSLATIONS: Errors - 4 traducciones insertadas' AS status;
