import React, { useState } from 'react';
import {
  Navigation,
  FileText,
  Palette,
  BookOpen,
  Eye,
  Save,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseBookEditorReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookEditor';
import type { UseImageHandlerReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useImageHandler';
import type { UseBookNavigationReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookNavigation';

// Componentes de edición
import { PageLayoutSelector } from '@/src/components/components-for-books/book/create-edits-books/components/PageLayoutSelector';
import { RichTitleEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTitleEditor';
import { RichTextEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTextEditor';

// Componentes visuales
import { ImageControls } from '@/src/components/components-for-books/book/create-edits-books/components/ImageControls';
import { PortadaControls } from '@/src/components/components-for-books/book/create-edits-books/components/portadaControls';
import { BackgroundControls } from '@/src/components/components-for-books/book/create-edits-books/components/BackgroundControls';

// Navegación y metadatos
import { PageNavigation } from '@/src/components/components-for-books/book/create-edits-books/components/PageNavigation';
import { BookMetadataForm } from '@/src/components/components-for-books/book/create-edits-books/components/BookMetadataForm';

// Importar BookViewer
import { BookViewer } from '@/src/components/components-for-books/book/create-edits-books/components/BookViewer';
import { Button } from '@/src/components/ui';

interface BookSidebarProps {
  pages: page[];
  currentPage: number;
  editingState: UseBookEditorReturn;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;

  // Props para BookViewer
  isFlipping: boolean;
  bookKey: number;
  bookRef: React.RefObject<any>;
  onFlip: (data: any) => void;
  onPageClick: (pageNumber: number) => void;

  // Metadatos
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedNivel: number | null;
  autor: string;
  descripcion: string;
  titulo: string;
  portada: File | null;

  // Handlers de metadatos
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  onAutorChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onPortadaChange: (value: File | null) => void;

  // Handlers de configuración
  onLayoutChange: (layout: string) => void;
  onBackgroundChange: (value: string) => void;
  onSave: () => Promise<void>;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export const BookSidebar: React.FC<BookSidebarProps> = ({
  pages,
  currentPage,
  editingState,
  imageHandler,
  navigation,
  isFlipping,
  bookKey,
  bookRef,
  onFlip,
  onPageClick,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedNivel,
  autor,
  descripcion,
  titulo,
  portada,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onNivelChange,
  onAutorChange,
  onDescripcionChange,
  onTituloChange,
  onPortadaChange,
  onLayoutChange,
  onBackgroundChange,
  onSave,
  onAddPage,
  onDeletePage,
}) => {
  const currentPageData = pages[currentPage];
  const [activeSection, setActiveSection] = useState<string | null>('visualizacion');
  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  // Handler para guardar con estado de carga
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Secciones del menú - AÑADIDA VISUALIZACIÓN
  const menuSections = [
    { id: 'visualizacion', icon: Eye, label: 'Visualización', color: 'bg-indigo-500' },
    { id: 'navegacion', icon: Navigation, label: 'Navegación', color: 'bg-blue-500' },
    { id: 'contenido', icon: FileText, label: 'Contenido', color: 'bg-green-500' },
    { id: 'visual', icon: Palette, label: 'Visual', color: 'bg-purple-500' },
    { id: 'libro', icon: BookOpen, label: 'Libro', color: 'bg-orange-500' }
  ];

  if (!currentPageData) return null;

  // Renderizar contenido de cada sección
  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'visualizacion':
        return null;

      case 'navegacion':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Navegación de Páginas
              </h4>
              <PageNavigation
                currentPage={currentPage}
                totalPages={pages.length}
                canGoNext={navigation.canGoNext}
                canGoPrev={navigation.canGoPrev}
                isFlipping={false}
                onGoToPage={navigation.goToPage}
                onNextPage={navigation.nextPage}
                onPrevPage={navigation.prevPage}
                onAddPage={onAddPage}
                onDeletePage={onDeletePage}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Layout de Página
              </h4>
              <PageLayoutSelector
                currentLayout={currentPageData.layout}
                pageNumber={currentPage + 1}
                onLayoutChange={onLayoutChange}
              />
            </div>
          </div>
        );

      case 'contenido':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Editor de Título
              </h4>
              <RichTitleEditor
                isEditing={editingState.editingField === 'title'}
                currentTitle={editingState.getCurrentTitle()}
                editingTitle={editingState.editingTitle}
                pageNumber={currentPage + 1}
                onStartEdit={() => editingState.startEdit('title')}
                onSave={() => editingState.saveField('title')}
                onCancel={() => editingState.cancelEdit('title')}
                onTitleChange={editingState.setEditingTitle}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Editor de Contenido
              </h4>
              <RichTextEditor
                isEditing={editingState.editingField === 'text'}
                currentText={editingState.getCurrentText()}
                editingText={editingState.editingText}
                pageNumber={currentPage + 1}
                onStartEdit={() => editingState.startEdit('text')}
                onSave={() => editingState.saveField('text')}
                onCancel={() => editingState.cancelEdit('text')}
                onTextChange={editingState.setEditingText}
              />
            </div>
          </div>
        );

      case 'visual':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Fondo de Página
              </h4>
              <BackgroundControls
                currentBackground={currentPageData.background}
                hasBackground={!!currentPageData.background}
                pageNumber={currentPage + 1}
                onBackgroundChange={onBackgroundChange}
                onBackgroundFileChange={imageHandler.handleBackgroundFile}
                onRemoveBackground={imageHandler.removeBackground}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Imagen Principal
              </h4>
              <ImageControls
                hasImage={!!currentPageData.image}
                pageNumber={currentPage + 1}
                onImageChange={imageHandler.handleImageChange}
                onRemoveImage={imageHandler.removeImage}
              />
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3 text-gray-700">
                Portada del Libro
              </h4>
              <PortadaControls onImageChange={onPortadaChange} />
            </div>
          </div>
        );

      case 'libro':
        return (
          <div>
            <h4 className="text-sm font-medium mb-3 text-gray-700">
              Metadatos del Libro
            </h4>
            <BookMetadataForm
              selectedCategorias={selectedCategorias}
              selectedGeneros={selectedGeneros}
              selectedEtiquetas={selectedEtiquetas}
              selectedNivel={selectedNivel}
              autor={autor}
              descripcion={descripcion}
              titulo={titulo}
              onCategoriasChange={onCategoriasChange}
              onGenerosChange={onGenerosChange}
              onEtiquetasChange={onEtiquetasChange}
              onNivelChange={onNivelChange}
              onAutorChange={onAutorChange}
              onDescripcionChange={onDescripcionChange}
              onTituloChange={onTituloChange}
              onSave={handleSave}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">

      {/* Header con título */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="font-bold text-gray-800 text-xl">
          🛠️ Panel de Edición
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="p-1.5 hover:bg-white rounded disabled:opacity-50 transition-colors"
            disabled={!navigation.canGoPrev}
            onClick={navigation.prevPage}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1.5 bg-white rounded text-gray-700 font-medium min-w-[70px] text-center shadow-sm">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            className="p-1.5 hover:bg-white rounded disabled:opacity-50 transition-colors"
            disabled={!navigation.canGoNext}
            onClick={navigation.nextPage}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Menú de pestañas horizontal */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {menuSections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`
              flex-1 flex flex-col items-center gap-2 py-4 px-4 transition-all duration-200
              ${isActive
                  ? `${section.color} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-gray-100'
                }
            `}
              title={section.label}
            >
              <Icon size={24} />
              <span className="font-medium text-sm">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* BookViewer - SIEMPRE MONTADO pero visible solo cuando activeSection === 'visualizacion' */}
      <div className={`flex-1 ${activeSection === 'visualizacion' ? 'block' : 'hidden'}`}>
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
          <BookViewer
            bookRef={bookRef}
            pages={pages}
            currentPage={currentPage}
            isFlipping={isFlipping}
            bookKey={bookKey}
            onFlip={onFlip}
            onPageClick={onPageClick}
          />
        </div>
      </div>

      {/* Contenido de otras secciones */}
      {activeSection && activeSection !== 'visualizacion' && (
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto p-6">
            {renderSectionContent(activeSection)}
          </div>
        </div>
      )}

      {/* Footer con botón guardar */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-green-600"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold">Guardando...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span className="font-semibold">Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};