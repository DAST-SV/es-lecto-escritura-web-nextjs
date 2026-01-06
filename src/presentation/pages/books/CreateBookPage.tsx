/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ FINAL: Navbar visible + Ficha compacta + Upload integrado + Colores cálidos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Loader2, Save, Upload, AlertCircle, BookOpen, Tag, Camera, X, Eye
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import { OptimizedSelector } from '@/src/presentation/features/books/components/Selectors/OptimizedSelector';
import { AutoresInput } from '@/src/presentation/features/books/components/Inputs/AutoresInput';
import { PersonajesInput } from '@/src/presentation/features/books/components/Inputs/PersonajesInput';
import type { Page } from '@/src/core/domain/types';

export function CreateBookPage() {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

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
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [niveles, setNiveles] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedLabels, setSelectedLabels] = useState({
    categorias: [] as string[],
    generos: [] as string[],
    etiquetas: [] as string[],
    valores: [] as string[]
  });

  const shouldShowPreview = 
    titulo.trim() !== '' || 
    descripcion.trim() !== '' || 
    autores.some(a => a.trim()) ||
    portadaPreview !== null ||
    selectedNivel !== null ||
    selectedCategorias.length > 0 ||
    selectedGeneros.length > 0 ||
    selectedEtiquetas.length > 0 ||
    selectedValores.length > 0 ||
    personajes.some(p => p.trim());

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUserId(user.id);

      const { data: levs } = await supabase
        .from('book_levels')
        .select('id, name')
        .order('id');
      
      setNiveles(levs || []);
    }
    init();
  }, [supabase, router, locale]);

  useEffect(() => {
    async function loadLabels() {
      const loadItemNames = async (table: string, ids: number[]) => {
        if (ids.length === 0) return [];
        const { data } = await supabase
          .from(table)
          .select('name')
          .in('id', ids);
        return data?.map(item => item.name) || [];
      };

      const [cats, gens, tags, vals] = await Promise.all([
        loadItemNames('book_categories', selectedCategorias),
        loadItemNames('book_genres', selectedGeneros),
        loadItemNames('book_tags', selectedEtiquetas),
        loadItemNames('book_values', selectedValores)
      ]);

      setSelectedLabels({
        categorias: cats,
        generos: gens,
        etiquetas: tags,
        valores: vals
      });
    }

    loadLabels();
  }, [selectedCategorias, selectedGeneros, selectedEtiquetas, selectedValores]);

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
      setPdfError('Solo PDF');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfError('Máx. 50MB');
      return;
    }

    setPdfFile(file);
    setPdfError('');
    setExtractedPages([]);

    if (!titulo.trim()) {
      setTitulo(file.name.replace('.pdf', ''));
    }

    setIsExtractingPages(true);
    try {
      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      
      setExtractedPages(result.pages);
      
      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({ 
          width: result.pageWidth, 
          height: result.pageHeight 
        });
      }
    } catch (err) {
      setPdfError('Error al procesar');
    } finally {
      setIsExtractingPages(false);
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
      pdfFile !== null &&
      selectedCategorias.length > 0 &&
      selectedGeneros.length > 0 &&
      selectedNivel !== null
    );
  };

  const handleSave = async () => {
    try {
      if (!userId || !isFormValid()) {
        setError('Completa campos obligatorios');
        return;
      }

      setIsLoading(true);
      setError('');

      const bookId = crypto.randomUUID();

      let portadaUrl: string | undefined;
      if (portadaFile) {
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

      const { url: pdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(
        pdfFile!, 
        userId, 
        bookId
      );

      if (pdfUploadError || !pdfUrl) {
        throw new Error(pdfUploadError || 'Error PDF');
      }

      await CreateBookUseCase.execute(userId, {
        titulo,
        descripcion,
        portada: portadaUrl,
        pdfUrl,
        autores: autores.filter(a => a.trim()),
        personajes: personajes.filter(p => p.trim()),
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
      setError(err.message || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <UnifiedLayout showNavbar={true}>
      <div className="h-[calc(100vh-60px)] flex flex-col bg-gradient-to-br from-amber-50/30 via-white to-rose-50/30">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="px-6 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Crear Nuevo Libro</h1>
              <p className="text-xs text-gray-500">Sistema de gestión editorial</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={!isFormValid() || isLoading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex-shrink-0 px-6 pt-3">
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={14} className="text-red-600" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="flex-1 overflow-hidden px-6 py-4">
          <div className="h-full grid grid-cols-2 gap-4">
            
            {/* COLUMNA IZQUIERDA */}
            <div className="overflow-y-auto pr-2 space-y-3">
              
              {/* PDF */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900">Archivo PDF</h3>
                </div>
                <div className="p-3">
                  {pdfFile ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Upload size={14} className="text-emerald-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{pdfFile.name}</p>
                          <p className="text-[10px] text-gray-600">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => { setPdfFile(null); setExtractedPages([]); }}
                        className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0">
                        <X size={12} className="text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                        <Upload size={18} className="text-gray-400 mb-1" />
                        <span className="text-xs text-gray-500">Subir PDF</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">Máx. 50MB</span>
                      </div>
                      <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                    </label>
                  )}
                  {pdfError && <p className="text-[10px] text-red-600 mt-1">⚠️ {pdfError}</p>}
                  {extractedPages.length > 0 && (
                    <button onClick={() => setShowPreview(true)}
                      className="w-full mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all">
                      <Eye size={12} />
                      Preview ({extractedPages.length} pág.)
                    </button>
                  )}
                  {isExtractingPages && (
                    <div className="mt-2 text-center py-2">
                      <Loader2 className="animate-spin mx-auto text-gray-600 mb-1" size={14} />
                      <p className="text-[10px] text-gray-600">Procesando...</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Info Básica */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <BookOpen size={13} />
                    Información básica
                  </h3>
                </div>
                <div className="p-3 space-y-2.5">
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 block mb-1">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del libro"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-700 block mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Sinopsis..." rows={3}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none resize-none" />
                  </div>
                  <AutoresInput autores={autores} onChange={setAutores} />
                </div>
              </section>

              {/* Clasificación */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Tag size={13} />
                    Clasificación
                  </h3>
                </div>
                <div className="p-3 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-700 block mb-1.5">
                      Nivel <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {niveles.map(nivel => (
                        <button key={nivel.id} onClick={() => setSelectedNivel(nivel.id)}
                          className={`px-2.5 py-1.5 text-[11px] rounded-md border transition-all font-medium ${
                            selectedNivel === nivel.id 
                              ? 'border-amber-400 bg-amber-50 text-amber-900' 
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}>
                          {nivel.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <OptimizedSelector table="book_categories" selectedIds={selectedCategorias}
                    onToggle={(id) => toggleSelection(id, selectedCategorias, setSelectedCategorias)}
                    label="Categorías" color="amber" maxSelections={5} required />

                  <OptimizedSelector table="book_genres" selectedIds={selectedGeneros}
                    onToggle={(id) => toggleSelection(id, selectedGeneros, setSelectedGeneros)}
                    label="Géneros" color="rose" maxSelections={3} required />

                  <OptimizedSelector table="book_tags" selectedIds={selectedEtiquetas}
                    onToggle={(id) => toggleSelection(id, selectedEtiquetas, setSelectedEtiquetas)}
                    label="Etiquetas" color="sky" maxSelections={10} />

                  <OptimizedSelector table="book_values" selectedIds={selectedValores}
                    onToggle={(id) => toggleSelection(id, selectedValores, setSelectedValores)}
                    label="Valores" color="emerald" maxSelections={5} />
                </div>
              </section>

              {/* Personajes */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900">Personajes</h3>
                </div>
                <div className="p-3">
                  <PersonajesInput personajes={personajes} onChange={setPersonajes} />
                </div>
              </section>

            </div>

            {/* COLUMNA DERECHA - Ficha compacta */}
            <div className="overflow-hidden">
              <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
                  <h3 className="text-xs font-semibold text-gray-900">Ficha Literaria</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {shouldShowPreview ? (
                    <div className="space-y-3">
                      
                      {/* Header con portada dinámica */}
                      <div className="flex gap-3 pb-3 border-b border-gray-100">
                        <div className="flex-shrink-0">
                          {portadaPreview ? (
                            <div className="relative group">
                              <img src={portadaPreview} alt="Portada" className="w-24 h-32 object-cover rounded-md shadow-sm border border-gray-200" />
                              <button 
                                onClick={() => { setPortadaFile(null); setPortadaPreview(null); }}
                                className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <label className="block cursor-pointer">
                              <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                                <Camera size={16} className="text-gray-400 group-hover:text-orange-500 mb-1" />
                                <span className="text-[9px] text-gray-500 group-hover:text-orange-600">Subir</span>
                              </div>
                              <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                            </label>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {titulo && <h2 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{titulo}</h2>}
                          {autores.filter(a => a.trim()).length > 0 && (
                            <p className="text-[10px] text-gray-600 mb-1.5">{autores.filter(a => a.trim()).join(', ')}</p>
                          )}
                          {selectedNivel && niveles.find(n => n.id === selectedNivel) && (
                            <div className="inline-block px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-medium mb-1.5">
                              {niveles.find(n => n.id === selectedNivel)?.name}
                            </div>
                          )}
                          {descripcion && (
                            <p className="text-[10px] text-gray-700 leading-snug line-clamp-2">{descripcion}</p>
                          )}
                        </div>
                      </div>

                      {/* Metadata compacta */}
                      {personajes.filter(p => p.trim()).length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Personajes</h4>
                          <div className="flex flex-wrap gap-1">
                            {personajes.filter(p => p.trim()).map((p, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] border border-gray-200">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedLabels.categorias.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Categorías</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedLabels.categorias.map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded text-[10px] border border-amber-200">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedLabels.generos.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Géneros</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedLabels.generos.map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded text-[10px] border border-rose-200">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedLabels.etiquetas.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Etiquetas</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedLabels.etiquetas.map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-sky-50 text-sky-800 rounded text-[10px] border border-sky-200">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedLabels.valores.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">Valores</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedLabels.valores.map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] border border-emerald-200">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500 mb-1">Vista previa</p>
                        <p className="text-[10px] text-gray-400 max-w-[200px] mx-auto">
                          Completa el formulario
                        </p>
                      </div>
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