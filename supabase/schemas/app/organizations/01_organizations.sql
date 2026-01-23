-- ============================================================================
-- MÓDULO: ORGANIZACIONES
-- DESCRIPCIÓN: Sistema de organizaciones, miembros y relaciones
-- VERSIÓN: 3.0
-- ============================================================================

SET search_path TO app, public;

-- ============================================================================
-- ENUMERACIONES
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE app.organization_type AS ENUM (
      'school',        -- Escuela/Colegio/Universidad
      'family',        -- Familia o hogar
      'group',         -- Grupo de estudio o lectura
      'library',       -- Biblioteca pública o privada
      'individual'     -- Usuario individual sin organización
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
COMMENT ON TYPE app.organization_type IS 'Tipos de organizaciones soportadas';

DO $$ BEGIN
  CREATE TYPE app.membership_status AS ENUM (
      'active',        -- Activo
      'inactive',      -- Inactivo
      'suspended',     -- Suspendido
      'pending'        -- Pendiente de aprobación
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
COMMENT ON TYPE app.membership_status IS 'Estados de membresía en una organización';

-- ============================================================================
-- TABLA: organizations
-- ============================================================================

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

COMMENT ON TABLE app.organizations IS 'Organizaciones: escuelas, familias, grupos';

-- ============================================================================
-- TABLA: organization_members
-- ============================================================================

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

COMMENT ON TABLE app.organization_members IS 'Miembros de organizaciones';

-- ============================================================================
-- TABLA: user_relationships
-- ============================================================================

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

COMMENT ON TABLE app.user_relationships IS 'Relaciones entre usuarios (padre-hijo, maestro-estudiante)';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_organizations_updated_at ON app.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_org_members_updated_at ON app.organization_members;
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON app.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_relationships_updated_at ON app.user_relationships;
CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON app.user_relationships
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================================================
-- FUNCIONES
-- ============================================================================

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

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver organizaciones públicas" ON app.organizations;
CREATE POLICY "Usuarios pueden ver organizaciones públicas"
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

DROP POLICY IF EXISTS "users_view_relationships" ON app.user_relationships;
CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT TO authenticated
  USING (primary_user_id = auth.uid() OR related_user_id = auth.uid());

-- ============================================================================
-- VISTAS
-- ============================================================================

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

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT 'Módulo ORGANIZATIONS instalado correctamente' AS status,
  (SELECT COUNT(*) FROM app.organizations) AS total_organizations,
  NOW() AS timestamp;
