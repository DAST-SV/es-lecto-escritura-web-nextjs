/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ REFACTORIZADO - Usa componentes modulares
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye } from 'lucide-react';
import NavBar from '@/src/components/nav/NavBar';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { PDFUploadZone } from '@/src/presentation/features/books/components/PDFUpload/PDFUploadZone';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';
import { supabaseAdmin } from '@/src/utils/supabase/admin';
import type { Page } from '@/src/core/domain/types';

export function CreateBookPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>(['']);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // Estados del preview
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [error, setError] = useState('');

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

  // Manejar selección de PDF
  const handlePDFSelect = async (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setExtractedPages([]);
      setShowPreview(false);
      setPdfDimensions(null);
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
      setTitulo(result.pdfTitle || '');
      
      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({
          width: result.pageWidth,
          height: result.pageHeight
        });
        console.log(`📐 Dimensiones: ${result.pageWidth}x${result.pageHeight}`);
      }
      
      console.log(`✅ ${result.pages.length} páginas extraídas`);
      setShowPreview(true);
      
    } catch (err: any) {
      console.error('❌ Error extrayendo páginas:', err);
      setPdfError('Error al procesar el PDF');
    } finally {
      setIsExtractingPages(false);
    }
  };

  // Cerrar preview
  const handleClosePreview = () => {
    setShowPreview(false);
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
      
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }
      
      router.push(`/es/books/${bookId}/read`);

    } catch (err: any) {
      console.error('❌ Error al crear libro:', err);
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
      setIsUploadingPDF(false);
    }
  };

  // MODO PREVIEW
  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <PDFPreviewMode
        pages={extractedPages}
        title={titulo}
        pdfDimensions={pdfDimensions}
        isLoading={isLoading}
        isSaveDisabled={!titulo.trim()}
        onClose={handleClosePreview}
        onSave={handleSave}
      />
    );
  }

  // MODO FORMULARIO
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

              {extractedPages.length > 0 && !showPreview && (
                <div className="bg-white rounded-lg border-2 border-green-300 p-6">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={20} />
                    Ver Preview del Libro ({extractedPages.length} páginas)
                  </button>
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