-- ============================================================================
-- SETUP UNIFICADO - ES LECTO ESCRITURA
-- ============================================================================
-- Ubicación: supabase/SETUP_UNIFICADO.sql
--
-- Este script crea toda la estructura de la base de datos en un solo archivo
-- con el ORDEN CORRECTO de dependencias para evitar errores de FK
--
-- EJECUTAR DESPUÉS DE: CLEANUP_COMPLETO.sql
-- ============================================================================

-- ============================================================================
-- PARTE 1: SCHEMAS Y EXTENSIONES
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/00_init.sql

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS books;

SET search_path TO app, public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grants iniciales
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA books TO anon, authenticated, service_role;

SELECT 'PARTE 1: Schemas y extensiones creados' AS status;

-- ============================================================================
-- PARTE 2: TODOS LOS ENUMS (antes de cualquier tabla)
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/enums/*.sql
--                    supabase/schemas/app/organizations/enums/*.sql

-- ENUM: user_role
DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM (
      'super_admin',
      'school',
      'teacher',
      'parent',
      'student',
      'individual'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: oauth_provider
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

-- ENUM: organization_type
DO $$ BEGIN
  CREATE TYPE app.organization_type AS ENUM (
      'school',
      'family',
      'group',
      'library',
      'individual'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: membership_status
DO $$ BEGIN
  CREATE TYPE app.membership_status AS ENUM (
      'active',
      'inactive',
      'suspended',
      'pending'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

SELECT 'PARTE 2: Enums creados' AS status;

-- ============================================================================
-- PARTE 3: FUNCIÓN SET_UPDATED_AT (requerida por triggers)
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/functions/set_updated_at.sql

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'PARTE 3: Función set_updated_at creada' AS status;

-- ============================================================================
-- PARTE 4: TABLA ROLES (base para user_roles)
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/tables/roles.sql

CREATE TABLE IF NOT EXISTS app.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name app.user_role NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_role BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT roles_hierarchy_positive CHECK (hierarchy_level >= 0)
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON app.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON app.roles(is_active);

-- Datos iniciales de roles
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

SELECT 'PARTE 4: Tabla roles creada con ' || (SELECT COUNT(*) FROM app.roles) || ' roles' AS status;

-- ============================================================================
-- PARTE 5: TABLA USER_PROFILES
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/tables/user_profiles.sql

CREATE TABLE IF NOT EXISTS app.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    full_name VARCHAR(200),
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),
    country_code CHAR(2),
    state VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    language_preference VARCHAR(10) DEFAULT 'es',
    grade_level VARCHAR(50),
    school_name VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_public_profile BOOLEAN DEFAULT false,
    show_progress BOOLEAN DEFAULT false,
    allow_messages BOOLEAN DEFAULT true,
    oauth_provider app.oauth_provider,
    oauth_provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-()]+$')
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON app.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON app.user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON app.user_profiles(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name_search ON app.user_profiles
    USING gin(to_tsvector('spanish', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

SELECT 'PARTE 5: Tabla user_profiles creada' AS status;

-- ============================================================================
-- PARTE 6: TABLA ORGANIZATIONS (antes de user_roles que la referencia)
-- ============================================================================
-- Ubicación original: supabase/schemas/app/organizations/tables/organizations.sql

CREATE TABLE IF NOT EXISTS app.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_type app.organization_type NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    country_code CHAR(2),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    max_members INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    logo_url TEXT,
    primary_color VARCHAR(7),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_slug_format CHECK (slug IS NULL OR slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT chk_max_members CHECK (max_members IS NULL OR max_members > 0)
);

CREATE INDEX IF NOT EXISTS idx_organizations_type ON app.organizations(organization_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON app.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON app.organizations(is_active) WHERE deleted_at IS NULL;

SELECT 'PARTE 6: Tabla organizations creada' AS status;

-- ============================================================================
-- PARTE 7: TABLA USER_ROLES (ahora que organizations existe)
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/tables/user_roles.sql

CREATE TABLE IF NOT EXISTS app.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON app.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON app.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON app.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON app.user_roles(is_active);

SELECT 'PARTE 7: Tabla user_roles creada' AS status;

-- ============================================================================
-- PARTE 8: TABLA ORGANIZATION_MEMBERS
-- ============================================================================
-- Ubicación original: supabase/schemas/app/organizations/tables/organization_members.sql

CREATE TABLE IF NOT EXISTS app.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app.user_role NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    status app.membership_status DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invitation_token VARCHAR(100) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT org_members_unique UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON app.organization_members(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON app.organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON app.organization_members(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_status ON app.organization_members(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_invitation_token ON app.organization_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_composite ON app.organization_members(organization_id, user_id, status) WHERE deleted_at IS NULL;

SELECT 'PARTE 8: Tabla organization_members creada' AS status;

-- ============================================================================
-- PARTE 9: TABLA USER_RELATIONSHIPS
-- ============================================================================
-- Ubicación original: supabase/schemas/app/organizations/tables/user_relationships.sql

CREATE TABLE IF NOT EXISTS app.user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT relationships_unique UNIQUE (primary_user_id, related_user_id, relationship_type),
    CONSTRAINT relationships_not_self CHECK (primary_user_id != related_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rel_primary ON app.user_relationships(primary_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_related ON app.user_relationships(related_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_type ON app.user_relationships(relationship_type) WHERE deleted_at IS NULL;

SELECT 'PARTE 9: Tabla user_relationships creada' AS status;

-- ============================================================================
-- PARTE 10: FUNCIONES DE AUTH
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/functions/*.sql

-- Función: get_user_primary_role
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

-- Función: has_role
CREATE OR REPLACE FUNCTION app.has_role(p_user_id UUID, p_role app.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = p_role
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'PARTE 10: Funciones de auth creadas' AS status;

-- ============================================================================
-- PARTE 11: FUNCIONES DE ORGANIZATIONS
-- ============================================================================
-- Ubicación original: supabase/schemas/app/organizations/functions/*.sql

-- Función: is_org_admin
CREATE OR REPLACE FUNCTION app.is_org_admin(p_user_id UUID, p_organization_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app.organization_members
        WHERE user_id = p_user_id
          AND organization_id = p_organization_id
          AND role = 'school'
          AND status = 'active'
          AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: get_user_organizations
CREATE OR REPLACE FUNCTION app.get_user_organizations(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR,
    organization_type app.organization_type,
    user_role app.user_role,
    membership_status app.membership_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.organization_type, om.role, om.status
    FROM app.organizations o
    JOIN app.organization_members om ON o.id = om.organization_id
    WHERE om.user_id = p_user_id
      AND om.deleted_at IS NULL
      AND o.deleted_at IS NULL
    ORDER BY om.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'PARTE 11: Funciones de organizations creadas' AS status;

-- ============================================================================
-- PARTE 12: TRIGGERS
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/triggers/*.sql
--                    supabase/schemas/app/organizations/rls/*.sql (algunos triggers)

-- Triggers de updated_at
DROP TRIGGER IF EXISTS set_roles_updated_at ON app.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON app.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON app.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_org_members_updated_at ON app.organization_members;
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON app.organization_members
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_relationships_updated_at ON app.user_relationships;
CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON app.user_relationships
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

SELECT 'PARTE 12: Triggers creados' AS status;

-- ============================================================================
-- PARTE 13: TRIGGER HANDLE_NEW_USER
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/triggers/handle_new_user.sql

CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_oauth_provider app.oauth_provider;
BEGIN
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
    user_id, full_name, display_name, oauth_provider, oauth_provider_id,
    language_preference, last_login_at
  ) VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_oauth_provider,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET last_login_at = NOW();

  -- Asignar rol si se especificó en metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO app.user_roles (user_id, role_id, assigned_by)
    SELECT NEW.id, r.id, NEW.id
    FROM app.roles r
    WHERE r.name = (NEW.raw_user_meta_data->>'role')::app.user_role
    ON CONFLICT (user_id, role_id, organization_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app.handle_new_user();

SELECT 'PARTE 13: Trigger handle_new_user creado' AS status;

-- ============================================================================
-- PARTE 14: VISTAS
-- ============================================================================
-- Ubicación original: supabase/schemas/app/organizations/views/*.sql

CREATE OR REPLACE VIEW app.v_organization_active_members AS
SELECT
    om.organization_id, o.name AS organization_name, om.user_id,
    up.display_name, up.first_name, up.last_name,
    om.role, om.status, om.joined_at
FROM app.organization_members om
JOIN app.organizations o ON om.organization_id = o.id
LEFT JOIN app.user_profiles up ON om.user_id = up.user_id
WHERE om.status = 'active'
  AND om.deleted_at IS NULL
  AND o.deleted_at IS NULL;

CREATE OR REPLACE VIEW app.v_organization_stats AS
SELECT
    o.id, o.name, o.organization_type,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'active') AS active_members,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'pending') AS pending_members,
    o.max_members, o.created_at
FROM app.organizations o
LEFT JOIN app.organization_members om ON o.id = om.organization_id AND om.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;

SELECT 'PARTE 14: Vistas creadas' AS status;

-- ============================================================================
-- PARTE 15: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Ubicación original: supabase/schemas/app/auth/rls/*.sql
--                    supabase/schemas/app/organizations/rls/*.sql

-- RLS: roles
ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS: user_profiles
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_profile" ON app.user_profiles;
CREATE POLICY "users_view_own_profile" ON app.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_public_profile = true);

DROP POLICY IF EXISTS "users_update_own_profile" ON app.user_profiles;
CREATE POLICY "users_update_own_profile" ON app.user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON app.user_profiles;
CREATE POLICY "users_insert_own_profile" ON app.user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS: user_roles
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_roles" ON app.user_roles;
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RLS: organizations
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver organizaciones publicas" ON app.organizations;
CREATE POLICY "Usuarios pueden ver organizaciones publicas"
    ON app.organizations FOR SELECT
    USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Usuarios pueden ver sus organizaciones" ON app.organizations;
CREATE POLICY "Usuarios pueden ver sus organizaciones"
    ON app.organizations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM app.organization_members
            WHERE organization_id = id AND deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Creadores pueden actualizar sus organizaciones" ON app.organizations;
CREATE POLICY "Creadores pueden actualizar sus organizaciones"
    ON app.organizations FOR UPDATE
    USING (created_by = auth.uid());

-- RLS: organization_members
ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_org_members" ON app.organization_members;
CREATE POLICY "users_view_org_members" ON app.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM app.organization_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- RLS: user_relationships
ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_relationships" ON app.user_relationships;
CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT TO authenticated
  USING (primary_user_id = auth.uid() OR related_user_id = auth.uid());

SELECT 'PARTE 15: Políticas RLS creadas' AS status;

-- ============================================================================
-- PARTE 16: GRANTS FINALES
-- ============================================================================

-- Grants para tablas en app
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT INSERT, UPDATE ON app.user_profiles TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated, service_role;

SELECT 'PARTE 16: Grants finales aplicados' AS status;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

SELECT 'SETUP COMPLETADO' AS status;

-- Verificar tablas creadas
SELECT 'Tablas en app:' as info, count(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'app' AND table_type = 'BASE TABLE';

-- Ver roles creados
SELECT name as role_name, display_name, hierarchy_level
FROM app.roles ORDER BY hierarchy_level DESC;

-- ============================================================================
-- FIN DEL SCRIPT UNIFICADO - PARTE 1 (AUTH + ORGANIZATIONS)
-- ============================================================================
-- Este script contiene la estructura básica de autenticación y organizaciones
-- Para el resto de módulos, ejecutar los archivos restantes de SETUP_RAPIDO.sql
-- en el orden indicado, o crear partes adicionales de este script unificado
-- ============================================================================
