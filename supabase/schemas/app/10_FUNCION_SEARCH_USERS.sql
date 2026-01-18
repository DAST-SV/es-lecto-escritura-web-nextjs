-- ============================================
-- SCRIPT 10: FUNCIÓN SEARCH_USERS_BY_EMAIL
-- ============================================

DROP FUNCTION IF EXISTS public.search_users_by_email(text) CASCADE;
DROP FUNCTION IF EXISTS app.search_users_by_email(text) CASCADE;

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

-- Wrapper público
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

-- Permisos
GRANT EXECUTE ON FUNCTION public.search_users_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION app.search_users_by_email(text) TO authenticated;

-- Comentario
COMMENT ON FUNCTION app.search_users_by_email IS 
'Busca usuarios por email - Límite 50 resultados';

-- Probar
SELECT * FROM public.search_users_by_email('test');