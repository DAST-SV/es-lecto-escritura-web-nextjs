-- supabase/schemas/app/auth/functions/set_updated_at.sql
-- ============================================================================
-- FUNCIÓN: set_updated_at
-- DESCRIPCIÓN: Actualiza automáticamente el campo updated_at
-- ============================================================================

SET search_path TO app, public;

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION app.set_updated_at IS 'Actualiza automáticamente el campo updated_at en tablas';

SELECT 'AUTH: Función set_updated_at creada' AS status;
