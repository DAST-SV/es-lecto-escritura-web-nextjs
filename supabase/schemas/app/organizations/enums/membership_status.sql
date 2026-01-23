-- ============================================================================
-- ENUM: membership_status
-- DESCRIPCIÓN: Estados de membresía en una organización
-- ============================================================================

SET search_path TO app, public;

DO $$ BEGIN
  CREATE TYPE app.membership_status AS ENUM (
      'active',        -- Activo
      'inactive',      -- Inactivo
      'suspended',     -- Suspendido
      'pending'        -- Pendiente de aprobación
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE app.membership_status IS 'Estados de membresía en una organización';

SELECT 'ORGANIZATIONS: Enum membership_status creado' AS status;
