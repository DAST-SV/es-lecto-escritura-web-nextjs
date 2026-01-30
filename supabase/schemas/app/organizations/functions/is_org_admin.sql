-- supabase/schemas/app/organizations/functions/is_org_admin.sql
-- ============================================================================
-- FUNCIÓN: is_org_admin
-- DESCRIPCIÓN: Verifica si un usuario es administrador de una organización
-- ============================================================================

SET search_path TO app, public;

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

COMMENT ON FUNCTION app.is_org_admin IS 'Verifica si un usuario es administrador de una organización';

SELECT 'ORGANIZATIONS: Función is_org_admin creada' AS status;
