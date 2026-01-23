-- ============================================================================
-- RLS: roles
-- DESCRIPCIÓN: Políticas de seguridad para tabla roles
-- ============================================================================

SET search_path TO app, public;

ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT TO authenticated USING (is_active = true);

SELECT 'AUTH: RLS policies para roles creadas' AS status;
