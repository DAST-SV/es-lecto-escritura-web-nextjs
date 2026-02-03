-- supabase/schemas/app/permissions/data.sql
-- ============================================
-- DATOS INICIALES: route_permissions
-- ============================================
-- Roles válidos (app.user_role): super_admin, school, teacher, parent, student, individual

-- super_admin: TODAS las rutas
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'super_admin'::app.user_role, r.id, NULL
FROM app.routes r
WHERE r.deleted_at IS NULL
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- school (administrador escolar)
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'school', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress', '/admin')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- teacher
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'teacher'::app.user_role, r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- parent
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'parent'::app.user_role, r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- student
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'student'::app.user_role, r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- individual (usuario individual)
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'individual', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- parent (padre/madre)
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'parent', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;
