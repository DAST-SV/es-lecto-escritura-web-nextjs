-- supabase/schemas/app/translations/data/admin_dashboard.sql
-- ============================================
-- TRANSLATIONS DATA: ADMIN DASHBOARD
-- DESCRIPCION: Traducciones para el panel de administracion
-- NOTA: Las tablas se crean en translations/schema/00_tables.sql
-- ============================================

SET search_path TO app, public;

-- Este archivo ahora solo contiene datos adicionales si se necesitan
-- Las tablas, indices, triggers, RLS y grants se definen en:
-- - translations/schema/00_tables.sql (tablas e indices)
-- - translations/schema/01_triggers.sql (triggers)
-- - translations/schema/02_rls.sql (politicas RLS)
-- - translations/schema/03_initial_data.sql (datos iniciales)

-- ============================================
-- NAMESPACE para admin dashboard
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('admin_dashboard', 'Admin Dashboard', 'Translations for admin dashboard', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- TRADUCCIONES ADMIN DASHBOARD
-- ============================================

-- Dashboard general
SELECT insert_translation('admin_dashboard', 'title',
    'Panel de Administracion',
    'Admin Dashboard',
    'Panneau d''Administration',
    'ui-components',
    'Titulo principal del dashboard'
);

SELECT insert_translation('admin_dashboard', 'welcome',
    'Bienvenido al panel de administracion',
    'Welcome to the admin dashboard',
    'Bienvenue dans le panneau d''administration',
    'ui-components',
    'Mensaje de bienvenida'
);

SELECT insert_translation('admin_dashboard', 'overview',
    'Vista General',
    'Overview',
    'Vue d''ensemble',
    'ui-components',
    'Seccion vista general'
);

SELECT insert_translation('admin_dashboard', 'statistics',
    'Estadisticas',
    'Statistics',
    'Statistiques',
    'ui-components',
    'Seccion estadisticas'
);

SELECT insert_translation('admin_dashboard', 'recent_activity',
    'Actividad Reciente',
    'Recent Activity',
    'Activite Recente',
    'ui-components',
    'Seccion actividad reciente'
);

SELECT insert_translation('admin_dashboard', 'quick_actions',
    'Acciones Rapidas',
    'Quick Actions',
    'Actions Rapides',
    'ui-components',
    'Seccion acciones rapidas'
);

SELECT 'ADMIN_DASHBOARD: Translations created successfully!' AS status;
