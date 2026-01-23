-- ============================================================================
-- ENUM: oauth_provider
-- DESCRIPCIÓN: Proveedores de autenticación OAuth soportados
-- ============================================================================

SET search_path TO app, public;

DO $$ BEGIN
  CREATE TYPE app.oauth_provider AS ENUM (
      'google',
      'apple',
      'facebook',
      'azure',
      'github'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE app.oauth_provider IS 'Proveedores de autenticación OAuth soportados';

SELECT 'AUTH: Enum oauth_provider creado' AS status;
