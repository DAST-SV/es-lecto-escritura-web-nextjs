'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Page {
  id: string;
  layout: string;
  title: string;
  text: string;
  image: string;
  background: string;
}

interface BookEditorProps {
  IdLibro?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

export function BookEditor({ IdLibro }: BookEditorProps) {
  const router = useRouter();

  const [bookState, setBookState] = useState<{ pages: Page[] }>({ pages: [] });
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [autores, setAutores] = useState<string[]>([]);
  const [personajes, setPersonajes] = useState<string[]>([]);
  const [portada, setPortada] = useState<File | null>(null);
  const [portadaUrl, setPortadaUrl] = useState<string>('');
  const [cardBackgroundImage, setCardBackgroundImage] = useState<File | null>(null);
  const [cardBackgroundUrl, setCardBackgroundUrl] = useState<string>('');
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([]);
  const [selectedGeneros, setSelectedGeneros] = useState<number[]>([]);
  const [selectedEtiquetas, setSelectedEtiquetas] = useState<number[]>([]);
  const [selectedValores, setSelectedValores] = useState<number[]>([]);
  const [selectedNivel, setSelectedNivel] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (IdLibro) {
      loadBookData();
    }
  }, [IdLibro]);

  const loadBookData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/books/${IdLibro}`);
      if (!response.ok) throw new Error('No se pudo cargar el libro');
      
      const { libro } = await response.json();
      
      setTitulo(libro.titulo || '');
      setDescripcion(libro.descripcion || '');
      setAutores(libro.autores || []);
      setPersonajes(libro.personajes || []);
      setPortadaUrl(libro.portada || '');
      setSelectedNivel(libro.nivel?.id_nivel || 1);
      
      const pages = (libro.paginas || []).map((p: any, idx: number) => ({
        id: `page-${idx}`,
        layout: p.layout || 'TextCenterLayout',
        title: p.title || '',
        text: p.text || '',
        image: p.image || '',
        background: p.background || 'blanco',
      }));
      
      setBookState({ pages });
      
    } catch (error: any) {
      console.error('Error cargando libro:', error);
      toast.error('Error al cargar el libro');
    } finally {
      setIsLoading(false);
    }
  };

  const validateBook = useCallback(() => {
    const errors: ValidationError[] = [];
    
    if (!titulo || titulo.trim() === '') {
      errors.push({ field: 'Título', message: 'El título es obligatorio' });
    }
    
    if (!bookState.pages || bookState.pages.length === 0) {
      errors.push({ field: 'Páginas', message: 'Debes crear al menos una página' });
    }
    
    return errors;
  }, [titulo, bookState.pages]);

  const handleSave = useCallback(async () => {
    console.log('INICIANDO GUARDADO');
    console.log('Total de páginas:', bookState.pages.length);
    console.log('ID del libro:', IdLibro);

    if (!bookState.pages || bookState.pages.length === 0) {
      toast.error('No puedes guardar un libro sin páginas', {
        duration: 4000,
        style: { zIndex: 99999 }
      });
      setValidationErrors([{
        field: 'Páginas',
        message: 'Debes crear al menos una página antes de guardar'
      }]);
      setShowValidation(true);
      return;
    }

    const errors = validateBook();
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error('Por favor corrige los errores antes de guardar', {
        duration: 5000,
        style: { zIndex: 99999 }
      });
      return;
    }

    setIsSaving(true);
    setLoadingStatus('loading');
    setLoadingMessage('Guardando libro y páginas...');

    try {
      let userId: string | undefined;
      if (!IdLibro) {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Usuario no autenticado. Por favor inicia sesión nuevamente.');
        }
        const user = JSON.parse(userStr);
        userId = user.id;
      }

      const bookData = {
        userId,
        titulo: titulo,
        descripcion: descripcion || '',
        portada: portadaUrl || cardBackgroundUrl || null,
        autores: autores || [],
        personajes: personajes || [],
        categorias: (selectedCategorias || []).map(c => Number(c)),
        generos: (selectedGeneros || []).map(g => Number(g)),
        etiquetas: (selectedEtiquetas || []).map(e => Number(e)),
        valores: (selectedValores || []).map(v => Number(v)),
        nivel: selectedNivel || 1,
        pages: bookState.pages.map(page => ({
          layout: page.layout || 'TextCenterLayout',
          title: page.title || '',
          text: page.text || '',
          image: page.image || '',
          background: page.background || 'blanco',
        })),
      };

      let result;

      if (IdLibro) {
        const response = await fetch(`/api/books/${IdLibro}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Error al actualizar libro');
        }
      } else {
        const response = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Error al crear libro');
        }
      }

      setLoadingStatus('success');
      setLoadingMessage('Tu libro ha sido guardado correctamente');
      toast.success('Libro guardado exitosamente', {
        duration: 3000,
        style: { zIndex: 99999 }
      });

      setTimeout(() => {
        window.location.href = '/dashboard/mis-libros';
      }, 2000);

    } catch (error: any) {
      console.error('Error guardando libro:', error);
      setLoadingStatus('error');
      setLoadingMessage(error.message || 'Ocurrió un error al guardar el libro.');
      toast.error('Error al guardar: ' + error.message, {
        duration: 5000,
        style: { zIndex: 99999 }
      });

      setTimeout(() => {
        setLoadingStatus('idle');
        setIsSaving(false);
      }, 3000);
    }
  }, [
    bookState.pages,
    IdLibro,
    validateBook,
    titulo,
    descripcion,
    autores,
    personajes,
    portada,
    portadaUrl,
    cardBackgroundImage,
    cardBackgroundUrl,
    selectedCategorias,
    selectedGeneros,
    selectedEtiquetas,
    selectedValores,
    selectedNivel
  ]);

  const addPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      layout: 'TextCenterLayout',
      title: '',
      text: '',
      image: '',
      background: 'blanco',
    };
    setBookState(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    toast.success('Página agregada');
  };

  const updatePage = (index: number, field: keyof Page, value: string) => {
    setBookState(prev => {
      const newPages = [...prev.pages];
      newPages[index] = { ...newPages[index], [field]: value };
      return { ...prev, pages: newPages };
    });
  };

  const deletePage = (index: number) => {
    if (bookState.pages.length === 1) {
      toast.error('Debe haber al menos una página');
      return;
    }
    setBookState(prev => ({
      ...prev,
      pages: prev.pages.filter((_, i) => i !== index)
    }));
    toast.success('Página eliminada');
  };

  const addAutor = (nombre: string) => {
    if (!nombre.trim()) return;
    setAutores(prev => [...prev, nombre.trim()]);
  };

  const removeAutor = (index: number) => {
    setAutores(prev => prev.filter((_, i) => i !== index));
  };

  const addPersonaje = (nombre: string) => {
    if (!nombre.trim()) return;
    setPersonajes(prev => [...prev, nombre.trim()]);
  };

  const removePersonaje = (index: number) => {
    setPersonajes(prev => prev.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando libro...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {IdLibro ? 'Editar Libro' : 'Crear Libro Nuevo'}
      </h1>

      {showValidation && validationErrors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Errores de validación:</p>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error.field}: {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Título del libro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Descripción del libro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Autores</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre del autor"
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addAutor(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addAutor(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {autores.map((autor, idx) => (
              <span key={idx} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                {autor}
                <button onClick={() => removeAutor(idx)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Personajes</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Nombre del personaje"
              className="flex-1 px-4 py-2 border rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addPersonaje(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                addPersonaje(input.value);
                input.value = '';
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {personajes.map((personaje, idx) => (
              <span key={idx} className="bg-gray-200 px-3 py-1 rounded-full flex items-center gap-2">
                {personaje}
                <button onClick={() => removePersonaje(idx)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nivel de edad</label>
          <select
            value={selectedNivel}
            onChange={(e) => setSelectedNivel(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value={1}>0-3 años</option>
            <option value={2}>4-6 años</option>
            <option value={3}>7-9 años</option>
            <option value={4}>10-12 años</option>
            <option value={5}>13-15 años</option>
            <option value={6}>16-18 años</option>
            <option value={7}>Adultos</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium">Páginas *</label>
            <button
              type="button"
              onClick={addPage}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              + Agregar Página
            </button>
          </div>

          {bookState.pages.map((page, index) => (
            <div key={page.id} className="border p-4 rounded-lg mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Página {index + 1}</h3>
                <button
                  onClick={() => deletePage(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={page.title}
                  onChange={(e) => updatePage(index, 'title', e.target.value)}
                  placeholder="Título de la página"
                  className="w-full px-3 py-2 border rounded"
                />

                <textarea
                  value={page.text}
                  onChange={(e) => updatePage(index, 'text', e.target.value)}
                  placeholder="Texto de la página"
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                />

                <select
                  value={page.layout}
                  onChange={(e) => updatePage(index, 'layout', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="TextCenterLayout">Texto centrado</option>
                  <option value="ImageTextLayout">Imagen y texto</option>
                  <option value="FullImageLayout">Imagen completa</option>
                </select>

                <select
                  value={page.background}
                  onChange={(e) => updatePage(index, 'background', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="blanco">Blanco</option>
                  <option value="azul">Azul</option>
                  <option value="verde">Verde</option>
                  <option value="amarillo">Amarillo</option>
                  <option value="rosa">Rosa</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Guardando...' : IdLibro ? 'Actualizar Libro' : 'Crear Libro'}
          </button>

          <button
            onClick={() => router.back()}
            disabled={isSaving}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>

      {loadingStatus !== 'idle' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            {loadingStatus === 'loading' && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg">{loadingMessage}</p>
              </div>
            )}
            {loadingStatus === 'success' && (
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <p className="text-lg text-green-600">{loadingMessage}</p>
              </div>
            )}
            {loadingStatus === 'error' && (
              <div className="text-center">
                <div className="text-6xl mb-4">×</div>
                <p className="text-lg text-red-600">{loadingMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}