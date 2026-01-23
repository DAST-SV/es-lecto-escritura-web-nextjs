-- ============================================
-- SCRIPT 08: TABLA ROLE_LANGUAGE_ACCESS
-- ============================================

CREATE TABLE app.role_language_access (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT role_language_access_unique UNIQUE (role_name, language_code)
);

-- Índices
CREATE INDEX idx_role_language_access_role_name ON app.role_language_access(role_name);
CREATE INDEX idx_role_language_access_language ON app.role_language_access(language_code);
CREATE INDEX idx_role_language_access_is_active ON app.role_language_access(is_active);

-- Trigger
CREATE TRIGGER set_role_language_access_updated_at
  BEFORE UPDATE ON app.role_language_access
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.role_language_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_language_access_select_policy" ON app.role_language_access
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "role_language_access_insert_policy" ON app.role_language_access
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "role_language_access_update_policy" ON app.role_language_access
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "role_language_access_delete_policy" ON app.role_language_access
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.role_language_access TO authenticated;

-- Datos iniciales
-- super_admin: TODOS
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('super_admin', 'es'),
  ('super_admin', 'en'),
  ('super_admin', 'fr'),
  ('super_admin', 'it');

-- admin: TODOS
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('admin', 'es'),
  ('admin', 'en'),
  ('admin', 'fr'),
  ('admin', 'it');

-- teacher: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('teacher', 'es'),
  ('teacher', 'en');

-- student: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('student', 'es'),
  ('student', 'en');

-- guest: Solo ES
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('guest', 'es');

-- Comentarios
COMMENT ON TABLE app.role_language_access IS 'Idiomas permitidos por rol';

-- Verificar
SELECT 
  rla.role_name,
  rla.language_code,
  r.display_name
FROM app.role_language_access rla
JOIN app.roles r ON r.name = rla.role_name
WHERE rla.is_active = true
ORDER BY rla.role_name, rla.language_code;