-- ============================================
-- SCRIPT 12: ACTUALIZAR POLÍTICAS RLS
-- ============================================
-- Reemplaza las políticas temporales con las restrictivas finales
-- ⚠️ Ejecutar DESPUÉS del script 11 (asignar super_admin)
-- ============================================

-- ============================================
-- TABLA: app.roles
-- ============================================

-- Eliminar política temporal
DROP POLICY IF EXISTS "roles_modify_policy" ON app.roles;

-- INSERT: Solo super_admin
CREATE POLICY "roles_insert_policy" ON app.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- UPDATE: Solo super_admin (excepto system_roles)
CREATE POLICY "roles_update_policy" ON app.roles
  FOR UPDATE
  TO authenticated
  USING (
    NOT is_system_role
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- DELETE: Solo super_admin
CREATE POLICY "roles_delete_policy" ON app.roles
  FOR DELETE
  TO authenticated
  USING (
    NOT is_system_role
    AND EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- TABLA: app.routes
-- ============================================

-- Eliminar política temporal
DROP POLICY IF EXISTS "routes_modify_policy" ON app.routes;

-- INSERT: Solo super_admin
CREATE POLICY "routes_insert_policy" ON app.routes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- UPDATE: Solo super_admin
CREATE POLICY "routes_update_policy" ON app.routes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- DELETE: Solo super_admin
CREATE POLICY "routes_delete_policy" ON app.routes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- TABLA: app.route_translations
-- ============================================

-- Eliminar política temporal
DROP POLICY IF EXISTS "route_translations_modify_policy" ON app.route_translations;

-- INSERT: Solo super_admin
CREATE POLICY "route_translations_insert_policy" ON app.route_translations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- UPDATE: Solo super_admin
CREATE POLICY "route_translations_update_policy" ON app.route_translations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- DELETE: Solo super_admin
CREATE POLICY "route_translations_delete_policy" ON app.route_translations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app.user_roles ur
      JOIN app.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid()
        AND r.name = 'super_admin'
        AND ur.is_active = true
        AND ur.revoked_at IS NULL
    )
  );

-- ============================================
-- VERIFICAR
-- ============================================

-- Ver todas las políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'app'
ORDER BY tablename, policyname;

-- Intentar crear una ruta (debe funcionar si eres super_admin)
-- INSERT INTO app.routes (pathname, display_name) VALUES ('/test', 'Test');

-- ============================================
-- ✅ LISTO
-- ============================================
-- Ahora solo super_admin puede modificar:
-- - roles
-- - routes
-- - route_translations
-- - user_roles
-- - route_permissions
-- - user_route_permissions
-- - role_language_access
-- ============================================
