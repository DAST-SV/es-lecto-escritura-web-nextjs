-- ============================================================================
-- ESQUEMA: app
-- MÓDULO: Sistema de Gestión de Usuarios y Organizaciones
-- DESCRIPCIÓN: Sistema flexible para instituciones educativas, familias y grupos
-- VERSIÓN: 2.0
-- ARQUITECTURA: Clean Architecture + Multi-tenancy
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS app;

-- Establecer search_path
SET search_path TO app, public;

-- ============================================================================
-- ENUMERACIONES (ENUMS)
-- ============================================================================

-- Tipo de organización
CREATE TYPE app.organization_type AS ENUM (
    'educational_institution',  -- Institución educativa (escuela, colegio, universidad)
    'family',                   -- Familia o hogar
    'group',                    -- Grupo de estudio o lectura
    'couple',                   -- Pareja
    'individual',               -- Usuario individual sin organización
    'library',                  -- Biblioteca pública o privada
    'community_center'          -- Centro comunitario
);
COMMENT ON TYPE app.organization_type IS 'Tipos de organizaciones soportadas por la plataforma';

-- Tipo de usuario/rol
CREATE TYPE app.user_role AS ENUM (
    'super_admin',      -- Administrador de la plataforma
    'org_admin',        -- Administrador de organización
    'teacher',          -- Docente/Instructor
    'parent',           -- Padre/Madre/Tutor
    'student',          -- Estudiante
    'reader',           -- Lector independiente
    'librarian',        -- Bibliotecario
    'coordinator'       -- Coordinador/Facilitador
);
COMMENT ON TYPE app.user_role IS 'Roles disponibles en el sistema';

-- Estado de membresía
CREATE TYPE app.membership_status AS ENUM (
    'active',           -- Activo
    'inactive',         -- Inactivo
    'suspended',        -- Suspendido
    'pending',          -- Pendiente de aprobación
    'expired'           -- Expirado
);
COMMENT ON TYPE app.membership_status IS 'Estados posibles de membresía en una organización';

-- ============================================================================
-- TABLA: organizations
-- Organizaciones (instituciones, familias, grupos)
-- ============================================================================
CREATE TABLE app.organizations (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_type app.organization_type NOT NULL,
    
    -- Información básica
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
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
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Configuración
    max_members INTEGER,
    settings JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7),
    
    -- Auditoría
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_slug_format CHECK (slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT chk_max_members CHECK (max_members IS NULL OR max_members > 0)
);

-- Índices
CREATE INDEX idx_organizations_type ON app.organizations(organization_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_slug ON app.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_organizations_created_by ON app.organizations(created_by);
CREATE INDEX idx_organizations_is_active ON app.organizations(is_active) WHERE deleted_at IS NULL;

-- Comentarios
COMMENT ON TABLE app.organizations IS 'Catálogo de organizaciones: instituciones educativas, familias, grupos de lectura, etc.';
COMMENT ON COLUMN app.organizations.id IS 'Identificador único de la organización';
COMMENT ON COLUMN app.organizations.organization_type IS 'Tipo de organización (institución, familia, grupo, etc.)';
COMMENT ON COLUMN app.organizations.name IS 'Nombre completo de la organización';
COMMENT ON COLUMN app.organizations.slug IS 'Identificador amigable para URLs (único)';
COMMENT ON COLUMN app.organizations.max_members IS 'Límite máximo de miembros (NULL = ilimitado)';
COMMENT ON COLUMN app.organizations.settings IS 'Configuraciones personalizadas en formato JSON';
COMMENT ON COLUMN app.organizations.is_verified IS 'Indica si la organización ha sido verificada por un administrador';

-- ============================================================================
-- TABLA: organization_members
-- Miembros de organizaciones (relación muchos a muchos)
-- ============================================================================
CREATE TABLE app.organization_members (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rol y permisos
    role app.user_role NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    
    -- Estado
    status app.membership_status DEFAULT 'pending',
    
    -- Metadata
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invitation_token VARCHAR(100) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE (organization_id, user_id, deleted_at)
);

-- Índices
CREATE INDEX idx_org_members_org_id ON app.organization_members(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_user_id ON app.organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_role ON app.organization_members(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_status ON app.organization_members(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_members_invitation_token ON app.organization_members(invitation_token) WHERE invitation_token IS NOT NULL;

-- Comentarios
COMMENT ON TABLE app.organization_members IS 'Relación muchos a muchos entre usuarios y organizaciones con roles específicos';
COMMENT ON COLUMN app.organization_members.role IS 'Rol del usuario dentro de la organización';
COMMENT ON COLUMN app.organization_members.permissions IS 'Permisos específicos adicionales en formato JSON';
COMMENT ON COLUMN app.organization_members.status IS 'Estado actual de la membresía';
COMMENT ON COLUMN app.organization_members.invitation_token IS 'Token único para invitaciones pendientes';

-- ============================================================================
-- TABLA: user_profiles
-- Perfiles extendidos de usuarios
-- ============================================================================
CREATE TABLE app.user_profiles (
    -- Identificación
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información personal
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Contacto
    phone VARCHAR(50),
    
    -- Ubicación
    country_code CHAR(2),
    state VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language_code CHAR(2) DEFAULT 'es',  -- ISO 639-1
    
    -- Educación
    grade_level VARCHAR(50),
    school_name VARCHAR(200),
    
    -- Preferencias
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Configuración de privacidad
    is_public_profile BOOLEAN DEFAULT false,
    show_progress BOOLEAN DEFAULT false,
    allow_messages BOOLEAN DEFAULT true,
    
    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-()]+$')
);

-- Índices
CREATE INDEX idx_user_profiles_display_name ON app.user_profiles(display_name);
CREATE INDEX idx_user_profiles_country ON app.user_profiles(country_code);

-- Comentarios
COMMENT ON TABLE app.user_profiles IS 'Información extendida del perfil de usuario';
COMMENT ON COLUMN app.user_profiles.display_name IS 'Nombre público para mostrar en la plataforma';
COMMENT ON COLUMN app.user_profiles.date_of_birth IS 'Fecha de nacimiento (para verificar edad y contenido apropiado)';
COMMENT ON COLUMN app.user_profiles.preferences IS 'Preferencias personalizadas del usuario en formato JSON';

-- ============================================================================
-- TABLA: user_relationships
-- Relaciones entre usuarios (tutor-estudiante, padre-hijo, etc.)
-- ============================================================================
CREATE TABLE app.user_relationships (
    -- Identificación
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo de relación
    relationship_type VARCHAR(50) NOT NULL,  -- 'parent', 'guardian', 'tutor', 'sibling', 'mentor'
    
    -- Metadata
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    
    -- Auditoría
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE (primary_user_id, related_user_id, relationship_type, deleted_at),
    CONSTRAINT chk_different_users CHECK (primary_user_id <> related_user_id)
);

-- Índices
CREATE INDEX idx_user_rel_primary ON app.user_relationships(primary_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_rel_related ON app.user_relationships(related_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_rel_type ON app.user_relationships(relationship_type) WHERE deleted_at IS NULL;

-- Comentarios
COMMENT ON TABLE app.user_relationships IS 'Relaciones entre usuarios (padre-hijo, tutor-estudiante, etc.)';
COMMENT ON COLUMN app.user_relationships.relationship_type IS 'Tipo de relación: parent, guardian, tutor, sibling, mentor, etc.';
COMMENT ON COLUMN app.user_relationships.is_verified IS 'Indica si la relación ha sido verificada (importante para menores)';

-- ============================================================================
-- TABLA: user_types (LEGACY - Mantener compatibilidad)
-- ============================================================================
CREATE TABLE app.user_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentarios
COMMENT ON TABLE app.user_types IS 'Tabla legacy de tipos de usuario (mantener para compatibilidad)';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at en organizations
CREATE OR REPLACE FUNCTION app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON app.organizations
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER trigger_org_members_updated_at
    BEFORE UPDATE ON app.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON app.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

CREATE TRIGGER trigger_user_relationships_updated_at
    BEFORE UPDATE ON app.user_relationships
    FOR EACH ROW
    EXECUTE FUNCTION app.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;

-- Políticas para organizations
CREATE POLICY "Usuarios pueden ver organizaciones públicas"
    ON app.organizations FOR SELECT
    USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Usuarios pueden ver sus organizaciones"
    ON app.organizations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM app.organization_members 
            WHERE organization_id = id AND deleted_at IS NULL
        )
    );

CREATE POLICY "Creadores pueden actualizar sus organizaciones"
    ON app.organizations FOR UPDATE
    USING (created_by = auth.uid());

-- Políticas para organization_members
CREATE POLICY "Usuarios pueden ver miembros de sus organizaciones"
    ON app.organization_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT organization_id FROM app.organization_members 
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
    );

-- Políticas para user_profiles
CREATE POLICY "Usuarios pueden ver perfiles públicos"
    ON app.user_profiles FOR SELECT
    USING (is_public_profile = true);

CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON app.user_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON app.user_profiles FOR UPDATE
    USING (user_id = auth.uid());

-- Políticas para user_relationships
CREATE POLICY "Usuarios pueden ver sus relaciones"
    ON app.user_relationships FOR SELECT
    USING (
        primary_user_id = auth.uid() OR 
        related_user_id = auth.uid()
    );

-- ============================================================================
-- DATOS INICIALES (SEED DATA)
-- ============================================================================

-- Insertar tipos de usuario legacy (compatibilidad)
INSERT INTO app.user_types (name, description) VALUES
    ('Estudiante', 'Usuario que accede para aprender y mejorar lectoescritura'),
    ('Docente', 'Profesional educativo que guía y supervisa el progreso'),
    ('Padre/Tutor', 'Responsable que supervisa el progreso de menores'),
    ('Lector', 'Usuario independiente que utiliza la plataforma libremente'),
    ('Administrador', 'Usuario con permisos administrativos completos')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista: Miembros activos por organización
CREATE OR REPLACE VIEW app.v_organization_active_members AS
SELECT 
    om.organization_id,
    o.name AS organization_name,
    om.user_id,
    up.display_name,
    up.first_name,
    up.last_name,
    om.role,
    om.status,
    om.joined_at
FROM app.organization_members om
JOIN app.organizations o ON om.organization_id = o.id
LEFT JOIN app.user_profiles up ON om.user_id = up.user_id
WHERE om.status = 'active' 
  AND om.deleted_at IS NULL 
  AND o.deleted_at IS NULL;

COMMENT ON VIEW app.v_organization_active_members IS 'Vista de miembros activos por organización';

-- Vista: Estadísticas de organizaciones
CREATE OR REPLACE VIEW app.v_organization_stats AS
SELECT 
    o.id,
    o.name,
    o.organization_type,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'active') AS active_members,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'pending') AS pending_members,
    o.max_members,
    o.created_at
FROM app.organizations o
LEFT JOIN app.organization_members om ON o.id = om.organization_id 
    AND om.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;

COMMENT ON VIEW app.v_organization_stats IS 'Estadísticas agregadas por organización';

-- ============================================================================
-- FUNCIONES ÚTILES
-- ============================================================================

-- Función: Verificar si un usuario es administrador de una organización
CREATE OR REPLACE FUNCTION app.is_org_admin(
    p_user_id UUID,
    p_organization_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM app.organization_members
        WHERE user_id = p_user_id
          AND organization_id = p_organization_id
          AND role = 'org_admin'
          AND status = 'active'
          AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION app.is_org_admin IS 'Verifica si un usuario es administrador de una organización';

-- Función: Obtener organizaciones de un usuario
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
    SELECT 
        o.id,
        o.name,
        o.organization_type,
        om.role,
        om.status
    FROM app.organizations o
    JOIN app.organization_members om ON o.id = om.organization_id
    WHERE om.user_id = p_user_id
      AND om.deleted_at IS NULL
      AND o.deleted_at IS NULL
    ORDER BY om.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION app.get_user_organizations IS 'Obtiene todas las organizaciones de un usuario';

-- ============================================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX idx_org_members_composite ON app.organization_members(organization_id, user_id, status) 
    WHERE deleted_at IS NULL;

CREATE INDEX idx_user_profiles_name_search ON app.user_profiles 
    USING gin(to_tsvector('spanish', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

-- ============================================================================
-- GRANTS (Permisos)
-- ============================================================================

-- Permisos para usuarios autenticados
GRANT USAGE ON SCHEMA app TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated;

-- Permisos para service role
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO service_role;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================

-- Verificar creación exitosa
SELECT 
    'organizations' AS table_name, COUNT(*) AS count FROM app.organizations
UNION ALL
SELECT 'organization_members', COUNT(*) FROM app.organization_members
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM app.user_profiles
UNION ALL
SELECT 'user_relationships', COUNT(*) FROM app.user_relationships
UNION ALL
SELECT 'user_types', COUNT(*) FROM app.user_types;