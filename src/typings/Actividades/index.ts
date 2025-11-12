export interface Actividad {
  id_actividad: string;                // UUID
  id_libro: string;                    // UUID (FK a libros)
  id_tipo_actividad: number;           // SMALLINT (FK a tipos_actividad)
  titulo: string;                      // VARCHAR(255)
  descripcion?: string | null;         // TEXT (puede ser nulo)
  orden?: number | null;               // SMALLINT (orden dentro del libro)
  puntos_maximos?: number;             // SMALLINT (default: 100)
  tiempo_limite?: number | null;       // INTEGER (segundos, NULL = sin límite)
  intentos_permitidos?: number | null; // SMALLINT (NULL = ilimitados)
  fecha_creacion?: string;             // TIMESTAMP (ISO string en JS)
  activo?: boolean;                    // BOOLEAN (default: true)
}
