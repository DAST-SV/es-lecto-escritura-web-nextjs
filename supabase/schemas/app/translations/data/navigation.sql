-- ============================================================================
-- TRANSLATIONS DATA: NAVIGATION
-- DESCRIPCIÓN: Traducciones de menús y navegación
-- ============================================================================

SET search_path TO app, public;

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

SELECT 'TRANSLATIONS: Navigation - 11 traducciones insertadas' AS status;
