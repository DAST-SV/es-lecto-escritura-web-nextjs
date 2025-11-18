"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { 
  Save, ChevronLeft, ChevronRight, BookOpen, 
  Menu, X 
} from "lucide-react";

// Hooks personalizados (tus hooks existentes)
import { useBookState } from "../hooks/useBookState";
import { useImageHandler } from "../hooks/useImageHandler";
import { useBookNavigation } from "../hooks/useBookNavigation";

// Componentes
import { BookViewer } from "./BookViewer";
import { EditorSidebar } from "./EditorSidebar";

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

  // Estados UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
    }
  }, []);

  return (
    <UnifiedLayout mainClassName="pt-0">
      <div className="h-[calc(100vh-56px)] flex flex-col bg-gray-100 overflow-hidden">
        <Toaster position="bottom-center" />

        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
            {/* Logo y título */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0">
                <BookOpen size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Editor de Libros</h1>
                <p className="text-xs sm:text-sm opacity-90 truncate">{titulo || 'Sin título'}</p>
              </div>
            </div>

            {/* Controles del centro */}
            <div className="hidden md:flex items-center gap-3">
              {/* Navegación de páginas */}
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <button
                  onClick={navigation.prevPage}
                  disabled={!navigation.canGoPrev}
                  className="p-1 hover:bg-white/20 rounded disabled:opacity-50 transition-colors"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-3 font-medium min-w-[60px] text-center">
                  {bookState.currentPage + 1} / {bookState.pages.length}
                </span>
                <button
                  onClick={navigation.nextPage}
                  disabled={!navigation.canGoNext}
                  className="p-1 hover:bg-white/20 rounded disabled:opacity-50 transition-colors"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Acciones de la derecha */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Botón guardar */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-3 sm:px-6 py-2 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 disabled:opacity-50 shadow-lg transition-colors text-sm sm:text-base"
              >
                <Save size={18} />
                <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar'}</span>
                <span className="sm:hidden">💾</span>
              </button>

              {/* Toggle sidebar (móvil y tablet) */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/20 rounded transition-colors"
                aria-label={isSidebarOpen ? 'Cerrar panel' : 'Abrir panel'}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Vista previa del libro (UNA SOLA PÁGINA con FlipBook) */}
          <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-0' : ''}`}>
            <BookViewer
              bookRef={bookRef}
              pages={bookState.pages}
              currentPage={bookState.currentPage}
              isFlipping={bookState.isFlipping}
              bookKey={bookState.bookKey}
              onFlip={navigation.onFlip}
              onPageClick={navigation.goToPage}
            />
          </div>

          {/* Panel lateral de edición (MÁS ANCHO) */}
          <div 
            className={`
              ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
              lg:translate-x-0
              fixed lg:relative
              top-0 right-0 bottom-0
              w-full sm:w-[450px] lg:w-[500px] xl:w-[600px]
              bg-white border-l border-gray-200
              shadow-2xl lg:shadow-none
              transition-transform duration-300
              z-50 lg:z-auto
              overflow-hidden
            `}
          >
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
          </div>

          {/* Overlay para cerrar sidebar en móvil */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>

        {/* Navegación móvil inferior */}
        <div className="md:hidden flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={navigation.prevPage}
              disabled={!navigation.canGoPrev}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>
            
            <div className="text-center">
              <div className="text-xs text-gray-500">Página</div>
              <div className="font-bold text-gray-900">
                {bookState.currentPage + 1} / {bookState.pages.length}
              </div>
            </div>
            
            <button
              onClick={navigation.nextPage}
              disabled={!navigation.canGoNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}