-- =============================================
-- RLS POLICIES PARA SUSCRIPCIONES DE PLATAFORMA
-- =============================================

ALTER TABLE app.subscription_plan_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.platform_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.subscription_payment_history ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SUBSCRIPTION_PLAN_DEFINITIONS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_subscription_plan_definitions" ON app.subscription_plan_definitions;
CREATE POLICY "service_role_subscription_plan_definitions" ON app.subscription_plan_definitions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Lectura pública: planes activos
DROP POLICY IF EXISTS "public_read_subscription_plans" ON app.subscription_plan_definitions;
CREATE POLICY "public_read_subscription_plans" ON app.subscription_plan_definitions
    FOR SELECT TO anon, authenticated
    USING (is_active = TRUE);

-- =============================================
-- PLATFORM_SUBSCRIPTIONS
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_platform_subscriptions" ON app.platform_subscriptions;
CREATE POLICY "service_role_platform_subscriptions" ON app.platform_subscriptions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuario puede ver su propia suscripción
DROP POLICY IF EXISTS "users_view_own_subscription" ON app.platform_subscriptions;
CREATE POLICY "users_view_own_subscription" ON app.platform_subscriptions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- Usuario puede crear su suscripción
DROP POLICY IF EXISTS "users_create_subscription" ON app.platform_subscriptions;
CREATE POLICY "users_create_subscription" ON app.platform_subscriptions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Usuario puede actualizar su suscripción
DROP POLICY IF EXISTS "users_update_subscription" ON app.platform_subscriptions;
CREATE POLICY "users_update_subscription" ON app.platform_subscriptions
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- =============================================
-- SUBSCRIPTION_PAYMENT_HISTORY
-- =============================================

-- Service role: acceso total
DROP POLICY IF EXISTS "service_role_subscription_payment_history" ON app.subscription_payment_history;
CREATE POLICY "service_role_subscription_payment_history" ON app.subscription_payment_history
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Usuario puede ver su propio historial de pagos
DROP POLICY IF EXISTS "users_view_own_subscription_payments" ON app.subscription_payment_history;
CREATE POLICY "users_view_own_subscription_payments" ON app.subscription_payment_history
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM app.platform_subscriptions ps
            WHERE ps.id = subscription_id AND ps.user_id = auth.uid()
        )
    );
