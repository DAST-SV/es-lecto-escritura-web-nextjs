-- =============================================
-- RLS POLICIES PARA AUTORES Y SEGUIDORES
-- =============================================

ALTER TABLE app.author_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.author_followers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- AUTHOR_PROFILES
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_author_profiles" ON app.author_profiles;
CREATE POLICY "service_role_author_profiles" ON app.author_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: perfiles públicos
DROP POLICY IF EXISTS "public_read_author_profiles" ON app.author_profiles;
CREATE POLICY "public_read_author_profiles" ON app.author_profiles
    FOR SELECT TO anon, authenticated
    USING (is_public = TRUE);

-- Usuario puede ver su propio perfil (incluso si no es público)
DROP POLICY IF EXISTS "users_read_own_profile" ON app.author_profiles;
CREATE POLICY "users_read_own_profile" ON app.author_profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Usuario puede crear su propio perfil de autor
DROP POLICY IF EXISTS "users_create_own_profile" ON app.author_profiles;
CREATE POLICY "users_create_own_profile" ON app.author_profiles
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Usuario puede actualizar su propio perfil
DROP POLICY IF EXISTS "users_update_own_profile" ON app.author_profiles;
CREATE POLICY "users_update_own_profile" ON app.author_profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Usuario puede eliminar su propio perfil
DROP POLICY IF EXISTS "users_delete_own_profile" ON app.author_profiles;
CREATE POLICY "users_delete_own_profile" ON app.author_profiles
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- =============================================
-- AUTHOR_FOLLOWERS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_author_followers" ON app.author_followers;
CREATE POLICY "service_role_author_followers" ON app.author_followers
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: ver seguidores de autores públicos
DROP POLICY IF EXISTS "public_read_author_followers" ON app.author_followers;
CREATE POLICY "public_read_author_followers" ON app.author_followers
    FOR SELECT TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.author_profiles ap
            WHERE ap.user_id = author_id AND ap.is_public = TRUE
        )
    );

-- Usuario puede seguir a un autor
DROP POLICY IF EXISTS "users_follow_author" ON app.author_followers;
CREATE POLICY "users_follow_author" ON app.author_followers
    FOR INSERT TO authenticated
    WITH CHECK (follower_id = auth.uid());

-- Usuario puede dejar de seguir
DROP POLICY IF EXISTS "users_unfollow_author" ON app.author_followers;
CREATE POLICY "users_unfollow_author" ON app.author_followers
    FOR DELETE TO authenticated
    USING (follower_id = auth.uid());

-- Usuario puede ver a quién sigue
DROP POLICY IF EXISTS "users_view_own_following" ON app.author_followers;
CREATE POLICY "users_view_own_following" ON app.author_followers
    FOR SELECT TO authenticated
    USING (follower_id = auth.uid());
