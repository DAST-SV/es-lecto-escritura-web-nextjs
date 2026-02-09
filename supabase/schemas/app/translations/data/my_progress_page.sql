-- supabase/schemas/app/translations/data/my_progress_page.sql
-- ============================================================================
-- TRANSLATIONS DATA: MY PROGRESS PAGE (MI PROGRESO)
-- DESCRIPCION: Traducciones para la pagina de progreso de lectura
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- NAMESPACE: my_progress
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('my_progress', 'My Progress Page', 'Traducciones de la pagina Mi Progreso', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- HERO SECTION
-- ============================================
SELECT insert_translation('my_progress', 'hero.badge', 'MI PROGRESO', 'MY PROGRESS', 'MON PROGRES');
SELECT insert_translation('my_progress', 'hero.title', 'Tu Viaje Lector', 'Your Reading Journey', 'Votre Parcours Lecteur');
SELECT insert_translation('my_progress', 'hero.subtitle', 'Descubre como avanza tu aventura con los libros', 'Discover how your book adventure is going', 'Decouvrez comment avance votre aventure avec les livres');

-- ============================================
-- STATS DASHBOARD
-- ============================================
SELECT insert_translation('my_progress', 'stats.completed', 'Completados', 'Completed', 'Termines');
SELECT insert_translation('my_progress', 'stats.in_progress', 'En progreso', 'In progress', 'En cours');
SELECT insert_translation('my_progress', 'stats.abandoned', 'Pausados', 'Paused', 'En pause');
SELECT insert_translation('my_progress', 'stats.pages_read', 'Paginas leidas', 'Pages read', 'Pages lues');
SELECT insert_translation('my_progress', 'stats.reading_time', 'Tiempo leyendo', 'Time reading', 'Temps de lecture');
SELECT insert_translation('my_progress', 'stats.avg_session', 'Promedio/sesion', 'Avg/session', 'Moy/session');
SELECT insert_translation('my_progress', 'stats.streak', 'Racha actual', 'Current streak', 'Serie actuelle');
SELECT insert_translation('my_progress', 'stats.best_streak', 'Mejor racha', 'Best streak', 'Meilleure serie');
SELECT insert_translation('my_progress', 'stats.this_month', 'Este mes', 'This month', 'Ce mois');
SELECT insert_translation('my_progress', 'stats.days', 'dias', 'days', 'jours');
SELECT insert_translation('my_progress', 'stats.books', 'libros', 'books', 'livres');

-- ============================================
-- SECTIONS
-- ============================================
SELECT insert_translation('my_progress', 'sections.completed', 'Libros Completados', 'Completed Books', 'Livres termines');
SELECT insert_translation('my_progress', 'sections.abandoned', 'Libros Pausados', 'Paused Books', 'Livres en pause');
SELECT insert_translation('my_progress', 'sections.activity', 'Actividad Reciente', 'Recent Activity', 'Activite recente');

-- ============================================
-- COMPLETED CARDS
-- ============================================
SELECT insert_translation('my_progress', 'card.read_again', 'Releer', 'Read again', 'Relire');
SELECT insert_translation('my_progress', 'card.completed_on', 'Completado', 'Completed', 'Termine');
SELECT insert_translation('my_progress', 'card.time_spent', 'Tiempo', 'Time', 'Temps');
SELECT insert_translation('my_progress', 'card.no_rating', 'Sin calificar', 'Not rated', 'Non note');

-- ============================================
-- ABANDONED CARDS
-- ============================================
SELECT insert_translation('my_progress', 'card.resume', 'Retomar', 'Resume', 'Reprendre');
SELECT insert_translation('my_progress', 'card.days_ago', 'dias sin leer', 'days since last read', 'jours sans lire');
SELECT insert_translation('my_progress', 'card.progress', 'progreso', 'progress', 'progres');

-- ============================================
-- ACTIVITY TIMELINE
-- ============================================
SELECT insert_translation('my_progress', 'activity.read', 'Leiste', 'You read', 'Vous avez lu');
SELECT insert_translation('my_progress', 'activity.pages', 'paginas de', 'pages of', 'pages de');
SELECT insert_translation('my_progress', 'activity.for', 'durante', 'for', 'pendant');
SELECT insert_translation('my_progress', 'activity.today', 'Hoy', 'Today', 'Aujourd hui');
SELECT insert_translation('my_progress', 'activity.yesterday', 'Ayer', 'Yesterday', 'Hier');
SELECT insert_translation('my_progress', 'activity.days_ago', 'hace {n} dias', '{n} days ago', 'il y a {n} jours');

-- ============================================
-- EMPTY STATES
-- ============================================
SELECT insert_translation('my_progress', 'empty.completed_title', 'Aun no has completado ningun libro', 'You have not completed any books yet', 'Vous n avez pas encore termine de livre');
SELECT insert_translation('my_progress', 'empty.completed_subtitle', 'Cuando termines un libro aparecera aqui', 'When you finish a book it will appear here', 'Quand vous terminerez un livre il apparaitra ici');
SELECT insert_translation('my_progress', 'empty.abandoned_title', 'No tienes libros pausados', 'No paused books', 'Aucun livre en pause');
SELECT insert_translation('my_progress', 'empty.abandoned_subtitle', 'Los libros sin actividad reciente apareceran aqui', 'Books without recent activity will appear here', 'Les livres sans activite recente apparaitront ici');
SELECT insert_translation('my_progress', 'empty.activity_title', 'Sin actividad reciente', 'No recent activity', 'Aucune activite recente');
SELECT insert_translation('my_progress', 'empty.activity_subtitle', 'Comienza a leer para ver tu historial', 'Start reading to see your history', 'Commencez a lire pour voir votre historique');
SELECT insert_translation('my_progress', 'empty.explore_library', 'Explorar biblioteca', 'Explore library', 'Explorer la bibliotheque');
SELECT insert_translation('my_progress', 'empty.main_title', 'Comienza tu viaje', 'Start your journey', 'Commencez votre voyage');
SELECT insert_translation('my_progress', 'empty.main_subtitle', 'Lee tu primer libro y vuelve aqui para ver tu progreso', 'Read your first book and come back to see your progress', 'Lisez votre premier livre et revenez voir votre progres');

-- ============================================
-- CAROUSEL NAVIGATION
-- ============================================
SELECT insert_translation('my_progress', 'carousel.previous', 'Anterior', 'Previous', 'Precedent');
SELECT insert_translation('my_progress', 'carousel.next', 'Siguiente', 'Next', 'Suivant');

-- ============================================
-- TIME FORMATS
-- ============================================
SELECT insert_translation('my_progress', 'time.hours', 'h', 'h', 'h');
SELECT insert_translation('my_progress', 'time.minutes', 'min', 'min', 'min');
SELECT insert_translation('my_progress', 'time.seconds', 's', 's', 's');

SELECT 'TRANSLATIONS: My Progress page - traducciones insertadas' AS status;
