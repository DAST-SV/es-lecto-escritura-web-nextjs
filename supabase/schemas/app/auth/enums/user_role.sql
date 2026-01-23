-- ============================================================================
-- ENUM: user_role
-- DESCRIPCIÓN: Roles disponibles en el sistema
-- ============================================================================

SET search_path TO app, public;

DO $$ BEGIN
  CREATE TYPE app.user_role AS ENUM (
      'super_admin',   -- Administrador de la plataforma
      'school',        -- Administrador de escuela
      'teacher',       -- Docente/Instructor
      'parent',        -- Padre/Madre/Tutor
      'student',       -- Estudiante
      'individual'     -- Usuario individual
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE app.user_role IS 'Roles disponibles en el sistema';

SELECT 'AUTH: Enum user_role creado' AS status;
