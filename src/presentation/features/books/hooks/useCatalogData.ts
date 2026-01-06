/**
 * UBICACIÓN: src/presentation/features/books/hooks/useCatalogData.ts
 * ✅ Hook para cargar todos los catálogos necesarios
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/src/utils/supabase/client';

export interface CatalogItem {
  id: number;
  name: string;
}

export interface CatalogData {
  categorias: CatalogItem[];
  generos: CatalogItem[];
  etiquetas: CatalogItem[];
  valores: CatalogItem[];
  niveles: CatalogItem[];
}

export interface UseCatalogDataReturn extends CatalogData {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useCatalogData(): UseCatalogDataReturn {
  const [catalogData, setCatalogData] = useState<CatalogData>({
    categorias: [],
    generos: [],
    etiquetas: [],
    valores: [],
    niveles: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    console.log('📚 Cargando catálogos...');
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const [
        { data: cats, error: catsError },
        { data: gens, error: gensError },
        { data: tags, error: tagsError },
        { data: vals, error: valsError },
        { data: levs, error: levsError }
      ] = await Promise.all([
        supabase.from('book_categories').select('id, name').order('name'),
        supabase.from('book_genres').select('id, name').order('name'),
        supabase.from('book_tags').select('id, name').order('name'),
        supabase.from('book_values').select('id, name').order('name'),
        supabase.from('book_levels').select('id, name').order('id')
      ]);

      // Verificar errores
      if (catsError) throw new Error(`Error categorías: ${catsError.message}`);
      if (gensError) throw new Error(`Error géneros: ${gensError.message}`);
      if (tagsError) throw new Error(`Error etiquetas: ${tagsError.message}`);
      if (valsError) throw new Error(`Error valores: ${valsError.message}`);
      if (levsError) throw new Error(`Error niveles: ${levsError.message}`);

      console.log('✅ Catálogos cargados:', {
        categorias: cats?.length || 0,
        generos: gens?.length || 0,
        etiquetas: tags?.length || 0,
        valores: vals?.length || 0,
        niveles: levs?.length || 0
      });

      setCatalogData({
        categorias: cats || [],
        generos: gens || [],
        etiquetas: tags || [],
        valores: vals || [],
        niveles: levs || []
      });

    } catch (err: any) {
      console.error('❌ Error cargando catálogos:', err);
      setError(err.message || 'Error al cargar catálogos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  return {
    ...catalogData,
    isLoading,
    error,
    refresh: loadCatalogs
  };
}