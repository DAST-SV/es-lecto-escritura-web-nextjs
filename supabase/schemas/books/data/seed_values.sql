-- supabase/schemas/books/data/seed_values.sql
-- ============================================
-- DATOS INICIALES: Valores educativos
-- ============================================

SET search_path TO books, app, public;

-- Insertar valores base
INSERT INTO books.values (slug, icon, color, order_index) VALUES
  ('friendship', 'Heart', '#EC4899', 1),
  ('respect', 'Shield', '#8B5CF6', 2),
  ('honesty', 'Eye', '#3B82F6', 3),
  ('responsibility', 'CheckCircle', '#10B981', 4),
  ('kindness', 'Smile', '#F59E0B', 5),
  ('cooperation', 'Users', '#06B6D4', 6),
  ('perseverance', 'Target', '#EF4444', 7),
  ('empathy', 'HeartHandshake', '#D946EF', 8),
  ('courage', 'Flame', '#F97316', 9),
  ('gratitude', 'Gift', '#84CC16', 10),
  ('tolerance', 'Globe', '#6366F1', 11),
  ('solidarity', 'Handshake', '#14B8A6', 12),
  ('creativity', 'Lightbulb', '#FBBF24', 13),
  ('humility', 'Feather', '#A78BFA', 14),
  ('patience', 'Clock', '#78716C', 15)
ON CONFLICT (slug) DO UPDATE SET
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  order_index = EXCLUDED.order_index;

-- Insertar traducciones ES
INSERT INTO books.value_translations (value_id, language_code, name, description)
SELECT v.id, 'es', t.name, t.description
FROM books.values v
JOIN (VALUES
  ('friendship', 'Amistad', 'El valor de cultivar relaciones genuinas y leales'),
  ('respect', 'Respeto', 'Tratar a otros con consideración y dignidad'),
  ('honesty', 'Honestidad', 'Ser sincero y veraz en palabras y acciones'),
  ('responsibility', 'Responsabilidad', 'Cumplir con los compromisos y deberes'),
  ('kindness', 'Amabilidad', 'Ser gentil y considerado con los demás'),
  ('cooperation', 'Cooperación', 'Trabajar juntos para lograr metas comunes'),
  ('perseverance', 'Perseverancia', 'No rendirse ante las dificultades'),
  ('empathy', 'Empatía', 'Comprender y compartir los sentimientos de otros'),
  ('courage', 'Valentía', 'Enfrentar los miedos con determinación'),
  ('gratitude', 'Gratitud', 'Apreciar y agradecer lo que tenemos'),
  ('tolerance', 'Tolerancia', 'Aceptar las diferencias de los demás'),
  ('solidarity', 'Solidaridad', 'Apoyar a quienes lo necesitan'),
  ('creativity', 'Creatividad', 'Usar la imaginación para crear cosas nuevas'),
  ('humility', 'Humildad', 'Reconocer nuestras limitaciones y aprender de otros'),
  ('patience', 'Paciencia', 'Saber esperar con calma y comprensión')
) AS t(slug, name, description) ON v.slug = t.slug
ON CONFLICT (value_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones EN
INSERT INTO books.value_translations (value_id, language_code, name, description)
SELECT v.id, 'en', t.name, t.description
FROM books.values v
JOIN (VALUES
  ('friendship', 'Friendship', 'The value of cultivating genuine and loyal relationships'),
  ('respect', 'Respect', 'Treating others with consideration and dignity'),
  ('honesty', 'Honesty', 'Being sincere and truthful in words and actions'),
  ('responsibility', 'Responsibility', 'Fulfilling commitments and duties'),
  ('kindness', 'Kindness', 'Being gentle and considerate towards others'),
  ('cooperation', 'Cooperation', 'Working together to achieve common goals'),
  ('perseverance', 'Perseverance', 'Not giving up in the face of difficulties'),
  ('empathy', 'Empathy', 'Understanding and sharing the feelings of others'),
  ('courage', 'Courage', 'Facing fears with determination'),
  ('gratitude', 'Gratitude', 'Appreciating and being thankful for what we have'),
  ('tolerance', 'Tolerance', 'Accepting the differences of others'),
  ('solidarity', 'Solidarity', 'Supporting those in need'),
  ('creativity', 'Creativity', 'Using imagination to create new things'),
  ('humility', 'Humility', 'Recognizing our limitations and learning from others'),
  ('patience', 'Patience', 'Waiting calmly and with understanding')
) AS t(slug, name, description) ON v.slug = t.slug
ON CONFLICT (value_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Insertar traducciones FR
INSERT INTO books.value_translations (value_id, language_code, name, description)
SELECT v.id, 'fr', t.name, t.description
FROM books.values v
JOIN (VALUES
  ('friendship', 'Amitié', 'La valeur de cultiver des relations authentiques et loyales'),
  ('respect', 'Respect', 'Traiter les autres avec considération et dignité'),
  ('honesty', 'Honnêteté', 'Être sincère et véridique dans les paroles et les actions'),
  ('responsibility', 'Responsabilité', 'Respecter les engagements et les devoirs'),
  ('kindness', 'Gentillesse', 'Être doux et attentionné envers les autres'),
  ('cooperation', 'Coopération', 'Travailler ensemble pour atteindre des objectifs communs'),
  ('perseverance', 'Persévérance', 'Ne pas abandonner face aux difficultés'),
  ('empathy', 'Empathie', 'Comprendre et partager les sentiments des autres'),
  ('courage', 'Courage', 'Affronter ses peurs avec détermination'),
  ('gratitude', 'Gratitude', 'Apprécier et être reconnaissant pour ce que nous avons'),
  ('tolerance', 'Tolérance', 'Accepter les différences des autres'),
  ('solidarity', 'Solidarité', 'Soutenir ceux qui en ont besoin'),
  ('creativity', 'Créativité', 'Utiliser l''imagination pour créer de nouvelles choses'),
  ('humility', 'Humilité', 'Reconnaître nos limites et apprendre des autres'),
  ('patience', 'Patience', 'Savoir attendre calmement et avec compréhension')
) AS t(slug, name, description) ON v.slug = t.slug
ON CONFLICT (value_id, language_code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

SELECT 'BOOKS: Datos de values insertados' AS status;
