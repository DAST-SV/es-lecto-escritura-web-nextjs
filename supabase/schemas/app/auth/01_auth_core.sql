-- ============================================================================
-- MÓDULO: AUTENTICACIÓN CORE
-- DESCRIPCIÓN: Sistema completo de autenticación con roles y OAuth
-- VERSIÓN: 3.0
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

-- ============================================================================
-- EXTENSIONES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMERACIONES
-- ============================================================================

-- Roles del sistema (alineados con frontend)
DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM (
      'super_admin',   -- Administrador de la plataforma
      'school',        -- Administrador de escuela
      'teacher',       -- Docente/Instructor
      'parent',        -- Padre/Madre/Tutor
      'student',       -- Estudiante
      'individual'     -- Usuario individual
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
COMMENT ON TYPE app.user_role IS 'Roles disponibles en el sistema';

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
COMMENT ON TYPE app.oauth_provider IS 'Proveedores de autenticación OAuth soportados';

-- ============================================================================
-- TABLA: roles (Catálogo de roles)
-- ============================================================================

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

COMMENT ON TABLE app.roles IS 'Catálogo de roles del sistema';

-- ============================================================================
-- TABLA: user_profiles (Perfiles extendidos)
-- ============================================================================

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

COMMENT ON TABLE app.user_profiles IS 'Perfiles extendidos de usuarios con soporte OAuth';

-- ============================================================================
-- TABLA: user_roles (Asignación de roles a usuarios)
-- ============================================================================

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

COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios';

-- ============================================================================
-- TRIGGERS updated_at
-- ============================================================================

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

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON app.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================================================
-- TRIGGER: Crear perfil automáticamente al registrar usuario
-- ============================================================================

CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_oauth_provider app.oauth_provider;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF NEW.app_metadata->>'provider' IS NOT NULL THEN
    BEGIN
      v_oauth_provider := (NEW.app_metadata->>'provider')::app.oauth_provider;
    EXCEPTION WHEN OTHERS THEN
      v_oauth_provider := NULL;
    END;
  END IF;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION app.handle_new_user();

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

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

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT TO authenticated USING (is_active = true);

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

DROP POLICY IF EXISTS "users_view_own_roles" ON app.user_roles;
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

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
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA app TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Módulo AUTH instalado correctamente' AS status,
  (SELECT COUNT(*) FROM app.roles) AS total_roles,
  NOW() AS timestamp;
