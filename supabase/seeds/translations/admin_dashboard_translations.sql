-- ============================================
-- Script: Admin Dashboard Translations
-- Propósito: Traducciones completas para el panel de administración
-- ============================================

-- Primero asegurarnos de que existe el namespace 'admin'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM app.translation_namespaces WHERE slug = 'admin'
  ) THEN
    INSERT INTO app.translation_namespaces (slug, name, description, is_active)
    VALUES ('admin', 'Administración', 'Traducciones del panel de administración', true);
  END IF;
END $$;

-- ============================================
-- FUNCIÓN HELPER PARA INSERTAR TRADUCCIONES
-- ============================================
CREATE OR REPLACE FUNCTION insert_translation(
  p_namespace TEXT,
  p_key TEXT,
  p_es TEXT,
  p_en TEXT DEFAULT NULL,
  p_fr TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_key_id UUID;
BEGIN
  -- Buscar o crear la clave de traducción
  SELECT id INTO v_key_id
  FROM app.translation_keys
  WHERE namespace_slug = p_namespace AND key_name = p_key;

  IF v_key_id IS NULL THEN
    INSERT INTO app.translation_keys (namespace_slug, key_name, description)
    VALUES (p_namespace, p_key, 'Auto-generated key')
    RETURNING id INTO v_key_id;
  END IF;

  -- Insertar traducción en español
  INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
  VALUES (v_key_id, p_namespace, p_key, 'es', p_es, true)
  ON CONFLICT (translation_key_id, language_code) DO UPDATE
  SET value = EXCLUDED.value;

  -- Insertar traducción en inglés
  IF p_en IS NOT NULL THEN
    INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
    VALUES (v_key_id, p_namespace, p_key, 'en', p_en, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value;
  END IF;

  -- Insertar traducción en francés
  IF p_fr IS NOT NULL THEN
    INSERT INTO app.translations (translation_key_id, namespace_slug, key_name, language_code, value, is_active)
    VALUES (v_key_id, p_namespace, p_key, 'fr', p_fr, true)
    ON CONFLICT (translation_key_id, language_code) DO UPDATE
    SET value = EXCLUDED.value;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DASHBOARD - Encabezados
-- ============================================
SELECT insert_translation('admin', 'dashboard.title',
  'Panel de Administración RBAC',
  'RBAC Administration Panel',
  'Panneau d''Administration RBAC'
);

SELECT insert_translation('admin', 'dashboard.subtitle',
  'Sistema de control de acceso basado en roles',
  'Role-based access control system',
  'Système de contrôle d''accès basé sur les rôles'
);

-- ============================================
-- DASHBOARD - Secciones
-- ============================================
SELECT insert_translation('admin', 'dashboard.system_modules.title',
  'Módulos de Sistema',
  'System Modules',
  'Modules Système'
);

SELECT insert_translation('admin', 'dashboard.content_modules.title',
  'Gestión de Contenido',
  'Content Management',
  'Gestion de Contenu'
);

SELECT insert_translation('admin', 'dashboard.tools.title',
  'Herramientas Adicionales',
  'Additional Tools',
  'Outils Supplémentaires'
);

-- ============================================
-- DASHBOARD - Workflow (Flujo Recomendado)
-- ============================================
SELECT insert_translation('admin', 'dashboard.workflow.title',
  'Flujo Recomendado (Sigue este orden)',
  'Recommended Workflow (Follow this order)',
  'Flux Recommandé (Suivez cet ordre)'
);

-- Preparación
SELECT insert_translation('admin', 'dashboard.workflow.preparation.title',
  'Preparación',
  'Preparation',
  'Préparation'
);

SELECT insert_translation('admin', 'dashboard.workflow.preparation.step1',
  'Escanear rutas del sistema',
  'Scan system routes',
  'Scanner les routes système'
);

SELECT insert_translation('admin', 'dashboard.workflow.preparation.step2',
  'Traducir rutas a idiomas',
  'Translate routes to languages',
  'Traduire les routes dans les langues'
);

-- Configuración
SELECT insert_translation('admin', 'dashboard.workflow.configuration.title',
  'Configuración',
  'Configuration',
  'Configuration'
);

SELECT insert_translation('admin', 'dashboard.workflow.configuration.step1',
  'Crear roles necesarios',
  'Create necessary roles',
  'Créer les rôles nécessaires'
);

SELECT insert_translation('admin', 'dashboard.workflow.configuration.step2',
  'Asignar rutas a roles',
  'Assign routes to roles',
  'Assigner des routes aux rôles'
);

-- Asignación
SELECT insert_translation('admin', 'dashboard.workflow.assignment.title',
  'Asignación',
  'Assignment',
  'Affectation'
);

SELECT insert_translation('admin', 'dashboard.workflow.assignment.step1',
  'Asignar roles a usuarios',
  'Assign roles to users',
  'Assigner des rôles aux utilisateurs'
);

SELECT insert_translation('admin', 'dashboard.workflow.assignment.step2',
  'Permisos individuales',
  'Individual permissions',
  'Permissions individuelles'
);

-- ============================================
-- MÓDULOS - Textos comunes
-- ============================================
SELECT insert_translation('admin', 'modules.common.open_module',
  'Abrir módulo',
  'Open module',
  'Ouvrir le module'
);

-- ============================================
-- MÓDULO 1: Route Scanner
-- ============================================
SELECT insert_translation('admin', 'modules.route_scanner.title',
  'Escanear Rutas',
  'Scan Routes',
  'Scanner les Routes'
);

SELECT insert_translation('admin', 'modules.route_scanner.description',
  'Detecta automáticamente todas las rutas en app/[locale]/*/page.tsx',
  'Automatically detects all routes in app/[locale]/*/page.tsx',
  'Détecte automatiquement toutes les routes dans app/[locale]/*/page.tsx'
);

SELECT insert_translation('admin', 'modules.route_scanner.href', '/admin/route-scanner');
SELECT insert_translation('admin', 'modules.route_scanner.icon', '🔍');
SELECT insert_translation('admin', 'modules.route_scanner.color', 'blue');

-- ============================================
-- MÓDULO 2: Route Translations
-- ============================================
SELECT insert_translation('admin', 'modules.route_translations.title',
  'Traducir Rutas',
  'Translate Routes',
  'Traduire les Routes'
);

SELECT insert_translation('admin', 'modules.route_translations.description',
  'Traduce rutas a ES, EN, FR para navegación internacional',
  'Translate routes to ES, EN, FR for international navigation',
  'Traduire les routes en ES, EN, FR pour la navigation internationale'
);

SELECT insert_translation('admin', 'modules.route_translations.href', '/admin/route-translations');
SELECT insert_translation('admin', 'modules.route_translations.icon', '🌍');
SELECT insert_translation('admin', 'modules.route_translations.color', 'blue');

-- ============================================
-- MÓDULO 3: Roles
-- ============================================
SELECT insert_translation('admin', 'modules.roles.title',
  'Gestionar Roles',
  'Manage Roles',
  'Gérer les Rôles'
);

SELECT insert_translation('admin', 'modules.roles.description',
  'Crear, editar y administrar roles del sistema',
  'Create, edit and manage system roles',
  'Créer, éditer et gérer les rôles système'
);

SELECT insert_translation('admin', 'modules.roles.href', '/admin/roles');
SELECT insert_translation('admin', 'modules.roles.icon', '👥');
SELECT insert_translation('admin', 'modules.roles.color', 'green');

-- ============================================
-- MÓDULO 4: Role Permissions
-- ============================================
SELECT insert_translation('admin', 'modules.role_permissions.title',
  'Permisos por Rol',
  'Permissions by Role',
  'Permissions par Rôle'
);

SELECT insert_translation('admin', 'modules.role_permissions.description',
  'Asigna múltiples rutas a cada rol (define qué puede hacer cada cargo)',
  'Assign multiple routes to each role (define what each position can do)',
  'Assigner plusieurs routes à chaque rôle (définir ce que chaque poste peut faire)'
);

SELECT insert_translation('admin', 'modules.role_permissions.href', '/admin/role-permissions');
SELECT insert_translation('admin', 'modules.role_permissions.icon', '🔐');
SELECT insert_translation('admin', 'modules.role_permissions.color', 'green');

-- ============================================
-- MÓDULO 5: User Roles
-- ============================================
SELECT insert_translation('admin', 'modules.user_roles.title',
  'Asignar Roles a Usuarios',
  'Assign Roles to Users',
  'Assigner des Rôles aux Utilisateurs'
);

SELECT insert_translation('admin', 'modules.user_roles.description',
  'Busca usuarios y asígnales roles específicos',
  'Search users and assign them specific roles',
  'Rechercher des utilisateurs et leur assigner des rôles spécifiques'
);

SELECT insert_translation('admin', 'modules.user_roles.href', '/admin/user-roles');
SELECT insert_translation('admin', 'modules.user_roles.icon', '👤');
SELECT insert_translation('admin', 'modules.user_roles.color', 'purple');

-- ============================================
-- MÓDULO 6: User Permissions
-- ============================================
SELECT insert_translation('admin', 'modules.user_permissions.title',
  'Permisos Individuales',
  'Individual Permissions',
  'Permissions Individuelles'
);

SELECT insert_translation('admin', 'modules.user_permissions.description',
  'GRANT/DENY rutas específicas a usuarios (casos especiales)',
  'GRANT/DENY specific routes to users (special cases)',
  'GRANT/DENY routes spécifiques aux utilisateurs (cas spéciaux)'
);

SELECT insert_translation('admin', 'modules.user_permissions.href', '/admin/user-permissions');
SELECT insert_translation('admin', 'modules.user_permissions.icon', '⚡');
SELECT insert_translation('admin', 'modules.user_permissions.color', 'purple');

-- ============================================
-- MÓDULO: Organizations
-- ============================================
SELECT insert_translation('admin', 'modules.organizations.title',
  'Organizaciones',
  'Organizations',
  'Organisations'
);

SELECT insert_translation('admin', 'modules.organizations.description',
  'Gestionar organizaciones, instituciones y centros educativos',
  'Manage organizations, institutions and educational centers',
  'Gérer les organisations, institutions et centres éducatifs'
);

SELECT insert_translation('admin', 'modules.organizations.href', '/admin/organizations');
SELECT insert_translation('admin', 'modules.organizations.icon', '🏢');
SELECT insert_translation('admin', 'modules.organizations.color', 'indigo');

-- ============================================
-- MÓDULO: Organization Members
-- ============================================
SELECT insert_translation('admin', 'modules.organization_members.title',
  'Miembros de Organización',
  'Organization Members',
  'Membres de l''Organisation'
);

SELECT insert_translation('admin', 'modules.organization_members.description',
  'Gestionar miembros y roles dentro de organizaciones',
  'Manage members and roles within organizations',
  'Gérer les membres et rôles au sein des organisations'
);

SELECT insert_translation('admin', 'modules.organization_members.href', '/admin/organization-members');
SELECT insert_translation('admin', 'modules.organization_members.icon', '👥');
SELECT insert_translation('admin', 'modules.organization_members.color', 'indigo');

-- ============================================
-- MÓDULO: User Profiles
-- ============================================
SELECT insert_translation('admin', 'modules.user_profiles.title',
  'Perfiles de Usuario',
  'User Profiles',
  'Profils Utilisateur'
);

SELECT insert_translation('admin', 'modules.user_profiles.description',
  'Gestionar información de perfiles de usuarios del sistema',
  'Manage system user profile information',
  'Gérer les informations de profil des utilisateurs du système'
);

SELECT insert_translation('admin', 'modules.user_profiles.href', '/admin/user-profiles');
SELECT insert_translation('admin', 'modules.user_profiles.icon', '👤');
SELECT insert_translation('admin', 'modules.user_profiles.color', 'indigo');

-- ============================================
-- MÓDULO: User Types
-- ============================================
SELECT insert_translation('admin', 'modules.user_types.title',
  'Tipos de Usuario',
  'User Types',
  'Types d''Utilisateur'
);

SELECT insert_translation('admin', 'modules.user_types.description',
  'Gestionar categorías y tipos de usuarios del sistema',
  'Manage system user categories and types',
  'Gérer les catégories et types d''utilisateurs du système'
);

SELECT insert_translation('admin', 'modules.user_types.href', '/admin/user-types');
SELECT insert_translation('admin', 'modules.user_types.icon', '🏷️');
SELECT insert_translation('admin', 'modules.user_types.color', 'indigo');

-- ============================================
-- MÓDULO: User Relationships
-- ============================================
SELECT insert_translation('admin', 'modules.user_relationships.title',
  'Relaciones entre Usuarios',
  'User Relationships',
  'Relations entre Utilisateurs'
);

SELECT insert_translation('admin', 'modules.user_relationships.description',
  'Gestionar relaciones padre-hijo, tutor-estudiante, etc.',
  'Manage parent-child, tutor-student relationships, etc.',
  'Gérer les relations parent-enfant, tuteur-étudiant, etc.'
);

SELECT insert_translation('admin', 'modules.user_relationships.href', '/admin/user-relationships');
SELECT insert_translation('admin', 'modules.user_relationships.icon', '🔗');
SELECT insert_translation('admin', 'modules.user_relationships.color', 'indigo');

-- ============================================
-- MÓDULO: Role Language Access
-- ============================================
SELECT insert_translation('admin', 'modules.role_language_access.title',
  'Acceso por Idioma',
  'Language Access',
  'Accès par Langue'
);

SELECT insert_translation('admin', 'modules.role_language_access.description',
  'Controlar qué idiomas puede acceder cada rol',
  'Control which languages each role can access',
  'Contrôler quelles langues chaque rôle peut accéder'
);

SELECT insert_translation('admin', 'modules.role_language_access.href', '/admin/role-language-access');
SELECT insert_translation('admin', 'modules.role_language_access.icon', '🌐');
SELECT insert_translation('admin', 'modules.role_language_access.color', 'orange');

-- ============================================
-- MÓDULO: Books
-- ============================================
SELECT insert_translation('admin', 'modules.books.title',
  'Gestión de Libros',
  'Book Management',
  'Gestion des Livres'
);

SELECT insert_translation('admin', 'modules.books.description',
  'Administrar catálogo de libros, autores, categorías y más',
  'Manage book catalog, authors, categories and more',
  'Gérer le catalogue de livres, auteurs, catégories et plus'
);

SELECT insert_translation('admin', 'modules.books.href', '/admin/books');
SELECT insert_translation('admin', 'modules.books.icon', '📚');
SELECT insert_translation('admin', 'modules.books.color', 'orange');

-- ============================================
-- MÓDULO: Translations
-- ============================================
SELECT insert_translation('admin', 'modules.translations.title',
  'Traducciones',
  'Translations',
  'Traductions'
);

SELECT insert_translation('admin', 'modules.translations.description',
  'Gestionar traducciones de textos en múltiples idiomas',
  'Manage text translations in multiple languages',
  'Gérer les traductions de textes en plusieurs langues'
);

SELECT insert_translation('admin', 'modules.translations.href', '/admin/translations');
SELECT insert_translation('admin', 'modules.translations.icon', '🌍');
SELECT insert_translation('admin', 'modules.translations.color', 'orange');

-- ============================================
-- MÓDULO: Translation Keys
-- ============================================
SELECT insert_translation('admin', 'modules.translation_keys.title',
  'Claves de Traducción',
  'Translation Keys',
  'Clés de Traduction'
);

SELECT insert_translation('admin', 'modules.translation_keys.description',
  'Gestionar claves y namespaces del sistema de traducciones',
  'Manage keys and namespaces of the translation system',
  'Gérer les clés et namespaces du système de traduction'
);

SELECT insert_translation('admin', 'modules.translation_keys.href', '/admin/translation-keys');
SELECT insert_translation('admin', 'modules.translation_keys.icon', '🔑');
SELECT insert_translation('admin', 'modules.translation_keys.color', 'orange');

-- ============================================
-- MÓDULO: Users
-- ============================================
SELECT insert_translation('admin', 'modules.users.title',
  'Buscar Usuarios',
  'Search Users',
  'Rechercher des Utilisateurs'
);

SELECT insert_translation('admin', 'modules.users.description',
  'Busca cualquier usuario por email y ve su información',
  'Search any user by email and view their information',
  'Rechercher n''importe quel utilisateur par email et voir ses informations'
);

SELECT insert_translation('admin', 'modules.users.href', '/admin/users');
SELECT insert_translation('admin', 'modules.users.icon', '🔍');
SELECT insert_translation('admin', 'modules.users.color', 'gray');

-- ============================================
-- MÓDULO: Audit
-- ============================================
SELECT insert_translation('admin', 'modules.audit.title',
  'Auditoría',
  'Audit',
  'Audit'
);

SELECT insert_translation('admin', 'modules.audit.description',
  'Registro de cambios y accesos del sistema',
  'System changes and access log',
  'Journal des modifications et accès du système'
);

SELECT insert_translation('admin', 'modules.audit.href', '/admin/audit');
SELECT insert_translation('admin', 'modules.audit.icon', '🔎');
SELECT insert_translation('admin', 'modules.audit.color', 'gray');

-- ============================================
-- Limpiar función helper
-- ============================================
DROP FUNCTION IF EXISTS insert_translation(TEXT, TEXT, TEXT, TEXT, TEXT);

-- ============================================
-- COMMIT
-- ============================================
COMMIT;
