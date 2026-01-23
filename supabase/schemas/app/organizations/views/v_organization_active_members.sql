-- ============================================================================
-- VISTA: v_organization_active_members
-- DESCRIPCIÓN: Miembros activos de organizaciones con información de perfil
-- ============================================================================

SET search_path TO app, public;

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

COMMENT ON VIEW app.v_organization_active_members IS 'Miembros activos de organizaciones con información de perfil';

SELECT 'ORGANIZATIONS: Vista v_organization_active_members creada' AS status;
