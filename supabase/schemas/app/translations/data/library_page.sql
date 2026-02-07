-- supabase/schemas/app/translations/data/library_page.sql
-- ============================================================================
-- TRANSLATIONS DATA: LIBRARY PAGE
-- DESCRIPCION: Traducciones para la pagina de Biblioteca (estilo Netflix/VIX)
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- NAMESPACE: library
-- ============================================
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('library', 'Library Page', 'Traducciones de la pagina de biblioteca', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- ============================================
-- HERO SECTION
-- ============================================
SELECT insert_translation('library', 'hero.badge', 'BIBLIOTECA DIGITAL', 'DIGITAL LIBRARY', 'BIBLIOTHEQUE NUMERIQUE');
SELECT insert_translation('library', 'hero.title', 'Descubre mundos increibles', 'Discover amazing worlds', 'Decouvrez des mondes incroyables');
SELECT insert_translation('library', 'hero.subtitle', 'Miles de libros esperan por ti. Explora, lee y aprende algo nuevo cada dia.', 'Thousands of books await you. Explore, read and learn something new every day.', 'Des milliers de livres vous attendent. Explorez, lisez et apprenez quelque chose de nouveau chaque jour.');

-- ============================================
-- SEARCH
-- ============================================
SELECT insert_translation('library', 'search.placeholder', 'Buscar libros, cuentos, poemas...', 'Search books, stories, poems...', 'Rechercher des livres, histoires, poemes...');
SELECT insert_translation('library', 'search.clear', 'Limpiar busqueda', 'Clear search', 'Effacer la recherche');

-- ============================================
-- SECTION TITLES
-- ============================================
SELECT insert_translation('library', 'sections.featured', 'Destacados de la Semana', 'Featured This Week', 'A la une cette semaine');
SELECT insert_translation('library', 'sections.top_global', 'Top 10 Mas Populares', 'Top 10 Most Popular', 'Top 10 les plus populaires');
SELECT insert_translation('library', 'sections.new_arrivals', 'Recien Llegados', 'New Arrivals', 'Nouveautes');
SELECT insert_translation('library', 'sections.top_rated', 'Mejor Valorados', 'Top Rated', 'Les mieux notes');
SELECT insert_translation('library', 'sections.continue_reading', 'Continua Leyendo', 'Continue Reading', 'Continuer la lecture');
SELECT insert_translation('library', 'sections.category_prefix', 'Top en', 'Top in', 'Top en');
SELECT insert_translation('library', 'sections.all_categories', 'Todas las Categorias', 'All Categories', 'Toutes les categories');

-- ============================================
-- CAROUSEL CONTROLS
-- ============================================
SELECT insert_translation('library', 'carousel.previous', 'Anterior', 'Previous', 'Precedent');
SELECT insert_translation('library', 'carousel.next', 'Siguiente', 'Next', 'Suivant');
SELECT insert_translation('library', 'carousel.view_all', 'Ver todo', 'View all', 'Voir tout');

-- ============================================
-- CARD LABELS
-- ============================================
SELECT insert_translation('library', 'card.read', 'Leer ahora', 'Read now', 'Lire maintenant');
SELECT insert_translation('library', 'card.new', 'NUEVO', 'NEW', 'NOUVEAU');
SELECT insert_translation('library', 'card.featured', 'Destacado', 'Featured', 'En vedette');
SELECT insert_translation('library', 'card.readings', 'lecturas', 'readings', 'lectures');
SELECT insert_translation('library', 'card.years', 'anos', 'years', 'ans');
SELECT insert_translation('library', 'card.min_read', 'min lectura', 'min read', 'min de lecture');

-- ============================================
-- EMPTY STATES
-- ============================================
SELECT insert_translation('library', 'empty.no_books', 'Aun no hay libros disponibles', 'No books available yet', 'Aucun livre disponible pour le moment');
SELECT insert_translation('library', 'empty.no_results', 'No encontramos resultados', 'We could not find any results', 'Nous n''avons trouve aucun resultat');
SELECT insert_translation('library', 'empty.try_again', 'Intenta con otra busqueda', 'Try a different search', 'Essayez une autre recherche');

-- ============================================
-- FILTERS
-- ============================================
SELECT insert_translation('library', 'filters.all', 'Todos', 'All', 'Tous');

SELECT 'TRANSLATIONS: Library page - traducciones insertadas' AS status;
