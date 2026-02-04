/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookFormMultilang.ts
 * ✅ Hook para crear y editar libros con soporte MULTI-IDIOMA
 * Sigue el schema de Supabase: books + book_translations
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { BookPDFService, BookImageService } from '@/src/infrastructure/services/books';
import type { Page } from '@/src/core/domain/types';
import toast from 'react-hot-toast';
import { createClient } from '@/src/infrastructure/config/supabase.config';
import { useLanguages } from '@/src/presentation/hooks/useLanguages';
import { logDetailedError, getUserFriendlyError } from '@/src/infrastructure/utils/error-formatter';

// ============================================
// TIPOS
// ============================================

export interface BookTranslationForm {
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  keywords: string[];
  pdfFile: File | null;
  pdfUrl: string | null;
  isPrimary: boolean;
  isActive: boolean;
}

export type TranslationsState = Record<string, BookTranslationForm>;

interface UseBookFormMultilangProps {
  bookId?: string;
}

// ============================================
// HOOK
// ============================================

export function useBookFormMultilang({ bookId }: UseBookFormMultilangProps = {}) {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const isEditMode = !!bookId;

  // Hook de idiomas
  const {
    activeLanguages,
    defaultLanguage,
    loading: languagesLoading,
    error: languagesError
  } = useLanguages();

  // ============================================
  // ESTADOS BASE (compartidos entre idiomas)
  // ============================================
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Portada compartida
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);

  // Clasificación (compartida)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [selectedGeneros, setSelectedGeneros] = useState<string[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<string[]>([]);
  const [autores, setAutores] = useState<string[]>(['']);

  // Catálogos
  const [categorias, setCategorias] = useState<Array<{ id: string; name: string }>>([]);
  const [niveles, setNiveles] = useState<Array<{ id: string; name: string }>>([]);
  const [generos, setGeneros] = useState<Array<{ id: string; name: string }>>([]);

  // ============================================
  // ESTADOS MULTI-IDIOMA
  // ============================================
  const [translations, setTranslations] = useState<TranslationsState>({});
  const [activeTab, setActiveTab] = useState<string>('');
  const [translationsInitialized, setTranslationsInitialized] = useState(false);

  // PDF Preview (para el tab activo)
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // HELPERS
  // ============================================

  const createEmptyTranslation = useCallback((isPrimary: boolean = false): BookTranslationForm => ({
    title: '',
    subtitle: '',
    description: '',
    summary: '',
    keywords: [],
    pdfFile: null,
    pdfUrl: null,
    isPrimary,
    isActive: true,
  }), []);

  // ============================================
  // INICIALIZACIÓN DE TRADUCCIONES
  // ============================================
  useEffect(() => {
    if (languagesLoading || activeLanguages.length === 0 || translationsInitialized) return;

    const initial: TranslationsState = {};
    activeLanguages.forEach((lang) => {
      initial[lang.code] = createEmptyTranslation(lang.isDefault);
    });
    setTranslations(initial);

    const defaultCode = defaultLanguage?.code || activeLanguages[0]?.code || '';
    setActiveTab(defaultCode);
    setTranslationsInitialized(true);
  }, [activeLanguages, defaultLanguage, languagesLoading, createEmptyTranslation, translationsInitialized]);

  // ============================================
  // CARGA DE CATÁLOGOS
  // ============================================
  useEffect(() => {
    async function loadCatalogs() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        setUserId(user.id);

        // Cargar categorías, niveles y géneros
        const [catsResult, levsResult, gensResult] = await Promise.all([
          supabase.schema('books').from('categories').select('id, slug').eq('is_active', true),
          supabase.schema('books').from('levels').select('id, slug').order('order_index'),
          supabase.schema('books').from('genres').select('id, slug').eq('is_active', true),
        ]);

        if (catsResult.data) {
          setCategorias(catsResult.data.map(c => ({ id: c.id, name: c.slug })));
        }
        if (levsResult.data) {
          setNiveles(levsResult.data.map(l => ({ id: l.id, name: l.slug })));
        }
        if (gensResult.data) {
          setGeneros(gensResult.data.map(g => ({ id: g.id, name: g.slug })));
        }

        // Si es modo edición, cargar el libro
        if (isEditMode && bookId) {
          await loadBook(bookId);
        } else {
          setIsLoadingBook(false);
        }
      } catch (err) {
        logDetailedError('useBookFormMultilang.loadCatalogs', err);
        setError(getUserFriendlyError(err, 'Error al cargar catálogos'));
        setIsLoadingBook(false);
      }
    }

    loadCatalogs();
  }, [bookId, isEditMode, locale, router, supabase]);

  // ============================================
  // CARGAR LIBRO (modo edición)
  // ============================================
  const loadBook = async (bookId: string) => {
    try {
      // 1. Cargar datos base del libro
      const { data: book, error: bookError } = await supabase
        .schema('books')
        .from('books')
        .select('*')
        .eq('id', bookId)
        .is('deleted_at', null)
        .single();

      if (bookError || !book) {
        logDetailedError('useBookFormMultilang.loadBook', bookError);
        toast.error('Libro no encontrado');
        router.push(`/${locale}/books`);
        return;
      }

      setPortadaPreview(book.cover_url || null);
      setSelectedCategoryId(book.category_id || null);
      setSelectedLevelId(book.level_id || null);

      // 2. Cargar traducciones
      const { data: bookTranslations, error: transError } = await supabase
        .schema('books')
        .from('book_translations')
        .select('*')
        .eq('book_id', bookId);

      if (transError) {
        logDetailedError('useBookFormMultilang.loadBook.translations', transError);
      }

      // 3. Mapear traducciones al estado
      if (bookTranslations && bookTranslations.length > 0) {
        const transState: TranslationsState = {};

        activeLanguages.forEach(lang => {
          const existing = bookTranslations.find(t => t.language_code === lang.code);
          if (existing) {
            transState[lang.code] = {
              title: existing.title || '',
              subtitle: existing.subtitle || '',
              description: existing.description || '',
              summary: existing.summary || '',
              keywords: existing.keywords || [],
              pdfFile: null,
              pdfUrl: existing.pdf_url || null,
              isPrimary: existing.is_primary || false,
              isActive: existing.is_active ?? true,
            };
          } else {
            transState[lang.code] = createEmptyTranslation(false);
          }
        });

        setTranslations(transState);
      }

      // 4. Cargar autores
      const { data: authorRels } = await supabase
        .schema('books')
        .from('book_authors')
        .select('authors(name)')
        .eq('book_id', bookId);

      if (authorRels && authorRels.length > 0) {
        const names = authorRels
          .map((r: any) => r.authors?.name)
          .filter(Boolean);
        setAutores(names.length > 0 ? names : ['']);
      }

      // 5. Cargar géneros
      const { data: genreRels } = await supabase
        .schema('books')
        .from('book_genres')
        .select('genre_id')
        .eq('book_id', bookId);

      if (genreRels) {
        setSelectedGeneros(genreRels.map(g => g.genre_id));
      }

      setIsLoadingBook(false);
      toast.success('Libro cargado');

    } catch (err) {
      logDetailedError('useBookFormMultilang.loadBook', err);
      setError(getUserFriendlyError(err, 'Error al cargar el libro'));
      setIsLoadingBook(false);
    }
  };

  // ============================================
  // ACTUALIZAR TRADUCCIÓN
  // ============================================
  const updateTranslation = useCallback((
    langCode: string,
    field: keyof BookTranslationForm,
    value: unknown
  ) => {
    setTranslations(prev => ({
      ...prev,
      [langCode]: {
        ...prev[langCode],
        [field]: value,
      }
    }));
  }, []);

  const setPrimaryLanguage = useCallback((langCode: string) => {
    setTranslations(prev => {
      const updated: TranslationsState = {};
      Object.keys(prev).forEach(code => {
        updated[code] = {
          ...prev[code],
          isPrimary: code === langCode,
        };
      });
      return updated;
    });
  }, []);

  // ============================================
  // GETTERS DEL TAB ACTIVO
  // ============================================
  const currentTranslation = translations[activeTab] || createEmptyTranslation();
  const titulo = currentTranslation.title;
  const descripcion = currentTranslation.description;
  const pdfFile = currentTranslation.pdfFile;
  const currentPdfUrl = currentTranslation.pdfUrl;
  const hasPDF = !!currentPdfUrl || !!pdfFile;

  // Setters del tab activo
  const setTitulo = (value: string) => updateTranslation(activeTab, 'title', value);
  const setDescripcion = (value: string) => updateTranslation(activeTab, 'description', value);
  const setSubtitulo = (value: string) => updateTranslation(activeTab, 'subtitle', value);
  const setSummary = (value: string) => updateTranslation(activeTab, 'summary', value);
  const setKeywords = (value: string[]) => updateTranslation(activeTab, 'keywords', value);
  const setPdfFile = (file: File | null) => updateTranslation(activeTab, 'pdfFile', file);

  // ============================================
  // HANDLERS
  // ============================================

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
      setPdfError('Solo archivos PDF');
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setPdfError('Máximo 50MB');
      return;
    }

    updateTranslation(activeTab, 'pdfFile', file);
    setPdfError('');
    setExtractedPages([]);

    // Auto-fill title from filename if empty
    if (!currentTranslation.title.trim()) {
      updateTranslation(activeTab, 'title', file.name.replace('.pdf', ''));
    }

    // Extract pages for preview
    setIsExtractingPages(true);
    try {
      const { PDFExtractorService } = await import('@/src/infrastructure/services/books');
      const result = await PDFExtractorService.extractPagesFromPDF(file);

      setExtractedPages(result.pages);

      if (result.pageWidth && result.pageHeight) {
        setPdfDimensions({ width: result.pageWidth, height: result.pageHeight });
      }
      toast.success('PDF procesado');
    } catch (err) {
      logDetailedError('useBookFormMultilang.handlePDFChange', err);
      setPdfError('Error al procesar PDF');
      toast.error('Error procesando PDF');
    } finally {
      setIsExtractingPages(false);
    }
  };

  // ============================================
  // VALIDACIÓN
  // ============================================
  const isFormValid = useMemo(() => {
    // Al menos un idioma con título y descripción
    const hasValidTranslation = Object.values(translations).some(
      t => t.title.trim() !== '' && t.description.trim() !== ''
    );

    // Al menos un idioma con PDF
    const hasAnyPDF = Object.values(translations).some(
      t => t.pdfFile !== null || t.pdfUrl !== null
    );

    return (
      hasValidTranslation &&
      hasAnyPDF &&
      selectedCategoryId !== null &&
      selectedLevelId !== null &&
      autores.some(a => a.trim())
    );
  }, [translations, selectedCategoryId, selectedLevelId, autores]);

  // ============================================
  // GUARDAR
  // ============================================
  const handleSave = async () => {
    try {
      if (!userId || !isFormValid) {
        setError('Completa los campos obligatorios');
        toast.error('Completa todos los campos obligatorios');
        return;
      }

      setIsLoading(true);
      setError('');

      const finalBookId = bookId || crypto.randomUUID();
      const slug = Object.values(translations)
        .find(t => t.isPrimary)?.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || finalBookId;

      // 1. Subir portada si hay nueva
      let coverUrl: string | null = portadaPreview;
      if (portadaFile) {
        console.log('📤 Subiendo portada...');
        const result = await BookImageService.uploadImage(
          portadaFile,
          userId,
          finalBookId,
          'portada'
        );
        if (result.success && result.url) {
          coverUrl = result.url;
        }
      }

      // 2. Crear/actualizar libro base
      const bookData = {
        id: finalBookId,
        slug,
        category_id: selectedCategoryId,
        level_id: selectedLevelId,
        cover_url: coverUrl,
        created_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (isEditMode) {
        const { error: updateError } = await supabase
          .schema('books')
          .from('books')
          .update(bookData)
          .eq('id', finalBookId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .schema('books')
          .from('books')
          .insert({
            ...bookData,
            status: 'draft',
            created_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      // 3. Guardar traducciones
      for (const [langCode, trans] of Object.entries(translations)) {
        if (!trans.title.trim()) continue; // Skip empty translations

        // Subir PDF si hay nuevo
        let pdfUrl = trans.pdfUrl;
        if (trans.pdfFile) {
          console.log(`📤 Subiendo PDF para ${langCode}...`);
          const { url, error: pdfUploadError } = await BookPDFService.uploadPDF(
            trans.pdfFile,
            userId,
            finalBookId,
            langCode
          );
          if (pdfUploadError) {
            console.error(`Error subiendo PDF ${langCode}:`, pdfUploadError);
          } else {
            pdfUrl = url;
          }
        }

        const translationData = {
          book_id: finalBookId,
          language_code: langCode,
          title: trans.title,
          subtitle: trans.subtitle || null,
          description: trans.description || null,
          summary: trans.summary || null,
          keywords: trans.keywords.length > 0 ? trans.keywords : null,
          pdf_url: pdfUrl,
          is_primary: trans.isPrimary,
          is_active: trans.isActive,
          updated_at: new Date().toISOString(),
        };

        // Upsert translation
        const { error: transError } = await supabase
          .schema('books')
          .from('book_translations')
          .upsert(translationData, {
            onConflict: 'book_id,language_code',
          });

        if (transError) {
          logDetailedError(`useBookFormMultilang.handleSave.translation.${langCode}`, transError);
        }
      }

      // 4. Guardar géneros
      if (selectedGeneros.length > 0) {
        await supabase
          .schema('books')
          .from('book_genres')
          .delete()
          .eq('book_id', finalBookId);

        await supabase
          .schema('books')
          .from('book_genres')
          .insert(selectedGeneros.map(gid => ({ book_id: finalBookId, genre_id: gid })));
      }

      // 5. Cleanup
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/books');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }

      toast.success(isEditMode ? 'Libro actualizado' : 'Libro creado');
      router.push(`/${locale}/books/${finalBookId}/read`);

    } catch (err) {
      logDetailedError('useBookFormMultilang.handleSave', err);
      const errorMsg = getUserFriendlyError(err, 'Error al guardar el libro');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // COMPUTED VALUES
  // ============================================
  const shouldShowPreview = useMemo(() => {
    return (
      titulo.trim() !== '' ||
      descripcion.trim() !== '' ||
      portadaPreview !== null ||
      autores.some(a => a.trim())
    );
  }, [titulo, descripcion, portadaPreview, autores]);

  const translationProgress = useMemo(() => {
    const total = activeLanguages.length;
    const completed = Object.values(translations).filter(
      t => t.title.trim() !== '' && t.description.trim() !== ''
    ).length;
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  }, [translations, activeLanguages]);

  // ============================================
  // RETURN
  // ============================================
  return {
    // Estado de carga
    isLoadingBook: isLoadingBook || languagesLoading,
    isLoading,
    error: error || languagesError,
    isEditMode,

    // Idiomas
    activeLanguages,
    defaultLanguage,
    activeTab,
    setActiveTab,
    translations,
    translationProgress,

    // Traducciones del tab activo
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    currentTranslation,
    updateTranslation,
    setPrimaryLanguage,
    setSubtitulo,
    setSummary,
    setKeywords,

    // Base (compartido)
    autores,
    setAutores,
    portadaFile,
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

    // Catálogos
    categorias,
    niveles,
    generos,

    // PDF del tab activo
    pdfFile,
    setPdfFile,
    currentPdfUrl,
    hasPDF,
    extractedPages,
    pdfDimensions,
    isExtractingPages,
    pdfError,
    setPdfError,
    showPreview,
    setShowPreview,

    // Handlers
    handlePortadaChange,
    handlePDFChange,
    handleSave,

    // Validación
    isFormValid,
    shouldShowPreview,
  };
}
