/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ CON FLIPBOOK PREVIEW ANTES DE GUARDAR
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import HTMLFlipBook from 'react-pageflip';
import { 
  X, ChevronLeft, ChevronRight, Save, ArrowLeft, Loader2 
} from 'lucide-react';
import NavBar from '@/src/components/nav/NavBar';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { PDFUploadZone } from '@/src/presentation/features/books/components/PDFUpload/PDFUploadZone';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';
import { supabaseAdmin } from '@/src/utils/supabase/admin';
import type { Page } from '@/src/core/domain/types';
import '@/src/presentation/features/layouts/styles/book-shared.css';

export function CreateBookPage() {
  const router = useRouter();
  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>(['']);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Estados del preview
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // ✅ Estado para mostrar flipbook
  
  // Estados del flipbook
  const [currentPage, setCurrentPage] = useState(0);
  const [bookDimensions, setBookDimensions] = useState({ width: 400, height: 520 });
  const [isClient, setIsClient] = useState(false);
  const [activePage, setActivePage] = useState(0);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calcular dimensiones del flipbook
  useEffect(() => {
    if (!isClient || !showPreview) return;

    const calculateDimensions = () => {
      if (!containerRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const containerWidth = containerRef.current.clientWidth;

      if (containerHeight <= 0 || containerWidth <= 0) return;

      const reservedHeight = 160;
      const availableHeight = containerHeight - reservedHeight;
      const availableWidth = containerWidth - 100;
      const aspectRatio = 5 / 6;

      let bookWidth = 400;
      let bookHeight = 520;

      if (availableHeight > 0 && availableWidth > 0) {
        bookHeight = Math.min(availableHeight, 700);
        bookWidth = bookHeight * aspectRatio;

        if (bookWidth > availableWidth) {
          bookWidth = availableWidth;
          bookHeight = bookWidth / aspectRatio;
        }
      }

      setBookDimensions({
        width: Math.max(Math.round(bookWidth), 300),
        height: Math.max(Math.round(bookHeight), 390)
      });
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current) {
      resizeObserver = new ResizeObserver(calculateDimensions);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [isClient, showPreview]);

  // Manejadores de autores
  const addAutor = () => setAutores([...autores, '']);
  const removeAutor = (index: number) => {
    if (autores.length > 1) {
      setAutores(autores.filter((_, i) => i !== index));
    }
  };
  const updateAutor = (index: number, value: string) => {
    const newAutores = [...autores];
    newAutores[index] = value;
    setAutores(newAutores);
  };

  // Manejadores de personajes
  const addPersonaje = () => setPersonajes([...personajes, '']);
  const removePersonaje = (index: number) => {
    setPersonajes(personajes.filter((_, i) => i !== index));
  };
  const updatePersonaje = (index: number, value: string) => {
    const newPersonajes = [...personajes];
    newPersonajes[index] = value;
    setPersonajes(newPersonajes);
  };

  // ✅ Manejar selección de PDF y extraer páginas
  const handlePDFSelect = async (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setExtractedPages([]);
      setShowPreview(false);
      return;
    }
    
    setPdfFile(file);
    setPdfError('');
    setExtractedPages([]);
    setIsExtractingPages(true);
    setShowPreview(false);

    try {
      console.log('📄 Extrayendo páginas del PDF...');
      
      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      setTitulo(result.pdfTitle || ''); // Auto-llenar título
      console.log(`✅ ${result.pages.length} páginas extraídas`);
      
      // ✅ Mostrar preview automáticamente
      setShowPreview(true);
      
    } catch (err: any) {
      console.error('❌ Error extrayendo páginas:', err);
      setPdfError('Error al procesar el PDF');
    } finally {
      setIsExtractingPages(false);
    }
  };

  // ✅ Cerrar preview
  const handleClosePreview = async () => {
    setShowPreview(false);
    setCurrentPage(0);
    setActivePage(0);
    
    // Limpiar URLs temporales
    const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
    PDFExtractorService.cleanupBlobUrls(extractedPages);
    setExtractedPages([]);
    setPdfFile(null);
  };

  // Guardar libro
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!titulo.trim()) {
        setError('El título es obligatorio');
        setIsLoading(false);
        return;
      }

      if (!pdfFile) {
        setPdfError('Debes subir un archivo PDF');
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      const bookId = crypto.randomUUID();

      setIsUploadingPDF(true);
      const { url: pdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(
        pdfFile,
        user.id,
        bookId
      );

      if (pdfUploadError || !pdfUrl) {
        setPdfError(pdfUploadError || 'Error al subir PDF');
        setIsUploadingPDF(false);
        setIsLoading(false);
        return;
      }

      setIsUploadingPDF(false);

      await BookRepository.create(user.id, {
        titulo,
        descripcion,
        portada: undefined,
        pdfUrl,
        autores: autores.filter(a => a.trim()),
        personajes: personajes.filter(p => p.trim()),
        categorias: [],
        generos: [],
        etiquetas: [],
        valores: [],
        nivel: 0,
      });

      console.log('✅ Libro creado exitosamente');
      
      // Limpiar URLs temporales
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }
      
      router.push(`/books/${bookId}/read`);

    } catch (err: any) {
      console.error('❌ Error al crear libro:', err);
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
      setIsUploadingPDF(false);
    }
  };

  // Controles del flipbook
  const goToNextPage = () => {
    if (currentPage < extractedPages.length - 1) {
      bookRef.current?.pageFlip().flipNext();
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      bookRef.current?.pageFlip().flipPrev();
    }
  };

  // Navegación con teclado
  useEffect(() => {
    if (!showPreview) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNextPage();
      if (e.key === 'ArrowLeft') goToPrevPage();
      if (e.key === 'Escape') handleClosePreview();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showPreview, currentPage, extractedPages.length]);

  // Memoizar páginas
  const memoizedPages = useMemo(() => {
    return extractedPages.map((page, idx) => ({
      ...page,
      key: `page-${page.id}-${idx}`,
    }));
  }, [extractedPages]);

  // Configuración del flipbook
  const flipBookProps = useMemo(() => {
    if (!isClient || !showPreview) return null;

    return {
      width: bookDimensions.width,
      height: bookDimensions.height,
      maxShadowOpacity: 0.5,
      drawShadow: true,
      showCover: true,
      flippingTime: 700,
      size: "fixed" as const,
      className: "book-flipbook-container",
      onFlip: (e: any) => {
        setCurrentPage(e.data);
        setActivePage(e.data);
      },
      style: {},
      startPage: 0,
      minWidth: bookDimensions.width,
      maxWidth: bookDimensions.width,
      minHeight: bookDimensions.height,
      maxHeight: bookDimensions.height,
      usePortrait: false,
      startZIndex: 0,
      autoSize: false,
      mobileScrollSupport: false,
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 10,
      showPageCorners: true,
      disableFlipByClick: false,
      children: memoizedPages.map((page, idx) => {
        const isActive = idx === activePage;
        
        return (
          <div className="page w-full h-full" key={page.key}>
            <div className="page-inner w-full h-full bg-white">
              {page.image && (
                <img
                  src={page.image}
                  alt={`Página ${idx + 1}`}
                  className="w-full h-full object-contain"
                  style={{
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          </div>
        );
      }),
    };
  }, [isClient, showPreview, bookDimensions, memoizedPages, activePage]);

  // ========== RENDER ==========

  // ✅ MODO PREVIEW FLIPBOOK (pantalla completa)
  if (showPreview && extractedPages.length > 0 && isClient) {
    return (
      <div 
        ref={containerRef}
        className="w-full h-screen relative bg-gradient-to-br from-slate-900 to-slate-800"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/60 to-transparent px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-lg">
                Preview: {titulo || 'Sin título'}
              </h1>
              <p className="text-white/70 text-sm">
                {extractedPages.length} páginas
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClosePreview}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Volver al formulario
              </button>

              <button
                onClick={handleSave}
                disabled={isLoading || !titulo.trim()}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar Libro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Flipbook centrado */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 9998 }}>
          <div 
            className="relative"
            style={{
              width: `${bookDimensions.width}px`,
              height: `${bookDimensions.height}px`,
            }}
          >
            <div className="drop-shadow-2xl">
              {flipBookProps && (
                <HTMLFlipBook {...flipBookProps} ref={bookRef} />
              )}
            </div>
          </div>
        </div>

        {/* Footer con controles */}
        <div className="absolute bottom-0 left-0 right-0 z-[10000] bg-gradient-to-t from-black/60 to-transparent px-6 py-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium">
              {currentPage + 1} / {extractedPages.length}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === extractedPages.length - 1}
              className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full transition-all disabled:opacity-30"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <p className="text-center text-white/60 text-xs mt-3">
            Usa las flechas ← → para navegar | ESC para volver
          </p>
        </div>
      </div>
    );
  }

  // ✅ MODO FORMULARIO (normal)
  return (
    <>
      <NavBar />
      
      <div 
        className="fixed inset-0 bg-gray-50"
        style={{ 
          paddingTop: '60px',
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div className="container mx-auto p-6 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">Crear Nuevo Libro (PDF)</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-700 font-medium">❌ {error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: PDF */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">📄 Archivo PDF del Libro</h2>
                <PDFUploadZone
                  onFileSelect={handlePDFSelect}
                  currentFile={pdfFile}
                  error={pdfError}
                />
              </div>

              {isExtractingPages && (
                <div className="bg-white rounded-lg border-2 border-blue-300 p-6">
                  <div className="text-center">
                    <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">Extrayendo páginas del PDF...</p>
                    <p className="text-xs text-gray-500 mt-2">Esto puede tardar unos segundos</p>
                  </div>
                </div>
              )}

            </div>

            {/* COLUMNA DERECHA: Metadatos */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <label className="block text-sm font-semibold mb-2">Título *</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: El principito"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <label className="block text-sm font-semibold mb-2">Descripción *</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe de qué trata el libro..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold">Autores *</label>
                  <button
                    onClick={addAutor}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {autores.map((autor, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={autor}
                        onChange={(e) => updateAutor(index, e.target.value)}
                        placeholder={`Autor ${index + 1}`}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      {autores.length > 1 && (
                        <button
                          onClick={() => removeAutor(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold">Personajes</label>
                  <button
                    onClick={addPersonaje}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {personajes.map((personaje, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={personaje}
                        onChange={(e) => updatePersonaje(index, e.target.value)}
                        placeholder={`Personaje ${index + 1}`}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => removePersonaje(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateBookPage;