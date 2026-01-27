-- ======================================================
-- SISTEMA DE ESTADÍSTICAS DE LECTURA - FUNCIONES
-- Archivo: analytics/functions.sql
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- TRIGGER: actualización automática de updated_at
-- ======================================================
CREATE TRIGGER trigger_user_progress_updated_at
BEFORE UPDATE ON user_book_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- FUNCIÓN: refresh_book_statistics
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

COMMENT ON FUNCTION refresh_book_statistics IS 'Recalcula y actualiza las estadísticas agregadas de un libro';
