/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ MODIFICADO: Sistema SOLO PDF (sin editor de páginas)
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/src/components/nav/NavBar';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { PDFUploadZone } from '@/src/presentation/features/books/components/PDFUpload/PDFUploadZone';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';
import { supabaseAdmin } from '@/src/utils/supabase/admin';

export function CreateBookPage() {
  const router = useRouter();
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>(['']);
  const [portada, setPortada] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
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

  // Guardar libro
  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Validaciones
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

      // Obtener usuario
      const { data: { user } } = await supabaseAdmin.auth.getUser();
      if (!user) {
        setError('Usuario no autenticado');
        setIsLoading(false);
        return;
      }

      const bookId = crypto.randomUUID();

      // Subir PDF
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

      // Crear libro en BD
      await BookRepository.create(user.id, {
        titulo,
        descripcion,
        portada: undefined, // Implementar subida de portada si necesitas
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
      
      // Redirigir a lectura
      router.push(`/books/${bookId}/read`);

    } catch (err: any) {
      console.error('❌ Error al crear libro:', err);
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
      setIsUploadingPDF(false);
    }
  };

  return (
    <>
      {/* Navbar */}
      <NavBar />
      
      {/* Contenedor principal */}
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
              
              {/* Subida de PDF */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4">📄 Archivo PDF del Libro</h2>
                <PDFUploadZone
                  onFileSelect={(file) => {
                    setPdfFile(file);
                    setPdfError('');
                  }}
                  currentFile={pdfFile}
                  error={pdfError}
                />
              </div>

            </div>

            {/* COLUMNA DERECHA: Metadatos */}
            <div className="space-y-6">
              
              {/* Título */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <label className="block text-sm font-semibold mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: El principito"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Descripción */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <label className="block text-sm font-semibold mb-2">
                  Descripción *
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe de qué trata el libro..."
                  rows={4}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Autores */}
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

              {/* Personajes */}
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

              {/* Botón Guardar */}
              <button
                onClick={handleSave}
                disabled={isLoading || !pdfFile || !titulo.trim()}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  isLoading || !pdfFile || !titulo.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isLoading
                  ? isUploadingPDF
                    ? '📤 Subiendo PDF...'
                    : '💾 Guardando...'
                  : '💾 Guardar y Ver Libro'}
              </button>

              {!pdfFile && (
                <p className="text-sm text-orange-600 text-center">
                  ⚠️ Debes subir un archivo PDF para continuar
                </p>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Export default
export default CreateBookPage;