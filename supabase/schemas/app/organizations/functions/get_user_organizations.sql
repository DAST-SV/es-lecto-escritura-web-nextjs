-- ============================================================================
-- FUNCIÓN: get_user_organizations
-- DESCRIPCIÓN: Obtiene todas las organizaciones de un usuario
-- ============================================================================

SET search_path TO app, public;

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

COMMENT ON FUNCTION app.get_user_organizations IS 'Obtiene todas las organizaciones de un usuario';

SELECT 'ORGANIZATIONS: Función get_user_organizations creada' AS status;
