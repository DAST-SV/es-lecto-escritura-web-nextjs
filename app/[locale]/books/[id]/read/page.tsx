/**
 * UBICACION: app/[locale]/books/[id]/read/page.tsx
 * Lector de libros - Con traducciones dinamicas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import dynamic from 'next/dynamic';
import { useReadingAnalytics } from '@/src/presentation/features/books/hooks/useReadingAnalytics';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import type { Page } from '@/src/core/domain/types';
import toast from 'react-hot-toast';

// Cargar PDFPreviewMode dinamicamente solo en cliente
const PDFPreviewMode = dynamic(
  () => import('@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode').then(mod => ({ default: mod.PDFPreviewMode })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white font-medium text-lg">Cargando visor...</p>
        </div>
      </div>
    )
  }
);

export default function ReadBookPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;
  const { t, loading: translationsLoading } = useSupabaseTranslations('book_reader');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Textos con fallback mientras cargan traducciones
  const loadingText = translationsLoading ? 'Cargando libro...' : t('loading');
  const loadingSubtitleText = translationsLoading ? 'Preparando paginas del PDF' : t('loading_subtitle');
  const loadingViewerText = translationsLoading ? 'Cargando visor...' : t('loading_viewer');
  const errorTitleText = translationsLoading ? 'No se puede leer el libro' : t('error_title');
  const errorBackText = translationsLoading ? 'Volver a biblioteca' : t('error_back');
  const errorNoPdfText = translationsLoading ? 'Este libro no tiene un archivo PDF asociado' : t('error_no_pdf');
  const errorNotFoundText = translationsLoading ? 'Libro no encontrado' : t('error_not_found');
  const errorInvalidIdText = translationsLoading ? 'ID de libro no valido' : t('error_invalid_id');
  const trackingText = translationsLoading ? 'Registrando lectura' : t('tracking');
  const completionTitleText = translationsLoading ? 'Felicitaciones!' : t('completion.title');
  const completionMessageText = translationsLoading ? 'Has completado' : t('completion.message');
  const completionStatsText = translationsLoading ? 'Ver estadisticas' : t('completion.stats');
  const completionContinueText = translationsLoading ? 'Continuar leyendo' : t('completion.continue');
  const noTitleText = translationsLoading ? 'Libro sin titulo' : t('no_title');

  // Analytics hook
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
      setShowCompletionModal(true);
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadBook() {
      // Solo ejecutar en cliente
      if (typeof window === 'undefined') return;

      if (!bookId) {
        if (isMounted) {
          setError(errorInvalidIdText);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user && isMounted) {
          setUserId(user.id);
        }

        console.log('Cargando libro:', bookId);

        const { data: libro, error: bookError } = await supabase
          .from('books')
          .select('id, title, pdf_url')
          .eq('id', bookId)
          .is('deleted_at', null)
          .single();

        if (bookError || !libro) {
          console.error('Error cargando libro:', bookError);
          if (isMounted) {
            setError(errorNotFoundText);
            setIsLoading(false);
          }
          return;
        }

        if (!libro.pdf_url) {
          if (isMounted) {
            setError(errorNoPdfText);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setBookTitle(libro.title || noTitleText);
        }

        console.log('Descargando PDF:', libro.pdf_url);

        const response = await fetch(libro.pdf_url);
        const blob = await response.blob();
        const file = new File([blob], 'libro.pdf', { type: 'application/pdf' });

        // Importar dinamicamente el servicio
        const { PDFExtractorService } = await import('@/src/infrastructure/services/books');

        console.log('Extrayendo paginas del PDF...');
        const result = await PDFExtractorService.extractPagesFromPDF(file);

        if (isMounted) {
          setExtractedPages(result.pages);

          if (result.pageWidth && result.pageHeight) {
            setPdfDimensions({
              width: result.pageWidth,
              height: result.pageHeight
            });
          }

          console.log(`${result.pages.length} paginas extraidas correctamente`);
          setIsLoading(false);
        }

      } catch (err: any) {
        console.error('Error cargando libro:', err);
        if (isMounted) {
          setError(err.message || 'Error al cargar el libro');
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      isMounted = false;
      if (extractedPages.length > 0) {
        // Cleanup dinamico
        import('@/src/infrastructure/services/books').then(({ PDFExtractorService }) => {
          PDFExtractorService.cleanupBlobUrls(extractedPages);
        });
      }
    };
  }, [bookId, errorInvalidIdText, errorNotFoundText, errorNoPdfText, noTitleText]);

  const handleClose = async () => {
    await handleEndSession();

    if (extractedPages.length > 0) {
      const { PDFExtractorService } = await import('@/src/infrastructure/services/books');
      PDFExtractorService.cleanupBlobUrls(extractedPages);
    }
    router.push(`/${locale}/books`);
  };

  const handlePageFlip = (pageNumber: number) => {
    trackPageChange(pageNumber + 1);
  };

  const handleViewStatistics = () => {
    setShowCompletionModal(false);
    goToStatistics();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-white font-medium text-lg">{loadingText}</p>
          <p className="text-white/60 text-sm mt-2">{loadingSubtitleText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {errorTitleText}
          </h2>

          <p className="text-gray-600 mb-6">{error}</p>

          <button
            onClick={handleClose}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors w-full"
          >
            {errorBackText}
          </button>
        </div>
      </div>
    );
  }

  if (extractedPages.length > 0 && pdfDimensions) {
    return (
      <>
        {isTracking && (
          <div className="fixed top-4 right-4 z-[10001] bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {trackingText}
          </div>
        )}

        <PDFPreviewMode
          pages={extractedPages}
          title={bookTitle}
          pdfDimensions={pdfDimensions}
          onClose={handleClose}
          onPageFlip={handlePageFlip}
        />

        {showCompletionModal && (
          <div className="fixed inset-0 z-[10002] bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 size={40} className="text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {completionTitleText} 🎉
              </h2>

              <p className="text-gray-600 mb-6">
                {completionMessageText} <strong>"{bookTitle}"</strong>
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleViewStatistics}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BarChart3 size={20} />
                  {completionStatsText}
                </button>

                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  {completionContinueText}
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
