-- supabase/schemas/books/data/seed_levels.sql
-- ============================================
-- DATOS INICIALES: Niveles de lectura
-- ============================================

SET search_path TO books, app, public;

-- Insertar niveles base
INSERT INTO books.levels (slug, min_age, max_age, grade_min, grade_max, color, icon, order_index) VALUES
  ('pre-reader', 0, 3, NULL, NULL, '#FFB6C1', 'Baby', 1),
  ('emergent', 3, 5, NULL, 1, '#98FB98', 'Sprout', 2),
  ('early-reader', 5, 7, 1, 2, '#87CEEB', 'BookOpen', 3),
  ('transitional', 7, 9, 2, 4, '#DDA0DD', 'BookMarked', 4),
  ('fluent', 9, 12, 4, 6, '#F0E68C', 'GraduationCap', 5),
  ('advanced', 12, 99, 6, NULL, '#20B2AA', 'Award', 6)
ON CONFLICT (slug) DO UPDATE SET
  min_age = EXCLUDED.min_age,
  max_age = EXCLUDED.max_age,
  grade_min = EXCLUDED.grade_min,
  grade_max = EXCLUDED.grade_max,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index;

-- Insertar traducciones ES
INSERT INTO books.level_translations (level_id, language_code, name, description, age_label)
SELECT l.id, 'es', t.name, t.description, t.age_label
FROM books.levels l
JOIN (VALUES
  ('pre-reader', 'Pre-lector', 'Libros para bebés y niños pequeños con imágenes simples', '0-3 años'),
  ('emergent', 'Emergente', 'Primeras palabras y frases simples con apoyo visual', '3-5 años'),
  ('early-reader', 'Lector inicial', 'Oraciones cortas y vocabulario básico', '5-7 años'),
  ('transitional', 'En transición', 'Párrafos cortos y vocabulario en expansión', '7-9 años'),
  ('fluent', 'Fluido', 'Capítulos cortos y temas más complejos', '9-12 años'),
  ('advanced', 'Avanzado', 'Textos completos con vocabulario rico', '12+ años')
) AS t(slug, name, description, age_label) ON l.slug = t.slug
ON CONFLICT (level_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  age_label = EXCLUDED.age_label;

-- Insertar traducciones EN
INSERT INTO books.level_translations (level_id, language_code, name, description, age_label)
SELECT l.id, 'en', t.name, t.description, t.age_label
FROM books.levels l
JOIN (VALUES
  ('pre-reader', 'Pre-reader', 'Books for babies and toddlers with simple images', '0-3 years'),
  ('emergent', 'Emergent', 'First words and simple phrases with visual support', '3-5 years'),
  ('early-reader', 'Early Reader', 'Short sentences and basic vocabulary', '5-7 years'),
  ('transitional', 'Transitional', 'Short paragraphs and expanding vocabulary', '7-9 years'),
  ('fluent', 'Fluent', 'Short chapters and more complex themes', '9-12 years'),
  ('advanced', 'Advanced', 'Complete texts with rich vocabulary', '12+ years')
) AS t(slug, name, description, age_label) ON l.slug = t.slug
ON CONFLICT (level_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  age_label = EXCLUDED.age_label;

-- Insertar traducciones FR
INSERT INTO books.level_translations (level_id, language_code, name, description, age_label)
SELECT l.id, 'fr', t.name, t.description, t.age_label
FROM books.levels l
JOIN (VALUES
  ('pre-reader', 'Pré-lecteur', 'Livres pour bébés et tout-petits avec des images simples', '0-3 ans'),
  ('emergent', 'Émergent', 'Premiers mots et phrases simples avec support visuel', '3-5 ans'),
  ('early-reader', 'Lecteur débutant', 'Phrases courtes et vocabulaire de base', '5-7 ans'),
  ('transitional', 'En transition', 'Paragraphes courts et vocabulaire en expansion', '7-9 ans'),
  ('fluent', 'Fluide', 'Chapitres courts et thèmes plus complexes', '9-12 ans'),
  ('advanced', 'Avancé', 'Textes complets avec vocabulaire riche', '12+ ans')
) AS t(slug, name, description, age_label) ON l.slug = t.slug
ON CONFLICT (level_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  age_label = EXCLUDED.age_label;

SELECT 'BOOKS: Datos de levels insertados' AS status;
