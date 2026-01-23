-- ============================================================================
-- RLS: organizations
-- DESCRIPCIÓN: Políticas de seguridad para tabla organizations
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;

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

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_organizations_updated_at ON app.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

SELECT 'ORGANIZATIONS: RLS policies para organizations creadas' AS status;
