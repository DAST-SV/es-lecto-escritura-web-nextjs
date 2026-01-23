-- ============================================================================
-- TABLA: organizations
-- DESCRIPCIÓN: Organizaciones (escuelas, familias, grupos)
-- ============================================================================

SET search_path TO app, public;

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_organizations_type ON app.organizations(organization_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON app.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON app.organizations(is_active) WHERE deleted_at IS NULL;

COMMENT ON TABLE app.organizations IS 'Organizaciones: escuelas, familias, grupos';

SELECT 'ORGANIZATIONS: Tabla organizations creada' AS status;
