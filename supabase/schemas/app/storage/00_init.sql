-- ============================================
-- Storage: Initialization
-- File: storage/00_init.sql
-- Description: Enable storage extensions and base permissions
-- ============================================

-- Enable storage schema access
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant access to storage functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO anon;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Storage initialization completed';
END $$;
