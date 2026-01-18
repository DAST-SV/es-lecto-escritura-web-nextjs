-- ============================================
-- MIGRACIÓN: Insertar rutas del sistema ROUTE_KEYS
-- FECHA: 2026-01-18
-- DESCRIPCIÓN: Inserta todas las rutas definidas en route-keys.config.ts
--              con traducciones en ES, EN, FR, IT
-- ============================================

-- ========================================
-- FUNCIÓN AUXILIAR: Insertar ruta con traducciones
-- ========================================
CREATE OR REPLACE FUNCTION insert_route_with_translations(
  p_pathname TEXT,
  p_display_name TEXT,
  p_is_public BOOLEAN DEFAULT FALSE,
  p_show_in_menu BOOLEAN DEFAULT FALSE,
  p_trans_es TEXT DEFAULT NULL,
  p_trans_en TEXT DEFAULT NULL,
  p_trans_fr TEXT DEFAULT NULL,
  p_trans_it TEXT DEFAULT NULL,
  p_name_es TEXT DEFAULT NULL,
  p_name_en TEXT DEFAULT NULL,
  p_name_fr TEXT DEFAULT NULL,
  p_name_it TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_route_id UUID;
BEGIN
  -- Verificar si la ruta ya existe
  SELECT id INTO v_route_id
  FROM app.routes
  WHERE pathname = p_pathname;

  -- Si no existe, insertarla
  IF v_route_id IS NULL THEN
    INSERT INTO app.routes (pathname, display_name, is_public, show_in_menu, is_active)
    VALUES (p_pathname, p_display_name, p_is_public, p_show_in_menu, TRUE)
    RETURNING id INTO v_route_id;

    RAISE NOTICE 'Ruta insertada: % (ID: %)', p_pathname, v_route_id;
  ELSE
    RAISE NOTICE 'Ruta ya existe: % (ID: %)', p_pathname, v_route_id;
  END IF;

  -- Insertar traducciones (solo si no existen)
  -- Español
  IF p_trans_es IS NOT NULL THEN
    INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
    VALUES (v_route_id, 'es', p_trans_es, COALESCE(p_name_es, p_display_name))
    ON CONFLICT (route_id, language_code) DO UPDATE
    SET translated_path = EXCLUDED.translated_path,
        translated_name = EXCLUDED.translated_name;
  END IF;

  -- Inglés
  IF p_trans_en IS NOT NULL THEN
    INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
    VALUES (v_route_id, 'en', p_trans_en, COALESCE(p_name_en, p_display_name))
    ON CONFLICT (route_id, language_code) DO UPDATE
    SET translated_path = EXCLUDED.translated_path,
        translated_name = EXCLUDED.translated_name;
  END IF;

  -- Francés
  IF p_trans_fr IS NOT NULL THEN
    INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
    VALUES (v_route_id, 'fr', p_trans_fr, COALESCE(p_name_fr, p_display_name))
    ON CONFLICT (route_id, language_code) DO UPDATE
    SET translated_path = EXCLUDED.translated_path,
        translated_name = EXCLUDED.translated_name;
  END IF;

  -- Italiano
  IF p_trans_it IS NOT NULL THEN
    INSERT INTO app.route_translations (route_id, language_code, translated_path, translated_name)
    VALUES (v_route_id, 'it', p_trans_it, COALESCE(p_name_it, p_display_name))
    ON CONFLICT (route_id, language_code) DO UPDATE
    SET translated_path = EXCLUDED.translated_path,
        translated_name = EXCLUDED.translated_name;
  END IF;

  RETURN v_route_id;
END;
$$ LANGUAGE plpgsql;


-- ========================================
-- INSERTAR RUTAS PÚBLICAS
-- ========================================

-- Home
SELECT insert_route_with_translations(
  '/', 'Inicio', TRUE, TRUE,
  '/', '/', '/', '/',
  'Inicio', 'Home', 'Accueil', 'Home'
);

-- ========================================
-- RUTAS DE AUTENTICACIÓN (PÚBLICAS)
-- ========================================

SELECT insert_route_with_translations(
  '/auth/login', 'Iniciar Sesión', TRUE, FALSE,
  '/auth/iniciar-sesion', '/auth/login', '/auth/connexion', '/auth/accedi',
  'Iniciar Sesión', 'Login', 'Connexion', 'Accedi'
);

SELECT insert_route_with_translations(
  '/auth/signup', 'Registrarse', TRUE, FALSE,
  '/auth/registrarse', '/auth/signup', '/auth/inscription', '/auth/iscriviti',
  'Registrarse', 'Sign Up', 'Inscription', 'Iscriviti'
);

SELECT insert_route_with_translations(
  '/auth/callback', 'Callback Autenticación', TRUE, FALSE,
  '/auth/callback', '/auth/callback', '/auth/callback', '/auth/callback',
  'Callback', 'Callback', 'Callback', 'Callback'
);

SELECT insert_route_with_translations(
  '/auth/reset-password', 'Restablecer Contraseña', TRUE, FALSE,
  '/auth/restablecer-contrasena', '/auth/reset-password', '/auth/reinitialiser-mot-de-passe', '/auth/reimposta-password',
  'Restablecer Contraseña', 'Reset Password', 'Réinitialiser Mot de Passe', 'Reimposta Password'
);

-- ========================================
-- RUTAS DE LIBROS (PROTEGIDAS)
-- ========================================

SELECT insert_route_with_translations(
  '/books', 'Libros', FALSE, TRUE,
  '/libros', '/books', '/livres', '/libri',
  'Libros', 'Books', 'Livres', 'Libri'
);

SELECT insert_route_with_translations(
  '/books/create', 'Crear Libro', FALSE, FALSE,
  '/libros/crear', '/books/create', '/livres/creer', '/libri/crea',
  'Crear Libro', 'Create Book', 'Créer Livre', 'Crea Libro'
);

SELECT insert_route_with_translations(
  '/books/[id]/edit', 'Editar Libro', FALSE, FALSE,
  '/libros/[id]/editar', '/books/[id]/edit', '/livres/[id]/modifier', '/libri/[id]/modifica',
  'Editar Libro', 'Edit Book', 'Modifier Livre', 'Modifica Libro'
);

SELECT insert_route_with_translations(
  '/books/[id]/read', 'Leer Libro', FALSE, FALSE,
  '/libros/[id]/leer', '/books/[id]/read', '/livres/[id]/lire', '/libri/[id]/leggi',
  'Leer Libro', 'Read Book', 'Lire Livre', 'Leggi Libro'
);

SELECT insert_route_with_translations(
  '/books/[id]/statistics', 'Estadísticas del Libro', FALSE, FALSE,
  '/libros/[id]/estadisticas', '/books/[id]/statistics', '/livres/[id]/statistiques', '/libri/[id]/statistiche',
  'Estadísticas', 'Statistics', 'Statistiques', 'Statistiche'
);

SELECT insert_route_with_translations(
  '/books/trash', 'Papelera de Libros', FALSE, FALSE,
  '/libros/papelera', '/books/trash', '/livres/corbeille', '/libri/cestino',
  'Papelera', 'Trash', 'Corbeille', 'Cestino'
);

-- ========================================
-- NAVEGACIÓN PRINCIPAL
-- ========================================

SELECT insert_route_with_translations(
  '/library', 'Biblioteca', FALSE, TRUE,
  '/biblioteca', '/library', '/bibliotheque', '/biblioteca',
  'Biblioteca', 'Library', 'Bibliothèque', 'Biblioteca'
);

SELECT insert_route_with_translations(
  '/my-world', 'Mi Mundo', FALSE, TRUE,
  '/mi-mundo', '/my-world', '/mon-monde', '/mio-mondo',
  'Mi Mundo', 'My World', 'Mon Monde', 'Mio Mondo'
);

SELECT insert_route_with_translations(
  '/my-progress', 'Mi Progreso', FALSE, TRUE,
  '/mi-progreso', '/my-progress', '/mon-progres', '/mio-progresso',
  'Mi Progreso', 'My Progress', 'Mon Progrès', 'Mio Progresso'
);

-- ========================================
-- ORGANIZACIONES
-- ========================================

SELECT insert_route_with_translations(
  '/organizations', 'Organizaciones', FALSE, TRUE,
  '/organizaciones', '/organizations', '/organisations', '/organizzazioni',
  'Organizaciones', 'Organizations', 'Organisations', 'Organizzazioni'
);

SELECT insert_route_with_translations(
  '/organizations/create', 'Crear Organización', FALSE, FALSE,
  '/organizaciones/crear', '/organizations/create', '/organisations/creer', '/organizzazioni/crea',
  'Crear Organización', 'Create Organization', 'Créer Organisation', 'Crea Organizzazione'
);

SELECT insert_route_with_translations(
  '/organizations/[id]/edit', 'Editar Organización', FALSE, FALSE,
  '/organizaciones/[id]/editar', '/organizations/[id]/edit', '/organisations/[id]/modifier', '/organizzazioni/[id]/modifica',
  'Editar Organización', 'Edit Organization', 'Modifier Organisation', 'Modifica Organizzazione'
);

-- ========================================
-- TIPOS DE USUARIO
-- ========================================

SELECT insert_route_with_translations(
  '/user-types', 'Tipos de Usuario', FALSE, FALSE,
  '/tipos-usuario', '/user-types', '/types-utilisateur', '/tipi-utente',
  'Tipos de Usuario', 'User Types', 'Types Utilisateur', 'Tipi Utente'
);

SELECT insert_route_with_translations(
  '/user-types/create', 'Crear Tipo de Usuario', FALSE, FALSE,
  '/tipos-usuario/crear', '/user-types/create', '/types-utilisateur/creer', '/tipi-utente/crea',
  'Crear Tipo', 'Create Type', 'Créer Type', 'Crea Tipo'
);

SELECT insert_route_with_translations(
  '/user-types/[id]/edit', 'Editar Tipo de Usuario', FALSE, FALSE,
  '/tipos-usuario/[id]/editar', '/user-types/[id]/edit', '/types-utilisateur/[id]/modifier', '/tipi-utente/[id]/modifica',
  'Editar Tipo', 'Edit Type', 'Modifier Type', 'Modifica Tipo'
);

-- ========================================
-- ADMINISTRACIÓN
-- ========================================

SELECT insert_route_with_translations(
  '/admin', 'Panel de Administración', FALSE, TRUE,
  '/admin', '/admin', '/admin', '/admin',
  'Administración', 'Administration', 'Administration', 'Amministrazione'
);

SELECT insert_route_with_translations(
  '/admin/users', 'Gestión de Usuarios', FALSE, TRUE,
  '/admin/usuarios', '/admin/users', '/admin/utilisateurs', '/admin/utenti',
  'Usuarios', 'Users', 'Utilisateurs', 'Utenti'
);

SELECT insert_route_with_translations(
  '/admin/roles', 'Gestión de Roles', FALSE, TRUE,
  '/admin/roles', '/admin/roles', '/admin/roles', '/admin/ruoli',
  'Roles', 'Roles', 'Rôles', 'Ruoli'
);

SELECT insert_route_with_translations(
  '/admin/translations', 'Gestión de Traducciones', FALSE, TRUE,
  '/admin/traducciones', '/admin/translations', '/admin/traductions', '/admin/traduzioni',
  'Traducciones', 'Translations', 'Traductions', 'Traduzioni'
);

SELECT insert_route_with_translations(
  '/admin/audit', 'Auditoría del Sistema', FALSE, TRUE,
  '/admin/auditoria', '/admin/audit', '/admin/audit', '/admin/audit',
  'Auditoría', 'Audit', 'Audit', 'Audit'
);

-- ========================================
-- ADMINISTRACIÓN - RBAC
-- ========================================

SELECT insert_route_with_translations(
  '/admin/routes', 'Gestión de Rutas', FALSE, TRUE,
  '/admin/rutas', '/admin/routes', '/admin/routes', '/admin/percorsi',
  'Rutas', 'Routes', 'Routes', 'Percorsi'
);

SELECT insert_route_with_translations(
  '/admin/route-scanner', 'Escáner de Rutas', FALSE, FALSE,
  '/admin/escaner-rutas', '/admin/route-scanner', '/admin/scanner-routes', '/admin/scanner-percorsi',
  'Escáner de Rutas', 'Route Scanner', 'Scanner Routes', 'Scanner Percorsi'
);

SELECT insert_route_with_translations(
  '/admin/route-translations', 'Traducciones de Rutas', FALSE, TRUE,
  '/admin/traducciones-rutas', '/admin/route-translations', '/admin/traductions-routes', '/admin/traduzioni-percorsi',
  'Traducciones de Rutas', 'Route Translations', 'Traductions Routes', 'Traduzioni Percorsi'
);

SELECT insert_route_with_translations(
  '/admin/role-permissions', 'Permisos de Roles', FALSE, TRUE,
  '/admin/permisos-roles', '/admin/role-permissions', '/admin/permissions-roles', '/admin/permessi-ruoli',
  'Permisos de Roles', 'Role Permissions', 'Permissions Rôles', 'Permessi Ruoli'
);

SELECT insert_route_with_translations(
  '/admin/user-permissions', 'Permisos de Usuarios', FALSE, TRUE,
  '/admin/permisos-usuarios', '/admin/user-permissions', '/admin/permissions-utilisateurs', '/admin/permessi-utenti',
  'Permisos de Usuarios', 'User Permissions', 'Permissions Utilisateurs', 'Permessi Utenti'
);

SELECT insert_route_with_translations(
  '/admin/user-roles', 'Asignación de Roles', FALSE, TRUE,
  '/admin/roles-usuarios', '/admin/user-roles', '/admin/roles-utilisateurs', '/admin/ruoli-utenti',
  'Roles de Usuarios', 'User Roles', 'Rôles Utilisateurs', 'Ruoli Utenti'
);

-- ========================================
-- ERRORES
-- ========================================

SELECT insert_route_with_translations(
  '/error', 'Error', TRUE, FALSE,
  '/error', '/error', '/erreur', '/errore',
  'Error', 'Error', 'Erreur', 'Errore'
);

SELECT insert_route_with_translations(
  '/forbidden', 'Acceso Denegado', TRUE, FALSE,
  '/prohibido', '/forbidden', '/interdit', '/vietato',
  'Acceso Denegado', 'Forbidden', 'Interdit', 'Vietato'
);

-- ========================================
-- LIMPIAR FUNCIÓN AUXILIAR (OPCIONAL)
-- ========================================
-- DROP FUNCTION IF EXISTS insert_route_with_translations;

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

DO $$
DECLARE
  v_total_routes INTEGER;
  v_total_translations INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_routes FROM app.routes WHERE is_active = TRUE;
  SELECT COUNT(*) INTO v_total_translations FROM app.route_translations;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMEN DE INSERCIÓN';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de rutas activas: %', v_total_routes;
  RAISE NOTICE 'Total de traducciones: %', v_total_translations;
  RAISE NOTICE '========================================';
END $$;
