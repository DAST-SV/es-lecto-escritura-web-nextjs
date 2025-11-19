"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { 
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, X
} from "lucide-react";

// Hooks personalizados (tus hooks existentes)
import { useBookState } from "../hooks/useBookState";
import { useImageHandler } from "../hooks/useImageHandler";
import { useBookNavigation } from "../hooks/useBookNavigation";

// Componentes
import { BookViewer } from "./BookViewer";
import { EditorSidebar } from "./EditorSidebar";
import { PortadaControls } from "./portadaControls";
import { BookMetadataForm } from "./BookMetadataForm";
import { CoverPreview } from "./CoverPreview";

// Servicios
import { saveBookJson, type BookMetadata } from "../services/bookService";

// Tipos
import type { page } from "@/src/typings/types-page-book/index";

interface BookProps {
  initialPages?: page[];
  title?: string;
  IdLibro?: string;
  initialMetadata?: {
    selectedCategorias?: (number | string)[];
    selectedGeneros?: (number | string)[];
    selectedEtiquetas?: (number | string)[];
    selectedValores?: (number | string)[];
    selectedNivel?: number | null;
    autor?: string;
    descripcion?: string;
    titulo?: string;
    portada?: File | string | null;
    portadaUrl?: string | null;
  };
}

export function Book({ initialPages, title, IdLibro, initialMetadata }: BookProps = {}) {
  const bookRef = useRef<any>(null);
  
  // ⭐ Ref para mantener la URL de la portada de manera persistente
  const portadaUrlRef = useRef<string | null>(null);

  // Estados de metadatos
  const [selectedCategorias, setSelectedCategorias] = useState<(number | string)[]>(
    initialMetadata?.selectedCategorias || []
  );
  const [selectedGeneros, setSelectedGeneros] = useState<(number | string)[]>(
    initialMetadata?.selectedGeneros || []
  );
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<(number | string)[]>(
    initialMetadata?.selectedEtiquetas || []
  );
  const [selectedValores, setSelectedValores] = useState<(number | string)[]>(
    initialMetadata?.selectedValores || []
  );
  const [selectedNivel, setSelectedNivel] = useState<number | null>(
    initialMetadata?.selectedNivel || null
  );
  const [autor, setAutor] = useState<string>(initialMetadata?.autor || "");
  const [descripcion, setDescripcion] = useState<string>(initialMetadata?.descripcion || "");
  const [titulo, setTitulo] = useState<string>(initialMetadata?.titulo || "");
  
  const [portada, setPortada] = useState<File | null>(
    initialMetadata?.portada instanceof File ? initialMetadata.portada : null
  );
  
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || 
    (typeof initialMetadata?.portada === 'string' ? initialMetadata.portada : null)
  );

  // ⭐ NUEVO: Estados para los NOMBRES (labels) de las selecciones
  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [generosLabels, setGenerosLabels] = useState<string[]>([]);
  const [etiquetasLabels, setEtiquetasLabels] = useState<string[]>([]);
  const [valoresLabels, setValoresLabels] = useState<string[]>([]);
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

  // Estados UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverMode, setShowCoverMode] = useState(false); // Nuevo: modo portada

  // Hooks personalizados
  const bookState = useBookState({ initialPages, title });

  const imageHandler = useImageHandler({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    setPages: bookState.setPages
  });

  const navigation = useBookNavigation({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    isFlipping: bookState.isFlipping,
    setCurrentPage: bookState.setCurrentPage,
    setIsFlipping: bookState.setIsFlipping,
    bookRef
  });

  // Handler para guardar
  const handleSave = useCallback(async () => {
    const metadata: BookMetadata = {
      selectedCategorias,
      selectedGeneros,
      selectedEtiquetas,
      selectedValores,
      selectedNivel,
      autor,
      descripcion,
      titulo,
      portada,
      portadaUrl,
    };

    setIsSaving(true);
    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
      console.log('✅ Guardado exitoso');
    } catch (error) {
      console.error("❌ Error en handleSave:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    bookState.pages, 
    selectedCategorias, 
    selectedGeneros, 
    selectedEtiquetas, 
    selectedValores,
    selectedNivel,
    autor, 
    descripcion, 
    titulo, 
    portada,
    portadaUrl,
    IdLibro
  ]);

  const handlePortadaChange = useCallback((file: File | null) => {
    setPortada(file);
    if (file) {
      setPortadaUrl(null);
      // Limpiar URL anterior si existe
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
      }
      // Crear nueva URL y mantenerla en el ref
      portadaUrlRef.current = URL.createObjectURL(file);
    } else {
      // Si se elimina la portada, limpiar la URL
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
        portadaUrlRef.current = null;
      }
    }
  }, []);

  // Limpiar URL al desmontar el componente
  React.useEffect(() => {
    return () => {
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
      }
    };
  }, []);

  return (
    <UnifiedLayout mainClassName="pt-0">
      <div className="h-[calc(100vh-56px)] flex flex-col bg-gray-50 overflow-hidden">
        <Toaster position="bottom-center" />

        {/* Header más compacto con TODOS los controles */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
            {/* Logo y título */}
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">Editor</h1>
                <p className="text-[10px] text-gray-500 truncate">{titulo || 'Sin título'}</p>
              </div>
            </div>

            {/* Controles centrales */}
            <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
              {/* Botón VER PORTADA / VOLVER */}
              <button
                onClick={() => setShowCoverMode(!showCoverMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all text-xs ${
                  showCoverMode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
                title={showCoverMode ? "Volver a editar páginas" : "Ver y editar portada del libro"}
              >
                <BookOpen size={14} />
                <span>{showCoverMode ? 'VOLVER' : 'VER PORTADA'}</span>
              </button>

              {/* Separador visual */}
              <div className="h-6 w-px bg-gray-300" />

              {/* Indicador de página - Solo si NO estamos en modo portada */}
              {!showCoverMode && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {bookState.currentPage + 1}/{bookState.pages.length}
                    </span>
                  </div>

                  {/* Botones de control */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={bookState.addPage}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-all text-[11px]"
                      title="Agregar página"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Nueva</span>
                    </button>
                    
                    {bookState.pages.length > 2 && (
                      <button
                        onClick={bookState.deletePage}
                        className="flex items-center justify-center p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                        title="Eliminar página"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Navegación desktop */}
                  <div className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={navigation.prevPage}
                      disabled={!navigation.canGoPrev}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 transition-colors"
                      aria-label="Anterior"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={navigation.nextPage}
                      disabled={!navigation.canGoNext}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 transition-colors"
                      aria-label="Siguiente"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Botón guardar compacto */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors text-xs sm:text-sm"
              >
                <Save size={16} />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>

              {/* Toggle sidebar (móvil) - Deshabilitado en modo portada */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                disabled={showCoverMode}
                className={`lg:hidden px-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                  showCoverMode 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={showCoverMode ? "No disponible en modo portada" : (isSidebarOpen ? 'Ocultar panel' : 'Mostrar panel')}
              >
                {isSidebarOpen ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Vista previa del libro */}
          <div className="flex-1 min-w-0">
            {showCoverMode ? (
              // MODO PORTADA: Mostrar PREVIEW en el centro
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                  {/* Header con instrucciones */}
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <BookOpen className="text-orange-600" size={32} />
                          Modo Edición de Portada
                        </h3>
                        <p className="text-gray-600">
                          Usa el panel de la derecha para editar. Aquí verás la vista previa en tiempo real.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCoverMode(false)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                      >
                        ← Volver a páginas
                      </button>
                    </div>
                  </div>

                  {/* Vista Previa de la Portada - GRANDE Y CENTRADA */}
                  <CoverPreview
                    portada={portada}
                    portadaUrl={portada ? portadaUrlRef.current : portadaUrl}
                    titulo={titulo || 'Sin título'}
                    autor={autor || 'Autor desconocido'}
                    descripcion={descripcion || 'Sin descripción'}
                    categorias={categoriasLabels}
                    generos={generosLabels}
                    etiquetas={etiquetasLabels}
                    valores={valoresLabels}
                    nivel={nivelLabel}
                  />
                </div>
              </div>
            ) : (
              // MODO LIBRO: Vista normal del flipbook
              <BookViewer
                bookRef={bookRef}
                pages={bookState.pages}
                currentPage={bookState.currentPage}
                isFlipping={bookState.isFlipping}
                bookKey={bookState.bookKey}
                onFlip={navigation.onFlip}
                onPageClick={navigation.goToPage}
              />
            )}
          </div>

          {/* Panel lateral de edición - Cambia según el modo */}
          <div 
            className={`
              ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
              lg:translate-x-0
              fixed lg:relative
              top-0 right-0 bottom-0
              w-full sm:w-[400px] lg:w-[450px] xl:w-[500px]
              bg-white border-l border-gray-200
              shadow-xl lg:shadow-none
              transition-transform duration-200
              z-50 lg:z-auto
              overflow-hidden
            `}
          >
            {showCoverMode ? (
              // MODO PORTADA: Panel de portada y metadatos
              <div className="h-full flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
                {/* Header móvil */}
                <div className="lg:hidden flex-shrink-0 bg-orange-600 text-white px-3 py-2 flex items-center justify-between">
                  <h2 className="font-semibold text-sm">📚 Portada</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Cerrar panel"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Header del panel */}
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
                      <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen className="text-orange-600" size={24} />
                        Portada y Metadatos
                      </h2>
                      <p className="text-xs text-gray-600 mt-1">
                        Información general del libro
                      </p>
                      {/* Instrucción para volver */}
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Para volver:</strong> Haz clic en el botón <span className="font-bold">"VOLVER"</span> en el menú superior
                        </p>
                      </div>
                    </div>

                    {/* Portada */}
                    <div className="space-y-2">
                      <div className="bg-orange-100 border-l-4 border-orange-600 p-2 rounded">
                        <h3 className="font-semibold text-orange-900 text-sm">📚 Imagen de Portada</h3>
                        <p className="text-xs text-orange-700">Vista en catálogos</p>
                      </div>
                      <PortadaControls 
                        onImageChange={handlePortadaChange}
                        portada={portada}
                        portadaUrl={portadaUrl} 
                      />
                    </div>

                    {/* Metadatos */}
                    <div className="space-y-2">
                      <div className="bg-pink-100 border-l-4 border-pink-600 p-2 rounded">
                        <h3 className="font-semibold text-pink-900 text-sm">📋 Información</h3>
                        <p className="text-xs text-pink-700">Datos y categorización</p>
                      </div>
                      <BookMetadataForm
                        selectedCategorias={selectedCategorias}
                        selectedGeneros={selectedGeneros}
                        selectedEtiquetas={selectedEtiquetas}
                        selectedValores={selectedValores}
                        selectedNivel={selectedNivel}
                        autor={autor}
                        descripcion={descripcion}
                        titulo={titulo}
                        onCategoriasChange={setSelectedCategorias}
                        onGenerosChange={setSelectedGeneros}
                        onEtiquetasChange={setSelectedEtiquetas}
                        onValoresChange={setSelectedValores}
                        onNivelChange={setSelectedNivel}
                        onAutorChange={setAutor}
                        onDescripcionChange={setDescripcion}
                        onTituloChange={setTitulo}
                        onSave={async () => {}}
                        onCategoriasLabelsChange={setCategoriasLabels}
                        onGenerosLabelsChange={setGenerosLabels}
                        onEtiquetasLabelsChange={setEtiquetasLabels}
                        onValoresLabelsChange={setValoresLabels}
                        onNivelLabelChange={setNivelLabel}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // MODO LIBRO: Sidebar normal de edición de páginas
              <EditorSidebar
                pages={bookState.pages}
                currentPage={bookState.currentPage}
                setPages={bookState.setPages}
                imageHandler={imageHandler}
                navigation={navigation}
                selectedCategorias={selectedCategorias}
                selectedGeneros={selectedGeneros}
                selectedEtiquetas={selectedEtiquetas}
                selectedValores={selectedValores}
                selectedNivel={selectedNivel}
                autor={autor}
                descripcion={descripcion}
                titulo={titulo}
                portada={portada}
                portadaUrl={portadaUrl}
                onCategoriasChange={setSelectedCategorias}
                onGenerosChange={setSelectedGeneros}
                onEtiquetasChange={setSelectedEtiquetas}
                onValoresChange={setSelectedValores}
                onNivelChange={setSelectedNivel}
                onAutorChange={setAutor}
                onDescripcionChange={setDescripcion}
                onTituloChange={setTitulo}
                onPortadaChange={handlePortadaChange}
                onLayoutChange={bookState.handleLayoutChange}
                onBackgroundChange={bookState.handleBackgroundChange}
                onAddPage={bookState.addPage}
                onDeletePage={bookState.deletePage}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            )}
          </div>

          {/* Overlay suave para móvil */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>

        {/* Navegación móvil compacta */}
        <div className="md:hidden flex-shrink-0 bg-white border-t border-gray-200 px-3 py-2 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={navigation.prevPage}
              disabled={!navigation.canGoPrev}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-medium text-xs"
            >
              <ChevronLeft size={14} />
              Anterior
            </button>
            
            <div className="text-center">
              <div className="text-[10px] text-gray-500">Página</div>
              <div className="font-bold text-sm text-gray-900">
                {bookState.currentPage + 1}/{bookState.pages.length}
              </div>
            </div>
            
            <button
              onClick={navigation.nextPage}
              disabled={!navigation.canGoNext}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-medium text-xs"
            >
              Siguiente
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}