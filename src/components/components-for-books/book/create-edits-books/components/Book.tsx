"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { 
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, X
} from "lucide-react";

// Hooks personalizados
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
    autores?: string[];
    personajes?: string[];
    descripcion?: string;
    titulo?: string;
    portada?: File | string | null;
    portadaUrl?: string | null;
  };
}

export function Book({ initialPages, title, IdLibro, initialMetadata }: BookProps = {}) {
  const bookRef = useRef<any>(null);
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
  const [autores, setAutores] = useState<string[]>(initialMetadata?.autores || []);
  const [personajes, setPersonajes] = useState<string[]>(initialMetadata?.personajes || []);
  const [descripcion, setDescripcion] = useState<string>(initialMetadata?.descripcion || "");
  const [titulo, setTitulo] = useState<string>(initialMetadata?.titulo || "");
  
  const [portada, setPortada] = useState<File | null>(
    initialMetadata?.portada instanceof File ? initialMetadata.portada : null
  );
  
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || 
    (typeof initialMetadata?.portada === 'string' ? initialMetadata.portada : null)
  );

  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [generosLabels, setGenerosLabels] = useState<string[]>([]);
  const [etiquetasLabels, setEtiquetasLabels] = useState<string[]>([]);
  const [valoresLabels, setValoresLabels] = useState<string[]>([]);
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

  // Estados UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverMode, setShowCoverMode] = useState(false);

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
      autores,
      personajes,
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
    autores,
    personajes,
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
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
      }
      portadaUrlRef.current = URL.createObjectURL(file);
    } else {
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
        portadaUrlRef.current = null;
      }
    }
  }, []);

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

        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">Editor</h1>
                <p className="text-[10px] text-gray-500 truncate">{titulo || 'Sin título'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-center max-w-md">
              <button
                onClick={() => setShowCoverMode(!showCoverMode)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all text-xs ${
                  showCoverMode
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                <BookOpen size={14} />
                <span>{showCoverMode ? 'VOLVER' : 'FICHA LITERARIA'}</span>
              </button>

              <div className="h-6 w-px bg-gray-300" />

              {!showCoverMode && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {bookState.currentPage + 1}/{bookState.pages.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={bookState.addPage}
                      className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-all text-[11px]"
                    >
                      <Plus size={14} />
                      <span className="hidden sm:inline">Nueva</span>
                    </button>
                    
                    {bookState.pages.length > 2 && (
                      <button
                        onClick={bookState.deletePage}
                        className="flex items-center justify-center p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                    <button
                      onClick={navigation.prevPage}
                      disabled={!navigation.canGoPrev}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={navigation.nextPage}
                      disabled={!navigation.canGoNext}
                      className="p-1 hover:bg-white rounded disabled:opacity-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors text-xs sm:text-sm"
              >
                <Save size={16} />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                disabled={showCoverMode}
                className={`lg:hidden px-2 py-1.5 rounded-lg transition-colors text-xs font-medium ${
                  showCoverMode 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isSidebarOpen ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 min-w-0">
            {showCoverMode ? (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 overflow-y-auto">
                <div className="max-w-5xl mx-auto p-6">
                  <CoverPreview
                    portada={portada}
                    portadaUrl={portada ? portadaUrlRef.current : portadaUrl}
                    titulo={titulo || 'Sin título'}
                    autores={autores}
                    descripcion={descripcion || 'Sin descripción'}
                    categorias={categoriasLabels}
                    personajes={personajes}
                    generos={generosLabels}
                    etiquetas={etiquetasLabels}
                    valores={valoresLabels}
                    nivel={nivelLabel}
                  />
                </div>
              </div>
            ) : (
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
              <div className="h-full flex flex-col bg-white">
                <div className="lg:hidden flex-shrink-0 bg-orange-600 text-white px-3 py-2 flex items-center justify-between">
                  <h2 className="font-semibold text-sm">📚 Ficha Literaria</h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <PortadaControls 
                      onImageChange={handlePortadaChange}
                      portada={portada}
                      portadaUrl={portadaUrl} 
                    />

                    <BookMetadataForm
                      selectedCategorias={selectedCategorias}
                      selectedGeneros={selectedGeneros}
                      selectedEtiquetas={selectedEtiquetas}
                      selectedValores={selectedValores}
                      selectedNivel={selectedNivel}
                      autores={autores}
                      personajes={personajes}
                      descripcion={descripcion}
                      titulo={titulo}
                      onCategoriasChange={setSelectedCategorias}
                      onGenerosChange={setSelectedGeneros}
                      onEtiquetasChange={setSelectedEtiquetas}
                      onValoresChange={setSelectedValores}
                      onNivelChange={setSelectedNivel}
                      onAutoresChange={setAutores}
                      onPersonajesChange={setPersonajes}
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
            ) : (
              <EditorSidebar
                pages={bookState.pages}
                currentPage={bookState.currentPage}
                setPages={bookState.setPages}
                setCurrentPage={bookState.setCurrentPage}
                imageHandler={imageHandler}
                navigation={navigation}
                selectedCategorias={selectedCategorias}
                selectedGeneros={selectedGeneros}
                selectedEtiquetas={selectedEtiquetas}
                selectedValores={selectedValores}
                selectedNivel={selectedNivel}
                autores={autores}
                personajes={personajes}
                descripcion={descripcion}
                titulo={titulo}
                portada={portada}
                portadaUrl={portadaUrl}
                onCategoriasChange={setSelectedCategorias}
                onGenerosChange={setSelectedGeneros}
                onEtiquetasChange={setSelectedEtiquetas}
                onValoresChange={setSelectedValores}
                onNivelChange={setSelectedNivel}
                onAutoresChange={setAutores}
                onPersonajesChange={setPersonajes}
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

          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/30 z-40 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>

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