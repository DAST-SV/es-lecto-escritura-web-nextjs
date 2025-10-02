-- ======================================================
-- Esquema principal para la aplicación de lectoescritura
-- ======================================================

-- ==============================================
-- Tabla: tipos_usuarios
-- ==============================================
CREATE TABLE tipos_usuarios (
    id_tipo_usuario BIGSERIAL PRIMARY KEY,   -- Identificador único del rol, se autoincrementa automáticamente
    nombre TEXT NOT NULL UNIQUE,             -- Nombre del rol, obligatorio y único (ej: Estudiante, Docente, Responsable, Lector)
    descripcion TEXT NULL                    -- Descripción opcional para detallar la función o alcance del rol
);
-- Comentario general de la tabla
COMMENT ON TABLE tipos_usuarios IS 'Catálogo maestro de roles o tipos de usuarios de la aplicación';
-- Comentarios por columna
COMMENT ON COLUMN tipos_usuarios.id_tipo_usuario IS 'Clave primaria, identifica de manera única cada rol';
COMMENT ON COLUMN tipos_usuarios.nombre IS 'Nombre del rol, único y obligatorio';
COMMENT ON COLUMN tipos_usuarios.descripcion IS 'Descripción opcional del rol';


-- ==============================================
-- Tabla: usuarios_roles
-- ==============================================
CREATE TABLE usuarios_roles (
    id_usuario UUID NOT NULL,                -- Identificador del usuario que proviene de auth.users (registro de Supabase Auth)
    id_tipo_usuario BIGINT NOT NULL,         -- Identificador del rol asignado al usuario
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
        -- Fecha y hora en que se asignó el rol al usuario, se llena automáticamente con la fecha actual
    PRIMARY KEY (id_usuario, id_tipo_usuario), 
        -- Clave primaria compuesta: un usuario no puede tener el mismo rol asignado más de una vez
    CONSTRAINT fk_usuario FOREIGN KEY (id_usuario)
        REFERENCES auth.users(id) ON DELETE CASCADE, 
        -- Relación con la tabla auth.users de Supabase
        -- Si se elimina un usuario, se eliminan automáticamente sus roles asignados
    CONSTRAINT fk_tipo_usuario FOREIGN KEY (id_tipo_usuario)
        REFERENCES tipos_usuarios(id_tipo_usuario) ON DELETE CASCADE 
        -- Relación con el catálogo de roles
        -- Si se elimina un rol, se eliminan automáticamente todas sus asignaciones
);
-- Comentario general de la tabla
COMMENT ON TABLE usuarios_roles IS 'Tabla puente que relaciona usuarios con sus roles (muchos a muchos)';
-- Comentarios por columna
COMMENT ON COLUMN usuarios_roles.id_usuario IS 'Usuario que tiene el rol';
COMMENT ON COLUMN usuarios_roles.id_tipo_usuario IS 'Rol asignado al usuario';
COMMENT ON COLUMN usuarios_roles.fecha_asignacion IS 'Fecha en que se otorgó el rol';


-- ==============================================
-- Tabla: usuarios_responsables
-- ==============================================
CREATE TABLE usuarios_responsables (
    id_estudiante UUID NOT NULL,             -- Identificador del estudiante menor de edad
    id_responsable UUID NOT NULL,            -- Identificador del responsable adulto (padre, madre o tutor)
    fecha_asignacion TIMESTAMPTZ NOT NULL DEFAULT NOW(), 
        -- Fecha en que se creó la relación entre estudiante y responsable
    PRIMARY KEY (id_estudiante, id_responsable), 
        -- Clave primaria compuesta: evita que se duplique la misma relación
    CONSTRAINT fk_estudiante FOREIGN KEY (id_estudiante)
        REFERENCES auth.users(id) ON DELETE CASCADE, 
        -- Si se elimina un estudiante, se eliminan automáticamente sus responsables asignados
    CONSTRAINT fk_responsable FOREIGN KEY (id_responsable)
        REFERENCES auth.users(id) ON DELETE CASCADE, 
        -- Si se elimina un responsable, se eliminan automáticamente sus relaciones
    CONSTRAINT chk_estudiante_no_es_responsable CHECK (id_estudiante <> id_responsable)
        -- Validación: un usuario no puede ser responsable de sí mismo
);
-- Comentario general de la tabla
COMMENT ON TABLE usuarios_responsables IS 'Tabla que relaciona estudiantes menores con sus responsables adultos';
-- Comentarios por columna
COMMENT ON COLUMN usuarios_responsables.id_estudiante IS 'Estudiante menor de edad que necesita un responsable';
COMMENT ON COLUMN usuarios_responsables.id_responsable IS 'Usuario adulto responsable del estudiante';
COMMENT ON COLUMN usuarios_responsables.fecha_asignacion IS 'Fecha en que se creó la relación';