-- supabase/schemas/app/permissions/functions/get_user_by_id.sql
-- ============================================
-- FUNCIÓN: get_user_by_id
-- Obtiene datos de un usuario por su UUID desde auth.users
-- Necesario para cargar autores en modo edición
-- ============================================

CREATE OR REPLACE FUNCTION app.get_user_by_id(
  p_user_id uuid
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
  WHERE au.id = p_user_id
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_by_id(p_user_id uuid)
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
  SELECT * FROM app.get_user_by_id(p_user_id);
$$;

GRANT EXECUTE ON FUNCTION public.get_user_by_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app.get_user_by_id(uuid) TO authenticated;

COMMENT ON FUNCTION app.get_user_by_id IS 'Obtiene datos de un usuario por su UUID desde auth.users';
