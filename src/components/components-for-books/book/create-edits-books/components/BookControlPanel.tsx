import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Save, FileText, Palette, BookOpen, Navigation, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

// 📌 Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseBookEditorReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookEditor';
import type { UseImageHandlerReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useImageHandler';
import type { UseBookNavigationReturn } from '@/src/components/components-for-books/book/create-edits-books/hooks/useBookNavigation';

// 📌 Componentes de edición
import { PageLayoutSelector } from '@/src/components/components-for-books/book/create-edits-books/components/PageLayoutSelector';
import { RichTitleEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTitleEditor';
import { RichTextEditor } from '@/src/components/components-for-books/book/create-edits-books/components/RichTextEditor';

// 📌 Componentes visuales
import { ImageControls } from '@/src/components/components-for-books/book/create-edits-books/components/ImageControls';
import { PortadaControls } from '@/src/components/components-for-books/book/create-edits-books/components/portadaControls';
import { BackgroundControls } from '@/src/components/components-for-books/book/create-edits-books/components/BackgroundControls';

// 📌 Navegación y metadatos
import { PageNavigation } from '@/src/components/components-for-books/book/create-edits-books/components/PageNavigation';
import { BookMetadataForm } from '@/src/components/components-for-books/book/create-edits-books/components/BookMetadataForm';

// --------------------------------------------------
// 📌 Interfaz de Props
// --------------------------------------------------
interface BookControlPanelProps {
  pages: page[];
  currentPage: number;
  editingState: UseBookEditorReturn;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;

  // Metadatos
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autor: string;
  descripcion: string;
  titulo: string;
  portada: File | null;

  // Handlers de metadatos
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
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

// --------------------------------------------------
// 📌 Componente principal
// --------------------------------------------------
export const BookControlPanel: React.FC<BookControlPanelProps> = ({
  pages,
  currentPage,
  editingState,
  imageHandler,
  navigation,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  autor,
  descripcion,
  titulo,
  portada,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
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
  const [activeSection, setActiveSection] = useState('navegacion');

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Definir secciones del menú
  const menuSections = [
    { id: 'navegacion', icon: Navigation, label: 'Navegación', color: 'bg-blue-500' },
    { id: 'contenido', icon: FileText, label: 'Contenido', color: 'bg-green-500' },
    { id: 'visual', icon: Palette, label: 'Visual', color: 'bg-purple-500' },
    { id: 'libro', icon: BookOpen, label: 'Libro', color: 'bg-orange-500' }
  ];

  if (!currentPageData) return null;

  // Renderizar contenido de cada sección
  const renderSectionContent = () => {
    switch(activeSection) {
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
              selectedValores={selectedValores}
              selectedNivel={selectedNivel}
              autor={autor}
              descripcion={descripcion}
              titulo={titulo}
              onCategoriasChange={onCategoriasChange}
              onGenerosChange={onGenerosChange}
              onEtiquetasChange={onEtiquetasChange}
              onValoresChange={onValoresChange}
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
    <>
      {/* 🔹 Sidebar colapsible - Flotante sobre el contenido */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-2xl transition-all duration-300 ease-in-out z-40
        ${isSidebarOpen ? 'w-80' : 'w-16'}
      `}>
        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 z-50 p-1.5 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          {isSidebarOpen ? (
            <PanelLeftClose size={16} className="text-gray-600" />
          ) : (
            <PanelLeftOpen size={16} className="text-gray-600" />
          )}
        </button>

        {/* Header del sidebar */}
        <div className={`p-4 border-b border-gray-200 ${!isSidebarOpen ? 'text-center' : ''}`}>
          <h2 className={`font-semibold text-gray-800 transition-all duration-300 ${
            isSidebarOpen ? 'text-lg' : 'text-xs'
          }`}>
            {isSidebarOpen ? '🛠️ Herramientas' : '🛠️'}
          </h2>
        </div>

        {/* Navegación vertical */}
        <div className="p-2">
          {menuSections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 p-3 mb-2 rounded-lg transition-all duration-200
                  ${activeSection === section.id
                    ? `${section.color} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  ${!isSidebarOpen ? 'justify-center' : ''}
                `}
                title={!isSidebarOpen ? section.label : undefined}
              >
                <Icon size={18} />
                {isSidebarOpen && (
                  <span className="font-medium">{section.label}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido de la sección */}
        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-4">
            {renderSectionContent()}
          </div>
        )}
      </div>

      {/* 🔹 Overlay para cerrar sidebar en mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* 🔹 Barra superior minimalista - Flotante */}
      <div className="fixed top-0 right-0 left-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-3 z-30">
        <div className={`flex items-center justify-between transition-all duration-300 ${
          isSidebarOpen ? 'ml-80' : 'ml-16'
        }`}>
          <h1 className="text-xl font-semibold text-gray-800">📚 Editor de Libro</h1>
          
          <div className="flex items-center gap-4">
            {/* Navegación de páginas */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
            
            <button 
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Save size={16} />
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* 🔹 Espaciador para la barra superior */}
      <div className="h-16" />
    </>
  );
};