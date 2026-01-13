-- ============================================
-- SCRIPT 07: TABLA ROLE_LANGUAGE_ACCESS
-- ============================================
-- Define qué idiomas puede usar cada ROL
-- Ejemplo: role "teacher" puede usar ES, EN, FR
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS app.role_language_access CASCADE;

-- ============================================
-- CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS app.role_language_access (
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

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_role_language_access_role_name ON app.role_language_access(role_name);
CREATE INDEX IF NOT EXISTS idx_role_language_access_language ON app.role_language_access(language_code);
CREATE INDEX IF NOT EXISTS idx_role_language_access_is_active ON app.role_language_access(is_active);

-- ============================================
-- TRIGGER updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_role_language_access_updated_at ON app.role_language_access;
CREATE TRIGGER set_role_language_access_updated_at
  BEFORE UPDATE ON app.role_language_access
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.role_language_access ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Todos pueden ver idiomas permitidos por rol
DROP POLICY IF EXISTS "role_language_access_select_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_select_policy" ON app.role_language_access
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Solo super_admin
DROP POLICY IF EXISTS "role_language_access_insert_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_insert_policy" ON app.role_language_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- UPDATE: Solo super_admin
DROP POLICY IF EXISTS "role_language_access_update_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_update_policy" ON app.role_language_access
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- DELETE: Solo super_admin
DROP POLICY IF EXISTS "role_language_access_delete_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_delete_policy" ON app.role_language_access
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- DATOS INICIALES
-- ============================================

-- super_admin: Todos los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('super_admin', 'es'),
  ('super_admin', 'en'),
  ('super_admin', 'fr'),
  ('super_admin', 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- admin: Todos los idiomas
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('admin', 'es'),
  ('admin', 'en'),
  ('admin', 'fr'),
  ('admin', 'it')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- teacher: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('teacher', 'es'),
  ('teacher', 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- student: ES, EN
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('student', 'es'),
  ('student', 'en')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- guest: Solo ES
INSERT INTO app.role_language_access (role_name, language_code) VALUES
  ('guest', 'es')
ON CONFLICT (role_name, language_code) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.role_language_access IS 'Idiomas permitidos por rol';
COMMENT ON COLUMN app.role_language_access.role_name IS 'Rol al que aplica';
COMMENT ON COLUMN app.role_language_access.language_code IS 'Código del idioma permitido';

-- ============================================
-- VERIFICAR
-- ============================================

-- SELECT 
--   rla.role_name,
--   rla.language_code,
--   r.display_name as role_display_name
-- FROM app.role_language_access rla
-- JOIN app.roles r ON r.name = rla.role_name
-- WHERE rla.is_active = true
-- ORDER BY rla.role_name, rla.language_code;
