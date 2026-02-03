-- supabase/schemas/app/permissions/enums/permission_type.sql
-- ============================================================================
-- ENUM: permission_type
-- DESCRIPCION: Tipo de permiso para acceso a rutas
-- ============================================================================

SET search_path TO app, public;

DO $$ BEGIN
  CREATE TYPE app.permission_type AS ENUM (
      'grant',   -- Permiso positivo (acceso permitido)
      'deny'     -- Permiso negativo (acceso denegado)
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE app.permission_type IS 'Tipo de permiso: grant (permitir) o deny (denegar)';

SELECT 'PERMISSIONS: Enum permission_type creado' AS status;
