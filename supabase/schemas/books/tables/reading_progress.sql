-- supabase/schemas/books/tables/reading_progress.sql
-- ============================================================================
-- TABLA: reading_progress
-- DESCRIPCIÓN: Progreso de lectura de usuarios
-- ============================================================================

SET search_path TO books, app, public;

CREATE TABLE IF NOT EXISTS books.reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages_read INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  reading_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(book_id, user_id),
  CONSTRAINT progress_completion_range CHECK (completion_percentage >= 0 AND completion_percentage <= 100)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reading_progress_book ON books.reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON books.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_completed ON books.reading_progress(is_completed);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON books.reading_progress(last_read_at DESC);

COMMENT ON TABLE books.reading_progress IS 'Progreso de lectura por usuario y libro';
COMMENT ON COLUMN books.reading_progress.completion_percentage IS 'Porcentaje de completado (0-100)';
COMMENT ON COLUMN books.reading_progress.reading_time_seconds IS 'Tiempo total de lectura en segundos';

SELECT 'BOOKS: Tabla reading_progress creada' AS status;
