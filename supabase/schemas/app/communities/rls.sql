-- =============================================
-- RLS POLICIES PARA COMUNIDADES
-- =============================================

ALTER TABLE app.author_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.community_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.community_payment_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- AUTHOR_COMMUNITIES
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_author_communities" ON app.author_communities;
CREATE POLICY "service_role_author_communities" ON app.author_communities
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: comunidades activas
DROP POLICY IF EXISTS "public_read_author_communities" ON app.author_communities;
CREATE POLICY "public_read_author_communities" ON app.author_communities
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

-- Autor puede crear su comunidad
DROP POLICY IF EXISTS "authors_create_community" ON app.author_communities;
CREATE POLICY "authors_create_community" ON app.author_communities
    FOR INSERT TO authenticated
    WITH CHECK (author_id = auth.uid());

-- Autor puede actualizar su comunidad
DROP POLICY IF EXISTS "authors_update_community" ON app.author_communities;
CREATE POLICY "authors_update_community" ON app.author_communities
    FOR UPDATE TO authenticated
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Autor puede ver su comunidad (incluso si no está activa)
DROP POLICY IF EXISTS "authors_view_own_community" ON app.author_communities;
CREATE POLICY "authors_view_own_community" ON app.author_communities
    FOR SELECT TO authenticated
    USING (author_id = auth.uid());

-- =============================================
-- COMMUNITY_PLANS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_community_plans" ON app.community_plans;
CREATE POLICY "service_role_community_plans" ON app.community_plans
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: planes activos de comunidades activas
DROP POLICY IF EXISTS "public_read_community_plans" ON app.community_plans;
CREATE POLICY "public_read_community_plans" ON app.community_plans
    FOR SELECT TO anon, authenticated
    USING (
        is_active = TRUE
        AND EXISTS (
            SELECT 1 FROM app.author_communities ac
            WHERE ac.id = community_id AND ac.is_active = TRUE
        )
    );

-- Autor puede gestionar planes de su comunidad
DROP POLICY IF EXISTS "authors_manage_community_plans" ON app.community_plans;
CREATE POLICY "authors_manage_community_plans" ON app.community_plans
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.author_communities ac
            WHERE ac.id = community_id AND ac.author_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM app.author_communities ac
            WHERE ac.id = community_id AND ac.author_id = auth.uid()
        )
    );

-- =============================================
-- COMMUNITY_MEMBERSHIPS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_community_memberships" ON app.community_memberships;
CREATE POLICY "service_role_community_memberships" ON app.community_memberships
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuario puede ver sus propias membresías
DROP POLICY IF EXISTS "users_view_own_memberships" ON app.community_memberships;
CREATE POLICY "users_view_own_memberships" ON app.community_memberships
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Usuario puede crear membresía (unirse a comunidad)
DROP POLICY IF EXISTS "users_create_membership" ON app.community_memberships;
CREATE POLICY "users_create_membership" ON app.community_memberships
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Usuario puede actualizar su membresía (cancelar, pausar)
DROP POLICY IF EXISTS "users_update_own_membership" ON app.community_memberships;
CREATE POLICY "users_update_own_membership" ON app.community_memberships
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Autor puede ver miembros de su comunidad
DROP POLICY IF EXISTS "authors_view_community_members" ON app.community_memberships;
CREATE POLICY "authors_view_community_members" ON app.community_memberships
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.author_communities ac
            WHERE ac.id = community_id AND ac.author_id = auth.uid()
        )
    );

-- =============================================
-- COMMUNITY_PAYMENT_HISTORY
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_community_payment_history" ON app.community_payment_history;
CREATE POLICY "service_role_community_payment_history" ON app.community_payment_history
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuario puede ver su propio historial de pagos
DROP POLICY IF EXISTS "users_view_own_payment_history" ON app.community_payment_history;
CREATE POLICY "users_view_own_payment_history" ON app.community_payment_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.community_memberships cm
            WHERE cm.id = membership_id AND cm.user_id = auth.uid()
        )
    );

-- Autor puede ver historial de pagos de su comunidad
DROP POLICY IF EXISTS "authors_view_community_payments" ON app.community_payment_history;
CREATE POLICY "authors_view_community_payments" ON app.community_payment_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.community_memberships cm
            JOIN app.author_communities ac ON ac.id = cm.community_id
            WHERE cm.id = membership_id AND ac.author_id = auth.uid()
        )
    );
