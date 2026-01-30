-- supabase/schemas/books/data/categories.sql
-- ============================================================================
-- DATA: Categorías iniciales con traducciones
-- DESCRIPCIÓN: Datos seed para categorías de libros
-- ============================================================================

SET search_path TO books, app, public;

-- ============================================
-- CATEGORÍAS BASE
-- ============================================
INSERT INTO books.categories (slug, icon, color, order_index, is_active) VALUES
  ('stories', 'BookOpen', '#3B82F6', 1, true),
  ('poems', 'Feather', '#8B5CF6', 2, true),
  ('fables', 'Sparkles', '#F59E0B', 3, true),
  ('legends', 'Castle', '#EF4444', 4, true),
  ('tongue-twisters', 'MessageCircle', '#10B981', 5, true),
  ('rhymes', 'Music', '#EC4899', 6, true),
  ('comics', 'Image', '#6366F1', 7, true),
  ('riddles', 'HelpCircle', '#14B8A6', 8, true),
  ('literacy', 'GraduationCap', '#F97316', 9, true)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_active = EXCLUDED.is_active;

-- ============================================
-- TRADUCCIONES: ESPAÑOL
-- ============================================
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'es'::app.language_code, t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Cuentos', 'Historias cortas para niños con moralejas y aventuras'),
  ('poems', 'Poemas', 'Poesía infantil con rimas y versos'),
  ('fables', 'Fábulas', 'Historias con animales que enseñan lecciones'),
  ('legends', 'Leyendas', 'Historias tradicionales y mitos populares'),
  ('tongue-twisters', 'Trabalenguas', 'Frases divertidas para practicar pronunciación'),
  ('rhymes', 'Rimas', 'Canciones y rimas infantiles'),
  ('comics', 'Cómics', 'Historias ilustradas con viñetas'),
  ('riddles', 'Adivinanzas', 'Acertijos y preguntas ingeniosas'),
  ('literacy', 'Lectoescritura', 'Material para aprender a leer y escribir')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- TRADUCCIONES: INGLÉS
-- ============================================
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'en'::app.language_code, t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Stories', 'Short stories for children with morals and adventures'),
  ('poems', 'Poems', 'Children''s poetry with rhymes and verses'),
  ('fables', 'Fables', 'Animal stories that teach lessons'),
  ('legends', 'Legends', 'Traditional stories and popular myths'),
  ('tongue-twisters', 'Tongue Twisters', 'Fun phrases to practice pronunciation'),
  ('rhymes', 'Rhymes', 'Children''s songs and nursery rhymes'),
  ('comics', 'Comics', 'Illustrated stories with panels'),
  ('riddles', 'Riddles', 'Puzzles and clever questions'),
  ('literacy', 'Literacy', 'Material for learning to read and write')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- TRADUCCIONES: FRANCÉS
-- ============================================
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'fr'::app.language_code, t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Contes', 'Histoires courtes pour enfants avec des morales et des aventures'),
  ('poems', 'Poèmes', 'Poésie pour enfants avec des rimes et des vers'),
  ('fables', 'Fables', 'Histoires d''animaux qui enseignent des leçons'),
  ('legends', 'Légendes', 'Histoires traditionnelles et mythes populaires'),
  ('tongue-twisters', 'Virelangues', 'Phrases amusantes pour pratiquer la prononciation'),
  ('rhymes', 'Comptines', 'Chansons et comptines pour enfants'),
  ('comics', 'Bandes Dessinées', 'Histoires illustrées avec des vignettes'),
  ('riddles', 'Devinettes', 'Énigmes et questions ingénieuses'),
  ('literacy', 'Alphabétisation', 'Matériel pour apprendre à lire et à écrire')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'BOOKS: Categorías y traducciones insertadas' AS status;
