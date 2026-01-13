-- ============================================
-- SCRIPT 05: TABLA ROUTE_PERMISSIONS
-- ============================================
-- Define qué rutas puede acceder cada ROL
-- Ejemplo: role "teacher" puede acceder a "/library", "/classes", etc.
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS app.route_permissions CASCADE;

-- ============================================
-- CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS app.route_permissions (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_name VARCHAR(50) NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT route_permissions_unique UNIQUE (role_name, route_id)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_route_permissions_role_name ON app.route_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_route_permissions_route_id ON app.route_permissions(route_id);
CREATE INDEX IF NOT EXISTS idx_route_permissions_is_active ON app.route_permissions(is_active);

-- ============================================
-- TRIGGER updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_route_permissions_updated_at ON app.route_permissions;
CREATE TRIGGER set_route_permissions_updated_at
  BEFORE UPDATE ON app.route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.route_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

-- SELECT: Todos pueden ver permisos de roles
DROP POLICY IF EXISTS "route_permissions_select_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_select_policy" ON app.route_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Solo super_admin puede asignar rutas a roles
DROP POLICY IF EXISTS "route_permissions_insert_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_insert_policy" ON app.route_permissions
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

-- UPDATE: Solo super_admin puede actualizar permisos de roles
DROP POLICY IF EXISTS "route_permissions_update_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_update_policy" ON app.route_permissions
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

-- DELETE: Solo super_admin puede eliminar permisos de roles
DROP POLICY IF EXISTS "route_permissions_delete_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_delete_policy" ON app.route_permissions
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

-- Permisos para super_admin (todas las rutas)
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 
  'super_admin',
  r.id
FROM app.routes r
WHERE r.deleted_at IS NULL
ON CONFLICT (role_name, route_id) DO NOTHING;

-- Permisos para admin (rutas administrativas)
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 
  'admin',
  r.id
FROM app.routes r
WHERE r.pathname IN (
  '/',
  '/library',
  '/my-world',
  '/my-progress',
  '/admin'
)
ON CONFLICT (role_name, route_id) DO NOTHING;

-- Permisos para teacher
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 
  'teacher',
  r.id
FROM app.routes r
WHERE r.pathname IN (
  '/',
  '/library',
  '/my-world',
  '/my-progress'
)
ON CONFLICT (role_name, route_id) DO NOTHING;

-- Permisos para student
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 
  'student',
  r.id
FROM app.routes r
WHERE r.pathname IN (
  '/',
  '/library',
  '/my-world',
  '/my-progress'
)
ON CONFLICT (role_name, route_id) DO NOTHING;

-- Permisos para guest
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 
  'guest',
  r.id
FROM app.routes r
WHERE r.pathname IN ('/')
ON CONFLICT (role_name, route_id) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.route_permissions IS 'Permisos por ROL - Define qué rutas puede acceder cada rol';
COMMENT ON COLUMN app.route_permissions.role_name IS 'Nombre del rol (referencia a roles.name)';
COMMENT ON COLUMN app.route_permissions.route_id IS 'Ruta a la que tiene acceso';

-- ============================================
-- VERIFICAR
-- ============================================

-- SELECT 
--   rp.role_name,
--   r.pathname,
--   r.display_name,
--   rp.is_active
-- FROM app.route_permissions rp
-- JOIN app.routes r ON r.id = rp.route_id
-- ORDER BY rp.role_name, r.pathname;
