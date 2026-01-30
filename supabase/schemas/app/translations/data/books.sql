-- ============================================================================
-- TRANSLATIONS DATA: BOOKS MODULE
-- DESCRIPCION: Traducciones completas para el modulo de libros
-- Incluye: Exploracion, Filtros, Cards, Detalle y Lector
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- NAMESPACES FOR BOOKS MODULE
-- ============================================================================

INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES
    ('book_explore', 'Book Explore', 'Translations for book exploration and discovery page', true),
    ('book_filters', 'Book Filters', 'Translations for book filters panel', true),
    ('book_card', 'Book Card', 'Translations for book card components', true),
    ('book_detail', 'Book Detail', 'Translations for book detail page', true),
    ('book_reader', 'Book Reader', 'Translations for book reader page', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

SELECT 'BOOKS: Namespaces created' AS status;

-- ============================================================================
-- BOOK_EXPLORE NAMESPACE - Pagina de exploracion
-- ============================================================================

-- Hero Section
SELECT insert_translation('book_explore', 'hero.badge',
    'BIBLIOTECA DIGITAL',
    'DIGITAL LIBRARY',
    'BIBLIOTHEQUE NUMERIQUE',
    'ui-components',
    'Badge en el hero de exploracion'
);

SELECT insert_translation('book_explore', 'hero.title',
    'Explora Nuestros Libros',
    'Explore Our Books',
    'Explorez Nos Livres',
    'ui-components',
    'Titulo principal del hero'
);

SELECT insert_translation('book_explore', 'hero.subtitle',
    'Descubre historias increibles para todas las edades',
    'Discover incredible stories for all ages',
    'Decouvrez des histoires incroyables pour tous les ages',
    'ui-components',
    'Subtitulo del hero'
);

-- Search
SELECT insert_translation('book_explore', 'search.placeholder',
    'Buscar por titulo, autor o tema...',
    'Search by title, author or topic...',
    'Rechercher par titre, auteur ou sujet...',
    'forms',
    'Placeholder del campo de busqueda'
);

SELECT insert_translation('book_explore', 'search.clear',
    'Limpiar busqueda',
    'Clear search',
    'Effacer la recherche',
    'actions',
    'Boton para limpiar busqueda'
);

-- Results
SELECT insert_translation('book_explore', 'results.count_singular',
    'libro encontrado',
    'book found',
    'livre trouve',
    'ui-components',
    'Texto singular de resultados'
);

SELECT insert_translation('book_explore', 'results.count_plural',
    'libros encontrados',
    'books found',
    'livres trouves',
    'ui-components',
    'Texto plural de resultados'
);

SELECT insert_translation('book_explore', 'results.empty',
    'No se encontraron libros',
    'No books found',
    'Aucun livre trouve',
    'ui-components',
    'Mensaje cuando no hay resultados'
);

SELECT insert_translation('book_explore', 'results.empty_filtered',
    'Intenta ajustar los filtros o realizar una busqueda diferente',
    'Try adjusting the filters or performing a different search',
    'Essayez d ajuster les filtres ou effectuez une recherche differente',
    'ui-components',
    'Submensaje cuando no hay resultados con filtros'
);

SELECT insert_translation('book_explore', 'results.empty_default',
    'Aun no hay libros publicados',
    'No books published yet',
    'Pas encore de livres publies',
    'ui-components',
    'Submensaje cuando no hay libros'
);

-- Load More
SELECT insert_translation('book_explore', 'load_more',
    'Cargar mas libros',
    'Load more books',
    'Charger plus de livres',
    'actions',
    'Boton para cargar mas resultados'
);

SELECT insert_translation('book_explore', 'loading',
    'Cargando...',
    'Loading...',
    'Chargement...',
    'ui-components',
    'Texto de cargando'
);

SELECT insert_translation('book_explore', 'end_results',
    'Has visto todos los libros!',
    'You have seen all the books!',
    'Vous avez vu tous les livres!',
    'ui-components',
    'Mensaje al final de resultados'
);

-- Featured Section
SELECT insert_translation('book_explore', 'featured.title',
    'Libros Destacados',
    'Featured Books',
    'Livres en Vedette',
    'ui-components',
    'Titulo de seccion destacados'
);

SELECT insert_translation('book_explore', 'featured.subtitle',
    'Los mas populares esta semana',
    'Most popular this week',
    'Les plus populaires cette semaine',
    'ui-components',
    'Subtitulo de seccion destacados'
);

SELECT insert_translation('book_explore', 'featured.badge',
    'Destacado',
    'Featured',
    'En vedette',
    'ui-components',
    'Badge de libro destacado en carrusel'
);

SELECT insert_translation('book_explore', 'featured.previous',
    'Anterior',
    'Previous',
    'Precedent',
    'navigation',
    'Boton anterior en carrusel destacados'
);

SELECT insert_translation('book_explore', 'featured.next',
    'Siguiente',
    'Next',
    'Suivant',
    'navigation',
    'Boton siguiente en carrusel destacados'
);

SELECT insert_translation('book_explore', 'featured.view_book',
    'Ver libro',
    'View book',
    'Voir le livre',
    'actions',
    'Aria label para ver libro destacado'
);

SELECT 'BOOKS: book_explore namespace - 19 translations created' AS status;

-- ============================================================================
-- BOOK_FILTERS NAMESPACE - Panel de filtros
-- ============================================================================

-- General
SELECT insert_translation('book_filters', 'title',
    'Filtros',
    'Filters',
    'Filtres',
    'ui-components',
    'Titulo del panel de filtros'
);

SELECT insert_translation('book_filters', 'clear',
    'Limpiar filtros',
    'Clear filters',
    'Effacer les filtres',
    'actions',
    'Boton para limpiar todos los filtros'
);

SELECT insert_translation('book_filters', 'apply',
    'Aplicar filtros',
    'Apply filters',
    'Appliquer les filtres',
    'actions',
    'Boton para aplicar filtros (mobile)'
);

-- Sort Section
SELECT insert_translation('book_filters', 'sort.title',
    'Ordenar por',
    'Sort by',
    'Trier par',
    'ui-components',
    'Titulo de seccion ordenar'
);

SELECT insert_translation('book_filters', 'sort.recent',
    'Mas recientes',
    'Most recent',
    'Plus recents',
    'ui-components',
    'Opcion ordenar por recientes'
);

SELECT insert_translation('book_filters', 'sort.popular',
    'Mas populares',
    'Most popular',
    'Plus populaires',
    'ui-components',
    'Opcion ordenar por populares'
);

SELECT insert_translation('book_filters', 'sort.rating',
    'Mejor valorados',
    'Highest rated',
    'Mieux notes',
    'ui-components',
    'Opcion ordenar por valoracion'
);

SELECT insert_translation('book_filters', 'sort.title_asc',
    'Titulo A-Z',
    'Title A-Z',
    'Titre A-Z',
    'ui-components',
    'Opcion ordenar titulo ascendente'
);

SELECT insert_translation('book_filters', 'sort.title_desc',
    'Titulo Z-A',
    'Title Z-A',
    'Titre Z-A',
    'ui-components',
    'Opcion ordenar titulo descendente'
);

-- Filter Sections
SELECT insert_translation('book_filters', 'categories',
    'Categorias',
    'Categories',
    'Categories',
    'ui-components',
    'Titulo seccion categorias'
);

SELECT insert_translation('book_filters', 'genres',
    'Generos',
    'Genres',
    'Genres',
    'ui-components',
    'Titulo seccion generos'
);

SELECT insert_translation('book_filters', 'levels',
    'Nivel de lectura',
    'Reading level',
    'Niveau de lecture',
    'ui-components',
    'Titulo seccion niveles'
);

SELECT insert_translation('book_filters', 'access',
    'Tipo de acceso',
    'Access type',
    'Type d acces',
    'ui-components',
    'Titulo seccion tipo acceso'
);

-- Access Types
SELECT insert_translation('book_filters', 'access.public',
    'Gratis',
    'Free',
    'Gratuit',
    'ui-components',
    'Etiqueta acceso publico/gratis'
);

SELECT insert_translation('book_filters', 'access.freemium',
    'Freemium',
    'Freemium',
    'Freemium',
    'ui-components',
    'Etiqueta acceso freemium'
);

SELECT insert_translation('book_filters', 'access.premium',
    'Premium',
    'Premium',
    'Premium',
    'ui-components',
    'Etiqueta acceso premium'
);

SELECT insert_translation('book_filters', 'access.community',
    'Comunidad',
    'Community',
    'Communaute',
    'ui-components',
    'Etiqueta acceso comunidad'
);

-- Years suffix
SELECT insert_translation('book_filters', 'years',
    'anos',
    'years',
    'ans',
    'ui-components',
    'Sufijo para rango de edad'
);

SELECT 'BOOKS: book_filters namespace - 19 translations created' AS status;

-- ============================================================================
-- BOOK_CARD NAMESPACE - Tarjetas de libros
-- ============================================================================

SELECT insert_translation('book_card', 'featured',
    'Destacado',
    'Featured',
    'En vedette',
    'ui-components',
    'Badge de libro destacado'
);

SELECT insert_translation('book_card', 'new',
    'NUEVO',
    'NEW',
    'NOUVEAU',
    'ui-components',
    'Badge de libro nuevo'
);

SELECT insert_translation('book_card', 'readings',
    'lecturas',
    'readings',
    'lectures',
    'ui-components',
    'Sufijo contador de lecturas'
);

SELECT insert_translation('book_card', 'pages',
    'paginas',
    'pages',
    'pages',
    'ui-components',
    'Sufijo contador de paginas'
);

SELECT insert_translation('book_card', 'years',
    'anos',
    'years',
    'ans',
    'ui-components',
    'Sufijo para rango de edad'
);

SELECT insert_translation('book_card', 'view_book',
    'Ver libro',
    'View book',
    'Voir le livre',
    'actions',
    'Aria label para ver libro'
);

SELECT insert_translation('book_card', 'no_cover',
    'Sin portada',
    'No cover',
    'Pas de couverture',
    'ui-components',
    'Texto alternativo sin portada'
);

SELECT insert_translation('book_card', 'reviews',
    'resenas',
    'reviews',
    'avis',
    'ui-components',
    'Sufijo contador de resenas'
);

-- Access types for book card
SELECT insert_translation('book_card', 'access.public',
    'Gratis',
    'Free',
    'Gratuit',
    'ui-components',
    'Badge acceso publico en card'
);

SELECT insert_translation('book_card', 'access.freemium',
    'Freemium',
    'Freemium',
    'Freemium',
    'ui-components',
    'Badge acceso freemium en card'
);

SELECT insert_translation('book_card', 'access.premium',
    'Premium',
    'Premium',
    'Premium',
    'ui-components',
    'Badge acceso premium en card'
);

SELECT insert_translation('book_card', 'access.community',
    'Comunidad',
    'Community',
    'Communaute',
    'ui-components',
    'Badge acceso comunidad en card'
);

SELECT 'BOOKS: book_card namespace - 12 translations created' AS status;

-- ============================================================================
-- BOOK_DETAIL NAMESPACE - Pagina de detalle
-- ============================================================================

-- Header
SELECT insert_translation('book_detail', 'back',
    'Volver',
    'Back',
    'Retour',
    'navigation',
    'Boton volver'
);

SELECT insert_translation('book_detail', 'by_author',
    'Por',
    'By',
    'Par',
    'ui-components',
    'Prefijo nombre de autor'
);

-- Sections
SELECT insert_translation('book_detail', 'description',
    'Descripcion',
    'Description',
    'Description',
    'ui-components',
    'Titulo seccion descripcion'
);

SELECT insert_translation('book_detail', 'about_author',
    'Sobre el autor',
    'About the author',
    'A propos de l auteur',
    'ui-components',
    'Titulo seccion autor'
);

SELECT insert_translation('book_detail', 'details',
    'Detalles',
    'Details',
    'Details',
    'ui-components',
    'Titulo seccion detalles'
);

-- Meta Information
SELECT insert_translation('book_detail', 'pages_count',
    'paginas',
    'pages',
    'pages',
    'ui-components',
    'Sufijo paginas'
);

SELECT insert_translation('book_detail', 'reading_level',
    'Nivel de lectura',
    'Reading level',
    'Niveau de lecture',
    'ui-components',
    'Etiqueta nivel lectura'
);

SELECT insert_translation('book_detail', 'age_range',
    'anos',
    'years',
    'ans',
    'ui-components',
    'Sufijo rango edad'
);

SELECT insert_translation('book_detail', 'categories',
    'Categorias',
    'Categories',
    'Categories',
    'ui-components',
    'Etiqueta categorias'
);

SELECT insert_translation('book_detail', 'genres',
    'Generos',
    'Genres',
    'Genres',
    'ui-components',
    'Etiqueta generos'
);

SELECT insert_translation('book_detail', 'values',
    'Valores',
    'Values',
    'Valeurs',
    'ui-components',
    'Etiqueta valores'
);

SELECT insert_translation('book_detail', 'published_date',
    'Publicado',
    'Published',
    'Publie',
    'ui-components',
    'Etiqueta fecha publicacion'
);

SELECT insert_translation('book_detail', 'views',
    'lecturas',
    'readings',
    'lectures',
    'ui-components',
    'Sufijo lecturas'
);

SELECT insert_translation('book_detail', 'rating',
    'Valoracion',
    'Rating',
    'Note',
    'ui-components',
    'Etiqueta valoracion'
);

SELECT insert_translation('book_detail', 'reviews',
    'resenas',
    'reviews',
    'avis',
    'ui-components',
    'Sufijo resenas'
);

-- Actions
SELECT insert_translation('book_detail', 'start_reading',
    'Empezar a leer',
    'Start reading',
    'Commencer a lire',
    'actions',
    'Boton empezar lectura'
);

SELECT insert_translation('book_detail', 'continue_reading',
    'Continuar leyendo',
    'Continue reading',
    'Continuer la lecture',
    'actions',
    'Boton continuar lectura'
);

SELECT insert_translation('book_detail', 'add_to_library',
    'Agregar a mi biblioteca',
    'Add to my library',
    'Ajouter a ma bibliotheque',
    'actions',
    'Boton agregar biblioteca'
);

SELECT insert_translation('book_detail', 'in_library',
    'En tu biblioteca',
    'In your library',
    'Dans votre bibliotheque',
    'ui-components',
    'Estado en biblioteca'
);

SELECT insert_translation('book_detail', 'share',
    'Compartir',
    'Share',
    'Partager',
    'actions',
    'Boton compartir'
);

SELECT insert_translation('book_detail', 'related_books',
    'Libros relacionados',
    'Related books',
    'Livres associes',
    'ui-components',
    'Titulo seccion relacionados'
);

SELECT insert_translation('book_detail', 'no_description',
    'Este libro aun no tiene descripcion.',
    'This book has no description yet.',
    'Ce livre n a pas encore de description.',
    'ui-components',
    'Mensaje sin descripcion'
);

SELECT insert_translation('book_detail', 'premium_content',
    'Contenido Premium',
    'Premium Content',
    'Contenu Premium',
    'ui-components',
    'Badge contenido premium'
);

SELECT insert_translation('book_detail', 'free_preview',
    'Vista previa gratuita disponible',
    'Free preview available',
    'Apercu gratuit disponible',
    'ui-components',
    'Mensaje preview gratis'
);

SELECT 'BOOKS: book_detail namespace - 24 translations created' AS status;

-- ============================================================================
-- BOOK_READER NAMESPACE - Lector de libros
-- ============================================================================

-- Navigation
SELECT insert_translation('book_reader', 'page',
    'Pagina',
    'Page',
    'Page',
    'ui-components',
    'Etiqueta numero de pagina'
);

SELECT insert_translation('book_reader', 'of',
    'de',
    'of',
    'de',
    'ui-components',
    'Conector "de" en paginacion'
);

SELECT insert_translation('book_reader', 'previous',
    'Anterior',
    'Previous',
    'Precedent',
    'navigation',
    'Boton pagina anterior'
);

SELECT insert_translation('book_reader', 'next',
    'Siguiente',
    'Next',
    'Suivant',
    'navigation',
    'Boton pagina siguiente'
);

SELECT insert_translation('book_reader', 'go_to_page',
    'Ir a pagina',
    'Go to page',
    'Aller a la page',
    'actions',
    'Ir a pagina especifica'
);

-- Controls
SELECT insert_translation('book_reader', 'fullscreen',
    'Pantalla completa',
    'Fullscreen',
    'Plein ecran',
    'actions',
    'Boton pantalla completa'
);

SELECT insert_translation('book_reader', 'exit_fullscreen',
    'Salir de pantalla completa',
    'Exit fullscreen',
    'Quitter le plein ecran',
    'actions',
    'Boton salir pantalla completa'
);

SELECT insert_translation('book_reader', 'font_size',
    'Tamano de fuente',
    'Font size',
    'Taille de police',
    'ui-components',
    'Control tamano fuente'
);

SELECT insert_translation('book_reader', 'font_increase',
    'Aumentar fuente',
    'Increase font',
    'Augmenter la police',
    'actions',
    'Boton aumentar fuente'
);

SELECT insert_translation('book_reader', 'font_decrease',
    'Disminuir fuente',
    'Decrease font',
    'Diminuer la police',
    'actions',
    'Boton disminuir fuente'
);

-- TTS Controls
SELECT insert_translation('book_reader', 'tts.play',
    'Escuchar',
    'Listen',
    'Ecouter',
    'actions',
    'Boton TTS reproducir'
);

SELECT insert_translation('book_reader', 'tts.pause',
    'Pausar',
    'Pause',
    'Pause',
    'actions',
    'Boton TTS pausar'
);

SELECT insert_translation('book_reader', 'tts.stop',
    'Detener',
    'Stop',
    'Arreter',
    'actions',
    'Boton TTS detener'
);

SELECT insert_translation('book_reader', 'tts.resume',
    'Reanudar',
    'Resume',
    'Reprendre',
    'actions',
    'Boton TTS reanudar'
);

SELECT insert_translation('book_reader', 'tts.speed',
    'Velocidad',
    'Speed',
    'Vitesse',
    'ui-components',
    'Control velocidad TTS'
);

SELECT insert_translation('book_reader', 'tts.not_supported',
    'Tu navegador no soporta lectura en voz alta',
    'Your browser does not support text-to-speech',
    'Votre navigateur ne prend pas en charge la lecture vocale',
    'errors',
    'Mensaje TTS no soportado'
);

-- Bookmarks
SELECT insert_translation('book_reader', 'bookmark',
    'Marcar pagina',
    'Bookmark page',
    'Marquer la page',
    'actions',
    'Boton marcar pagina'
);

SELECT insert_translation('book_reader', 'bookmarked',
    'Pagina marcada',
    'Page bookmarked',
    'Page marquee',
    'ui-components',
    'Estado pagina marcada'
);

SELECT insert_translation('book_reader', 'remove_bookmark',
    'Quitar marcador',
    'Remove bookmark',
    'Retirer le signet',
    'actions',
    'Boton quitar marcador'
);

-- General
SELECT insert_translation('book_reader', 'back_to_detail',
    'Volver al libro',
    'Back to book',
    'Retour au livre',
    'navigation',
    'Boton volver a detalle'
);

SELECT insert_translation('book_reader', 'back_to_explore',
    'Volver a explorar',
    'Back to explore',
    'Retour a l exploration',
    'navigation',
    'Boton volver a explorar'
);

SELECT insert_translation('book_reader', 'loading',
    'Cargando libro...',
    'Loading book...',
    'Chargement du livre...',
    'ui-components',
    'Mensaje cargando libro'
);

SELECT insert_translation('book_reader', 'error_loading',
    'Error al cargar el libro',
    'Error loading the book',
    'Erreur lors du chargement du livre',
    'errors',
    'Mensaje error carga'
);

SELECT insert_translation('book_reader', 'no_content',
    'Esta pagina no tiene contenido',
    'This page has no content',
    'Cette page n a pas de contenu',
    'ui-components',
    'Mensaje pagina sin contenido'
);

SELECT insert_translation('book_reader', 'reading_progress',
    'Progreso de lectura',
    'Reading progress',
    'Progres de lecture',
    'ui-components',
    'Etiqueta progreso lectura'
);

SELECT insert_translation('book_reader', 'completed',
    'Completado',
    'Completed',
    'Termine',
    'ui-components',
    'Estado libro completado'
);

-- TTS Speed Options (Array)
SELECT insert_translation('book_reader', 'tts.speeds.0.value',
    '0.5',
    '0.5',
    '0.5',
    'ui-components',
    'Velocidad TTS 0.5x'
);

SELECT insert_translation('book_reader', 'tts.speeds.0.label',
    '0.5x',
    '0.5x',
    '0.5x',
    'ui-components',
    'Etiqueta velocidad 0.5x'
);

SELECT insert_translation('book_reader', 'tts.speeds.1.value',
    '0.75',
    '0.75',
    '0.75',
    'ui-components',
    'Velocidad TTS 0.75x'
);

SELECT insert_translation('book_reader', 'tts.speeds.1.label',
    '0.75x',
    '0.75x',
    '0.75x',
    'ui-components',
    'Etiqueta velocidad 0.75x'
);

SELECT insert_translation('book_reader', 'tts.speeds.2.value',
    '1',
    '1',
    '1',
    'ui-components',
    'Velocidad TTS 1x'
);

SELECT insert_translation('book_reader', 'tts.speeds.2.label',
    '1x (Normal)',
    '1x (Normal)',
    '1x (Normal)',
    'ui-components',
    'Etiqueta velocidad 1x'
);

SELECT insert_translation('book_reader', 'tts.speeds.3.value',
    '1.25',
    '1.25',
    '1.25',
    'ui-components',
    'Velocidad TTS 1.25x'
);

SELECT insert_translation('book_reader', 'tts.speeds.3.label',
    '1.25x',
    '1.25x',
    '1.25x',
    'ui-components',
    'Etiqueta velocidad 1.25x'
);

SELECT insert_translation('book_reader', 'tts.speeds.4.value',
    '1.5',
    '1.5',
    '1.5',
    'ui-components',
    'Velocidad TTS 1.5x'
);

SELECT insert_translation('book_reader', 'tts.speeds.4.label',
    '1.5x',
    '1.5x',
    '1.5x',
    'ui-components',
    'Etiqueta velocidad 1.5x'
);

SELECT insert_translation('book_reader', 'tts.speeds.5.value',
    '2',
    '2',
    '2',
    'ui-components',
    'Velocidad TTS 2x'
);

SELECT insert_translation('book_reader', 'tts.speeds.5.label',
    '2x',
    '2x',
    '2x',
    'ui-components',
    'Etiqueta velocidad 2x'
);

SELECT 'BOOKS: book_reader namespace - 38 translations created' AS status;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================

SELECT 'BOOKS MODULE: All translations created successfully!' AS status;

-- Resumen de traducciones por namespace
SELECT
    namespace_slug,
    COUNT(*) as total_keys
FROM app.translation_keys
WHERE namespace_slug IN ('book_explore', 'book_filters', 'book_card', 'book_detail', 'book_reader')
GROUP BY namespace_slug
ORDER BY namespace_slug;

-- Total de traducciones
SELECT
    COUNT(*) as total_translations
FROM app.translations t
JOIN app.translation_keys tk ON t.translation_key_id = tk.id
WHERE tk.namespace_slug IN ('book_explore', 'book_filters', 'book_card', 'book_detail', 'book_reader');
