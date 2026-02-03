-- supabase/schemas/books/tables/reading_sessions.sql
-- ============================================================================
-- TABLA: reading_sessions
-- DESCRIPCIÓN: Sesiones de lectura individuales
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_page INTEGER NOT NULL,
  end_page INTEGER NOT NULL,
  pages_read INTEGER GENERATED ALWAYS AS (end_page - start_page + 1) STORED,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  device_type VARCHAR(50),
  language_code VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON books.reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user ON books.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_started ON books.reading_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_language ON books.reading_sessions(language_code);

COMMENT ON TABLE books.reading_sessions IS 'Sesiones individuales de lectura para analytics';
COMMENT ON COLUMN books.reading_sessions.device_type IS 'Tipo de dispositivo (mobile, tablet, desktop)';
COMMENT ON COLUMN books.reading_sessions.language_code IS 'Idioma en que se leyó';

SELECT 'BOOKS: Tabla reading_sessions creada' AS status;
