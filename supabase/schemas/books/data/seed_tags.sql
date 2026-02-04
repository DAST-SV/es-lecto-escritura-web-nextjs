-- supabase/schemas/books/data/seed_tags.sql
-- ============================================
-- DATOS INICIALES: Etiquetas de libros
-- ============================================

SET search_path TO books, app, public;

-- Insertar tags base
INSERT INTO books.tags (slug, color) VALUES
  ('family', '#EC4899'),
  ('school', '#3B82F6'),
  ('nature', '#22C55E'),
  ('animals', '#84CC16'),
  ('emotions', '#F59E0B'),
  ('seasons', '#06B6D4'),
  ('bedtime', '#8B5CF6'),
  ('holidays', '#EF4444'),
  ('food', '#F97316'),
  ('transportation', '#6366F1'),
  ('colors', '#D946EF'),
  ('numbers', '#14B8A6'),
  ('alphabet', '#A855F7'),
  ('music', '#E11D48'),
  ('sports', '#0EA5E9'),
  ('science', '#64748B'),
  ('art', '#DB2777'),
  ('community', '#059669')
ON CONFLICT (slug) DO UPDATE SET
  color = EXCLUDED.color;

-- Insertar traducciones ES
INSERT INTO books.tag_translations (tag_id, language_code, name, description)
SELECT t.id, 'es', tr.name, tr.description
FROM books.tags t
JOIN (VALUES
  ('family', 'Familia', 'Historias sobre relaciones familiares'),
  ('school', 'Escuela', 'Temas relacionados con la vida escolar'),
  ('nature', 'Naturaleza', 'El mundo natural y el medio ambiente'),
  ('animals', 'Animales', 'Historias con animales como protagonistas'),
  ('emotions', 'Emociones', 'Exploración de sentimientos y emociones'),
  ('seasons', 'Estaciones', 'Las cuatro estaciones del año'),
  ('bedtime', 'Hora de dormir', 'Historias para antes de dormir'),
  ('holidays', 'Festividades', 'Celebraciones y días especiales'),
  ('food', 'Comida', 'Temas relacionados con alimentos'),
  ('transportation', 'Transporte', 'Vehículos y formas de transporte'),
  ('colors', 'Colores', 'Aprendizaje de colores'),
  ('numbers', 'Números', 'Aprendizaje de números y conteo'),
  ('alphabet', 'Abecedario', 'Letras y alfabeto'),
  ('music', 'Música', 'Temas musicales y canciones'),
  ('sports', 'Deportes', 'Actividades deportivas'),
  ('science', 'Ciencia', 'Descubrimientos y experimentos'),
  ('art', 'Arte', 'Creatividad y expresión artística'),
  ('community', 'Comunidad', 'Vida en comunidad y sociedad')
) AS tr(slug, name, description) ON t.slug = tr.slug
ON CONFLICT (tag_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones EN
INSERT INTO books.tag_translations (tag_id, language_code, name, description)
SELECT t.id, 'en', tr.name, tr.description
FROM books.tags t
JOIN (VALUES
  ('family', 'Family', 'Stories about family relationships'),
  ('school', 'School', 'Topics related to school life'),
  ('nature', 'Nature', 'The natural world and environment'),
  ('animals', 'Animals', 'Stories featuring animals as protagonists'),
  ('emotions', 'Emotions', 'Exploration of feelings and emotions'),
  ('seasons', 'Seasons', 'The four seasons of the year'),
  ('bedtime', 'Bedtime', 'Stories for bedtime'),
  ('holidays', 'Holidays', 'Celebrations and special days'),
  ('food', 'Food', 'Topics related to food'),
  ('transportation', 'Transportation', 'Vehicles and forms of transport'),
  ('colors', 'Colors', 'Learning colors'),
  ('numbers', 'Numbers', 'Learning numbers and counting'),
  ('alphabet', 'Alphabet', 'Letters and alphabet'),
  ('music', 'Music', 'Musical themes and songs'),
  ('sports', 'Sports', 'Sports activities'),
  ('science', 'Science', 'Discoveries and experiments'),
  ('art', 'Art', 'Creativity and artistic expression'),
  ('community', 'Community', 'Community life and society')
) AS tr(slug, name, description) ON t.slug = tr.slug
ON CONFLICT (tag_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones FR
INSERT INTO books.tag_translations (tag_id, language_code, name, description)
SELECT t.id, 'fr', tr.name, tr.description
FROM books.tags t
JOIN (VALUES
  ('family', 'Famille', 'Histoires sur les relations familiales'),
  ('school', 'École', 'Sujets liés à la vie scolaire'),
  ('nature', 'Nature', 'Le monde naturel et l''environnement'),
  ('animals', 'Animaux', 'Histoires avec des animaux comme protagonistes'),
  ('emotions', 'Émotions', 'Exploration des sentiments et émotions'),
  ('seasons', 'Saisons', 'Les quatre saisons de l''année'),
  ('bedtime', 'Coucher', 'Histoires pour l''heure du coucher'),
  ('holidays', 'Fêtes', 'Célébrations et jours spéciaux'),
  ('food', 'Nourriture', 'Sujets liés à la nourriture'),
  ('transportation', 'Transport', 'Véhicules et moyens de transport'),
  ('colors', 'Couleurs', 'Apprentissage des couleurs'),
  ('numbers', 'Nombres', 'Apprentissage des nombres et du comptage'),
  ('alphabet', 'Alphabet', 'Lettres et alphabet'),
  ('music', 'Musique', 'Thèmes musicaux et chansons'),
  ('sports', 'Sports', 'Activités sportives'),
  ('science', 'Science', 'Découvertes et expériences'),
  ('art', 'Art', 'Créativité et expression artistique'),
  ('community', 'Communauté', 'Vie communautaire et société')
) AS tr(slug, name, description) ON t.slug = tr.slug
ON CONFLICT (tag_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'BOOKS: Datos de tags insertados' AS status;
