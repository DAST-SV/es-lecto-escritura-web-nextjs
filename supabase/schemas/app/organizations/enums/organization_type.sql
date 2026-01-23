-- ============================================================================
-- ENUM: organization_type
-- DESCRIPCIÓN: Tipos de organizaciones soportadas
-- ============================================================================

SET search_path TO app, public;

DO $$ BEGIN
  CREATE TYPE app.organization_type AS ENUM (
      'school',        -- Escuela/Colegio/Universidad
      'family',        -- Familia o hogar
      'group',         -- Grupo de estudio o lectura
      'library',       -- Biblioteca pública o privada
      'individual'     -- Usuario individual sin organización
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE app.organization_type IS 'Tipos de organizaciones soportadas';

SELECT 'ORGANIZATIONS: Enum organization_type creado' AS status;
