/**
 * UBICACIÓN: src/presentation/pages/books/CreateBookPage.tsx
 * ✅ SIN LOOPS + FICHA PROFESIONAL + UI MEJORADA
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import NavBar from '@/src/components/nav/NavBar';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { PDFUploadZone } from '@/src/presentation/features/books/components/PDFUpload/PDFUploadZone';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { BookRepository } from '@/src/infrastructure/repositories/books/BookRepository';
import { createClient } from '@/src/utils/supabase/client';
import type { Page } from '@/src/core/domain/types';
import { MultiSelectFromTable } from '@/src/presentation/features/books/components/BookMetadata/MultiSelectFromTable';
import { SelectFromTableAsync } from '@/src/presentation/features/books/components/BookMetadata/SelectFromTableAsync';

export function CreateBookPage() {
  const router = useRouter();
  const supabaseClient = createClient();
  const portadaInputRef = useRef<HTMLInputElement>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>(['']);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [selectedCategorias, setSelectedCategorias] = useState<(number | string)[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<(number | string)[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<(number | string)[]>([]);
  const [selectedValores, setSelectedValores] = useState<(number | string)[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number | string | null>(null);
  
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showFichaPreview, setShowFichaPreview] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [error, setError] = useState('');

  // ✅ CARGAR USUARIO - useCallback para evitar loops
  const loadUser = useCallback(async () => {
    if (userLoaded) return;
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
        setAutores([name]);
        setUserLoaded(true);
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }, [userLoaded, supabaseClient]);

  React.useEffect(() => {
    loadUser();
  }, [loadUser]);

  const addAutor = () => setAutores([...autores, '']);
  const removeAutor = (index: number) => setAutores(autores.filter((_, i) => i !== index));
  const updateAutor = (index: number, value: string) => {
    const newAutores = [...autores];
    newAutores[index] = value;
    setAutores(newAutores);
  };

  const addPersonaje = () => setPersonajes([...personajes, '']);
  const removePersonaje = (index: number) => setPersonajes(personajes.filter((_, i) => i !== index));
  const updatePersonaje = (index: number, value: string) => {
    const newPersonajes = [...personajes];
    newPersonajes[index] = value;
    setPersonajes(newPersonajes);
  };

  const handlePortadaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Imagen inválida');
      return;
    }
    setPortadaFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPortadaPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removePortada = useCallback(() => {
    setPortadaFile(null);
    setPortadaPreview(null);
    if (portadaInputRef.current) portadaInputRef.current.value = '';
  }, []);

  const handlePDFSelect = useCallback(async (file: File | null) => {
    if (!file) {
      setPdfFile(null);
      setExtractedPages([]);
      setShowPDFPreview(false);
      setPdfDimensions(null);
      return;
    }
    
    setPdfFile(file);
    setPdfError('');
    setExtractedPages([]);
    setIsExtractingPages(true);

    try {
      const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
      const result = await PDFExtractorService.extractPagesFromPDF(file);
      setExtractedPages(result.pages);
      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({ width: result.pageWidth, height: result.pageHeight });
      }
    } catch (err: any) {
      console.error('❌ Error:', err);
      setPdfError('Error al procesar PDF');
    } finally {
      setIsExtractingPages(false);
    }
  }, []);

  const validateForm = (): boolean => {
    if (!titulo.trim()) { setError('Título obligatorio'); return false; }
    if (!portadaFile) { setError('Portada obligatoria'); return false; }
    if (!descripcion.trim()) { setError('Descripción obligatoria'); return false; }
    if (autores.filter(a => a.trim()).length === 0) { setError('Al menos un autor'); return false; }
    if (selectedCategorias.length === 0) { setError('Al menos una categoría'); return false; }
    if (selectedGeneros.length === 0) { setError('Al menos un género'); return false; }
    if (!selectedNivel) { setError('Nivel obligatorio'); return false; }
    if (!pdfFile) { setPdfError('PDF obligatorio'); return false; }
    return true;
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      if (!validateForm()) { setIsLoading(false); return; }

      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user) { setError('Usuario no autenticado'); setIsLoading(false); return; }

      const bookId = crypto.randomUUID();
      const portadaResult = await BookImageService.uploadImage(portadaFile!, user.id, bookId, 'portada');
      if (!portadaResult.success || !portadaResult.url) { setError('Error al subir portada'); setIsLoading(false); return; }

      const { url: pdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(pdfFile!, user.id, bookId);
      if (pdfUploadError || !pdfUrl) { setPdfError(pdfUploadError || 'Error al subir PDF'); setIsLoading(false); return; }

      await BookRepository.create(user.id, {
        titulo,
        descripcion,
        portada: portadaResult.url,
        pdfUrl,
        autores: autores.filter(a => a.trim()),
        personajes: personajes.filter(p => p.trim()),
        categorias: selectedCategorias.map(v => Number(v)),
        generos: selectedGeneros.map(v => Number(v)),
        etiquetas: selectedEtiquetas.map(v => Number(v)),
        valores: selectedValores.map(v => Number(v)),
        nivel: selectedNivel ? Number(selectedNivel) : 1,
        pages: undefined
      });

      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }
      
      router.push(`/es/books/${bookId}/read`);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Error al crear el libro');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ RESOLVER METADATA PARA PREVIEW
  const getMetadataForPreview = useCallback(async () => {
    const metadata: any = {};
    
    try {
      if (selectedCategorias.length > 0) {
        const { data } = await supabaseClient.from('book_categories').select('name').in('id', selectedCategorias);
        metadata.categorias = data?.map(d => d.name) || [];
      }
      if (selectedGeneros.length > 0) {
        const { data } = await supabaseClient.from('book_genres').select('name').in('id', selectedGeneros);
        metadata.generos = data?.map(d => d.name) || [];
      }
      if (selectedValores.length > 0) {
        const { data } = await supabaseClient.from('book_values').select('name').in('id', selectedValores);
        metadata.valores = data?.map(d => d.name) || [];
      }
      if (selectedEtiquetas.length > 0) {
        const { data } = await supabaseClient.from('book_tags').select('name').in('id', selectedEtiquetas);
        metadata.etiquetas = data?.map(d => d.name) || [];
      }
      if (selectedNivel) {
        const { data } = await supabaseClient.from('book_levels').select('name').eq('id', selectedNivel).single();
        metadata.nivel = data?.name || '';
      }
    } catch (err) {
      console.error('Error resolving metadata:', err);
    }
    
    return metadata;
  }, [selectedCategorias, selectedGeneros, selectedValores, selectedEtiquetas, selectedNivel, supabaseClient]);

  // ============================================
  // PREVIEW PDF
  // ============================================
  if (showPDFPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <PDFPreviewMode
        pages={extractedPages}
        title={titulo}
        pdfDimensions={pdfDimensions}
        isLoading={isLoading}
        isSaveDisabled={!validateForm()}
        onClose={() => setShowPDFPreview(false)}
        onSave={handleSave}
      />
    );
  }

  // ============================================
  // PREVIEW FICHA PROFESIONAL
  // ============================================
  if (showFichaPreview) {
    const [metadata, setMetadata] = React.useState<any>({});
    
    React.useEffect(() => {
      getMetadataForPreview().then(setMetadata);
    }, []);

    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                  <span className="text-2xl">📖</span>
                </div>
                <h2 className="text-xl font-bold text-white">Ficha Literaria</h2>
              </div>
              <button 
                onClick={() => setShowFichaPreview(false)} 
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white backdrop-blur transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-5 gap-8">
              
              {/* PORTADA */}
              <div className="col-span-2">
                {portadaPreview ? (
                  <div className="relative group">
                    <img 
                      src={portadaPreview} 
                      alt={titulo} 
                      className="w-full rounded-xl shadow-2xl object-cover"
                      style={{ aspectRatio: '3/4' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ) : (
                  <div className="w-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center shadow-lg" style={{ aspectRatio: '3/4' }}>
                    <ImageIcon size={64} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="col-span-3 space-y-4">
                
                {/* Título y Autores */}
                <div className="bg-white rounded-xl p-5 shadow-lg">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{titulo || 'Sin título'}</h1>
                  {autores.filter(a => a.trim()).length > 0 && (
                    <p className="text-gray-600 text-base flex items-center gap-2">
                      <span className="text-purple-600">✍️</span>
                      {autores.filter(a => a.trim()).join(', ')}
                    </p>
                  )}
                </div>

                {/* Sinopsis */}
                {descripcion && (
                  <div className="bg-white rounded-xl p-5 shadow-lg">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Sinopsis</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{descripcion}</p>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Personajes */}
                  {personajes.filter(p => p.trim()).length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg col-span-2">
                      <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">👥 Personajes</h3>
                      <div className="flex flex-wrap gap-2">
                        {personajes.filter(p => p.trim()).map((p, i) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-xs font-medium shadow-sm">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías */}
                  {metadata.categorias?.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">📚 Categorías</h3>
                      <div className="flex flex-wrap gap-2">
                        {metadata.categorias.map((c: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-xs font-medium shadow-sm">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Géneros */}
                  {metadata.generos?.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-2">🎭 Géneros</h3>
                      <div className="flex flex-wrap gap-2">
                        {metadata.generos.map((g: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-full text-xs font-medium shadow-sm">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nivel */}
                  {metadata.nivel && (
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">📊 Nivel</h3>
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 rounded-full text-xs font-medium shadow-sm">
                        {metadata.nivel}
                      </span>
                    </div>
                  )}

                  {/* Valores */}
                  {metadata.valores?.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                      <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">💚 Valores</h3>
                      <div className="flex flex-wrap gap-2">
                        {metadata.valores.slice(0, 3).map((v: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-xs font-medium shadow-sm">
                            {v}
                          </span>
                        ))}
                        {metadata.valores.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{metadata.valores.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Etiquetas */}
                  {metadata.etiquetas?.length > 0 && (
                    <div className="bg-white rounded-xl p-4 shadow-lg col-span-2">
                      <h3 className="text-xs font-bold text-pink-600 uppercase tracking-wide mb-2">🏷️ Etiquetas</h3>
                      <div className="flex flex-wrap gap-2">
                        {metadata.etiquetas.map((e: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full text-xs font-medium shadow-sm">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // FORMULARIO MEJORADO
  // ============================================
  return (
    <>
      <NavBar />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" style={{ paddingTop: '60px', height: '100vh', overflow: 'auto' }}>
        <div className="container mx-auto p-4 max-w-6xl">
          
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📚 Crear Libro</h1>
              <p className="text-sm text-gray-600">Completa la información y sube el PDF</p>
            </div>
            <button 
              onClick={() => setShowFichaPreview(true)} 
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg transition-all"
            >
              <Eye size={16} />
              Ver Preview
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-red-700 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          {/* FICHA */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
            <div className="grid grid-cols-12 gap-6">
              
              {/* PORTADA */}
              <div className="col-span-3">
                <label className="block text-sm font-bold mb-2 text-gray-700">Portada *</label>
                {portadaPreview ? (
                  <div className="relative group">
                    <div className="rounded-lg overflow-hidden border-2 border-gray-300 shadow-md" style={{ aspectRatio: '3/4' }}>
                      <img src={portadaPreview} alt="Portada" className="w-full h-full object-cover" />
                    </div>
                    <button 
                      onClick={removePortada} 
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => portadaInputRef.current?.click()} 
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-indigo-500 transition-all flex flex-col items-center justify-center gap-3 p-6 group"
                    style={{ aspectRatio: '3/4' }}
                  >
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={28} className="text-indigo-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Subir Portada</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG</p>
                    </div>
                  </button>
                )}
                <input ref={portadaInputRef} type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
              </div>

              {/* INFO */}
              <div className="col-span-9 space-y-4">
                
                {/* Título + Descripción */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-700">Título *</label>
                    <input 
                      type="text" 
                      value={titulo} 
                      onChange={(e) => setTitulo(e.target.value)} 
                      placeholder="Ej: El Principito" 
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                  </div>
                  <div className="row-span-2">
                    <label className="block text-sm font-bold mb-2 text-gray-700">Descripción *</label>
                    <textarea 
                      value={descripcion} 
                      onChange={(e) => setDescripcion(e.target.value)} 
                      placeholder="Sinopsis del libro..." 
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all" 
                    />
                  </div>
                </div>

                {/* Autores + Personajes */}
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Autores */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-700">Autores *</label>
                      <button 
                        onClick={addAutor} 
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {autores.map((autor, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            type="text" 
                            value={autor} 
                            onChange={(e) => updateAutor(i, e.target.value)} 
                            placeholder={`Autor ${i + 1}`} 
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-all" 
                          />
                          <button 
                            onClick={() => removeAutor(i)} 
                            className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Personajes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-gray-700">Personajes</label>
                      <button 
                        onClick={addPersonaje} 
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {personajes.map((p, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            type="text" 
                            value={p} 
                            onChange={(e) => updatePersonaje(i, e.target.value)} 
                            placeholder={`Personaje ${i + 1}`} 
                            className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-all" 
                          />
                          <button 
                            onClick={() => removePersonaje(i)} 
                            className="px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* METADATA */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Clasificación</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Categorías *</label>
                      <MultiSelectFromTable table="book_categories" valueField="id" labelField="name" filterField="name" values={selectedCategorias} onChange={setSelectedCategorias} placeholder="..." maxItems={3} color="blue" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Géneros *</label>
                      <MultiSelectFromTable table="book_genres" valueField="id" labelField="name" filterField="name" values={selectedGeneros} onChange={setSelectedGeneros} placeholder="..." maxItems={3} color="purple" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Nivel *</label>
                      <SelectFromTableAsync table="book_levels" valueField="id" labelField="name" filterField="name" value={selectedNivel} onChange={setSelectedNivel} placeholder="..." color="indigo" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1 text-gray-700">Valores</label>
                      <MultiSelectFromTable table="book_values" valueField="id" labelField="name" filterField="name" values={selectedValores} onChange={setSelectedValores} placeholder="..." maxItems={5} color="green" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold mb-1 text-gray-700">Etiquetas</label>
                      <MultiSelectFromTable table="book_tags" valueField="id" labelField="name" filterField="name" values={selectedEtiquetas} onChange={setSelectedEtiquetas} placeholder="..." maxItems={5} color="pink" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📤 Archivo PDF</h3>
              {extractedPages.length > 0 && (
                <button 
                  onClick={() => setShowPDFPreview(true)} 
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-md transition-all"
                >
                  <Eye size={16} />
                  Ver Flipbook ({extractedPages.length} págs)
                </button>
              )}
            </div>
            <PDFUploadZone onFileSelect={handlePDFSelect} currentFile={pdfFile} error={pdfError} />
            {isExtractingPages && (
              <div className="mt-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
                <Loader2 size={24} className="animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Procesando PDF...</p>
              </div>
            )}
          </div>

          {/* GUARDAR */}
          <button 
            onClick={handleSave} 
            disabled={isLoading} 
            className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold text-base flex items-center justify-center gap-3 shadow-2xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Guardando libro...
              </>
            ) : (
              <>
                💾 Guardar Libro
              </>
            )}
          </button>

        </div>
      </div>
    </>
  );
}

export default CreateBookPage;