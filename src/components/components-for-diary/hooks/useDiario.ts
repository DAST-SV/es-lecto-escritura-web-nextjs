// ============= HOOKS PERSONALIZADOS =============
// hooks/useDiarios.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/src/utils/supabase/utilsClient';
import { getCurrentUser } from '@/src/utils/supabase/utilsClient';
import { CrearEntradaParams, UseNuevaEntradaReturn } from '@/src/typings/types-diary/types';

interface EntradaDiario {
  id_entrada: number;
  titulo: string | null;
  fecha: string;
  clima: string | null;
  calificacion_dia: number | null;
  total_paginas: number;
  es_favorito: boolean;
  creado: string;
  emocion: string | null;
  color_emocion: string | null;
  icono_emocion: string | null;
  contenido_preview?: string;
}

type FiltroEmocion = 'todas' | 'positivas' | 'negativas';
type OrdenFecha = 'recientes' | 'antiguas';

export const useDiarios = () => {
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarEntradas = async () => {
    setCargando(true);
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vw_entradas_de_diario_completas')
        .select('*')
        .eq('id_usuario', user.id)
        .order('fecha', { ascending: false });

      if (error) throw error;

      const entradasConPreview = await Promise.all(
        (data || []).map(async (entrada) => {
          const { data: paginaData } = await supabase
            .from('paginas_de_diario')
            .select('contenido')
            .eq('id_entrada', entrada.id_entrada)
            .eq('numero', 1)
            .single();

          let preview = '';
          if (paginaData?.contenido) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = paginaData.contenido;
            preview = tempDiv.textContent?.slice(0, 150) || '';
          }

          return {
            ...entrada,
            contenido_preview: preview
          };
        })
      );

      setEntradas(entradasConPreview);
    } catch (error) {
      console.error('Error al cargar entradas:', error);
      alert('Error al cargar tus diarios');
    } finally {
      setCargando(false);
    }
  };

  const eliminarEntrada = async (id: number) => {
    try {
      const { error } = await supabase
        .from('entradas_de_diario')
        .delete()
        .eq('id_entrada', id);

      if (error) throw error;

      setEntradas(prev => prev.filter(e => e.id_entrada !== id));
      alert('✅ Entrada eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('❌ Error al eliminar la entrada');
    }
  };

  const toggleFavorito = async (id: number, esFavorito: boolean) => {
    try {
      const { error } = await supabase
        .from('entradas_de_diario')
        .update({ es_favorito: !esFavorito })
        .eq('id_entrada', id);

      if (error) throw error;

      setEntradas(prev =>
        prev.map(e =>
          e.id_entrada === id ? { ...e, es_favorito: !esFavorito } : e
        )
      );
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
    }
  };

  return {
    entradas,
    cargando,
    cargarEntradas,
    eliminarEntrada,
    toggleFavorito
  };
};

export const useFiltros = (entradas: EntradaDiario[]) => {
  const [entradasFiltradas, setEntradasFiltradas] = useState<EntradaDiario[]>([]);
  const [filtroEmocion, setFiltroEmocion] = useState<FiltroEmocion>('todas');
  const [filtroCalificacion, setFiltroCalificacion] = useState<number | null>(null);
  const [ordenFecha, setOrdenFecha] = useState<OrdenFecha>('recientes');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    aplicarFiltros();
  }, [entradas, filtroEmocion, filtroCalificacion, ordenFecha, busqueda]);

  const aplicarFiltros = () => {
    let resultado = [...entradas];

    if (busqueda.trim()) {
      resultado = resultado.filter(entrada =>
        entrada.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        entrada.contenido_preview?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroEmocion === 'positivas') {
      resultado = resultado.filter(e => 
        ['Feliz', 'Orgulloso', 'Emocionado', 'Tranquilo', 'Sorprendido'].includes(e.emocion || '')
      );
    } else if (filtroEmocion === 'negativas') {
      resultado = resultado.filter(e => 
        ['Triste', 'Enojado', 'Asustado', 'Confundido', 'Aburrido'].includes(e.emocion || '')
      );
    }

    if (filtroCalificacion) {
      resultado = resultado.filter(e => e.calificacion_dia === filtroCalificacion);
    }

    resultado.sort((a, b) => {
      const fechaA = new Date(a.fecha).getTime();
      const fechaB = new Date(b.fecha).getTime();
      return ordenFecha === 'recientes' ? fechaB - fechaA : fechaA - fechaB;
    });

    setEntradasFiltradas(resultado);
  };

  return {
    entradasFiltradas,
    filtroEmocion,
    setFiltroEmocion,
    filtroCalificacion,
    setFiltroCalificacion,
    ordenFecha,
    setOrdenFecha,
    busqueda,
    setBusqueda
  };
};

export const usePaginacion = (items: any[], itemsPorPagina: number = 9) => {
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    setPaginaActual(1);
  }, [items.length]);

  const indexUltimo = paginaActual * itemsPorPagina;
  const indexPrimero = indexUltimo - itemsPorPagina;
  const itemsPaginaActual = items.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(items.length / itemsPorPagina);

  return {
    paginaActual,
    setPaginaActual,
    itemsPaginaActual,
    totalPaginas,
    indexPrimero,
    indexUltimo
  };
};

export const useNuevaEntrada = (): UseNuevaEntradaReturn => {
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const crearEntrada = async (params: CrearEntradaParams): Promise<number | null> => {
    setCargando(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      if (!user) {
        setError('Debes iniciar sesión');
        return null;
      }

      const { titulo, clima, emocionesSeleccionadas, calificacion } = params;

      // 1. Crear la entrada principal
      const { data: entradaData, error: entradaError } = await supabase
        .from('entradas_de_diario')
        .insert({
          id_usuario: user.id,
          titulo: titulo || null,
          fecha: new Date().toISOString().split('T')[0],
          clima: clima,
          calificacion_dia: calificacion,
          es_favorito: false
        })
        .select('id_entrada')
        .single();

      if (entradaError) throw entradaError;
      if (!entradaData) throw new Error('No se pudo crear la entrada');

      const idEntrada = entradaData.id_entrada;

      // 2. Asociar emociones seleccionadas
      if (emocionesSeleccionadas.length > 0) {
        const emocionesInsert = emocionesSeleccionadas.map(idEmocion => ({
          id_entrada: idEntrada,
          id_emocion: idEmocion
        }));

        const { error: emocionesError } = await supabase
          .from('entradas_emociones')
          .insert(emocionesInsert);

        if (emocionesError) throw emocionesError;
      }

      // 3. Crear primera página vacía
      const { error: paginaError } = await supabase
        .from('paginas_de_diario')
        .insert({
          id_entrada: idEntrada,
          numero: 1,
          contenido: ''
        });

      if (paginaError) throw paginaError;

      return idEntrada;

    } catch (err) {
      console.error('Error al crear entrada:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setCargando(false);
    }
  };

  return {
    crearEntrada,
    cargando,
    error,
    setError
  };
};