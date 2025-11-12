'use client';

import { useEffect, useState } from 'react';
import { Libro } from '@/src/typings/Libro';
import { getUserId } from '@/src/utils/supabase/utilsClient';

export function useLibros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId() ?? '';
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchLibros();
  }, [userId]);

  const fetchLibros = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/libros/bookinformation/${userId}`);
      const result = await response.json();

      if (result.libros) {
        setLibros(result.libros);
      } else {
        setError(result.error || 'Error al cargar los libros');
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar los libros');
    } finally {
      setLoading(false);
    }
  };

  return { libros, loading, error, fetchLibros };
}
