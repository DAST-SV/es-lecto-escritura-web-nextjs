-- ============================================================================
-- supabase/schemas/app/translations/data/home_page.sql
-- TRANSLATIONS DATA: HOME PAGE
-- DESCRIPTION: Translations for the home page components (hero, features, cta)
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- NAMESPACES FOR HOME PAGE
-- ============================================================================

INSERT INTO app.translation_namespaces (slug, name, description, is_active)
VALUES
    ('hero', 'Hero Section', 'Translations for the hero carousel on the home page', true),
    ('features', 'Features Section', 'Translations for the features section on the home page', true),
    ('cta', 'CTA Section', 'Translations for the call-to-action section on the home page', true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================================================
-- HERO SECTION - SLIDES
-- Slides for the hero carousel
-- ============================================================================

-- Slide 0: Literacy / Lectoescritura
SELECT insert_translation('hero', 'slides.0.title', 'Lectoescritura', 'Literacy', 'Alphabétisation', 'ui', 'Hero slide 0 title');
SELECT insert_translation('hero', 'slides.0.icon', '📚', '📚', '📚', 'ui', 'Hero slide 0 icon');
SELECT insert_translation('hero', 'slides.0.description', 'Aprende a leer y escribir de forma divertida y efectiva', 'Learn to read and write in a fun and effective way', 'Apprenez à lire et écrire de manière amusante et efficace', 'ui', 'Hero slide 0 description');
SELECT insert_translation('hero', 'slides.0.button', 'Explorar', 'Explore', 'Explorer', 'ui', 'Hero slide 0 button');

-- Slide 1: Stories / Cuentos
SELECT insert_translation('hero', 'slides.1.title', 'Cuentos', 'Stories', 'Histoires', 'ui', 'Hero slide 1 title');
SELECT insert_translation('hero', 'slides.1.icon', '📖', '📖', '📖', 'ui', 'Hero slide 1 icon');
SELECT insert_translation('hero', 'slides.1.description', 'Descubre historias increíbles que despiertan la imaginación', 'Discover amazing stories that spark imagination', 'Découvrez des histoires incroyables qui éveillent l''imagination', 'ui', 'Hero slide 1 description');
SELECT insert_translation('hero', 'slides.1.button', 'Leer', 'Read', 'Lire', 'ui', 'Hero slide 1 button');

-- Slide 2: Fables / Fábulas
SELECT insert_translation('hero', 'slides.2.title', 'Fábulas', 'Fables', 'Fables', 'ui', 'Hero slide 2 title');
SELECT insert_translation('hero', 'slides.2.icon', '🦊', '🦊', '🦊', 'ui', 'Hero slide 2 icon');
SELECT insert_translation('hero', 'slides.2.description', 'Aprende valiosas lecciones de vida a través de historias animales', 'Learn valuable life lessons through animal stories', 'Apprenez de précieuses leçons de vie à travers des histoires d''animaux', 'ui', 'Hero slide 2 description');
SELECT insert_translation('hero', 'slides.2.button', 'Descubrir', 'Discover', 'Découvrir', 'ui', 'Hero slide 2 button');

-- Slide 3: Poems / Poemas
SELECT insert_translation('hero', 'slides.3.title', 'Poemas', 'Poems', 'Poèmes', 'ui', 'Hero slide 3 title');
SELECT insert_translation('hero', 'slides.3.icon', '✨', '✨', '✨', 'ui', 'Hero slide 3 icon');
SELECT insert_translation('hero', 'slides.3.description', 'Exprésate a través de la poesía y el arte de las palabras', 'Express yourself through poetry and the art of words', 'Exprimez-vous à travers la poésie et l''art des mots', 'ui', 'Hero slide 3 description');
SELECT insert_translation('hero', 'slides.3.button', 'Crear', 'Create', 'Créer', 'ui', 'Hero slide 3 button');

-- Slide 4: Legends / Leyendas
SELECT insert_translation('hero', 'slides.4.title', 'Leyendas', 'Legends', 'Légendes', 'ui', 'Hero slide 4 title');
SELECT insert_translation('hero', 'slides.4.icon', '🏰', '🏰', '🏰', 'ui', 'Hero slide 4 icon');
SELECT insert_translation('hero', 'slides.4.description', 'Explora relatos antiguos llenos de misterio y aventura', 'Explore ancient tales full of mystery and adventure', 'Explorez des récits anciens pleins de mystère et d''aventure', 'ui', 'Hero slide 4 description');
SELECT insert_translation('hero', 'slides.4.button', 'Aventura', 'Adventure', 'Aventure', 'ui', 'Hero slide 4 button');

-- Slide 5: Riddles / Adivinanzas
SELECT insert_translation('hero', 'slides.5.title', 'Adivinanzas', 'Riddles', 'Devinettes', 'ui', 'Hero slide 5 title');
SELECT insert_translation('hero', 'slides.5.icon', '🤔', '🤔', '🤔', 'ui', 'Hero slide 5 icon');
SELECT insert_translation('hero', 'slides.5.description', 'Pon a prueba tu mente con acertijos divertidos', 'Challenge your mind with fun puzzles', 'Mettez votre esprit à l''épreuve avec des énigmes amusantes', 'ui', 'Hero slide 5 description');
SELECT insert_translation('hero', 'slides.5.button', 'Resolver', 'Solve', 'Résoudre', 'ui', 'Hero slide 5 button');

-- Slide 6: Comics / Historietas
SELECT insert_translation('hero', 'slides.6.title', 'Historietas', 'Comics', 'Bandes dessinées', 'ui', 'Hero slide 6 title');
SELECT insert_translation('hero', 'slides.6.icon', '💥', '💥', '💥', 'ui', 'Hero slide 6 icon');
SELECT insert_translation('hero', 'slides.6.description', 'Disfruta de narrativas visuales llenas de color y acción', 'Enjoy visual narratives full of color and action', 'Profitez de récits visuels pleins de couleurs et d''action', 'ui', 'Hero slide 6 description');
SELECT insert_translation('hero', 'slides.6.button', 'Ver', 'View', 'Voir', 'ui', 'Hero slide 6 button');

-- Slide 7: Tongue Twisters / Trabalenguas
SELECT insert_translation('hero', 'slides.7.title', 'Trabalenguas', 'Tongue Twisters', 'Virelangues', 'ui', 'Hero slide 7 title');
SELECT insert_translation('hero', 'slides.7.icon', '👅', '👅', '👅', 'ui', 'Hero slide 7 icon');
SELECT insert_translation('hero', 'slides.7.description', 'Diviértete mejorando tu pronunciación con desafíos verbales', 'Have fun improving your pronunciation with verbal challenges', 'Amusez-vous à améliorer votre prononciation avec des défis verbaux', 'ui', 'Hero slide 7 description');
SELECT insert_translation('hero', 'slides.7.button', 'Intentar', 'Try', 'Essayer', 'ui', 'Hero slide 7 button');

-- Slide 8: Rhymes / Rimas
SELECT insert_translation('hero', 'slides.8.title', 'Rimas', 'Rhymes', 'Rimes', 'ui', 'Hero slide 8 title');
SELECT insert_translation('hero', 'slides.8.icon', '🎵', '🎵', '🎵', 'ui', 'Hero slide 8 icon');
SELECT insert_translation('hero', 'slides.8.description', 'Descubre el ritmo y la musicalidad del lenguaje', 'Discover the rhythm and musicality of language', 'Découvrez le rythme et la musicalité du langage', 'ui', 'Hero slide 8 description');
SELECT insert_translation('hero', 'slides.8.button', 'Escuchar', 'Listen', 'Écouter', 'ui', 'Hero slide 8 button');

-- ============================================================================
-- FEATURES SECTION
-- Tabs, stats, and general content
-- ============================================================================

-- Header
SELECT insert_translation('features', 'title', 'Lo que nos hace diferentes', 'What Makes Us Different', 'Ce qui nous différencie', 'ui', 'Features section title');
SELECT insert_translation('features', 'subtitle', 'Por qué EslectoEscritura es diferente a otras plataformas', 'Why EslectoEscritura is different from other platforms', 'Pourquoi EslectoEscritura est différent des autres plateformes', 'ui', 'Features section subtitle');
SELECT insert_translation('features', 'button', 'Saber más', 'Learn More', 'En savoir plus', 'ui', 'Features section button');

-- Tab 0: Personalized
SELECT insert_translation('features', 'tabs.0.label', 'Personalizado', 'Personalized', 'Personnalisé', 'ui', 'Features tab 0 label');
SELECT insert_translation('features', 'tabs.0.title', 'Atención Personalizada', 'Personalized Attention', 'Attention Personnalisée', 'ui', 'Features tab 0 title');
SELECT insert_translation('features', 'tabs.0.content', 'Entendemos que cada estudiante es único. Nuestra plataforma se adapta al ritmo y estilo de aprendizaje de cada persona, ofreciendo contenido y ejercicios personalizados que maximizan el progreso individual.', 'We understand that each student is unique. Our platform adapts to each person''s learning pace and style, offering personalized content and exercises that maximize individual progress.', 'Nous comprenons que chaque étudiant est unique. Notre plateforme s''adapte au rythme et au style d''apprentissage de chaque personne, offrant un contenu et des exercices personnalisés qui maximisent les progrès individuels.', 'ui', 'Features tab 0 content');

-- Tab 1: Simplified
SELECT insert_translation('features', 'tabs.1.label', 'Simplificado', 'Simplified', 'Simplifié', 'ui', 'Features tab 1 label');
SELECT insert_translation('features', 'tabs.1.title', 'Proceso Simplificado', 'Simplified Process', 'Processus Simplifié', 'ui', 'Features tab 1 title');
SELECT insert_translation('features', 'tabs.1.content', 'Nuestro proceso de aprendizaje es simple y efectivo. Con una interfaz intuitiva y lecciones estructuradas, los estudiantes pueden concentrarse en lo que realmente importa: aprender a leer y escribir con confianza.', 'Our learning process is simple and effective. With an intuitive interface and structured lessons, students can focus on what really matters: learning to read and write with confidence.', 'Notre processus d''apprentissage est simple et efficace. Avec une interface intuitive et des leçons structurées, les étudiants peuvent se concentrer sur ce qui compte vraiment : apprendre à lire et écrire avec confiance.', 'ui', 'Features tab 1 content');

-- Tab 2: Flexibility
SELECT insert_translation('features', 'tabs.2.label', 'Flexibilidad', 'Flexibility', 'Flexibilité', 'ui', 'Features tab 2 label');
SELECT insert_translation('features', 'tabs.2.title', 'Flexibilidad y Transparencia', 'Flexibility & Transparency', 'Flexibilité et Transparence', 'ui', 'Features tab 2 title');
SELECT insert_translation('features', 'tabs.2.content', 'Ofrecemos horarios flexibles y comunicación clara. Los estudiantes y padres pueden seguir el progreso en tiempo real, con acceso completo a todas las herramientas y recursos desde cualquier dispositivo.', 'We offer flexible schedules and clear communication. Students and parents can track progress in real-time, with full access to all tools and resources from any device.', 'Nous offrons des horaires flexibles et une communication claire. Les étudiants et les parents peuvent suivre les progrès en temps réel, avec un accès complet à tous les outils et ressources depuis n''importe quel appareil.', 'ui', 'Features tab 2 content');

-- Stat 0
SELECT insert_translation('features', 'stats.0.number', '1000+', '1000+', '1000+', 'ui', 'Features stat 0 number');
SELECT insert_translation('features', 'stats.0.label', 'Estudiantes Activos', 'Active Students', 'Étudiants Actifs', 'ui', 'Features stat 0 label');

-- Stat 1
SELECT insert_translation('features', 'stats.1.number', '95%', '95%', '95%', 'ui', 'Features stat 1 number');
SELECT insert_translation('features', 'stats.1.label', 'Tasa de Mejora', 'Improvement Rate', 'Taux d''Amélioration', 'ui', 'Features stat 1 label');

-- Stat 2
SELECT insert_translation('features', 'stats.2.number', '50+', '50+', '50+', 'ui', 'Features stat 2 number');
SELECT insert_translation('features', 'stats.2.label', 'Instituciones Asociadas', 'Partner Institutions', 'Institutions Partenaires', 'ui', 'Features stat 2 label');

-- ============================================================================
-- CTA SECTION
-- Call-to-action content
-- ============================================================================

SELECT insert_translation('cta', 'title', '¿Listo para empezar a aprender?', 'Ready to Start Learning?', 'Prêt à commencer à apprendre?', 'ui', 'CTA section title');
SELECT insert_translation('cta', 'description', 'Únete a miles de estudiantes que están mejorando sus habilidades de lectura y escritura cada día. Nuestra plataforma te guiará paso a paso hacia el éxito.', 'Join thousands of students who are improving their reading and writing skills every day. Our platform will guide you step by step towards success.', 'Rejoignez des milliers d''étudiants qui améliorent leurs compétences en lecture et en écriture chaque jour. Notre plateforme vous guidera pas à pas vers le succès.', 'ui', 'CTA section description');
SELECT insert_translation('cta', 'button', 'Comenzar Ahora', 'Get Started Now', 'Commencer Maintenant', 'ui', 'CTA section button');

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'HOME PAGE TRANSLATIONS: Data inserted successfully' AS status;
