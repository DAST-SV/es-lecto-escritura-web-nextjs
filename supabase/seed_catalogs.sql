-- ============================================================================
-- SEED: Datos de catalogos con traducciones (ES/EN)
-- Ejecutar en Supabase SQL Editor
--
-- IMPORTANTE: Este script usa los IDs existentes de las tablas base
-- Las traducciones se insertan buscando el ID real por slug
-- ============================================================================

-- ============================================
-- 1. CATEGORIAS (insertar si no existen)
-- ============================================
INSERT INTO books.categories (slug, icon, color, order_index, is_active) VALUES
  ('cuentos', 'BookOpen', '#F59E0B', 1, true),
  ('fabulas', 'Sparkles', '#8B5CF6', 2, true),
  ('poesia', 'Heart', '#EC4899', 3, true),
  ('aventuras', 'Compass', '#10B981', 4, true),
  ('ciencia', 'Atom', '#3B82F6', 5, true)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Traducciones de categorias - Espanol (usando subquery para obtener el ID real)
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'es', 'Cuentos', 'Historias cortas para ninos' FROM books.categories WHERE slug = 'cuentos'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'es', 'Fabulas', 'Historias con moraleja' FROM books.categories WHERE slug = 'fabulas'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'es', 'Poesia', 'Versos y rimas infantiles' FROM books.categories WHERE slug = 'poesia'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'es', 'Aventuras', 'Historias de exploracion' FROM books.categories WHERE slug = 'aventuras'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'es', 'Ciencia', 'Libros educativos de ciencia' FROM books.categories WHERE slug = 'ciencia'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Traducciones de categorias - Ingles
INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'en', 'Stories', 'Short stories for children' FROM books.categories WHERE slug = 'cuentos'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'en', 'Fables', 'Stories with a moral' FROM books.categories WHERE slug = 'fabulas'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'en', 'Poetry', 'Childrens verses and rhymes' FROM books.categories WHERE slug = 'poesia'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'en', 'Adventures', 'Exploration stories' FROM books.categories WHERE slug = 'aventuras'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.category_translations (category_id, language_code, name, description)
SELECT id, 'en', 'Science', 'Educational science books' FROM books.categories WHERE slug = 'ciencia'
ON CONFLICT (category_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================
-- 2. NIVELES
-- ============================================
INSERT INTO books.levels (slug, min_age, max_age, grade_min, grade_max, color, icon, order_index, is_active) VALUES
  ('preescolar', 3, 5, NULL, NULL, '#FCD34D', 'Baby', 1, true),
  ('inicial', 6, 7, 1, 2, '#A3E635', 'Sprout', 2, true),
  ('intermedio', 8, 10, 3, 5, '#38BDF8', 'BookOpen', 3, true),
  ('avanzado', 11, 13, 6, 8, '#A78BFA', 'GraduationCap', 4, true)
ON CONFLICT (slug) DO UPDATE SET
  min_age = EXCLUDED.min_age,
  max_age = EXCLUDED.max_age,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Traducciones de niveles - Espanol
INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'es', 'Preescolar', 'Para ninos de 3 a 5 anos' FROM books.levels WHERE slug = 'preescolar'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'es', 'Inicial', 'Primeros lectores, 6 a 7 anos' FROM books.levels WHERE slug = 'inicial'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'es', 'Intermedio', 'Lectores en desarrollo, 8 a 10 anos' FROM books.levels WHERE slug = 'intermedio'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'es', 'Avanzado', 'Lectores fluidos, 11 a 13 anos' FROM books.levels WHERE slug = 'avanzado'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Traducciones de niveles - Ingles
INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'en', 'Preschool', 'For children ages 3 to 5' FROM books.levels WHERE slug = 'preescolar'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'en', 'Beginner', 'Early readers, ages 6 to 7' FROM books.levels WHERE slug = 'inicial'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'en', 'Intermediate', 'Developing readers, ages 8 to 10' FROM books.levels WHERE slug = 'intermedio'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.level_translations (level_id, language_code, name, description)
SELECT id, 'en', 'Advanced', 'Fluent readers, ages 11 to 13' FROM books.levels WHERE slug = 'avanzado'
ON CONFLICT (level_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================
-- 3. GENEROS
-- ============================================
INSERT INTO books.genres (slug, icon, color, order_index, is_active) VALUES
  ('fantasia', 'Wand2', '#8B5CF6', 1, true),
  ('humor', 'Laugh', '#F59E0B', 2, true),
  ('misterio', 'Search', '#6366F1', 3, true),
  ('naturaleza', 'Leaf', '#10B981', 4, true),
  ('amistad', 'Users', '#EC4899', 5, true),
  ('familia', 'Home', '#F97316', 6, true),
  ('animales', 'Cat', '#84CC16', 7, true),
  ('educativo', 'GraduationCap', '#0EA5E9', 8, true)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index,
  is_active = true;

-- Traducciones de generos - Espanol
INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Fantasia', 'Mundos magicos e imaginarios' FROM books.genres WHERE slug = 'fantasia'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Humor', 'Historias divertidas y comicas' FROM books.genres WHERE slug = 'humor'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Misterio', 'Enigmas y aventuras detectivescas' FROM books.genres WHERE slug = 'misterio'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Naturaleza', 'Sobre el medio ambiente y ecosistemas' FROM books.genres WHERE slug = 'naturaleza'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Amistad', 'Sobre relaciones y companerismo' FROM books.genres WHERE slug = 'amistad'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Familia', 'Historias familiares' FROM books.genres WHERE slug = 'familia'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Animales', 'Protagonizados por animales' FROM books.genres WHERE slug = 'animales'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'es', 'Educativo', 'Contenido didactico' FROM books.genres WHERE slug = 'educativo'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Traducciones de generos - Ingles
INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Fantasy', 'Magical and imaginary worlds' FROM books.genres WHERE slug = 'fantasia'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Humor', 'Funny and comic stories' FROM books.genres WHERE slug = 'humor'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Mystery', 'Puzzles and detective adventures' FROM books.genres WHERE slug = 'misterio'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Nature', 'About the environment and ecosystems' FROM books.genres WHERE slug = 'naturaleza'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Friendship', 'About relationships and companionship' FROM books.genres WHERE slug = 'amistad'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Family', 'Family stories' FROM books.genres WHERE slug = 'familia'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Animals', 'Stories featuring animals' FROM books.genres WHERE slug = 'animales'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO books.genre_translations (genre_id, language_code, name, description)
SELECT id, 'en', 'Educational', 'Didactic content' FROM books.genres WHERE slug = 'educativo'
ON CONFLICT (genre_id, language_code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ============================================
-- VERIFICACION
-- ============================================
SELECT 'CATEGORIAS' as tabla, count(*) as total FROM books.categories WHERE is_active = true
UNION ALL
SELECT 'NIVELES', count(*) FROM books.levels WHERE is_active = true
UNION ALL
SELECT 'GENEROS', count(*) FROM books.genres WHERE is_active = true
UNION ALL
SELECT 'CAT_TRANS_ES', count(*) FROM books.category_translations WHERE language_code = 'es'
UNION ALL
SELECT 'CAT_TRANS_EN', count(*) FROM books.category_translations WHERE language_code = 'en'
UNION ALL
SELECT 'LVL_TRANS_ES', count(*) FROM books.level_translations WHERE language_code = 'es'
UNION ALL
SELECT 'LVL_TRANS_EN', count(*) FROM books.level_translations WHERE language_code = 'en'
UNION ALL
SELECT 'GEN_TRANS_ES', count(*) FROM books.genre_translations WHERE language_code = 'es'
UNION ALL
SELECT 'GEN_TRANS_EN', count(*) FROM books.genre_translations WHERE language_code = 'en';
