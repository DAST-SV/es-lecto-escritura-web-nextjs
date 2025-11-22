/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/BookEditor.tsx
 * DISEÑO: Ultra profesional, sin scroll, validaciones en lista
 * NUEVA FUNCIONALIDAD: Ficha Literaria separada del contenido de las páginas
 */

"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2, 
  AlertCircle, CheckCircle2, Loader2
} from "lucide-react";

// Hooks
import { useBookState } from "../../hooks/useBookState";
import { useImageHandler } from "../../hooks/useImageHandler";
import { useBookNavigation } from "../../hooks/useBookNavigation";

// Componentes
import { BookViewer } from "./BookViewer";
import { EditorSidebar } from "./EditorSidebar";
import { ValidationPanel } from "./ValidationPanel";

// Servicios
import { saveBookJson, BookMetadata } from "@/src/infrastructure/services/bookService";
import type { page } from "@/src/typings/types-page-book/index";

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
    // NUEVO: Imagen de fondo de la Ficha Literaria
    cardBackgroundImage?: File | null;
    cardBackgroundUrl?: string | null;
  };
}

interface ValidationError {
  field: string;
  message: string;
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

  // ============================================
  // ESTADOS DE METADATOS DEL LIBRO
  // ============================================
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
  
  // Portada del libro (página 1)
  const [portada, setPortada] = useState<File | null>(
    initialMetadata?.portada instanceof File ? initialMetadata.portada : null
  );
  
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || 
    (typeof initialMetadata?.portada === 'string' ? initialMetadata.portada : null)
  );

  // ============================================
  // NUEVO: ESTADOS PARA FICHA LITERARIA
  // ============================================
  
  // Imagen de fondo de la FICHA LITERARIA (separada de la portada)
  const [cardBackgroundImage, setCardBackgroundImage] = useState<File | null>(
    initialMetadata?.cardBackgroundImage || null
  );
  
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string | null>(
    initialMetadata?.cardBackgroundUrl || null
  );

  // Labels legibles (nombres) para mostrar en la ficha
  const [categoriasLabels, setCategoriasLabels] = useState<string[]>([]);
  const [generosLabels, setGenerosLabels] = useState<string[]>([]);
  const [etiquetasLabels, setEtiquetasLabels] = useState<string[]>([]);
  const [valoresLabels, setValoresLabels] = useState<string[]>([]);
  const [nivelLabel, setNivelLabel] = useState<string | null>(null);

  // ============================================
  // ESTADOS DE UI
  // ============================================
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // ============================================
  // HOOKS PERSONALIZADOS
  // ============================================
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

  // ============================================
  // VALIDACIÓN
  // ============================================
  const validateBook = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!titulo.trim()) {
      errors.push({ field: 'Título', message: 'El título es obligatorio' });
    }

    if (autores.length === 0) {
      errors.push({ field: 'Autores', message: 'Debe haber al menos un autor' });
    }

    if (!descripcion.trim()) {
      errors.push({ field: 'Descripción', message: 'La descripción es obligatoria' });
    }

    if (selectedCategorias.length === 0) {
      errors.push({ field: 'Categorías', message: 'Selecciona al menos una categoría' });
    }

    if (selectedGeneros.length === 0) {
      errors.push({ field: 'Géneros', message: 'Selecciona al menos un género' });
    }

    if (!portada && !portadaUrl) {
      errors.push({ field: 'Portada', message: 'Selecciona una imagen de portada' });
    }

    // NUEVO: Validación de ficha literaria (opcional pero recomendado)
    if (!cardBackgroundImage && !cardBackgroundUrl) {
      errors.push({ 
        field: 'Ficha Literaria', 
        message: 'Recomendado: Agrega una imagen para la ficha literaria' 
      });
    }

    return errors;
  }, [titulo, autores, descripcion, selectedCategorias, selectedGeneros, portada, portadaUrl, cardBackgroundImage, cardBackgroundUrl]);

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSave = useCallback(async () => {
    // Validar
    const errors = validateBook();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
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
      // NUEVO: Imagen de fondo de la ficha literaria
      cardBackgroundImage,
      cardBackgroundUrl,
    };

    setIsSaving(true);
    try {
      await saveBookJson(bookState.pages, metadata, IdLibro);
      toast.success('✅ Libro guardado correctamente');
      setValidationErrors([]);
      setShowValidation(false);
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
    IdLibro,
    validateBook
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

  // NUEVO: Handler para imagen de fondo de la ficha literaria
  const handleCardBackgroundChange = useCallback((file: File | null) => {
    setCardBackgroundImage(file);
    
    if (file) {
      // Limpiar URL anterior si existe
      if (cardBackgroundUrlRef.current) {
        URL.revokeObjectURL(cardBackgroundUrlRef.current);
      }
      // Crear nueva URL temporal
      cardBackgroundUrlRef.current = URL.createObjectURL(file);
      setCardBackgroundUrl(cardBackgroundUrlRef.current);
    } else {
      // Limpiar URL si se quita la imagen
      if (cardBackgroundUrlRef.current) {
        URL.revokeObjectURL(cardBackgroundUrlRef.current);
        cardBackgroundUrlRef.current = null;
      }
      setCardBackgroundUrl(null);
    }
  }, []);

  // Cleanup de URLs al desmontar
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
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Toaster position="top-right" />

      {/* Header - Ultra compacto */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 py-2 flex items-center justify-between">
          {/* Left: Info */}
          <div className="flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={20} />
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-none">
                {titulo || 'Nuevo Libro'}
              </h1>
              <p className="text-xs text-slate-500">
                Página {bookState.currentPage + 1}/{bookState.pages.length}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Validación status */}
            {validationErrors.length > 0 && (
              <button
                onClick={() => setShowValidation(!showValidation)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 transition-colors"
              >
                <AlertCircle size={14} />
                {validationErrors.length} pendiente{validationErrors.length > 1 ? 's' : ''}
              </button>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
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

      {/* Main Content - Sin padding/margin innecesario */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Sidebar - Ancho fijo, scroll interno */}
        <div className="w-80 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
          <EditorSidebar
            pages={bookState.pages}
            currentPage={bookState.currentPage}
            setPages={bookState.setPages}
            setCurrentPage={bookState.setCurrentPage}
            imageHandler={imageHandler}
            navigation={navigation}
            
            // Datos del libro para la ficha literaria
            titulo={titulo}
            autores={autores}
            descripcion={descripcion}
            
            // Labels legibles para la ficha
            categoriasLabels={categoriasLabels}
            generosLabels={generosLabels}
            valoresLabels={valoresLabels}
            nivelLabel={nivelLabel}
            
            // NUEVO: Imagen de fondo de la ficha literaria
            cardBackgroundImage={cardBackgroundImage}
            cardBackgroundUrl={cardBackgroundUrl}
            onCardBackgroundChange={handleCardBackgroundChange}
            
            // Handlers de páginas
            onLayoutChange={bookState.handleLayoutChange}
            onBackgroundChange={bookState.handleBackgroundChange}
            onAddPage={bookState.addPage}
            onDeletePage={bookState.deletePage}
          />
        </div>

        {/* Viewer - Flex-1, sin scroll */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mini toolbar */}
          <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={navigation.prevPage}
                disabled={!navigation.canGoPrev}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              
              <button
                onClick={navigation.nextPage}
                disabled={!navigation.canGoNext}
                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={bookState.addPage}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded transition-colors"
              >
                <Plus size={14} />
                Nueva
              </button>
              
              {bookState.pages.length > 2 && (
                <button
                  onClick={bookState.deletePage}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Eliminar página"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Viewer */}
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

        {/* Validation Panel - Slide-in desde la derecha */}
        <ValidationPanel
          isOpen={showValidation}
          errors={validationErrors}
          onClose={() => setShowValidation(false)}
        />
      </div>
    </div>
  );
}