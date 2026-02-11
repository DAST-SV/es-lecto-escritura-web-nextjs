/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormViewMultilang.tsx
 * Formulario de libro — Contenido (edición) + Ficha Literaria (preview espectacular)
 * Responsive: mobile-first, stack vertical → horizontal en md+
 */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Save, Upload, AlertCircle, Camera, X, Eye,
  ArrowLeft, Star, Check, Users, Tag,
  PenTool, Sparkles, FileText, BookMarked, BookOpen,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { HomeBackground } from '@/src/presentation/features/home';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { AuthorSelector } from '@/src/presentation/features/books/components/Inputs/AuthorSelector';
import { CharacterInput } from '@/src/presentation/features/books/components/Inputs/CharacterInput';
import { BookFormSkeleton } from '@/src/presentation/features/books/components/BookForm/BookFormSkeleton';
import { CatalogSelector } from '@/src/presentation/features/books/components/Selectors/CatalogSelector';
import { useBookFormMultilang } from '@/src/presentation/features/books/hooks/useBookFormMultilang';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { Toaster } from 'react-hot-toast';

// Fuente divertida/redondeada — Nunito está cargada via Google Fonts, disponible en todos los dispositivos
// ('Nunito'/'Varela Round'/'Comfortaa' no existe en iOS/Android → caía a serif genérico feo)
const F = { fontFamily: "'Nunito', 'Varela Round', 'Comfortaa', sans-serif" };
type FormTab = 'ficha' | 'contenido';
type ClasifTab = 'category' | 'level' | 'genres' | 'tags' | 'values';

// ⚠️ Field DEBE estar FUERA del componente para evitar que React lo desmonte
// en cada render (lo que cancela el foco después de cada carácter)
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-500 mb-1" style={F}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

interface Props { bookId?: string; }

export function BookFormViewMultilang({ bookId }: Props) {
  const router = useRouter();
  const { t: tRaw, loading: tLoading } = useSupabaseTranslations('books_form');
  // t() devuelve [key] cuando la traducción no existe — useCallback evita re-renders en inputs
  const t = useCallback((key: string, fallback?: string): string => {
    const val = tRaw(key);
    return val.startsWith('[') && val.endsWith(']') ? (fallback ?? val) : val;
  }, [tRaw]);
  const [formTab, setFormTab] = useState<FormTab>('contenido');
  const [clasifTab, setClasifTab] = useState<ClasifTab>('category');
  const [coverZoom, setCoverZoom] = useState(false);
  const [readMoreModal, setReadMoreModal] = useState<{ type: 'description' | 'summary'; text: string } | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const langTabsRef = useRef<HTMLDivElement>(null);

  const {
    locale, isLoadingBook, isLoading, error, isEditMode,
    activeLanguages, activeTab, setActiveTab,
    translations, translationProgress, currentTranslation,
    updateTranslation, setPrimaryLanguage,
    selectedAuthors, setSelectedAuthors, currentUser,
    portadaPreview, setPortadaPreview,
    selectedCategoryId, setSelectedCategoryId,
    selectedLevelId, setSelectedLevelId,
    selectedGeneros, setSelectedGeneros,
    selectedEtiquetas, setSelectedEtiquetas,
    selectedValores, setSelectedValores,
    characters, setCharacters,
    categorias, niveles, generos, etiquetasList, valoresList,
    pdfFile, currentPdfUrl, hasPDF,
    extractedPages, pdfDimensions, isExtractingPages, pdfError,
    showPreview, setShowPreview, extractPagesFromExistingPdf,
    handlePortadaChange, handlePDFChange, handleSave,
    isFormValid, shouldShowPreview,
  } = useBookFormMultilang({ bookId });

  const togGenre    = (id: string) => setSelectedGeneros(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togTag      = (id: string) => setSelectedEtiquetas(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togValue    = (id: string) => setSelectedValores(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const togCategory = (id: string) => setSelectedCategoryId(selectedCategoryId === id ? null : id);
  const togLevel    = (id: string) => setSelectedLevelId(selectedLevelId === id ? null : id);

  // Título para el lector: idioma activo → fallback al primer idioma con título
  const readerTitle = currentTranslation.title.trim()
    || Object.values(translations).find(t => t?.title?.trim())?.title
    || '';

  // Leer PDF al subir — siempre disponible si hay páginas extraídas
  // key={activeTab} fuerza remount completo al cambiar idioma → limpia estado interno de TTS y FlipBook
  if (showPreview && extractedPages.length > 0 && pdfDimensions)
    return <PDFPreviewMode key={activeTab} pages={extractedPages} title={readerTitle}
      pdfDimensions={pdfDimensions} onClose={() => setShowPreview(false)} language={activeTab as any} />;

  if (isLoadingBook || tLoading)
    return (
      <UnifiedLayout className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300" mainClassName="pt-0" backgroundComponent={<HomeBackground />}>
        <BookFormSkeleton />
      </UnifiedLayout>
    );

  const clasifCounts: Record<ClasifTab, number> = {
    category: selectedCategoryId ? 1 : 0, level: selectedLevelId ? 1 : 0,
    genres: selectedGeneros.length, tags: selectedEtiquetas.length, values: selectedValores.length,
  };

  const inputCls = "w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-1 focus:ring-yellow-100 focus:outline-none bg-white text-gray-700 placeholder:text-gray-300";

  return (
    <UnifiedLayout className="bg-gradient-to-b from-blue-400 via-blue-300 to-green-300" mainClassName="pt-0" backgroundComponent={<HomeBackground />}>
      <Toaster position="top-right" />

      {/* ═══════════════════════════════════════════
          HEADER: [← Volver] [Tabs centrados] [Guardar]
      ═══════════════════════════════════════════ */}
      <div className="px-2 pt-2 pb-2 flex items-center gap-1.5 md:px-3 md:pt-3 md:gap-2">
        {/* Volver */}
        <button onClick={() => router.push(`/${locale}/my-world`)}
          className="flex-shrink-0 p-1.5 bg-white/80 hover:bg-white rounded-lg shadow-sm border border-yellow-200/60 transition-all">
          <ArrowLeft size={14} strokeWidth={1.5} className="text-gray-800" />
        </button>

        {/* Tabs — crecen al centro */}
        <div className="flex-1 flex bg-white/25 rounded-xl p-0.5 gap-0.5">
          {/* Tab Contenido */}
          <button onClick={() => setFormTab('contenido')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all md:text-xs md:gap-1.5 ${
              formTab === 'contenido' ? 'bg-white text-gray-700 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/15'
            }`} style={F}>
            <FileText size={11} strokeWidth={1.5} />
            <span>Contenido</span>
            {translationProgress.completed > 0 && (
              <span className={`hidden sm:inline text-[9px] px-1 rounded-full font-bold ${formTab === 'contenido' ? 'bg-yellow-100 text-yellow-700' : 'bg-white/25 text-white'}`}>
                {translationProgress.completed}/{translationProgress.total}
              </span>
            )}
          </button>
          {/* Tab Ficha Literaria */}
          <button onClick={() => setFormTab('ficha')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all md:text-xs md:gap-1.5 ${
              formTab === 'ficha' ? 'bg-white text-gray-700 shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/15'
            }`} style={F}>
            <BookMarked size={11} strokeWidth={1.5} />
            <span>Ficha</span>
            <span className={`text-[9px] px-1 rounded-full font-black uppercase tracking-wide ${formTab === 'ficha' ? 'bg-yellow-100 text-yellow-700' : 'bg-white/25 text-white'}`}>
              {activeTab}
            </span>
          </button>
        </div>

        {/* Guardar */}
        <div className="flex-shrink-0">
          <button onClick={() => !isLoading && isFormValid && setShowSaveConfirm(true)} disabled={!isFormValid || isLoading}
            className="px-2.5 py-1.5 bg-white text-gray-700 font-bold rounded-lg shadow-sm border border-yellow-300 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-[11px] md:px-3 md:gap-1.5 md:text-xs"
            style={F}>
            {isLoading
              ? <><Loader2 size={12} strokeWidth={1.5} className="animate-spin" /><span className="hidden sm:inline">{t('btn_saving', 'Guardando...')}</span></>
              : <><Save size={12} strokeWidth={1.5} /><span>{isEditMode ? t('btn_save_changes', 'Guardar') : t('btn_save', 'Guardar')}</span></>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-2 mb-2 px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 md:mx-3">
          <AlertCircle size={12} strokeWidth={1.5} className="text-red-400 flex-shrink-0" />
          <p className="text-[10px] text-red-600" style={F}>{error}</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TAB CONTENIDO — mobile: stack vertical / md: layout horizontal
      ═══════════════════════════════════════════ */}
      {formTab === 'contenido' && (
        <div className="px-2 pb-6 space-y-2 md:px-3">

          {/* ── ROW 1: en móvil stack, en desktop flex ── */}
          <div className="flex flex-col gap-2 md:flex-row md:items-start">

            {/* Panel principal: idioma tabs + campos */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-yellow-200/50 overflow-hidden">
              {/* Language tabs — scroll horizontal con flechas cuando hay 3+ idiomas */}
              <div className="relative flex items-stretch border-b border-gray-100 bg-gray-50/50">
                {/* Flecha izquierda — solo si hay overflow */}
                {activeLanguages.length > 2 && (
                  <button
                    onClick={() => langTabsRef.current?.scrollBy({ left: -100, behavior: 'smooth' })}
                    className="flex-shrink-0 px-1.5 bg-gray-50/80 hover:bg-white border-r border-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                    aria-label="Idiomas anteriores">
                    <ChevronLeft size={13} strokeWidth={2} />
                  </button>
                )}
                {/* Tabs con scroll */}
                <div
                  ref={langTabsRef}
                  className="flex flex-1 overflow-x-auto"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {activeLanguages.map(lang => {
                    const tr = translations[lang.code];
                    const ok = tr?.title && tr?.description;
                    return (
                      <button key={lang.code} onClick={() => setActiveTab(lang.code)}
                        className={`flex-shrink-0 flex-1 min-w-[80px] flex items-center justify-center gap-1 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                          activeTab === lang.code
                            ? 'text-gray-800 border-b-2 border-yellow-400 bg-white'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-white/60'
                        }`} style={F}>
                        {lang.flagEmoji && <span className="text-sm leading-none">{lang.flagEmoji}</span>}
                        <span>{lang.nativeName || lang.name || lang.code.toUpperCase()}</span>
                        {tr?.isPrimary && <Star size={9} strokeWidth={1.5} className="text-amber-400 fill-amber-400" />}
                        {ok && <Check size={9} strokeWidth={1.5} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
                {/* Flecha derecha */}
                {activeLanguages.length > 2 && (
                  <button
                    onClick={() => langTabsRef.current?.scrollBy({ left: 100, behavior: 'smooth' })}
                    className="flex-shrink-0 px-1.5 bg-gray-50/80 hover:bg-white border-l border-gray-100 text-gray-400 hover:text-gray-700 transition-all"
                    aria-label="Más idiomas">
                    <ChevronRight size={13} strokeWidth={2} />
                  </button>
                )}
              </div>

              {currentTranslation && (
                <div className="p-2.5 md:p-3">
                  {/* Primary toggle */}
                  <div className="flex items-center justify-between px-2 py-1 bg-amber-50/60 rounded-lg border border-amber-100 mb-3">
                    <span className="text-[10px] text-amber-700" style={F}>
                      {currentTranslation.isPrimary ? '⭐ ' + (t('primary_language') || 'Idioma principal') : t('set_primary_language') || 'Establecer como principal'}
                    </span>
                    {!currentTranslation.isPrimary && (
                      <button onClick={() => setPrimaryLanguage(activeTab)}
                        className="px-2 py-0.5 text-[10px] rounded font-bold bg-white hover:bg-amber-50 text-amber-600 border border-amber-200 transition-all" style={F}>
                        {t('btn_set_primary') || 'Establecer'}
                      </button>
                    )}
                  </div>

                  {/* ── FILA 1: en móvil stack, en sm+ grid 2 cols ── */}
                  <div className="flex flex-col gap-2.5 mb-3 sm:grid sm:grid-cols-2 sm:gap-3">
                    {/* Título + Subtítulo */}
                    <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-2.5 space-y-2.5">
                      <Field label={t('field_title') || 'Título'} required>
                        <input type="text" value={currentTranslation.title}
                          onChange={e => updateTranslation(activeTab, 'title', e.target.value)}
                          placeholder={t('placeholder_title')?.replace('{language}', activeLanguages.find(l => l.code === activeTab)?.name || activeTab) || 'Título del libro'}
                          className={inputCls} style={F} />
                      </Field>
                      <Field label={t('field_subtitle') || 'Subtítulo'}>
                        <input type="text" value={currentTranslation.subtitle}
                          onChange={e => updateTranslation(activeTab, 'subtitle', e.target.value)}
                          placeholder={t('placeholder_subtitle') || 'Subtítulo (opcional)'}
                          className={inputCls} style={F} />
                      </Field>
                    </div>

                    {/* Personajes */}
                    <div>
                      <CharacterInput characters={characters} onChange={setCharacters}
                        label={t('field_characters', 'Personajes')}
                        maxCharacters={20}
                        roleMainLabel={t('role_main', 'Principal')}
                        roleSecondaryLabel={t('role_secondary', 'Secundario')}
                        roleSupportingLabel={t('role_supporting', 'De apoyo')}
                        placeholderText={t('character_placeholder', 'Nombre del personaje...')}
                        maxReachedText={t('character_max_reached', 'Máximo alcanzado')}
                        hintText={t('character_hint', 'Agrega los personajes principales')} />
                    </div>
                  </div>

                  {/* ── FILA 2: Descripción + Resumen — en móvil stack, en sm+ grid 2 cols ── */}
                  <div className="bg-gray-50/60 rounded-xl border border-gray-100 p-2.5 flex flex-col gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3">
                    <Field label={t('field_description') || 'Descripción'} required>
                      <textarea value={currentTranslation.description}
                        onChange={e => updateTranslation(activeTab, 'description', e.target.value)}
                        placeholder={t('placeholder_description') || 'Descripción del libro'}
                        rows={4} className={`${inputCls} resize-y min-h-[80px]`} style={F} />
                    </Field>
                    <Field label={t('field_summary') || 'Resumen corto'}>
                      <textarea value={currentTranslation.summary}
                        onChange={e => updateTranslation(activeTab, 'summary', e.target.value)}
                        placeholder={t('placeholder_summary') || 'Resumen breve'}
                        rows={4} className={`${inputCls} resize-y min-h-[80px]`} style={F} />
                    </Field>
                  </div>

                </div>
              )}
            </div>

            {/* Columna derecha: Portada + PDF
                móvil: fila horizontal lado a lado
                md: columna vertical sticky */}
            <div className="flex gap-2 md:flex-col md:w-40 md:flex-shrink-0 md:sticky md:top-[68px] md:self-start md:space-y-2 md:gap-0">

              {/* Portada */}
              <div className="flex-1 md:flex-none bg-white rounded-2xl shadow-sm border border-yellow-200/50 overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1">
                  <Camera size={11} strokeWidth={1.5} className="text-gray-800" />
                  <span className="text-[11px] font-bold text-gray-600" style={F}>{t('cover_label', 'Portada')}</span>
                  <span className="ml-auto text-[9px] font-black uppercase bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{activeTab}</span>
                </div>
                <div className="p-2 flex flex-col items-center">
                  {portadaPreview ? (
                    <div className="relative group">
                      <img src={portadaPreview} alt="portada"
                        className="w-full max-w-[120px] aspect-[2/3] object-cover rounded-lg shadow-sm border border-gray-200 md:w-[120px]" />
                      <button onClick={() => setPortadaPreview(null)}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-gray-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow">
                        <X size={9} strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full">
                      <div className="w-full aspect-[2/3] bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-yellow-400 hover:bg-yellow-50/20 transition-all group gap-1.5 max-w-[120px] mx-auto md:max-w-none">
                        <Camera size={20} strokeWidth={1.5} className="text-gray-300 group-hover:text-yellow-500" />
                        <span className="text-[9px] text-gray-400 group-hover:text-yellow-600 text-center px-2 font-bold" style={F}>Subir portada</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                    </label>
                  )}
                  {portadaPreview && (
                    <label className="cursor-pointer mt-1.5 w-full">
                      <div className="border border-dashed border-gray-200 rounded-lg py-1 flex items-center justify-center gap-1 hover:border-yellow-400 transition-all">
                        <Upload size={10} className="text-gray-400" />
                        <span className="text-[9px] text-gray-400" style={F}>Cambiar</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* PDF */}
              <div className="flex-1 md:flex-none bg-white rounded-2xl shadow-sm border border-yellow-200/50 overflow-hidden">
                <div className="px-2.5 py-1.5 border-b border-gray-100 flex items-center gap-1">
                  <FileText size={11} strokeWidth={1.5} className="text-gray-800" />
                  <span className="text-[11px] font-bold text-gray-600" style={F}>PDF<span className="text-red-400 ml-0.5">*</span></span>
                  <span className="ml-auto text-[9px] font-black uppercase bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{activeTab}</span>
                </div>
                <div className="p-2">
                  {hasPDF && !pdfFile ? (
                    <div className="space-y-1.5">
                      <div className="px-2 py-1.5 bg-green-50 border border-green-200/60 rounded-lg">
                        <p className="text-[10px] font-bold text-green-700" style={F}>{t('pdf_loaded', '✓ PDF cargado')}</p>
                      </div>
                      {extractedPages.length > 0 ? (
                        <button onClick={() => setShowPreview(true)}
                          className="w-full px-2 py-1.5 bg-black hover:bg-gray-900 text-yellow-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-black" style={F}>
                          <Eye size={11} strokeWidth={1.5} />Leer ({extractedPages.length} págs)
                        </button>
                      ) : isExtractingPages ? (
                        <div className="flex items-center justify-center gap-1 py-1.5">
                          <Loader2 size={12} className="animate-spin text-yellow-500" />
                          <p className="text-[9px] text-gray-400" style={F}>Procesando...</p>
                        </div>
                      ) : currentPdfUrl ? (
                        <button onClick={() => extractPagesFromExistingPdf(activeTab, currentPdfUrl)}
                          className="w-full px-2 py-1.5 bg-black hover:bg-gray-900 text-yellow-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-black" style={F}>
                          <Eye size={11} strokeWidth={1.5} />Leer libro
                        </button>
                      ) : null}
                      <label className="block cursor-pointer">
                        <div className="border border-dashed border-gray-200 rounded-lg py-1 flex items-center justify-center gap-1 hover:border-yellow-400 transition-all">
                          <Upload size={10} strokeWidth={1.5} className="text-gray-400" />
                          <span className="text-[9px] text-gray-400" style={F}>Cambiar PDF</span>
                        </div>
                        <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                      </label>
                    </div>
                  ) : pdfFile ? (
                    <div className="space-y-1.5">
                      <div className="flex items-start gap-1.5 px-2 py-1.5 bg-green-50 border border-green-100 rounded-lg">
                        <FileText size={11} strokeWidth={1.5} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-gray-700 truncate" style={F}>{pdfFile.name}</p>
                          <p className="text-[8px] text-gray-400">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        <button onClick={() => updateTranslation(activeTab, 'pdfFile', null)}
                          className="p-0.5 hover:bg-red-50 rounded transition-colors flex-shrink-0">
                          <X size={11} strokeWidth={1.5} className="text-red-400" />
                        </button>
                      </div>
                      {extractedPages.length > 0 ? (
                        <button onClick={() => setShowPreview(true)}
                          className="w-full px-2 py-1.5 bg-black hover:bg-gray-900 text-yellow-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border border-black" style={F}>
                          <Eye size={11} strokeWidth={1.5} />Leer ({extractedPages.length} págs)
                        </button>
                      ) : isExtractingPages ? (
                        <div className="flex items-center justify-center gap-1 py-1.5">
                          <Loader2 size={12} className="animate-spin text-yellow-500" />
                          <p className="text-[9px] text-gray-400" style={F}>Procesando...</p>
                        </div>
                      ) : (
                        <div className="text-center py-1">
                          <p className="text-[8px] text-gray-300" style={F}>Guardá el libro para leerlo</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 flex flex-col items-center gap-1 hover:border-yellow-400 hover:bg-yellow-50/20 transition-all">
                        <Upload size={16} strokeWidth={1.5} className="text-gray-300" />
                        <span className="text-[9px] text-gray-400 text-center font-bold" style={F}>Subir PDF</span>
                        <span className="text-[8px] text-gray-300" style={F}>Máx. 50MB</span>
                      </div>
                      <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                    </label>
                  )}
                  {pdfError && <p className="text-[9px] text-red-500 mt-1" style={F}>{pdfError}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: Autores + Clasificación — en móvil stack, en md flex ── */}
          <div className="flex flex-col gap-2 md:flex-row md:items-start">

            {/* Autores — ancho completo en móvil, fijo en md */}
            <div className="w-full bg-white rounded-2xl shadow-sm border border-yellow-200/50 overflow-visible md:w-72 md:flex-shrink-0">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
                <Users size={12} strokeWidth={1.5} className="text-gray-800" />
                <span className="text-xs font-bold text-gray-700" style={F}>{t('section_authors') || 'Autores'}</span>
                <span className="text-red-400 text-[10px] ml-0.5">*</span>
              </div>
              <div className="p-3">
                <AuthorSelector selectedAuthors={selectedAuthors} onChange={setSelectedAuthors} currentUser={currentUser} />
              </div>
            </div>

            {/* Clasificación con sub-tabs — ancho completo */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-yellow-200/50 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-1.5">
                <Tag size={12} strokeWidth={1.5} className="text-gray-800" />
                <span className="text-xs font-bold text-gray-700" style={F}>{t('section_classification') || 'Clasificación'}</span>
              </div>
              {/* Sub-tab bar — scroll horizontal en móvil */}
              <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/40" style={{ scrollbarWidth: 'none' }}>
                {([
                  { key: 'category' as ClasifTab, label: t('field_category') || 'Cat.',      max: 1,  badgeCls: 'bg-indigo-500 text-white' },
                  { key: 'level'    as ClasifTab, label: t('field_level')    || 'Nivel',      max: 1,  badgeCls: 'bg-amber-500 text-white'  },
                  { key: 'genres'   as ClasifTab, label: t('field_genres')   || 'Géneros',    max: 5,  badgeCls: 'bg-rose-500 text-white'   },
                  { key: 'tags'     as ClasifTab, label: t('field_tags')     || 'Etiquetas',  max: 10, badgeCls: 'bg-sky-500 text-white'    },
                  { key: 'values'   as ClasifTab, label: t('field_values')   || 'Valores',    max: 5,  badgeCls: 'bg-emerald-500 text-white'},
                ]).map(ct => (
                  <button key={ct.key} onClick={() => setClasifTab(ct.key)}
                    className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-2 text-[10px] font-bold transition-all whitespace-nowrap md:px-3 md:text-[11px] ${
                      clasifTab === ct.key
                        ? 'text-gray-800 border-b-2 border-yellow-400 bg-white'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-white/60'
                    }`} style={F}>
                    {ct.label}
                    {clasifCounts[ct.key] > 0 && (
                      <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold ${ct.badgeCls}`}>
                        {clasifCounts[ct.key]}{ct.max > 1 ? `/${ct.max}` : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3">
                {clasifTab === 'category' && <CatalogSelector catalogType="categories" selectedIds={selectedCategoryId ? [selectedCategoryId] : []} onToggle={togCategory} label={t('field_category') || 'Categoría'} color="indigo" required singleSelect maxSelections={1} />}
                {clasifTab === 'level'    && <CatalogSelector catalogType="levels"     selectedIds={selectedLevelId    ? [selectedLevelId]    : []} onToggle={togLevel}    label={t('field_level')    || 'Nivel'}       color="amber"   required singleSelect maxSelections={1} />}
                {clasifTab === 'genres'   && <CatalogSelector catalogType="genres"     selectedIds={selectedGeneros}                                 onToggle={togGenre}    label={t('field_genres')   || 'Géneros'}     color="rose"    maxSelections={5} />}
                {clasifTab === 'tags'     && <CatalogSelector catalogType="tags"       selectedIds={selectedEtiquetas}                               onToggle={togTag}      label={t('field_tags')     || 'Etiquetas'}   color="sky"     maxSelections={10} />}
                {clasifTab === 'values'   && <CatalogSelector catalogType="values"     selectedIds={selectedValores}                                 onToggle={togValue}    label={t('field_values')   || 'Valores'}     color="emerald" maxSelections={5} />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TAB FICHA LITERARIA
          Preview — full width en móvil, max-w-2xl en desktop
      ═══════════════════════════════════════════ */}
      {formTab === 'ficha' && (
        <div className="px-2 pb-4 flex justify-center md:px-3" style={{ minHeight: 'calc(100vh - 120px)' }}>
          {shouldShowPreview ? (
            <div className="w-full max-w-2xl flex flex-col" style={{ minHeight: 'calc(100vh - 132px)' }}>
              {/* ══ FICHA LITERARIA ══ */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col flex-1" style={{ border: '2px solid #fde047' }}>

                {/* Banda superior + badge idioma */}
                <div className="h-1.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 relative">
                  <div className="absolute right-2 -bottom-3">
                    <span className="text-[8px] font-black leading-none px-1 py-0.5 rounded-b bg-yellow-400/90 text-yellow-900 uppercase tracking-wide">
                      {activeTab.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* ══ ROW 1: portada | clasificaciones ══
                    móvil: portada w-1/4, clasif resto
                    md: portada w-[18%] */}
                <div className="flex gap-0 px-3 pt-4 pb-2">

                  {/* Portada */}
                  <div className="w-1/4 flex-shrink-0 pr-3 md:w-[18%]">
                    {portadaPreview ? (
                      <button onClick={() => setCoverZoom(true)} className="block w-full group focus:outline-none relative">
                        <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-yellow-400 via-orange-300 to-pink-400 opacity-60 blur-[3px]" />
                        <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-white">
                          <img src={portadaPreview} alt="portada" className="w-full aspect-[2/3] object-cover group-hover:brightness-90 transition-all" />
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <span className="bg-black/40 rounded-full p-1.5"><Eye size={14} strokeWidth={1.5} className="text-white" /></span>
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full aspect-[2/3] rounded-lg border-2 border-dashed border-yellow-200 bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50 flex flex-col items-center justify-center gap-1">
                        <BookOpen size={16} strokeWidth={1} className="text-yellow-300" />
                        <span className="text-[7px] text-yellow-400 font-bold px-1 text-center" style={F}>Sin portada</span>
                      </div>
                    )}
                  </div>

                  {/* Título, autores y clasificaciones */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">

                    {/* Título + subtítulo */}
                    <div>
                      {currentTranslation.title
                        ? <h2 className="text-sm font-black text-gray-900 leading-tight" style={F}>{currentTranslation.title}</h2>
                        : <p className="text-xs text-gray-300 italic" style={F}>Sin título</p>}
                      {currentTranslation.subtitle && (
                        <p className="text-[10px] text-gray-500 leading-snug mt-0.5" style={F}>{currentTranslation.subtitle}</p>
                      )}
                    </div>

                    {/* Autores */}
                    {selectedAuthors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedAuthors.map(a => (
                          <div key={a.userId} className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-0.5">
                            {a.avatarUrl
                              ? <img src={a.avatarUrl} alt={a.displayName} className="w-3 h-3 rounded-full object-cover" />
                              : <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-[7px] font-bold">{a.displayName.charAt(0).toUpperCase()}</div>}
                            <span className="text-[9px] text-gray-700 font-bold" style={F}>{a.displayName}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Nivel + Categoría + Géneros */}
                    <div className="flex flex-wrap gap-1">
                      {selectedLevelId && niveles.find(n => n.id === selectedLevelId) && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded-full text-[9px] font-bold border border-amber-200" style={F}>
                          📚 {niveles.find(n => n.id === selectedLevelId)?.name}
                        </span>
                      )}
                      {selectedCategoryId && categorias.find(c => c.id === selectedCategoryId) && (
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-bold border border-indigo-200" style={F}>
                          {categorias.find(c => c.id === selectedCategoryId)?.name}
                        </span>
                      )}
                      {selectedGeneros.map(gid => {
                        const gen = generos.find(g => g.id === gid);
                        return gen ? <span key={gid} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[9px] font-bold border border-rose-200" style={F}>🎭 {gen.name}</span> : null;
                      })}
                    </div>

                    {/* Etiquetas */}
                    {selectedEtiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedEtiquetas.map(tid => {
                          const tag = etiquetasList.find(tg => tg.id === tid);
                          return tag ? <span key={tid} className="px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded-full text-[9px] font-bold border border-sky-200" style={F}># {tag.name}</span> : null;
                        })}
                      </div>
                    )}

                    {/* Valores educativos */}
                    {selectedValores.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedValores.map(vid => {
                          const vl = valoresList.find(v => v.id === vid);
                          return vl ? <span key={vid} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold border border-emerald-200" style={F}>✦ {vl.name}</span> : null;
                        })}
                      </div>
                    )}

                    {/* Personajes */}
                    {characters.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {characters.map((ch, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            ch.role === 'main' ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : ch.role === 'secondary' ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`} style={F}>
                            {ch.role === 'main' ? '⭐' : ch.role === 'secondary' ? '◆' : '○'} {ch.name}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                </div>

                {/* ══ ROW 2: Descripción — burbuja gris ══ */}
                {currentTranslation.description && (
                  <div className="px-3 pb-2 border-t border-gray-100 pt-2">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1" style={F}>Descripción</p>
                      <p className="text-[11px] text-gray-700 leading-relaxed md:text-[10px]" style={F}>
                        {currentTranslation.description.length > 500
                          ? <>{currentTranslation.description.slice(0, 500)}…<button onClick={() => setReadMoreModal({ type: 'description', text: currentTranslation.description })} className="text-yellow-600 font-bold hover:underline ml-0.5" style={F}>leer más</button></>
                          : currentTranslation.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* ══ ROW 3: Resumen — burbuja amarilla ══ */}
                {currentTranslation.summary && (
                  <div className="px-3 pb-3 border-t border-yellow-100 pt-2">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-3 py-2.5">
                      <p className="text-[9px] text-yellow-700 font-black uppercase tracking-widest mb-1" style={F}>✨ Resumen</p>
                      <p className="text-[11px] text-gray-700 italic leading-relaxed md:text-[10px]" style={F}>
                        {currentTranslation.summary.length > 500
                          ? <>{currentTranslation.summary.slice(0, 500)}…<button onClick={() => setReadMoreModal({ type: 'summary', text: currentTranslation.summary })} className="text-yellow-600 font-bold hover:underline ml-0.5 not-italic" style={F}>leer más</button></>
                          : currentTranslation.summary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Banda inferior */}
                <div className="mt-auto h-1.5 bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400" />
              </div>

              {/* Modal zoom portada */}
              {coverZoom && portadaPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setCoverZoom(false)}>
                  <div className="relative max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                    <img src={portadaPreview} alt="portada" className="w-full rounded-2xl shadow-2xl border-2 border-yellow-300 object-contain max-h-[80vh]" />
                    <button onClick={() => setCoverZoom(false)} className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 hover:bg-gray-50 transition-all">
                      <X size={14} strokeWidth={1.5} className="text-gray-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* Modal leer más */}
              {readMoreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setReadMoreModal(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-yellow-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400" />
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-black text-gray-700 uppercase tracking-widest" style={F}>
                        {readMoreModal.type === 'description' ? 'Descripción' : '✨ Resumen'}
                      </p>
                      <button onClick={() => setReadMoreModal(null)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={14} strokeWidth={1.5} className="text-gray-500" />
                      </button>
                    </div>
                    <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                      <p className={`text-sm text-gray-700 leading-relaxed ${readMoreModal.type === 'summary' ? 'italic' : ''}`} style={F}>
                        {readMoreModal.text}
                      </p>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 w-full">
              <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center">
                <BookOpen size={32} strokeWidth={1} className="text-white/50" />
              </div>
              <p className="text-white/70 text-sm font-black text-center" style={F}>¡Aquí verás la ficha de tu libro!</p>
              <p className="text-white/40 text-xs text-center max-w-xs" style={F}>Empieza llenando los datos en la pestaña Contenido y la ficha aparecerá aquí automáticamente.</p>
              <button onClick={() => setFormTab('contenido')}
                className="mt-2 px-5 py-2 bg-white/25 hover:bg-white/35 text-white text-xs font-bold rounded-xl transition-all border border-white/30 shadow-sm" style={F}>
                Ir a Contenido →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          OVERLAY DE GUARDADO — bloquea UI durante el proceso
      ═══════════════════════════════════════════ */}
      {isLoading && (
        <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 border border-yellow-200 mx-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-yellow-200" />
              <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-sm font-black text-gray-800" style={F}>
              {isEditMode ? 'Guardando cambios...' : 'Creando libro...'}
            </p>
            <p className="text-[11px] text-gray-400 text-center" style={F}>
              Por favor espera, no cierres esta ventana
            </p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MODAL CONFIRMACIÓN GUARDAR
      ═══════════════════════════════════════════ */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSaveConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs border border-yellow-200 overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400" />
            <div className="px-5 py-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                <Save size={18} strokeWidth={1.5} className="text-yellow-600" />
              </div>
              <h3 className="text-sm font-black text-gray-800 mb-1" style={F}>
                {isEditMode ? '¿Guardar cambios?' : '¿Guardar libro?'}
              </h3>
              <p className="text-[11px] text-gray-400" style={F}>Esta acción no se puede deshacer.</p>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setShowSaveConfirm(false)}
                className="flex-1 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all" style={F}>
                Cancelar
              </button>
              <button onClick={() => { setShowSaveConfirm(false); handleSave(); }}
                className="flex-1 px-3 py-2 text-xs font-bold text-gray-800 bg-yellow-300 hover:bg-yellow-400 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm" style={F}>
                <Save size={13} strokeWidth={1.5} />
                {isEditMode ? 'Guardar cambios' : 'Guardar libro'}
              </button>
            </div>
            <div className="h-1 bg-gradient-to-r from-pink-400 via-orange-400 to-yellow-400" />
          </div>
        </div>
      )}
    </UnifiedLayout>
  );
}
