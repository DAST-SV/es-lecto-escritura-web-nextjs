-- =============================================
-- SISTEMA GEOGRÁFICO PARA LIBROS
-- =============================================
-- Permite filtrar libros por país y región
-- Incluye traducciones de nombres de países
-- =============================================

-- Tabla de países
CREATE TABLE IF NOT EXISTS books.countries (
    code CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
    code_alpha3 CHAR(3), -- ISO 3166-1 alpha-3
    region VARCHAR(50), -- latam, europe, asia, africa, oceania, north_america
    subregion VARCHAR(50), -- central_america, south_america, western_europe, etc.
    is_active BOOLEAN DEFAULT TRUE,
    display_order SMALLINT DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_countries_region ON books.countries(region);
CREATE INDEX IF NOT EXISTS idx_countries_active ON books.countries(is_active) WHERE is_active = TRUE;

-- Traducciones de países
CREATE TABLE IF NOT EXISTS books.country_translations (
    country_code CHAR(2) NOT NULL REFERENCES books.countries(code) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL REFERENCES app.languages(code) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (country_code, language_code)
);

CREATE INDEX IF NOT EXISTS idx_country_translations_language ON books.country_translations(language_code);

-- Relación libro-países (origen y disponibilidad)
CREATE TABLE IF NOT EXISTS books.book_countries (
    book_id UUID NOT NULL REFERENCES books.books(id) ON DELETE CASCADE,
    country_code CHAR(2) NOT NULL REFERENCES books.countries(code) ON DELETE CASCADE,
    is_origin BOOLEAN DEFAULT FALSE, -- Es el país de origen del libro
    is_available BOOLEAN DEFAULT TRUE, -- Disponible en este país
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (book_id, country_code)
);

CREATE INDEX IF NOT EXISTS idx_book_countries_book ON books.book_countries(book_id);
CREATE INDEX IF NOT EXISTS idx_book_countries_country ON books.book_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_book_countries_origin ON books.book_countries(is_origin) WHERE is_origin = TRUE;

-- =============================================
-- DATOS INICIALES DE PAÍSES
-- =============================================

INSERT INTO books.countries (code, code_alpha3, region, subregion, display_order) VALUES
-- Latinoamérica
('MX', 'MEX', 'latam', 'north_america', 1),
('AR', 'ARG', 'latam', 'south_america', 2),
('CO', 'COL', 'latam', 'south_america', 3),
('CL', 'CHL', 'latam', 'south_america', 4),
('PE', 'PER', 'latam', 'south_america', 5),
('VE', 'VEN', 'latam', 'south_america', 6),
('EC', 'ECU', 'latam', 'south_america', 7),
('GT', 'GTM', 'latam', 'central_america', 8),
('CU', 'CUB', 'latam', 'caribbean', 9),
('DO', 'DOM', 'latam', 'caribbean', 10),
('HN', 'HND', 'latam', 'central_america', 11),
('SV', 'SLV', 'latam', 'central_america', 12),
('NI', 'NIC', 'latam', 'central_america', 13),
('CR', 'CRI', 'latam', 'central_america', 14),
('PA', 'PAN', 'latam', 'central_america', 15),
('UY', 'URY', 'latam', 'south_america', 16),
('PY', 'PRY', 'latam', 'south_america', 17),
('BO', 'BOL', 'latam', 'south_america', 18),
('PR', 'PRI', 'latam', 'caribbean', 19),
-- Europa
('ES', 'ESP', 'europe', 'southern_europe', 20),
('FR', 'FRA', 'europe', 'western_europe', 21),
('IT', 'ITA', 'europe', 'southern_europe', 22),
('DE', 'DEU', 'europe', 'western_europe', 23),
('GB', 'GBR', 'europe', 'northern_europe', 24),
('PT', 'PRT', 'europe', 'southern_europe', 25),
-- Norteamérica
('US', 'USA', 'north_america', 'north_america', 26),
('CA', 'CAN', 'north_america', 'north_america', 27),
-- Brasil
('BR', 'BRA', 'latam', 'south_america', 28)
ON CONFLICT (code) DO NOTHING;

-- Traducciones en español
INSERT INTO books.country_translations (country_code, language_code, name) VALUES
('MX', 'es', 'México'),
('AR', 'es', 'Argentina'),
('CO', 'es', 'Colombia'),
('CL', 'es', 'Chile'),
('PE', 'es', 'Perú'),
('VE', 'es', 'Venezuela'),
('EC', 'es', 'Ecuador'),
('GT', 'es', 'Guatemala'),
('CU', 'es', 'Cuba'),
('DO', 'es', 'República Dominicana'),
('HN', 'es', 'Honduras'),
('SV', 'es', 'El Salvador'),
('NI', 'es', 'Nicaragua'),
('CR', 'es', 'Costa Rica'),
('PA', 'es', 'Panamá'),
('UY', 'es', 'Uruguay'),
('PY', 'es', 'Paraguay'),
('BO', 'es', 'Bolivia'),
('PR', 'es', 'Puerto Rico'),
('ES', 'es', 'España'),
('FR', 'es', 'Francia'),
('IT', 'es', 'Italia'),
('DE', 'es', 'Alemania'),
('GB', 'es', 'Reino Unido'),
('PT', 'es', 'Portugal'),
('US', 'es', 'Estados Unidos'),
('CA', 'es', 'Canadá'),
('BR', 'es', 'Brasil')
ON CONFLICT (country_code, language_code) DO NOTHING;

-- Traducciones en inglés
INSERT INTO books.country_translations (country_code, language_code, name) VALUES
('MX', 'en', 'Mexico'),
('AR', 'en', 'Argentina'),
('CO', 'en', 'Colombia'),
('CL', 'en', 'Chile'),
('PE', 'en', 'Peru'),
('VE', 'en', 'Venezuela'),
('EC', 'en', 'Ecuador'),
('GT', 'en', 'Guatemala'),
('CU', 'en', 'Cuba'),
('DO', 'en', 'Dominican Republic'),
('HN', 'en', 'Honduras'),
('SV', 'en', 'El Salvador'),
('NI', 'en', 'Nicaragua'),
('CR', 'en', 'Costa Rica'),
('PA', 'en', 'Panama'),
('UY', 'en', 'Uruguay'),
('PY', 'en', 'Paraguay'),
('BO', 'en', 'Bolivia'),
('PR', 'en', 'Puerto Rico'),
('ES', 'en', 'Spain'),
('FR', 'en', 'France'),
('IT', 'en', 'Italy'),
('DE', 'en', 'Germany'),
('GB', 'en', 'United Kingdom'),
('PT', 'en', 'Portugal'),
('US', 'en', 'United States'),
('CA', 'en', 'Canada'),
('BR', 'en', 'Brazil')
ON CONFLICT (country_code, language_code) DO NOTHING;

-- =============================================
-- FUNCIONES HELPER
-- =============================================

-- Función para obtener países con traducción
CREATE OR REPLACE FUNCTION books.get_countries_translated(p_language_code VARCHAR DEFAULT 'es')
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR,
    region VARCHAR,
    subregion VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name,
        c.region,
        c.subregion
    FROM books.countries c
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE c.is_active = TRUE
    ORDER BY c.display_order, ct.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener países por región
CREATE OR REPLACE FUNCTION books.get_countries_by_region(
    p_region VARCHAR,
    p_language_code VARCHAR DEFAULT 'es'
)
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name
    FROM books.countries c
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE c.is_active = TRUE
    AND c.region = p_region
    ORDER BY c.display_order, ct.name;
END;
$$ LANGUAGE plpgsql STABLE;

-- Función para obtener el país de origen de un libro
CREATE OR REPLACE FUNCTION books.get_book_origin_country(
    p_book_id UUID,
    p_language_code VARCHAR DEFAULT 'es'
)
RETURNS TABLE (
    code CHAR(2),
    name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.code,
        COALESCE(ct.name, c.code)::VARCHAR AS name
    FROM books.book_countries bc
    JOIN books.countries c ON c.code = bc.country_code
    LEFT JOIN books.country_translations ct
        ON ct.country_code = c.code
        AND ct.language_code = p_language_code
    WHERE bc.book_id = p_book_id
    AND bc.is_origin = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentarios
COMMENT ON TABLE books.countries IS 'Catálogo de países con códigos ISO';
COMMENT ON COLUMN books.countries.region IS 'Región geográfica: latam, europe, asia, africa, oceania, north_america';
COMMENT ON TABLE books.country_translations IS 'Traducciones de nombres de países por idioma';
COMMENT ON TABLE books.book_countries IS 'Relación de libros con países (origen y disponibilidad)';
