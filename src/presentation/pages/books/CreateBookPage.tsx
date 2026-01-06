/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ COMPLETO: Formulario con todos los metadatos + Preview de FlipBook
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Loader2, Eye, X, Plus, BookOpen, Users, Tag, 
  Heart, Star, FileText, Image, Save, Upload, AlertCircle 
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import type { Page } from '@/src/core/domain/types';

export function CreateBookPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  
  // Estados básicos del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>([]);
  
  // Estados de metadatos avanzados
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<number[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [selectedValores, setSelectedValores] = useState<number[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  
  // Estados de archivos
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  
  // Estados del preview PDF
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basico');
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Catálogos cargados desde Supabase
  const [categorias, setCategorias] = useState<Array<{ id: number; name: string }>>([]);
  const [generos, setGeneros] = useState<Array<{ id: number; name: string }>>([]);
  const [etiquetas, setEtiquetas] = useState<Array<{ id: number; name: string }>>([]);
  const [valores, setValores] = useState<Array<{ id: number; name: string }>>([]);
  const [niveles, setNiveles] = useState<Array<{ id: number; name: string }>>([]);

  // Cargar usuario y catálogos al montar
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
        setUserId(user.id);

        // Cargar catálogos en paralelo
        const [
          { data: cats },
          { data: gens },
          { data: tags },
          { data: vals },
          { data: levs }
        ] = await Promise.all([
          supabase.from('book_categories').select('id, name').order('name'),
          supabase.from('book_genres').select('id, name').order('name'),
          supabase.from('book_tags').select('id, name').order('name'),
          supabase.from('book_values').select('id, name').order('name'),
          supabase.from('book_levels').select('id, name').order('id')
        ]);

        setCategorias(cats || []);
        setGeneros(gens || []);
        setEtiquetas(tags || []);
        setValores(vals || []);
        setNiveles(levs || []);

      } catch (err: any) {
        console.error('Error cargando datos iniciales:', err);
        setError('Error al cargar catálogos');
      }
    }

    loadInitialData();
  }, [supabase, router, locale]);

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

  // Toggle de selección múltiple
  const toggleSelection = (
    itemId: number, 
    selectedArray: number[], 
    setSelectedArray: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    if (selectedArray.includes(itemId)) {
      setSelectedArray(selectedArray.filter(id => id !== itemId));
    } else {
      setSelectedArray([...selectedArray, itemId]);
    }
  };

  // Manejador de portada
  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortadaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortadaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejador de PDF con extracción de páginas
  const handlePDFChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Solo se permiten archivos PDF');
      return;
    }

    setPdfFile(file);
    setPdfError('');
    setExtractedPages([]);
    setIsExtractingPages(true);

    try {
      console.log('📄 Extrayendo páginas del PDF...');
      
      // Si el título está vacío, usar el nombre del archivo
      if (!titulo.trim()) {
        setTitulo(file.name.replace('.pdf', ''));
      }

      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      
      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({
          width: result.pageWidth,
          height: result.pageHeight
        });
        console.log(`📐 Dimensiones: ${result.pageWidth}x${result.pageHeight}`);
      }
      
      console.log(`✅ ${result.pages.length} páginas extraídas`);
      
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

  // Validación del formulario
  const isFormValid = (): boolean => {
    return (
      titulo.trim() !== '' &&
      descripcion.trim() !== '' &&
      autores.some(a => a.trim() !== '') &&
      pdfFile !== null &&
      selectedCategorias.length > 0 &&
      selectedGeneros.length > 0 &&
      selectedNivel !== null
    );
  };

  // Guardar libro completo
  const handleSave = async () => {
    try {
      if (!userId) {
        setError('Usuario no autenticado');
        return;
      }

      if (!isFormValid()) {
        setError('Por favor completa todos los campos obligatorios');
        return;
      }

      setIsLoading(true);
      setError('');

      const bookId = crypto.randomUUID();

      // 1. Subir portada si existe
      let portadaUrl: string | undefined;
      if (portadaFile) {
        console.log('📤 Subiendo portada...');
        const result = await BookImageService.uploadImage(
          portadaFile,
          userId,
          bookId,
          'portada'
        );
        if (result.success && result.url) {
          portadaUrl = result.url;
          console.log('✅ Portada subida');
        }
      }

      // 2. Subir PDF
      console.log('📤 Subiendo PDF...');
      const { url: pdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(
        pdfFile!,
        userId,
        bookId
      );

      if (pdfUploadError || !pdfUrl) {
        throw new Error(pdfUploadError || 'Error al subir PDF');
      }
      console.log('✅ PDF subido');

      // 3. Crear libro en la base de datos
      console.log('💾 Creando libro en la base de datos...');
      await CreateBookUseCase.execute(userId, {
        titulo,
        descripcion,
        portada: portadaUrl,
        pdfUrl,
        autores: autores.filter(a => a.trim() !== ''),
        personajes: personajes.filter(p => p.trim() !== ''),
        categorias: selectedCategorias,
        generos: selectedGeneros,
        etiquetas: selectedEtiquetas,
        valores: selectedValores,
        nivel: selectedNivel || 1,
      });

      console.log('✅ Libro creado exitosamente');

      // 4. Limpiar URLs temporales de blobs
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }

      // 5. Redirigir al libro
      router.push(`/${locale}/books/${bookId}/read`);

    } catch (err: any) {
      console.error('❌ Error al crear libro:', err);
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
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
        isSaveDisabled={!isFormValid()}
        onClose={handleClosePreview}
        onSave={handleSave}
      />
    );
  }

  // MODO FORMULARIO
  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Crear Nuevo Libro
            </h1>
            <p className="text-gray-600">
              Sube un PDF y completa la información del libro
            </p>
          </div>

          {/* Error global */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-medium">Error</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Navegación por tabs */}
          <div className="bg-white rounded-t-2xl border-b-2 border-gray-200 shadow-sm">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setCurrentTab('basico')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'basico'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={18} />
                  Información Básica
                </div>
              </button>
              
              <button
                onClick={() => setCurrentTab('clasificacion')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'clasificacion'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={18} />
                  Clasificación
                </div>
              </button>
              
              <button
                onClick={() => setCurrentTab('contenido')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'contenido'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={18} />
                  Personajes
                </div>
              </button>
              
              <button
                onClick={() => setCurrentTab('archivos')}
                className={`px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  currentTab === 'archivos'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload size={18} />
                  Archivos
                </div>
              </button>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="bg-white rounded-b-2xl shadow-xl p-8">
            
            {/* TAB: Información Básica */}
            {currentTab === 'basico' && (
              <div className="space-y-6">
                
                {/* Título */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Título del Libro <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: El principito"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Descripción / Sinopsis <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Describe brevemente de qué trata el libro..."
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {descripcion.length} caracteres
                  </p>
                </div>

                {/* Autores */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900">
                      Autores <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={addAutor}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Agregar Autor
                    </button>
                  </div>
                  <div className="space-y-3">
                    {autores.map((autor, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={autor}
                          onChange={(e) => updateAutor(index, e.target.value)}
                          placeholder={`Autor ${index + 1}`}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                        />
                        {autores.length > 1 && (
                          <button
                            onClick={() => removeAutor(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Clasificación */}
            {currentTab === 'clasificacion' && (
              <div className="space-y-8">
                
                {/* Nivel de lectura */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Nivel de Lectura <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {niveles.map(nivel => (
                      <button
                        key={nivel.id}
                        onClick={() => setSelectedNivel(nivel.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedNivel === nivel.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                            : 'border-gray-300 hover:border-indigo-300 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{nivel.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categorías */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Categorías <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Selecciona al menos 1)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {categorias.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => toggleSelection(cat.id, selectedCategorias, setSelectedCategorias)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedCategorias.includes(cat.id)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                            : 'border-gray-300 hover:border-blue-300 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Géneros */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Géneros Literarios <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 ml-2">(Selecciona al menos 1)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {generos.map(genero => (
                      <button
                        key={genero.id}
                        onClick={() => toggleSelection(genero.id, selectedGeneros, setSelectedGeneros)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedGeneros.includes(genero.id)
                            ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                            : 'border-gray-300 hover:border-purple-300 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{genero.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Etiquetas */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Etiquetas Temáticas
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {etiquetas.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleSelection(tag.id, selectedEtiquetas, setSelectedEtiquetas)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedEtiquetas.includes(tag.id)
                            ? 'border-pink-500 bg-pink-50 text-pink-700 font-medium'
                            : 'border-gray-300 hover:border-pink-300 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{tag.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Valores */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Valores que Transmite
                    <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {valores.map(valor => (
                      <button
                        key={valor.id}
                        onClick={() => toggleSelection(valor.id, selectedValores, setSelectedValores)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedValores.includes(valor.id)
                            ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                            : 'border-gray-300 hover:border-green-300 text-gray-700'
                        }`}
                      >
                        <div className="text-sm">{valor.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: Personajes */}
            {currentTab === 'contenido' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-900">
                      Personajes del Libro
                      <span className="text-xs text-gray-500 ml-2">(Opcional)</span>
                    </label>
                    <button
                      onClick={addPersonaje}
                      className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Agregar Personaje
                    </button>
                  </div>
                  
                  {personajes.length > 0 ? (
                    <div className="space-y-3">
                      {personajes.map((personaje, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={personaje}
                            onChange={(e) => updatePersonaje(index, e.target.value)}
                            placeholder={`Personaje ${index + 1}`}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                          />
                          <button
                            onClick={() => removePersonaje(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <Users size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-gray-500">
                        No hay personajes agregados
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Haz clic en "Agregar Personaje" para comenzar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Archivos */}
            {currentTab === 'archivos' && (
              <div className="space-y-8">
                
                {/* Portada */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Portada del Libro
                    <span className="text-xs text-gray-500 ml-2">(Opcional - Recomendado)</span>
                  </label>
                  
                  {portadaPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={portadaPreview}
                        alt="Portada"
                        className="w-48 h-64 object-cover rounded-xl border-2 border-gray-300 shadow-lg"
                      />
                      <button
                        onClick={() => {
                          setPortadaFile(null);
                          setPortadaPreview(null);
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        <div className="flex flex-col items-center text-center">
                          <Image size={48} className="text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Sube la portada del libro
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG (máx. 5MB)
                          </p>
                        </div>
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

                {/* PDF */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Archivo PDF del Libro <span className="text-red-500">*</span>
                  </label>
                  
                  {pdfFile ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText size={32} className="text-green-600" />
                            <div>
                              <p className="text-sm font-semibold text-green-900">
                                {pdfFile.name}
                              </p>
                              <p className="text-xs text-green-700">
                                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setPdfFile(null);
                              setExtractedPages([]);
                              setPdfDimensions(null);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Extrayendo páginas */}
                      {isExtractingPages && (
                        <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Loader2 size={24} className="animate-spin text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">
                                Extrayendo páginas del PDF...
                              </p>
                              <p className="text-xs text-blue-700">
                                Esto puede tardar unos segundos
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Preview disponible */}
                      {extractedPages.length > 0 && !isExtractingPages && (
                        <button
                          onClick={() => setShowPreview(true)}
                          className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Eye size={20} />
                          Ver Preview del Libro ({extractedPages.length} páginas)
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        <div className="flex flex-col items-center text-center">
                          <Upload size={48} className="text-gray-400 mb-3" />
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Arrastra tu PDF aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF (máx. 50MB)
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handlePDFChange}
                        className="hidden"
                      />
                    </label>
                  )}

                  {pdfError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{pdfError}</p>
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Footer con acciones */}
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Indicador de progreso */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  titulo && descripcion && autores.some(a => a.trim())
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  selectedCategorias.length > 0 && selectedGeneros.length > 0 && selectedNivel
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} />
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  pdfFile ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-500 ml-2">
                  {isFormValid() ? '✅ Listo para guardar' : 'Completa los campos obligatorios'}
                </span>
              </div>

              {/* Botones */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => router.push(`/${locale}/books`)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!isFormValid() || isLoading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
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

            {/* Campos faltantes */}
            {!isFormValid() && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs font-semibold text-amber-900 mb-2">
                  Campos obligatorios faltantes:
                </p>
                <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                  {!titulo.trim() && <li>Título</li>}
                  {!descripcion.trim() && <li>Descripción</li>}
                  {!autores.some(a => a.trim()) && <li>Al menos un autor</li>}
                  {selectedCategorias.length === 0 && <li>Al menos una categoría</li>}
                  {selectedGeneros.length === 0 && <li>Al menos un género</li>}
                  {!selectedNivel && <li>Nivel de lectura</li>}
                  {!pdfFile && <li>Archivo PDF</li>}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </UnifiedLayout>
  );
}