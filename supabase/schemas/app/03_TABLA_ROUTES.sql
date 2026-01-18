-- ============================================
-- SCRIPT 03: TABLA ROUTES
-- ============================================

CREATE TABLE app.routes (
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

-- Índices
CREATE INDEX idx_routes_pathname ON app.routes(pathname);
CREATE INDEX idx_routes_is_active ON app.routes(is_active);
CREATE INDEX idx_routes_deleted_at ON app.routes(deleted_at);
CREATE INDEX idx_routes_show_in_menu ON app.routes(show_in_menu);
CREATE INDEX idx_routes_parent ON app.routes(parent_route_id);

-- Trigger
CREATE TRIGGER set_routes_updated_at
  BEFORE UPDATE ON app.routes
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- RLS
ALTER TABLE app.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routes_select_policy" ON app.routes
  FOR SELECT
  TO authenticated
  USING (is_active = true AND deleted_at IS NULL);

-- Permisos
GRANT SELECT ON app.routes TO authenticated;

-- Datos iniciales
INSERT INTO app.routes (pathname, display_name, description, show_in_menu, menu_order, is_public) VALUES
  ('/', 'Home', 'Página principal', true, 1, true),
  ('/library', 'Library', 'Biblioteca de recursos', true, 2, false),
  ('/my-world', 'My World', 'Mi mundo personal', true, 3, false),
  ('/my-progress', 'My Progress', 'Mi progreso', true, 4, false),
  ('/admin', 'Admin', 'Panel de administración', true, 100, false),
  ('/admin/routes', 'Routes', 'Gestión de rutas', false, 101, false),
  ('/admin/route-translations', 'Route Translations', 'Traducciones de rutas', false, 102, false),
  ('/admin/role-permissions', 'Role Permissions', 'Permisos por rol', false, 103, false),
  ('/admin/user-permissions', 'User Permissions', 'Permisos de usuarios', false, 104, false),
  ('/admin/user-roles', 'User Roles', 'Roles de usuarios', false, 105, false),
  ('/admin/route-scanner', 'Route Scanner', 'Escanear rutas', false, 106, false);

-- Comentarios
COMMENT ON TABLE app.routes IS 'Rutas del sistema';
COMMENT ON COLUMN app.routes.pathname IS 'Ruta física del sistema';

-- Verificar
SELECT pathname, display_name, is_public FROM app.routes WHERE deleted_at IS NULL ORDER BY menu_order;