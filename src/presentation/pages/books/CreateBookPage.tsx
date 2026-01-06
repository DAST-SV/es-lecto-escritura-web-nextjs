/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ COMPACTO: Todo en una vista con preview en tiempo real
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Loader2, Eye, X, Plus, BookOpen, Users, Tag, 
  Star, FileText, Image, Save, Upload, AlertCircle 
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
  
  // Estados del formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>([]);
  
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<number[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [selectedValores, setSelectedValores] = useState<number[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Catálogos
  const [categorias, setCategorias] = useState<Array<{ id: number; name: string }>>([]);
  const [generos, setGeneros] = useState<Array<{ id: number; name: string }>>([]);
  const [etiquetas, setEtiquetas] = useState<Array<{ id: number; name: string }>>([]);
  const [valores, setValores] = useState<Array<{ id: number; name: string }>>([]);
  const [niveles, setNiveles] = useState<Array<{ id: number; name: string }>>([]);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/login`);
          return;
        }
        setUserId(user.id);

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
        console.error('Error cargando datos:', err);
        setError('Error al cargar catálogos');
      }
    }
    loadInitialData();
  }, [supabase, router, locale]);

  // Handlers
  const addAutor = () => setAutores([...autores, '']);
  const removeAutor = (index: number) => autores.length > 1 && setAutores(autores.filter((_, i) => i !== index));
  const updateAutor = (index: number, value: string) => {
    const updated = [...autores];
    updated[index] = value;
    setAutores(updated);
  };

  const addPersonaje = () => setPersonajes([...personajes, '']);
  const removePersonaje = (index: number) => setPersonajes(personajes.filter((_, i) => i !== index));
  const updatePersonaje = (index: number, value: string) => {
    const updated = [...personajes];
    updated[index] = value;
    setPersonajes(updated);
  };

  const toggleSelection = (itemId: number, selectedArray: number[], setSelectedArray: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (selectedArray.includes(itemId)) {
      setSelectedArray(selectedArray.filter(id => id !== itemId));
    } else {
      setSelectedArray([...selectedArray, itemId]);
    }
  };

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPortadaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPortadaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

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
      if (!titulo.trim()) setTitulo(file.name.replace('.pdf', ''));

      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      
      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({ width: result.pageWidth, height: result.pageHeight });
      }
    } catch (err: any) {
      setPdfError('Error al procesar el PDF');
    } finally {
      setIsExtractingPages(false);
    }
  };

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

  const handleSave = async () => {
    try {
      if (!userId || !isFormValid()) return;

      setIsLoading(true);
      setError('');

      const bookId = crypto.randomUUID();

      let portadaUrl: string | undefined;
      if (portadaFile) {
        const result = await BookImageService.uploadImage(portadaFile, userId, bookId, 'portada');
        if (result.success && result.url) portadaUrl = result.url;
      }

      const { url: pdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(pdfFile!, userId, bookId);
      if (pdfUploadError || !pdfUrl) throw new Error(pdfUploadError || 'Error al subir PDF');

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

      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }

      router.push(`/${locale}/books/${bookId}/read`);
    } catch (err: any) {
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener nombres para preview
  const getCategoryNames = () => categorias.filter(c => selectedCategorias.includes(c.id)).map(c => c.name);
  const getGenreNames = () => generos.filter(g => selectedGeneros.includes(g.id)).map(g => g.name);
  const getValueNames = () => valores.filter(v => selectedValores.includes(v.id)).map(v => v.name);
  const getLevelName = () => niveles.find(n => n.id === selectedNivel)?.name || '';

  // MODO PREVIEW PDF
  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <PDFPreviewMode
        pages={extractedPages}
        title={titulo}
        pdfDimensions={pdfDimensions}
        isLoading={isLoading}
        isSaveDisabled={!isFormValid()}
        onClose={() => setShowPreview(false)}
        onSave={handleSave}
      />
    );
  }

  // MODO FORMULARIO COMPACTO
  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header compacto y sticky */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Crear Nuevo Libro</h1>
              <p className="text-xs text-gray-500">Completa la información y ve el preview en tiempo real</p>
            </div>
            <button
              onClick={handleSave}
              disabled={!isFormValid() || isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar Libro
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error global */}
        {error && (
          <div className="max-w-[1800px] mx-auto px-4 pt-4">
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Error</p>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Layout 2 columnas */}
        <div className="max-w-[1800px] mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* COLUMNA IZQUIERDA: Formulario */}
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              
              {/* Archivos */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Upload size={16} />
                  Archivos
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Portada */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Portada</label>
                    {portadaPreview ? (
                      <div className="relative">
                        <img src={portadaPreview} alt="Portada" className="w-full h-32 object-cover rounded border" />
                        <button
                          onClick={() => { setPortadaFile(null); setPortadaPreview(null); }}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-indigo-400 transition-colors">
                          <Image size={20} className="text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Subir</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* PDF */}
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">PDF *</label>
                    {pdfFile ? (
                      <div className="h-32 bg-green-50 border border-green-300 rounded p-2 flex flex-col justify-between">
                        <div>
                          <FileText size={20} className="text-green-600 mb-1" />
                          <p className="text-xs font-medium text-green-900 line-clamp-2">{pdfFile.name}</p>
                        </div>
                        <button
                          onClick={() => { setPdfFile(null); setExtractedPages([]); }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-indigo-400 transition-colors">
                          <Upload size={20} className="text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Subir PDF</span>
                        </div>
                        <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Preview PDF button */}
                {extractedPages.length > 0 && !isExtractingPages && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Preview PDF ({extractedPages.length} pág.)
                  </button>
                )}
              </div>

              {/* Info Básica */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BookOpen size={16} />
                  Información Básica
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Título *</label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Título del libro"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Descripción *</label>
                    <textarea
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Sinopsis..."
                      rows={3}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Autores *</label>
                      <button onClick={addAutor} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <Plus size={12} />
                        Agregar
                      </button>
                    </div>
                    <div className="space-y-1">
                      {autores.map((autor, idx) => (
                        <div key={idx} className="flex gap-1">
                          <input
                            type="text"
                            value={autor}
                            onChange={(e) => updateAutor(idx, e.target.value)}
                            placeholder={`Autor ${idx + 1}`}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none"
                          />
                          {autores.length > 1 && (
                            <button onClick={() => removeAutor(idx)} className="px-2 bg-red-500 text-white rounded hover:bg-red-600">
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clasificación */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Tag size={16} />
                  Clasificación
                </h3>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Nivel *</label>
                    <div className="grid grid-cols-4 gap-1">
                      {niveles.map(nivel => (
                        <button
                          key={nivel.id}
                          onClick={() => setSelectedNivel(nivel.id)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            selectedNivel === nivel.id
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                              : 'border-gray-300 hover:border-indigo-300 text-gray-700'
                          }`}
                        >
                          {nivel.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Categorías *</label>
                    <div className="grid grid-cols-4 gap-1">
                      {categorias.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => toggleSelection(cat.id, selectedCategorias, setSelectedCategorias)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            selectedCategorias.includes(cat.id)
                              ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                              : 'border-gray-300 hover:border-blue-300 text-gray-700'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Géneros *</label>
                    <div className="grid grid-cols-4 gap-1">
                      {generos.map(gen => (
                        <button
                          key={gen.id}
                          onClick={() => toggleSelection(gen.id, selectedGeneros, setSelectedGeneros)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            selectedGeneros.includes(gen.id)
                              ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                              : 'border-gray-300 hover:border-purple-300 text-gray-700'
                          }`}
                        >
                          {gen.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Valores</label>
                    <div className="grid grid-cols-4 gap-1">
                      {valores.map(val => (
                        <button
                          key={val.id}
                          onClick={() => toggleSelection(val.id, selectedValores, setSelectedValores)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            selectedValores.includes(val.id)
                              ? 'border-green-500 bg-green-50 text-green-700 font-medium'
                              : 'border-gray-300 hover:border-green-300 text-gray-700'
                          }`}
                        >
                          {val.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personajes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Users size={16} />
                    Personajes
                  </h3>
                  <button onClick={addPersonaje} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                    <Plus size={12} />
                    Agregar
                  </button>
                </div>
                
                {personajes.length > 0 ? (
                  <div className="space-y-1">
                    {personajes.map((personaje, idx) => (
                      <div key={idx} className="flex gap-1">
                        <input
                          type="text"
                          value={personaje}
                          onChange={(e) => updatePersonaje(idx, e.target.value)}
                          placeholder={`Personaje ${idx + 1}`}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-500 focus:outline-none"
                        />
                        <button onClick={() => removePersonaje(idx)} className="px-2 bg-red-500 text-white rounded hover:bg-red-600">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">Sin personajes</p>
                )}
              </div>

            </div>

            {/* COLUMNA DERECHA: Preview */}
            <div className="sticky top-20" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
                
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Eye size={16} />
                    <span className="text-sm font-bold">Preview de Ficha Literaria</span>
                  </div>
                  <span className="text-xs text-white/80">Tiempo real</span>
                </div>

                <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                  {titulo || descripcion || autores.some(a => a.trim()) ? (
                    <div className="space-y-3">
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          {portadaPreview ? (
                            <img src={portadaPreview} alt="Portada" className="w-24 h-32 object-cover rounded shadow-md" />
                          ) : (
                            <div className="w-24 h-32 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen size={24} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {titulo && <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{titulo}</h2>}
                          {autores.filter(a => a.trim()).length > 0 && (
                            <p className="text-xs text-gray-600 mb-2">por {autores.filter(a => a.trim()).join(', ')}</p>
                          )}
                          {selectedNivel && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs mb-2">
                              <Star size={10} />
                              {getLevelName()}
                            </div>
                          )}
                          {descripcion && <p className="text-xs text-gray-700 line-clamp-3">{descripcion}</p>}
                        </div>
                      </div>

                      {personajes.filter(p => p.trim()).length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-1">Personajes</h4>
                          <div className="flex flex-wrap gap-1">
                            {personajes.filter(p => p.trim()).map((p, i) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedCategorias.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-1">Categorías</h4>
                          <div className="flex flex-wrap gap-1">
                            {getCategoryNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedGeneros.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-1">Géneros</h4>
                          <div className="flex flex-wrap gap-1">
                            {getGenreNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedValores.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-1">Valores</h4>
                          <div className="flex flex-wrap gap-1">
                            {getValueNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">{name}</span>
))}
</div>
</div>
)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">Completa el formulario</p>
                  <p className="text-xs text-gray-400 mt-1">Verás el preview aquí</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
</UnifiedLayout>
);
}