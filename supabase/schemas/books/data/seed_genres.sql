-- supabase/schemas/books/data/seed_genres.sql
-- ============================================
-- DATOS INICIALES: Géneros literarios
-- ============================================

SET search_path TO books, app, public;

-- Insertar géneros base
INSERT INTO books.genres (slug, icon, color, order_index) VALUES
  ('fiction', 'Sparkles', '#9333EA', 1),
  ('non-fiction', 'BookOpen', '#2563EB', 2),
  ('fantasy', 'Wand2', '#7C3AED', 3),
  ('adventure', 'Compass', '#DC2626', 4),
  ('mystery', 'Search', '#4B5563', 5),
  ('humor', 'Laugh', '#F59E0B', 6),
  ('educational', 'GraduationCap', '#059669', 7),
  ('animals', 'PawPrint', '#84CC16', 8),
  ('nature', 'Leaf', '#22C55E', 9),
  ('science', 'FlaskConical', '#0EA5E9', 10),
  ('history', 'Clock', '#B45309', 11),
  ('biography', 'User', '#6366F1', 12)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index;

-- Insertar traducciones ES
INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT g.id, 'es', t.name, t.description
FROM books.genres g
JOIN (VALUES
  ('fiction', 'Ficción', 'Historias inventadas y narrativa creativa'),
  ('non-fiction', 'No ficción', 'Hechos reales e información verídica'),
  ('fantasy', 'Fantasía', 'Mundos mágicos y criaturas fantásticas'),
  ('adventure', 'Aventura', 'Viajes emocionantes y hazañas heroicas'),
  ('mystery', 'Misterio', 'Enigmas por resolver y suspenso'),
  ('humor', 'Humor', 'Historias divertidas y cómicas'),
  ('educational', 'Educativo', 'Contenido de aprendizaje'),
  ('animals', 'Animales', 'Historias sobre animales y mascotas'),
  ('nature', 'Naturaleza', 'El mundo natural y medio ambiente'),
  ('science', 'Ciencia', 'Descubrimientos y experimentos'),
  ('history', 'Historia', 'Eventos y personajes históricos'),
  ('biography', 'Biografía', 'Vidas de personas reales')
) AS t(slug, name, description) ON g.slug = t.slug
ON CONFLICT (genre_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones EN
INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT g.id, 'en', t.name, t.description
FROM books.genres g
JOIN (VALUES
  ('fiction', 'Fiction', 'Invented stories and creative narrative'),
  ('non-fiction', 'Non-Fiction', 'Real facts and truthful information'),
  ('fantasy', 'Fantasy', 'Magical worlds and fantastic creatures'),
  ('adventure', 'Adventure', 'Exciting journeys and heroic deeds'),
  ('mystery', 'Mystery', 'Puzzles to solve and suspense'),
  ('humor', 'Humor', 'Funny and comic stories'),
  ('educational', 'Educational', 'Learning content'),
  ('animals', 'Animals', 'Stories about animals and pets'),
  ('nature', 'Nature', 'The natural world and environment'),
  ('science', 'Science', 'Discoveries and experiments'),
  ('history', 'History', 'Historical events and characters'),
  ('biography', 'Biography', 'Lives of real people')
) AS t(slug, name, description) ON g.slug = t.slug
ON CONFLICT (genre_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones FR
INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT g.id, 'fr', t.name, t.description
FROM books.genres g
JOIN (VALUES
  ('fiction', 'Fiction', 'Histoires inventées et narration créative'),
  ('non-fiction', 'Non-fiction', 'Faits réels et informations véridiques'),
  ('fantasy', 'Fantaisie', 'Mondes magiques et créatures fantastiques'),
  ('adventure', 'Aventure', 'Voyages passionnants et exploits héroïques'),
  ('mystery', 'Mystère', 'Énigmes à résoudre et suspense'),
  ('humor', 'Humour', 'Histoires drôles et comiques'),
  ('educational', 'Éducatif', 'Contenu d''apprentissage'),
  ('animals', 'Animaux', 'Histoires sur les animaux et les animaux de compagnie'),
  ('nature', 'Nature', 'Le monde naturel et l''environnement'),
  ('science', 'Science', 'Découvertes et expériences'),
  ('history', 'Histoire', 'Événements et personnages historiques'),
  ('biography', 'Biographie', 'Vies de personnes réelles')
) AS t(slug, name, description) ON g.slug = t.slug
ON CONFLICT (genre_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'BOOKS: Datos de genres insertados' AS status;
