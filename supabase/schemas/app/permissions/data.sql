-- ============================================
-- DATOS INICIALES: route_permissions
-- Archivo: permissions/data.sql
-- ============================================

-- super_admin: TODAS las rutas
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'super_admin', r.id, NULL
FROM app.routes r
WHERE r.deleted_at IS NULL
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- admin
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'admin', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress', '/admin')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- teacher
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'teacher', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- student
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'student', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/', '/library', '/my-world', '/my-progress')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;

-- guest
INSERT INTO app.route_permissions (role_name, route_id, language_code)
SELECT 'guest', r.id, NULL
FROM app.routes r
WHERE r.pathname IN ('/')
ON CONFLICT (role_name, route_id, language_code) DO NOTHING;
