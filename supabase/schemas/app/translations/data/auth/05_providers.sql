-- ============================================================================
-- TRANSLATIONS DATA: AUTH - PROVIDERS
-- DESCRIPCIÓN: Traducciones de proveedores OAuth
-- ============================================================================

SET search_path TO app, public;

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

SELECT 'TRANSLATIONS: Auth providers - 5 traducciones insertadas' AS status;
