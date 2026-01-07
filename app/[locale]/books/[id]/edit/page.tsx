/**
 * UBICACIÓN: app/[locale]/books/[id]/edit/page.tsx
 * ✅ PÁGINA DE EDICIÓN PROFESIONAL - COMPLETAMENTE SEPARADA
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, Eye, Save, Upload, BookOpen, Tag, Star } from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { BookReader } from '@/src/presentation/features/books/components/BookReader/BookReader';
import { UpdateBookUseCase } from '@/src/core/application/use-cases/books/UpdateBook.usecase';
import { GetBookUseCase } from '@/src/core/application/use-cases/books/GetBook.usecase';
import { OptimizedSelector } from '@/src/presentation/features/books/components/Selectors/OptimizedSelector';
import { AutoresInput } from '@/src/presentation/features/books/components/Inputs/AutoresInput';
import { PersonajesInput } from '@/src/presentation/features/books/components/Inputs/PersonajesInput';
import type { Page } from '@/src/core/domain/types';
import toast, { Toaster } from 'react-hot-toast';

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const bookId = params?.id as string;

  // Estados básicos
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Datos del libro
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>([]);

  // Portada
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string>('');
  const [portadaOriginalUrl, setPortadaOriginalUrl] = useState<string>('');

  // PDF Preview
  const [showPreview, setShowPreview] = useState(false);
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);

  // Clasificación
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<number[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [selectedValores, setSelectedValores] = useState<number[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);

  // Cargar usuario
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUserId(user.id);
    }
    checkUser();
  }, [supabase, router, locale]);

  // Cargar libro
  useEffect(() => {
    async function loadBook() {
      if (!bookId || !userId) return;

      setIsLoading(true);
      try {
        const libro = await GetBookUseCase.execute(bookId);

        if (!libro) {
          toast.error('Libro no encontrado');
          router.push(`/${locale}/books`);
          return;
        }

        if (libro.user_id !== userId) {
          toast.error('No tienes permiso para editar este libro');
          router.push(`/${locale}/books`);
          return;
        }

        // Datos básicos
        setTitulo(libro.titulo || '');
        setDescripcion(libro.descripcion || '');
        setAutores(libro.autores && libro.autores.length > 0 ? libro.autores : ['']);
        setPersonajes(libro.personajes || []);
        setSelectedNivel(libro.nivel || null);

        // Portada
        if (libro.portada) {
          setPortadaPreview(libro.portada);
          setPortadaOriginalUrl(libro.portada);
        }

        // Cargar PDF para preview
        if (libro.pdfUrl) {
          const response = await fetch(libro.pdfUrl);
          const blob = await response.blob();
          const file = new File([blob], 'libro.pdf', { type: 'application/pdf' });

          const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
          const result = await PDFExtractorService.extractPagesFromPDF(file);
          setExtractedPages(result.pages);
          if (result.pageWidth && result.pageHeight) {
            setPdfDimensions({ width: result.pageWidth, height: result.pageHeight });
          }
        }

        // Cargar relaciones
        const { data: bookCats } = await supabase
          .from('book_book_categories')
          .select('category_id')
          .eq('book_id', bookId);
        if (bookCats) setSelectedCategorias(bookCats.map(bc => bc.category_id));

        const { data: bookGens } = await supabase
          .from('book_book_genres')
          .select('genre_id')
          .eq('book_id', bookId);
        if (bookGens) setSelectedGeneros(bookGens.map(bg => bg.genre_id));

        const { data: bookTags } = await supabase
          .from('book_book_tags')
          .select('tag_id')
          .eq('book_id', bookId);
        if (bookTags) setSelectedEtiquetas(bookTags.map(bt => bt.tag_id));

        const { data: bookVals } = await supabase
          .from('book_book_values')
          .select('value_id')
          .eq('book_id', bookId);
        if (bookVals) setSelectedValores(bookVals.map(bv => bv.value_id));

        toast.success('Libro cargado');
      } catch (err: any) {
        console.error('Error cargando libro:', err);
        toast.error(err.message || 'Error al cargar el libro');
        router.push(`/${locale}/books`);
      } finally {
        setIsLoading(false);
      }
    }

    loadBook();
  }, [bookId, userId, supabase, router, locale]);

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortadaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPortadaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSelection = (
    id: number,
    arr: number[],
    setArr: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (arr.includes(id)) {
      setArr(arr.filter(x => x !== id));
    } else {
      setArr([...arr, id]);
    }
  };

  const isFormValid = () => {
    return (
      titulo.trim() !== '' &&
      descripcion.trim() !== '' &&
      autores.some(a => a.trim()) &&
      selectedCategorias.length > 0 &&
      selectedGeneros.length > 0 &&
      selectedNivel !== null
    );
  };

  const handleSave = async () => {
    if (!userId || !isFormValid()) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSaving(true);
    try {
      // Subir nueva portada si cambió
      let portadaUrl = portadaOriginalUrl;
      if (portadaFile && !portadaPreview.startsWith('http')) {
        const result = await BookImageService.uploadImage(
          portadaFile,
          userId,
          bookId,
          'portada'
        );
        if (result.success && result.url) {
          portadaUrl = result.url;
        }
      }

      // Actualizar libro
      await UpdateBookUseCase.execute(bookId, {
        titulo,
        descripcion,
        portada: portadaUrl,
        autores: autores.filter(a => a.trim()),
        personajes: personajes.filter(p => p.trim()),
        categorias: selectedCategorias,
        generos: selectedGeneros,
        etiquetas: selectedEtiquetas,
        valores: selectedValores,
        nivel: selectedNivel || 1,
      });

      toast.success('Libro actualizado exitosamente');
      router.push(`/${locale}/books`);
    } catch (err: any) {
      console.error('Error actualizando libro:', err);
      toast.error(err.message || 'Error al actualizar el libro');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <UnifiedLayout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando libro...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <BookReader
        pages={extractedPages}
        title={titulo || 'Vista previa'}
        pdfDimensions={pdfDimensions}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  return (
    <UnifiedLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Editar Libro</h1>
              <p className="text-xs text-gray-500">Modifica la información del libro</p>
            </div>
            <button
              onClick={handleSave}
              disabled={!isFormValid() || isSaving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Actualizar Libro
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERRORES */}
        {error && (
          <div className="max-w-[1800px] mx-auto px-4 pt-4">
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* CONTENIDO */}
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMNA IZQUIERDA - Formulario */}
            <div className="space-y-6">
              {/* Portada y PDF */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload size={16} />
                  Archivos
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Portada */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-2">
                      Portada
                    </label>
                    {portadaPreview ? (
                      <div className="relative group">
                        <img
                          src={portadaPreview}
                          alt="Portada"
                          className="w-full h-40 object-cover rounded-lg border border-gray-200"
                        />
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-medium">Cambiar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePortadaChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                          <Upload size={24} className="text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 font-medium">Subir imagen</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePortadaChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Preview PDF */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-2">
                      PDF (Solo lectura)
                    </label>
                    {extractedPages.length > 0 && (
                      <button
                        onClick={() => setShowPreview(true)}
                        className="w-full h-40 bg-green-50 border-2 border-green-200 rounded-lg flex flex-col items-center justify-center hover:bg-green-100 transition-all"
                      >
                        <Eye size={24} className="text-green-600 mb-2" />
                        <span className="text-xs text-green-700 font-medium">
                          Ver PDF ({extractedPages.length} páginas)
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información Básica */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen size={16} />
                  Información Básica
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Título del libro"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Escribe una breve sinopsis del libro..."
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none resize-none"
                    />
                  </div>

                  <AutoresInput autores={autores} onChange={setAutores} />
                </div>
              </div>

              {/* Personajes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <PersonajesInput personajes={personajes} onChange={setPersonajes} />
              </div>
            </div>

            {/* COLUMNA DERECHA - Clasificación */}
            <div className="space-y-6">
              {/* Nivel */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Star size={16} />
                  Nivel de Lectura <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((nivel) => (
                    <button
                      key={nivel}
                      onClick={() => setSelectedNivel(nivel)}
                      className={`px-4 py-2 text-sm rounded-lg border-2 transition-all ${
                        selectedNivel === nivel
                          ? 'border-amber-400 bg-amber-50 text-amber-900 font-medium'
                          : 'border-gray-200 hover:border-amber-300 text-gray-700'
                      }`}
                    >
                      Nivel {nivel}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clasificación */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={16} />
                  Clasificación
                </h3>

                <div className="space-y-4">
                  <OptimizedSelector
                    table="book_categories"
                    selectedIds={selectedCategorias}
                    onToggle={(id) => toggleSelection(id, selectedCategorias, setSelectedCategorias)}
                    label="Categorías"
                    color="sky"
                    maxSelections={5}
                    required
                  />

                  <OptimizedSelector
                    table="book_genres"
                    selectedIds={selectedGeneros}
                    onToggle={(id) => toggleSelection(id, selectedGeneros, setSelectedGeneros)}
                    label="Géneros"
                    color="rose"
                    maxSelections={3}
                    required
                  />

                  <OptimizedSelector
                    table="book_tags"
                    selectedIds={selectedEtiquetas}
                    onToggle={(id) => toggleSelection(id, selectedEtiquetas, setSelectedEtiquetas)}
                    label="Etiquetas"
                    color="orange"
                    maxSelections={10}
                  />

                  <OptimizedSelector
                    table="book_values"
                    selectedIds={selectedValores}
                    onToggle={(id) => toggleSelection(id, selectedValores, setSelectedValores)}
                    label="Valores educativos"
                    color="emerald"
                    maxSelections={5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}