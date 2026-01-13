-- ============================================
-- SCRIPT 02: TABLA DE RUTAS
-- ============================================
-- Define las rutas del sistema (/library, /admin, etc.)
-- ============================================

-- Eliminar tabla si existe (solo para desarrollo)
-- DROP TABLE IF EXISTS app.routes CASCADE;

-- ============================================
-- CREAR TABLA
-- ============================================

CREATE TABLE IF NOT EXISTS app.routes (
  -- Identificación
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pathname VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  
  -- Información
  description TEXT,
  icon VARCHAR(50),
  
  -- Menú
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  menu_order INTEGER NOT NULL DEFAULT 0,
  parent_route_id UUID REFERENCES app.routes(id) ON DELETE SET NULL,
  
  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  
  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT routes_pathname_format CHECK (pathname ~ '^/[a-z0-9\-/]*$'),
  CONSTRAINT routes_menu_order_positive CHECK (menu_order >= 0)
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_routes_pathname ON app.routes(pathname);
CREATE INDEX IF NOT EXISTS idx_routes_is_active ON app.routes(is_active);
CREATE INDEX IF NOT EXISTS idx_routes_deleted_at ON app.routes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_routes_show_in_menu ON app.routes(show_in_menu);
CREATE INDEX IF NOT EXISTS idx_routes_parent ON app.routes(parent_route_id);

-- ============================================
-- TRIGGER updated_at
-- ============================================

DROP TRIGGER IF EXISTS set_routes_updated_at ON app.routes;
CREATE TRIGGER set_routes_updated_at
  BEFORE UPDATE ON app.routes
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- HABILITAR RLS
-- ============================================

ALTER TABLE app.routes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS
-- ============================================

DROP POLICY IF EXISTS "routes_select_policy" ON app.routes;
CREATE POLICY "routes_select_policy" ON app.routes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "routes_insert_policy" ON app.routes;
CREATE POLICY "routes_insert_policy" ON app.routes
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

DROP POLICY IF EXISTS "routes_update_policy" ON app.routes;
CREATE POLICY "routes_update_policy" ON app.routes
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

-- ============================================
-- DATOS INICIALES
-- ============================================

INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order) VALUES
  ('/', 'Home', 'Página principal', true, 1),
  ('/library', 'Library', 'Biblioteca de recursos', true, 2),
  ('/my-world', 'My World', 'Mi mundo personal', true, 3),
  ('/my-progress', 'My Progress', 'Mi progreso', true, 4),
  ('/admin', 'Admin', 'Panel de administración', true, 100),
  ('/admin/routes', 'Routes', 'Gestión de rutas', false, 101),
  ('/admin/route-translations', 'Route Translations', 'Traducciones de rutas', false, 102),
  ('/admin/role-permissions', 'Role Permissions', 'Permisos por rol', false, 103),
  ('/admin/permissions', 'User Permissions', 'Permisos de usuarios', false, 104)
ON CONFLICT (pathname) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE app.routes IS 'Rutas del sistema - Define todas las páginas accesibles';
COMMENT ON COLUMN app.routes.pathname IS 'Ruta interna del sistema (ej: /library)';
COMMENT ON COLUMN app.routes.display_name IS 'Nombre visible de la ruta';
COMMENT ON COLUMN app.routes.show_in_menu IS 'Si aparece en el menú de navegación';
COMMENT ON COLUMN app.routes.is_public IS 'Si es accesible sin autenticación';
COMMENT ON COLUMN app.routes.deleted_at IS 'Soft delete - fecha de eliminación';

-- ============================================
-- VERIFICAR
-- ============================================

-- SELECT * FROM app.routes WHERE deleted_at IS NULL ORDER BY menu_order;
