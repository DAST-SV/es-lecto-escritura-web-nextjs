-- supabase/schemas/app/translations/data/auth/04_roles.sql
-- ============================================================================
-- TRANSLATIONS DATA: AUTH - ROLES
-- DESCRIPCION: Traducciones de nombres, descripciones e iconos de roles
-- ============================================================================

SET search_path TO app, public;

-- ============================================
-- STUDENT
-- ============================================
SELECT insert_translation('auth', 'roles.student.name',
    'Estudiante',
    'Student',
    'Etudiant',
    'ui-components',
    'Nombre del rol estudiante'
);

SELECT insert_translation('auth', 'roles.student.description',
    'Quiero aprender a leer y escribir',
    'I want to learn reading and writing',
    'Je veux apprendre a lire et ecrire',
    'ui-components',
    'Descripcion del rol estudiante'
);

SELECT insert_translation('auth', 'roles.student.icon',
    '🎓',
    '🎓',
    '🎓',
    'ui-components',
    'Icono del rol estudiante'
);

-- ============================================
-- TEACHER
-- ============================================
SELECT insert_translation('auth', 'roles.teacher.name',
    'Maestro/a',
    'Teacher',
    'Enseignant',
    'ui-components',
    'Nombre del rol maestro'
);

SELECT insert_translation('auth', 'roles.teacher.description',
    'Quiero ensenar a mis estudiantes',
    'I want to teach my students',
    'Je veux enseigner a mes eleves',
    'ui-components',
    'Descripcion del rol maestro'
);

SELECT insert_translation('auth', 'roles.teacher.icon',
    '📚',
    '📚',
    '📚',
    'ui-components',
    'Icono del rol maestro'
);

-- ============================================
-- PARENT
-- ============================================
SELECT insert_translation('auth', 'roles.parent.name',
    'Padre/Madre',
    'Parent',
    'Parent',
    'ui-components',
    'Nombre del rol padre'
);

SELECT insert_translation('auth', 'roles.parent.description',
    'Quiero ayudar a mis hijos',
    'I want to help my children',
    'Je veux aider mes enfants',
    'ui-components',
    'Descripcion del rol padre'
);

SELECT insert_translation('auth', 'roles.parent.icon',
    '👨‍👩‍👧',
    '👨‍👩‍👧',
    '👨‍👩‍👧',
    'ui-components',
    'Icono del rol padre'
);

-- ============================================
-- SCHOOL
-- ============================================
SELECT insert_translation('auth', 'roles.school.name',
    'Escuela',
    'School',
    'Ecole',
    'ui-components',
    'Nombre del rol escuela'
);

SELECT insert_translation('auth', 'roles.school.description',
    'Quiero gestionar mi institucion',
    'I want to manage my institution',
    'Je veux gerer mon institution',
    'ui-components',
    'Descripcion del rol escuela'
);

SELECT insert_translation('auth', 'roles.school.icon',
    '🏫',
    '🏫',
    '🏫',
    'ui-components',
    'Icono del rol escuela'
);

-- ============================================
-- INDIVIDUAL
-- ============================================
SELECT insert_translation('auth', 'roles.individual.name',
    'Usuario Individual',
    'Individual User',
    'Utilisateur Individuel',
    'ui-components',
    'Nombre del rol individual'
);

SELECT insert_translation('auth', 'roles.individual.description',
    'Quiero aprender por mi cuenta',
    'I want to learn on my own',
    'Je veux apprendre par moi-meme',
    'ui-components',
    'Descripcion del rol individual'
);

SELECT insert_translation('auth', 'roles.individual.icon',
    '🧑‍💻',
    '🧑‍💻',
    '🧑‍💻',
    'ui-components',
    'Icono del rol individual'
);

SELECT 'TRANSLATIONS: Auth roles - 15 traducciones insertadas (name, description, icon)' AS status;
