/**
 * BookEditor - ACTUALIZADO con Clean Architecture
 * ✅ Usa Use Cases en lugar de servicios directos
 */
"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2,
  FileText, ArrowLeft, Loader2
} from "lucide-react";

// ✅ NUEVO: Importar Use Cases
import { CreateBookUseCase } from "@/src/core/application/use-cases/books/CreateBook.usecase";
import { UpdateBookUseCase } from "@/src/core/application/use-cases/books/UpdateBook.usecase";
import { GetBookUseCase } from "@/src/core/application/use-cases/books/GetBook.usecase";

import { useBookState } from "../../hooks/useBookState";
import { useImageHandler } from "../../hooks/useImageHandler";
import { useBookNavigation } from "../../hooks/useBookNavigation";

import { EditorSidebar } from "./EditorSidebar";
import { ValidationPanel } from "./ValidationPanel";
import { LoadingOverlay } from "./LoadingOverlay";

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

  const [viewMode, setViewMode] = useState<'pages' | 'card'>('pages');
  const [pageInput, setPageInput] = useState('1');

  // Estados de metadata
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

  const [portada, setPortada] = useState<File | null>(null);
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || null
  );

  const [cardBackgroundImage, setCardBackgroundImage] = useState<File | null>(null);
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string | null>(
    initialMetadata?.cardBackgroundUrl || null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ field: string; message: string }>>([]);

  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');

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

  // ✅ Validación del libro
  const validateBook = useCallback(() => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!bookState.pages || bookState.pages.length === 0) {
      errors.push({
        field: 'Páginas',
        message: 'Debes crear al menos una página'
      });
    }

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
      errors.push({ field: 'Categorías', message: 'Selecciona al menos una categoría' });
    }

    if (selectedGeneros.length === 0) {
      errors.push({ field: 'Géneros', message: 'Selecciona al menos un género' });
    }

    return errors;
  }, [
    bookState.pages,
    titulo,
    descripcion,
    autores,
    selectedCategorias,
    selectedGeneros
  ]);

  // ✅ FUNCIÓN PRINCIPAL: handleSave con Use Cases
  const handleSave = useCallback(async () => {
    console.log('🔥 INICIANDO GUARDADO');

    // Validaciones
    const errors = validateBook();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error('Corrige los errores antes de guardar', {
        duration: 5000,
        style: { zIndex: 99999 }
      });
      return;
    }

    setIsSaving(true);
    setLoadingStatus('loading');
    setLoadingMessage('Guardando libro...');

    try {
      // 1️⃣ Obtener userId (solo si es creación)
      let userId: string | undefined;
      if (!IdLibro) {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Usuario no autenticado');
        }
        userId = JSON.parse(userStr).id;
      }

      // 2️⃣ Preparar datos del libro
      const bookData = {
        titulo,
        descripcion,
        portada: portadaUrl || cardBackgroundUrl || undefined,
        autores,
        personajes,
        categorias: selectedCategorias.map(c => Number(c)),
        generos: selectedGeneros.map(g => Number(g)),
        etiquetas: selectedEtiquetas.map(e => Number(e)),
        valores: selectedValores.map(v => Number(v)),
        nivel: selectedNivel || 1,
        pages: bookState.pages.map(page => ({
          layout: page.layout || 'TextCenterLayout',
          title: page.title || '',
          text: page.text || '',
          image: page.image || '',
          background: page.background || 'blanco',
        }))
      };

      console.log('📦 Datos del libro:', {
        titulo: bookData.titulo,
        pagesCount: bookData.pages.length,
        autoresCount: bookData.autores.length
      });

      // 3️⃣ Guardar usando el Use Case apropiado
      if (IdLibro) {
        // ✅ ACTUALIZAR libro existente
        console.log('✏️ Actualizando libro:', IdLibro);
        await UpdateBookUseCase.execute(IdLibro, bookData);
      } else {
        // ✅ CREAR libro nuevo
        console.log('🆕 Creando libro nuevo');
        if (!userId) throw new Error('userId es requerido para crear');
        await CreateBookUseCase.execute(userId, bookData);
      }

      console.log('✅ Guardado exitoso');

      setLoadingStatus('success');
      setLoadingMessage('¡Libro guardado correctamente!');
      
      toast.success('✅ Libro guardado', {
        duration: 3000,
        style: { zIndex: 99999 }
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/dashboard/mis-libros';
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
      
      setLoadingStatus('error');
      setLoadingMessage(error.message || 'Error al guardar el libro');
      
      toast.error(`❌ ${error.message}`, {
        duration: 5000,
        style: { zIndex: 99999 }
      });

      setTimeout(() => {
        setLoadingStatus('idle');
        setIsSaving(false);
      }, 3000);
    }
  }, [
    IdLibro,
    validateBook,
    titulo,
    descripcion,
    autores,
    personajes,
    portadaUrl,
    cardBackgroundUrl,
    selectedCategorias,
    selectedGeneros,
    selectedEtiquetas,
    selectedValores,
    selectedNivel,
    bookState.pages
  ]);

  // Handlers de metadata
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

  const handlePortadaChange = useCallback((file: File | null) => {
    setPortada(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPortadaUrl(url);
    } else {
      setPortadaUrl(null);
    }
  }, []);

  const handleCardBackgroundChange = useCallback((file: File | null) => {
    setCardBackgroundImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCardBackgroundUrl(url);
    } else {
      setCardBackgroundUrl(null);
    }
  }, []);

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

  return (
    <div className="h-full w-full flex flex-col overflow-hidden border border-slate-200 bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { zIndex: 99999 }
        }} 
      />

      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={20} />
              <h1 className="text-sm font-semibold text-slate-900">
                {titulo || 'Nuevo Libro'}
              </h1>
            </div>

            {viewMode === 'pages' && (
              <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                <button
                  onClick={navigation.prevPage}
                  disabled={!navigation.canGoPrev}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>

                <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    className="w-10 text-center px-1 py-0.5 border rounded text-xs"
                  />
                  <span className="text-xs">/ {bookState.pages.length}</span>
                </form>

                <button
                  onClick={navigation.nextPage}
                  disabled={!navigation.canGoNext}
                  className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={bookState.addPage}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 hover:bg-green-100 rounded"
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              >
                <FileText size={16} />
                Ver Ficha
              </button>
            ) : (
              <button
                onClick={() => setViewMode('pages')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white text-sm rounded hover:bg-slate-700"
              >
                <ArrowLeft size={16} />
                Volver
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
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
      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
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
              onCategoriasLabelsChange={setCategoriasLabels}
              onGenerosChange={handleGenerosChange}
              onGenerosLabelsChange={setGenerosLabels}
              onEtiquetasChange={handleEtiquetasChange}
              onEtiquetasLabelsChange={setEtiquetasLabels}
              onValoresChange={handleValoresChange}
              onValoresLabelsChange={setValoresLabels}
              onNivelChange={handleNivelChange}
              onNivelLabelChange={setNivelLabel}
            />
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'pages' ? (
            <BookViewer
              bookRef={bookRef}
              pages={bookState.pages}
              currentPage={bookState.currentPage}
              isFlipping={bookState.isFlipping}
              bookKey={bookState.bookKey}
              onFlip={navigation.onFlip}
              onPageClick={navigation.goToPage}
            />
          ) : (
            <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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

      <LoadingOverlay
        isVisible={loadingStatus !== 'idle'}
        status={loadingStatus as 'loading' | 'success' | 'error'}
        message={loadingMessage}
      />

      <ValidationPanel
        isOpen={showValidation}
        errors={validationErrors}
        onClose={() => setShowValidation(false)}
      />
    </div>
  );
}