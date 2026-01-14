-- ============================================
-- SCRIPT 10: FUNCIÓN SEARCH_USERS_BY_EMAIL
-- ============================================
-- Busca usuarios por email desde el cliente
-- ✅ Incluye permisos EXECUTE
-- ============================================

-- ============================================
-- CREAR FUNCIÓN EN SCHEMA APP
-- ============================================

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
SET search_path = public, auth
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

-- ============================================
-- CREAR WRAPPER EN PUBLIC
-- ============================================

CREATE OR REPLACE FUNCTION public.search_users_by_email(search_email text)
RETURNS TABLE (
  user_id uuid,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM app.search_users_by_email(search_email);
END;
$$;

-- ============================================
-- DAR PERMISOS EXECUTE
-- ============================================

GRANT EXECUTE ON FUNCTION public.search_users_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION app.search_users_by_email(text) TO authenticated;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON FUNCTION app.search_users_by_email IS 'Busca usuarios por email - Límite 50 resultados';

-- ============================================
-- VERIFICAR
-- ============================================

-- Buscar tu propio usuario
SELECT * FROM search_users_by_email('tu-email');
-- Debe retornar tu información
