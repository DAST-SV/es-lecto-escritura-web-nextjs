-- ============================================================================
-- TRANSLATIONS DATA: AUTH - ROLES
-- DESCRIPCIÓN: Traducciones de nombres y descripciones de roles
-- ============================================================================

SET search_path TO app, public;

-- auth.roles.student.name
SELECT insert_translation('auth', 'roles.student.name',
    'Estudiante',
    'Student',
    'Étudiant',
    'ui-components',
    'Nombre del rol estudiante'
);

-- auth.roles.student.description
SELECT insert_translation('auth', 'roles.student.description',
    'Quiero aprender a leer y escribir',
    'I want to learn reading and writing',
    'Je veux apprendre à lire et écrire',
    'ui-components',
    'Descripción del rol estudiante'
);

-- auth.roles.teacher.name
SELECT insert_translation('auth', 'roles.teacher.name',
    'Maestro/a',
    'Teacher',
    'Enseignant',
    'ui-components',
    'Nombre del rol maestro'
);

-- auth.roles.teacher.description
SELECT insert_translation('auth', 'roles.teacher.description',
    'Quiero enseñar a mis estudiantes',
    'I want to teach my students',
    'Je veux enseigner à mes élèves',
    'ui-components',
    'Descripción del rol maestro'
);

-- auth.roles.parent.name
SELECT insert_translation('auth', 'roles.parent.name',
    'Padre/Madre',
    'Parent',
    'Parent',
    'ui-components',
    'Nombre del rol padre'
);

-- auth.roles.parent.description
SELECT insert_translation('auth', 'roles.parent.description',
    'Quiero ayudar a mis hijos',
    'I want to help my children',
    'Je veux aider mes enfants',
    'ui-components',
    'Descripción del rol padre'
);

-- auth.roles.school.name
SELECT insert_translation('auth', 'roles.school.name',
    'Escuela',
    'School',
    'École',
    'ui-components',
    'Nombre del rol escuela'
);

-- auth.roles.school.description
SELECT insert_translation('auth', 'roles.school.description',
    'Quiero gestionar mi institución',
    'I want to manage my institution',
    'Je veux gérer mon institution',
    'ui-components',
    'Descripción del rol escuela'
);

-- auth.roles.individual.name
SELECT insert_translation('auth', 'roles.individual.name',
    'Usuario Individual',
    'Individual User',
    'Utilisateur Individuel',
    'ui-components',
    'Nombre del rol individual'
);

-- auth.roles.individual.description
SELECT insert_translation('auth', 'roles.individual.description',
    'Quiero aprender por mi cuenta',
    'I want to learn on my own',
    'Je veux apprendre par moi-même',
    'ui-components',
    'Descripción del rol individual'
);

SELECT 'TRANSLATIONS: Auth roles - 10 traducciones insertadas' AS status;
