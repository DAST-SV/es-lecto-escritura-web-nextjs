-- ============================================================================
-- TABLA: user_roles
-- DESCRIPCIÓN: Asignación de roles a usuarios
-- ============================================================================

SET search_path TO app, public;

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

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON app.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON app.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON app.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON app.user_roles(is_active);

COMMENT ON TABLE app.user_roles IS 'Asignación de roles a usuarios';

SELECT 'AUTH: Tabla user_roles creada' AS status;
