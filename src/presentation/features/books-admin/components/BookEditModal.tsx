// ============================================
// src/presentation/features/books-admin/components/BookEditModal.tsx
// Modal de edición de libros con pestañas por idioma
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Globe, Upload, Trash2, Plus, BookOpen, Users, Tags, Layers } from 'lucide-react';
import { BookAdmin, DifficultyLevel, BookStatus } from '@/src/core/domain/entities/BookAdmin';
import { Language } from '@/src/core/domain/entities/Language';
import { BookCategory } from '@/src/core/domain/entities/BookCategory';
import { BookLevel } from '@/src/core/domain/entities/BookLevel';
import { BookGenre } from '@/src/core/domain/entities/BookGenre';
import { BookTag } from '@/src/core/domain/entities/BookTag';
import { BookAuthor } from '@/src/core/domain/entities/BookAuthor';

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  book?: BookAdmin | null;
  languages: Language[];
  categories: BookCategory[];
  levels: BookLevel[];
  genres: BookGenre[];
  tags: BookTag[];
  authors: BookAuthor[];
  isCreating?: boolean;
}

export function BookEditModal({
  isOpen,
  onClose,
  onSubmit,
  book,
  languages,
  categories,
  levels,
  genres,
  tags,
  authors,
  isCreating = false,
}: BookEditModalProps) {
  const activeLanguages = languages.filter(l => l.isActive);
  const [activeTab, setActiveTab] = useState<'general' | 'translations' | 'relations'>('general');
  const [selectedLangCode, setSelectedLangCode] = useState(activeLanguages[0]?.code || 'es');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    categoryId: '',
    levelId: '',
    coverUrl: '',
    difficulty: 'beginner' as DifficultyLevel,
    status: 'draft' as BookStatus,
    estimatedReadTime: 5,
    pageCount: 0,
    isFeatured: false,
    isPremium: false,
  });

  const [translations, setTranslations] = useState<Record<string, {
    title: string;
    subtitle: string;
    description: string;
    summary: string;
    keywords: string;
    pdfUrl: string;
    isActive: boolean;
    isPrimary: boolean;
  }>>({});

  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<{ id: string; isPrimary: boolean }[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Initialize form when book changes
  useEffect(() => {
    if (book) {
      setFormData({
        slug: book.slug,
        categoryId: book.categoryId,
        levelId: book.levelId || '',
        coverUrl: book.coverUrl || '',
        difficulty: book.difficulty,
        status: book.status,
        estimatedReadTime: book.estimatedReadTime,
        pageCount: book.pageCount,
        isFeatured: book.isFeatured,
        isPremium: book.isPremium,
      });

      const trans: typeof translations = {};
      book.translations.forEach(t => {
        trans[t.languageCode] = {
          title: t.title,
          subtitle: t.subtitle || '',
          description: t.description || '',
          summary: t.summary || '',
          keywords: t.keywords?.join(', ') || '',
          pdfUrl: t.pdfUrl || '',
          isActive: t.isActive,
          isPrimary: t.isPrimary,
        };
      });
      setTranslations(trans);

      setSelectedAuthors(book.authors.map(a => a.authorId));
      setSelectedGenres(book.genres.map(g => ({ id: g.genreId, isPrimary: g.isPrimary })));
      setSelectedTags(book.tags.map(t => t.tagId));
    } else {
      // Reset for new book
      setFormData({
        slug: '',
        categoryId: categories[0]?.id || '',
        levelId: '',
        coverUrl: '',
        difficulty: 'beginner',
        status: 'draft',
        estimatedReadTime: 5,
        pageCount: 0,
        isFeatured: false,
        isPremium: false,
      });

      const defaultTrans: typeof translations = {};
      activeLanguages.forEach((lang, idx) => {
        defaultTrans[lang.code] = {
          title: '',
          subtitle: '',
          description: '',
          summary: '',
          keywords: '',
          pdfUrl: '',
          isActive: true,
          isPrimary: idx === 0,
        };
      });
      setTranslations(defaultTrans);

      setSelectedAuthors([]);
      setSelectedGenres([]);
      setSelectedTags([]);
    }
  }, [book, categories, activeLanguages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const translationsArray = Object.entries(translations)
        .filter(([_, t]) => t.title.trim())
        .map(([langCode, t]) => ({
          languageCode: langCode,
          title: t.title.trim(),
          subtitle: t.subtitle.trim() || null,
          description: t.description.trim() || null,
          summary: t.summary.trim() || null,
          keywords: t.keywords.split(',').map(k => k.trim()).filter(Boolean) || null,
          pdfUrl: t.pdfUrl.trim() || null,
          isActive: t.isActive,
          isPrimary: t.isPrimary,
        }));

      await onSubmit({
        ...formData,
        levelId: formData.levelId || null,
        coverUrl: formData.coverUrl || null,
        translations: translationsArray,
        authors: selectedAuthors.map((id, idx) => ({ authorId: id, orderIndex: idx })),
        genres: selectedGenres.map((g, idx) => ({ genreId: g.id, isPrimary: g.isPrimary || idx === 0 })),
        tags: selectedTags.map(id => ({ tagId: id })),
      });

      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const updateTranslation = (langCode: string, field: string, value: any) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: { ...prev[langCode], [field]: value },
    }));
  };

  const toggleGenre = (genreId: string) => {
    setSelectedGenres(prev => {
      const exists = prev.find(g => g.id === genreId);
      if (exists) {
        return prev.filter(g => g.id !== genreId);
      }
      return [...prev, { id: genreId, isPrimary: prev.length === 0 }];
    });
  };

  const setPrimaryGenre = (genreId: string) => {
    setSelectedGenres(prev => prev.map(g => ({ ...g, isPrimary: g.id === genreId })));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleAuthor = (authorId: string) => {
    setSelectedAuthors(prev =>
      prev.includes(authorId) ? prev.filter(id => id !== authorId) : [...prev, authorId]
    );
  };

  if (!isOpen) return null;

  const currentTrans = translations[selectedLangCode] || {
    title: '', subtitle: '', description: '', summary: '', keywords: '', pdfUrl: '', isActive: true, isPrimary: false
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <h2 className="text-xl font-bold">{isCreating ? 'Crear Nuevo Libro' : 'Editar Libro'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'general'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            General
          </button>
          <button
            onClick={() => setActiveTab('translations')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'translations'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Traducciones
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'relations'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            Relaciones
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)*</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="mi-libro-ejemplo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría*</label>
                    <select
                      value={formData.categoryId}
                      onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {categories.filter(c => !c.isDeleted && c.isActive).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.getName('es')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nivel</label>
                    <select
                      value={formData.levelId}
                      onChange={e => setFormData(prev => ({ ...prev, levelId: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Sin nivel</option>
                      {levels.filter(l => !l.isDeleted && l.isActive).map(level => (
                        <option key={level.id} value={level.id}>{level.getName('es')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dificultad</label>
                    <select
                      value={formData.difficulty}
                      onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="beginner">Principiante</option>
                      <option value="intermediate">Intermedio</option>
                      <option value="advanced">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as BookStatus }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="draft">Borrador</option>
                      <option value="review">En revisión</option>
                      <option value="published">Publicado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL de Portada</label>
                    <input
                      type="url"
                      value={formData.coverUrl}
                      onChange={e => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiempo de lectura (min)</label>
                    <input
                      type="number"
                      value={formData.estimatedReadTime}
                      onChange={e => setFormData(prev => ({ ...prev, estimatedReadTime: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Número de páginas</label>
                    <input
                      type="number"
                      value={formData.pageCount}
                      onChange={e => setFormData(prev => ({ ...prev, pageCount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={e => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Destacado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPremium}
                      onChange={e => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Premium</span>
                  </label>
                </div>
              </div>
            )}

            {/* Translations Tab */}
            {activeTab === 'translations' && (
              <div className="space-y-6">
                {/* Language Tabs */}
                <div className="flex gap-2 flex-wrap">
                  {activeLanguages.map(lang => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLangCode(lang.code)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        selectedLangCode === lang.code
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{lang.displayWithFlag}</span>
                      {translations[lang.code]?.isPrimary && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded">Principal</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Translation Form */}
                <div className="space-y-4 bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700">
                      Contenido en {activeLanguages.find(l => l.code === selectedLangCode)?.displayWithFlag}
                    </h3>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentTrans.isActive}
                          onChange={e => updateTranslation(selectedLangCode, 'isActive', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <span className="text-sm text-slate-600">Activo</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="primaryLang"
                          checked={currentTrans.isPrimary}
                          onChange={() => {
                            setTranslations(prev => {
                              const updated = { ...prev };
                              Object.keys(updated).forEach(key => {
                                updated[key] = { ...updated[key], isPrimary: key === selectedLangCode };
                              });
                              return updated;
                            });
                          }}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <span className="text-sm text-slate-600">Idioma principal</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título*</label>
                    <input
                      type="text"
                      value={currentTrans.title}
                      onChange={e => updateTranslation(selectedLangCode, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Título del libro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={currentTrans.subtitle}
                      onChange={e => updateTranslation(selectedLangCode, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Subtítulo opcional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                    <textarea
                      value={currentTrans.description}
                      onChange={e => updateTranslation(selectedLangCode, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={4}
                      placeholder="Descripción completa del libro..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Resumen corto</label>
                    <textarea
                      value={currentTrans.summary}
                      onChange={e => updateTranslation(selectedLangCode, 'summary', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      rows={2}
                      placeholder="Resumen breve para previews..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Palabras clave (separadas por coma)</label>
                    <input
                      type="text"
                      value={currentTrans.keywords}
                      onChange={e => updateTranslation(selectedLangCode, 'keywords', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="aventura, fantasía, niños"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">URL del PDF</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentTrans.pdfUrl}
                        onChange={e => updateTranslation(selectedLangCode, 'pdfUrl', e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Subir
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      El PDF se almacenará en: book-pdfs/{selectedLangCode}/[slug].pdf
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Relations Tab */}
            {activeTab === 'relations' && (
              <div className="space-y-6">
                {/* Authors */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-semibold text-slate-700">Autores</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {authors.filter(a => !a.isDeleted && a.isActive).map(author => (
                      <button
                        key={author.id}
                        type="button"
                        onClick={() => toggleAuthor(author.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedAuthors.includes(author.id)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {author.getName('es')}
                      </button>
                    ))}
                  </div>
                  {selectedAuthors.length === 0 && (
                    <p className="text-sm text-slate-500 mt-2">Selecciona al menos un autor</p>
                  )}
                </div>

                {/* Genres */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-slate-700">Géneros</h3>
                    <span className="text-xs text-slate-500">(Click derecho para marcar como principal)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres.filter(g => !g.isDeleted && g.isActive).map(genre => {
                      const selected = selectedGenres.find(sg => sg.id === genre.id);
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => toggleGenre(genre.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            if (selected) setPrimaryGenre(genre.id);
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selected
                              ? selected.isPrimary
                                ? 'bg-purple-600 text-white ring-2 ring-yellow-400'
                                : 'bg-purple-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {selected?.isPrimary && '★ '}{genre.getName('es')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tags className="w-5 h-5 text-teal-600" />
                    <h3 className="font-semibold text-slate-700">Etiquetas</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.filter(t => !t.isDeleted && t.isActive).map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag.id)
                            ? 'text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        style={selectedTags.includes(tag.id) ? { backgroundColor: tag.color || '#14B8A6' } : {}}
                      >
                        {tag.getName('es')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Guardando...' : isCreating ? 'Crear Libro' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
