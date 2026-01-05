/**
 * UBICACIÓN: app/[locale]/books/import-pdf/page.tsx
 * ✅ CON PREVIEW: Muestra las páginas extraídas antes de guardar
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Upload, Loader2, CheckCircle, AlertCircle, BookOpen, 
  ArrowLeft, Save, X, Eye 
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import { PDFExtractorService } from '@/src/infrastructure/services/PDFExtractorService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import type { Page } from '@/src/core/domain/types';

type Status = 'idle' | 'extracting' | 'preview' | 'uploading' | 'saving' | 'success' | 'error';

export default function ImportPDFPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [userId, setUserId] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setErrorMessage('Por favor selecciona un archivo PDF válido');
      setStatus('error');
      return;
    }

    setStatus('extracting');
    setErrorMessage('');
    setProgress({ current: 0, total: 0 });

    try {
      // 1. Verificar autenticación
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para importar libros');
      }
      setUserId(user.id);

      // 2. Extraer páginas del PDF
      console.log('📄 Extrayendo páginas del PDF...');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      setPdfTitle(result.pdfTitle || 'PDF Importado');
      setProgress({ current: result.pages.length, total: result.pages.length });
      
      console.log(`✅ ${result.pages.length} páginas extraídas`);

      // 3. Mostrar preview ✅ NUEVO PASO
      setStatus('preview');

    } catch (error: any) {
      console.error('❌ Error procesando PDF:', error);
      setErrorMessage(error.message || 'Error al procesar el PDF');
      setStatus('error');
    }
  }, [supabase]);

  const handleSaveBook = useCallback(async () => {
    if (!extractedPages.length || !userId) return;

    try {
      setStatus('uploading');

      // 1. Generar ID temporal
      const tempBookId = `book_${Date.now()}`;

      // 2. Subir imágenes
      console.log('📤 Subiendo imágenes a storage...');
      const uploadResults = await BookImageService.uploadAllBookImages(
        userId,
        tempBookId,
        {
          pages: extractedPages.map(page => ({
            file: page.file,
            image: page.image,
            background: page.background as string | null,
          }))
        }
      );

      setStatus('saving');

      // 3. Preparar datos del libro
      const pagesWithUrls = extractedPages.map((page, idx) => ({
        layout: 'ImageFullLayout',
        title: '',
        text: '',
        image: uploadResults.pages[idx]?.imageUrl || '',
        background: 'blanco',
      }));

      const bookData = {
        titulo: pdfTitle,
        descripcion: `Libro importado desde PDF el ${new Date().toLocaleDateString(locale)} (${extractedPages.length} páginas)`,
        portada: uploadResults.pages[0]?.imageUrl || undefined,
        autores: ['Autor Desconocido'],
        personajes: [],
        categorias: [1],
        generos: [1],
        etiquetas: [],
        valores: [],
        nivel: 1,
        pages: pagesWithUrls,
      };

      // 4. Crear libro en la base de datos
      console.log('💾 Guardando libro en la base de datos...');
      const bookId = await CreateBookUseCase.execute(userId, bookData);

      console.log('✅ Libro guardado con ID:', bookId);
      setStatus('success');

      // 5. Limpiar URLs temporales
      PDFExtractorService.cleanupBlobUrls(extractedPages);

      // 6. Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/${locale}/books/${bookId}/read`);
      }, 2000);

    } catch (error: any) {
      console.error('❌ Error guardando libro:', error);
      setErrorMessage(error.message || 'Error al guardar el libro');
      setStatus('error');
      
      PDFExtractorService.cleanupBlobUrls(extractedPages);
    }
  }, [extractedPages, userId, pdfTitle, locale, router]);

  const handleCancelPreview = () => {
    PDFExtractorService.cleanupBlobUrls(extractedPages);
    setExtractedPages([]);
    setPdfTitle('');
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setExtractedPages([]);
    setPdfTitle('');
    setProgress({ current: 0, total: 0 });
    setUserId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push(`/${locale}/books`)}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a biblioteca
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Importar PDF como Libro
            </h1>
            <p className="text-gray-600 mt-2">
              Convierte cualquier PDF en un libro interactivo editable
            </p>
          </div>

          {/* ✅ MODO PREVIEW */}
          {status === 'preview' && (
            <div className="space-y-6">
              {/* Info header */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-indigo-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      Preview: {pdfTitle}
                    </h2>
                    <p className="text-gray-600">
                      {extractedPages.length} páginas extraídas • Revisa antes de guardar
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCancelPreview}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center gap-2"
                    >
                      <X size={20} />
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveBook}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 shadow-lg"
                    >
                      <Save size={20} />
                      Guardar Libro
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de páginas */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {extractedPages.map((page, idx) => (
                    <div
                      key={page.id}
                      className="group relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-indigo-400 hover:shadow-lg transition-all"
                    >
                      {/* Imagen de la página */}
                      <div className="aspect-[3/4] relative bg-gray-100">
                        <img
                          src={page.image || ''}
                          alt={`Página ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Overlay con número */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <span className="text-white font-semibold text-sm">
                              Página {idx + 1}
                            </span>
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Número de página */}
                      <div className="p-2 text-center">
                        <span className="text-xs font-medium text-gray-600">
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nota informativa */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">ℹ️ Nota:</span> Cada página se ha convertido en una imagen de alta calidad. Después de guardar, podrás editar el libro y cambiar el layout de las páginas si lo deseas.
                </p>
              </div>
            </div>
          )}

          {/* OTROS ESTADOS (idle, extracting, uploading, etc.) */}
          {status !== 'preview' && (
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden max-w-3xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  📚 Convertidor PDF → Libro
                </h2>
                <p className="text-indigo-100 text-sm mt-2">
                  Cada página del PDF se convertirá en una página editable del libro
                </p>
              </div>

              <div className="p-8">
                {status === 'idle' && (
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-3 border-dashed border-indigo-300 rounded-2xl bg-indigo-50 hover:bg-indigo-100 transition-all duration-200 p-16 group"
                    >
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-indigo-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Upload size={48} className="text-indigo-600" />
                        </div>
                        <p className="text-xl font-semibold text-gray-900 mb-2">
                          Selecciona un archivo PDF
                        </p>
                        <p className="text-sm text-gray-600">
                          Haz clic aquí o arrastra tu archivo PDF
                        </p>
                      </div>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {status === 'extracting' && (
                  <div className="text-center py-12">
                    <Loader2 size={56} className="animate-spin text-indigo-600 mx-auto mb-6" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Extrayendo páginas del PDF...
                    </p>
                    {progress.total > 0 && (
                      <div className="mt-6 max-w-xs mx-auto">
                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {progress.current} / {progress.total} páginas
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {status === 'uploading' && (
                  <div className="text-center py-12">
                    <Loader2 size={56} className="animate-spin text-indigo-600 mx-auto mb-6" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Subiendo imágenes al storage...
                    </p>
                    <p className="text-sm text-gray-600">
                      {extractedPages.length} páginas
                    </p>
                  </div>
                )}

                {status === 'saving' && (
                  <div className="text-center py-12">
                    <Loader2 size={56} className="animate-spin text-indigo-600 mx-auto mb-6" />
                    <p className="text-xl font-semibold text-gray-900 mb-2">
                      Guardando libro...
                    </p>
                  </div>
                )}

                {status === 'success' && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={56} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Libro creado exitosamente!
                    </p>
                    <p className="text-sm text-gray-600 mb-6">
                      {extractedPages.length} páginas importadas
                    </p>
                    <div className="inline-flex items-center gap-2 text-indigo-600">
                      <Loader2 size={18} className="animate-spin" />
                      <span className="text-sm">Redirigiendo...</span>
                    </div>
                  </div>
                )}

                {status === 'error' && (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={56} className="text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      Error al procesar
                    </p>
                    <p className="text-sm text-red-600 mb-8">
                      {errorMessage}
                    </p>
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Intentar de nuevo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </UnifiedLayout>
  );
}