-- =============================================
-- COMUNIDADES DE AUTORES (Estilo Patreon)
-- =============================================
-- Sistema de comunidades de pago por autor
-- Incluye: planes, membresías, beneficios
-- Preparado para integración con Stripe
-- =============================================

-- Tipo ENUM para estado de membresía
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'app')) THEN
        CREATE TYPE app.membership_status AS ENUM ('active', 'cancelled', 'expired', 'pending', 'paused');
    END IF;
END $$;

-- Tipo ENUM para período de facturación
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_period' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'app')) THEN
        CREATE TYPE app.billing_period AS ENUM ('monthly', 'quarterly', 'yearly', 'lifetime');
    END IF;
END $$;

-- Tabla de comunidades de autores
CREATE TABLE IF NOT EXISTS app.author_communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(300),
    slug VARCHAR(100) UNIQUE NOT NULL,
    cover_url TEXT,
    welcome_message TEXT, -- Mensaje de bienvenida para nuevos miembros
    -- Configuración
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE, -- Si requiere aprobación para unirse
    -- Estadísticas (actualizadas por triggers)
    total_members INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0, -- Ingresos totales históricos
    -- Stripe
    stripe_product_id VARCHAR(255),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para author_communities
CREATE INDEX IF NOT EXISTS idx_author_communities_author ON app.author_communities(author_id);
CREATE INDEX IF NOT EXISTS idx_author_communities_slug ON app.author_communities(slug);
CREATE INDEX IF NOT EXISTS idx_author_communities_active ON app.author_communities(is_active) WHERE is_active = TRUE;

-- Tabla de planes de comunidad
CREATE TABLE IF NOT EXISTS app.community_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app.author_communities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    -- Precio
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period app.billing_period DEFAULT 'monthly',
    -- Beneficios
    benefits JSONB DEFAULT '[]'::jsonb, -- ["Acceso a libros exclusivos", "Contenido anticipado", ...]
    -- Límites
    max_members INTEGER, -- NULL = sin límite
    -- Configuración
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE, -- Plan destacado/recomendado
    display_order SMALLINT DEFAULT 1,
    -- Stripe
    stripe_price_id VARCHAR(255),
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para community_plans
CREATE INDEX IF NOT EXISTS idx_community_plans_community ON app.community_plans(community_id);
CREATE INDEX IF NOT EXISTS idx_community_plans_active ON app.community_plans(is_active) WHERE is_active = TRUE;

-- Tabla de membresías
CREATE TABLE IF NOT EXISTS app.community_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app.author_communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES app.community_plans(id),
    -- Estado
    status app.membership_status DEFAULT 'pending',
    -- Fechas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    -- Pagos (Stripe)
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,
    -- Historial
    total_paid DECIMAL(10,2) DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_community_memberships UNIQUE(community_id, user_id)
);

-- Índices para community_memberships
CREATE INDEX IF NOT EXISTS idx_community_memberships_community ON app.community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON app.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_plan ON app.community_memberships(plan_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_status ON app.community_memberships(status);
CREATE INDEX IF NOT EXISTS idx_community_memberships_active ON app.community_memberships(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_community_memberships_expires ON app.community_memberships(expires_at) WHERE status = 'active';

-- Tabla de historial de pagos (para auditoría)
CREATE TABLE IF NOT EXISTS app.community_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES app.community_memberships(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    -- Estado
    status VARCHAR(50) DEFAULT 'succeeded', -- succeeded, failed, refunded
    failure_reason TEXT,
    -- Timestamps
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_membership ON app.community_payment_history(membership_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para actualizar contador de miembros
CREATE OR REPLACE FUNCTION app.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE app.author_communities
        SET total_members = total_members + 1, updated_at = NOW()
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Si cambió a activo
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE app.author_communities
            SET total_members = total_members + 1, updated_at = NOW()
            WHERE id = NEW.community_id;
        -- Si dejó de ser activo
        ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
            UPDATE app.author_communities
            SET total_members = GREATEST(0, total_members - 1), updated_at = NOW()
            WHERE id = NEW.community_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
        UPDATE app.author_communities
        SET total_members = GREATEST(0, total_members - 1), updated_at = NOW()
        WHERE id = OLD.community_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_member_count ON app.community_memberships;
CREATE TRIGGER trg_community_member_count
    AFTER INSERT OR UPDATE OR DELETE ON app.community_memberships
    FOR EACH ROW
    EXECUTE FUNCTION app.update_community_member_count();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION app.update_communities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_author_communities_updated_at ON app.author_communities;
CREATE TRIGGER trg_author_communities_updated_at
    BEFORE UPDATE ON app.author_communities
    FOR EACH ROW
    EXECUTE FUNCTION app.update_communities_updated_at();

DROP TRIGGER IF EXISTS trg_community_plans_updated_at ON app.community_plans;
CREATE TRIGGER trg_community_plans_updated_at
    BEFORE UPDATE ON app.community_plans
    FOR EACH ROW
    EXECUTE FUNCTION app.update_communities_updated_at();

DROP TRIGGER IF EXISTS trg_community_memberships_updated_at ON app.community_memberships;
CREATE TRIGGER trg_community_memberships_updated_at
    BEFORE UPDATE ON app.community_memberships
    FOR EACH ROW
    EXECUTE FUNCTION app.update_communities_updated_at();

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para verificar si un usuario es miembro activo de una comunidad
CREATE OR REPLACE FUNCTION app.is_community_member(
    p_community_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app.community_memberships
        WHERE community_id = p_community_id
        AND user_id = p_user_id
        AND status = 'active'
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener el nivel de acceso de un usuario a contenido de comunidad
CREATE OR REPLACE FUNCTION app.get_user_community_access(
    p_user_id UUID,
    p_author_id UUID
)
RETURNS TABLE (
    is_member BOOLEAN,
    plan_name VARCHAR,
    benefits JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE AS is_member,
        cp.name AS plan_name,
        cp.benefits
    FROM app.community_memberships cm
    JOIN app.author_communities ac ON ac.id = cm.community_id
    JOIN app.community_plans cp ON cp.id = cm.plan_id
    WHERE ac.author_id = p_author_id
    AND cm.user_id = p_user_id
    AND cm.status = 'active'
    AND (cm.expires_at IS NULL OR cm.expires_at > NOW())
    LIMIT 1;

    -- Si no encontró membresía activa, devolver valores por defecto
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::JSONB;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener comunidades de un usuario
CREATE OR REPLACE FUNCTION app.get_user_communities(
    p_user_id UUID
)
RETURNS TABLE (
    community_id UUID,
    community_name VARCHAR,
    community_slug VARCHAR,
    author_id UUID,
    author_username VARCHAR,
    plan_name VARCHAR,
    status app.membership_status,
    expires_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.id AS community_id,
        ac.name AS community_name,
        ac.slug AS community_slug,
        ac.author_id,
        ap.username AS author_username,
        cp.name AS plan_name,
        cm.status,
        cm.expires_at
    FROM app.community_memberships cm
    JOIN app.author_communities ac ON ac.id = cm.community_id
    JOIN app.author_profiles ap ON ap.user_id = ac.author_id
    JOIN app.community_plans cp ON cp.id = cm.plan_id
    WHERE cm.user_id = p_user_id
    ORDER BY cm.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios
COMMENT ON TABLE app.author_communities IS 'Comunidades de pago de autores (estilo Patreon)';
COMMENT ON COLUMN app.author_communities.slug IS 'Slug único para URL de la comunidad';
COMMENT ON COLUMN app.author_communities.stripe_product_id IS 'ID del producto en Stripe';

COMMENT ON TABLE app.community_plans IS 'Planes de suscripción de cada comunidad';
COMMENT ON COLUMN app.community_plans.benefits IS 'Array JSON de beneficios del plan';
COMMENT ON COLUMN app.community_plans.stripe_price_id IS 'ID del precio en Stripe';

COMMENT ON TABLE app.community_memberships IS 'Membresías de usuarios a comunidades';
COMMENT ON COLUMN app.community_memberships.stripe_subscription_id IS 'ID de la suscripción en Stripe';

COMMENT ON TABLE app.community_payment_history IS 'Historial de pagos para auditoría';
