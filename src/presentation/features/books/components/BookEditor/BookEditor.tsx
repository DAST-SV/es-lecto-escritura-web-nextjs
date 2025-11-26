/**
 * BookEditor - CORREGIDO: Sube imágenes a Supabase antes de guardar
 * ✅ Usa BookImageService para persistir imágenes
 * ✅ Consistencia visual con modo lectura
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  Save, ChevronLeft, ChevronRight, BookOpen, Plus, Trash2,
  FileText, ArrowLeft, Loader2
} from "lucide-react";

import { createClient } from '@/src/utils/supabase/client';
import { useLocale } from 'next-intl';

// Use Cases
import { CreateBookUseCase } from "@/src/core/application/use-cases/books/CreateBook.usecase";
import { UpdateBookUseCase } from "@/src/core/application/use-cases/books/UpdateBook.usecase";

// ✅ NUEVO: Servicio de imágenes
import { BookImageService } from "@/src/infrastructure/services/BookImageService";

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
  const supabase = createClient();
  const locale = useLocale();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  // ✅ ARCHIVOS de portada y card background
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaUrl, setPortadaUrl] = useState<string | null>(
    initialMetadata?.portadaUrl || null
  );

  const [cardBackgroundFile, setCardBackgroundFile] = useState<File | null>(null);
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

  // Verificar autenticación
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.warn('⚠️ Usuario no autenticado');
          toast.error('Debes iniciar sesión para crear libros');
          setIsCheckingAuth(false);
          return;
        }

        console.log('✅ Usuario autenticado:', user.id);
        setCurrentUserId(user.id);
        setIsCheckingAuth(false);
        
      } catch (err) {
        console.error('❌ Error verificando autenticación:', err);
        toast.error('Error al verificar sesión');
        setIsCheckingAuth(false);
      }
    }

    checkAuth();
  }, [supabase]);

  // Validación del libro
  const validateBook = useCallback(() => {
    const errors: Array<{ field: string; message: string }> = [];

    if (!bookState.pages || bookState.pages.length === 0) {
      errors.push({
        field: 'Páginas',
        message: 'Debes crear al menos una página'
      });
    }

    if (!titulo.trim()) {
      errors.push({ 
        field: 'Título', 
        message: 'El título es obligatorio' 
      });
    }

    if (autores.length === 0) {
      errors.push({ 
        field: 'Autores', 
        message: 'Debe haber al menos un autor' 
      });
    }

    if (!selectedNivel) {
      errors.push({ 
        field: 'Nivel de Lectura', 
        message: 'Debes seleccionar un nivel de lectura' 
      });
    }

    if (descripcion && descripcion.length > 800) {
      errors.push({ 
        field: 'Descripción', 
        message: 'La descripción no puede exceder 800 caracteres' 
      });
    }

    return errors;
  }, [bookState.pages, titulo, descripcion, autores, selectedNivel]);

  // ✅ FUNCIÓN PRINCIPAL: handleSave - CON UPLOAD DE IMÁGENES
  const handleSave = useCallback(async () => {
    console.log('🔥 INICIANDO GUARDADO');

    if (!currentUserId) {
      toast.error('❌ Debes iniciar sesión para guardar');
      return;
    }

    const errors = validateBook();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error('Corrige los errores antes de guardar');
      return;
    }

    setIsSaving(true);
    setLoadingStatus('loading');
    setLoadingMessage('Preparando libro...');

    try {
      // 1️⃣ Generar ID temporal si es libro nuevo
      const tempBookId = IdLibro || `temp_${Date.now()}`;

      // 2️⃣ SUBIR TODAS LAS IMÁGENES PRIMERO
      setLoadingMessage('Subiendo imágenes...');
      
      const uploadedImages = await BookImageService.uploadAllBookImages(
        currentUserId,
        tempBookId,
        {
          portadaFile: portadaFile,
          cardBackgroundFile: cardBackgroundFile,
          pages: bookState.pages.map(page => ({
            file: page.file as Blob | null,
            backgroundFile: page.backgroundFile as Blob | null,
            image: page.image,
            background: page.background
          }))
        }
      );

      console.log('📸 Imágenes subidas:', uploadedImages);

      // 3️⃣ Determinar la portada final
      const finalPortadaUrl = uploadedImages.portadaUrl || 
                              uploadedImages.cardBackgroundUrl || 
                              portadaUrl || 
                              cardBackgroundUrl;

      // 4️⃣ Preparar páginas con URLs permanentes
      setLoadingMessage('Guardando libro...');
      
      const pagesWithUrls = bookState.pages.map((page, idx) => {
        const uploadedPage = uploadedImages.pages[idx];
        
        // Determinar imagen final
        let finalImage = page.image;
        if (uploadedPage?.imageUrl) {
          finalImage = uploadedPage.imageUrl;
        } else if (page.image && BookImageService.isTempUrl(page.image)) {
          finalImage = null; // Descartar blob: URLs
        }

        // Determinar fondo final
        let finalBackground = page.background;
        if (uploadedPage?.backgroundUrl) {
          finalBackground = uploadedPage.backgroundUrl;
        } else if (page.background && 
                   typeof page.background === 'string' && 
                   BookImageService.isTempUrl(page.background)) {
          finalBackground = 'blanco'; // Fallback si era blob:
        }

        return {
          layout: page.layout || 'TextCenterLayout',
          title: page.title || '',
          text: page.text || '',
          image: finalImage || '',
          background: finalBackground || 'blanco',
        };
      });

      // 5️⃣ Preparar datos del libro
      const bookData = {
        titulo,
        descripcion,
        portada: finalPortadaUrl || undefined,
        autores,
        personajes,
        categorias: selectedCategorias.map(c => Number(c)),
        generos: selectedGeneros.map(g => Number(g)),
        etiquetas: selectedEtiquetas.map(e => Number(e)),
        valores: selectedValores.map(v => Number(v)),
        nivel: selectedNivel || 1,
        pages: pagesWithUrls
      };

      console.log('📦 Datos del libro:', {
        titulo: bookData.titulo,
        portada: bookData.portada,
        pagesCount: bookData.pages.length,
        firstPageImage: bookData.pages[0]?.image,
      });

      // 6️⃣ Guardar en base de datos
      let savedBookId: string;
      
      if (IdLibro) {
        await UpdateBookUseCase.execute(IdLibro, bookData);
        savedBookId = IdLibro;
      } else {
        savedBookId = await CreateBookUseCase.execute(currentUserId, bookData);
      }

      console.log('✅ Guardado exitoso, ID:', savedBookId);

      setLoadingStatus('success');
      setLoadingMessage('¡Libro guardado! Abriendo modo lectura...');
      
      toast.success('✅ Libro guardado correctamente');

      // Redirigir al modo lectura
      setTimeout(() => {
        window.location.href = `/${locale}/books/${savedBookId}/read`;
      }, 1500);

    } catch (error: any) {
      console.error('❌ Error al guardar:', error);
      
      setLoadingStatus('error');
      setLoadingMessage(error.message || 'Error al guardar el libro');
      
      toast.error(`❌ ${error.message}`);

      setTimeout(() => {
        setLoadingStatus('idle');
        setIsSaving(false);
      }, 3000);
    }
  }, [
    currentUserId,
    IdLibro,
    validateBook,
    titulo,
    descripcion,
    autores,
    personajes,
    portadaFile,
    portadaUrl,
    cardBackgroundFile,
    cardBackgroundUrl,
    selectedCategorias,
    selectedGeneros,
    selectedEtiquetas,
    selectedValores,
    selectedNivel,
    bookState.pages,
    locale
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

  // ✅ CORREGIDO: Guardar archivo además de URL
  const handlePortadaChange = useCallback((file: File | null) => {
    setPortadaFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPortadaUrl(url);
    } else {
      setPortadaUrl(null);
    }
  }, []);

  // ✅ CORREGIDO: Guardar archivo además de URL
  const handleCardBackgroundChange = useCallback((file: File | null) => {
    setCardBackgroundFile(file);
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

  // Loading states
  if (isCheckingAuth) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sesión requerida
          </h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para crear o editar libros
          </p>
          <button
            onClick={() => window.location.href = `/${locale}/login`}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden border border-slate-200 bg-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: { zIndex: 99999 },
          duration: 4000,
        }}
        containerStyle={{ top: 80, zIndex: 99999 }}
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
              cardBackgroundImage={cardBackgroundFile}
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
              portada={portadaFile}
              portadaUrl={portadaUrl}
              cardBackgroundImage={cardBackgroundFile}
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