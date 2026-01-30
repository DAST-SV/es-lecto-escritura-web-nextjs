-- ============================================================================
-- SETUP UNIFICADO COMPLETO - ES LECTO ESCRITURA
-- ============================================================================
-- Ubicacion: supabase/SETUP_UNIFICADO.sql
--
-- Este script crea toda la estructura de la base de datos en un solo archivo
-- con el ORDEN CORRECTO de dependencias para evitar errores de FK
--
-- EJECUTAR DESPUES DE: CLEANUP_COMPLETO.sql
-- ============================================================================

-- ============================================================================
-- PARTE 1: SCHEMAS Y EXTENSIONES
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS books;

SET search_path TO app, public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grants iniciales
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA books TO anon, authenticated, service_role;

SELECT 'PARTE 1: Schemas y extensiones creados' AS status;

-- ============================================================================
-- PARTE 2: TODOS LOS ENUMS (antes de cualquier tabla)
-- ============================================================================

-- ENUM: user_role
DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM (
      'super_admin',
      'school',
      'teacher',
      'parent',
      'student',
      'individual'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: oauth_provider
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

-- ENUM: organization_type
DO $$ BEGIN
  CREATE TYPE app.organization_type AS ENUM (
      'school',
      'family',
      'group',
      'library',
      'individual'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: membership_status
DO $$ BEGIN
  CREATE TYPE app.membership_status AS ENUM (
      'active',
      'inactive',
      'suspended',
      'pending',
      'cancelled',
      'expired',
      'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: language_code
DO $$ BEGIN
  CREATE TYPE app.language_code AS ENUM (
      'es',
      'en',
      'fr',
      'pt',
      'de',
      'it'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: permission_type
DO $$ BEGIN
  CREATE TYPE app.permission_type AS ENUM (
      'grant',
      'deny'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: billing_period
DO $$ BEGIN
  CREATE TYPE app.billing_period AS ENUM (
      'monthly',
      'quarterly',
      'yearly',
      'lifetime'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: subscription_plan
DO $$ BEGIN
  CREATE TYPE app.subscription_plan AS ENUM (
      'free',
      'basic',
      'premium',
      'unlimited'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM: subscription_status
DO $$ BEGIN
  CREATE TYPE app.subscription_status AS ENUM (
      'active',
      'cancelled',
      'expired',
      'trial',
      'past_due'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

SELECT 'PARTE 2: Enums creados' AS status;

-- ============================================================================
-- PARTE 3: FUNCION SET_UPDATED_AT (requerida por triggers)
-- ============================================================================

CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcion is_super_admin (requerida por policies)
CREATE OR REPLACE FUNCTION app.is_super_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id
      AND r.name = 'super_admin'
      AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'PARTE 3: Funciones base creadas' AS status;

-- ============================================================================
-- PARTE 4: TABLA ROLES (base para user_roles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name app.user_role NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_role BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT roles_hierarchy_positive CHECK (hierarchy_level >= 0)
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON app.roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON app.roles(is_active);

SELECT 'PARTE 4: Tabla roles creada' AS status;

-- ============================================================================
-- PARTE 5: TABLA USER_PROFILES
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON app.user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON app.user_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_oauth ON app.user_profiles(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name_search ON app.user_profiles
    USING gin(to_tsvector('spanish', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')));

SELECT 'PARTE 5: Tabla user_profiles creada' AS status;

-- ============================================================================
-- PARTE 6: TABLA ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_type app.organization_type NOT NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    country_code CHAR(2),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    max_members INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    logo_url TEXT,
    primary_color VARCHAR(7),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_slug_format CHECK (slug IS NULL OR slug ~* '^[a-z0-9-]+$'),
    CONSTRAINT chk_max_members CHECK (max_members IS NULL OR max_members > 0)
);

CREATE INDEX IF NOT EXISTS idx_organizations_type ON app.organizations(organization_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON app.organizations(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON app.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON app.organizations(is_active) WHERE deleted_at IS NULL;

SELECT 'PARTE 6: Tabla organizations creada' AS status;

-- ============================================================================
-- PARTE 7: TABLA USER_ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES app.roles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES app.organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON app.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON app.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org ON app.user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON app.user_roles(is_active);

SELECT 'PARTE 7: Tabla user_roles creada' AS status;

-- ============================================================================
-- PARTE 8: TABLA ORGANIZATION_MEMBERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES app.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app.user_role NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    status app.membership_status DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invitation_token VARCHAR(100) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT org_members_unique UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON app.organization_members(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_user ON app.organization_members(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON app.organization_members(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_status ON app.organization_members(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_org_members_invitation_token ON app.organization_members(invitation_token) WHERE invitation_token IS NOT NULL;

SELECT 'PARTE 8: Tabla organization_members creada' AS status;

-- ============================================================================
-- PARTE 9: TABLA USER_RELATIONSHIPS
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_user_rel_primary ON app.user_relationships(primary_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_related ON app.user_relationships(related_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_rel_type ON app.user_relationships(relationship_type) WHERE deleted_at IS NULL;

SELECT 'PARTE 9: Tabla user_relationships creada' AS status;

-- ============================================================================
-- PARTE 10: SISTEMA DE TRADUCCIONES
-- ============================================================================

-- Tabla: languages
CREATE TABLE IF NOT EXISTS app.languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  flag_emoji VARCHAR(10),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: translation_namespaces
CREATE TABLE IF NOT EXISTS app.translation_namespaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla: translation_categories
CREATE TABLE IF NOT EXISTS app.translation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabla: translation_keys
CREATE TABLE IF NOT EXISTS app.translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_slug VARCHAR(100) NOT NULL REFERENCES app.translation_namespaces(slug) ON DELETE CASCADE,
  key_name VARCHAR(500) NOT NULL,
  category_id UUID REFERENCES app.translation_categories(id) ON DELETE SET NULL,
  description TEXT,
  context TEXT,
  default_value TEXT,
  is_system_key BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(namespace_slug, key_name)
);

-- Tabla: translations
CREATE TABLE IF NOT EXISTS app.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  translation_key_id UUID NOT NULL REFERENCES app.translation_keys(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(translation_key_id, language_code)
);

-- Indices para traducciones
CREATE INDEX IF NOT EXISTS idx_languages_active ON app.languages(is_active);
CREATE INDEX IF NOT EXISTS idx_translation_namespaces_slug ON app.translation_namespaces(slug);
CREATE INDEX IF NOT EXISTS idx_translation_namespaces_active ON app.translation_namespaces(is_active);
CREATE INDEX IF NOT EXISTS idx_translation_categories_slug ON app.translation_categories(slug);
CREATE INDEX IF NOT EXISTS idx_translation_categories_active ON app.translation_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_translation_keys_namespace ON app.translation_keys(namespace_slug);
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON app.translation_keys(category_id);
CREATE INDEX IF NOT EXISTS idx_translation_keys_active ON app.translation_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_translations_key_id ON app.translations(translation_key_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON app.translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_active ON app.translations(is_active);

SELECT 'PARTE 10: Sistema de traducciones creado' AS status;

-- ============================================================================
-- PARTE 11: TABLAS DE ROUTES
-- ============================================================================

-- Tabla: routes
CREATE TABLE IF NOT EXISTS app.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathname VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  show_in_menu BOOLEAN NOT NULL DEFAULT false,
  menu_order INTEGER NOT NULL DEFAULT 0,
  parent_route_id UUID REFERENCES app.routes(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  requires_verification BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT routes_pathname_format CHECK (pathname ~ '^/[a-z0-9\-/]*$'),
  CONSTRAINT routes_menu_order_positive CHECK (menu_order >= 0)
);

CREATE INDEX IF NOT EXISTS idx_routes_pathname ON app.routes(pathname);
CREATE INDEX IF NOT EXISTS idx_routes_is_active ON app.routes(is_active);
CREATE INDEX IF NOT EXISTS idx_routes_deleted_at ON app.routes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_routes_show_in_menu ON app.routes(show_in_menu);
CREATE INDEX IF NOT EXISTS idx_routes_parent ON app.routes(parent_route_id);

-- Tabla: route_translations
CREATE TABLE IF NOT EXISTS app.route_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  translated_path VARCHAR(255) NOT NULL,
  translated_name VARCHAR(200) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT route_translations_unique UNIQUE (route_id, language_code),
  CONSTRAINT route_translations_path_format CHECK (translated_path ~ '^/[a-z0-9\-/]*$')
);

CREATE INDEX IF NOT EXISTS idx_route_translations_route_id ON app.route_translations(route_id);
CREATE INDEX IF NOT EXISTS idx_route_translations_language ON app.route_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_route_translations_path ON app.route_translations(translated_path);
CREATE INDEX IF NOT EXISTS idx_route_translations_is_active ON app.route_translations(is_active);

SELECT 'PARTE 11: Tablas de routes creadas' AS status;

-- ============================================================================
-- PARTE 12: TABLAS DE PERMISOS
-- ============================================================================

-- Tabla: role_language_access
CREATE TABLE IF NOT EXISTS app.role_language_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name app.user_role NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  language_code app.language_code NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT role_language_access_unique UNIQUE (role_name, language_code)
);

CREATE INDEX IF NOT EXISTS idx_role_language_access_role_name ON app.role_language_access(role_name);
CREATE INDEX IF NOT EXISTS idx_role_language_access_language ON app.role_language_access(language_code);
CREATE INDEX IF NOT EXISTS idx_role_language_access_is_active ON app.role_language_access(is_active);

-- Tabla: route_permissions
CREATE TABLE IF NOT EXISTS app.route_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name app.user_role NOT NULL REFERENCES app.roles(name) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  language_code app.language_code NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  CONSTRAINT route_permissions_unique UNIQUE (role_name, route_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_route_permissions_role_name ON app.route_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_route_permissions_route_id ON app.route_permissions(route_id);
CREATE INDEX IF NOT EXISTS idx_route_permissions_is_active ON app.route_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_route_permissions_language ON app.route_permissions(language_code);

-- Tabla: user_route_permissions
CREATE TABLE IF NOT EXISTS app.user_route_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID NOT NULL REFERENCES app.routes(id) ON DELETE CASCADE,
  permission_type app.permission_type NOT NULL,
  reason TEXT,
  language_code app.language_code NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  CONSTRAINT user_route_permissions_unique UNIQUE (user_id, route_id, language_code)
);

CREATE INDEX IF NOT EXISTS idx_user_route_permissions_user_id ON app.user_route_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_route_permissions_route_id ON app.user_route_permissions(route_id);
CREATE INDEX IF NOT EXISTS idx_user_route_permissions_type ON app.user_route_permissions(permission_type);
CREATE INDEX IF NOT EXISTS idx_user_route_permissions_expires ON app.user_route_permissions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_route_permissions_language ON app.user_route_permissions(language_code);

SELECT 'PARTE 12: Tablas de permisos creadas' AS status;

-- ============================================================================
-- PARTE 13: PERFILES DE AUTOR Y SEGUIDORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.author_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    author_bio TEXT,
    short_bio VARCHAR(200),
    banner_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT TRUE,
    is_accepting_collaborations BOOLEAN DEFAULT TRUE,
    total_followers INTEGER DEFAULT 0,
    total_books INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    notification_preferences JSONB DEFAULT '{"new_follower": true, "new_review": true, "collaboration_request": true}'::jsonb,
    stripe_account_id VARCHAR(255),
    stripe_onboarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_author_profiles_username ON app.author_profiles(username);
CREATE INDEX IF NOT EXISTS idx_author_profiles_verified ON app.author_profiles(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_author_profiles_public ON app.author_profiles(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_author_profiles_followers ON app.author_profiles(total_followers DESC);
CREATE INDEX IF NOT EXISTS idx_author_profiles_bio_search ON app.author_profiles
    USING gin(to_tsvector('spanish', COALESCE(author_bio, '') || ' ' || COALESCE(short_bio, '')));

-- Tabla de seguidores
CREATE TABLE IF NOT EXISTS app.author_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notify_new_book BOOLEAN DEFAULT TRUE,
    notify_community_post BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_author_followers UNIQUE(author_id, follower_id),
    CONSTRAINT chk_no_self_follow CHECK(author_id != follower_id)
);

CREATE INDEX IF NOT EXISTS idx_author_followers_author ON app.author_followers(author_id);
CREATE INDEX IF NOT EXISTS idx_author_followers_follower ON app.author_followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_author_followers_created ON app.author_followers(created_at DESC);

SELECT 'PARTE 13: Perfiles de autor y seguidores creados' AS status;

-- ============================================================================
-- PARTE 14: COMUNIDADES DE AUTORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS app.author_communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(300),
    slug VARCHAR(100) UNIQUE NOT NULL,
    cover_url TEXT,
    welcome_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    total_members INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    stripe_product_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_author_communities_author ON app.author_communities(author_id);
CREATE INDEX IF NOT EXISTS idx_author_communities_slug ON app.author_communities(slug);
CREATE INDEX IF NOT EXISTS idx_author_communities_active ON app.author_communities(is_active) WHERE is_active = TRUE;

-- Tabla de planes de comunidad
CREATE TABLE IF NOT EXISTS app.community_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app.author_communities(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period app.billing_period DEFAULT 'monthly',
    benefits JSONB DEFAULT '[]'::jsonb,
    max_members INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order SMALLINT DEFAULT 1,
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_plans_community ON app.community_plans(community_id);
CREATE INDEX IF NOT EXISTS idx_community_plans_active ON app.community_plans(is_active) WHERE is_active = TRUE;

-- Tabla de membresías
CREATE TABLE IF NOT EXISTS app.community_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES app.author_communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES app.community_plans(id),
    status app.membership_status DEFAULT 'pending',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    paused_at TIMESTAMPTZ,
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,
    total_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_community_memberships UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_memberships_community ON app.community_memberships(community_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_user ON app.community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_plan ON app.community_memberships(plan_id);
CREATE INDEX IF NOT EXISTS idx_community_memberships_status ON app.community_memberships(status);
CREATE INDEX IF NOT EXISTS idx_community_memberships_active ON app.community_memberships(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_community_memberships_expires ON app.community_memberships(expires_at) WHERE status = 'active';

-- Tabla de historial de pagos de comunidad
CREATE TABLE IF NOT EXISTS app.community_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES app.community_memberships(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'succeeded',
    failure_reason TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_membership ON app.community_payment_history(membership_id);

SELECT 'PARTE 14: Comunidades de autores creadas' AS status;

-- ============================================================================
-- PARTE 15: SUSCRIPCIONES DE PLATAFORMA
-- ============================================================================

-- Tabla de definicion de planes
CREATE TABLE IF NOT EXISTS app.subscription_plan_definitions (
    plan app.subscription_plan PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    features JSONB DEFAULT '[]'::jsonb,
    max_books_per_month INTEGER,
    max_downloads_per_month INTEGER,
    can_access_premium_books BOOLEAN DEFAULT FALSE,
    can_download_offline BOOLEAN DEFAULT FALSE,
    can_create_books BOOLEAN DEFAULT FALSE,
    max_created_books INTEGER DEFAULT 0,
    ads_enabled BOOLEAN DEFAULT TRUE,
    stripe_product_id VARCHAR(255),
    stripe_price_monthly_id VARCHAR(255),
    stripe_price_yearly_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de suscripciones de usuarios
CREATE TABLE IF NOT EXISTS app.platform_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan app.subscription_plan NOT NULL DEFAULT 'free',
    status app.subscription_status DEFAULT 'active',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    billing_period VARCHAR(20) DEFAULT 'monthly',
    stripe_subscription_id VARCHAR(255),
    stripe_customer_id VARCHAR(255),
    stripe_payment_method_id VARCHAR(255),
    last_payment_at TIMESTAMPTZ,
    next_payment_at TIMESTAMPTZ,
    total_paid DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_user ON app.platform_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_plan ON app.platform_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_status ON app.platform_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_active ON app.platform_subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_expires ON app.platform_subscriptions(expires_at);

-- Tabla de historial de pagos de suscripcion
CREATE TABLE IF NOT EXISTS app.subscription_payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES app.platform_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    plan app.subscription_plan NOT NULL,
    billing_period VARCHAR(20),
    stripe_payment_intent_id VARCHAR(255),
    stripe_invoice_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'succeeded',
    failure_reason TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_payment_history_subscription ON app.subscription_payment_history(subscription_id);

SELECT 'PARTE 15: Suscripciones de plataforma creadas' AS status;

-- ============================================================================
-- PARTE 16: FUNCIONES DE AUTH Y ORGANIZATIONS
-- ============================================================================

-- Funcion: get_user_primary_role
CREATE OR REPLACE FUNCTION app.get_user_primary_role(p_user_id UUID)
RETURNS app.user_role AS $$
DECLARE
  v_role app.user_role;
BEGIN
  SELECT r.name INTO v_role
  FROM app.user_roles ur
  JOIN app.roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND ur.is_active = true
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ORDER BY r.hierarchy_level DESC
  LIMIT 1;
  RETURN COALESCE(v_role, 'individual'::app.user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcion: has_role
CREATE OR REPLACE FUNCTION app.has_role(p_user_id UUID, p_role app.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app.user_roles ur
    JOIN app.roles r ON ur.role_id = r.id
    WHERE ur.user_id = p_user_id AND r.name = p_role
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcion: is_org_admin
CREATE OR REPLACE FUNCTION app.is_org_admin(p_user_id UUID, p_organization_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app.organization_members
        WHERE user_id = p_user_id
          AND organization_id = p_organization_id
          AND role = 'school'
          AND status = 'active'
          AND deleted_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcion: get_user_organizations
CREATE OR REPLACE FUNCTION app.get_user_organizations(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_name VARCHAR,
    organization_type app.organization_type,
    user_role app.user_role,
    membership_status app.membership_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.name, o.organization_type, om.role, om.status
    FROM app.organizations o
    JOIN app.organization_members om ON o.id = om.organization_id
    WHERE om.user_id = p_user_id
      AND om.deleted_at IS NULL
      AND o.deleted_at IS NULL
    ORDER BY om.joined_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'PARTE 16: Funciones de auth y organizations creadas' AS status;

-- ============================================================================
-- PARTE 17: FUNCIONES DE AUTORES Y COMUNIDADES
-- ============================================================================

-- Funcion: update_author_follower_count
CREATE OR REPLACE FUNCTION app.update_author_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE app.author_profiles
        SET total_followers = total_followers + 1, updated_at = NOW()
        WHERE user_id = NEW.author_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE app.author_profiles
        SET total_followers = GREATEST(0, total_followers - 1), updated_at = NOW()
        WHERE user_id = OLD.author_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Funcion: is_following_author
CREATE OR REPLACE FUNCTION app.is_following_author(
    p_author_id UUID,
    p_follower_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM app.author_followers
        WHERE author_id = p_author_id AND follower_id = p_follower_id
    );
END;
$$ LANGUAGE plpgsql STABLE;

-- Funcion: get_popular_authors
CREATE OR REPLACE FUNCTION app.get_popular_authors(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    author_bio TEXT,
    short_bio VARCHAR,
    banner_url TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN,
    total_followers INTEGER,
    total_books INTEGER,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.user_id,
        ap.username,
        ap.author_bio,
        ap.short_bio,
        ap.banner_url,
        up.avatar_url,
        ap.is_verified,
        ap.total_followers,
        ap.total_books,
        ap.average_rating
    FROM app.author_profiles ap
    LEFT JOIN app.user_profiles up ON up.user_id = ap.user_id
    WHERE ap.is_public = TRUE
    ORDER BY ap.total_followers DESC, ap.total_books DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Funcion: search_authors
CREATE OR REPLACE FUNCTION app.search_authors(
    p_search_term VARCHAR,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    username VARCHAR,
    short_bio VARCHAR,
    avatar_url TEXT,
    is_verified BOOLEAN,
    total_followers INTEGER,
    total_books INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ap.user_id,
        ap.username,
        ap.short_bio,
        up.avatar_url,
        ap.is_verified,
        ap.total_followers,
        ap.total_books
    FROM app.author_profiles ap
    LEFT JOIN app.user_profiles up ON up.user_id = ap.user_id
    WHERE
        ap.is_public = TRUE
        AND (
            ap.username ILIKE '%' || p_search_term || '%'
            OR ap.author_bio ILIKE '%' || p_search_term || '%'
            OR ap.short_bio ILIKE '%' || p_search_term || '%'
        )
    ORDER BY
        ap.is_verified DESC,
        ap.total_followers DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Funcion: update_community_member_count
CREATE OR REPLACE FUNCTION app.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        UPDATE app.author_communities
        SET total_members = total_members + 1, updated_at = NOW()
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'active' AND OLD.status != 'active' THEN
            UPDATE app.author_communities
            SET total_members = total_members + 1, updated_at = NOW()
            WHERE id = NEW.community_id;
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

-- Funcion: is_community_member
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

-- Funcion: get_user_community_access
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

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::JSONB;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Funcion: get_user_communities
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

SELECT 'PARTE 17: Funciones de autores y comunidades creadas' AS status;

-- ============================================================================
-- PARTE 18: FUNCIONES DE SUSCRIPCIONES
-- ============================================================================

-- Funcion: update_subscriptions_updated_at
CREATE OR REPLACE FUNCTION app.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcion: get_user_subscription
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

-- Funcion: can_access_premium_content
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

-- Funcion: get_subscription_plans
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

SELECT 'PARTE 18: Funciones de suscripciones creadas' AS status;

-- ============================================================================
-- PARTE 19: FUNCIONES DE PERMISOS
-- ============================================================================

-- Funcion: can_access_route
CREATE OR REPLACE FUNCTION app.can_access_route(
  p_user_id uuid,
  p_translated_path text,
  p_language_code text DEFAULT 'es'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, auth, public
AS $$
DECLARE
  v_route_id uuid;
  v_is_public boolean;
  v_lang_code app.language_code;
  v_has_deny_global boolean := false;
  v_has_deny_specific boolean := false;
  v_has_grant_global boolean := false;
  v_has_grant_specific boolean := false;
  v_has_from_role boolean := false;
  v_can_use_language boolean := false;
BEGIN
  BEGIN
    v_lang_code := p_language_code::app.language_code;
  EXCEPTION WHEN OTHERS THEN
    v_lang_code := 'es'::app.language_code;
  END;

  SELECT r.id, r.is_public
  INTO v_route_id, v_is_public
  FROM app.routes r
  LEFT JOIN app.route_translations rt ON rt.route_id = r.id
    AND rt.language_code = v_lang_code
    AND rt.is_active = true
  WHERE (
    rt.translated_path = p_translated_path
    OR
    r.pathname = p_translated_path
  )
    AND r.is_active = true
    AND r.deleted_at IS NULL
  LIMIT 1;

  IF v_route_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_is_public = true THEN
    RETURN true;
  END IF;

  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code IS NULL
  ) INTO v_has_deny_global;

  IF v_has_deny_global THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'deny'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code = v_lang_code
  ) INTO v_has_deny_specific;

  IF v_has_deny_specific THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code IS NULL
  ) INTO v_has_grant_global;

  IF v_has_grant_global THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_route_permissions urp
    WHERE urp.user_id = p_user_id
      AND urp.route_id = v_route_id
      AND urp.permission_type = 'grant'
      AND urp.is_active = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      AND urp.language_code = v_lang_code
  ) INTO v_has_grant_specific;

  IF v_has_grant_specific THEN
    RETURN true;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.roles rol ON rol.id = ur.role_id
    JOIN app.route_permissions rp ON rp.role_name = rol.name
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
      AND rol.is_active = true
      AND rp.route_id = v_route_id
      AND rp.is_active = true
      AND (rp.language_code IS NULL OR rp.language_code = v_lang_code)
  ) INTO v_has_from_role;

  IF NOT v_has_from_role THEN
    RETURN false;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM app.user_roles ur
    JOIN app.roles rol ON rol.id = ur.role_id
    JOIN app.role_language_access rla ON rla.role_name = rol.name
    WHERE ur.user_id = p_user_id
      AND ur.is_active = true
      AND ur.revoked_at IS NULL
      AND rla.language_code = v_lang_code
      AND rla.is_active = true
  ) INTO v_can_use_language;

  IF NOT v_can_use_language THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$;

-- Wrapper publico
CREATE OR REPLACE FUNCTION public.can_access_route(
  p_user_id uuid,
  p_translated_path text,
  p_language_code text DEFAULT 'es'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT app.can_access_route(p_user_id, p_translated_path, p_language_code);
$$;

-- Funcion: search_users_by_email
CREATE OR REPLACE FUNCTION app.search_users_by_email(
  search_email text
)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz
)
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id as user_id,
    au.email::text,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1)
    ) as full_name,
    COALESCE(
      au.raw_user_meta_data->>'avatar_url',
      au.raw_user_meta_data->>'picture'
    ) as avatar_url,
    COALESCE(
      au.raw_app_meta_data->>'provider',
      'email'
    ) as provider,
    au.created_at
  FROM auth.users au
  WHERE au.email ILIKE '%' || search_email || '%'
  ORDER BY au.email
  LIMIT 50;
END;
$$;

-- Wrapper publico
CREATE OR REPLACE FUNCTION public.search_users_by_email(search_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM app.search_users_by_email(search_email);
$$;

SELECT 'PARTE 19: Funciones de permisos creadas' AS status;

-- ============================================================================
-- PARTE 20: TRIGGER HANDLE_NEW_USER
-- ============================================================================

CREATE OR REPLACE FUNCTION app.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_oauth_provider app.oauth_provider;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);

  IF NEW.app_metadata->>'provider' IS NOT NULL THEN
    BEGIN
      v_oauth_provider := (NEW.app_metadata->>'provider')::app.oauth_provider;
    EXCEPTION WHEN OTHERS THEN
      v_oauth_provider := NULL;
    END;
  END IF;

  INSERT INTO app.user_profiles (
    user_id, full_name, display_name, oauth_provider, oauth_provider_id,
    language_preference, last_login_at
  ) VALUES (
    NEW.id,
    v_full_name,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    v_oauth_provider,
    NEW.raw_user_meta_data->>'provider_id',
    COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET last_login_at = NOW();

  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO app.user_roles (user_id, role_id, assigned_by)
    SELECT NEW.id, r.id, NEW.id
    FROM app.roles r
    WHERE r.name = (NEW.raw_user_meta_data->>'role')::app.user_role
    ON CONFLICT (user_id, role_id, organization_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app.handle_new_user();

SELECT 'PARTE 20: Trigger handle_new_user creado' AS status;

-- ============================================================================
-- PARTE 21: TRIGGERS DE UPDATED_AT PARA SCHEMA APP
-- ============================================================================

DROP TRIGGER IF EXISTS set_roles_updated_at ON app.roles;
CREATE TRIGGER set_roles_updated_at
  BEFORE UPDATE ON app.roles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON app.user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON app.user_profiles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_roles_updated_at ON app.user_roles;
CREATE TRIGGER set_user_roles_updated_at
  BEFORE UPDATE ON app.user_roles
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_organizations_updated_at ON app.organizations;
CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON app.organizations
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_org_members_updated_at ON app.organization_members;
CREATE TRIGGER set_org_members_updated_at
  BEFORE UPDATE ON app.organization_members
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_relationships_updated_at ON app.user_relationships;
CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON app.user_relationships
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_routes_updated_at ON app.routes;
CREATE TRIGGER set_routes_updated_at
  BEFORE UPDATE ON app.routes
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_route_translations_updated_at ON app.route_translations;
CREATE TRIGGER set_route_translations_updated_at
  BEFORE UPDATE ON app.route_translations
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_role_language_access_updated_at ON app.role_language_access;
CREATE TRIGGER set_role_language_access_updated_at
  BEFORE UPDATE ON app.role_language_access
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_route_permissions_updated_at ON app.route_permissions;
CREATE TRIGGER set_route_permissions_updated_at
  BEFORE UPDATE ON app.route_permissions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS set_user_route_permissions_updated_at ON app.user_route_permissions;
CREATE TRIGGER set_user_route_permissions_updated_at
  BEFORE UPDATE ON app.user_route_permissions
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Triggers para autores
DROP TRIGGER IF EXISTS trg_author_follower_count ON app.author_followers;
CREATE TRIGGER trg_author_follower_count
    AFTER INSERT OR DELETE ON app.author_followers
    FOR EACH ROW
    EXECUTE FUNCTION app.update_author_follower_count();

DROP TRIGGER IF EXISTS trg_author_profiles_updated_at ON app.author_profiles;
CREATE TRIGGER trg_author_profiles_updated_at
    BEFORE UPDATE ON app.author_profiles
    FOR EACH ROW
    EXECUTE FUNCTION app.set_updated_at();

-- Triggers para comunidades
DROP TRIGGER IF EXISTS trg_community_member_count ON app.community_memberships;
CREATE TRIGGER trg_community_member_count
    AFTER INSERT OR UPDATE OR DELETE ON app.community_memberships
    FOR EACH ROW
    EXECUTE FUNCTION app.update_community_member_count();

DROP TRIGGER IF EXISTS trg_author_communities_updated_at ON app.author_communities;
CREATE TRIGGER trg_author_communities_updated_at
    BEFORE UPDATE ON app.author_communities
    FOR EACH ROW
    EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_community_plans_updated_at ON app.community_plans;
CREATE TRIGGER trg_community_plans_updated_at
    BEFORE UPDATE ON app.community_plans
    FOR EACH ROW
    EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_community_memberships_updated_at ON app.community_memberships;
CREATE TRIGGER trg_community_memberships_updated_at
    BEFORE UPDATE ON app.community_memberships
    FOR EACH ROW
    EXECUTE FUNCTION app.set_updated_at();

-- Triggers para suscripciones
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

-- Triggers para traducciones
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_languages_updated_at ON app.languages;
CREATE TRIGGER update_languages_updated_at
  BEFORE UPDATE ON app.languages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_namespaces_updated_at ON app.translation_namespaces;
CREATE TRIGGER update_translation_namespaces_updated_at
  BEFORE UPDATE ON app.translation_namespaces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_categories_updated_at ON app.translation_categories;
CREATE TRIGGER update_translation_categories_updated_at
  BEFORE UPDATE ON app.translation_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translation_keys_updated_at ON app.translation_keys;
CREATE TRIGGER update_translation_keys_updated_at
  BEFORE UPDATE ON app.translation_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_translations_updated_at ON app.translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON app.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

SELECT 'PARTE 21: Triggers de updated_at creados' AS status;

-- ============================================================================
-- PARTE 22: VISTAS
-- ============================================================================

CREATE OR REPLACE VIEW app.v_organization_active_members AS
SELECT
    om.organization_id, o.name AS organization_name, om.user_id,
    up.display_name, up.first_name, up.last_name,
    om.role, om.status, om.joined_at
FROM app.organization_members om
JOIN app.organizations o ON om.organization_id = o.id
LEFT JOIN app.user_profiles up ON om.user_id = up.user_id
WHERE om.status = 'active'
  AND om.deleted_at IS NULL
  AND o.deleted_at IS NULL;

CREATE OR REPLACE VIEW app.v_organization_stats AS
SELECT
    o.id, o.name, o.organization_type,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'active') AS active_members,
    COUNT(DISTINCT om.user_id) FILTER (WHERE om.status = 'pending') AS pending_members,
    o.max_members, o.created_at
FROM app.organizations o
LEFT JOIN app.organization_members om ON o.id = om.organization_id AND om.deleted_at IS NULL
WHERE o.deleted_at IS NULL
GROUP BY o.id;

SELECT 'PARTE 22: Vistas creadas' AS status;

-- ============================================================================
-- PARTE 23: ROW LEVEL SECURITY PARA SCHEMA APP
-- ============================================================================

-- RLS: roles
ALTER TABLE app.roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_select_policy" ON app.roles;
CREATE POLICY "roles_select_policy" ON app.roles
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS: user_profiles
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_profile" ON app.user_profiles;
CREATE POLICY "users_view_own_profile" ON app.user_profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_public_profile = true);

DROP POLICY IF EXISTS "users_update_own_profile" ON app.user_profiles;
CREATE POLICY "users_update_own_profile" ON app.user_profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_profile" ON app.user_profiles;
CREATE POLICY "users_insert_own_profile" ON app.user_profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS: user_roles
ALTER TABLE app.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_own_roles" ON app.user_roles;
CREATE POLICY "users_view_own_roles" ON app.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- RLS: organizations
ALTER TABLE app.organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuarios pueden ver organizaciones publicas" ON app.organizations;
CREATE POLICY "Usuarios pueden ver organizaciones publicas"
    ON app.organizations FOR SELECT
    USING (is_active = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Usuarios pueden ver sus organizaciones" ON app.organizations;
CREATE POLICY "Usuarios pueden ver sus organizaciones"
    ON app.organizations FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM app.organization_members
            WHERE organization_id = id AND deleted_at IS NULL
        )
    );

DROP POLICY IF EXISTS "Creadores pueden actualizar sus organizaciones" ON app.organizations;
CREATE POLICY "Creadores pueden actualizar sus organizaciones"
    ON app.organizations FOR UPDATE
    USING (created_by = auth.uid());

-- RLS: organization_members
ALTER TABLE app.organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_org_members" ON app.organization_members;
CREATE POLICY "users_view_org_members" ON app.organization_members
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM app.organization_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- RLS: user_relationships
ALTER TABLE app.user_relationships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_view_relationships" ON app.user_relationships;
CREATE POLICY "users_view_relationships" ON app.user_relationships
  FOR SELECT TO authenticated
  USING (primary_user_id = auth.uid() OR related_user_id = auth.uid());

-- RLS: languages
ALTER TABLE app.languages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read languages" ON app.languages;
CREATE POLICY "Public read languages" ON app.languages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage languages" ON app.languages;
CREATE POLICY "Auth manage languages" ON app.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS: translation_namespaces
ALTER TABLE app.translation_namespaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read namespaces" ON app.translation_namespaces;
CREATE POLICY "Public read namespaces" ON app.translation_namespaces FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage namespaces" ON app.translation_namespaces;
CREATE POLICY "Auth manage namespaces" ON app.translation_namespaces FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS: translation_categories
ALTER TABLE app.translation_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read categories" ON app.translation_categories;
CREATE POLICY "Public read categories" ON app.translation_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage categories" ON app.translation_categories;
CREATE POLICY "Auth manage categories" ON app.translation_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS: translation_keys
ALTER TABLE app.translation_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read keys" ON app.translation_keys;
CREATE POLICY "Public read keys" ON app.translation_keys FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage keys" ON app.translation_keys;
CREATE POLICY "Auth manage keys" ON app.translation_keys FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS: translations
ALTER TABLE app.translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read translations" ON app.translations;
CREATE POLICY "Public read translations" ON app.translations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage translations" ON app.translations;
CREATE POLICY "Auth manage translations" ON app.translations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS: routes
ALTER TABLE app.routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "routes_select_policy" ON app.routes;
CREATE POLICY "routes_select_policy" ON app.routes
  FOR SELECT TO authenticated USING (is_active = true AND deleted_at IS NULL);

-- RLS: route_translations
ALTER TABLE app.route_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "route_translations_select_policy" ON app.route_translations;
CREATE POLICY "route_translations_select_policy" ON app.route_translations
  FOR SELECT TO authenticated USING (is_active = true);

-- RLS: role_language_access
ALTER TABLE app.role_language_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "role_language_access_select_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_select_policy" ON app.role_language_access
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "role_language_access_insert_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_insert_policy" ON app.role_language_access
  FOR INSERT TO authenticated WITH CHECK (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "role_language_access_update_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_update_policy" ON app.role_language_access
  FOR UPDATE TO authenticated USING (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "role_language_access_delete_policy" ON app.role_language_access;
CREATE POLICY "role_language_access_delete_policy" ON app.role_language_access
  FOR DELETE TO authenticated USING (app.is_super_admin(auth.uid()));

-- RLS: route_permissions
ALTER TABLE app.route_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "route_permissions_select_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_select_policy" ON app.route_permissions
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "route_permissions_insert_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_insert_policy" ON app.route_permissions
  FOR INSERT TO authenticated WITH CHECK (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "route_permissions_update_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_update_policy" ON app.route_permissions
  FOR UPDATE TO authenticated USING (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "route_permissions_delete_policy" ON app.route_permissions;
CREATE POLICY "route_permissions_delete_policy" ON app.route_permissions
  FOR DELETE TO authenticated USING (app.is_super_admin(auth.uid()));

-- RLS: user_route_permissions
ALTER TABLE app.user_route_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_route_permissions_select_policy" ON app.user_route_permissions;
CREATE POLICY "user_route_permissions_select_policy" ON app.user_route_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "user_route_permissions_insert_policy" ON app.user_route_permissions;
CREATE POLICY "user_route_permissions_insert_policy" ON app.user_route_permissions
  FOR INSERT TO authenticated WITH CHECK (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "user_route_permissions_update_policy" ON app.user_route_permissions;
CREATE POLICY "user_route_permissions_update_policy" ON app.user_route_permissions
  FOR UPDATE TO authenticated USING (app.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "user_route_permissions_delete_policy" ON app.user_route_permissions;
CREATE POLICY "user_route_permissions_delete_policy" ON app.user_route_permissions
  FOR DELETE TO authenticated USING (app.is_super_admin(auth.uid()));

SELECT 'PARTE 23: RLS para schema app creado' AS status;

-- ============================================================================
-- PARTE 24: SCHEMA BOOKS - INICIALIZACION
-- ============================================================================

SET search_path TO books, public;

COMMENT ON SCHEMA books IS 'Sistema completo de gestion de libros digitales interactivos';

GRANT USAGE ON SCHEMA books TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA books TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA books TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA books TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA books TO postgres, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA books GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;

SELECT 'PARTE 24: Schema books inicializado' AS status;

-- ============================================================================
-- PARTE 25: TABLAS DE CATALOGO DE BOOKS
-- ============================================================================

SET search_path TO books, public;

-- book_types
CREATE TABLE IF NOT EXISTS book_types (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_levels
CREATE TABLE IF NOT EXISTS book_levels (
    id SMALLINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    min_age SMALLINT NULL,
    max_age SMALLINT NULL,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_categories
CREATE TABLE IF NOT EXISTS book_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_values
CREATE TABLE IF NOT EXISTS book_values (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_genres
CREATE TABLE IF NOT EXISTS book_genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_languages
CREATE TABLE IF NOT EXISTS book_languages (
    id SERIAL PRIMARY KEY,
    iso_code VARCHAR(5) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_tags
CREATE TABLE IF NOT EXISTS book_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NULL UNIQUE,
    description TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- book_authors
CREATE TABLE IF NOT EXISTS book_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    biography TEXT NULL,
    photo_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_book_authors_name_search ON book_authors USING gin(to_tsvector('spanish', name));

-- book_characters
CREATE TABLE IF NOT EXISTS book_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(300) NOT NULL,
    description TEXT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

SELECT 'PARTE 25: Tablas de catalogo de books creadas' AS status;

-- ============================================================================
-- PARTE 26: TABLA PRINCIPAL DE BOOKS
-- ============================================================================

SET search_path TO books, public;

CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NULL,
    type_id SMALLINT NOT NULL,
    level_id SMALLINT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    cover_url TEXT NULL,
    pdf_url TEXT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INTEGER NOT NULL DEFAULT 0,
    deleted_at TIMESTAMPTZ NULL,
    deleted_by UUID NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_books_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_type FOREIGN KEY (type_id)
        REFERENCES book_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_books_level FOREIGN KEY (level_id)
        REFERENCES book_levels(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_books_user ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_type ON books(type_id);
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level_id);
CREATE INDEX IF NOT EXISTS idx_books_published ON books(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_books_featured ON books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_books_not_deleted ON books(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_title_search ON books USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_books_description_search ON books USING gin(to_tsvector('spanish', description));
CREATE INDEX IF NOT EXISTS idx_books_featured_active ON books(created_at DESC)
    WHERE is_featured = TRUE AND is_published = TRUE AND deleted_at IS NULL;

SELECT 'PARTE 26: Tabla books creada' AS status;

-- ============================================================================
-- PARTE 27: TABLAS SECUNDARIAS DE BOOKS
-- ============================================================================

SET search_path TO books, public;

-- book_pages
CREATE TABLE IF NOT EXISTS book_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    page_number SMALLINT NOT NULL,
    layout VARCHAR(50) NOT NULL DEFAULT 'standard',
    animation VARCHAR(50) NULL,
    title TEXT NULL,
    content TEXT NULL,
    image_url TEXT NULL,
    audio_url TEXT NULL,
    interactive_game VARCHAR(100) NULL,
    items JSONB NULL,
    background_url TEXT NULL,
    background_color VARCHAR(50) NULL,
    text_color VARCHAR(50) NULL,
    font VARCHAR(50) NULL,
    border_style VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_pages_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT uq_book_pages_book_page_number UNIQUE (book_id, page_number),
    CONSTRAINT chk_book_pages_page_number_positive CHECK (page_number > 0)
);

CREATE INDEX IF NOT EXISTS idx_book_pages_book ON book_pages(book_id);
CREATE INDEX IF NOT EXISTS idx_book_pages_book_page_number ON book_pages(book_id, page_number);
CREATE INDEX IF NOT EXISTS idx_book_pages_items_gin ON book_pages USING gin(items);

-- book_views
CREATE TABLE IF NOT EXISTS book_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id UUID NULL,
    page_number SMALLINT NULL,
    view_duration INTEGER NULL,
    device_type VARCHAR(50) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_views_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_book_views_book ON book_views(book_id);
CREATE INDEX IF NOT EXISTS idx_book_views_user ON book_views(user_id);
CREATE INDEX IF NOT EXISTS idx_book_views_created_at ON book_views(created_at DESC);

-- book_audit_logs
CREATE TABLE IF NOT EXISTS book_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    user_id UUID NULL,
    ip_address INET NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

CREATE INDEX IF NOT EXISTS idx_book_audit_logs_table_record ON book_audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_book_audit_logs_user ON book_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_book_audit_logs_created_at ON book_audit_logs(created_at DESC);

SELECT 'PARTE 27: Tablas secundarias de books creadas' AS status;

-- ============================================================================
-- PARTE 28: TABLAS DE RELACION (Many-to-Many) DE BOOKS
-- ============================================================================

SET search_path TO books, public;

-- books_authors
CREATE TABLE IF NOT EXISTS books_authors (
    book_id UUID NOT NULL,
    author_id UUID NOT NULL,
    author_order SMALLINT NOT NULL DEFAULT 1,
    PRIMARY KEY (book_id, author_id),
    CONSTRAINT fk_books_authors_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_authors_author FOREIGN KEY (author_id)
        REFERENCES book_authors(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_authors_book ON books_authors(book_id);
CREATE INDEX IF NOT EXISTS idx_books_authors_author ON books_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_books_authors_lookup ON books_authors(author_id, book_id);

-- books_characters
CREATE TABLE IF NOT EXISTS books_characters (
    book_id UUID NOT NULL,
    character_id UUID NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, character_id),
    CONSTRAINT fk_books_characters_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_characters_character FOREIGN KEY (character_id)
        REFERENCES book_characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_characters_book ON books_characters(book_id);
CREATE INDEX IF NOT EXISTS idx_books_characters_character ON books_characters(character_id);

-- books_categories
CREATE TABLE IF NOT EXISTS books_categories (
    book_id UUID NOT NULL,
    category_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, category_id),
    CONSTRAINT fk_books_categories_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_categories_category FOREIGN KEY (category_id)
        REFERENCES book_categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_categories_book ON books_categories(book_id);
CREATE INDEX IF NOT EXISTS idx_books_categories_category ON books_categories(category_id);

-- books_values
CREATE TABLE IF NOT EXISTS books_values (
    book_id UUID NOT NULL,
    value_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, value_id),
    CONSTRAINT fk_books_values_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_values_value FOREIGN KEY (value_id)
        REFERENCES book_values(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_values_book ON books_values(book_id);
CREATE INDEX IF NOT EXISTS idx_books_values_value ON books_values(value_id);

-- books_genres
CREATE TABLE IF NOT EXISTS books_genres (
    book_id UUID NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    CONSTRAINT fk_books_genres_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_genres_genre FOREIGN KEY (genre_id)
        REFERENCES book_genres(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_genres_book ON books_genres(book_id);
CREATE INDEX IF NOT EXISTS idx_books_genres_genre ON books_genres(genre_id);

-- books_languages
CREATE TABLE IF NOT EXISTS books_languages (
    book_id UUID NOT NULL,
    language_id INTEGER NOT NULL,
    is_original BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, language_id),
    CONSTRAINT fk_books_languages_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_languages_language FOREIGN KEY (language_id)
        REFERENCES book_languages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_languages_book ON books_languages(book_id);
CREATE INDEX IF NOT EXISTS idx_books_languages_language ON books_languages(language_id);

-- books_tags
CREATE TABLE IF NOT EXISTS books_tags (
    book_id UUID NOT NULL,
    tag_id INTEGER NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (book_id, tag_id),
    CONSTRAINT fk_books_tags_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_books_tags_tag FOREIGN KEY (tag_id)
        REFERENCES book_tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_tags_book ON books_tags(book_id);
CREATE INDEX IF NOT EXISTS idx_books_tags_tag ON books_tags(tag_id);

SELECT 'PARTE 28: Tablas de relacion de books creadas' AS status;

-- ============================================================================
-- PARTE 29: FUNCIONES DE BOOKS
-- ============================================================================

SET search_path TO books, public;

-- update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- audit_trigger_function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO book_audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- increment_book_views
CREATE OR REPLACE FUNCTION increment_book_views(book_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE books
    SET view_count = view_count + 1
    WHERE id = book_uuid
    AND is_published = TRUE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- validate_book_for_publishing
CREATE OR REPLACE FUNCTION validate_book_for_publishing()
RETURNS TRIGGER AS $$
DECLARE
    page_count INTEGER;
    has_cover BOOLEAN;
BEGIN
    IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.is_published IS NULL) THEN
        SELECT COUNT(*) INTO page_count FROM book_pages WHERE book_id = NEW.id;

        IF page_count = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin paginas';
        END IF;

        has_cover := NEW.cover_url IS NOT NULL AND LENGTH(NEW.cover_url) > 0;

        IF NOT has_cover THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin portada';
        END IF;

        IF NEW.title IS NULL OR LENGTH(TRIM(NEW.title)) = 0 THEN
            RAISE EXCEPTION 'No se puede publicar un libro sin titulo';
        END IF;

        NEW.published_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- search_books
CREATE OR REPLACE FUNCTION search_books(
    search_query TEXT,
    filter_level_id SMALLINT DEFAULT NULL,
    filter_category_id INTEGER DEFAULT NULL,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    cover_url TEXT,
    level_name VARCHAR(100),
    authors TEXT[],
    categories TEXT[],
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.title,
        b.description,
        b.cover_url,
        l.name as level_name,
        COALESCE(
            array_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as authors,
        COALESCE(
            array_agg(DISTINCT c.name) FILTER (WHERE c.id IS NOT NULL),
            ARRAY[]::VARCHAR[]
        ) as categories,
        ts_rank(
            to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, '')),
            plainto_tsquery('spanish', search_query)
        ) as relevance
    FROM books b
    LEFT JOIN book_levels l ON b.level_id = l.id
    LEFT JOIN books_authors ba ON b.id = ba.book_id
    LEFT JOIN book_authors a ON ba.author_id = a.id
    LEFT JOIN books_categories bc ON b.id = bc.book_id
    LEFT JOIN book_categories c ON bc.category_id = c.id
    WHERE
        b.is_published = TRUE
        AND b.deleted_at IS NULL
        AND to_tsvector('spanish', b.title || ' ' || COALESCE(b.description, ''))
            @@ plainto_tsquery('spanish', search_query)
        AND (filter_level_id IS NULL OR b.level_id = filter_level_id)
        AND (filter_category_id IS NULL OR EXISTS (
            SELECT 1 FROM books_categories
            WHERE book_id = b.id AND category_id = filter_category_id
        ))
    GROUP BY b.id, l.name
    ORDER BY relevance DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE;

SELECT 'PARTE 29: Funciones de books creadas' AS status;

-- ============================================================================
-- PARTE 30: TRIGGERS DE BOOKS
-- ============================================================================

SET search_path TO books, public;

DROP TRIGGER IF EXISTS trigger_books_updated_at ON books;
CREATE TRIGGER trigger_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_audit_books ON books;
CREATE TRIGGER trigger_audit_books
    AFTER INSERT OR UPDATE OR DELETE ON books
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS trigger_validate_book_publishing ON books;
CREATE TRIGGER trigger_validate_book_publishing
    BEFORE UPDATE ON books
    FOR EACH ROW
    EXECUTE FUNCTION validate_book_for_publishing();

SELECT 'PARTE 30: Triggers de books creados' AS status;

-- ============================================================================
-- PARTE 31: VISTA DE BOOKS
-- ============================================================================

SET search_path TO books, public;

CREATE OR REPLACE VIEW books_full_info AS
SELECT
    b.id,
    b.user_id,
    b.title,
    b.description,
    b.cover_url,
    b.is_published,
    b.is_featured,
    b.view_count,
    b.created_at,
    b.published_at,
    bt.name as type_name,
    l.name as level_name,
    l.min_age,
    l.max_age,
    COALESCE(
        array_agg(DISTINCT a.name ORDER BY a.name) FILTER (WHERE a.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as authors,
    COALESCE(
        array_agg(DISTINCT c.name ORDER BY c.name) FILTER (WHERE c.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as categories,
    COALESCE(
        array_agg(DISTINCT v.name ORDER BY v.name) FILTER (WHERE v.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as values,
    COALESCE(
        array_agg(DISTINCT g.name ORDER BY g.name) FILTER (WHERE g.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as genres,
    COALESCE(
        array_agg(DISTINCT t.name ORDER BY t.name) FILTER (WHERE t.id IS NOT NULL),
        ARRAY[]::VARCHAR[]
    ) as tags,
    (SELECT COUNT(*) FROM book_pages WHERE book_id = b.id) as page_count
FROM books b
LEFT JOIN book_types bt ON b.type_id = bt.id
LEFT JOIN book_levels l ON b.level_id = l.id
LEFT JOIN books_authors ba ON b.id = ba.book_id
LEFT JOIN book_authors a ON ba.author_id = a.id
LEFT JOIN books_categories bc ON b.id = bc.book_id
LEFT JOIN book_categories c ON bc.category_id = c.id
LEFT JOIN books_values bv ON b.id = bv.book_id
LEFT JOIN book_values v ON bv.value_id = v.id
LEFT JOIN books_genres bg ON b.id = bg.book_id
LEFT JOIN book_genres g ON bg.genre_id = g.id
LEFT JOIN books_tags btg ON b.id = btg.book_id
LEFT JOIN book_tags t ON btg.tag_id = t.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, bt.name, l.name, l.min_age, l.max_age;

SELECT 'PARTE 31: Vista books_full_info creada' AS status;

-- ============================================================================
-- PARTE 32: RLS PARA BOOKS
-- ============================================================================

SET search_path TO books, public;

-- Habilitar RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE books_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_characters ENABLE ROW LEVEL SECURITY;

-- Policies para service_role
CREATE POLICY "Service role: acceso total a books" ON books FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a book_pages" ON book_pages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_authors" ON books_authors FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_characters" ON books_characters FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_categories" ON books_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_values" ON books_values FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_genres" ON books_genres FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_languages" ON books_languages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a books_tags" ON books_tags FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a book_audit_logs" ON book_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role: acceso total a book_views" ON book_views FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies publicas para libros publicados
CREATE POLICY "Publico: leer libros publicados" ON books FOR SELECT TO anon, authenticated
    USING (is_published = TRUE AND deleted_at IS NULL);

CREATE POLICY "Publico: leer book_pages de libros publicados" ON book_pages FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_pages.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_authors de libros publicados" ON books_authors FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_authors.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_characters de libros publicados" ON books_characters FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_characters.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_categories de libros publicados" ON books_categories FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_categories.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_values de libros publicados" ON books_values FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_values.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_genres de libros publicados" ON books_genres FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_genres.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_languages de libros publicados" ON books_languages FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_languages.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

CREATE POLICY "Publico: leer books_tags de libros publicados" ON books_tags FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_tags.book_id AND books.is_published = TRUE AND books.deleted_at IS NULL));

-- Policies para usuarios autenticados (sus propios libros)
CREATE POLICY "Usuarios: leer libros propios" ON books FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Usuarios: crear libros propios" ON books FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Usuarios: actualizar libros propios" ON books FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Usuarios: eliminar libros propios" ON books FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Usuarios: leer book_pages de libros propios" ON book_pages FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: crear book_pages en libros propios" ON book_pages FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: actualizar book_pages de libros propios" ON book_pages FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: eliminar book_pages de libros propios" ON book_pages FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_pages.book_id AND books.user_id = auth.uid()));

CREATE POLICY "Usuarios: gestionar books_authors de libros propios" ON books_authors FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_authors.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_characters de libros propios" ON books_characters FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_characters.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_categories de libros propios" ON books_categories FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_categories.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_values de libros propios" ON books_values FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_values.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_genres de libros propios" ON books_genres FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_genres.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_languages de libros propios" ON books_languages FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_languages.book_id AND books.user_id = auth.uid()));
CREATE POLICY "Usuarios: gestionar books_tags de libros propios" ON books_tags FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM books WHERE books.id = books_tags.book_id AND books.user_id = auth.uid()));

-- Policies de lectura publica para catalogos
CREATE POLICY "Publico: leer tipos de libros" ON book_types FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer niveles de lectura" ON book_levels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer categorias" ON book_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer valores" ON book_values FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer generos" ON book_genres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer idiomas activos" ON book_languages FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Publico: leer etiquetas" ON book_tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer autores" ON book_authors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Publico: leer personajes" ON book_characters FOR SELECT TO anon, authenticated USING (true);

-- Policies para auditoria y vistas
CREATE POLICY "Usuarios: ver sus propios registros de auditoria" ON book_audit_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Cualquiera: insertar vistas de libros" ON book_views FOR INSERT TO anon, authenticated WITH CHECK (true);

SELECT 'PARTE 32: RLS para books creado' AS status;

-- ============================================================================
-- PARTE 33: GRANTS FINALES
-- ============================================================================

-- Grants para schema app
GRANT SELECT ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT INSERT, UPDATE ON app.user_profiles TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA app TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app TO authenticated, service_role;

-- Grants para funciones publicas
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_route(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.search_users_by_email(text) TO authenticated;

-- Grants para route_permissions y user_route_permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON app.route_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_route_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.role_language_access TO authenticated;

SELECT 'PARTE 33: Grants finales aplicados' AS status;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================

SELECT 'SETUP UNIFICADO COMPLETADO' AS status;

-- Verificar tablas en schema app
SELECT 'Tablas en app:' as info, count(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'app' AND table_type = 'BASE TABLE';

-- Verificar tablas en schema books
SELECT 'Tablas en books:' as info, count(*) as cantidad
FROM information_schema.tables
WHERE table_schema = 'books' AND table_type = 'BASE TABLE';

-- Verificar funciones en app
SELECT 'Funciones en app:' as info, count(*) as cantidad
FROM information_schema.routines
WHERE routine_schema = 'app';

-- Verificar funciones en books
SELECT 'Funciones en books:' as info, count(*) as cantidad
FROM information_schema.routines
WHERE routine_schema = 'books';

-- ============================================================================
-- FIN DEL SCRIPT SETUP UNIFICADO
-- ============================================================================
-- Este script crea toda la estructura de la base de datos:
-- - Schema app: auth, organizations, translations, routes, permissions, authors, communities, subscriptions
-- - Schema books: catalogos, libros, paginas, relaciones, vistas
-- - Todas las funciones, triggers, vistas y politicas RLS
-- ============================================================================
