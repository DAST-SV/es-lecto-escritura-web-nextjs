-- supabase/schemas/app/translations/schema/home_translations.sql
-- ============================================
-- TRADUCCIONES PARA HOMEPAGE (ESPAÑOL)
-- ============================================
-- Este script crea TODAS las traducciones necesarias para:
-- 1. HeroCarousel (namespace: 'hero') - 4 slides
-- 2. FeaturesSection (namespace: 'features') - 5 tabs + 3 stats + extras
-- 3. CTASection (namespace: 'cta') - título más compacto
-- ============================================

-- ============================================
-- 0. CREAR NAMESPACES (SI NO EXISTEN)
-- ============================================

INSERT INTO app.translation_namespaces (slug, name, description)
VALUES 
  ('hero', 'Hero Carousel', 'Traducciones para el carousel principal de la página de inicio'),
  ('features', 'Features Section', 'Traducciones para la sección de características de la página de inicio'),
  ('cta', 'CTA Section', 'Traducciones para la sección de llamada a la acción de la página de inicio')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 1. HERO CAROUSEL TRANSLATIONS (4 SLIDES)
-- Namespace: hero
-- ============================================

-- ==================== SLIDE 0 ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.0.title', 'Título del slide 0 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Aprende a Leer y Escribir'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.0.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.0.icon', 'Icono del slide 0 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '📚'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.0.icon'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.0.description', 'Descripción del slide 0 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Descubre el poder de la lectoescritura con nuestro método interactivo y personalizado diseñado para todas las edades.'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.0.description'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.0.button', 'Texto del botón del slide 0 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Comenzar Ahora'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.0.button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== SLIDE 1 ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.1.title', 'Título del slide 1 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Ejercicios Interactivos'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.1.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.1.icon', 'Icono del slide 1 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '✍️'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.1.icon'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.1.description', 'Descripción del slide 1 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Practica con ejercicios divertidos y dinámicos que se adaptan a tu nivel y ritmo de aprendizaje.'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.1.description'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.1.button', 'Texto del botón del slide 1 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Ver Ejercicios'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.1.button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== SLIDE 2 ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.2.title', 'Título del slide 2 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Progreso Personalizado'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.2.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.2.icon', 'Icono del slide 2 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '📊'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.2.icon'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.2.description', 'Descripción del slide 2 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Sigue tu avance en tiempo real con estadísticas detalladas y logros que celebran cada paso de tu camino.'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.2.description'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.2.button', 'Texto del botón del slide 2 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Ver Mi Progreso'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.2.button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== SLIDE 3 ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.3.title', 'Título del slide 3 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Comunidad de Aprendizaje'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.3.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.3.icon', 'Icono del slide 3 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '👥'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.3.icon'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.3.description', 'Descripción del slide 3 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Únete a miles de estudiantes que comparten sus logros y se apoyan mutuamente en su viaje educativo.'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.3.description'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('hero', 'slides.3.button', 'Texto del botón del slide 3 del hero carousel')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Unirme a la Comunidad'
FROM app.translation_keys 
WHERE namespace_slug = 'hero' AND key_name = 'slides.3.button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- 2. FEATURES SECTION TRANSLATIONS
-- Namespace: features
-- ============================================

-- ==================== HEADER ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'title', 'Título de la sección de características')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Lo Que Nos Hace Diferentes'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'button', 'Texto del botón de la sección de características')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Conocer Más'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== NAVIGATION ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'navigation.previous', 'Texto para botón anterior (mobile)')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Anterior'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'navigation.previous'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'navigation.next', 'Texto para botón siguiente (mobile)')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Siguiente'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'navigation.next'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'navigation.of', 'Texto "de" para contador (1 de 5)')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'de'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'navigation.of'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== TAB 0: OUR_DIFFERENCE ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.0.id', 'ID del tab 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'our_difference'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.0.id'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.0.label', 'Etiqueta del tab 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Nuestra Diferencia'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.0.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.0.title', 'Título del tab 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Aprendizaje Divertido y Efectivo'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.0.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.0.content', 'Contenido del tab 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Combinamos educación con diversión para que los niños aprendan jugando. Nuestro método hace que cada lección sea una aventura emocionante.'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.0.content'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== TAB 1: FOR_STUDENTS ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.1.id', 'ID del tab 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'for_students'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.1.id'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.1.label', 'Etiqueta del tab 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Para Estudiantes'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.1.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.1.title', 'Título del tab 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Contenido Adaptado a Tu Nivel'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.1.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.1.content', 'Contenido del tab 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Ejercicios personalizados que crecen contigo. Desde principiante hasta avanzado, siempre encontrarás el desafío perfecto para seguir mejorando.'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.1.content'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== TAB 2: FOR_PARENTS ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.2.id', 'ID del tab 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'for_parents'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.2.id'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.2.label', 'Etiqueta del tab 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Para Padres'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.2.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.2.title', 'Título del tab 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Seguimiento del Progreso'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.2.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.2.content', 'Contenido del tab 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Monitorea el avance de tus hijos fácilmente con reportes detallados. Sabrás exactamente en qué áreas destacan y dónde necesitan más apoyo.'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.2.content'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== TAB 3: FOR_TEACHERS ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.3.id', 'ID del tab 3')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'for_teachers'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.3.id'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.3.label', 'Etiqueta del tab 3')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Para Docentes'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.3.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.3.title', 'Título del tab 3')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Herramientas Educativas'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.3.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.3.content', 'Contenido del tab 3')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Recursos completos para el aula. Crea tareas, evalúa a tus estudiantes y gestiona el aprendizaje de toda tu clase desde un solo lugar.'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.3.content'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== TAB 4: PLANS_AND_PRICING ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.4.id', 'ID del tab 4')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'plans_and_pricing'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.4.id'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.4.label', 'Etiqueta del tab 4')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Planes y Precios'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.4.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.4.title', 'Título del tab 4')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '100% Gratis Para Siempre'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.4.title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'tabs.4.content', 'Contenido del tab 4')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Sin costos ocultos, sin publicidad molesta. Creemos que la educación de calidad debe ser accesible para todos. Disfruta de todas las funciones sin límites.'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'tabs.4.content'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ==================== STATS ====================
INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.0.number', 'Número de la estadística 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '10,000+'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.0.number'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.0.label', 'Etiqueta de la estadística 0')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Niños Aprendiendo'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.0.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.1.number', 'Número de la estadística 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '500+'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.1.number'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.1.label', 'Etiqueta de la estadística 1')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Ejercicios Divertidos'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.1.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.2.number', 'Número de la estadística 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '100%'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.2.number'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('features', 'stats.2.label', 'Etiqueta de la estadística 2')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Gratis Siempre'
FROM app.translation_keys 
WHERE namespace_slug = 'features' AND key_name = 'stats.2.label'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- 3. CTA SECTION TRANSLATIONS
-- Namespace: cta
-- ============================================

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'badge', 'Badge superior de la sección CTA')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '¡Comienza Hoy Mismo!'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'badge'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'title', 'Título de la sección CTA (MÁS COMPACTO)')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '¡Únete a la Aventura del Aprendizaje!'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'title'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'description', 'Descripción de la sección CTA')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Miles de niños ya están descubriendo el amor por la lectura. ¡Empieza tu viaje hoy!'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'description'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'button', 'Texto del botón de la sección CTA')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Comenzar Ahora Gratis'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'button'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'trust_badge', 'Badge de confianza (+1000 niños aprendiendo)')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', '+1000 niños aprendiendo'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'trust_badge'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'feature_1', 'Primera característica destacada')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Sin publicidad'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'feature_1'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'feature_2', 'Segunda característica destacada')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Contenido seguro'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'feature_2'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO app.translation_keys (namespace_slug, key_name, description)
VALUES ('cta', 'feature_3', 'Tercera característica destacada')
ON CONFLICT (namespace_slug, key_name) DO NOTHING;

INSERT INTO app.translations (translation_key_id, language_code, value)
SELECT id, 'es', 'Gratis para siempre'
FROM app.translation_keys 
WHERE namespace_slug = 'cta' AND key_name = 'feature_3'
ON CONFLICT (translation_key_id, language_code) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar todas las traducciones de 'hero' (debe ser 16: 4 slides × 4 campos)
SELECT COUNT(*) as hero_total
FROM app.translations t
JOIN app.translation_keys tk ON t.translation_key_id = tk.id
WHERE tk.namespace_slug = 'hero';

-- Verificar todas las traducciones de 'features' (debe ser 29: 1 title + 1 button + 3 nav + 5 tabs×4 + 3 stats×2)
SELECT COUNT(*) as features_total
FROM app.translations t
JOIN app.translation_keys tk ON t.translation_key_id = tk.id
WHERE tk.namespace_slug = 'features';

-- Verificar todas las traducciones de 'cta' (debe ser 8: badge + title + description + button + trust_badge + 3 features)
SELECT COUNT(*) as cta_total
FROM app.translations t
JOIN app.translation_keys tk ON t.translation_key_id = tk.id
WHERE tk.namespace_slug = 'cta';

-- Ver todas las traducciones creadas
SELECT 
  tk.namespace_slug,
  tk.key_name,
  t.language_code,
  t.value
FROM app.translation_keys tk
JOIN app.translations t ON tk.id = t.translation_key_id
WHERE tk.namespace_slug IN ('hero', 'features', 'cta')
ORDER BY tk.namespace_slug, tk.key_name, t.language_code;