-- supabase/schemas/app/organizations/tables/user_relationships.sql
-- ============================================================================
-- TABLA: user_relationships
-- DESCRIPCIÓN: Relaciones entre usuarios (padre-hijo, maestro-estudiante)
-- ============================================================================

SET search_path TO app, public;

CREATE TABLE IF NOT EXISTS app.user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    related_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT relationships_unique UNIQUE (primary_user_id, related_user_id, relationship_type),
    CONSTRAINT relationships_not_self CHECK (primary_user_id != related_user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_rel_primary ON app.user_relationships(primary_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_related ON app.user_relationships(related_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_type ON app.user_relationships(relationship_type) WHERE deleted_at IS NULL;

COMMENT ON TABLE app.user_relationships IS 'Relaciones entre usuarios (padre-hijo, maestro-estudiante)';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_relationships_updated_at ON app.user_relationships;
CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON app.user_relationships
  FOR EACH ROW
  EXECUTE FUNCTION app.set_updated_at();

SELECT 'ORGANIZATIONS: Tabla user_relationships creada' AS status;
