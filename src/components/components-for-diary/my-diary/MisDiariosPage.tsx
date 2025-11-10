'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiaryHeader } from '@/src/components/components-for-diary/my-diary/DiaryHeader';
import { SearchAndFilters } from '@/src/components/components-for-diary/my-diary/SearchAndFilters';
import { DiaryCard } from '@/src/components/components-for-diary/my-diary/DiaryCard';
import { Pagination } from '@/src/components/components-for-diary/my-diary/Pagination';
import { EmptyState } from '@/src/components/components-for-diary/my-diary/EmptyState';
import { DeleteModal } from '@/src/components/components-for-diary/my-diary/DeleteModal';
import { useDiarios, useFiltros, usePaginacion } from '@/src/components/components-for-diary/hooks/useDiario';
import { getCurrentUser } from '@/src/utils/supabase/utilsClient';

export default function MisDiariosPage() {
  const router = useRouter();
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(false);
  const [entradaAEliminar, setEntradaAEliminar] = useState<number | null>(null);

  const { entradas, cargando, cargarEntradas, eliminarEntrada, toggleFavorito } = useDiarios();
  
  const {
    entradasFiltradas,
    filtroEmocion,
    setFiltroEmocion,
    filtroCalificacion,
    setFiltroCalificacion,
    ordenFecha,
    setOrdenFecha,
    busqueda,
    setBusqueda
  } = useFiltros(entradas);

  const {
    paginaActual,
    setPaginaActual,
    itemsPaginaActual,
    totalPaginas,
    indexPrimero,
    indexUltimo
  } = usePaginacion(entradasFiltradas, 9);

  useEffect(() => {
    verificarSesionYCargar();
  }, []);

  const verificarSesionYCargar = async (): Promise<void> => {
    const user = await getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    await cargarEntradas();
  };

  const handleEliminar = async (): Promise<void> => {
    if (entradaAEliminar) {
      await eliminarEntrada(entradaAEliminar);
      setEntradaAEliminar(null);
    }
  };

  const hasFilters: boolean = Boolean(busqueda || filtroCalificacion || filtroEmocion !== 'todas');

  if (cargando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">📚</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-2xl font-bold text-purple-600">Cargando tus diarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 pb-12">
      <DiaryHeader 
        totalEntradas={entradas.length}
        onNuevaEntrada={() => router.push('/diario/nuevo')}
        onVolver={() => router.push('/dashboard')}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <SearchAndFilters
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          filtroEmocion={filtroEmocion}
          onFiltroEmocionChange={setFiltroEmocion}
          filtroCalificacion={filtroCalificacion}
          onFiltroCalificacionChange={setFiltroCalificacion}
          ordenFecha={ordenFecha}
          onOrdenFechaToggle={() => setOrdenFecha(ordenFecha === 'recientes' ? 'antiguas' : 'recientes')}
          mostrarFiltros={mostrarFiltros}
          onToggleFiltros={() => setMostrarFiltros(!mostrarFiltros)}
        />

        {itemsPaginaActual.length === 0 ? (
          <EmptyState 
            hasFilters={hasFilters}
            onCreateNew={() => router.push('/diario/nuevo')}
          />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsPaginaActual.map((entrada) => (
                <DiaryCard
                  key={entrada.id_entrada}
                  entrada={entrada}
                  onEdit={(id) => router.push(`/diario/editor/${id}`)}
                  onDelete={(id) => setEntradaAEliminar(id)}
                  onToggleFavorito={toggleFavorito}
                />
              ))}
            </div>

            {totalPaginas > 1 && (
              <>
                <Pagination
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  onPageChange={setPaginaActual}
                />
                <div className="text-center mt-4 text-sm text-gray-600 font-semibold">
                  Mostrando {indexPrimero + 1} - {Math.min(indexUltimo, entradasFiltradas.length)} de {entradasFiltradas.length} entradas
                </div>
              </>
            )}
          </>
        )}
      </div>

      <DeleteModal
        isOpen={entradaAEliminar !== null}
        onConfirm={handleEliminar}
        onCancel={() => setEntradaAEliminar(null)}
      />
    </div>
  );
}