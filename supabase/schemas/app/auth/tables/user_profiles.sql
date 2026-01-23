-- ============================================================================
-- TABLA: user_profiles
-- DESCRIPCIÓN: Perfiles extendidos de usuarios con soporte OAuth
-- ============================================================================

SET search_path TO app, public;

CREATE TABLE IF NOT EXISTS app.user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(150),
    full_name VARCHAR(200),
    date_of_birth DATE,
    gender VARCHAR(20),
    phone VARCHAR(50),
    country_code CHAR(2),
    state VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    language_preference VARCHAR(10) DEFAULT 'es',
    grade_level VARCHAR(50),
    school_name VARCHAR(200),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    is_public_profile BOOLEAN DEFAULT false,
    show_progress BOOLEAN DEFAULT false,
    allow_messages BOOLEAN DEFAULT true,
    oauth_provider app.oauth_provider,
    oauth_provider_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-()]+$')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON app.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON app.user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON app.user_profiles(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name_search ON app.user_profiles
    USING gin(to_tsvector('spanish', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

COMMENT ON TABLE app.user_profiles IS 'Perfiles extendidos de usuarios con soporte OAuth';

SELECT 'AUTH: Tabla user_profiles creada' AS status;
