-- supabase/schemas/app/translations/data/my_world_page.sql
-- ============================================================================
-- TRANSLATIONS DATA: MY WORLD PAGE (MI MUNDO)
-- DESCRIPCION: Traducciones para el hub personal de lectura y escritura
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- NAMESPACE: my_world
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('my_world', 'My World Page', 'Traducciones del hub personal Mi Mundo', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- HERO SECTION
-- ============================================
SELECT insert_translation('my_world', 'hero.badge', 'MI MUNDO PERSONAL', 'MY PERSONAL WORLD', 'MON MONDE PERSONNEL');
SELECT insert_translation('my_world', 'hero.title', 'Bienvenido a tu Mundo', 'Welcome to your World', 'Bienvenue dans votre Monde');
SELECT insert_translation('my_world', 'hero.subtitle', 'Tu espacio personal de lectura y escritura', 'Your personal reading and writing space', 'Votre espace personnel de lecture et ecriture');

-- ============================================
-- STATS
-- ============================================
SELECT insert_translation('my_world', 'stats.in_progress', 'Leer mas adelante', 'Read later', 'A lire plus tard');
SELECT insert_translation('my_world', 'stats.completed', 'Leidos', 'Read', 'Lus');
SELECT insert_translation('my_world', 'stats.favorites', 'Mis favoritos', 'My favorites', 'Mes favoris');
SELECT insert_translation('my_world', 'stats.authored', 'Mis libros', 'My books', 'Mes livres');
SELECT insert_translation('my_world', 'stats.reading_time', 'Tiempo de lectura', 'Reading time', 'Temps de lecture');
SELECT insert_translation('my_world', 'stats.total_views', 'Vistas totales', 'Total views', 'Vues totales');

-- ============================================
-- TABS
-- ============================================
SELECT insert_translation('my_world', 'tabs.reader', 'Lector', 'Reader', 'Lecteur');
SELECT insert_translation('my_world', 'tabs.writer', 'Escritor', 'Writer', 'Ecrivain');

-- ============================================
-- SECTIONS - READER
-- ============================================
SELECT insert_translation('my_world', 'sections.continue_reading', 'Leer mas adelante', 'Read later', 'Lire plus tard');
SELECT insert_translation('my_world', 'sections.completed', 'Libros leidos', 'Read books', 'Livres lus');
SELECT insert_translation('my_world', 'sections.favorites', 'Mis Favoritos', 'My Favorites', 'Mes Favoris');
SELECT insert_translation('my_world', 'sections.reading_lists', 'Mis Listas', 'My Lists', 'Mes Listes');

-- ============================================
-- SECTIONS - WRITER
-- ============================================
SELECT insert_translation('my_world', 'writer.published', 'Mis Libros Publicados', 'My Published Books', 'Mes Livres Publies');
SELECT insert_translation('my_world', 'writer.drafts', 'Mis Borradores', 'My Drafts', 'Mes Brouillons');
SELECT insert_translation('my_world', 'writer.create_new', 'Crear Nuevo Libro', 'Create New Book', 'Creer un Nouveau Livre');
SELECT insert_translation('my_world', 'writer.no_books', 'Aun no has escrito ningun libro', 'You have not written any books yet', 'Vous n avez pas encore ecrit de livre');
SELECT insert_translation('my_world', 'writer.start_writing', 'Comienza a escribir tu primer libro', 'Start writing your first book', 'Commencez a ecrire votre premier livre');
SELECT insert_translation('my_world', 'writer.trash', 'Papelera', 'Trash', 'Corbeille');

-- ============================================
-- CARDS
-- ============================================
SELECT insert_translation('my_world', 'card.continue', 'Continuar', 'Continue', 'Continuer');
SELECT insert_translation('my_world', 'card.read', 'Leer', 'Read', 'Lire');
SELECT insert_translation('my_world', 'card.edit', 'Editar', 'Edit', 'Modifier');
SELECT insert_translation('my_world', 'card.publish', 'Publicar', 'Publish', 'Publier');
SELECT insert_translation('my_world', 'card.unpublish', 'Despublicar', 'Unpublish', 'Depublier');
SELECT insert_translation('my_world', 'card.stats', 'Estadisticas', 'Statistics', 'Statistiques');
SELECT insert_translation('my_world', 'card.move_to_trash', 'Mover a papelera', 'Move to trash', 'Deplacer vers la corbeille');
SELECT insert_translation('my_world', 'card.views', 'vistas', 'views', 'vues');
SELECT insert_translation('my_world', 'card.pages', 'paginas', 'pages', 'pages');
SELECT insert_translation('my_world', 'card.completed_label', 'Completado', 'Completed', 'Termine');
SELECT insert_translation('my_world', 'card.progress_label', 'progreso', 'progress', 'progres');

-- ============================================
-- STATUS BADGES
-- ============================================
SELECT insert_translation('my_world', 'status.draft', 'Borrador', 'Draft', 'Brouillon');
SELECT insert_translation('my_world', 'status.pending', 'En revision', 'Pending review', 'En revision');
SELECT insert_translation('my_world', 'status.published', 'Publicado', 'Published', 'Publie');
SELECT insert_translation('my_world', 'status.archived', 'Archivado', 'Archived', 'Archive');

-- ============================================
-- EMPTY STATES
-- ============================================
SELECT insert_translation('my_world', 'empty.reader_title', 'Tu mundo esta vacio', 'Your world is empty', 'Votre monde est vide');
SELECT insert_translation('my_world', 'empty.reader_subtitle', 'Explora la biblioteca y comienza a leer', 'Explore the library and start reading', 'Explorez la bibliotheque et commencez a lire');
SELECT insert_translation('my_world', 'empty.explore_library', 'Explorar biblioteca', 'Explore library', 'Explorer la bibliotheque');
SELECT insert_translation('my_world', 'empty.no_progress', 'No tienes libros para leer mas adelante', 'No books to read later', 'Aucun livre a lire plus tard');
SELECT insert_translation('my_world', 'empty.no_completed', 'Aun no has terminado ningun libro', 'No read books yet', 'Aucun livre lu');
SELECT insert_translation('my_world', 'empty.no_favorites', 'Aun no tienes favoritos', 'No favorites yet', 'Aucun favori');

-- ============================================
-- WRITER - ALL BOOKS SECTION
-- ============================================
SELECT insert_translation('my_world', 'writer.all_books', 'Todos mis libros', 'All my books', 'Tous mes livres');
SELECT insert_translation('my_world', 'writer.search_placeholder', 'Buscar en mis libros...', 'Search my books...', 'Rechercher dans mes livres...');
SELECT insert_translation('my_world', 'writer.filter_all', 'Todos', 'All', 'Tous');
SELECT insert_translation('my_world', 'writer.filter_drafts', 'Borradores', 'Drafts', 'Brouillons');
SELECT insert_translation('my_world', 'writer.filter_published', 'Publicados', 'Published', 'Publies');
SELECT insert_translation('my_world', 'writer.total', 'total', 'total', 'total');
SELECT insert_translation('my_world', 'writer.views', 'vistas', 'views', 'vues');

-- ============================================
-- DELETE MODAL
-- ============================================
SELECT insert_translation('my_world', 'modal.delete_title', 'Mover a papelera?', 'Move to trash?', 'Deplacer vers la corbeille?');
SELECT insert_translation('my_world', 'modal.delete_message', 'se movera a la papelera. Podras restaurarlo durante 30 dias.', 'will be moved to trash. You can restore it within 30 days.', 'sera deplace vers la corbeille. Vous pourrez le restaurer pendant 30 jours.');
SELECT insert_translation('my_world', 'modal.cancel', 'Cancelar', 'Cancel', 'Annuler');
SELECT insert_translation('my_world', 'modal.confirm_delete', 'Mover a papelera', 'Move to trash', 'Deplacer vers la corbeille');
SELECT insert_translation('my_world', 'modal.moving', 'Moviendo...', 'Moving...', 'Deplacement...');

-- ============================================
-- CAROUSEL NAVIGATION
-- ============================================
SELECT insert_translation('my_world', 'carousel.previous', 'Anterior', 'Previous', 'Precedent');
SELECT insert_translation('my_world', 'carousel.next', 'Siguiente', 'Next', 'Suivant');

-- ============================================
-- TOASTS
-- ============================================
SELECT insert_translation('my_world', 'toast.published', 'Libro publicado exitosamente', 'Book published successfully', 'Livre publie avec succes');
SELECT insert_translation('my_world', 'toast.unpublished', 'Libro despublicado', 'Book unpublished', 'Livre depublie');
SELECT insert_translation('my_world', 'toast.error', 'Error al cargar tus datos', 'Error loading your data', 'Erreur lors du chargement');
SELECT insert_translation('my_world', 'toast.moved_to_trash', 'Libro movido a papelera', 'Book moved to trash', 'Livre deplace vers la corbeille');
SELECT insert_translation('my_world', 'toast.error_status', 'Error al cambiar estado', 'Error changing status', 'Erreur lors du changement de statut');

-- ============================================
-- TIME FORMATS
-- ============================================
SELECT insert_translation('my_world', 'time.hours', 'h', 'h', 'h');
SELECT insert_translation('my_world', 'time.minutes', 'min', 'min', 'min');

SELECT 'TRANSLATIONS: My World page - traducciones insertadas' AS status;
