-- =============================================
-- TRADUCCIONES DE LIBROS (Multi-idioma)
-- =============================================
-- Permite crear versiones completas del libro en diferentes idiomas
-- Cada idioma tiene: título, descripción, portada, PDF
-- =============================================

-- Tabla de traducciones/versiones de libros por idioma
CREATE TABLE IF NOT EXISTS books.book_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    pdf_url TEXT,
    is_original BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_translations_book_language UNIQUE(book_id, language_code)
);

-- Tabla de traducciones de páginas por idioma
CREATE TABLE IF NOT EXISTS books.book_page_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_page_id UUID NOT NULL REFERENCES books.book_pages(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    title TEXT,
    content TEXT,
    image_url TEXT,
    audio_url TEXT,
    -- Para lectura guiada futura: sincronización audio con texto
    audio_timestamps JSONB, -- [{"word": "Había", "start": 0.0, "end": 0.3}, ...]
    -- Para OCR futuro: posiciones de palabras en la imagen para overlay visual
    text_overlay_data JSONB, -- [{"word": "Había", "x": 100, "y": 50, "width": 80, "height": 20}, ...]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_book_page_translations_page_language UNIQUE(book_page_id, language_code)
);

-- Índices para book_translations
CREATE INDEX IF NOT EXISTS idx_book_translations_book_id ON books.book_translations(book_id);
CREATE INDEX IF NOT EXISTS idx_book_translations_language ON books.book_translations(language_code);
CREATE INDEX IF NOT EXISTS idx_book_translations_active ON books.book_translations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_book_translations_original ON books.book_translations(is_original) WHERE is_original = TRUE;

-- Índices para book_page_translations
CREATE INDEX IF NOT EXISTS idx_book_page_translations_page_id ON books.book_page_translations(book_page_id);
CREATE INDEX IF NOT EXISTS idx_book_page_translations_language ON books.book_page_translations(language_code);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION books.update_book_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_book_translations_updated_at ON books.book_translations;
CREATE TRIGGER trg_book_translations_updated_at
    BEFORE UPDATE ON books.book_translations
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_translations_updated_at();

DROP TRIGGER IF EXISTS trg_book_page_translations_updated_at ON books.book_page_translations;
CREATE TRIGGER trg_book_page_translations_updated_at
    BEFORE UPDATE ON books.book_page_translations
    FOR EACH ROW
    EXECUTE FUNCTION books.update_book_translations_updated_at();

-- Comentarios
COMMENT ON TABLE books.book_translations IS 'Versiones de libros por idioma - cada registro es una versión completa del libro en un idioma específico';
COMMENT ON COLUMN books.book_translations.is_original IS 'Indica si es el idioma original del libro';
COMMENT ON COLUMN books.book_translations.pdf_url IS 'URL del PDF en este idioma específico';

COMMENT ON TABLE books.book_page_translations IS 'Contenido de páginas por idioma - extraído del PDF de cada versión';
COMMENT ON COLUMN books.book_page_translations.audio_timestamps IS 'Timestamps de audio para sincronización palabra por palabra (lectura guiada)';
COMMENT ON COLUMN books.book_page_translations.text_overlay_data IS 'Posiciones de palabras extraídas por OCR para overlay visual (lectura guiada)';
