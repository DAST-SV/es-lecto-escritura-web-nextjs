-- ============================================================================
-- TRADUCCIONES: Formulario de creacion/edicion de libros
-- Namespace: books_form
-- ============================================================================

-- Usar la funcion helper para insertar traducciones
SELECT app.upsert_translation('books_form', 'page_title_create', 'es', 'Crear Nuevo Libro');
SELECT app.upsert_translation('books_form', 'page_title_create', 'en', 'Create New Book');

SELECT app.upsert_translation('books_form', 'page_title_edit', 'es', 'Editar Libro');
SELECT app.upsert_translation('books_form', 'page_title_edit', 'en', 'Edit Book');

SELECT app.upsert_translation('books_form', 'languages_completed', 'es', 'idiomas completados');
SELECT app.upsert_translation('books_form', 'languages_completed', 'en', 'languages completed');

SELECT app.upsert_translation('books_form', 'loading_languages', 'es', 'Cargando idiomas...');
SELECT app.upsert_translation('books_form', 'loading_languages', 'en', 'Loading languages...');

SELECT app.upsert_translation('books_form', 'loading_book', 'es', 'Cargando libro...');
SELECT app.upsert_translation('books_form', 'loading_book', 'en', 'Loading book...');

-- Botones
SELECT app.upsert_translation('books_form', 'btn_save', 'es', 'Guardar');
SELECT app.upsert_translation('books_form', 'btn_save', 'en', 'Save');

SELECT app.upsert_translation('books_form', 'btn_save_changes', 'es', 'Guardar Cambios');
SELECT app.upsert_translation('books_form', 'btn_save_changes', 'en', 'Save Changes');

SELECT app.upsert_translation('books_form', 'btn_saving', 'es', 'Guardando...');
SELECT app.upsert_translation('books_form', 'btn_saving', 'en', 'Saving...');

-- Secciones
SELECT app.upsert_translation('books_form', 'section_translations', 'es', 'Traducciones');
SELECT app.upsert_translation('books_form', 'section_translations', 'en', 'Translations');

SELECT app.upsert_translation('books_form', 'section_authors', 'es', 'Autores');
SELECT app.upsert_translation('books_form', 'section_authors', 'en', 'Authors');

SELECT app.upsert_translation('books_form', 'section_classification', 'es', 'Clasificacion');
SELECT app.upsert_translation('books_form', 'section_classification', 'en', 'Classification');

SELECT app.upsert_translation('books_form', 'section_preview', 'es', 'Vista Previa');
SELECT app.upsert_translation('books_form', 'section_preview', 'en', 'Preview');

-- Idioma principal
SELECT app.upsert_translation('books_form', 'primary_language', 'es', 'Este es el idioma principal');
SELECT app.upsert_translation('books_form', 'primary_language', 'en', 'This is the primary language');

SELECT app.upsert_translation('books_form', 'set_primary_language', 'es', 'Marcar como idioma principal');
SELECT app.upsert_translation('books_form', 'set_primary_language', 'en', 'Set as primary language');

SELECT app.upsert_translation('books_form', 'btn_primary', 'es', 'Principal');
SELECT app.upsert_translation('books_form', 'btn_primary', 'en', 'Primary');

SELECT app.upsert_translation('books_form', 'btn_set_primary', 'es', 'Establecer como principal');
SELECT app.upsert_translation('books_form', 'btn_set_primary', 'en', 'Set as primary');

-- Campos de traduccion
SELECT app.upsert_translation('books_form', 'field_title', 'es', 'Titulo');
SELECT app.upsert_translation('books_form', 'field_title', 'en', 'Title');

SELECT app.upsert_translation('books_form', 'field_subtitle', 'es', 'Subtitulo');
SELECT app.upsert_translation('books_form', 'field_subtitle', 'en', 'Subtitle');

SELECT app.upsert_translation('books_form', 'field_description', 'es', 'Descripcion');
SELECT app.upsert_translation('books_form', 'field_description', 'en', 'Description');

SELECT app.upsert_translation('books_form', 'field_summary', 'es', 'Resumen corto');
SELECT app.upsert_translation('books_form', 'field_summary', 'en', 'Short summary');

SELECT app.upsert_translation('books_form', 'field_pdf', 'es', 'PDF');
SELECT app.upsert_translation('books_form', 'field_pdf', 'en', 'PDF');

-- Placeholders
SELECT app.upsert_translation('books_form', 'placeholder_title', 'es', 'Titulo en {language}');
SELECT app.upsert_translation('books_form', 'placeholder_title', 'en', 'Title in {language}');

SELECT app.upsert_translation('books_form', 'placeholder_subtitle', 'es', 'Subtitulo (opcional)');
SELECT app.upsert_translation('books_form', 'placeholder_subtitle', 'en', 'Subtitle (optional)');

SELECT app.upsert_translation('books_form', 'placeholder_description', 'es', 'Descripcion completa del libro...');
SELECT app.upsert_translation('books_form', 'placeholder_description', 'en', 'Full book description...');

SELECT app.upsert_translation('books_form', 'placeholder_summary', 'es', 'Resumen breve para previews...');
SELECT app.upsert_translation('books_form', 'placeholder_summary', 'en', 'Brief summary for previews...');

-- PDF
SELECT app.upsert_translation('books_form', 'pdf_loaded', 'es', 'PDF cargado');
SELECT app.upsert_translation('books_form', 'pdf_loaded', 'en', 'PDF loaded');

SELECT app.upsert_translation('books_form', 'pdf_change', 'es', 'Cambiar PDF');
SELECT app.upsert_translation('books_form', 'pdf_change', 'en', 'Change PDF');

SELECT app.upsert_translation('books_form', 'pdf_upload', 'es', 'Subir PDF');
SELECT app.upsert_translation('books_form', 'pdf_upload', 'en', 'Upload PDF');

SELECT app.upsert_translation('books_form', 'pdf_max_size', 'es', 'Max. 50MB');
SELECT app.upsert_translation('books_form', 'pdf_max_size', 'en', 'Max. 50MB');

SELECT app.upsert_translation('books_form', 'pdf_processing', 'es', 'Procesando PDF...');
SELECT app.upsert_translation('books_form', 'pdf_processing', 'en', 'Processing PDF...');

SELECT app.upsert_translation('books_form', 'pdf_preview', 'es', 'Preview ({pages} pag.)');
SELECT app.upsert_translation('books_form', 'pdf_preview', 'en', 'Preview ({pages} pages)');

-- Clasificacion
SELECT app.upsert_translation('books_form', 'field_category', 'es', 'Categoria');
SELECT app.upsert_translation('books_form', 'field_category', 'en', 'Category');

SELECT app.upsert_translation('books_form', 'field_level', 'es', 'Nivel');
SELECT app.upsert_translation('books_form', 'field_level', 'en', 'Level');

SELECT app.upsert_translation('books_form', 'field_genres', 'es', 'Generos');
SELECT app.upsert_translation('books_form', 'field_genres', 'en', 'Genres');

SELECT app.upsert_translation('books_form', 'select_category', 'es', 'Seleccionar categoria');
SELECT app.upsert_translation('books_form', 'select_category', 'en', 'Select category');

-- Preview
SELECT app.upsert_translation('books_form', 'no_title', 'es', 'Sin titulo');
SELECT app.upsert_translation('books_form', 'no_title', 'en', 'No title');

SELECT app.upsert_translation('books_form', 'by_authors', 'es', 'Por: {authors}');
SELECT app.upsert_translation('books_form', 'by_authors', 'en', 'By: {authors}');

SELECT app.upsert_translation('books_form', 'preview_empty_title', 'es', 'Vista previa');
SELECT app.upsert_translation('books_form', 'preview_empty_title', 'en', 'Preview');

SELECT app.upsert_translation('books_form', 'preview_empty_text', 'es', 'Completa el formulario para ver la vista previa del libro');
SELECT app.upsert_translation('books_form', 'preview_empty_text', 'en', 'Complete the form to see the book preview');

SELECT app.upsert_translation('books_form', 'cover_label', 'es', 'Portada');
SELECT app.upsert_translation('books_form', 'cover_label', 'en', 'Cover');

-- Estado de traducciones
SELECT app.upsert_translation('books_form', 'translation_complete', 'es', 'Completo');
SELECT app.upsert_translation('books_form', 'translation_complete', 'en', 'Complete');

SELECT app.upsert_translation('books_form', 'translation_incomplete', 'es', 'Incompleto');
SELECT app.upsert_translation('books_form', 'translation_incomplete', 'en', 'Incomplete');

-- Autores
SELECT app.upsert_translation('books_form', 'authors_label', 'es', 'Autores');
SELECT app.upsert_translation('books_form', 'authors_label', 'en', 'Authors');

SELECT app.upsert_translation('books_form', 'authors_search', 'es', 'Buscar co-autor por email...');
SELECT app.upsert_translation('books_form', 'authors_search', 'en', 'Search co-author by email...');

SELECT app.upsert_translation('books_form', 'authors_hint', 'es', 'Busca por email para agregar co-autores del sistema');
SELECT app.upsert_translation('books_form', 'authors_hint', 'en', 'Search by email to add system co-authors');

SELECT app.upsert_translation('books_form', 'authors_you', 'es', 'Tu');
SELECT app.upsert_translation('books_form', 'authors_you', 'en', 'You');

SELECT app.upsert_translation('books_form', 'authors_no_results', 'es', 'No se encontraron usuarios');
SELECT app.upsert_translation('books_form', 'authors_no_results', 'en', 'No users found');

SELECT app.upsert_translation('books_form', 'authors_try_other', 'es', 'Intenta con otro email');
SELECT app.upsert_translation('books_form', 'authors_try_other', 'en', 'Try another email');

SELECT app.upsert_translation('books_form', 'authors_remove', 'es', 'Eliminar autor');
SELECT app.upsert_translation('books_form', 'authors_remove', 'en', 'Remove author');

-- Roles de autor
SELECT app.upsert_translation('books_form', 'role_author', 'es', 'Autor');
SELECT app.upsert_translation('books_form', 'role_author', 'en', 'Author');

SELECT app.upsert_translation('books_form', 'role_illustrator', 'es', 'Ilustrador');
SELECT app.upsert_translation('books_form', 'role_illustrator', 'en', 'Illustrator');

SELECT app.upsert_translation('books_form', 'role_translator', 'es', 'Traductor');
SELECT app.upsert_translation('books_form', 'role_translator', 'en', 'Translator');

SELECT app.upsert_translation('books_form', 'role_editor', 'es', 'Editor');
SELECT app.upsert_translation('books_form', 'role_editor', 'en', 'Editor');

-- Errores
SELECT app.upsert_translation('books_form', 'error_required_fields', 'es', 'Completa los campos obligatorios');
SELECT app.upsert_translation('books_form', 'error_required_fields', 'en', 'Complete required fields');

SELECT app.upsert_translation('books_form', 'required', 'es', '*');
SELECT app.upsert_translation('books_form', 'required', 'en', '*');

-- Mensajes
SELECT app.upsert_translation('books_form', 'msg_book_loaded', 'es', 'Libro cargado');
SELECT app.upsert_translation('books_form', 'msg_book_loaded', 'en', 'Book loaded');

SELECT app.upsert_translation('books_form', 'msg_book_created', 'es', 'Libro creado');
SELECT app.upsert_translation('books_form', 'msg_book_created', 'en', 'Book created');

SELECT app.upsert_translation('books_form', 'msg_book_updated', 'es', 'Libro actualizado');
SELECT app.upsert_translation('books_form', 'msg_book_updated', 'en', 'Book updated');

SELECT app.upsert_translation('books_form', 'msg_pdf_processed', 'es', 'PDF procesado');
SELECT app.upsert_translation('books_form', 'msg_pdf_processed', 'en', 'PDF processed');

-- Etiquetas, Valores y Personajes
SELECT app.upsert_translation('books_form', 'field_tags', 'es', 'Etiquetas');
SELECT app.upsert_translation('books_form', 'field_tags', 'en', 'Tags');

SELECT app.upsert_translation('books_form', 'field_values', 'es', 'Valores educativos');
SELECT app.upsert_translation('books_form', 'field_values', 'en', 'Educational values');

SELECT app.upsert_translation('books_form', 'field_characters', 'es', 'Personajes');
SELECT app.upsert_translation('books_form', 'field_characters', 'en', 'Characters');

SELECT app.upsert_translation('books_form', 'character_name', 'es', 'Nombre del personaje');
SELECT app.upsert_translation('books_form', 'character_name', 'en', 'Character name');

SELECT app.upsert_translation('books_form', 'character_role_main', 'es', 'Principal');
SELECT app.upsert_translation('books_form', 'character_role_main', 'en', 'Main');

SELECT app.upsert_translation('books_form', 'character_role_secondary', 'es', 'Secundario');
SELECT app.upsert_translation('books_form', 'character_role_secondary', 'en', 'Secondary');

SELECT app.upsert_translation('books_form', 'character_role_supporting', 'es', 'De apoyo');
SELECT app.upsert_translation('books_form', 'character_role_supporting', 'en', 'Supporting');

SELECT app.upsert_translation('books_form', 'character_add_hint', 'es', 'Agrega los personajes principales de tu historia');
SELECT app.upsert_translation('books_form', 'character_add_hint', 'en', 'Add the main characters of your story');

SELECT app.upsert_translation('books_form', 'character_max_reached', 'es', 'Maximo de personajes alcanzado');
SELECT app.upsert_translation('books_form', 'character_max_reached', 'en', 'Maximum characters reached');

SELECT 'Traducciones de books_form insertadas' AS status;
