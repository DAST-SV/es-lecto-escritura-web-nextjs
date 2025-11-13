'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Actividad } from '@/src/typings/Actividades';
import { Libro } from '@/src/typings/Libro';

export function useActividadesLibro() {
  const params = useParams();
  const router = useRouter();
  const id_libro = params.id_libro as string;

  const [libro, setLibro] = useState<Libro | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id_libro]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const libroResponse = await fetch(`/api/libros/${id_libro}`);
      const libroData = await libroResponse.json();
      if (libroData.libro) setLibro(libroData.libro);

      const response = await fetch(`/api/libros/${id_libro}/actividades`);
      if (!response.ok) throw new Error('Error al obtener actividades');

      const data: Actividad[] = await response.json();
      setActividades(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActividad = async (id_actividad: string) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      const response = await fetch(`/api/actividades/quizzes/${id_actividad}`, { 
        method: 'DELETE' 
      });
      const result = await response.json();

      if (result.success) {
        setActividades((prev) => prev.filter((a) => a.id_actividad !== id_actividad));
        alert('Actividad eliminada exitosamente');
      } else {
        alert('Error al eliminar la actividad');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la actividad');
    }
  };

  // 🆕 Actualización OPTIMISTA sin recargar
  const handleToggleOficial = async (id_actividad: string, esOficialActual: boolean) => {
    // 1️⃣ Actualización optimista del estado local
    setActividades((prev) =>
      prev.map((actividad) => ({
        ...actividad,
        // Si es la actividad clickeada, invertir su estado
        // Si no, y vamos a marcar como oficial, desmarcar las demás
        es_oficial:
          actividad.id_actividad === id_actividad
            ? !esOficialActual
            : !esOficialActual
            ? false
            : actividad.es_oficial,
      }))
    );

    // 2️⃣ Llamada al API en segundo plano
    try {
      const response = await fetch(`/api/libros/actividades/quizzes/${id_actividad}/oficial`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          es_oficial: !esOficialActual,
          id_libro: id_libro,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar');
      }

      // 3️⃣ Opcional: mostrar notificación de éxito
      console.log('✅', result.message);
      
    } catch (error) {
      console.error('Error al actualizar actividad oficial:', error);
      
      // 4️⃣ Revertir cambios si falla (rollback)
      setActividades((prev) =>
        prev.map((actividad) =>
          actividad.id_actividad === id_actividad
            ? { ...actividad, es_oficial: esOficialActual }
            : actividad
        )
      );
      
      alert('Error al actualizar el estado oficial');
    }
  };

  return {
    id_libro,
    router,
    libro,
    actividades,
    loading,
    error,
    fetchData,
    handleDeleteActividad,
    handleToggleOficial,
  };
}