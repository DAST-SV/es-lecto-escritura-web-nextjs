-- ======================================================
-- SISTEMA DE ESTADÍSTICAS DE LECTURA
-- Archivo: supabase/schemas/books/06_reading_analytics_schema.sql
--
-- Propósito:
--   Definir la estructura completa de base de datos
--   para registrar, analizar y exponer métricas de
--   lectura de libros de forma segura.
-- ======================================================


-- ======================================================
-- CONTEXTO DE EJECUCIÓN
-- ======================================================

-- Establece el orden de búsqueda de schemas.
-- Primero se buscan objetos en 'books' y luego en 'public'.
SET search_path TO books, public;


-- ======================================================
-- LIMPIEZA DE ESTRUCTURAS EXISTENTES
-- ======================================================

-- Se eliminan las tablas si ya existen.
-- CASCADE asegura que se eliminen dependencias (FK, vistas, etc.)
-- Esto permite que el script sea reutilizable.
DROP TABLE IF EXISTS book_statistics CASCADE;
DROP TABLE IF EXISTS user_book_progress CASCADE;
DROP TABLE IF EXISTS book_page_views CASCADE;
DROP TABLE IF EXISTS book_reading_sessions CASCADE;


-- ======================================================
-- TABLA: book_reading_sessions
-- ======================================================
-- Registra sesiones completas de lectura.
-- Una sesión representa una lectura continua de un libro.
-- ======================================================

CREATE TABLE book_reading_sessions (

    -- Identificador único de la sesión (generado en servidor)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador del libro leído
    book_id UUID NOT NULL,

    -- Usuario autenticado; NULL si es usuario anónimo
    user_id UUID NULL,

    -- Identificador de sesión generado por el cliente
    session_id VARCHAR(100) NOT NULL,

    -- Inicio y fin de la sesión
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at   TIMESTAMPTZ NULL,

    -- Duración total de la sesión en segundos
    duration_seconds INTEGER NULL,

    -- Información de progreso
    total_pages SMALLINT NOT NULL,
    pages_read INTEGER NOT NULL DEFAULT 0,
    unique_pages INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,

    -- Metadata del dispositivo del usuario
    device_type VARCHAR(50) NULL,
    browser     VARCHAR(100) NULL,
    os          VARCHAR(100) NULL,
    ip_address  INET NULL,

    -- Fecha de creación del registro
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Relación con el libro
    CONSTRAINT fk_reading_sessions_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    -- Relación con el usuario
    CONSTRAINT fk_reading_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    -- Validación de duración
    CONSTRAINT chk_reading_sessions_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    -- Validación de porcentaje de completitud
    CONSTRAINT chk_reading_sessions_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

-- Índices para mejorar rendimiento de consultas
CREATE INDEX idx_reading_sessions_book
    ON book_reading_sessions(book_id);

CREATE INDEX idx_reading_sessions_user
    ON book_reading_sessions(user_id);

CREATE INDEX idx_reading_sessions_started_at
    ON book_reading_sessions(started_at DESC);

CREATE INDEX idx_reading_sessions_book_user
    ON book_reading_sessions(book_id, user_id);

CREATE INDEX idx_reading_sessions_session_id
    ON book_reading_sessions(session_id);


-- ======================================================
-- TABLA: book_page_views
-- ======================================================
-- Registra cada visualización individual de página.
-- Es la capa más detallada del tracking.
-- ======================================================

CREATE TABLE book_page_views (

    -- Identificador único del evento
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Libro al que pertenece la página
    book_id UUID NOT NULL,

    -- Identificador de la sesión
    session_id VARCHAR(100) NOT NULL,

    -- Número de página visualizada
    page_number SMALLINT NOT NULL,

    -- Momento de visualización
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Tiempo pasado en la página
    duration_seconds INTEGER NULL,

    -- Interacciones realizadas por el usuario
    interactions_count INTEGER NOT NULL DEFAULT 0,

    -- Indica si el usuario hizo zoom
    zoomed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Relación con el libro
    CONSTRAINT fk_page_views_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    -- Validación de duración
    CONSTRAINT chk_page_views_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    -- Validación de número de página
    CONSTRAINT chk_page_views_page_positive
        CHECK (page_number > 0)
);

-- Índices para analítica y filtros
CREATE INDEX idx_page_views_book
    ON book_page_views(book_id);

CREATE INDEX idx_page_views_session
    ON book_page_views(session_id);

CREATE INDEX idx_page_views_book_page
    ON book_page_views(book_id, page_number);

CREATE INDEX idx_page_views_viewed_at
    ON book_page_views(viewed_at DESC);


-- ======================================================
-- TABLA: user_book_progress
-- ======================================================
-- Mantiene el estado ACTUAL de lectura del usuario.
-- No guarda histórico, solo el progreso vigente.
-- ======================================================

CREATE TABLE user_book_progress (

    -- Identificador del registro
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario dueño del progreso
    user_id UUID NOT NULL,

    -- Libro asociado
    book_id UUID NOT NULL,

    -- Estado de lectura
    current_page SMALLINT NOT NULL DEFAULT 1,
    total_pages  SMALLINT NOT NULL,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,

    -- Métricas acumuladas
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,

    -- Preferencias del usuario
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarks JSONB NULL DEFAULT '[]'::jsonb,

    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Relación con el usuario
    CONSTRAINT fk_user_progress_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    -- Relación con el libro
    CONSTRAINT fk_user_progress_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    -- Un solo progreso por usuario y libro
    CONSTRAINT uq_user_progress_user_book
        UNIQUE (user_id, book_id),

    -- Validaciones
    CONSTRAINT chk_user_progress_pages
        CHECK (current_page > 0 AND total_pages > 0),

    CONSTRAINT chk_user_progress_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

-- Índices para consultas comunes
CREATE INDEX idx_user_progress_user
    ON user_book_progress(user_id);

CREATE INDEX idx_user_progress_book
    ON user_book_progress(book_id);

CREATE INDEX idx_user_progress_user_book
    ON user_book_progress(user_id, book_id);

CREATE INDEX idx_user_progress_updated_at
    ON user_book_progress(updated_at DESC);

CREATE INDEX idx_user_progress_favorites
    ON user_book_progress(user_id)
    WHERE is_favorite = TRUE;


-- ======================================================
-- TABLA: book_statistics
-- ======================================================
-- Contiene estadísticas agregadas y precalculadas
-- por libro para mejorar rendimiento.
-- ======================================================

CREATE TABLE book_statistics (

    -- Libro al que pertenecen las métricas
    book_id UUID PRIMARY KEY,

    -- Lectores
    total_readers INTEGER NOT NULL DEFAULT 0,
    active_readers INTEGER NOT NULL DEFAULT 0,
    completed_readers INTEGER NOT NULL DEFAULT 0,

    -- Sesiones
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    avg_session_duration INTEGER NOT NULL DEFAULT 0,

    -- Páginas
    total_page_views INTEGER NOT NULL DEFAULT 0,
    avg_pages_per_session NUMERIC(5,2) NOT NULL DEFAULT 0,
    most_viewed_page SMALLINT NULL,

    -- Engagement
    avg_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,

    -- Fechas relevantes
    first_read_at TIMESTAMPTZ NULL,
    last_read_at  TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Relación con el libro
    CONSTRAINT fk_book_stats_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);

-- Índices para ranking y dashboards
CREATE INDEX idx_book_stats_total_readers
    ON book_statistics(total_readers DESC);

CREATE INDEX idx_book_stats_avg_completion
    ON book_statistics(avg_completion_rate DESC);

CREATE INDEX idx_book_stats_updated_at
    ON book_statistics(updated_at DESC);


-- ======================================================
-- TRIGGER: actualización automática de updated_at
-- ======================================================

-- Función que actualiza la columna updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger asociado a user_book_progress
CREATE TRIGGER trigger_user_progress_updated_at
BEFORE UPDATE ON user_book_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- ======================================================
-- FUNCIÓN: refresh_book_statistics
-- ======================================================
-- Recalcula y actualiza las estadísticas agregadas
-- de un libro específico.
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


-- ======================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ======================================================

-- Se habilita RLS en todas las tablas
ALTER TABLE book_reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_book_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_statistics ENABLE ROW LEVEL SECURITY;


-- ======================================================
-- POLÍTICAS DE SEGURIDAD
-- ======================================================

-- Service role: acceso total
CREATE POLICY "Service role: acceso total a book_reading_sessions"
    ON book_reading_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_page_views"
    ON book_page_views
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a user_book_progress"
    ON user_book_progress
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role: acceso total a book_statistics"
    ON book_statistics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Usuarios autenticados
CREATE POLICY "Usuarios: insertar sus propias sesiones"
    ON book_reading_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: ver sus propias sesiones"
    ON book_reading_sessions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Usuarios: insertar vistas de páginas"
    ON book_page_views
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios: ver vistas de páginas"
    ON book_page_views
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios: gestionar su propio progreso"
    ON user_book_progress
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Público: ver estadísticas de libros"
    ON book_statistics
    FOR SELECT
    TO authenticated, anon
    USING (true);


-- ======================================================
-- PERMISOS DE TABLAS
-- ======================================================

GRANT SELECT, INSERT, UPDATE
    ON book_reading_sessions
    TO authenticated;

GRANT SELECT, INSERT
    ON book_page_views
    TO authenticated;

GRANT SELECT, INSERT, UPDATE
    ON user_book_progress
    TO authenticated;

GRANT SELECT
    ON book_statistics
    TO authenticated, anon;
