-- supabase/schemas/app/organizations/views/v_organization_stats.sql
-- ============================================================================
-- VISTA: v_organization_stats
-- DESCRIPCIÓN: Estadísticas de organizaciones (miembros activos, pendientes)
-- ============================================================================

SET search_path TO app, public;

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

COMMENT ON VIEW app.v_organization_stats IS 'Estadísticas de organizaciones';

SELECT 'ORGANIZATIONS: Vista v_organization_stats creada' AS status;
