-- ============================================
-- SCRIPT 06: TABLA ROUTE_PERMISSIONS
-- ============================================

CREATE TABLE app.route_permissions (
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

-- Índices
CREATE INDEX idx_route_permissions_role_name ON app.route_permissions(role_name);
CREATE INDEX idx_route_permissions_route_id ON app.route_permissions(route_id);
CREATE INDEX idx_route_permissions_is_active ON app.route_permissions(is_active);

-- Trigger
CREATE TRIGGER set_route_permissions_updated_at
  BEFORE UPDATE ON app.route_permissions
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.route_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "route_permissions_select_policy" ON app.route_permissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "route_permissions_insert_policy" ON app.route_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (app.is_super_admin(auth.uid()));

CREATE POLICY "route_permissions_update_policy" ON app.route_permissions
  FOR UPDATE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

CREATE POLICY "route_permissions_delete_policy" ON app.route_permissions
  FOR DELETE
  TO authenticated
  USING (app.is_super_admin(auth.uid()));

-- Permisos
GRANT SELECT, INSERT, UPDATE, DELETE ON app.route_permissions TO authenticated;

-- Datos iniciales: super_admin (TODAS)
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 'super_admin', r.id
FROM app.routes r
WHERE r.deleted_at IS NULL;

-- admin
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 'admin', r.id
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress', '/admin');

-- teacher
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 'teacher', r.id
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress');

-- student
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 'student', r.id
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress');

-- guest
INSERT INTO app.route_permissions (role_name, route_id)
SELECT 'guest', r.id
FROM app.routes r
WHERE r.pathname IN ('/');

-- Comentarios
COMMENT ON TABLE app.route_permissions IS 'Permisos por ROL';

-- Verificar
SELECT 
  rp.role_name,
  r.pathname,
  r.display_name
FROM app.route_permissions rp
JOIN app.routes r ON r.id = rp.route_id
ORDER BY rp.role_name, r.pathname;