-- supabase/schemas/app/translations/data/common.sql
-- ============================================================================
-- TRANSLATIONS DATA: COMMON
-- DESCRIPCIÓN: Traducciones comunes usadas en toda la aplicación
-- ============================================================================

SET search_path TO app, public;

-- common.save
SELECT insert_translation('common', 'save',
    'Guardar',
    'Save',
    'Enregistrer',
    'actions',
    'Botón guardar'
);

-- common.cancel
SELECT insert_translation('common', 'cancel',
    'Cancelar',
    'Cancel',
    'Annuler',
    'actions',
    'Botón cancelar'
);

-- common.delete
SELECT insert_translation('common', 'delete',
    'Eliminar',
    'Delete',
    'Supprimer',
    'actions',
    'Botón eliminar'
);

-- common.edit
SELECT insert_translation('common', 'edit',
    'Editar',
    'Edit',
    'Modifier',
    'actions',
    'Botón editar'
);

-- common.submit
SELECT insert_translation('common', 'submit',
    'Enviar',
    'Submit',
    'Soumettre',
    'actions',
    'Botón enviar'
);

-- common.loading
SELECT insert_translation('common', 'loading',
    'Cargando...',
    'Loading...',
    'Chargement...',
    'ui-components',
    'Texto de cargando'
);

-- common.search
SELECT insert_translation('common', 'search',
    'Buscar',
    'Search',
    'Rechercher',
    'actions',
    'Botón/campo buscar'
);

-- common.close
SELECT insert_translation('common', 'close',
    'Cerrar',
    'Close',
    'Fermer',
    'actions',
    'Botón cerrar'
);

-- common.back
SELECT insert_translation('common', 'back',
    'Atrás',
    'Back',
    'Retour',
    'navigation',
    'Botón atrás'
);

-- common.next
SELECT insert_translation('common', 'next',
    'Siguiente',
    'Next',
    'Suivant',
    'navigation',
    'Botón siguiente'
);

-- common.previous
SELECT insert_translation('common', 'previous',
    'Anterior',
    'Previous',
    'Précédent',
    'navigation',
    'Botón anterior'
);

-- common.confirm
SELECT insert_translation('common', 'confirm',
    'Confirmar',
    'Confirm',
    'Confirmer',
    'actions',
    'Botón confirmar'
);

-- common.yes
SELECT insert_translation('common', 'yes',
    'Sí',
    'Yes',
    'Oui',
    'actions',
    'Respuesta sí'
);

-- common.no
SELECT insert_translation('common', 'no',
    'No',
    'No',
    'Non',
    'actions',
    'Respuesta no'
);

SELECT 'TRANSLATIONS: Common - 14 traducciones insertadas' AS status;
