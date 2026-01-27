-- ======================================================
-- SISTEMA DE ESTADÍSTICAS DE LECTURA - TABLAS
-- Archivo: analytics/tables.sql
-- ======================================================

SET search_path TO books, public;

-- ======================================================
-- LIMPIEZA DE ESTRUCTURAS EXISTENTES
-- ======================================================
DROP TABLE IF EXISTS book_statistics CASCADE;
DROP TABLE IF EXISTS user_book_progress CASCADE;
DROP TABLE IF EXISTS book_page_views CASCADE;
DROP TABLE IF EXISTS book_reading_sessions CASCADE;

-- ======================================================
-- TABLA: book_reading_sessions
-- ======================================================
CREATE TABLE book_reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    user_id UUID NULL,
    session_id VARCHAR(100) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ NULL,
    duration_seconds INTEGER NULL,
    total_pages SMALLINT NOT NULL,
    pages_read INTEGER NOT NULL DEFAULT 0,
    unique_pages INTEGER NOT NULL DEFAULT 0,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    device_type VARCHAR(50) NULL,
    browser VARCHAR(100) NULL,
    os VARCHAR(100) NULL,
    ip_address INET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reading_sessions_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reading_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_reading_sessions_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    CONSTRAINT chk_reading_sessions_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_reading_sessions_book ON book_reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_user ON book_reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_started_at ON book_reading_sessions(started_at DESC);
CREATE INDEX idx_reading_sessions_book_user ON book_reading_sessions(book_id, user_id);
CREATE INDEX idx_reading_sessions_session_id ON book_reading_sessions(session_id);

-- ======================================================
-- TABLA: book_page_views
-- ======================================================
CREATE TABLE book_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    page_number SMALLINT NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_seconds INTEGER NULL,
    interactions_count INTEGER NOT NULL DEFAULT 0,
    zoomed BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_page_views_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_page_views_duration_positive
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    CONSTRAINT chk_page_views_page_positive
        CHECK (page_number > 0)
);

CREATE INDEX idx_page_views_book ON book_page_views(book_id);
CREATE INDEX idx_page_views_session ON book_page_views(session_id);
CREATE INDEX idx_page_views_book_page ON book_page_views(book_id, page_number);
CREATE INDEX idx_page_views_viewed_at ON book_page_views(viewed_at DESC);

-- ======================================================
-- TABLA: user_book_progress
-- ======================================================
CREATE TABLE user_book_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    book_id UUID NOT NULL,
    current_page SMALLINT NOT NULL DEFAULT 1,
    total_pages SMALLINT NOT NULL,
    completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    last_read_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    bookmarks JSONB NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_progress_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_progress_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_progress_user_book
        UNIQUE (user_id, book_id),

    CONSTRAINT chk_user_progress_pages
        CHECK (current_page > 0 AND total_pages > 0),

    CONSTRAINT chk_user_progress_completion
        CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_user_progress_user ON user_book_progress(user_id);
CREATE INDEX idx_user_progress_book ON user_book_progress(book_id);
CREATE INDEX idx_user_progress_user_book ON user_book_progress(user_id, book_id);
CREATE INDEX idx_user_progress_updated_at ON user_book_progress(updated_at DESC);
CREATE INDEX idx_user_progress_favorites ON user_book_progress(user_id) WHERE is_favorite = TRUE;

-- ======================================================
-- TABLA: book_statistics (agregada)
-- ======================================================
CREATE TABLE book_statistics (
    book_id UUID PRIMARY KEY,
    total_readers INTEGER NOT NULL DEFAULT 0,
    active_readers INTEGER NOT NULL DEFAULT 0,
    completed_readers INTEGER NOT NULL DEFAULT 0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    total_reading_time INTEGER NOT NULL DEFAULT 0,
    avg_session_duration INTEGER NOT NULL DEFAULT 0,
    total_page_views INTEGER NOT NULL DEFAULT 0,
    avg_pages_per_session NUMERIC(5,2) NOT NULL DEFAULT 0,
    most_viewed_page SMALLINT NULL,
    avg_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    bounce_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    first_read_at TIMESTAMPTZ NULL,
    last_read_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_book_stats_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_book_stats_total_readers ON book_statistics(total_readers DESC);
CREATE INDEX idx_book_stats_avg_completion ON book_statistics(avg_completion_rate DESC);
CREATE INDEX idx_book_stats_updated_at ON book_statistics(updated_at DESC);
