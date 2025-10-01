import React, { useState } from 'react';
import { 
  Navigation, 
  FileText, 
  Palette, 
  BookOpen, 
  PanelLeftClose, 
  PanelLeftOpen,
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

interface BookSidebarProps {
  pages: page[];
  currentPage: number;
  editingState: UseBookEditorReturn;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;

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
  onSave: () => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export const BookSidebar: React.FC<BookSidebarProps> = ({
  pages,
  currentPage,
  editingState,
  imageHandler,
  navigation,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  // Secciones del menú
  const menuSections = [
    { id: 'navegacion', icon: Navigation, label: 'Navegación', color: 'bg-blue-500' },
    { id: 'contenido', icon: FileText, label: 'Contenido', color: 'bg-green-500' },
    { id: 'visual', icon: Palette, label: 'Visual', color: 'bg-purple-500' },
    { id: 'libro', icon: BookOpen, label: 'Libro', color: 'bg-orange-500' }
  ];

  if (!currentPageData) return null;

  // Renderizar contenido de cada sección
  const renderSectionContent = (sectionId: string) => {
    switch(sectionId) {
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
              onSave={onSave}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`
      bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out flex flex-col
      ${isSidebarOpen ? 'w-80' : 'w-16'}
    `}>
      
      {/* Header con toggle */}
      <div className={`flex items-center border-b border-gray-200 ${
        isSidebarOpen ? 'justify-between p-4' : 'justify-center p-2'
      }`}>
        {isSidebarOpen && (
          <h2 className="font-semibold text-gray-800 text-lg">
            🛠️ Herramientas
          </h2>
        )}
        <button
          onClick={toggleSidebar}
          className={`bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-md ${
            isSidebarOpen ? 'p-1.5' : 'p-3 my-2'
          }`}
        >
          {isSidebarOpen ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeftOpen size={20} />
          )}
        </button>
      </div>

      {/* Navegación de secciones con acordeón */}
      <div className="flex-1 overflow-y-auto">
        {menuSections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <div key={section.id} className="border-b border-gray-200">
              {/* Botón de sección */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 transition-all duration-200
                  ${isActive
                    ? `${section.color} text-white`
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  ${!isSidebarOpen ? 'justify-center' : 'justify-between'}
                `}
                title={!isSidebarOpen ? section.label : undefined}
              >
                <div className={`flex items-center gap-3 ${!isSidebarOpen ? '' : ''}`}>
                  <Icon size={18} />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{section.label}</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform duration-200 ${
                      isActive ? 'rotate-90' : ''
                    }`}
                  />
                )}
              </button>

              {/* Contenido desplegable */}
              {isSidebarOpen && isActive && (
                <div className="p-4 bg-gray-50 animate-slideDown">
                  {renderSectionContent(section.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón guardar */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Navegación de páginas rápida - solo cuando está abierto */}
        {isSidebarOpen && (
          <div className="flex items-center gap-2 text-sm">
            <button 
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors"
              disabled={!navigation.canGoPrev}
              onClick={navigation.prevPage}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 bg-gray-100 rounded text-gray-700 font-medium min-w-[70px] text-center">
              {currentPage + 1} / {pages.length}
            </span>
            <button 
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50 transition-colors"
              disabled={!navigation.canGoNext}
              onClick={navigation.nextPage}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
        {/* Botón guardar - siempre visible */}
        <button 
          onClick={onSave}
          className={`
            flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm
            ${isSidebarOpen ? 'w-full px-4 py-3 justify-center' : 'w-full px-2 py-3 justify-center'}
          `}
          title={!isSidebarOpen ? 'Guardar libro' : undefined}
        >
          <Save size={18} />
          {isSidebarOpen && <span className="font-medium">Guardar</span>}
        </button>
      </div>
    </div>
  );
};