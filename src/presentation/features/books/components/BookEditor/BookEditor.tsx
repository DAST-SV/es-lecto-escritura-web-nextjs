/**
 * UBICACIÓN: src/presentation/features/book/components/BookEditor/BookEditor.tsx
 * 
 * Editor PRINCIPAL de libro - Layout: Sidebar izquierda + Visualizador derecha
 * Incluye TODAS las funcionalidades de guardado, navegación, metadatos
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import { 
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2
} from "lucide-react";

// Hooks
import { useBookState } from "../../hooks/useBookState";
import { useImageHandler } from "../../hooks/useImageHandler";
import { useBookNavigation } from "../../hooks/useBookNavigation";

// Componentes
import { BookViewer } from "./BookViewer";
import { EditorSidebar } from "./EditorSidebar";
import { BookMetadataForm } from "../BookMetadata/BookMetadataForm";
import { CoverPreview } from "../CoverPreview/CoverPreview";

// Servicios

// Tipos
import type { page } from "@/src/typings/types-page-book/index";
import { BookMetadata, saveBookJson } from "@/src/infrastructure/services/bookService";

interface BookEditorProps {
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

export function BookEditor({ 
  initialPages, 
  title, 
  IdLibro, 
  initialMetadata 
}: BookEditorProps = {}) {
  
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

  // Labels de metadatos
  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [generosLabels, setGenerosLabels] = useState<string[]>([]);
  const [etiquetasLabels, setEtiquetasLabels] = useState<string[]>([]);
  const [valoresLabels, setValoresLabels] = useState<string[]>([]);
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

  // Estados UI
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
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster position="bottom-center" />

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen size={20} className="text-indigo-600 flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate">Editor de Libros</h1>
              <p className="text-xs text-gray-500 truncate">{titulo || 'Sin título'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCoverMode(!showCoverMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all text-xs ${
                showCoverMode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              <BookOpen size={14} />
              <span>{showCoverMode ? 'EDITOR' : 'FICHA'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-colors text-xs"
            >
              <Save size={16} />
              <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layout principal: Sidebar + Viewer */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR IZQUIERDA (300px fijo) */}
        <div className="w-[350px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {showCoverMode ? (
            // Modo ficha literaria
            <div className="flex-1 overflow-y-auto p-4">
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
          ) : (
            // Modo editor normal
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
            />
          )}
        </div>

        {/* VISUALIZADOR DERECHA (flex-1, ocupa todo el espacio restante) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Controles de navegación */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={navigation.prevPage}
                disabled={!navigation.canGoPrev}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-medium text-xs"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
              
              <div className="text-center px-4">
                <div className="text-xs text-gray-500">Página</div>
                <div className="font-bold text-sm text-gray-900">
                  {bookState.currentPage + 1} / {bookState.pages.length}
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

            <div className="flex items-center gap-2">
              <button
                onClick={bookState.addPage}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-all text-xs"
              >
                <Plus size={14} />
                Nueva Página
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
          </div>

          {/* Viewer del libro */}
          <div className="flex-1 overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}