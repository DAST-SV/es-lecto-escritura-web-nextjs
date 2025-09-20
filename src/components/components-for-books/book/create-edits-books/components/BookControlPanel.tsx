import React from 'react';
import type { page } from '@/src/typings/types-page-book/index';
import type { UseBookEditorReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookEditor';
import type { UseImageHandlerReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useImageHandler';
import type { UseBookNavigationReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookNavigation';

// Importar todos los componentes
import { PageLayoutSelector } from '@/src/components/components-for-books/book/create-edits-books/components/PageLayoutSelector';
import { TitleEditor } from '@/src/components/components-for-books/book/create-edits-books/components/TitleEditor';
import { TextEditor } from '@/src/components/components-for-books/book/create-edits-books/components/TextEditor';
import { ImageControls } from '@/src/components/components-for-books/book/create-edits-books/components/ImageControls';
import { BackgroundControls } from '@/src/components/components-for-books/book/create-edits-books/components/BackgroundControls';
import { FontSelector } from '@/src/components/components-for-books/book/create-edits-books/components/FontSelector';
import { ColorSelector } from '@/src/components/components-for-books/book/create-edits-books/components/ColorSelector';
import { PageNavigation } from '@/src/components/components-for-books/book/create-edits-books/components/PageNavigation';
import { BookMetadataForm } from '@/src/components/components-for-books/book/create-edits-books/components/BookMetadataForm';

interface BookControlPanelProps {
  pages: page[];
  currentPage: number;
  editingState: UseBookEditorReturn;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;
  
  // Props de metadatos
  selectedCategoria: number | null;
  selectedGenero: number | null;
  descripcion: string;
  onCategoriaChange: (value: number | null) => void;
  onGeneroChange: (value: number | null) => void;
  onDescripcionChange: (value: string) => void;
  
  // Handlers de configuración
  onLayoutChange: (layout: string) => void;
  onFontChange: (font: string) => void;
  onBackgroundChange: (value: string) => void;
  onTextColorChange: (color: string) => void;
  onSave: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export const BookControlPanel: React.FC<BookControlPanelProps> = ({
  pages,
  currentPage,
  editingState,
  imageHandler,
  navigation,
  selectedCategoria,
  selectedGenero,
  descripcion,
  onCategoriaChange,
  onGeneroChange,
  onDescripcionChange,
  onLayoutChange,
  onFontChange,
  onBackgroundChange,
  onTextColorChange,
  onSave,
  onAddPage,
  onDeletePage
}) => {
  const currentPageData = pages[currentPage];
  if (!currentPageData) return null;

  return (
    <div className="lg:w-96 bg-white rounded-xl shadow-xl p-6 border border-gray-100 h-fit max-h-screen overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="mr-2">📚</span> Editor de Libro
      </h2>

      {/* Selector de Layout */}
      <PageLayoutSelector
        currentLayout={currentPageData.layout}
        pageNumber={currentPage + 1}
        onLayoutChange={onLayoutChange}
      />

      {/* Editor de título */}
      <TitleEditor
        isEditing={editingState.editingField === 'title'}
        currentTitle={editingState.getCurrentTitle()}
        editingTitle={editingState.editingTitle}
        pageNumber={currentPage + 1}
        onStartEdit={() => editingState.startEdit('title')}
        onSave={() => editingState.saveField('title')}
        onCancel={() => editingState.cancelEdit('title')}
        onTitleChange={editingState.setEditingTitle}
      />

      {/* Editor de texto */}
      <TextEditor
        isEditing={editingState.editingField === 'text'}
        currentText={editingState.getCurrentText()}
        editingText={editingState.editingText}
        pageNumber={currentPage + 1}
        onStartEdit={() => editingState.startEdit('text')}
        onSave={() => editingState.saveField('text')}
        onCancel={() => editingState.cancelEdit('text')}
        onTextChange={editingState.setEditingText}
      />

      {/* Control de imagen */}
      <ImageControls
        hasImage={!!currentPageData.image}
        pageNumber={currentPage + 1}
        onImageChange={imageHandler.handleImageChange}
        onRemoveImage={imageHandler.removeImage}
      />

      {/* Control de fondo */}
      <BackgroundControls
        currentBackground={currentPageData.background}
        hasBackground={!!currentPageData.background}
        pageNumber={currentPage + 1}
        onBackgroundChange={onBackgroundChange}
        onBackgroundFileChange={imageHandler.handleBackgroundFile}
        onRemoveBackground={imageHandler.removeBackground}
      />

      {/* Control de fuente */}
      <FontSelector
        currentFont={currentPageData.font || 'Arial'}
        pageNumber={currentPage + 1}
        onFontChange={onFontChange}
      />

      {/* Control de color de texto */}
      <ColorSelector
        currentColor={currentPageData.textColor}
        pageNumber={currentPage + 1}
        onColorChange={onTextColorChange}
      />

      {/* Formulario de metadatos */}
      <BookMetadataForm
        selectedCategoria={selectedCategoria}
        selectedGenero={selectedGenero}
        descripcion={descripcion}
        onCategoriaChange={onCategoriaChange}
        onGeneroChange={onGeneroChange}
        onDescripcionChange={onDescripcionChange}
        onSave={onSave}
      />

      {/* Navegación y control de páginas */}
      <PageNavigation
        currentPage={currentPage}
        totalPages={pages.length}
        canGoNext={navigation.canGoNext}
        canGoPrev={navigation.canGoPrev}
        isFlipping={false} // El isFlipping se maneja en el hook
        onGoToPage={navigation.goToPage}
        onNextPage={navigation.nextPage}
        onPrevPage={navigation.prevPage}
        onAddPage={onAddPage}
        onDeletePage={onDeletePage}
      />
    </div>
  );
};