import React, { useState, useMemo } from 'react';
import {
  Eye, FileText, Heading, Layout, Image, Paintbrush,
  BookOpen, Tag, Plus, Trash2, X
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../hooks/useBookNavigation';

// Componentes de edición
import { PageLayoutSelector } from './PageLayoutSelector';
import { RichTitleEditor } from './RichTitleEditor';
import { RichTextEditor } from './RichTextEditor';
import { ImageControls } from './ImageControls';
import { PortadaControls } from './portadaControls';
import { BackgroundControls } from './BackgroundControls';
import { BookMetadataForm } from './BookMetadataForm';

interface EditorSidebarProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
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
  portadaUrl?: string | null;
  
  // Handlers
  onCategoriasChange: (values: (number | string)[]) => void;
  onGenerosChange: (values: (number | string)[]) => void;
  onEtiquetasChange: (values: (number | string)[]) => void;
  onValoresChange: (values: (number | string)[]) => void;
  onNivelChange: (value: number | null) => void;
  onAutorChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onPortadaChange: (value: File | null) => void;
  onLayoutChange: (layout: string) => void;
  onBackgroundChange: (value: string) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
  onCloseSidebar?: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  pages,
  currentPage,
  setPages,
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
  portadaUrl,
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
  onAddPage,
  onDeletePage,
  onCloseSidebar
}) => {
  const currentPageData = pages[currentPage];
  const [activeTab, setActiveTab] = useState<string>('title');

  // Detectar tipo de página
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pages.length - 1;
  const canDeletePage = pages.length > 2;

  // Tabs contextuales según la página
  const tabs = useMemo(() => {
    const allTabs = [
      { id: 'title', icon: Heading, label: 'Título', color: 'blue', show: true },
      { id: 'text', icon: FileText, label: 'Texto', color: 'cyan', show: true },
      { id: 'layout', icon: Layout, label: 'Diseño', color: 'purple', show: !isFirstPage },
      { id: 'images', icon: Image, label: 'Imagen', color: 'green', show: !isFirstPage },
      { id: 'background', icon: Paintbrush, label: 'Fondo', color: 'teal', show: true },
      { id: 'cover', icon: BookOpen, label: 'Portada', color: 'orange', show: isFirstPage },
      { id: 'metadata', icon: Tag, label: 'Info Libro', color: 'pink', show: isFirstPage }
    ];

    return allTabs.filter(tab => tab.show);
  }, [isFirstPage]);

  // Verificar que activeTab sea válido
  React.useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab(tabs[0]?.id || 'title');
    }
  }, [tabs, activeTab]);

  const currentTab = tabs.find(t => t.id === activeTab);

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    cyan: 'bg-cyan-500 hover:bg-cyan-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    green: 'bg-green-500 hover:bg-green-600',
    teal: 'bg-teal-500 hover:bg-teal-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    pink: 'bg-pink-500 hover:bg-pink-600'
  };

  if (!currentPageData) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header del sidebar con botón cerrar (móvil) */}
      <div className="lg:hidden flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <h2 className="font-bold text-lg">🛠️ Herramientas de Edición</h2>
        <button
          onClick={onCloseSidebar}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Cerrar panel"
        >
          <X size={24} />
        </button>
      </div>

      {/* Tabs - Diseño de dos filas para aprovechar el ancho */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-1 p-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorClass = colorClasses[tab.color as keyof typeof colorClasses];
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 p-3 rounded-lg
                  font-medium text-xs transition-all
                  ${isActive 
                    ? `${colorClass} text-white shadow-lg scale-105` 
                    : 'text-gray-600 hover:bg-blue-100 bg-white'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Indicador de contexto */}
      <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-lg">Página {currentPage + 1}</span>
            {isFirstPage && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">
                🎨 PORTADA
              </span>
            )}
            {isLastPage && !isFirstPage && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
                🏁 FINAL
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Editando: <span className="font-semibold text-gray-700">{currentTab?.label}</span>
          </div>
        </div>
      </div>

      {/* Contenido del tab activo - MÁS ESPACIO */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 max-w-4xl mx-auto">
          {/* TÍTULO */}
          {activeTab === 'title' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-1 text-lg">✏️ Título de la Página</h3>
                <p className="text-sm text-blue-700">Escribe un título llamativo y creativo para esta página</p>
              </div>
              <RichTitleEditor
                value={currentPageData.title || ''}
                onChange={(html) => {
                  setPages(prev => {
                    const newPages = [...prev];
                    newPages[currentPage] = { ...newPages[currentPage], title: html };
                    return newPages;
                  });
                }}
                pageNumber={currentPage + 1}
              />
            </div>
          )}

          {/* TEXTO */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-l-4 border-cyan-500 p-4 rounded-lg">
                <h3 className="font-bold text-cyan-900 mb-1 text-lg">📝 Contenido de la Página</h3>
                <p className="text-sm text-cyan-700">Escribe la historia o texto principal con todo detalle</p>
              </div>
              <RichTextEditor
                value={currentPageData.text || ''}
                onChange={(html) => {
                  setPages(prev => {
                    const newPages = [...prev];
                    newPages[currentPage] = { ...newPages[currentPage], text: html };
                    return newPages;
                  });
                }}
                pageNumber={currentPage + 1}
              />
            </div>
          )}

          {/* DISEÑO */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 p-4 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-1 text-lg">🎨 Diseño de la Página</h3>
                <p className="text-sm text-purple-700">Elige cómo distribuir el título, texto e imagen</p>
              </div>
              <PageLayoutSelector
                currentLayout={currentPageData.layout}
                pageNumber={currentPage + 1}
                onLayoutChange={onLayoutChange}
              />
            </div>
          )}

          {/* IMAGEN */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 p-4 rounded-lg">
                <h3 className="font-bold text-green-900 mb-1 text-lg">🖼️ Imagen de la Página</h3>
                <p className="text-sm text-green-700">Sube una imagen que acompañe y enriquezca el contenido</p>
              </div>
              <ImageControls
                hasImage={!!currentPageData.image}
                pageNumber={currentPage + 1}
                onImageChange={imageHandler.handleImageChange}
                onRemoveImage={imageHandler.removeImage}
              />
            </div>
          )}

          {/* FONDO */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-l-4 border-teal-500 p-4 rounded-lg">
                <h3 className="font-bold text-teal-900 mb-1 text-lg">🎨 Fondo de la Página</h3>
                <p className="text-sm text-teal-700">Elige o sube un fondo decorativo para esta página</p>
              </div>
              <BackgroundControls
                currentBackground={currentPageData.background}
                hasBackground={!!currentPageData.background}
                pageNumber={currentPage + 1}
                onBackgroundChange={onBackgroundChange}
                onBackgroundFileChange={imageHandler.handleBackgroundFile}
                onRemoveBackground={imageHandler.removeBackground}
              />
            </div>
          )}

          {/* PORTADA */}
          {activeTab === 'cover' && isFirstPage && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-4 rounded-lg">
                <h3 className="font-bold text-orange-900 mb-1 text-lg">📚 Portada del Libro</h3>
                <p className="text-sm text-orange-700">Esta imagen aparecerá en catálogos, listas y será la cara visible de tu libro</p>
              </div>
              <PortadaControls 
                onImageChange={onPortadaChange}
                portada={portada}
                portadaUrl={portadaUrl} 
              />
            </div>
          )}

          {/* METADATOS */}
          {activeTab === 'metadata' && isFirstPage && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 border-l-4 border-pink-500 p-4 rounded-lg">
                <h3 className="font-bold text-pink-900 mb-1 text-lg">📋 Información del Libro</h3>
                <p className="text-sm text-pink-700">Datos generales, categorización y metadatos del libro completo</p>
              </div>
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
                onSave={async () => {}} // El guardado se maneja desde el botón principal
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer con acciones - Más prominente */}
      <div className="flex-shrink-0 border-t-2 border-gray-300 p-4 bg-gradient-to-r from-gray-50 to-gray-100 space-y-3">
        {/* Botones de gestión de páginas */}
        <div className="flex gap-3">
          <button
            onClick={onAddPage}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold transition-all shadow-lg hover:shadow-xl text-base"
          >
            <Plus size={20} />
            <span>Agregar Página</span>
          </button>
          
          {canDeletePage && (
            <button
              onClick={onDeletePage}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-bold transition-all shadow-lg hover:shadow-xl"
            >
              <Trash2 size={20} />
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};