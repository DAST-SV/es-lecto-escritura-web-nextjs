/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormViewMultilang.tsx
 * Formulario de libro con soporte MULTI-IDIOMA
 * Diseño suave y limpio — paleta clara, mucho espacio, agradable para el escritor
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Save, Upload, AlertCircle, BookOpen, Tag, Camera, X, Eye, ArrowLeft,
  Languages, Star, Check, Heart, Users, PenTool, Sparkles
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

const FONT = { fontFamily: 'Comic Sans MS, cursive' };

interface BookFormViewMultilangProps {
  bookId?: string;
}

export function BookFormViewMultilang({ bookId }: BookFormViewMultilangProps) {
  const router = useRouter();
  const { t, loading: translationsLoading } = useSupabaseTranslations('books_form');

  const {
    locale,
    isLoadingBook,
    isLoading,
    error,
    isEditMode,
    activeLanguages,
    activeTab,
    setActiveTab,
    translations,
    translationProgress,
    currentTranslation,
    updateTranslation,
    setPrimaryLanguage,
    selectedAuthors,
    setSelectedAuthors,
    currentUser,
    portadaPreview,
    setPortadaPreview,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedLevelId,
    setSelectedLevelId,
    selectedGeneros,
    setSelectedGeneros,
    selectedEtiquetas,
    setSelectedEtiquetas,
    selectedValores,
    setSelectedValores,
    characters,
    setCharacters,
    categorias,
    niveles,
    generos,
    pdfFile,
    currentPdfUrl,
    hasPDF,
    extractedPages,
    pdfDimensions,
    isExtractingPages,
    pdfError,
    showPreview,
    setShowPreview,
    extractPagesFromExistingPdf,
    handlePortadaChange,
    handlePDFChange,
    handleSave,
    isFormValid,
    shouldShowPreview,
  } = useBookFormMultilang({ bookId });

  // Toggle helpers
  const handleToggleGenre = (id: string) => {
    setSelectedGeneros(selectedGeneros.includes(id)
      ? selectedGeneros.filter(g => g !== id)
      : [...selectedGeneros, id]);
  };
  const handleToggleTag = (id: string) => {
    setSelectedEtiquetas(selectedEtiquetas.includes(id)
      ? selectedEtiquetas.filter(t => t !== id)
      : [...selectedEtiquetas, id]);
  };
  const handleToggleValue = (id: string) => {
    setSelectedValores(selectedValores.includes(id)
      ? selectedValores.filter(v => v !== id)
      : [...selectedValores, id]);
  };
  const handleToggleCategory = (id: string) => {
    setSelectedCategoryId(selectedCategoryId === id ? null : id);
  };
  const handleToggleLevel = (id: string) => {
    setSelectedLevelId(selectedLevelId === id ? null : id);
  };

  // PDF fullscreen preview
  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <PDFPreviewMode
        pages={extractedPages}
        title={currentTranslation.title}
        pdfDimensions={pdfDimensions}
        onClose={() => setShowPreview(false)}
        language={activeTab as any}
      />
    );
  }

  // Loading skeleton
  if (isLoadingBook || translationsLoading) {
    return (
      <UnifiedLayout
        className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
        mainClassName="pt-0"
        backgroundComponent={<HomeBackground />}
      >
        <BookFormSkeleton />
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      className="bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      backgroundComponent={<HomeBackground />}
    >
      <Toaster position="top-right" />

      {/* ============================================ */}
      {/* HEADER — limpio, sutil */}
      {/* ============================================ */}
      <div className="px-4 pt-5 pb-3">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${locale}/my-world`)}
                className="p-2 bg-white/80 hover:bg-white rounded-xl shadow-sm border border-slate-200/60 transition-all"
              >
                <ArrowLeft size={18} className="text-slate-500" />
              </button>
              <div>
                <h1 className="text-xl font-black text-white drop-shadow-md flex items-center gap-2" style={FONT}>
                  {isEditMode
                    ? <PenTool size={18} className="text-yellow-200" />
                    : <Sparkles size={18} className="text-yellow-200" />
                  }
                  {isEditMode ? t('page_title_edit') : t('page_title_create')}
                </h1>
                <p className="text-blue-100/80 text-xs font-medium flex items-center gap-1.5 mt-0.5" style={FONT}>
                  <Languages size={12} />
                  {translationProgress.completed}/{translationProgress.total} {t('languages_completed')}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl shadow-sm border border-slate-200/60 hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              style={FONT}
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" />{t('btn_saving')}</>
              ) : (
                <><Save size={15} />{isEditMode ? t('btn_save_changes') : t('btn_save')}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 pb-3">
          <div className="container mx-auto max-w-6xl">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium" style={FONT}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONTENT */}
      {/* ============================================ */}
      <div className="px-4 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* ============================== */}
            {/* COLUMNA IZQUIERDA — 3/5 */}
            {/* ============================== */}
            <div className="lg:col-span-3 space-y-5">

              {/* TRADUCCIONES */}
              <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2" style={FONT}>
                    <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Languages size={13} className="text-blue-400" />
                    </div>
                    {t('section_translations')}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full">
                    {translationProgress.completed}/{translationProgress.total}
                  </span>
                </div>

                {/* Language tabs */}
                <div className="flex border-b border-slate-100">
                  {activeLanguages.map(lang => {
                    const trans = translations[lang.code];
                    const isComplete = trans?.title && trans?.description;
                    const isPrimary = trans?.isPrimary;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => setActiveTab(lang.code)}
                        className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all ${
                          activeTab === lang.code
                            ? 'text-slate-700 bg-white border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-slate-500 hover:bg-slate-50/50'
                        }`}
                        style={FONT}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {lang.flagEmoji && <span>{lang.flagEmoji}</span>}
                          <span>{lang.code.toUpperCase()}</span>
                          {isPrimary && <Star size={10} className="text-amber-400 fill-amber-400" />}
                          {isComplete && <Check size={10} className="text-emerald-400" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                {currentTranslation && (
                  <div className="p-5 space-y-5">
                    {/* Primary language */}
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-slate-400 font-medium" style={FONT}>
                        {currentTranslation.isPrimary ? t('primary_language') : t('set_primary_language')}
                      </label>
                      <button
                        onClick={() => setPrimaryLanguage(activeTab)}
                        disabled={currentTranslation.isPrimary}
                        className={`px-2.5 py-1 text-[10px] rounded-lg font-bold transition-all ${
                          currentTranslation.isPrimary
                            ? 'bg-amber-50 text-amber-600 cursor-default'
                            : 'bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-600'
                        }`}
                        style={FONT}
                      >
                        {currentTranslation.isPrimary ? (
                          <span className="flex items-center gap-1">
                            <Star size={10} className="fill-amber-400 text-amber-400" /> {t('btn_primary')}
                          </span>
                        ) : t('btn_set_primary')}
                      </button>
                    </div>

                    {/* Titulo */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                        {t('field_title')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.title}
                        onChange={(e) => updateTranslation(activeTab, 'title', e.target.value)}
                        placeholder={t('placeholder_title').replace('{language}', activeLanguages.find(l => l.code === activeTab)?.name || activeTab)}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:outline-none bg-white text-slate-700 placeholder:text-slate-300"
                        style={FONT}
                      />
                    </div>

                    {/* Subtitulo */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                        {t('field_subtitle')}
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.subtitle}
                        onChange={(e) => updateTranslation(activeTab, 'subtitle', e.target.value)}
                        placeholder={t('placeholder_subtitle')}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:outline-none bg-white text-slate-700 placeholder:text-slate-300"
                        style={FONT}
                      />
                    </div>

                    {/* Descripcion */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                        {t('field_description')} <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        value={currentTranslation.description}
                        onChange={(e) => updateTranslation(activeTab, 'description', e.target.value)}
                        placeholder={t('placeholder_description')}
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:outline-none bg-white text-slate-700 placeholder:text-slate-300 resize-none"
                        style={FONT}
                      />
                    </div>

                    {/* Resumen */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                        {t('field_summary')}
                      </label>
                      <textarea
                        value={currentTranslation.summary}
                        onChange={(e) => updateTranslation(activeTab, 'summary', e.target.value)}
                        placeholder={t('placeholder_summary')}
                        rows={2}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-blue-300 focus:ring-2 focus:ring-blue-50 focus:outline-none bg-white text-slate-700 placeholder:text-slate-300 resize-none"
                        style={FONT}
                      />
                    </div>

                    {/* Portada + PDF side by side on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Portada */}
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                          {t('cover_label')}
                        </label>
                        {portadaPreview ? (
                          <div className="relative group inline-block">
                            <img
                              src={portadaPreview}
                              alt={t('cover_label')}
                              className="w-24 h-32 object-cover rounded-xl shadow-sm border border-slate-200"
                            />
                            <button
                              onClick={() => setPortadaPreview(null)}
                              className="absolute -top-1.5 -right-1.5 p-1 bg-slate-600 text-white rounded-full hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer w-fit">
                            <div className="w-24 h-32 bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                              <Camera size={18} className="text-slate-300 group-hover:text-blue-400 mb-1" />
                              <span className="text-[9px] text-slate-400 group-hover:text-blue-400 font-medium" style={FONT}>{t('cover_label')}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                          </label>
                        )}
                      </div>

                      {/* PDF */}
                      <div>
                        <label className="text-xs font-bold text-slate-600 block mb-1.5" style={FONT}>
                          {t('field_pdf')}
                        </label>

                        {hasPDF && !pdfFile ? (
                          <div className="space-y-2">
                            <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
                              <p className="text-xs font-bold text-emerald-700" style={FONT}>{t('pdf_loaded')}</p>
                              <p className="text-[10px] text-emerald-500 truncate">
                                {currentPdfUrl?.startsWith('storage://') ? 'PDF almacenado' : currentPdfUrl}
                              </p>
                            </div>
                            {extractedPages.length > 0 ? (
                              <button
                                onClick={() => setShowPreview(true)}
                                className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                style={FONT}
                              >
                                <Eye size={13} />
                                {t('pdf_preview').replace('{pages}', String(extractedPages.length))}
                              </button>
                            ) : currentPdfUrl ? (
                              <button
                                onClick={() => extractPagesFromExistingPdf(activeTab, currentPdfUrl)}
                                disabled={isExtractingPages}
                                className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                                style={FONT}
                              >
                                {isExtractingPages
                                  ? <><Loader2 size={13} className="animate-spin" />{t('pdf_processing') || 'Procesando...'}</>
                                  : <><Eye size={13} />{t('pdf_load_preview') || 'Cargar vista previa'}</>
                                }
                              </button>
                            ) : null}
                            <label className="block cursor-pointer">
                              <div className="border border-dashed border-slate-200 rounded-xl p-2 flex items-center justify-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                                <Upload size={13} className="text-slate-400 mr-1.5" />
                                <span className="text-[10px] text-slate-400 font-medium" style={FONT}>{t('pdf_change')}</span>
                              </div>
                              <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                            </label>
                          </div>
                        ) : pdfFile ? (
                          <div className="flex items-center justify-between p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Upload size={13} className="text-emerald-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-slate-700 truncate" style={FONT}>{pdfFile.name}</p>
                                <p className="text-[9px] text-slate-400">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                              </div>
                            </div>
                            <button
                              onClick={() => updateTranslation(activeTab, 'pdfFile', null)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                            >
                              <X size={12} className="text-red-400" />
                            </button>
                          </div>
                        ) : (
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                              <Upload size={18} className="text-slate-300 mb-1" />
                              <span className="text-xs text-slate-400 font-medium" style={FONT}>{t('pdf_upload')}</span>
                              <span className="text-[10px] text-slate-300" style={FONT}>{t('pdf_max_size')}</span>
                            </div>
                            <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                          </label>
                        )}

                        {pdfError && <p className="text-[10px] text-red-500 mt-1" style={FONT}>{pdfError}</p>}

                        {extractedPages.length > 0 && !hasPDF && (
                          <button
                            onClick={() => setShowPreview(true)}
                            className="w-full mt-2 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                            style={FONT}
                          >
                            <Eye size={13} />
                            {t('pdf_preview').replace('{pages}', String(extractedPages.length))}
                          </button>
                        )}

                        {isExtractingPages && (
                          <div className="mt-2 text-center py-2">
                            <Loader2 className="animate-spin mx-auto text-slate-400 mb-1" size={16} />
                            <p className="text-[10px] text-slate-400" style={FONT}>{t('pdf_processing')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personajes */}
                    <CharacterInput
                      characters={characters}
                      onChange={setCharacters}
                      label={`${t('field_characters') || 'Personajes'} (${activeLanguages.find(l => l.code === activeTab)?.name || activeTab})`}
                      maxCharacters={20}
                      roleMainLabel={t('role_main') || 'Principal'}
                      roleSecondaryLabel={t('role_secondary') || 'Secundario'}
                      roleSupportingLabel={t('role_supporting') || 'De apoyo'}
                      placeholderText={t('character_placeholder') || 'Nombre del personaje...'}
                      maxReachedText={t('character_max_reached') || 'Máximo de personajes alcanzado'}
                      hintText={t('character_hint') || 'Agrega los personajes principales de tu historia'}
                    />
                  </div>
                )}
              </section>

              {/* AUTORES */}
              <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-violet-50 rounded-lg flex items-center justify-center">
                    <Users size={13} className="text-violet-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700" style={FONT}>
                    {t('section_authors') || 'Autores'}
                  </h3>
                </div>
                <div className="p-5">
                  <AuthorSelector
                    selectedAuthors={selectedAuthors}
                    onChange={setSelectedAuthors}
                    currentUser={currentUser}
                  />
                </div>
              </section>

              {/* CLASIFICACION */}
              <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Tag size={13} className="text-indigo-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700" style={FONT}>
                    {t('section_classification')}
                  </h3>
                </div>
                <div className="p-5 space-y-5">
                  <CatalogSelector catalogType="categories" selectedIds={selectedCategoryId ? [selectedCategoryId] : []} onToggle={handleToggleCategory} label={t('field_category')} color="indigo" required singleSelect maxSelections={1} />
                  <CatalogSelector catalogType="levels" selectedIds={selectedLevelId ? [selectedLevelId] : []} onToggle={handleToggleLevel} label={t('field_level')} color="amber" required singleSelect maxSelections={1} />
                  <CatalogSelector catalogType="genres" selectedIds={selectedGeneros} onToggle={handleToggleGenre} label={t('field_genres')} color="rose" maxSelections={5} />
                  <CatalogSelector catalogType="tags" selectedIds={selectedEtiquetas} onToggle={handleToggleTag} label={t('field_tags') || 'Etiquetas'} color="sky" maxSelections={10} />
                  <CatalogSelector catalogType="values" selectedIds={selectedValores} onToggle={handleToggleValue} label={t('field_values') || 'Valores educativos'} color="emerald" maxSelections={5} />
                </div>
              </section>
            </div>

            {/* ============================== */}
            {/* COLUMNA DERECHA — 2/5 Preview */}
            {/* ============================== */}
            <div className="lg:col-span-2 lg:sticky lg:top-4 lg:self-start">
              <section className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Eye size={13} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700" style={FONT}>
                    {t('section_preview')}
                  </h3>
                </div>

                <div className="p-5">
                  {shouldShowPreview ? (
                    <div className="space-y-4">
                      {/* Cover + title */}
                      <div className="flex gap-3.5 pb-4 border-b border-slate-100">
                        <div className="flex-shrink-0">
                          {portadaPreview ? (
                            <img src={portadaPreview} alt={t('cover_label')} className="w-28 h-38 object-cover rounded-xl shadow-sm border border-slate-200" />
                          ) : (
                            <div className="w-28 h-38 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-200">
                              <Camera size={20} className="text-slate-300 mb-1" />
                              <span className="text-[9px] text-slate-400" style={FONT}>{t('no_cover')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {currentTranslation.title ? (
                            <h2 className="text-base font-black text-slate-800 mb-1 leading-tight line-clamp-2" style={FONT}>
                              {currentTranslation.title}
                            </h2>
                          ) : (
                            <p className="text-sm text-slate-300 italic" style={FONT}>{t('no_title')}</p>
                          )}

                          {currentTranslation.subtitle && (
                            <p className="text-xs text-slate-500 mb-2" style={FONT}>{currentTranslation.subtitle}</p>
                          )}

                          {selectedAuthors.length > 0 && (
                            <p className="text-[11px] text-slate-400 mb-2" style={FONT}>
                              {t('by_authors').replace('{authors}', selectedAuthors.map(a => a.displayName).join(', '))}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1">
                            {selectedLevelId && niveles.find(n => n.id === selectedLevelId) && (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-medium border border-amber-100" style={FONT}>
                                {niveles.find(n => n.id === selectedLevelId)?.name}
                              </span>
                            )}
                            {selectedCategoryId && categorias.find(c => c.id === selectedCategoryId) && (
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-medium border border-indigo-100" style={FONT}>
                                {categorias.find(c => c.id === selectedCategoryId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {currentTranslation.description && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider" style={FONT}>{t('field_description')}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed" style={FONT}>{currentTranslation.description}</p>
                        </div>
                      )}

                      {currentTranslation.summary && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider" style={FONT}>{t('field_summary')}</h4>
                          <p className="text-xs text-slate-500 italic" style={FONT}>{currentTranslation.summary}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {selectedGeneros.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider" style={FONT}>{t('field_genres')}</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedGeneros.map(gid => {
                              const gen = generos.find(g => g.id === gid);
                              return gen ? (
                                <span key={gid} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-medium border border-rose-100" style={FONT}>
                                  {gen.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {characters.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1" style={FONT}>
                            <Users size={10} /> {t('field_characters') || 'Personajes'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {characters.map((char, idx) => (
                              <span key={idx} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                char.role === 'main' ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : char.role === 'secondary' ? 'bg-sky-50 text-sky-600 border-sky-100'
                                : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`} style={FONT}>{char.name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedValores.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1" style={FONT}>
                            <Heart size={10} /> {t('field_values') || 'Valores'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedValores.map(vid => (
                              <span key={vid} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-medium border border-emerald-100" style={FONT}>{vid}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Translation status */}
                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider" style={FONT}>{t('section_translations')}</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                          {activeLanguages.map(lang => {
                            const trans = translations[lang.code];
                            const isComplete = trans?.title && trans?.description;
                            const hasPdfTrans = trans?.pdfFile || trans?.pdfUrl;
                            return (
                              <div key={lang.code} className={`p-2 rounded-lg border ${isComplete ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                <div className="flex items-center gap-1 mb-0.5">
                                  {lang.flagEmoji && <span className="text-xs">{lang.flagEmoji}</span>}
                                  <span className="text-[10px] font-bold text-slate-600" style={FONT}>{lang.name}</span>
                                  {trans?.isPrimary && <Star size={9} className="text-amber-400 fill-amber-400" />}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px]" style={FONT}>
                                  <span className={isComplete ? 'text-emerald-500' : 'text-slate-400'}>{isComplete ? t('translation_complete') : t('translation_incomplete')}</span>
                                  {hasPdfTrans && <span className="px-1 py-0.5 bg-slate-200 text-slate-500 rounded text-[8px] font-bold">PDF</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-14 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <BookOpen size={28} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-0.5" style={FONT}>{t('preview_empty_title')}</p>
                        <p className="text-xs text-slate-400 max-w-[200px] mx-auto" style={FONT}>{t('preview_empty_text')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
