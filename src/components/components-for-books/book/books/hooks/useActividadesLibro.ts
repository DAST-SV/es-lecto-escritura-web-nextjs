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
      const response = await fetch(`/api/actividades/quizzes/${id_actividad}`, { method: 'DELETE' });
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

  return {
    id_libro,
    router,
    libro,
    actividades,
    loading,
    error,
    fetchData,
    handleDeleteActividad,
  };
}
