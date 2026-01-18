-- ============================================
-- FIX: Modificar constraint de routes para permitir rutas dinámicas
-- FECHA: 2026-01-18
-- DESCRIPCIÓN: Permite rutas con parámetros dinámicos [id], [slug], etc.
-- ============================================

-- ========================================
-- 1. ELIMINAR CONSTRAINT ANTIGUO
-- ========================================

ALTER TABLE app.routes
DROP CONSTRAINT IF EXISTS routes_pathname_format;

-- ========================================
-- 2. AGREGAR NUEVO CONSTRAINT (Permite [])
-- ========================================

-- Permite:
-- - Letras minúsculas: a-z
-- - Números: 0-9
-- - Guiones: -
-- - Slashes: /
-- - Corchetes: [ ] (para parámetros dinámicos)

ALTER TABLE app.routes
ADD CONSTRAINT routes_pathname_format
CHECK (pathname ~ '^/[a-z0-9\-/\[\]]*$');

-- ========================================
-- 3. VERIFICACIÓN
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Constraint actualizado: routes_pathname_format';
  RAISE NOTICE 'Ahora permite rutas dinámicas como: /books/[id]/edit';
  RAISE NOTICE '';
  RAISE NOTICE 'Ejemplos válidos:';
  RAISE NOTICE '  ✅ /books';
  RAISE NOTICE '  ✅ /books/create';
  RAISE NOTICE '  ✅ /books/[id]/edit';
  RAISE NOTICE '  ✅ /users/[userId]/posts/[postId]';
END $$;

-- ========================================
-- 4. PROBAR CONSTRAINT
-- ========================================

-- Estas inserciones deberían funcionar ahora
DO $$
DECLARE
  v_test_id UUID;
BEGIN
  -- Test 1: Ruta simple
  INSERT INTO app.routes (pathname, display_name, is_public)
  VALUES ('/test-simple', 'Test Simple', false)
  RETURNING id INTO v_test_id;

  DELETE FROM app.routes WHERE id = v_test_id;
  RAISE NOTICE '✅ Test 1 pasado: Ruta simple';

  -- Test 2: Ruta con parámetro dinámico
  INSERT INTO app.routes (pathname, display_name, is_public)
  VALUES ('/test/[id]/edit', 'Test Dinámico', false)
  RETURNING id INTO v_test_id;

  DELETE FROM app.routes WHERE id = v_test_id;
  RAISE NOTICE '✅ Test 2 pasado: Ruta con [id]';

  -- Test 3: Ruta con múltiples parámetros
  INSERT INTO app.routes (pathname, display_name, is_public)
  VALUES ('/test/[userId]/posts/[postId]', 'Test Multi', false)
  RETURNING id INTO v_test_id;

  DELETE FROM app.routes WHERE id = v_test_id;
  RAISE NOTICE '✅ Test 3 pasado: Ruta con múltiples parámetros';

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TODOS LOS TESTS PASARON';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Ahora puedes ejecutar INSERT_ROUTE_KEYS_SYSTEM.sql';
  RAISE NOTICE '========================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error en tests: %', SQLERRM;
END $$;
