-- ======================================================
-- SISTEMA DE ESTADÍSTICAS DE LECTURA - COMPLETO
-- Archivo: supabase/schemas/books/06_reading_analytics_schema.sql
-- Descripción: Tablas para tracking de lectura profesional
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- PASO 1: ELIMINAR TABLAS ANTIGUAS (si existen)
-- ======================================================
DROP TABLE IF EXISTS book_statistics CASCADE;
DROP TABLE IF EXISTS user_book_progress CASCADE;
DROP TABLE IF EXISTS book_page_views CASCADE;
DROP TABLE IF EXISTS book_reading_sessions CASCADE;

-- ======================================================
-- TABLA 1: Sesiones de Lectura Completas
-- ======================================================
CREATE TABLE book_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL, -- NULL para usuarios anónimos
    session_id VARCHAR(100) NOT NULL, -- ID de sesión del cliente
    
    -- Tiempos
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    duration_seconds INTEGER NULL, -- Calculado: ended_at - started_at
    
    -- Progreso
    total_pages SMALLINT NOT NULL,
    pages_read INTEGER NOT NULL DEFAULT 0, -- Páginas visitadas (puede incluir duplicados)
    unique_pages INTEGER NOT NULL DEFAULT 0, -- Páginas únicas visitadas
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0, -- % de páginas únicas
    
    -- Metadata del dispositivo
    device_type VARCHAR(50) NULL, -- 'desktop', 'mobile', 'tablet'
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    ip_address INET NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_reading_sessions_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_sessions_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT chk_reading_sessions_duration_positive 
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_reading_sessions_completion 
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

COMMENT ON TABLE book_reading_sessions IS 'Sesiones completas de lectura de libros';
COMMENT ON COLUMN book_reading_sessions.session_id IS 'ID único de sesión generado en el cliente';
COMMENT ON COLUMN book_reading_sessions.duration_seconds IS 'Duración total de la sesión en segundos';
COMMENT ON COLUMN book_reading_sessions.pages_read IS 'Total de veces que se visitaron páginas (con repeticiones)';
COMMENT ON COLUMN book_reading_sessions.unique_pages IS 'Número de páginas únicas visitadas';
COMMENT ON COLUMN book_reading_sessions.completion_percentage IS 'Porcentaje de completitud del libro';

CREATE INDEX idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_user ON book_reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_started_at ON book_reading_sessions(started_at DESC);
CREATE INDEX idx_reading_sessions_book_user ON book_reading_sessions(book_id, user_id);
CREATE INDEX idx_reading_sessions_session_id ON book_reading_sessions(session_id);

-- ======================================================
-- TABLA 2: Vistas de Páginas Individuales
-- ======================================================
CREATE TABLE book_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    session_id VARCHAR(100) NOT NULL, -- Relaciona con la sesión
    page_number SMALLINT NOT NULL,
    
    -- Tiempos
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NULL, -- Tiempo que pasó en esta página
    
    -- Acciones del usuario
    interactions_count INTEGER NOT NULL DEFAULT 0, -- Clicks, toques, etc.
    zoomed BOOLEAN NOT NULL DEFAULT FALSE, -- Si hizo zoom
    
    CONSTRAINT fk_page_views_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT chk_page_views_duration_positive 
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_page_views_page_positive 
        CHECK (page_number > 0)
);

COMMENT ON TABLE book_page_views IS 'Registro detallado de visualización de cada página';
COMMENT ON COLUMN book_page_views.session_id IS 'ID de sesión para agrupar vistas';
COMMENT ON COLUMN book_page_views.duration_seconds IS 'Segundos que el usuario pasó en esta página';
COMMENT ON COLUMN book_page_views.interactions_count IS 'Número de interacciones (clicks, gestos)';

CREATE INDEX idx_page_views_book ON book_page_views(book_id);
CREATE INDEX idx_page_views_session ON book_page_views(session_id);
CREATE INDEX idx_page_views_book_page ON book_page_views(book_id, page_number);
CREATE INDEX idx_page_views_viewed_at ON book_page_views(viewed_at DESC);

-- ======================================================
-- TABLA 3: Progreso del Usuario (Estado Actual)
-- ======================================================
CREATE TABLE user_book_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL,
    
    -- Estado de lectura
    current_page SMALLINT NOT NULL DEFAULT 1,
    total_pages SMALLINT NOT NULL,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Tiempos acumulados
    total_reading_time INTEGER NOT NULL DEFAULT 0, -- Segundos totales
    last_read_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    
    -- Favoritos y marcadores
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarks JSONB NULL DEFAULT '[]'::jsonb, -- Array de páginas marcadas
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_user_progress_user FOREIGN KEY (user_id)
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_progress_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_progress_user_book UNIQUE (user_id, book_id),
    CONSTRAINT chk_user_progress_pages CHECK (current_page > 0 AND total_pages > 0),
    CONSTRAINT chk_user_progress_completion CHECK (completion_percentage BETWEEN 0 AND 100)
);

COMMENT ON TABLE user_book_progress IS 'Progreso actual de lectura de cada usuario por libro';
COMMENT ON COLUMN user_book_progress.current_page IS 'Última página visitada por el usuario';
COMMENT ON COLUMN user_book_progress.total_reading_time IS 'Tiempo total de lectura acumulado en segundos';
COMMENT ON COLUMN user_book_progress.bookmarks IS 'Array JSON de páginas marcadas por el usuario';

CREATE INDEX idx_user_progress_user ON user_book_progress(user_id);
CREATE INDEX idx_user_progress_book ON user_book_progress(book_id);
CREATE INDEX idx_user_progress_user_book ON user_book_progress(user_id, book_id);
CREATE INDEX idx_user_progress_updated_at ON user_book_progress(updated_at DESC);
CREATE INDEX idx_user_progress_favorites ON user_book_progress(user_id) 
    WHERE is_favorite = TRUE;

-- ======================================================
-- TABLA 4: Estadísticas Agregadas por Libro (Materializada)
-- ======================================================
CREATE TABLE book_statistics (
    book_id UUID PRIMARY KEY,
    
    -- Lectores
    total_readers INTEGER NOT NULL DEFAULT 0, -- Usuarios únicos que lo leyeron
    active_readers INTEGER NOT NULL DEFAULT 0, -- Lo están leyendo actualmente
    completed_readers INTEGER NOT NULL DEFAULT 0, -- Lo terminaron
    
    -- Sesiones
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_reading_time INTEGER NOT NULL DEFAULT 0, -- Segundos totales
    avg_session_duration INTEGER NOT NULL DEFAULT 0, -- Promedio por sesión
    
    -- Páginas
    total_page_views INTEGER NOT NULL DEFAULT 0,
    avg_pages_per_session NUMERIC(5,2) NOT NULL DEFAULT 0,
    most_viewed_page SMALLINT NULL,
    
    -- Engagement
    avg_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- % promedio de completitud
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0, -- % que leen <10% y se van
    
    -- Timestamps
    first_read_at TIMESTAMPTZ NULL,
    last_read_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_book_stats_book FOREIGN KEY (book_id)
        REFERENCES books(id) ON DELETE CASCADE
);

COMMENT ON TABLE book_statistics IS 'Estadísticas agregadas y pre-calculadas por libro';
COMMENT ON COLUMN book_statistics.bounce_rate IS 'Porcentaje de usuarios que leyeron menos del 10%';

CREATE INDEX idx_book_stats_total_readers ON book_statistics(total_readers DESC);
CREATE INDEX idx_book_stats_avg_completion ON book_statistics(avg_completion_rate DESC);
CREATE INDEX idx_book_stats_updated_at ON book_statistics(updated_at DESC);

-- ======================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_progress_updated_at
    BEFORE UPDATE ON user_book_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- FUNCIÓN: Actualizar estadísticas agregadas
-- ======================================================
CREATE OR REPLACE FUNCTION refresh_book_statistics(target_book_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO book_statistics (
        book_id,
        total_readers,
        active_readers,
        completed_readers,
        total_sessions,
        total_reading_time,
        avg_session_duration,
        total_page_views,
        avg_pages_per_session,
        avg_completion_rate,
        first_read_at,
        last_read_at
    )
    SELECT
        target_book_id,
        COUNT(DISTINCT rs.user_id) FILTER (WHERE rs.user_id IS NOT NULL),
        COUNT(DISTINCT up.user_id) FILTER (WHERE up.is_completed = FALSE),
        COUNT(DISTINCT up.user_id) FILTER (WHERE up.is_completed = TRUE),
        COUNT(rs.id),
        COALESCE(SUM(rs.duration_seconds), 0),
        COALESCE(AVG(rs.duration_seconds), 0)::INTEGER,
        COUNT(pv.id),
        COALESCE(AVG(rs.pages_read), 0),
        COALESCE(AVG(rs.completion_percentage), 0),
        MIN(rs.started_at),
        MAX(rs.started_at)
    FROM book_reading_sessions rs
    LEFT JOIN user_book_progress up ON rs.book_id = up.book_id
    LEFT JOIN book_page_views pv ON rs.book_id = pv.book_id
    WHERE rs.book_id = target_book_id
    
    ON CONFLICT (book_id) 
    DO UPDATE SET
        total_readers = EXCLUDED.total_readers,
        active_readers = EXCLUDED.active_readers,
        completed_readers = EXCLUDED.completed_readers,
        total_sessions = EXCLUDED.total_sessions,
        total_reading_time = EXCLUDED.total_reading_time,
        avg_session_duration = EXCLUDED.avg_session_duration,
        total_page_views = EXCLUDED.total_page_views,
        avg_pages_per_session = EXCLUDED.avg_pages_per_session,
        avg_completion_rate = EXCLUDED.avg_completion_rate,
        first_read_at = EXCLUDED.first_read_at,
        last_read_at = EXCLUDED.last_read_at,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_book_statistics IS 'Actualiza las estadísticas agregadas de un libro específico';

-- ======================================================
-- PERMISOS RLS
-- ======================================================

-- Habilitar RLS
ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_statistics ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (acceso total)
CREATE POLICY "Service role: acceso total a book_reading_sessions"
    ON book_reading_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_page_views"
    ON book_page_views FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a user_book_progress"
    ON user_book_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_statistics"
    ON book_statistics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para usuarios autenticados
CREATE POLICY "Usuarios: insertar sus propias sesiones"
    ON book_reading_sessions FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: ver sus propias sesiones"
    ON book_reading_sessions FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: insertar vistas de páginas"
    ON book_page_views FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios: ver vistas de páginas"
    ON book_page_views FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Usuarios: gestionar su propio progreso"
    ON user_book_progress FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Público: ver estadísticas de libros"
    ON book_statistics FOR SELECT TO authenticated, anon
    USING (true);

-- ======================================================
-- PERMISOS DE TABLAS
-- ======================================================
GRANT SELECT, INSERT, UPDATE ON book_reading_sessions TO authenticated;
GRANT SELECT, INSERT ON book_page_views TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_book_progress TO authenticated;
GRANT SELECT ON book_statistics TO authenticated, anon;

-- ======================================================
-- VERIFICACIÓN FINAL
-- ======================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SISTEMA DE ANALYTICS DE LECTURA INSTALADO';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Tablas creadas:';
    RAISE NOTICE '   ✓ book_reading_sessions (sesiones completas)';
    RAISE NOTICE '   ✓ book_page_views (tiempo por página)';
    RAISE NOTICE '   ✓ user_book_progress (progreso del usuario)';
    RAISE NOTICE '   ✓ book_statistics (estadísticas agregadas)';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Políticas RLS aplicadas';
    RAISE NOTICE '⚙️  Función refresh_book_statistics() disponible';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema está listo para registrar lecturas';
    RAISE NOTICE '========================================';
END $$;