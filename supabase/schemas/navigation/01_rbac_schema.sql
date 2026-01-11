-- ============================================
-- MIGRACIÓN: Sistema RBAC Profesional Dinámico
-- Inspired by: Auth0, AWS IAM, Keycloak
-- ============================================

-- ============================================
-- 1. TABLA: roles (Roles del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS app.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Jerarquía (nivel de poder)
  hierarchy_level INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  is_system_role BOOLEAN DEFAULT false, -- No se puede eliminar
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_roles_hierarchy ON app.roles(hierarchy_level);
CREATE INDEX idx_roles_active ON app.roles(is_active, deleted_at);

-- ============================================
-- 2. TABLA: permissions (Permisos granulares)
-- ============================================
CREATE TABLE IF NOT EXISTS app.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificador único del permiso
  name TEXT NOT NULL UNIQUE, -- Ej: "books.create", "users.delete"
  
  -- Información
  display_name TEXT NOT NULL,
  description TEXT,
  
  -- Categorización
  resource TEXT NOT NULL, -- Ej: "books", "users", "organizations"
  action TEXT NOT NULL, -- Ej: "create", "read", "update", "delete"
  
  -- Metadata
  is_system_permission BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  
  -- Constraint: nombre auto-generado
  CONSTRAINT check_permission_name CHECK (name = resource || '.' || action)
);

-- Índices
CREATE INDEX idx_permissions_resource ON app.permissions(resource);
CREATE INDEX idx_permissions_active ON app.permissions(is_active, deleted_at);

-- ============================================
-- 3. TABLA: role_permissions (Roles ↔ Permisos)
-- ============================================
CREATE TABLE IF NOT EXISTS app.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES app.permissions(id) ON DELETE CASCADE,
  
  -- Auditoría
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  
  UNIQUE(role_id, permission_id)
);

-- Índices
CREATE INDEX idx_role_permissions_role ON app.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON app.role_permissions(permission_id);

-- ============================================
-- 4. TABLA: user_roles (Usuarios ↔ Roles)
-- ============================================
CREATE TABLE IF NOT EXISTS app.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
  
  -- Contexto (opcional: rol en organización específica)
  organization_id UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
  
  -- Vigencia
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- NULL = permanente
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id),
  
  UNIQUE(user_id, role_id, organization_id)
);

-- Índices
CREATE INDEX idx_user_roles_user ON app.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON app.user_roles(role_id);
CREATE INDEX idx_user_roles_org ON app.user_roles(organization_id);
CREATE INDEX idx_user_roles_active ON app.user_roles(is_active, valid_from, valid_until);

-- ============================================
-- 5. TABLA: user_permissions (Permisos directos a usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS app.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES app.permissions(id) ON DELETE CASCADE,
  
  -- Contexto
  organization_id UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
  resource_id UUID, -- ID del recurso específico (ej: book_id)
  
  -- Tipo de permiso
  permission_type TEXT DEFAULT 'grant' CHECK (permission_type IN ('grant', 'deny')),
  
  -- Vigencia
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  
  -- Auditoría
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  revoked_at TIMESTAMPTZ,
  
  UNIQUE(user_id, permission_id, organization_id, resource_id)
);

-- Índices
CREATE INDEX idx_user_permissions_user ON app.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON app.user_permissions(permission_id);
CREATE INDEX idx_user_permissions_resource ON app.user_permissions(resource_id);

-- ============================================
-- 6. TABLA: routes (Rutas del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS app.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Ruta base
  pathname TEXT NOT NULL UNIQUE,
  
  -- Información
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- Nombre del icono (ej: "Home", "Users")
  
  -- Acceso
  is_public BOOLEAN DEFAULT false, -- true = acceso sin login
  requires_permissions TEXT[], -- ["books.read", "users.list"]
  requires_all_permissions BOOLEAN DEFAULT true, -- AND vs OR
  
  -- UI
  show_in_menu BOOLEAN DEFAULT true,
  menu_order INTEGER DEFAULT 0,
  parent_route_id UUID REFERENCES app.routes(id),
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_routes_public ON app.routes(is_public);
CREATE INDEX idx_routes_active ON app.routes(is_active, deleted_at);
CREATE INDEX idx_routes_menu ON app.routes(show_in_menu, menu_order);

-- ============================================
-- 7. TABLA: route_translations (Traducciones de rutas)
-- ============================================
CREATE TABLE IF NOT EXISTS app.route_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL CHECK (language_code IN ('es', 'en', 'fr')),
  
  -- Traducción
  translated_path TEXT NOT NULL,
  translated_name TEXT NOT NULL,
  translated_description TEXT,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  -- Auditoría
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(route_id, language_code)
);

-- Índices
CREATE INDEX idx_route_translations_route ON app.route_translations(route_id);
CREATE INDEX idx_route_translations_language ON app.route_translations(language_code);

-- ============================================
-- 8. RLS (Row Level Security)
-- ============================================

-- Roles: Solo super_admin puede modificar
ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active roles"
  ON app.roles FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Only super_admin can modify roles"
  ON app.roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  );

-- Permissions: Solo super_admin puede modificar
ALTER TABLE app.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active permissions"
  ON app.permissions FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Only super_admin can modify permissions"
  ON app.permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  );

-- User Roles: Los usuarios pueden ver sus propios roles
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON app.user_roles FOR SELECT
  USING (user_id = auth.uid() AND is_active = true);

CREATE POLICY "Admins can manage roles"
  ON app.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name IN ('super_admin', 'org_admin')
        AND ur.is_active = true
    )
  );

-- Routes: Todos pueden leer rutas activas
ALTER TABLE app.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active routes"
  ON app.routes FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Only super_admin can modify routes"
  ON app.routes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
    )
  );

-- Route Translations: Todos pueden leer
ALTER TABLE app.route_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read route translations"
  ON app.route_translations FOR SELECT
  USING (is_active = true);

-- ============================================
-- 9. TRIGGERS: updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_permissions_updated_at
  BEFORE UPDATE ON app.permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_routes_updated_at
  BEFORE UPDATE ON app.routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_route_translations_updated_at
  BEFORE UPDATE ON app.route_translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CONTINÚA EN PARTE 2...
-- ============================================
