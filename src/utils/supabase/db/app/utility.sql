-- DO $$
-- DECLARE
--     r RECORD;
-- BEGIN
--     FOR r IN
--         SELECT table_name
--         FROM information_schema.tables
--         WHERE table_schema = 'app'
--     LOOP
--         EXECUTE format('
--             ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY;
--             CREATE POLICY "Full access for service role"
--             ON app.%I
--             FOR ALL
--             USING (auth.role() = ''service_role'');',
--             r.table_name, r.table_name);
--     END LOOP;
-- END $$;


-- -- 1. habilitar uso del esquema 'app' para los roles que necesiten acceder
-- GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

-- -- 2. dar permiso de SELECT sobre todas las tablas dentro de app
-- GRANT SELECT ON ALL TABLES IN SCHEMA app TO anon, authenticated, service_role;

-- -- 3. si hay secuencias (por ej. IDs automáticos), dar permisos sobre secuencias
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated, service_role;

-- -- 4. (Opcional) para objetos futuros que se creen, para que los permisos se apliquen por defecto
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
--   GRANT SELECT ON TABLES TO anon, authenticated, service_role;
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
--   GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- ========================================
-- 1️⃣ Permitir uso del esquema 'app'
-- ========================================
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

-- ========================================
-- 2️⃣ Permisos de lectura (SELECT) a todos
-- ========================================
GRANT SELECT ON ALL TABLES IN SCHEMA app TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated, service_role;

-- ========================================
-- 3️⃣ Permisos de escritura solo a usuarios autenticados y service_role
-- ========================================
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO authenticated, service_role;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA app TO authenticated, service_role;

-- ========================================
-- 4️⃣ Aplicar permisos por defecto a tablas futuras
-- ========================================
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
  GRANT SELECT ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
  GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA app
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO authenticated, service_role;

