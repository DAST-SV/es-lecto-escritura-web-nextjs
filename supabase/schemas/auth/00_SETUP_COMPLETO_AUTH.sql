-- ============================================================================
-- SISTEMA DE AUTENTICACIÓN COMPLETO - ES LECTO ESCRITURA
-- ============================================================================
-- Descripción: Script SQL completo para configurar autenticación con roles,
--              organizaciones y soporte para OAuth providers
-- Versión: 1.0
-- Fecha: 2026-01-22
-- ============================================================================

-- Limpiar instalación previa (CUIDADO: Esto borra datos existentes)
-- Descomentar solo si quieres empezar desde cero
-- DROP SCHEMA IF EXISTS app CASCADE;

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS app;

-- Establecer search_path
SET search_path TO app, public;

-- ============================================================================
-- EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMERACIONES (ENUMS)
-- ============================================================================

-- Tipo de organización
DO $$ BEGIN
  CREATE TYPE app.organization_type AS ENUM (
      'school',                   -- Escuela/Colegio/Universidad
      'family',                   -- Familia o hogar
      'group',                    -- Grupo de estudio
      'library',                  -- Biblioteca
      'individual'                -- Usuario individual
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
COMMENT ON TYPE app.organization_type IS 'Tipos de organizaciones soportadas';

-- Roles del sistema (alineados con frontend)
DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM (
      'super_admin',      -- Administrador de la plataforma
      'school',           -- Administrador de escuela
      'teacher',          -- Maestro/Docente
      'parent',           -- Padre/Madre/Tutor
      'student',          -- Estudiante
      'individual'        -- Usuario individual
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
COMMENT ON TYPE app.user_role IS 'Roles disponibles en el sistema';

-- Estado de membresía
DO $$ BEGIN
  CREATE TYPE app.membership_status AS ENUM (
      'active',           -- Activo
      'inactive',         -- Inactivo
      'pending',          -- Pendiente de aprobación
      'suspended'         -- Suspendido
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Tipo de proveedor OAuth
DO $$ BEGIN
  CREATE TYPE app.oauth_provider AS ENUM (
      'google',
      'apple',
      'facebook',
      'azure',
      'github'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- TABLA: roles (Catálogo de roles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.roles (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name app.user_role NOT NULL UNIQUE,

    -- Información
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_role BOOLEAN NOT NULL DEFAULT true,

    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT roles_hierarchy_positive CHECK (hierarchy_level >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_roles_name ON app.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON app.roles(is_active);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_roles_updated_at ON app.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.roles IS 'Catálogo de roles del sistema';

-- ============================================================================
-- TABLA: organizations (Organizaciones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.organizations (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_type app.organization_type NOT NULL,

    -- Información básica
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,

    -- Contacto
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),

    -- Ubicación
    country_code CHAR(2),  -- ISO 3166-1 alpha-2
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,

    -- Configuración
    max_members INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,

    -- Branding
    logo_url TEXT,

    -- Auditoría
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_organizations_type ON app.organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON app.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON app.organizations(is_active) WHERE deleted_at IS NULL;

-- Trigger
DROP TRIGGER IF EXISTS set_organizations_updated_at ON app.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.organizations IS 'Organizaciones (escuelas, familias, grupos)';

-- ============================================================================
-- TABLA: user_profiles (Perfiles de usuario)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.user_profiles (
    -- Identificación (1:1 con auth.users)
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Información personal
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    full_name VARCHAR(200),

    -- Información adicional
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),

    -- Configuración
    avatar_url TEXT,
    language_preference VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',

    -- Metadata
    is_public_profile BOOLEAN DEFAULT false,
    bio TEXT,
    settings JSONB DEFAULT '{}'::jsonb,

    -- OAuth info
    oauth_provider app.oauth_provider,
    oauth_provider_id VARCHAR(255),

    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON app.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON app.user_profiles(oauth_provider, oauth_provider_id);

-- Trigger
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON app.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.user_profiles IS 'Perfiles extendidos de usuarios';

-- ============================================================================
-- TABLA: user_roles (Asignación de roles a usuarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.user_roles (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,

    -- Contexto (opcional - para roles dentro de una organización)
    organization_id UUID REFERENCES app.organizations(id) ON DELETE CASCADE,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Auditoría
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, organization_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON app.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON app.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON app.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON app.user_roles(is_active);

-- Trigger
DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios';

-- ============================================================================
-- TABLA: organization_members (Miembros de organizaciones)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.organization_members (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Rol dentro de la organización
    role app.user_role NOT NULL,

    -- Estado
    status app.membership_status NOT NULL DEFAULT 'pending',

    -- Metadata
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invitation_token VARCHAR(255),

    -- Auditoría
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT org_members_unique UNIQUE (organization_id, user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_org_members_org ON app.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON app.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON app.organization_members(status);

-- Trigger
DROP TRIGGER IF EXISTS set_org_members_updated_at ON app.organization_members;
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON app.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.organization_members IS 'Miembros de organizaciones';

-- ============================================================================
-- TABLA: user_relationships (Relaciones entre usuarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.user_relationships (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tipo de relación
    relationship_type VARCHAR(50) NOT NULL, -- 'parent-child', 'teacher-student', 'spouse', etc.

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Auditoría
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT relationships_unique UNIQUE (primary_user_id, related_user_id, relationship_type),
    CONSTRAINT relationships_not_self CHECK (primary_user_id != related_user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_relationships_primary ON app.user_relationships(primary_user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_related ON app.user_relationships(related_user_id);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON app.user_relationships(relationship_type);

-- Trigger
DROP TRIGGER IF EXISTS set_relationships_updated_at ON app.user_relationships;
CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON app.user_relationships
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

COMMENT ON TABLE app.user_relationships IS 'Relaciones entre usuarios (padre-hijo, maestro-estudiante)';

-- ============================================================================
-- DATOS INICIALES (SEED)
-- ============================================================================

-- Insertar roles base
INSERT INTO app.roles (name, display_name, description, hierarchy_level, is_system_role) VALUES
  ('super_admin'::app.user_role, 'Super Administrador', 'Control total de la plataforma', 100, true),
  ('school'::app.user_role, 'Administrador Escolar', 'Gestión de escuela y personal', 80, false),
  ('teacher'::app.user_role, 'Maestro/a', 'Gestión de clases y estudiantes', 50, false),
  ('parent'::app.user_role, 'Padre/Madre', 'Seguimiento de hijos', 30, false),
  ('student'::app.user_role, 'Estudiante', 'Acceso a contenido educativo', 10, false),
  ('individual'::app.user_role, 'Usuario Individual', 'Aprendizaje autónomo', 10, false)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  hierarchy_level = EXCLUDED.hierarchy_level,
  updated_at = NOW();

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función: Crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_oauth_provider app.oauth_provider;
BEGIN
  -- Extraer nombre del metadata
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  -- Detectar proveedor OAuth
  IF NEW.app_metadata->>'provider' IS NOT NULL THEN
    BEGIN
      v_oauth_provider := (NEW.app_metadata->>'provider')::app.oauth_provider;
    EXCEPTION WHEN OTHERS THEN
      v_oauth_provider := NULL;
    END;
  END IF;

  -- Crear perfil
  INSERT INTO app.user_profiles (
    user_id,
    full_name,
    display_name,
    oauth_provider,
    oauth_provider_id,
    language_preference,
    last_login_at
  ) VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_oauth_provider,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    last_login_at = NOW();

  -- Asignar rol si fue especificado en metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO app.user_roles (user_id, role_id, assigned_by)
    SELECT
      NEW.id,
      r.id,
      NEW.id
    FROM app.roles r
    WHERE r.name = (NEW.raw_user_meta_data->>'role')::app.user_role
    ON CONFLICT (user_id, role_id, organization_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app.handle_new_user();

-- Función: Obtener rol principal del usuario
CREATE OR REPLACE FUNCTION app.get_user_primary_role(p_user_id UUID)
RETURNS app.user_role AS $$
DECLARE
  v_role app.user_role;
BEGIN
  SELECT r.name INTO v_role
  FROM app.user_roles ur
  JOIN app.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ORDER BY r.hierarchy_level DESC
  LIMIT 1;

  RETURN COALESCE(v_role, 'individual'::app.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Verificar permisos de usuario
CREATE OR REPLACE FUNCTION app.has_role(
  p_user_id UUID,
  p_role app.user_role
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.name = p_role
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;

-- Políticas para roles (todos pueden ver)
DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Políticas para user_profiles
DROP POLICY IF EXISTS "users_view_own_profile" ON app.user_profiles;
CREATE POLICY "users_view_own_profile" ON app.user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public_profile = true);

DROP POLICY IF EXISTS "users_update_own_profile" ON app.user_profiles;
CREATE POLICY "users_update_own_profile" ON app.user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON app.user_profiles;
CREATE POLICY "users_insert_own_profile" ON app.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Políticas para user_roles
DROP POLICY IF EXISTS "users_view_own_roles" ON app.user_roles;
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Políticas para organizations
DROP POLICY IF EXISTS "users_view_organizations" ON app.organizations;
CREATE POLICY "users_view_organizations" ON app.organizations
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND deleted_at IS NULL
  );

-- Políticas para organization_members
DROP POLICY IF EXISTS "users_view_org_members" ON app.organization_members;
CREATE POLICY "users_view_org_members" ON app.organization_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id
      FROM app.organization_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Políticas para user_relationships
DROP POLICY IF EXISTS "users_view_relationships" ON app.user_relationships;
CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT
  TO authenticated
  USING (
    primary_user_id = auth.uid() OR
    related_user_id = auth.uid()
  );

-- ============================================================================
-- GRANTS (Permisos)
-- ============================================================================

GRANT USAGE ON SCHEMA app TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;

-- Service role tiene todos los permisos
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT
  'Setup completado exitosamente' AS status,
  (SELECT COUNT(*) FROM app.roles) AS total_roles,
  NOW() AS timestamp;

SELECT name, display_name, hierarchy_level
FROM app.roles
ORDER BY hierarchy_level DESC;
