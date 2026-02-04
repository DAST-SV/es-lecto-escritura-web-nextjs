/**
 * UBICACIÓN: src/presentation/features/books/components/BookForm/BookFormViewMultilang.tsx
 * ✅ Formulario de libro con soporte MULTI-IDIOMA
 * Tabs por idioma para: título, descripción, resumen, PDF
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Loader2, Save, Upload, AlertCircle, BookOpen, Tag, Camera, X, Eye, ArrowLeft, Languages, Star, Check
} from 'lucide-react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';
import { PDFPreviewMode } from '@/src/presentation/features/books/components/PDFPreview/PDFPreviewMode';
import { AutoresInput } from '@/src/presentation/features/books/components/Inputs/AutoresInput';
import { useBookFormMultilang } from '@/src/presentation/features/books/hooks/useBookFormMultilang';
import { Toaster } from 'react-hot-toast';

interface BookFormViewMultilangProps {
  bookId?: string;
}

export function BookFormViewMultilang({ bookId }: BookFormViewMultilangProps) {
  const router = useRouter();
  const locale = useLocale();

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
    autores,
    setAutores,
    portadaPreview,
    setPortadaPreview,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedLevelId,
    setSelectedLevelId,
    selectedGeneros,
    setSelectedGeneros,
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
    setPdfError,
    showPreview,
    setShowPreview,
    handlePortadaChange,
    handlePDFChange,
    handleSave,
    isFormValid,
    shouldShowPreview,
  } = useBookFormMultilang({ bookId });

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

  // Loading
  if (isLoadingBook) {
    return (
      <UnifiedLayout showNavbar={true}>
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-amber-50/30 via-white to-rose-50/30">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {activeLanguages.length === 0 ? 'Cargando idiomas...' : 'Cargando libro...'}
            </p>
          </div>
        </div>
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
                  {isEditMode ? 'Editar Libro' : 'Crear Nuevo Libro'}
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Languages size={12} />
                  {translationProgress.completed}/{translationProgress.total} idiomas completados
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
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={14} />
                  {isEditMode ? 'Guardar Cambios' : 'Guardar'}
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

              {/* ✅ TABS DE IDIOMAS */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Languages size={13} />
                    Traducciones
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
                          ? 'Este es el idioma principal'
                          : 'Marcar como idioma principal'}
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
                            <Star size={10} className="fill-amber-500" /> Principal
                          </span>
                        ) : (
                          'Establecer como principal'
                        )}
                      </button>
                    </div>

                    {/* Título */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.title}
                        onChange={(e) => updateTranslation(activeTab, 'title', e.target.value)}
                        placeholder={`Título en ${activeLanguages.find(l => l.code === activeTab)?.name || activeTab}`}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                      />
                    </div>

                    {/* Subtítulo */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={currentTranslation.subtitle}
                        onChange={(e) => updateTranslation(activeTab, 'subtitle', e.target.value)}
                        placeholder="Subtítulo (opcional)"
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        Descripción <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={currentTranslation.description}
                        onChange={(e) => updateTranslation(activeTab, 'description', e.target.value)}
                        placeholder="Descripción completa del libro..."
                        rows={3}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Resumen */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        Resumen corto
                      </label>
                      <textarea
                        value={currentTranslation.summary}
                        onChange={(e) => updateTranslation(activeTab, 'summary', e.target.value)}
                        placeholder="Resumen breve para previews..."
                        rows={2}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none resize-none"
                      />
                    </div>

                    {/* PDF para este idioma */}
                    <div>
                      <label className="text-[10px] font-medium text-gray-700 block mb-1">
                        PDF ({activeLanguages.find(l => l.code === activeTab)?.name || activeTab})
                      </label>

                      {hasPDF && !pdfFile ? (
                        <div className="space-y-2">
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <p className="text-xs font-medium text-emerald-900">PDF cargado</p>
                            <p className="text-[10px] text-emerald-700 truncate">{currentPdfUrl}</p>
                          </div>
                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50/50 transition-all">
                              <Upload size={14} className="text-gray-400 mr-1" />
                              <span className="text-[10px] text-gray-500">Cambiar PDF</span>
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
                            <span className="text-xs text-gray-500">Subir PDF</span>
                            <span className="text-[10px] text-gray-400">Máx. 50MB</span>
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
                          Preview ({extractedPages.length} pág.)
                        </button>
                      )}

                      {isExtractingPages && (
                        <div className="mt-2 text-center py-2">
                          <Loader2 className="animate-spin mx-auto text-gray-600 mb-1" size={14} />
                          <p className="text-[10px] text-gray-600">Procesando PDF...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Autores (compartido) */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900">Autores</h3>
                </div>
                <div className="p-3">
                  <AutoresInput autores={autores} onChange={setAutores} />
                </div>
              </section>

              {/* Clasificación (compartido) */}
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="px-3 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                    <Tag size={13} />
                    Clasificación
                  </h3>
                </div>
                <div className="p-3 space-y-3">
                  {/* Categoría */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-700 block mb-1.5">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCategoryId || ''}
                      onChange={(e) => setSelectedCategoryId(e.target.value || null)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:border-orange-400 focus:ring-1 focus:ring-orange-200 focus:outline-none"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nivel */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-700 block mb-1.5">
                      Nivel <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {niveles.map(nivel => (
                        <button
                          key={nivel.id}
                          onClick={() => setSelectedLevelId(nivel.id)}
                          className={`px-2.5 py-1.5 text-[11px] rounded-md border transition-all font-medium ${
                            selectedLevelId === nivel.id
                              ? 'border-amber-400 bg-amber-50 text-amber-900'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {nivel.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Géneros */}
                  <div>
                    <label className="text-[10px] font-semibold text-gray-700 block mb-1.5">
                      Géneros
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {generos.map(gen => {
                        const isSelected = selectedGeneros.includes(gen.id);
                        return (
                          <button
                            key={gen.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedGeneros(selectedGeneros.filter(id => id !== gen.id));
                              } else {
                                setSelectedGeneros([...selectedGeneros, gen.id]);
                              }
                            }}
                            className={`px-2 py-1 text-[10px] rounded-md border transition-all ${
                              isSelected
                                ? 'border-rose-400 bg-rose-50 text-rose-900 font-medium'
                                : 'border-gray-200 hover:border-rose-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {gen.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* COLUMNA DERECHA - Ficha Preview */}
            <div className="overflow-hidden">
              <div className="h-full bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                <div className="flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
                  <h3 className="text-xs font-semibold text-gray-900">Vista Previa</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {shouldShowPreview ? (
                    <div className="space-y-4">
                      {/* Portada + Info principal */}
                      <div className="flex gap-4 pb-4 border-b border-gray-100">
                        <div className="flex-shrink-0">
                          {portadaPreview ? (
                            <div className="relative group">
                              <img
                                src={portadaPreview}
                                alt="Portada"
                                className="w-28 h-36 object-cover rounded-lg shadow-md border border-gray-200"
                              />
                              <button
                                onClick={() => setPortadaPreview(null)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-md"
                              >
                                <X size={10} />
                              </button>
                            </div>
                          ) : (
                            <label className="block cursor-pointer">
                              <div className="w-28 h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 transition-all group">
                                <Camera size={20} className="text-gray-400 group-hover:text-orange-500 mb-1" />
                                <span className="text-[10px] text-gray-500 group-hover:text-orange-600">Portada</span>
                              </div>
                              <input type="file" accept="image/*" onChange={handlePortadaChange} className="hidden" />
                            </label>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          {currentTranslation.title ? (
                            <h2 className="text-lg font-bold text-gray-900 mb-1 leading-tight line-clamp-2">
                              {currentTranslation.title}
                            </h2>
                          ) : (
                            <p className="text-sm text-gray-400 italic">Sin título</p>
                          )}

                          {currentTranslation.subtitle && (
                            <p className="text-xs text-gray-600 mb-2">{currentTranslation.subtitle}</p>
                          )}

                          {autores.filter(a => a.trim()).length > 0 && (
                            <p className="text-xs text-gray-500 mb-2">
                              Por: {autores.filter(a => a.trim()).join(', ')}
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

                      {/* Descripción */}
                      {currentTranslation.description && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                            Descripción
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
                            Resumen
                          </h4>
                          <p className="text-xs text-gray-600 italic">
                            {currentTranslation.summary}
                          </p>
                        </div>
                      )}

                      {/* Géneros */}
                      {selectedGeneros.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
                            Géneros
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

                      {/* Estado de traducciones */}
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-[10px] font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                          Traducciones
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activeLanguages.map(lang => {
                            const trans = translations[lang.code];
                            const isComplete = trans?.title && trans?.description;
                            const hasPdf = trans?.pdfFile || trans?.pdfUrl;

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
                                    {isComplete ? 'Completo' : 'Incompleto'}
                                  </span>
                                  {hasPdf && (
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
                        <p className="text-sm text-gray-500 mb-1">Vista previa</p>
                        <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                          Completa el formulario para ver la vista previa del libro
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
