-- ============================================================================
-- TRADUCCIONES: Formulario de creacion/edicion de libros
-- Namespace: books_form
-- ============================================================================

SET search_path TO app, public;

-- Crear namespace si no existe
INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES ('books_form', 'Books Form', 'Translations for book creation/edit form', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, is_active = true;

-- Usar la funcion helper insert_translation para insertar traducciones
-- Titulos de pagina
SELECT insert_translation('books_form', 'page_title_create',
    'Crear Nuevo Libro',
    'Create New Book',
    'Creer un Nouveau Livre',
    'ui-components',
    'Titulo pagina crear libro'
);

SELECT insert_translation('books_form', 'page_title_edit',
    'Editar Libro',
    'Edit Book',
    'Modifier le Livre',
    'ui-components',
    'Titulo pagina editar libro'
);

SELECT insert_translation('books_form', 'languages_completed',
    'idiomas completados',
    'languages completed',
    'langues completees',
    'ui-components',
    'Contador idiomas completados'
);

SELECT insert_translation('books_form', 'loading_languages',
    'Cargando idiomas...',
    'Loading languages...',
    'Chargement des langues...',
    'ui-components',
    'Mensaje cargando idiomas'
);

SELECT insert_translation('books_form', 'loading_book',
    'Cargando libro...',
    'Loading book...',
    'Chargement du livre...',
    'ui-components',
    'Mensaje cargando libro'
);

-- Botones
SELECT insert_translation('books_form', 'btn_save',
    'Guardar',
    'Save',
    'Enregistrer',
    'actions',
    'Boton guardar'
);

SELECT insert_translation('books_form', 'btn_save_changes',
    'Guardar Cambios',
    'Save Changes',
    'Enregistrer les Modifications',
    'actions',
    'Boton guardar cambios'
);

SELECT insert_translation('books_form', 'btn_saving',
    'Guardando...',
    'Saving...',
    'Enregistrement...',
    'actions',
    'Estado guardando'
);

-- Secciones
SELECT insert_translation('books_form', 'section_translations',
    'Traducciones',
    'Translations',
    'Traductions',
    'ui-components',
    'Titulo seccion traducciones'
);

SELECT insert_translation('books_form', 'section_authors',
    'Autores',
    'Authors',
    'Auteurs',
    'ui-components',
    'Titulo seccion autores'
);

SELECT insert_translation('books_form', 'section_classification',
    'Clasificacion',
    'Classification',
    'Classification',
    'ui-components',
    'Titulo seccion clasificacion'
);

SELECT insert_translation('books_form', 'section_preview',
    'Vista Previa',
    'Preview',
    'Apercu',
    'ui-components',
    'Titulo seccion preview'
);

-- Idioma principal
SELECT insert_translation('books_form', 'primary_language',
    'Este es el idioma principal',
    'This is the primary language',
    'Ceci est la langue principale',
    'ui-components',
    'Indicador idioma principal'
);

SELECT insert_translation('books_form', 'set_primary_language',
    'Marcar como idioma principal',
    'Set as primary language',
    'Definir comme langue principale',
    'actions',
    'Accion marcar idioma principal'
);

SELECT insert_translation('books_form', 'btn_primary',
    'Principal',
    'Primary',
    'Principal',
    'actions',
    'Boton principal'
);

SELECT insert_translation('books_form', 'btn_set_primary',
    'Establecer como principal',
    'Set as primary',
    'Definir comme principal',
    'actions',
    'Boton establecer principal'
);

-- Campos de traduccion
SELECT insert_translation('books_form', 'field_title',
    'Titulo',
    'Title',
    'Titre',
    'forms',
    'Campo titulo'
);

SELECT insert_translation('books_form', 'field_subtitle',
    'Subtitulo',
    'Subtitle',
    'Sous-titre',
    'forms',
    'Campo subtitulo'
);

SELECT insert_translation('books_form', 'field_description',
    'Descripcion',
    'Description',
    'Description',
    'forms',
    'Campo descripcion'
);

SELECT insert_translation('books_form', 'field_summary',
    'Resumen corto',
    'Short summary',
    'Resume court',
    'forms',
    'Campo resumen'
);

SELECT insert_translation('books_form', 'field_pdf',
    'PDF',
    'PDF',
    'PDF',
    'forms',
    'Campo PDF'
);

-- Placeholders
SELECT insert_translation('books_form', 'placeholder_title',
    'Titulo en {language}',
    'Title in {language}',
    'Titre en {language}',
    'forms',
    'Placeholder titulo'
);

SELECT insert_translation('books_form', 'placeholder_subtitle',
    'Subtitulo (opcional)',
    'Subtitle (optional)',
    'Sous-titre (optionnel)',
    'forms',
    'Placeholder subtitulo'
);

SELECT insert_translation('books_form', 'placeholder_description',
    'Descripcion completa del libro...',
    'Full book description...',
    'Description complete du livre...',
    'forms',
    'Placeholder descripcion'
);

SELECT insert_translation('books_form', 'placeholder_summary',
    'Resumen breve para previews...',
    'Brief summary for previews...',
    'Resume bref pour les aperçus...',
    'forms',
    'Placeholder resumen'
);

-- PDF
SELECT insert_translation('books_form', 'pdf_loaded',
    'PDF cargado',
    'PDF loaded',
    'PDF charge',
    'ui-components',
    'Estado PDF cargado'
);

SELECT insert_translation('books_form', 'pdf_change',
    'Cambiar PDF',
    'Change PDF',
    'Changer le PDF',
    'actions',
    'Boton cambiar PDF'
);

SELECT insert_translation('books_form', 'pdf_upload',
    'Subir PDF',
    'Upload PDF',
    'Telecharger le PDF',
    'actions',
    'Boton subir PDF'
);

SELECT insert_translation('books_form', 'pdf_max_size',
    'Max. 50MB',
    'Max. 50MB',
    'Max. 50 Mo',
    'ui-components',
    'Limite tamano PDF'
);

SELECT insert_translation('books_form', 'pdf_processing',
    'Procesando PDF...',
    'Processing PDF...',
    'Traitement du PDF...',
    'ui-components',
    'Estado procesando PDF'
);

SELECT insert_translation('books_form', 'pdf_preview',
    'Preview ({pages} pag.)',
    'Preview ({pages} pages)',
    'Aperçu ({pages} pages)',
    'ui-components',
    'Preview PDF con paginas'
);

-- Clasificacion
SELECT insert_translation('books_form', 'field_category',
    'Categoria',
    'Category',
    'Categorie',
    'forms',
    'Campo categoria'
);

SELECT insert_translation('books_form', 'field_level',
    'Nivel',
    'Level',
    'Niveau',
    'forms',
    'Campo nivel'
);

SELECT insert_translation('books_form', 'field_genres',
    'Generos',
    'Genres',
    'Genres',
    'forms',
    'Campo generos'
);

SELECT insert_translation('books_form', 'select_category',
    'Seleccionar categoria',
    'Select category',
    'Selectionner une categorie',
    'forms',
    'Placeholder seleccionar categoria'
);

-- Preview
SELECT insert_translation('books_form', 'no_title',
    'Sin titulo',
    'No title',
    'Sans titre',
    'ui-components',
    'Fallback sin titulo'
);

SELECT insert_translation('books_form', 'by_authors',
    'Por: {authors}',
    'By: {authors}',
    'Par: {authors}',
    'ui-components',
    'Prefijo autores'
);

SELECT insert_translation('books_form', 'preview_empty_title',
    'Vista previa',
    'Preview',
    'Aperçu',
    'ui-components',
    'Titulo preview vacio'
);

SELECT insert_translation('books_form', 'preview_empty_text',
    'Completa el formulario para ver la vista previa del libro',
    'Complete the form to see the book preview',
    'Completez le formulaire pour voir l''aperçu du livre',
    'ui-components',
    'Texto preview vacio'
);

SELECT insert_translation('books_form', 'cover_label',
    'Portada',
    'Cover',
    'Couverture',
    'ui-components',
    'Etiqueta portada'
);

-- Estado de traducciones
SELECT insert_translation('books_form', 'translation_complete',
    'Completo',
    'Complete',
    'Complet',
    'ui-components',
    'Estado traduccion completa'
);

SELECT insert_translation('books_form', 'translation_incomplete',
    'Incompleto',
    'Incomplete',
    'Incomplet',
    'ui-components',
    'Estado traduccion incompleta'
);

-- Autores
SELECT insert_translation('books_form', 'authors_label',
    'Autores',
    'Authors',
    'Auteurs',
    'forms',
    'Etiqueta autores'
);

SELECT insert_translation('books_form', 'authors_search',
    'Buscar co-autor por email...',
    'Search co-author by email...',
    'Rechercher un co-auteur par email...',
    'forms',
    'Placeholder buscar autor'
);

SELECT insert_translation('books_form', 'authors_hint',
    'Busca por email para agregar co-autores del sistema',
    'Search by email to add system co-authors',
    'Recherchez par email pour ajouter des co-auteurs du systeme',
    'ui-components',
    'Hint buscar autores'
);

SELECT insert_translation('books_form', 'authors_you',
    'Tu',
    'You',
    'Vous',
    'ui-components',
    'Indicador usuario actual'
);

SELECT insert_translation('books_form', 'authors_no_results',
    'No se encontraron usuarios',
    'No users found',
    'Aucun utilisateur trouve',
    'ui-components',
    'Sin resultados busqueda autores'
);

SELECT insert_translation('books_form', 'authors_try_other',
    'Intenta con otro email',
    'Try another email',
    'Essayez avec un autre email',
    'ui-components',
    'Sugerencia buscar otro email'
);

SELECT insert_translation('books_form', 'authors_remove',
    'Eliminar autor',
    'Remove author',
    'Retirer l''auteur',
    'actions',
    'Boton eliminar autor'
);

-- Roles de autor
SELECT insert_translation('books_form', 'role_author',
    'Autor',
    'Author',
    'Auteur',
    'ui-components',
    'Rol autor'
);

SELECT insert_translation('books_form', 'role_illustrator',
    'Ilustrador',
    'Illustrator',
    'Illustrateur',
    'ui-components',
    'Rol ilustrador'
);

SELECT insert_translation('books_form', 'role_translator',
    'Traductor',
    'Translator',
    'Traducteur',
    'ui-components',
    'Rol traductor'
);

SELECT insert_translation('books_form', 'role_editor',
    'Editor',
    'Editor',
    'Editeur',
    'ui-components',
    'Rol editor'
);

-- Errores
SELECT insert_translation('books_form', 'error_required_fields',
    'Completa los campos obligatorios',
    'Complete required fields',
    'Completez les champs obligatoires',
    'errors',
    'Error campos requeridos'
);

SELECT insert_translation('books_form', 'required',
    '*',
    '*',
    '*',
    'ui-components',
    'Indicador campo requerido'
);

-- Mensajes
SELECT insert_translation('books_form', 'msg_book_loaded',
    'Libro cargado',
    'Book loaded',
    'Livre charge',
    'notifications',
    'Toast libro cargado'
);

SELECT insert_translation('books_form', 'msg_book_created',
    'Libro creado',
    'Book created',
    'Livre cree',
    'notifications',
    'Toast libro creado'
);

SELECT insert_translation('books_form', 'msg_book_updated',
    'Libro actualizado',
    'Book updated',
    'Livre mis a jour',
    'notifications',
    'Toast libro actualizado'
);

SELECT insert_translation('books_form', 'msg_pdf_processed',
    'PDF procesado',
    'PDF processed',
    'PDF traite',
    'notifications',
    'Toast PDF procesado'
);

-- Etiquetas, Valores y Personajes
SELECT insert_translation('books_form', 'field_tags',
    'Etiquetas',
    'Tags',
    'Etiquettes',
    'forms',
    'Campo etiquetas'
);

SELECT insert_translation('books_form', 'field_values',
    'Valores educativos',
    'Educational values',
    'Valeurs educatives',
    'forms',
    'Campo valores educativos'
);

SELECT insert_translation('books_form', 'field_characters',
    'Personajes',
    'Characters',
    'Personnages',
    'forms',
    'Campo personajes'
);

SELECT insert_translation('books_form', 'character_name',
    'Nombre del personaje',
    'Character name',
    'Nom du personnage',
    'forms',
    'Campo nombre personaje'
);

SELECT insert_translation('books_form', 'character_role_main',
    'Principal',
    'Main',
    'Principal',
    'ui-components',
    'Rol personaje principal'
);

SELECT insert_translation('books_form', 'character_role_secondary',
    'Secundario',
    'Secondary',
    'Secondaire',
    'ui-components',
    'Rol personaje secundario'
);

SELECT insert_translation('books_form', 'character_role_supporting',
    'De apoyo',
    'Supporting',
    'De soutien',
    'ui-components',
    'Rol personaje de apoyo'
);

SELECT insert_translation('books_form', 'character_add_hint',
    'Agrega los personajes principales de tu historia',
    'Add the main characters of your story',
    'Ajoutez les personnages principaux de votre histoire',
    'ui-components',
    'Hint agregar personajes'
);

SELECT insert_translation('books_form', 'character_max_reached',
    'Maximo de personajes alcanzado',
    'Maximum characters reached',
    'Nombre maximum de personnages atteint',
    'errors',
    'Error maximo personajes'
);

SELECT 'BOOKS_FORM: 55 translations created' AS status;
