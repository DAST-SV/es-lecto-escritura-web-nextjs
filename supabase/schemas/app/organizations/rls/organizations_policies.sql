-- supabase/schemas/app/organizations/rls/organizations_policies.sql
-- ============================================================================
-- RLS: organizations
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

-- ============================================
-- GRANTS
-- ============================================

-- Lectura pública (anon)
GRANT SELECT ON app.organizations TO anon;

-- Lectura para usuarios autenticados
GRANT SELECT ON app.organizations TO authenticated;

-- Gestión para usuarios autenticados
GRANT INSERT, UPDATE, DELETE ON app.organizations TO authenticated;

SELECT 'ORGANIZATIONS: RLS policies y GRANTs para organizations creados' AS status;
