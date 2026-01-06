/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ COMPLETO: Etiquetas agregadas + Selectores con búsqueda y paginación
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Loader2, Eye, X, Plus, BookOpen, Users, Tag, 
  Star, FileText, Image, Save, Upload, AlertCircle,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createClient } from '@/src/utils/supabase/client';
import UnifiedLayout from '@/src/components/nav/UnifiedLayout';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import type { Page } from '@/src/core/domain/types';

// ============================================
// COMPONENTE OPTIMIZADO DE SELECTOR
// ============================================
interface CatalogItem {
  id: number;
  name: string;
}

interface OptimizedSelectorProps {
  items: CatalogItem[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  label: string;
  color: 'blue' | 'purple' | 'green' | 'pink' | 'orange';
  maxSelections?: number;
  required?: boolean;
}

const colorClasses = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', chip: 'bg-blue-100 border-blue-300 text-blue-700' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700', chip: 'bg-purple-100 border-purple-300 text-purple-700' },
  green: { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700', chip: 'bg-green-100 border-green-300 text-green-700' },
  pink: { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-700', chip: 'bg-pink-100 border-pink-300 text-pink-700' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', chip: 'bg-orange-100 border-orange-300 text-orange-700' }
};

function OptimizedSelector({ items, selectedIds, onToggle, label, color, maxSelections = 999, required = false }: OptimizedSelectorProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const colors = colorClasses[color];

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    return items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-700 block">
        {label} {required && '*'} ({selectedIds.length}/{maxSelections})
      </label>
      <div className="relative">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." 
          className="w-full pl-7 pr-2 py-1.5 text-xs border border-gray-300 rounded focus:border-indigo-500 focus:outline-none" />
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 overflow-y-auto" style={{ maxHeight: '180px' }}>
          {currentItems.length === 0 ? (
            <div className="col-span-4 text-center py-6 text-xs text-gray-400">No se encontraron resultados</div>
          ) : currentItems.map(item => {
            const isSelected = selectedIds.includes(item.id);
            const canClick = isSelected || selectedIds.length < maxSelections;
            return (
              <button key={item.id} onClick={() => canClick && onToggle(item.id)} disabled={!canClick}
                className={`px-2 py-1 text-xs rounded border transition-colors ${isSelected 
                  ? `${colors.border} ${colors.bg} ${colors.text} font-medium` 
                  : canClick ? 'border-gray-300 hover:border-gray-400 text-gray-700' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}>
                {item.name}
              </button>
            );
          })}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-1.5 bg-white border-t border-gray-200">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-gray-600">Página {currentPage} de {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {items.filter(item => selectedIds.includes(item.id)).map(item => (
            <span key={item.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${colors.chip} text-xs`}>
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
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
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<CatalogItem[]>([]);
  const [generos, setGeneros] = useState<CatalogItem[]>([]);
  const [etiquetas, setEtiquetas] = useState<CatalogItem[]>([]);
  const [valores, setValores] = useState<CatalogItem[]>([]);
  const [niveles, setNiveles] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push(`/${locale}/login`); return; }
        setUserId(user.id);
        const [{ data: cats }, { data: gens }, { data: tags }, { data: vals }, { data: levs }] = await Promise.all([
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
        setError('Error al cargar catálogos');
      }
    }
    loadInitialData();
  }, [supabase, router, locale]);

  const addAutor = () => setAutores([...autores, '']);
  const removeAutor = (idx: number) => autores.length > 1 && setAutores(autores.filter((_, i) => i !== idx));
  const updateAutor = (idx: number, val: string) => { const u = [...autores]; u[idx] = val; setAutores(u); };
  const addPersonaje = () => setPersonajes([...personajes, '']);
  const removePersonaje = (idx: number) => setPersonajes(personajes.filter((_, i) => i !== idx));
  const updatePersonaje = (idx: number, val: string) => { const u = [...personajes]; u[idx] = val; setPersonajes(u); };
  
  const toggleSelection = (id: number, arr: number[], setArr: React.Dispatch<React.SetStateAction<number[]>>) => {
    setArr(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
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
    if (file.type !== 'application/pdf') { setPdfError('Solo PDF'); return; }
    setPdfFile(file);
    setPdfError('');
    setExtractedPages([]);
    setIsExtractingPages(true);
    try {
      if (!titulo.trim()) setTitulo(file.name.replace('.pdf', ''));
      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      setExtractedPages(result.pages);
      if (result.pageWidth && result.pageHeight) setPdfDimensions({ width: result.pageWidth, height: result.pageHeight });
    } catch { setPdfError('Error al procesar PDF'); } finally { setIsExtractingPages(false); }
  };

  const isFormValid = () => titulo.trim() && descripcion.trim() && autores.some(a => a.trim()) && pdfFile && selectedCategorias.length > 0 && selectedGeneros.length > 0 && selectedNivel !== null;

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
      if (pdfUploadError || !pdfUrl) throw new Error(pdfUploadError || 'Error PDF');
      await CreateBookUseCase.execute(userId, {
        titulo, descripcion, portada: portadaUrl, pdfUrl,
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
      setError(err.message || 'Error al crear');
    } finally { setIsLoading(false); }
  };

  const getCategoryNames = () => categorias.filter(c => selectedCategorias.includes(c.id)).map(c => c.name);
  const getGenreNames = () => generos.filter(g => selectedGeneros.includes(g.id)).map(g => g.name);
  const getTagNames = () => etiquetas.filter(t => selectedEtiquetas.includes(t.id)).map(t => t.name);
  const getValueNames = () => valores.filter(v => selectedValores.includes(v.id)).map(v => v.name);
  const getLevelName = () => niveles.find(n => n.id === selectedNivel)?.name || '';

  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return <PDFPreviewMode pages={extractedPages} title={titulo} pdfDimensions={pdfDimensions} isLoading={isLoading} isSaveDisabled={!isFormValid()} onClose={() => setShowPreview(false)} onSave={handleSave} />;
  }

  return (
    <UnifiedLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Crear Nuevo Libro</h1>
              <p className="text-xs text-gray-500">Completa la información y ve el preview</p>
            </div>
            <button onClick={handleSave} disabled={!isFormValid() || isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2">
              {isLoading ? <><Loader2 size={16} className="animate-spin" />Guardando...</> : <><Save size={16} />Guardar</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-[1800px] mx-auto px-4 pt-4">
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div><p className="text-sm font-medium text-red-700">Error</p><p className="text-xs text-red-600">{error}</p></div>
            </div>
          </div>
        )}

        <div className="max-w-[1800px] mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Upload size={16} />Archivos</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Portada</label>
                    {portadaPreview ? (
                      <div className="relative">
                        <img src={portadaPreview} alt="Portada" className="w-full h-32 object-cover rounded border" />
                        <button onClick={() => { setPortadaFile(null); setPortadaPreview(null); }}
                          className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"><X size={12} /></button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-indigo-400 transition-colors">
                          <Image size={20} className="text-gray-400 mb-1" /><span className="text-xs text-gray-500">Subir</span>
                        </div>
                        <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">PDF *</label>
                    {pdfFile ? (
                      <div className="h-32 bg-green-50 border border-green-300 rounded p-2 flex flex-col justify-between">
                        <div><FileText size={20} className="text-green-600 mb-1" />
                          <p className="text-xs font-medium text-green-900 line-clamp-2">{pdfFile.name}</p></div>
                        <button onClick={() => { setPdfFile(null); setExtractedPages([]); }} className="text-xs text-red-600 hover:text-red-700 font-medium">Quitar</button>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center hover:border-indigo-400 transition-colors">
                          <Upload size={20} className="text-gray-400 mb-1" /><span className="text-xs text-gray-500">Subir PDF</span>
                        </div>
                        <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                {extractedPages.length > 0 && !isExtractingPages && (
                  <button onClick={() => setShowPreview(true)}
                    className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium flex items-center justify-center gap-2">
                    <Eye size={16} />Ver Preview PDF ({extractedPages.length} pág.)
                  </button>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><BookOpen size={16} />Información Básica</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Título *</label>
                    <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título del libro"
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Descripción *</label>
                    <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Sinopsis..." rows={3}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none resize-none" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-700">Autores *</label>
                      <button onClick={addAutor} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <Plus size={12} />Agregar
                      </button>
                    </div>
                    <div className="space-y-1">
                      {autores.map((autor, idx) => (
                        <div key={idx} className="flex gap-1">
                          <input type="text" value={autor} onChange={(e) => updateAutor(idx, e.target.value)} placeholder={`Autor ${idx + 1}`}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-indigo-500 focus:outline-none" />
                          {autores.length > 1 && (
                            <button onClick={() => removeAutor(idx)} className="px-2 bg-red-500 text-white rounded hover:bg-red-600"><X size={12} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Tag size={16} />Clasificación</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Nivel *</label>
                    <div className="grid grid-cols-4 gap-1">
                      {niveles.map(nivel => (
                        <button key={nivel.id} onClick={() => setSelectedNivel(nivel.id)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${selectedNivel === nivel.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : 'border-gray-300 hover:border-indigo-300 text-gray-700'}`}>
                          {nivel.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <OptimizedSelector items={categorias} selectedIds={selectedCategorias}
                    onToggle={(id) => toggleSelection(id, selectedCategorias, setSelectedCategorias)}
                    label="Categorías" color="blue" maxSelections={5} required />
                  <OptimizedSelector items={generos} selectedIds={selectedGeneros}
                    onToggle={(id) => toggleSelection(id, selectedGeneros, setSelectedGeneros)}
                    label="Géneros" color="purple" maxSelections={3} required />
                  <OptimizedSelector items={etiquetas} selectedIds={selectedEtiquetas}
                    onToggle={(id) => toggleSelection(id, selectedEtiquetas, setSelectedEtiquetas)}
                    label="Etiquetas" color="pink" maxSelections={10} />
                  <OptimizedSelector items={valores} selectedIds={selectedValores}
                    onToggle={(id) => toggleSelection(id, selectedValores, setSelectedValores)}
                    label="Valores" color="green" maxSelections={5} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Users size={16} />Personajes</h3>
                  <button onClick={addPersonaje} className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                    <Plus size={12} />Agregar
                  </button>
                </div>
                {personajes.length > 0 ? (
                  <div className="space-y-1">
                    {personajes.map((personaje, idx) => (
                      <div key={idx} className="flex gap-1">
                        <input type="text" value={personaje} onChange={(e) => updatePersonaje(idx, e.target.value)} placeholder={`Personaje ${idx + 1}`}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-500 focus:outline-none" />
                        <button onClick={() => removePersonaje(idx)} className="px-2 bg-red-500 text-white rounded hover:bg-red-600"><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-400 text-center py-4">Sin personajes</p>}
              </div>

            </div>

            <div className="sticky top-20" style={{ maxHeight: 'calc(100vh - 100px)' }}>
              <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white"><Eye size={16} /><span className="text-sm font-bold">Preview Ficha Literaria</span></div>
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
                            <div className="w-24 h-32 bg-gray-200 rounded flex items-center justify-center"><BookOpen size={24} className="text-gray-400" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {titulo && <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{titulo}</h2>}
                          {autores.filter(a => a.trim()).length > 0 && (
                            <p className="text-xs text-gray-600 mb-2">por {autores.filter(a => a.trim()).join(', ')}</p>
                          )}
                          {selectedNivel && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs mb-2">
                              <Star size={10} />{getLevelName()}
                            </div>
                          )}
                          {descripcion && <p className="text-xs text-gray-700 line-clamp-3">{descripcion}</p>}
                        </div>
                      </div>
                      {personajes.filter(p => p.trim()).length > 0 && (
                        <div><h4 className="text-xs font-bold text-gray-900 mb-1">Personajes</h4>
                          <div className="flex flex-wrap gap-1">
                            {personajes.filter(p => p.trim()).map((p, i) => (
                              <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedCategorias.length > 0 && (<div><h4 className="text-xs font-bold text-gray-900 mb-1">Categorías</h4>
                          <div className="flex flex-wrap gap-1">
                            {getCategoryNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedGeneros.length > 0 && (
                        <div><h4 className="text-xs font-bold text-gray-900 mb-1">Géneros</h4>
                          <div className="flex flex-wrap gap-1">
                            {getGenreNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedEtiquetas.length > 0 && (
                        <div><h4 className="text-xs font-bold text-gray-900 mb-1">Etiquetas</h4>
                          <div className="flex flex-wrap gap-1">
                            {getTagNames().map((name, i) => (
                              <span key={i} className="px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedValores.length > 0 && (
                        <div><h4 className="text-xs font-bold text-gray-900 mb-1">Valores</h4>
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