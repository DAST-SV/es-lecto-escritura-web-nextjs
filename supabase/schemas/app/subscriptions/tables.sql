-- =============================================
-- SUSCRIPCIONES DE PLATAFORMA
-- =============================================
-- Sistema de suscripciones globales a la plataforma
-- Planes: free, basic, premium, unlimited
-- Preparado para integración con Stripe
-- =============================================

-- Tipo ENUM para planes de suscripción
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'app')) THEN
        CREATE TYPE app.subscription_plan AS ENUM ('free', 'basic', 'premium', 'unlimited');
    END IF;
END $$;

-- Tipo ENUM para estado de suscripción
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'app')) THEN
        CREATE TYPE app.subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'past_due');
    END IF;
END $$;

-- Tabla de definición de planes (configuración)
CREATE TABLE IF NOT EXISTS app.subscription_plan_definitions (
    plan app.subscription_plan PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    -- Precios
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    -- Límites y características
    features JSONB DEFAULT '[]'::jsonb, -- ["Acceso a libros públicos", "Sin anuncios", ...]
    max_books_per_month INTEGER, -- NULL = ilimitado
    max_downloads_per_month INTEGER,
    can_access_premium_books BOOLEAN DEFAULT FALSE,
    can_download_offline BOOLEAN DEFAULT FALSE,
    can_create_books BOOLEAN DEFAULT FALSE,
    max_created_books INTEGER DEFAULT 0,
    ads_enabled BOOLEAN DEFAULT TRUE,
    -- Stripe
    stripe_product_id VARCHAR(255),
    stripe_price_monthly_id VARCHAR(255),
    stripe_price_yearly_id VARCHAR(255),
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    display_order SMALLINT DEFAULT 1,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS app.platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan app.subscription_plan NOT NULL DEFAULT 'free',
    status app.subscription_status DEFAULT 'active',
    -- Fechas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    -- Facturación
    billing_period VARCHAR(20) DEFAULT 'monthly', -- monthly, yearly
    -- Stripe
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,
    -- Historial
    total_paid DECIMAL(12,2) DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_user ON app.platform_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_plan ON app.platform_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_status ON app.platform_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_active ON app.platform_subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_expires ON app.platform_subscriptions(expires_at);

-- Tabla de historial de pagos
CREATE TABLE IF NOT EXISTS app.subscription_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES app.platform_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    plan app.subscription_plan NOT NULL,
    billing_period VARCHAR(20),
    -- Stripe
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    -- Estado
    status VARCHAR(50) DEFAULT 'succeeded', -- succeeded, failed, refunded, pending
    failure_reason TEXT,
    -- Timestamps
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payment_history_subscription ON app.subscription_payment_history(subscription_id);

-- =============================================
-- DATOS INICIALES DE PLANES
-- =============================================

INSERT INTO app.subscription_plan_definitions (plan, name, description, price_monthly, price_yearly, features, can_access_premium_books, can_download_offline, can_create_books, max_created_books, ads_enabled, display_order) VALUES
('free', 'Gratuito', 'Acceso básico a la plataforma', 0, 0,
 '["Acceso a libros públicos", "Lectura en línea", "Progreso de lectura"]'::jsonb,
 FALSE, FALSE, FALSE, 0, TRUE, 1),

('basic', 'Básico', 'Para lectores regulares', 4.99, 49.99,
 '["Todo lo del plan gratuito", "Sin publicidad", "Acceso a libros premium", "Historial de lectura ilimitado"]'::jsonb,
 TRUE, FALSE, FALSE, 0, FALSE, 2),

('premium', 'Premium', 'Para lectores ávidos', 9.99, 99.99,
 '["Todo lo del plan básico", "Descarga offline", "Lectura guiada con audio", "Contenido exclusivo", "Crear hasta 5 libros"]'::jsonb,
 TRUE, TRUE, TRUE, 5, FALSE, 3),

('unlimited', 'Ilimitado', 'Para creadores y familias', 19.99, 199.99,
 '["Todo lo del plan premium", "Libros ilimitados", "Crear libros ilimitados", "Acceso a todas las comunidades", "Soporte prioritario"]'::jsonb,
 TRUE, TRUE, TRUE, -1, FALSE, 4)
ON CONFLICT (plan) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features,
    can_access_premium_books = EXCLUDED.can_access_premium_books,
    can_download_offline = EXCLUDED.can_download_offline,
    can_create_books = EXCLUDED.can_create_books,
    max_created_books = EXCLUDED.max_created_books,
    ads_enabled = EXCLUDED.ads_enabled,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION app.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_platform_subscriptions_updated_at ON app.platform_subscriptions;
CREATE TRIGGER trg_platform_subscriptions_updated_at
    BEFORE UPDATE ON app.platform_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION app.update_subscriptions_updated_at();

DROP TRIGGER IF EXISTS trg_subscription_plan_definitions_updated_at ON app.subscription_plan_definitions;
CREATE TRIGGER trg_subscription_plan_definitions_updated_at
    BEFORE UPDATE ON app.subscription_plan_definitions
    FOR EACH ROW
    EXECUTE FUNCTION app.update_subscriptions_updated_at();

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para obtener el plan de un usuario
CREATE OR REPLACE FUNCTION app.get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    plan app.subscription_plan,
    status app.subscription_status,
    expires_at TIMESTAMPTZ,
    can_access_premium_books BOOLEAN,
    can_download_offline BOOLEAN,
    can_create_books BOOLEAN,
    max_created_books INTEGER,
    ads_enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(ps.plan, 'free'::app.subscription_plan) AS plan,
        COALESCE(ps.status, 'active'::app.subscription_status) AS status,
        ps.expires_at,
        COALESCE(spd.can_access_premium_books, FALSE),
        COALESCE(spd.can_download_offline, FALSE),
        COALESCE(spd.can_create_books, FALSE),
        COALESCE(spd.max_created_books, 0),
        COALESCE(spd.ads_enabled, TRUE)
    FROM app.subscription_plan_definitions spd
    LEFT JOIN app.platform_subscriptions ps
        ON ps.plan = spd.plan AND ps.user_id = p_user_id
    WHERE spd.plan = COALESCE(ps.plan, 'free'::app.subscription_plan);

    -- Si no tiene suscripción, devolver plan free
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT
            'free'::app.subscription_plan,
            'active'::app.subscription_status,
            NULL::TIMESTAMPTZ,
            FALSE,
            FALSE,
            FALSE,
            0,
            TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para verificar si un usuario puede acceder a contenido premium
CREATE OR REPLACE FUNCTION app.can_access_premium_content(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_access BOOLEAN;
BEGIN
    SELECT
        COALESCE(spd.can_access_premium_books, FALSE)
    INTO v_can_access
    FROM app.platform_subscriptions ps
    JOIN app.subscription_plan_definitions spd ON spd.plan = ps.plan
    WHERE ps.user_id = p_user_id
    AND ps.status = 'active'
    AND (ps.expires_at IS NULL OR ps.expires_at > NOW());

    RETURN COALESCE(v_can_access, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener planes disponibles con traducciones
CREATE OR REPLACE FUNCTION app.get_subscription_plans()
RETURNS TABLE (
    plan app.subscription_plan,
    name VARCHAR,
    description TEXT,
    price_monthly DECIMAL,
    price_yearly DECIMAL,
    currency VARCHAR,
    features JSONB,
    can_access_premium_books BOOLEAN,
    can_download_offline BOOLEAN,
    can_create_books BOOLEAN,
    display_order SMALLINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        spd.plan,
        spd.name,
        spd.description,
        spd.price_monthly,
        spd.price_yearly,
        spd.currency,
        spd.features,
        spd.can_access_premium_books,
        spd.can_download_offline,
        spd.can_create_books,
        spd.display_order
    FROM app.subscription_plan_definitions spd
    WHERE spd.is_active = TRUE
    ORDER BY spd.display_order;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios
COMMENT ON TABLE app.subscription_plan_definitions IS 'Definición de planes de suscripción de la plataforma';
COMMENT ON TABLE app.platform_subscriptions IS 'Suscripciones activas de usuarios a la plataforma';
COMMENT ON TABLE app.subscription_payment_history IS 'Historial de pagos de suscripciones';
COMMENT ON COLUMN app.subscription_plan_definitions.max_created_books IS 'Límite de libros que puede crear (-1 = ilimitado)';
