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

// Tipo para autores (usuarios del sistema)
export interface BookAuthor {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'author' | 'illustrator' | 'translator' | 'editor';
}

// Tipo para personajes del libro
export interface BookCharacter {
  id?: string;
  name: string;
  description?: string;
  role: 'main' | 'secondary' | 'supporting';
}

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
  const [selectedValores, setSelectedValores] = useState<string[]>([]);
  const [characters, setCharacters] = useState<BookCharacter[]>([]);

  // Autores (usuarios del sistema)
  const [selectedAuthors, setSelectedAuthors] = useState<BookAuthor[]>([]);
  // Legacy: mantener para compatibilidad temporal
  const [autores, setAutores] = useState<string[]>(['']);

  // Catálogos (con traducciones según idioma del usuario)
  const [categorias, setCategorias] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [niveles, setNiveles] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [generos, setGeneros] = useState<Array<{ id: string; slug: string; name: string }>>([]);

  // Información del usuario actual (para autores)
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
  } | null>(null);

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
  // CARGA DE CATÁLOGOS (con traducciones según idioma del usuario)
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

        // Obtener información del usuario actual para autores
        const { data: userProfile } = await supabase
          .schema('app')
          .from('user_profiles')
          .select('display_name, full_name, avatar_url')
          .eq('user_id', user.id)
          .single();

        setCurrentUser({
          id: user.id,
          email: user.email || '',
          displayName: userProfile?.display_name || userProfile?.full_name || user.email?.split('@')[0] || 'Usuario',
          avatarUrl: userProfile?.avatar_url || null,
        });

        // Cargar categorías, niveles y géneros con sus traducciones
        // Usamos LEFT JOIN (sin !inner) para obtener datos aunque no haya traducción
        const [catsResult, levsResult, gensResult, catsTransResult, levsTransResult, gensTransResult] = await Promise.all([
          // Datos base
          supabase
            .schema('books')
            .from('categories')
            .select('id, slug, order_index')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('order_index'),

          supabase
            .schema('books')
            .from('levels')
            .select('id, slug, order_index')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('order_index'),

          supabase
            .schema('books')
            .from('genres')
            .select('id, slug, order_index')
            .eq('is_active', true)
            .is('deleted_at', null)
            .order('order_index'),

          // Traducciones por separado
          supabase
            .schema('books')
            .from('category_translations')
            .select('category_id, name')
            .eq('language_code', locale),

          supabase
            .schema('books')
            .from('level_translations')
            .select('level_id, name')
            .eq('language_code', locale),

          supabase
            .schema('books')
            .from('genre_translations')
            .select('genre_id, name')
            .eq('language_code', locale),
        ]);

        // Debug: mostrar resultados de queries
        console.log('📚 [BookForm] Catalogs loaded:', {
          categories: catsResult.data?.length || 0,
          levels: levsResult.data?.length || 0,
          genres: gensResult.data?.length || 0,
          catsTrans: catsTransResult.data?.length || 0,
          levsTrans: levsTransResult.data?.length || 0,
          gensTrans: gensTransResult.data?.length || 0,
          locale,
          errors: {
            cats: catsResult.error,
            levs: levsResult.error,
            gens: gensResult.error,
            catsTrans: catsTransResult.error,
            levsTrans: levsTransResult.error,
            gensTrans: gensTransResult.error,
          }
        });

        // Crear mapas de traducciones
        const catsTransMap = new Map((catsTransResult.data || []).map(t => [t.category_id, t.name]));
        const levsTransMap = new Map((levsTransResult.data || []).map(t => [t.level_id, t.name]));
        const gensTransMap = new Map((gensTransResult.data || []).map(t => [t.genre_id, t.name]));

        // Mapear categorías con nombre traducido (fallback a slug si no hay traducción)
        if (catsResult.data) {
          setCategorias(catsResult.data.map(c => ({
            id: c.id,
            slug: c.slug,
            name: catsTransMap.get(c.id) || c.slug,
          })));
        }

        // Mapear niveles con nombre traducido
        if (levsResult.data) {
          setNiveles(levsResult.data.map(l => ({
            id: l.id,
            slug: l.slug,
            name: levsTransMap.get(l.id) || l.slug,
          })));
        }

        // Mapear géneros con nombre traducido
        if (gensResult.data) {
          setGeneros(gensResult.data.map(g => ({
            id: g.id,
            slug: g.slug,
            name: gensTransMap.get(g.id) || g.slug,
          })));
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

      // 6. Cargar etiquetas
      const { data: tagRels } = await supabase
        .schema('books')
        .from('book_tags')
        .select('tag_id')
        .eq('book_id', bookId);

      if (tagRels) {
        setSelectedEtiquetas(tagRels.map(t => t.tag_id));
      }

      // 7. Cargar valores
      const { data: valueRels } = await supabase
        .schema('books')
        .from('book_values')
        .select('value_id')
        .eq('book_id', bookId);

      if (valueRels) {
        setSelectedValores(valueRels.map(v => v.value_id));
      }

      // 8. Cargar personajes
      const { data: bookCharacters } = await supabase
        .schema('books')
        .from('book_characters')
        .select('id, name, description, role, order_index')
        .eq('book_id', bookId)
        .order('order_index');

      if (bookCharacters) {
        setCharacters(bookCharacters.map(c => ({
          id: c.id,
          name: c.name,
          description: c.description || undefined,
          role: c.role as 'main' | 'secondary' | 'supporting',
        })));
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
      selectedAuthors.length > 0
    );
  }, [translations, selectedCategoryId, selectedLevelId, selectedAuthors]);

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
      await supabase
        .schema('books')
        .from('book_genres')
        .delete()
        .eq('book_id', finalBookId);

      if (selectedGeneros.length > 0) {
        await supabase
          .schema('books')
          .from('book_genres')
          .insert(selectedGeneros.map(gid => ({ book_id: finalBookId, genre_id: gid })));
      }

      // 5. Guardar etiquetas
      await supabase
        .schema('books')
        .from('book_tags')
        .delete()
        .eq('book_id', finalBookId);

      if (selectedEtiquetas.length > 0) {
        await supabase
          .schema('books')
          .from('book_tags')
          .insert(selectedEtiquetas.map(tid => ({ book_id: finalBookId, tag_id: tid })));
      }

      // 6. Guardar valores
      await supabase
        .schema('books')
        .from('book_values')
        .delete()
        .eq('book_id', finalBookId);

      if (selectedValores.length > 0) {
        await supabase
          .schema('books')
          .from('book_values')
          .insert(selectedValores.map(vid => ({ book_id: finalBookId, value_id: vid })));
      }

      // 7. Guardar personajes
      await supabase
        .schema('books')
        .from('book_characters')
        .delete()
        .eq('book_id', finalBookId);

      if (characters.length > 0) {
        await supabase
          .schema('books')
          .from('book_characters')
          .insert(characters.map((char, idx) => ({
            book_id: finalBookId,
            name: char.name,
            description: char.description || null,
            role: char.role,
            order_index: idx,
          })));
      }

      // 8. Cleanup
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/books');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }

      toast.success(isEditMode ? 'Libro actualizado' : 'Libro creado');
      // Redirigir a la lista de mis libros (no a leer)
      router.push(`/${locale}/books?new=${finalBookId}`);

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
      selectedAuthors.length > 0
    );
  }, [titulo, descripcion, portadaPreview, selectedAuthors]);

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
    selectedAuthors,
    setSelectedAuthors,
    currentUser,
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
    selectedValores,
    setSelectedValores,
    characters,
    setCharacters,

    // Catálogos (legacy - pueden usarse con CatalogSelector)
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
