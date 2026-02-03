-- supabase/schemas/books/data/seed_categories.sql
-- ============================================
-- DATOS INICIALES: Categorías de libros
-- ============================================

SET search_path TO books, app, public;

-- Insertar categorías base
INSERT INTO books.categories (slug, icon, color, order_index) VALUES
  ('stories', 'BookOpen', '#8B5CF6', 1),
  ('poems', 'Feather', '#EC4899', 2),
  ('fables', 'Rabbit', '#F97316', 3),
  ('legends', 'Castle', '#EAB308', 4),
  ('tongue-twisters', 'MessageCircle', '#14B8A6', 5),
  ('riddles', 'HelpCircle', '#6366F1', 6),
  ('rhymes', 'Music', '#F43F5E', 7),
  ('comics', 'Image', '#22C55E', 8),
  ('tales', 'Stars', '#A855F7', 9),
  ('myths', 'Moon', '#0EA5E9', 10)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index;

-- Insertar traducciones ES
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'es', t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Cuentos', 'Historias cortas con principio, desarrollo y final'),
  ('poems', 'Poemas', 'Composiciones en verso con ritmo y rima'),
  ('fables', 'Fábulas', 'Relatos con moraleja y animales personificados'),
  ('legends', 'Leyendas', 'Narraciones tradicionales de origen popular'),
  ('tongue-twisters', 'Trabalenguas', 'Frases difíciles de pronunciar rápidamente'),
  ('riddles', 'Adivinanzas', 'Acertijos para adivinar'),
  ('rhymes', 'Rimas', 'Textos con sonidos repetidos al final'),
  ('comics', 'Cómics', 'Historias narradas con ilustraciones secuenciales'),
  ('tales', 'Cuentos de hadas', 'Historias mágicas con personajes fantásticos'),
  ('myths', 'Mitos', 'Relatos sobre dioses y héroes ancestrales')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones EN
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'en', t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Stories', 'Short narratives with beginning, middle, and end'),
  ('poems', 'Poems', 'Verse compositions with rhythm and rhyme'),
  ('fables', 'Fables', 'Tales with moral lessons and personified animals'),
  ('legends', 'Legends', 'Traditional narratives of popular origin'),
  ('tongue-twisters', 'Tongue Twisters', 'Phrases difficult to pronounce quickly'),
  ('riddles', 'Riddles', 'Puzzles to guess'),
  ('rhymes', 'Rhymes', 'Texts with repeated sounds at the end'),
  ('comics', 'Comics', 'Stories told with sequential illustrations'),
  ('tales', 'Fairy Tales', 'Magical stories with fantastical characters'),
  ('myths', 'Myths', 'Tales about gods and ancestral heroes')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones FR
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT c.id, 'fr', t.name, t.description
FROM books.categories c
JOIN (VALUES
  ('stories', 'Histoires', 'Récits courts avec début, milieu et fin'),
  ('poems', 'Poèmes', 'Compositions en vers avec rythme et rime'),
  ('fables', 'Fables', 'Récits avec morale et animaux personnifiés'),
  ('legends', 'Légendes', 'Récits traditionnels d''origine populaire'),
  ('tongue-twisters', 'Virelangues', 'Phrases difficiles à prononcer rapidement'),
  ('riddles', 'Devinettes', 'Énigmes à deviner'),
  ('rhymes', 'Comptines', 'Textes avec sons répétés à la fin'),
  ('comics', 'Bandes dessinées', 'Histoires racontées avec illustrations séquentielles'),
  ('tales', 'Contes de fées', 'Histoires magiques avec personnages fantastiques'),
  ('myths', 'Mythes', 'Récits sur les dieux et héros ancestraux')
) AS t(slug, name, description) ON c.slug = t.slug
ON CONFLICT (category_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'BOOKS: Datos de categories insertados' AS status;
