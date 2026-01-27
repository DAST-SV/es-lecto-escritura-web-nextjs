-- ======================================================
-- DATOS INICIALES PARA CATÁLOGOS
-- Archivo: data.sql
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- 1. BOOK TYPES (Tipos de libro)
-- ======================================================
INSERT INTO book_types (id, name, description) VALUES
    (1, 'official', 'Libros oficiales creados por el equipo de la plataforma'),
    (2, 'user', 'Libros creados por usuarios de la comunidad')
ON CONFLICT (id) DO NOTHING;

-- ======================================================
-- 2. BOOK LEVELS (Niveles por edad)
-- ======================================================
INSERT INTO book_levels (id, name, min_age, max_age, description) VALUES
    (1, '0-3 años', 0, 3, 'Primera infancia - Libros con imágenes grandes y textos mínimos'),
    (2, '4-6 años', 4, 6, 'Edad preescolar - Introducción a la lectura'),
    (3, '7-9 años', 7, 9, 'Primeros lectores - Textos simples con ilustraciones'),
    (4, '10-12 años', 10, 12, 'Lectores intermedios - Historias más complejas'),
    (5, '13-15 años', 13, 15, 'Adolescentes - Temas más maduros'),
    (6, '16-18 años', 16, 18, 'Jóvenes adultos - Literatura juvenil avanzada'),
    (7, 'Adultos', 18, NULL, 'Literatura para adultos')
ON CONFLICT (id) DO NOTHING;

-- ======================================================
-- 3. BOOK CATEGORIES (Categorías literarias)
-- ======================================================
INSERT INTO book_categories (name, slug, description) VALUES
    ('Cuentos', 'cuentos', 'Narrativas breves con enseñanzas o entretenimiento'),
    ('Fábulas', 'fabulas', 'Historias con moraleja, frecuentemente protagonizadas por animales'),
    ('Poemas', 'poemas', 'Expresiones literarias en verso y rima'),
    ('Leyendas', 'leyendas', 'Relatos tradicionales y populares de diferentes culturas'),
    ('Historias de mi abuelo', 'historias-abuelo', 'Relatos familiares y nostálgicos transmitidos entre generaciones'),
    ('Novela corta', 'novela-corta', 'Narrativas extensas pero concisas'),
    ('Cuentos para dormir', 'cuentos-dormir', 'Historias relajantes para la hora de dormir'),
    ('Libros informativos', 'informativos', 'Contenido educativo sobre temas específicos'),
    ('Biografías', 'biografias', 'Historias de vida de personajes reales'),
    ('Ciencia y naturaleza', 'ciencia-naturaleza', 'Descubrimientos científicos y mundo natural')
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- 4. BOOK VALUES (Valores educativos y morales)
-- ======================================================
INSERT INTO book_values (name, description) VALUES
    ('Responsabilidad', 'Cumplir con deberes y compromisos personales'),
    ('Honestidad', 'Actuar con verdad e integridad en todas las situaciones'),
    ('Respeto', 'Considerar y valorar a los demás y sus diferencias'),
    ('Solidaridad', 'Apoyar y ayudar a quienes lo necesitan'),
    ('Compromiso', 'Dedicación y perseverancia en las metas propuestas'),
    ('Empatía', 'Comprender y compartir los sentimientos de otros'),
    ('Disciplina', 'Orden y constancia en las acciones diarias'),
    ('Amistad', 'Valorar y cultivar las relaciones interpersonales'),
    ('Valentía', 'Enfrentar miedos y desafíos con coraje'),
    ('Generosidad', 'Dar y compartir con los demás sin esperar nada a cambio'),
    ('Tolerancia', 'Aceptar y respetar la diversidad de ideas y culturas'),
    ('Justicia', 'Actuar con equidad y dar a cada uno lo que le corresponde'),
    ('Gratitud', 'Reconocer y agradecer lo que se recibe'),
    ('Perseverancia', 'Mantener el esfuerzo a pesar de las dificultades'),
    ('Humildad', 'Reconocer las propias limitaciones y aprender de otros'),
    ('Paciencia', 'Capacidad de esperar y tolerar con calma'),
    ('Creatividad', 'Desarrollar ideas originales y soluciones innovadoras'),
    ('Colaboración', 'Trabajar en equipo hacia objetivos comunes'),
    ('Autoestima', 'Valorarse y confiar en las propias capacidades'),
    ('Curiosidad', 'Deseo de aprender y explorar el mundo')
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- 5. BOOK GENRES (Géneros literarios)
-- ======================================================
INSERT INTO book_genres (name, description) VALUES
    ('Cuento', 'Narración breve de ficción con pocos personajes'),
    ('Novela', 'Narración extensa y compleja con múltiples personajes'),
    ('Poesía', 'Expresión literaria en verso con ritmo y métrica'),
    ('Cómic', 'Narrativa gráfica secuencial con ilustraciones'),
    ('Fantasía', 'Mundos imaginarios con elementos mágicos y sobrenaturales'),
    ('Aventura', 'Historias de acción, exploración y descubrimiento'),
    ('Misterio', 'Historias de enigmas, suspense y resolución de problemas'),
    ('Ciencia Ficción', 'Futuros imaginarios, tecnología avanzada y exploración espacial'),
    ('Realismo', 'Historias basadas en situaciones cotidianas y reales'),
    ('Terror', 'Historias diseñadas para provocar miedo o suspenso'),
    ('Humor', 'Narrativas cómicas y divertidas'),
    ('Romántico', 'Historias centradas en relaciones y amor'),
    ('Drama', 'Conflictos emocionales y situaciones intensas'),
    ('Historia', 'Relatos ambientados en épocas pasadas'),
    ('Folclore', 'Tradiciones y narrativas de culturas populares')
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- 6. BOOK LANGUAGES (Idiomas)
-- ======================================================
INSERT INTO book_languages (iso_code, name, is_active) VALUES
    ('es', 'Español', TRUE),
    ('en', 'Inglés', TRUE),
    ('fr', 'Francés', TRUE),
    ('pt', 'Portugués', FALSE),
    ('de', 'Alemán', FALSE),
    ('it', 'Italiano', FALSE),
    ('zh', 'Chino', FALSE),
    ('ja', 'Japonés', FALSE),
    ('ar', 'Árabe', FALSE),
    ('ru', 'Ruso', FALSE),
    ('ko', 'Coreano', FALSE),
    ('hi', 'Hindi', FALSE)
ON CONFLICT (iso_code) DO NOTHING;

-- ======================================================
-- 7. BOOK TAGS (Etiquetas temáticas)
-- ======================================================
INSERT INTO book_tags (name, slug, description) VALUES
    -- Elementos fantásticos
    ('Magia', 'magia', 'Historias con elementos mágicos y hechizos'),
    ('Dragones', 'dragones', 'Criaturas míticas y fantásticas'),
    ('Hadas', 'hadas', 'Seres mágicos y encantados'),
    ('Princesas', 'princesas', 'Realeza y castillos'),
    ('Superhéroes', 'superheroes', 'Personajes con poderes especiales'),

    -- Temas sociales y educativos
    ('Bullying', 'bullying', 'Temas relacionados con acoso escolar y su prevención'),
    ('Amistad', 'amistad', 'Historias sobre lazos de amistad y compañerismo'),
    ('Familia', 'familia', 'Relaciones y dinámicas familiares'),
    ('Escuela', 'escuela', 'Experiencias y vida escolar'),
    ('Diversidad', 'diversidad', 'Inclusión y aceptación de diferencias'),
    ('Emociones', 'emociones', 'Inteligencia emocional y sentimientos'),

    -- Aventuras y exploración
    ('Aventuras', 'aventuras', 'Historias de exploración y descubrimiento'),
    ('Viajes', 'viajes', 'Historias de exploración y descubrimiento de lugares'),
    ('Misterio', 'misterio', 'Enigmas y secretos por resolver'),
    ('Piratas', 'piratas', 'Aventuras marítimas y tesoros'),
    ('Espacio', 'espacio', 'Planetas, estrellas y exploración espacial'),

    -- Naturaleza y animales
    ('Animales', 'animales', 'Protagonistas animales o historias sobre fauna'),
    ('Naturaleza', 'naturaleza', 'Medio ambiente y ecología'),
    ('Océano', 'oceano', 'Vida marina y misterios submarinos'),
    ('Bosque', 'bosque', 'Naturaleza y criaturas del bosque'),
    ('Dinosaurios', 'dinosaurios', 'Criaturas prehistóricas'),

    -- Arte y creatividad
    ('Música', 'musica', 'Instrumentos, canciones y expresión musical'),
    ('Arte', 'arte', 'Creatividad, pintura, escultura y expresión artística'),
    ('Deportes', 'deportes', 'Actividades físicas y competiciones'),

    -- Ciencia y tecnología
    ('Ciencia', 'ciencia', 'Descubrimientos científicos y experimentos'),
    ('Robots', 'robots', 'Inteligencia artificial y tecnología'),
    ('Inventos', 'inventos', 'Creaciones e innovaciones'),

    -- Festividades
    ('Navidad', 'navidad', 'Festividades y espíritu navideño'),
    ('Halloween', 'halloween', 'Celebraciones de octubre'),

    -- Terror (apropiado para edad)
    ('Cuentos de terror', 'cuentos-terror', 'Historias de miedo apropiadas para cada edad'),
    ('Suspenso', 'suspenso', 'Tensión y anticipación'),

    -- Temáticas culturales
    ('Historia', 'historia', 'Eventos y personajes históricos'),
    ('Mitología', 'mitologia', 'Mitos y leyendas de diferentes culturas'),
    ('Folclore', 'folclore', 'Tradiciones populares y culturales'),

    -- Desarrollo personal
    ('Autoestima', 'autoestima', 'Confianza y amor propio'),
    ('Superación', 'superacion', 'Superar obstáculos y crecer'),
    ('Imaginación', 'imaginacion', 'Creatividad y mundo interior')
ON CONFLICT (name) DO NOTHING;

-- ======================================================
-- MENSAJE FINAL
-- ======================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Datos iniciales cargados correctamente en el schema books';
    RAISE NOTICE '📊 Resumen:';
    RAISE NOTICE '   - % tipos de libro', (SELECT COUNT(*) FROM book_types);
    RAISE NOTICE '   - % niveles de edad', (SELECT COUNT(*) FROM book_levels);
    RAISE NOTICE '   - % categorías', (SELECT COUNT(*) FROM book_categories);
    RAISE NOTICE '   - % valores', (SELECT COUNT(*) FROM book_values);
    RAISE NOTICE '   - % géneros', (SELECT COUNT(*) FROM book_genres);
    RAISE NOTICE '   - % idiomas', (SELECT COUNT(*) FROM book_languages);
    RAISE NOTICE '   - % etiquetas', (SELECT COUNT(*) FROM book_tags);
END $$;
