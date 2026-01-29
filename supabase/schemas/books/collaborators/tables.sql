-- =============================================
-- SISTEMA DE COLABORADORES DE LIBROS
-- =============================================
-- Reemplaza book_authors manual por usuarios reales
-- Roles: author, co_author, editor, illustrator, translator
-- =============================================

-- Tipo ENUM para roles de colaboradores
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaborator_role' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'books')) THEN
        CREATE TYPE books.collaborator_role AS ENUM ('author', 'co_author', 'editor', 'illustrator', 'translator');
    END IF;
END $$;

-- Tabla de colaboradores de libros (vinculada a usuarios reales)
CREATE TABLE IF NOT EXISTS books.book_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role books.collaborator_role NOT NULL DEFAULT 'author',
    display_order SMALLINT DEFAULT 1,
    is_primary BOOLEAN DEFAULT FALSE,
    contribution_description TEXT,
    revenue_share_percentage DECIMAL(5,2) DEFAULT 0, -- Para monetización futura
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_collaborators UNIQUE(book_id, user_id, role)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_book_collaborators_book ON books.book_collaborators(book_id);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_user ON books.book_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_role ON books.book_collaborators(role);
CREATE INDEX IF NOT EXISTS idx_book_collaborators_primary ON books.book_collaborators(is_primary) WHERE is_primary = TRUE;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION books.update_collaborators_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_collaborators_updated_at ON books.book_collaborators;
CREATE TRIGGER trg_book_collaborators_updated_at
    BEFORE UPDATE ON books.book_collaborators
    FOR EACH ROW
    EXECUTE FUNCTION books.update_collaborators_updated_at();

-- =============================================
-- VISTA DE COLABORADORES CON INFORMACIÓN DE USUARIO
-- =============================================

CREATE OR REPLACE VIEW books.v_book_collaborators_full AS
SELECT
    bc.id,
    bc.book_id,
    bc.user_id,
    bc.role,
    bc.display_order,
    bc.is_primary,
    bc.contribution_description,
    bc.revenue_share_percentage,
    bc.added_at,
    -- Datos del usuario
    COALESCE(up.display_name, up.first_name || ' ' || up.last_name, au.email) AS user_display_name,
    up.avatar_url AS user_avatar_url,
    up.bio AS user_bio,
    -- Datos del perfil de autor si existe
    ap.username AS author_username,
    ap.is_verified AS author_is_verified
FROM books.book_collaborators bc
JOIN auth.users au ON au.id = bc.user_id
LEFT JOIN app.user_profiles up ON up.user_id = bc.user_id
LEFT JOIN app.author_profiles ap ON ap.user_id = bc.user_id
ORDER BY bc.book_id, bc.display_order, bc.added_at;

-- =============================================
-- FUNCIÓN PARA BUSCAR USUARIOS PARA COLABORACIÓN
-- =============================================

CREATE OR REPLACE FUNCTION books.search_users_for_collaboration(
    p_search_term VARCHAR,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    user_id UUID,
    display_name VARCHAR,
    email VARCHAR,
    avatar_url TEXT,
    is_author BOOLEAN,
    author_username VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        au.id AS user_id,
        COALESCE(up.display_name, up.first_name || ' ' || up.last_name)::VARCHAR AS display_name,
        au.email::VARCHAR,
        up.avatar_url,
        (ap.user_id IS NOT NULL) AS is_author,
        ap.username AS author_username
    FROM auth.users au
    LEFT JOIN app.user_profiles up ON up.user_id = au.id
    LEFT JOIN app.author_profiles ap ON ap.user_id = au.id
    WHERE
        au.email ILIKE '%' || p_search_term || '%'
        OR up.display_name ILIKE '%' || p_search_term || '%'
        OR up.first_name ILIKE '%' || p_search_term || '%'
        OR up.last_name ILIKE '%' || p_search_term || '%'
        OR ap.username ILIKE '%' || p_search_term || '%'
    ORDER BY
        CASE WHEN ap.user_id IS NOT NULL THEN 0 ELSE 1 END, -- Autores primero
        COALESCE(up.display_name, au.email)
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE books.book_collaborators IS 'Colaboradores de libros vinculados a usuarios reales de la plataforma';
COMMENT ON COLUMN books.book_collaborators.role IS 'Rol del colaborador: author, co_author, editor, illustrator, translator';
COMMENT ON COLUMN books.book_collaborators.display_order IS 'Orden de aparición en la lista de colaboradores';
COMMENT ON COLUMN books.book_collaborators.is_primary IS 'Indica si es el colaborador principal (autor principal)';
COMMENT ON COLUMN books.book_collaborators.revenue_share_percentage IS 'Porcentaje de ingresos para monetización futura';
COMMENT ON VIEW books.v_book_collaborators_full IS 'Vista con información completa de colaboradores incluyendo datos de usuario y autor';
COMMENT ON FUNCTION books.search_users_for_collaboration IS 'Busca usuarios para agregar como colaboradores de un libro';
