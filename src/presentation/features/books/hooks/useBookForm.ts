/**
 * UBICACIÓN: src/presentation/features/books/hooks/useBookForm.ts
 * ✅ Hook compartido para crear y editar libros
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { BookPDFService } from '@/src/infrastructure/services/BookPDFService';
import { BookImageService } from '@/src/infrastructure/services/BookImageService';
import { CreateBookUseCase } from '@/src/core/application/use-cases/books/CreateBook.usecase';
import { UpdateBookUseCase } from '@/src/core/application/use-cases/books/UpdateBook.usecase';
import type { Page } from '@/src/core/domain/types';
import toast from 'react-hot-toast';
import { createClient } from '@/src/infrastructure/config/supabase.config';

interface UseBookFormProps {
  bookId?: string; // Si existe, es modo edición
}

export function useBookForm({ bookId }: UseBookFormProps = {}) {
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();
  const isEditMode = !!bookId;

  // Estados del formulario
  const [isLoadingBook, setIsLoadingBook] = useState(isEditMode);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>(['']);
  const [personajes, setPersonajes] = useState<string[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<number[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [selectedValores, setSelectedValores] = useState<number[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  
  // Estados de archivos
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [portadaFile, setPortadaFile] = useState<File | null>(null);
  const [portadaPreview, setPortadaPreview] = useState<string | null>(null);
  
  // Estados de PDF
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [hasPDF, setHasPDF] = useState(false);
  const [extractedPages, setExtractedPages] = useState<Page[]>([]);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isExtractingPages, setIsExtractingPages] = useState(false);
  const [pdfError, setPdfError] = useState('');
  
  // Estados UI
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados auxiliares
  const [userId, setUserId] = useState<string | null>(null);
  const [niveles, setNiveles] = useState<Array<{ id: number; name: string }>>([]);
  const [selectedLabels, setSelectedLabels] = useState({
    categorias: [] as string[],
    generos: [] as string[],
    etiquetas: [] as string[],
    valores: [] as string[]
  });

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUserId(user.id);

      // Cargar niveles
      const { data: levs } = await supabase
        .from('book_levels')
        .select('id, name')
        .order('id');
      
      setNiveles(levs || []);

      // Si es modo edición, cargar el libro
      if (isEditMode && bookId) {
        await loadBook(bookId, user.id);
      }
    }
    init();
  }, [bookId, isEditMode]);

  // ============================================
  // CARGAR LIBRO (modo edición)
  // ============================================
  async function loadBook(bookId: string, userId: string) {
    try {
      console.log('📖 Cargando libro para editar...');

      // 1. Cargar datos básicos
      const { data: book, error: bookError } = await supabase
        .from('books')
        .select('id, title, description, cover_url, pdf_url, level_id')
        .eq('id', bookId)
        .eq('user_id', userId) // ✅ Verificar propiedad
        .is('deleted_at', null)
        .single();

      if (bookError || !book) {
        toast.error('Libro no encontrado o no tienes permiso');
        router.push(`/${locale}/books`);
        return;
      }

      setTitulo(book.title || '');
      setDescripcion(book.description || '');
      setPortadaPreview(book.cover_url || null);
      setCurrentPdfUrl(book.pdf_url || null);
      setSelectedNivel(book.level_id || null);
      setHasPDF(!!book.pdf_url);

      // 2. Cargar autores
      const { data: authorsRel } = await supabase
        .from('books_authors')
        .select('author_id, author_order')
        .eq('book_id', bookId)
        .order('author_order');

      if (authorsRel && authorsRel.length > 0) {
        const { data: authorsList } = await supabase
          .from('book_authors')
          .select('id, name')
          .in('id', authorsRel.map(a => a.author_id));

        const orderedAuthors = authorsRel
          .map(rel => authorsList?.find(a => a.id === rel.author_id)?.name)
          .filter(Boolean) as string[];
        
        setAutores(orderedAuthors.length > 0 ? orderedAuthors : ['']);
      }

      // 3. Cargar personajes
      const { data: charsRel } = await supabase
        .from('books_characters')
        .select('character_id')
        .eq('book_id', bookId);

      if (charsRel && charsRel.length > 0) {
        const { data: charsList } = await supabase
          .from('book_characters')
          .select('id, name')
          .in('id', charsRel.map(c => c.character_id));

        setPersonajes(charsList?.map(c => c.name) || []);
      }

      // 4. Cargar categorías
      const { data: catsRel } = await supabase
        .from('books_categories')
        .select('category_id')
        .eq('book_id', bookId);

      setSelectedCategorias(catsRel?.map(c => c.category_id) || []);

      // 5. Cargar géneros
      const { data: gensRel } = await supabase
        .from('books_genres')
        .select('genre_id')
        .eq('book_id', bookId);

      setSelectedGeneros(gensRel?.map(g => g.genre_id) || []);

      // 6. Cargar etiquetas
      const { data: tagsRel } = await supabase
        .from('books_tags')
        .select('tag_id')
        .eq('book_id', bookId);

      setSelectedEtiquetas(tagsRel?.map(t => t.tag_id) || []);

      // 7. Cargar valores
      const { data: valsRel } = await supabase
        .from('books_values')
        .select('value_id')
        .eq('book_id', bookId);

      setSelectedValores(valsRel?.map(v => v.value_id) || []);

      // 8. Extraer páginas del PDF actual para preview
      if (book.pdf_url) {
        setIsExtractingPages(true);
        try {
          const response = await fetch(book.pdf_url);
          const blob = await response.blob();
          const file = new File([blob], 'libro.pdf', { type: 'application/pdf' });

          const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
          const result = await PDFExtractorService.extractPagesFromPDF(file);
          
          setExtractedPages(result.pages);
          
          if (result.pageWidth && result.pageHeight) {
            setPdfDimensions({ 
              width: result.pageWidth, 
              height: result.pageHeight 
            });
          }
          console.log(`✅ PDF extraído: ${result.pages.length} páginas`);
        } catch (err) {
          console.error('Error extrayendo PDF:', err);
        } finally {
          setIsExtractingPages(false);
        }
      }

      setIsLoadingBook(false);
      toast.success('Libro cargado');

    } catch (err: any) {
      console.error('❌ Error:', err);
      toast.error('Error al cargar el libro');
      router.push(`/${locale}/books`);
    }
  }

  // ============================================
  // CARGAR LABELS
  // ============================================
  useEffect(() => {
    async function loadLabels() {
      const loadItemNames = async (table: string, ids: number[]) => {
        if (ids.length === 0) return [];
        const { data } = await supabase.from(table).select('name').in('id', ids);
        return data?.map(item => item.name) || [];
      };

      const [cats, gens, tags, vals] = await Promise.all([
        loadItemNames('book_categories', selectedCategorias),
        loadItemNames('book_genres', selectedGeneros),
        loadItemNames('book_tags', selectedEtiquetas),
        loadItemNames('book_values', selectedValores)
      ]);

      setSelectedLabels({ categorias: cats, generos: gens, etiquetas: tags, valores: vals });
    }

    if (selectedCategorias.length > 0 || selectedGeneros.length > 0 || 
        selectedEtiquetas.length > 0 || selectedValores.length > 0) {
      loadLabels();
    }
  }, [selectedCategorias, selectedGeneros, selectedEtiquetas, selectedValores, supabase]);

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
      toast.success('PDF procesado');
    } catch (err) {
      setPdfError('Error al procesar');
      toast.error('Error procesando PDF');
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
      (hasPDF || pdfFile) && // ✅ En edición acepta PDF actual O nuevo
      selectedCategorias.length > 0 &&
      selectedGeneros.length > 0 &&
      selectedNivel !== null
    );
  };

  // ============================================
  // GUARDAR
  // ============================================
  const handleSave = async () => {
    try {
      if (!userId || !isFormValid()) {
        setError('Completa campos obligatorios');
        toast.error('Completa todos los campos obligatorios');
        return;
      }

      setIsLoading(true);
      setError('');

      const finalBookId = bookId || crypto.randomUUID();

      // 1. Subir portada (si hay nueva)
      let portadaUrl: string | undefined = portadaPreview || undefined;
      if (portadaFile) {
        console.log('📤 Subiendo portada...');
        const result = await BookImageService.uploadImage(
          portadaFile, 
          userId, 
          finalBookId, 
          'portada'
        );
        if (result.success && result.url) {
          portadaUrl = result.url;
          console.log('✅ Portada subida');
        }
      }

      // 2. Subir PDF (si hay nuevo)
      let pdfUrl: string | undefined = currentPdfUrl || undefined;
      if (pdfFile) {
        console.log('📤 Subiendo PDF...');
        const { url: newPdfUrl, error: pdfUploadError } = await BookPDFService.uploadPDF(
          pdfFile, 
          userId, 
          finalBookId
        );

        if (pdfUploadError || !newPdfUrl) {
          throw new Error(pdfUploadError || 'Error subiendo PDF');
        }
        pdfUrl = newPdfUrl;
        console.log('✅ PDF subido');
      }

      // 3. Crear o actualizar libro
      if (isEditMode) {
        console.log('💾 Actualizando libro...');
        await UpdateBookUseCase.execute(finalBookId, {
          titulo,
          descripcion,
          portada: portadaUrl,
          autores: autores.filter(a => a.trim()),
          personajes: personajes.filter(p => p.trim()),
          categorias: selectedCategorias,
          generos: selectedGeneros,
          etiquetas: selectedEtiquetas,
          valores: selectedValores,
          nivel: selectedNivel || 1,
        });
        console.log('✅ Libro actualizado');
        toast.success('Libro actualizado correctamente');
      } else {
        console.log('💾 Creando libro...');
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
        console.log('✅ Libro creado');
        toast.success('Libro creado correctamente');
      }

      // 4. Cleanup
      if (extractedPages.length > 0) {
        const { PDFExtractorService } = await import('@/src/infrastructure/services/PDFExtractorService');
        PDFExtractorService.cleanupBlobUrls(extractedPages);
      }

      // Redireccionar a leer
      router.push(`/${locale}/books/${finalBookId}/read`);

    } catch (err: any) {
      console.error('❌ Error guardando:', err);
      setError(err.message || 'Error al guardar');
      toast.error(err.message || 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

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

  return {
    // Estados
    isLoadingBook,
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    autores,
    setAutores,
    personajes,
    setPersonajes,
    selectedCategorias,
    setSelectedCategorias,
    selectedGeneros,
    setSelectedGeneros,
    selectedEtiquetas,
    setSelectedEtiquetas,
    selectedValores,
    setSelectedValores,
    selectedNivel,
    setSelectedNivel,
    pdfFile,
    setPdfFile,
    portadaFile,
    setPortadaFile,
    portadaPreview,
    setPortadaPreview, // ✅ Exportar setter
    currentPdfUrl,
    hasPDF,
    extractedPages,
    pdfDimensions,
    showPreview,
    setShowPreview,
    isExtractingPages,
    isLoading,
    error,
    pdfError,
    setPdfError,
    userId,
    niveles,
    selectedLabels,
    isEditMode,
    shouldShowPreview,
    isFormValid,
    
    // Handlers
    handlePortadaChange,
    handlePDFChange,
    toggleSelection,
    handleSave,
  };
}