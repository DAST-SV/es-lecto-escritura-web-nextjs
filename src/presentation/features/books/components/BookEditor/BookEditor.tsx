/**
 * BookEditor - Sidebar más ancho (400px)
 */
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2,
  FileText, ArrowLeft, Loader2
} from "lucide-react";

import { useBookState } from "../../hooks/useBookState";
import { useImageHandler } from "../../hooks/useImageHandler";
import { useBookNavigation } from "../../hooks/useBookNavigation";

import { EditorSidebar } from "./EditorSidebar";
import { ValidationPanel } from "./ValidationPanel";

import { saveBookJson, BookMetadata } from "@/src/infrastructure/services/bookService";
import type { page } from "@/src/typings/types-page-book/index";
import LiteraryCardView from "./LiteraryCardView";
import { LiteraryMetadataForm } from "./LiteraryMetadataForm";
import { BookViewer } from "./BookViewer";

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
    cardBackgroundImage?: File | null;
    cardBackgroundUrl?: string | null;
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
  const cardBackgroundUrlRef = useRef<string | null>(null);

  const [viewMode, setViewMode] = useState<'pages' | 'card'>('pages');
  const [pageInput, setPageInput] = useState('1');

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

  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [generosLabels, setGenerosLabels] = useState<string[]>([]);
  const [etiquetasLabels, setEtiquetasLabels] = useState<string[]>([]);
  const [valoresLabels, setValoresLabels] = useState<string[]>([]);
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

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

  const [cardBackgroundImage, setCardBackgroundImage] = useState<File | null>(
    initialMetadata?.cardBackgroundImage || null
  );

  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string | null>(
    initialMetadata?.cardBackgroundUrl || null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const bookState = useBookState({ initialPages, title });

  const handleBackgroundChanged = useCallback(() => {
    bookState.setBookKey?.(prev => prev + 1);
  }, []);

  const imageHandler = useImageHandler({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    setPages: bookState.setPages,
    onBackgroundChange: handleBackgroundChanged
  });

  const navigation = useBookNavigation({
    pages: bookState.pages,
    currentPage: bookState.currentPage,
    isFlipping: bookState.isFlipping,
    setCurrentPage: bookState.setCurrentPage,
    setIsFlipping: bookState.setIsFlipping,
    bookRef
  });

  React.useEffect(() => {
    setPageInput((bookState.currentPage + 1).toString());
  }, [bookState.currentPage]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInput(value);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= bookState.pages.length) {
      navigation.goToPage(pageNum - 1);
    } else {
      setPageInput((bookState.currentPage + 1).toString());
    }
  };

  const handleCategoriasChange = useCallback((values: (number | string)[]) => {
    setSelectedCategorias(values);
  }, []);

  const handleGenerosChange = useCallback((values: (number | string)[]) => {
    setSelectedGeneros(values);
  }, []);

  const handleEtiquetasChange = useCallback((values: (number | string)[]) => {
    setSelectedEtiquetas(values);
  }, []);

  const handleValoresChange = useCallback((values: (number | string)[]) => {
    setSelectedValores(values);
  }, []);

  const handleNivelChange = useCallback((value: number | null) => {
    setSelectedNivel(value);
  }, []);

  const handleCategoriasLabelsChange = useCallback((labels: string[]) => {
    setCategoriasLabels(labels);
  }, []);

  const handleGenerosLabelsChange = useCallback((labels: string[]) => {
    setGenerosLabels(labels);
  }, []);

  const handleEtiquetasLabelsChange = useCallback((labels: string[]) => {
    setEtiquetasLabels(labels);
  }, []);

  const handleValoresLabelsChange = useCallback((labels: string[]) => {
    setValoresLabels(labels);
  }, []);

  const handleNivelLabelChange = useCallback((label: string | null) => {
    setNivelLabel(label);
  }, []);

  const handleSave = useCallback(async () => {
    const errors = validateBook();

    if (errors.length > 0) {
      setShowValidation(true);
      return;
    }

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
      cardBackgroundImage,
      cardBackgroundUrl,
    };

    setIsSaving(true);
    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
      toast.success('✅ Libro guardado correctamente');
    } catch (error) {
      console.error("❌ Error en handleSave:", error);
      toast.error('❌ Error al guardar el libro');
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
    cardBackgroundImage,
    cardBackgroundUrl,
    IdLibro
  ]);

  const validateBook = useCallback(() => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!titulo.trim()) {
      errors.push({ field: 'Título', message: 'El título es obligatorio' });
    }

    if (!descripcion.trim()) {
      errors.push({ field: 'Descripción', message: 'La descripción es obligatoria' });
    }

    if (autores.length === 0) {
      errors.push({ field: 'Autores', message: 'Debe haber al menos un autor' });
    }

    if (selectedCategorias.length === 0) {
      errors.push({ field: 'Tipo de Lectura', message: 'Selecciona al menos una categoría' });
    }

    if (selectedGeneros.length === 0) {
      errors.push({ field: 'Géneros', message: 'Selecciona al menos un género' });
    }

    if (!portada && !portadaUrl) {
      errors.push({ field: 'Portada', message: 'Sube una imagen de portada' });
    }

    return errors;
  }, [titulo, descripcion, autores, selectedCategorias, selectedGeneros, portada, portadaUrl]);

  const handlePortadaChange = useCallback((file: File | null) => {
    setPortada(file);
    if (file) {
      setPortadaUrl(null);
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
      }
      portadaUrlRef.current = URL.createObjectURL(file);
      setPortadaUrl(portadaUrlRef.current);
    } else {
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
        portadaUrlRef.current = null;
      }
      setPortadaUrl(null);
    }
  }, []);

  const handleCardBackgroundChange = useCallback((file: File | null) => {
    setCardBackgroundImage(file);

    if (file) {
      if (cardBackgroundUrlRef.current) {
        URL.revokeObjectURL(cardBackgroundUrlRef.current);
      }
      cardBackgroundUrlRef.current = URL.createObjectURL(file);
      setCardBackgroundUrl(cardBackgroundUrlRef.current);
    } else {
      if (cardBackgroundUrlRef.current) {
        URL.revokeObjectURL(cardBackgroundUrlRef.current);
        cardBackgroundUrlRef.current = null;
      }
      setCardBackgroundUrl(null);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (portadaUrlRef.current) {
        URL.revokeObjectURL(portadaUrlRef.current);
      }
      if (cardBackgroundUrlRef.current) {
        URL.revokeObjectURL(cardBackgroundUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden border border-slate-200 bg-white">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={20} />
              <div>
                <h1 className="text-sm font-semibold text-slate-900 leading-none">
                  {titulo || 'Nuevo Libro'}
                </h1>
              </div>
            </div>

            {viewMode === 'pages' && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button
                  onClick={navigation.prevPage}
                  disabled={!navigation.canGoPrev}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputSubmit}
                    disabled={bookState.isFlipping}
                    className="w-10 text-center px-1 py-0.5 border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-xs text-slate-600">/ {bookState.pages.length}</span>
                </form>

                <button
                  onClick={navigation.nextPage}
                  disabled={!navigation.canGoNext}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <button
                  onClick={bookState.addPage}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded"
                >
                  <Plus size={14} />
                  Nueva
                </button>

                {bookState.pages.length > 2 && (
                  <button
                    onClick={bookState.deletePage}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'pages' ? (
              <button
                onClick={() => setViewMode('card')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700"
              >
                <FileText size={16} />
                Ver Ficha
              </button>
            ) : (
              <button
                onClick={() => setViewMode('pages')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white text-sm font-medium rounded hover:bg-slate-700"
              >
                <ArrowLeft size={16} />
                Volver
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ✅ Sidebar más ancho: 400px */}
        <div className="w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          {viewMode === 'pages' ? (
            <EditorSidebar
              pages={bookState.pages}
              currentPage={bookState.currentPage}
              setPages={bookState.setPages}
              setCurrentPage={bookState.setCurrentPage}
              imageHandler={imageHandler}
              navigation={navigation}
              titulo={titulo}
              autores={autores}
              descripcion={descripcion}
              categoriasLabels={categoriasLabels}
              generosLabels={generosLabels}
              valoresLabels={valoresLabels}
              nivelLabel={nivelLabel}
              cardBackgroundImage={cardBackgroundImage}
              cardBackgroundUrl={cardBackgroundUrl}
              onCardBackgroundChange={handleCardBackgroundChange}
              onLayoutChange={bookState.handleLayoutChange}
              onBackgroundChange={bookState.handleBackgroundChange}
              onAddPage={bookState.addPage}
              onDeletePage={bookState.deletePage}
            />
          ) : (
            <LiteraryMetadataForm
              titulo={titulo}
              descripcion={descripcion}
              autores={autores}
              personajes={personajes}
              portada={portada}
              portadaUrl={portadaUrl}
              cardBackgroundImage={cardBackgroundImage}
              cardBackgroundUrl={cardBackgroundUrl}
              selectedCategorias={selectedCategorias}
              selectedGeneros={selectedGeneros}
              selectedEtiquetas={selectedEtiquetas}
              selectedValores={selectedValores}
              selectedNivel={selectedNivel}
              onTituloChange={setTitulo}
              onDescripcionChange={setDescripcion}
              onAutoresChange={setAutores}
              onPersonajesChange={setPersonajes}
              onPortadaChange={handlePortadaChange}
              onCardBackgroundChange={handleCardBackgroundChange}
              onCategoriasChange={handleCategoriasChange}
              onCategoriasLabelsChange={handleCategoriasLabelsChange}
              onGenerosChange={handleGenerosChange}
              onGenerosLabelsChange={handleGenerosLabelsChange}
              onEtiquetasChange={handleEtiquetasChange}
              onEtiquetasLabelsChange={handleEtiquetasLabelsChange}
              onValoresChange={handleValoresChange}
              onValoresLabelsChange={handleValoresLabelsChange}
              onNivelChange={handleNivelChange}
              onNivelLabelChange={handleNivelLabelChange}
            />
          )}
        </div>

        {/* Área Central */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {viewMode === 'pages' ? (
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
          ) : (
            <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
              <LiteraryCardView
                backgroundUrl={cardBackgroundUrl || portadaUrl}
                titulo={titulo}
                autores={autores}
                personajes={personajes}
                descripcion={descripcion}
                categorias={categoriasLabels}
                generos={generosLabels}
                etiquetas={etiquetasLabels}
                valores={valoresLabels}
                nivel={nivelLabel}
                onCardBackgroundChange={handleCardBackgroundChange}
              />
            </div>
          )}
        </div>
      </div>

      <ValidationPanel
        isOpen={showValidation}
        errors={validateBook()}
        onClose={() => setShowValidation(false)}
      />
    </div>
  );
}