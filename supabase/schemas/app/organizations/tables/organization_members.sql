-- supabase/schemas/app/organizations/tables/organization_members.sql
-- ============================================================================
-- TABLA: organization_members
-- DESCRIPCIÓN: Miembros de organizaciones
-- ============================================================================

SET search_path TO app, public;

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_org_members_org ON app.organization_members(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON app.organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON app.organization_members(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_status ON app.organization_members(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_invitation_token ON app.organization_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_composite ON app.organization_members(organization_id, user_id, status) WHERE deleted_at IS NULL;

COMMENT ON TABLE app.organization_members IS 'Miembros de organizaciones';

-- Trigger para updated_at
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON app.organization_members
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

SELECT 'ORGANIZATIONS: Tabla organization_members creada' AS status;
