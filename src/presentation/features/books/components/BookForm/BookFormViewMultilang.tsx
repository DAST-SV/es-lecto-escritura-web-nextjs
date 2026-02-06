/**
 * UBICACION: src/presentation/features/books/components/BookForm/BookFormViewMultilang.tsx
 * Formulario de libro con soporte MULTI-IDIOMA
 * - Todas las etiquetas usan traducciones desde Supabase
 * - Skeleton loading mientras cargan datos
 * - CatalogSelector para categorías, niveles, géneros, etiquetas, valores
 * - CharacterInput para personajes
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Loader2, Save, Upload, AlertCircle, BookOpen, Tag, Camera, X, Eye, ArrowLeft, Languages, Star, Check, Heart, Users
} from 'lucide-react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { AuthorSelector } from '@/src/presentation/features/books/components/Inputs/AuthorSelector';
import { CharacterInput } from '@/src/presentation/features/books/components/Inputs/CharacterInput';
import { BookFormSkeleton } from '@/src/presentation/features/books/components/BookForm/BookFormSkeleton';
import { CatalogSelector } from '@/src/presentation/features/books/components/Selectors/CatalogSelector';
import { useBookFormMultilang } from '@/src/presentation/features/books/hooks/useBookFormMultilang';
import { useSupabaseTranslations } from '@/src/presentation/features/translations/hooks/useSupabaseTranslations';
import { Toaster } from 'react-hot-toast';

interface BookFormViewMultilangProps {
  bookId?: string;
}

export function BookFormViewMultilang({ bookId }: BookFormViewMultilangProps) {
  const router = useRouter();
  const locale = useLocale();

  // Traducciones del formulario
  const { t, loading: translationsLoading } = useSupabaseTranslations('books_form');

  const {
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
    handlePortadaChange,
    handlePDFChange,
    handleSave,
    isFormValid,
    shouldShowPreview,
  } = useBookFormMultilang({ bookId });

  // Toggle helpers para selectores multi-select
  const handleToggleGenre = (id: string) => {
    if (selectedGeneros.includes(id)) {
      setSelectedGeneros(selectedGeneros.filter(g => g !== id));
    } else {
      setSelectedGeneros([...selectedGeneros, id]);
    }
  };

  const handleToggleTag = (id: string) => {
    if (selectedEtiquetas.includes(id)) {
      setSelectedEtiquetas(selectedEtiquetas.filter(t => t !== id));
    } else {
      setSelectedEtiquetas([...selectedEtiquetas, id]);
    }
  };

  const handleToggleValue = (id: string) => {
    if (selectedValores.includes(id)) {
      setSelectedValores(selectedValores.filter(v => v !== id));
    } else {
      setSelectedValores([...selectedValores, id]);
    }
  };

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryId(selectedCategoryId === id ? null : id);
  };

  const handleToggleLevel = (id: string) => {
    setSelectedLevelId(selectedLevelId === id ? null : id);
  };

  // Preview de PDF
  if (showPreview && extractedPages.length > 0 && pdfDimensions) {
    return (
      <PDFPreviewMode
        pages={extractedPages}
        title={currentTranslation.title}
        pdfDimensions={pdfDimensions}
        onClose={() => setShowPreview(false)}
      />
    );
  }

  // Loading - mostrar skeleton
  if (isLoadingBook || translationsLoading) {
    return (
      <UnifiedLayout showNavbar={true}>
        <BookFormSkeleton />
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout showNavbar={true}>
      <Toaster position="top-right" />

      <div className="h-[calc(100vh-60px)] flex flex-col bg-gradient-to-br from-amber-50/30 via-white to-rose-50/30">

        {/* Header */}
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/${locale}/books`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {isEditMode ? t('page_title_edit') : t('page_title_create')}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Languages size={12} />
                  {translationProgress.completed}/{translationProgress.total} {t('languages_completed')}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={!isFormValid || isLoading}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('btn_saving')}
                </>
              ) : (
                <>
                  <Save size={14} />
                  {isEditMode ? t('btn_save_changes') : t('btn_save')}
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

              {/* TABS DE IDIOMAS */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Languages size={13} />
                    {t('section_translations')}
                  </h3>
                  <span className="text-[10px] text-gray-500">
                    {translationProgress.completed}/{translationProgress.total}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {activeLanguages.map(lang => {
                    const trans = translations[lang.code];
                    const isComplete = trans?.title && trans?.description;
                    const isPrimary = trans?.isPrimary;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => setActiveTab(lang.code)}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-all relative ${
                          activeTab === lang.code
                            ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {lang.flagEmoji && <span>{lang.flagEmoji}</span>}
                          <span>{lang.code.toUpperCase()}</span>
                          {isPrimary && (
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                          )}
                          {isComplete && (
                            <Check size={10} className="text-emerald-500" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Contenido del tab activo */}
                {currentTranslation && (
                  <div className="p-3 space-y-3">
                    {/* Marcar como idioma principal */}
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-gray-500">
                        {currentTranslation.isPrimary
                          ? t('primary_language')
                          : t('set_primary_language')}
                      </label>
                      <button
                        onClick={() => setPrimaryLanguage(activeTab)}
                        disabled={currentTranslation.isPrimary}
                        className={`px-2 py-1 text-[10px] rounded transition-all ${
                          currentTranslation.isPrimary
                            ? 'bg-amber-100 text-amber-700 cursor-default'
                            : 'bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-700'
                        }`}
                      >
                        {currentTranslation.isPrimary ? (
                          <span className="flex items-center gap-1">
                            <Star size={10} className="fill-amber-500" /> {t('btn_primary')}
                          </span>
                        ) : (
                          t('btn_set_primary')
                        )}
                      </button>
                    </div>

                    {/* Titulo */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('field_title')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.title}
                        onChange={(e) => updateTranslation(activeTab, 'title', e.target.value)}
                        placeholder={t('placeholder_title').replace('{language}', activeLanguages.find(l => l.code === activeTab)?.name || activeTab)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                      />
                    </div>

                    {/* Subtitulo */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('field_subtitle')}
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.subtitle}
                        onChange={(e) => updateTranslation(activeTab, 'subtitle', e.target.value)}
                        placeholder={t('placeholder_subtitle')}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                      />
                    </div>

                    {/* Descripcion */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('field_description')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={currentTranslation.description}
                        onChange={(e) => updateTranslation(activeTab, 'description', e.target.value)}
                        placeholder={t('placeholder_description')}
                        rows={3}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Resumen */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('field_summary')}
                      </label>
                      <textarea
                        value={currentTranslation.summary}
                        onChange={(e) => updateTranslation(activeTab, 'summary', e.target.value)}
                        placeholder={t('placeholder_summary')}
                        rows={2}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Portada para este idioma */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('cover_label')} ({activeLanguages.find(l => l.code === activeTab)?.name || activeTab})
                      </label>
                      {portadaPreview ? (
                        <div className="relative group inline-block">
                          <img
                            src={portadaPreview}
                            alt={t('cover_label')}
                            className="w-20 h-28 object-cover rounded-lg shadow-md border border-gray-200"
                          />
                          <button
                            onClick={() => setPortadaPreview(null)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <label className="block cursor-pointer w-fit">
                          <div className="w-20 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                            <Camera size={16} className="text-gray-400 group-hover:text-orange-500 mb-1" />
                            <span className="text-[9px] text-gray-500 group-hover:text-orange-600">{t('cover_label')}</span>
                          </div>
                          <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* PDF para este idioma */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        {t('field_pdf')} ({activeLanguages.find(l => l.code === activeTab)?.name || activeTab})
                      </label>

                      {hasPDF && !pdfFile ? (
                        <div className="space-y-2">
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-xs font-medium text-emerald-900">{t('pdf_loaded')}</p>
                            <p className="text-[10px] text-emerald-700 truncate">{currentPdfUrl}</p>
                          </div>
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                              <Upload size={14} className="text-gray-400 mr-1" />
                              <span className="text-[10px] text-gray-500">{t('pdf_change')}</span>
                            </div>
                            <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                          </label>
                        </div>
                      ) : pdfFile ? (
                        <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Upload size={12} className="text-emerald-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-900 truncate">{pdfFile.name}</p>
                              <p className="text-[9px] text-gray-600">{(pdfFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateTranslation(activeTab, 'pdfFile', null)}
                            className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                          >
                            <X size={12} className="text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <label className="block cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                            <Upload size={16} className="text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">{t('pdf_upload')}</span>
                            <span className="text-[10px] text-gray-400">{t('pdf_max_size')}</span>
                          </div>
                          <input type="file" accept="application/pdf" onChange={handlePDFChange} className="hidden" />
                        </label>
                      )}

                      {pdfError && <p className="text-[10px] text-red-600 mt-1">{pdfError}</p>}

                      {extractedPages.length > 0 && (
                        <button
                          onClick={() => setShowPreview(true)}
                          className="w-full mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-md flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye size={12} />
                          {t('pdf_preview').replace('{pages}', String(extractedPages.length))}
                        </button>
                      )}

                      {isExtractingPages && (
                        <div className="mt-2 text-center py-2">
                          <Loader2 className="animate-spin mx-auto text-gray-600 mb-1" size={14} />
                          <p className="text-[10px] text-gray-600">{t('pdf_processing')}</p>
                        </div>
                      )}
                    </div>

                    {/* Personajes para este idioma */}
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

              {/* Autores (compartido) */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-3">
                  <AuthorSelector
                    selectedAuthors={selectedAuthors}
                    onChange={setSelectedAuthors}
                    currentUser={currentUser}
                  />
                </div>
              </section>

              {/* Clasificacion con CatalogSelector */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Tag size={13} />
                    {t('section_classification')}
                  </h3>
                </div>
                <div className="p-3 space-y-4">
                  {/* Categoria - Single Select */}
                  <CatalogSelector
                    catalogType="categories"
                    selectedIds={selectedCategoryId ? [selectedCategoryId] : []}
                    onToggle={handleToggleCategory}
                    label={t('field_category')}
                    color="indigo"
                    required
                    singleSelect
                    maxSelections={1}
                  />

                  {/* Nivel - Single Select */}
                  <CatalogSelector
                    catalogType="levels"
                    selectedIds={selectedLevelId ? [selectedLevelId] : []}
                    onToggle={handleToggleLevel}
                    label={t('field_level')}
                    color="amber"
                    required
                    singleSelect
                    maxSelections={1}
                  />

                  {/* Géneros - Multi Select */}
                  <CatalogSelector
                    catalogType="genres"
                    selectedIds={selectedGeneros}
                    onToggle={handleToggleGenre}
                    label={t('field_genres')}
                    color="rose"
                    maxSelections={5}
                  />

                  {/* Etiquetas - Multi Select */}
                  <CatalogSelector
                    catalogType="tags"
                    selectedIds={selectedEtiquetas}
                    onToggle={handleToggleTag}
                    label={t('field_tags') || 'Etiquetas'}
                    color="sky"
                    maxSelections={10}
                  />

                  {/* Valores - Multi Select */}
                  <CatalogSelector
                    catalogType="values"
                    selectedIds={selectedValores}
                    onToggle={handleToggleValue}
                    label={t('field_values') || 'Valores educativos'}
                    color="emerald"
                    maxSelections={5}
                  />
                </div>
              </section>

              {/* Nota: Personajes ahora están dentro del tab de idioma */}
            </div>

            {/* COLUMNA DERECHA - Ficha Preview */}
            <div className="overflow-hidden">
              <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
                  <h3 className="text-xs font-semibold text-gray-900">{t('section_preview')}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {shouldShowPreview ? (
                    <div className="space-y-4">
                      {/* Portada + Info principal */}
                      <div className="flex gap-4 pb-4 border-b border-gray-100">
                        <div className="flex-shrink-0">
                          {portadaPreview ? (
                            <img
                              src={portadaPreview}
                              alt={t('cover_label')}
                              className="w-28 h-36 object-cover rounded-lg shadow-md border border-gray-200"
                            />
                          ) : (
                            <div className="w-28 h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                              <Camera size={20} className="text-gray-300 mb-1" />
                              <span className="text-[9px] text-gray-400">{t('no_cover')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {currentTranslation.title ? (
                            <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                              {currentTranslation.title}
                            </h2>
                          ) : (
                            <p className="text-sm text-gray-400 italic">{t('no_title')}</p>
                          )}

                          {currentTranslation.subtitle && (
                            <p className="text-xs text-gray-600 mb-2">{currentTranslation.subtitle}</p>
                          )}

                          {selectedAuthors.length > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                              {t('by_authors').replace('{authors}', selectedAuthors.map(a => a.displayName).join(', '))}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {selectedLevelId && niveles.find(n => n.id === selectedLevelId) && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium">
                                {niveles.find(n => n.id === selectedLevelId)?.name}
                              </span>
                            )}
                            {selectedCategoryId && categorias.find(c => c.id === selectedCategoryId) && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[10px] font-medium">
                                {categorias.find(c => c.id === selectedCategoryId)?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Descripcion */}
                      {currentTranslation.description && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                            {t('field_description')}
                          </h4>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {currentTranslation.description}
                          </p>
                        </div>
                      )}

                      {/* Resumen */}
                      {currentTranslation.summary && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                            {t('field_summary')}
                          </h4>
                          <p className="text-xs text-gray-600 italic">
                            {currentTranslation.summary}
                          </p>
                        </div>
                      )}

                      {/* Generos */}
                      {selectedGeneros.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                            {t('field_genres')}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedGeneros.map(gid => {
                              const gen = generos.find(g => g.id === gid);
                              return gen ? (
                                <span
                                  key={gid}
                                  className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded text-[10px] border border-rose-200"
                                >
                                  {gen.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Personajes */}
                      {characters.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                            <Users size={10} />
                            {t('field_characters') || 'Personajes'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {characters.map((char, idx) => (
                              <span
                                key={idx}
                                className={`px-2 py-0.5 rounded text-[10px] border ${
                                  char.role === 'main'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : char.role === 'secondary'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                {char.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Valores */}
                      {selectedValores.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                            <Heart size={10} />
                            {t('field_values') || 'Valores'}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedValores.map(vid => (
                              <span
                                key={vid}
                                className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] border border-emerald-200"
                              >
                                {vid}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Estado de traducciones */}
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-[10px] font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                          {t('section_translations')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activeLanguages.map(lang => {
                            const trans = translations[lang.code];
                            const isComplete = trans?.title && trans?.description;
                            const hasPdfTrans = trans?.pdfFile || trans?.pdfUrl;

                            return (
                              <div
                                key={lang.code}
                                className={`p-2 rounded-lg border ${
                                  isComplete
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  {lang.flagEmoji && <span className="text-sm">{lang.flagEmoji}</span>}
                                  <span className="text-[10px] font-medium text-gray-900">
                                    {lang.name}
                                  </span>
                                  {trans?.isPrimary && (
                                    <Star size={10} className="text-amber-500 fill-amber-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[9px]">
                                  <span className={isComplete ? 'text-emerald-600' : 'text-gray-400'}>
                                    {isComplete ? t('translation_complete') : t('translation_incomplete')}
                                  </span>
                                  {hasPdfTrans && (
                                    <span className="text-blue-600">PDF</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 mb-1">{t('preview_empty_title')}</p>
                        <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                          {t('preview_empty_text')}
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
