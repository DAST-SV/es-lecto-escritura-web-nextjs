-- supabase/schemas/app/translations/data/books_user_pages.sql
-- ============================================================================
-- TRANSLATIONS DATA: BOOKS USER PAGES MODULE
-- DESCRIPCION: Traducciones para las paginas de usuario de libros
-- Incluye: Biblioteca, Papelera y pagina de lectura (completa)
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- NAMESPACES FOR USER BOOK PAGES
-- ============================================================================

INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES
    ('books_library', 'Books Library', 'Translations for user library page (Mi Biblioteca)', true),
    ('books_trash', 'Books Trash', 'Translations for trash/recycle bin page', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

SELECT 'BOOKS USER PAGES: Namespaces created' AS status;

-- ============================================================================
-- BOOKS_LIBRARY NAMESPACE - Mi Biblioteca
-- ============================================================================

-- Loading
SELECT insert_translation('books_library', 'loading',
    'Cargando tu biblioteca...',
    'Loading your library...',
    'Chargement de votre bibliotheque...',
    'ui-components',
    'Mensaje de carga inicial'
);

-- Header
SELECT insert_translation('books_library', 'title',
    'Mi Biblioteca',
    'My Library',
    'Ma Bibliotheque',
    'ui-components',
    'Titulo principal de la biblioteca'
);

SELECT insert_translation('books_library', 'subtitle_single',
    'libro en total',
    'book in total',
    'livre au total',
    'ui-components',
    'Subtitulo singular (1 libro)'
);

SELECT insert_translation('books_library', 'subtitle_plural',
    'libros en total',
    'books in total',
    'livres au total',
    'ui-components',
    'Subtitulo plural (N libros)'
);

-- Search
SELECT insert_translation('books_library', 'search_placeholder',
    'Buscar por titulo, autor o descripcion...',
    'Search by title, author or description...',
    'Rechercher par titre, auteur ou description...',
    'forms',
    'Placeholder del campo de busqueda'
);

-- Buttons
SELECT insert_translation('books_library', 'trash',
    'Papelera',
    'Trash',
    'Corbeille',
    'actions',
    'Boton ir a papelera'
);

SELECT insert_translation('books_library', 'create_book',
    'Crear Libro',
    'Create Book',
    'Creer un Livre',
    'actions',
    'Boton crear nuevo libro'
);

-- Empty State
SELECT insert_translation('books_library', 'no_books_title',
    'No tienes libros aun',
    'You have no books yet',
    'Vous n avez pas encore de livres',
    'ui-components',
    'Titulo estado vacio sin libros'
);

SELECT insert_translation('books_library', 'no_books_subtitle',
    'Comienza creando tu primer libro',
    'Start by creating your first book',
    'Commencez par creer votre premier livre',
    'ui-components',
    'Subtitulo estado vacio sin libros'
);

SELECT insert_translation('books_library', 'no_results_title',
    'No se encontraron libros',
    'No books found',
    'Aucun livre trouve',
    'ui-components',
    'Titulo estado vacio sin resultados de busqueda'
);

SELECT insert_translation('books_library', 'no_results_subtitle',
    'Intenta con otros terminos de busqueda',
    'Try different search terms',
    'Essayez avec d autres termes de recherche',
    'ui-components',
    'Subtitulo estado vacio sin resultados'
);

SELECT insert_translation('books_library', 'create_first_book',
    'Crear mi primer libro',
    'Create my first book',
    'Creer mon premier livre',
    'actions',
    'Boton crear primer libro en estado vacio'
);

-- Actions
SELECT insert_translation('books_library', 'actions.read',
    'Leer',
    'Read',
    'Lire',
    'actions',
    'Boton leer libro'
);

SELECT insert_translation('books_library', 'actions.edit',
    'Editar',
    'Edit',
    'Modifier',
    'actions',
    'Boton editar libro'
);

SELECT insert_translation('books_library', 'actions.delete',
    'Eliminar',
    'Delete',
    'Supprimer',
    'actions',
    'Boton eliminar libro'
);

-- Delete Modal
SELECT insert_translation('books_library', 'delete_modal.title',
    'Mover a papelera?',
    'Move to trash?',
    'Deplacer vers la corbeille?',
    'ui-components',
    'Titulo modal de confirmacion eliminar'
);

SELECT insert_translation('books_library', 'delete_modal.message',
    'se movera a la papelera. Podras restaurarlo durante 30 dias.',
    'will be moved to trash. You can restore it within 30 days.',
    'sera deplace vers la corbeille. Vous pourrez le restaurer pendant 30 jours.',
    'ui-components',
    'Mensaje modal eliminar'
);

SELECT insert_translation('books_library', 'delete_modal.cancel',
    'Cancelar',
    'Cancel',
    'Annuler',
    'actions',
    'Boton cancelar en modal'
);

SELECT insert_translation('books_library', 'delete_modal.confirm',
    'Mover a papelera',
    'Move to trash',
    'Deplacer vers la corbeille',
    'actions',
    'Boton confirmar eliminar'
);

SELECT insert_translation('books_library', 'delete_modal.moving',
    'Moviendo...',
    'Moving...',
    'Deplacement...',
    'ui-components',
    'Estado moviendo a papelera'
);

-- Toasts
SELECT insert_translation('books_library', 'toast.deleted',
    'Libro movido a la papelera',
    'Book moved to trash',
    'Livre deplace vers la corbeille',
    'notifications',
    'Toast exito al eliminar'
);

SELECT insert_translation('books_library', 'toast.error',
    'Error al cargar los libros',
    'Error loading books',
    'Erreur lors du chargement des livres',
    'errors',
    'Toast error al cargar'
);

SELECT insert_translation('books_library', 'toast.delete_error',
    'Error al eliminar el libro',
    'Error deleting book',
    'Erreur lors de la suppression du livre',
    'errors',
    'Toast error al eliminar'
);

-- Book without title fallback
SELECT insert_translation('books_library', 'no_title',
    'Sin titulo',
    'No title',
    'Sans titre',
    'ui-components',
    'Fallback para libros sin titulo'
);

SELECT 'BOOKS: books_library namespace - 25 translations created' AS status;

-- ============================================================================
-- BOOKS_TRASH NAMESPACE - Papelera
-- ============================================================================

-- Loading
SELECT insert_translation('books_trash', 'loading',
    'Cargando papelera...',
    'Loading trash...',
    'Chargement de la corbeille...',
    'ui-components',
    'Mensaje de carga inicial'
);

-- Header
SELECT insert_translation('books_trash', 'title',
    'Papelera',
    'Trash',
    'Corbeille',
    'ui-components',
    'Titulo principal'
);

SELECT insert_translation('books_trash', 'back',
    'Volver a biblioteca',
    'Back to library',
    'Retour a la bibliotheque',
    'navigation',
    'Boton volver'
);

-- Count
SELECT insert_translation('books_trash', 'count_single',
    'libro eliminado',
    'deleted book',
    'livre supprime',
    'ui-components',
    'Contador singular'
);

SELECT insert_translation('books_trash', 'count_plural',
    'libros eliminados',
    'deleted books',
    'livres supprimes',
    'ui-components',
    'Contador plural'
);

-- Empty State
SELECT insert_translation('books_trash', 'empty_title',
    'La papelera esta vacia',
    'Trash is empty',
    'La corbeille est vide',
    'ui-components',
    'Titulo estado vacio'
);

SELECT insert_translation('books_trash', 'empty_subtitle',
    'No hay libros eliminados',
    'No deleted books',
    'Aucun livre supprime',
    'ui-components',
    'Subtitulo estado vacio'
);

-- Note
SELECT insert_translation('books_trash', 'note',
    'Los libros se eliminaran automaticamente despues de 30 dias.',
    'Books will be automatically deleted after 30 days.',
    'Les livres seront automatiquement supprimes apres 30 jours.',
    'ui-components',
    'Nota sobre eliminacion automatica'
);

-- Selection Actions
SELECT insert_translation('books_trash', 'select_all',
    'Seleccionar todo',
    'Select all',
    'Tout selectionner',
    'actions',
    'Boton seleccionar todos'
);

SELECT insert_translation('books_trash', 'deselect_all',
    'Deseleccionar todo',
    'Deselect all',
    'Tout deselectionner',
    'actions',
    'Boton deseleccionar todos'
);

SELECT insert_translation('books_trash', 'restore_selected',
    'Restaurar seleccionados',
    'Restore selected',
    'Restaurer la selection',
    'actions',
    'Boton restaurar seleccionados'
);

SELECT insert_translation('books_trash', 'restore_all',
    'Restaurar todos',
    'Restore all',
    'Tout restaurer',
    'actions',
    'Boton restaurar todos'
);

SELECT insert_translation('books_trash', 'empty_trash',
    'Vaciar papelera',
    'Empty trash',
    'Vider la corbeille',
    'actions',
    'Boton vaciar papelera'
);

-- Time remaining
SELECT insert_translation('books_trash', 'days_left',
    'dias',
    'days',
    'jours',
    'ui-components',
    'Sufijo dias restantes'
);

SELECT insert_translation('books_trash', 'last_day',
    'Ultimo dia',
    'Last day',
    'Dernier jour',
    'ui-components',
    'Texto ultimo dia'
);

-- Actions
SELECT insert_translation('books_trash', 'actions.restore',
    'Restaurar',
    'Restore',
    'Restaurer',
    'actions',
    'Boton restaurar libro'
);

SELECT insert_translation('books_trash', 'actions.delete_permanent',
    'Eliminar',
    'Delete',
    'Supprimer',
    'actions',
    'Boton eliminar permanente'
);

-- Delete Modal (single book)
SELECT insert_translation('books_trash', 'delete_modal.title',
    'Eliminar permanentemente?',
    'Delete permanently?',
    'Supprimer definitivement?',
    'ui-components',
    'Titulo modal eliminar'
);

SELECT insert_translation('books_trash', 'delete_modal.message',
    'de forma permanente. Esta accion NO SE PUEDE DESHACER y se eliminaran todos los archivos asociados.',
    'permanently. This action CANNOT BE UNDONE and all associated files will be deleted.',
    'definitivement. Cette action NE PEUT PAS ETRE ANNULEE et tous les fichiers associes seront supprimes.',
    'ui-components',
    'Mensaje modal eliminar'
);

SELECT insert_translation('books_trash', 'delete_modal.cancel',
    'Cancelar',
    'Cancel',
    'Annuler',
    'actions',
    'Boton cancelar'
);

SELECT insert_translation('books_trash', 'delete_modal.confirm',
    'Eliminar para siempre',
    'Delete forever',
    'Supprimer definitivement',
    'actions',
    'Boton confirmar eliminar'
);

SELECT insert_translation('books_trash', 'delete_modal.deleting',
    'Eliminando...',
    'Deleting...',
    'Suppression...',
    'ui-components',
    'Estado eliminando'
);

-- Empty Trash Modal
SELECT insert_translation('books_trash', 'empty_modal.title',
    'Vaciar papelera?',
    'Empty trash?',
    'Vider la corbeille?',
    'ui-components',
    'Titulo modal vaciar'
);

SELECT insert_translation('books_trash', 'empty_modal.message',
    'Estas por eliminar TODOS los libros de la papelera de forma permanente.',
    'You are about to permanently delete ALL books from trash.',
    'Vous etes sur le point de supprimer definitivement TOUS les livres de la corbeille.',
    'ui-components',
    'Mensaje modal vaciar'
);

SELECT insert_translation('books_trash', 'empty_modal.warning',
    'Esta accion NO SE PUEDE DESHACER y eliminara todos los archivos asociados.',
    'This action CANNOT BE UNDONE and will delete all associated files.',
    'Cette action NE PEUT PAS ETRE ANNULEE et supprimera tous les fichiers associes.',
    'ui-components',
    'Advertencia modal vaciar'
);

SELECT insert_translation('books_trash', 'empty_modal.emptying',
    'Vaciando...',
    'Emptying...',
    'Vidage...',
    'ui-components',
    'Estado vaciando'
);

-- Toasts
SELECT insert_translation('books_trash', 'toast.restored',
    'Libro restaurado',
    'Book restored',
    'Livre restaure',
    'notifications',
    'Toast libro restaurado singular'
);

SELECT insert_translation('books_trash', 'toast.restored_plural',
    'libros restaurados',
    'books restored',
    'livres restaures',
    'notifications',
    'Toast libros restaurados plural'
);

SELECT insert_translation('books_trash', 'toast.deleted',
    'Libro eliminado permanentemente',
    'Book permanently deleted',
    'Livre supprime definitivement',
    'notifications',
    'Toast libro eliminado singular'
);

SELECT insert_translation('books_trash', 'toast.deleted_plural',
    'libros eliminados permanentemente',
    'books permanently deleted',
    'livres supprimes definitivement',
    'notifications',
    'Toast libros eliminados plural'
);

SELECT insert_translation('books_trash', 'toast.error_restore',
    'Error restaurando',
    'Error restoring',
    'Erreur lors de la restauration',
    'errors',
    'Toast error restaurar'
);

SELECT insert_translation('books_trash', 'toast.error_delete',
    'Error eliminando',
    'Error deleting',
    'Erreur lors de la suppression',
    'errors',
    'Toast error eliminar'
);

SELECT insert_translation('books_trash', 'toast.error_load',
    'Error al cargar la papelera',
    'Error loading trash',
    'Erreur lors du chargement de la corbeille',
    'errors',
    'Toast error cargar papelera'
);

SELECT insert_translation('books_trash', 'toast.no_selected',
    'No hay libros seleccionados',
    'No books selected',
    'Aucun livre selectionne',
    'errors',
    'Toast sin seleccion'
);

SELECT 'BOOKS: books_trash namespace - 35 translations created' AS status;

-- ============================================================================
-- BOOK_READER NAMESPACE - Traducciones adicionales para la pagina de lectura
-- ============================================================================

-- Loading states (adicionales)
SELECT insert_translation('book_reader', 'loading_subtitle',
    'Preparando paginas del PDF',
    'Preparing PDF pages',
    'Preparation des pages PDF',
    'ui-components',
    'Subtitulo durante carga'
);

SELECT insert_translation('book_reader', 'loading_viewer',
    'Cargando visor...',
    'Loading viewer...',
    'Chargement du lecteur...',
    'ui-components',
    'Mensaje cargando visor'
);

-- Error states
SELECT insert_translation('book_reader', 'error_title',
    'No se puede leer el libro',
    'Cannot read book',
    'Impossible de lire le livre',
    'errors',
    'Titulo error de lectura'
);

SELECT insert_translation('book_reader', 'error_back',
    'Volver a biblioteca',
    'Back to library',
    'Retour a la bibliotheque',
    'navigation',
    'Boton volver en error'
);

SELECT insert_translation('book_reader', 'error_no_pdf',
    'Este libro no tiene un archivo PDF asociado',
    'This book has no associated PDF file',
    'Ce livre n a pas de fichier PDF associe',
    'errors',
    'Error sin PDF'
);

SELECT insert_translation('book_reader', 'error_not_found',
    'Libro no encontrado',
    'Book not found',
    'Livre non trouve',
    'errors',
    'Error libro no encontrado'
);

SELECT insert_translation('book_reader', 'error_invalid_id',
    'ID de libro no valido',
    'Invalid book ID',
    'ID de livre invalide',
    'errors',
    'Error ID invalido'
);

-- Tracking
SELECT insert_translation('book_reader', 'tracking',
    'Registrando lectura',
    'Tracking reading',
    'Enregistrement de la lecture',
    'ui-components',
    'Indicador de tracking activo'
);

-- Completion Modal
SELECT insert_translation('book_reader', 'completion.title',
    'Felicitaciones!',
    'Congratulations!',
    'Felicitations!',
    'ui-components',
    'Titulo modal completado'
);

SELECT insert_translation('book_reader', 'completion.message',
    'Has completado',
    'You have completed',
    'Vous avez termine',
    'ui-components',
    'Mensaje modal completado'
);

SELECT insert_translation('book_reader', 'completion.stats',
    'Ver estadisticas',
    'View statistics',
    'Voir les statistiques',
    'actions',
    'Boton ver estadisticas'
);

SELECT insert_translation('book_reader', 'completion.continue',
    'Continuar leyendo',
    'Continue reading',
    'Continuer la lecture',
    'actions',
    'Boton continuar leyendo'
);

-- Book fallbacks
SELECT insert_translation('book_reader', 'no_title',
    'Libro sin titulo',
    'Untitled book',
    'Livre sans titre',
    'ui-components',
    'Fallback sin titulo'
);

SELECT 'BOOKS: book_reader namespace - 13 additional translations created' AS status;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================

SELECT 'BOOKS USER PAGES: All translations created successfully!' AS status;

-- Resumen de traducciones por namespace
SELECT
    namespace_slug,
    COUNT(*) as total_keys
FROM app.translation_keys
WHERE namespace_slug IN ('books_library', 'books_trash')
GROUP BY namespace_slug
ORDER BY namespace_slug;
