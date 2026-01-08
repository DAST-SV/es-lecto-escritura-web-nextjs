/**
 * UBICACIÓN: app/[locale]/books/[id]/read/page.tsx
 * ✅ VERSIÓN CON ANALYTICS INTEGRADO
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { PDFExtractorService } from '@/src/infrastructure/services/PDFExtractorService';
import { useReadingAnalytics } from '@/src/presentation/features/books/hooks/useReadingAnalytics';
import type { Page } from '@/src/core/domain/types';
import toast from 'react-hot-toast';

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // ✅ ANALYTICS HOOK
  const {
    sessionId,
    isTracking,
    trackPageChange,
    handleEndSession,
    goToStatistics,
  } = useReadingAnalytics({
    bookId,
    totalPages: extractedPages.length,
    userId: userId || undefined,
    onComplete: () => {
      // Mostrar modal de felicitación
      setShowCompletionModal(true);
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBook() {
      if (!bookId) {
        if (isMounted) {
          setError('ID de libro no válido');
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && isMounted) {
          setUserId(user.id);
        }

        console.log('📖 Cargando libro:', bookId);

        // Cargar datos del libro
        const { data: libro, error: bookError } = await supabase
          .from('books')
          .select('id, title, pdf_url')
          .eq('id', bookId)
          .is('deleted_at', null)
          .single();

        if (bookError || !libro) {
          console.error('❌ Error cargando libro:', bookError);
          if (isMounted) {
            setError('Libro no encontrado');
            setIsLoading(false);
          }
          return;
        }

        if (!libro.pdf_url) {
          if (isMounted) {
            setError('Este libro no tiene un archivo PDF asociado');
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setBookTitle(libro.title || 'Libro sin título');
        }

        console.log('📄 Descargando PDF:', libro.pdf_url);
        
        // Descargar PDF
        const response = await fetch(libro.pdf_url);
        const blob = await response.blob();
        const file = new File([blob], 'libro.pdf', { type: 'application/pdf' });

        console.log('🔄 Extrayendo páginas del PDF...');
        const result = await PDFExtractorService.extractPagesFromPDF(file);
        
        if (isMounted) {
          setExtractedPages(result.pages);
          
          if (result.pageWidth && result.pageHeight) {
            setPdfDimensions({ 
              width: result.pageWidth, 
              height: result.pageHeight 
            });
          }

          console.log(`✅ ${result.pages.length} páginas extraídas correctamente`);
          setIsLoading(false);
        }

      } catch (err: any) {
        console.error('❌ Error cargando libro:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar el libro');
          setIsLoading(false);
        }
      }
    }

    loadBook();

    // Cleanup
    return () => {
      isMounted = false;
      if (extractedPages.length > 0) {
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }
    };
  }, [bookId]);

  const handleClose = async () => {
    // ✅ Finalizar sesión antes de cerrar
    await handleEndSession();
    
    // Limpiar URLs de blobs antes de cerrar
    if (extractedPages.length > 0) {
      PDFExtractorService.cleanupBlobUrls(extractedPages);
    }
    router.push(`/${locale}/books`);
  };

  // ✅ Manejar cambio de página con tracking
  const handlePageFlip = (pageNumber: number) => {
    trackPageChange(pageNumber + 1); // +1 porque el índice empieza en 0
  };

  const handleViewStatistics = () => {
    setShowCompletionModal(false);
    goToStatistics();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white font-medium text-lg">Cargando libro...</p>
          <p className="text-white/60 text-sm mt-2">Preparando páginas del PDF</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No se puede leer el libro
          </h2>
          
          <p className="text-gray-600 mb-6">{error}</p>
          
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors w-full"
          >
            Volver a biblioteca
          </button>
        </div>
      </div>
    );
  }

  // Renderizar PDFPreviewMode
  if (extractedPages.length > 0 && pdfDimensions) {
    return (
      <>
        {/* ✅ Indicador de tracking activo */}
        {isTracking && (
          <div className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Registrando lectura
          </div>
        )}

        <PDFPreviewMode 
          pages={extractedPages}
          title={bookTitle}
          pdfDimensions={pdfDimensions}
          onClose={handleClose}
          onPageFlip={handlePageFlip} // ✅ Callback para tracking
        />

        {/* ✅ Modal de completación */}
        {showCompletionModal && (
          <div className="fixed inset-0 z-[10002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={40} className="text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Felicitaciones! 🎉
              </h2>
              
              <p className="text-gray-600 mb-6">
                Has completado <strong>"{bookTitle}"</strong>
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleViewStatistics}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart3 size={20} />
                  Ver estadísticas
                </button>
                
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Continuar leyendo
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}