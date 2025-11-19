import React, { useState, useMemo } from 'react';
import {
  Eye, FileText, Heading, Layout, Image, Paintbrush, Plus, Trash2, X
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../hooks/useBookNavigation';

// Componentes de edición
import { PageLayoutSelector } from './PageLayoutSelector';
import { ImageControls } from './ImageControls';
import { BackgroundControls } from './BackgroundControls';
import { RichTitleEditor } from './Richtitleeditortiptap';
import { RichTextEditor } from './Richtexteditortiptap';

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

  // Tabs contextuales según la página - SIN portada ni metadata
  const tabs = useMemo(() => {
    const allTabs = [
      { id: 'title', icon: Heading, label: 'Título', show: true },
      { id: 'text', icon: FileText, label: 'Texto', show: true },
      { id: 'layout', icon: Layout, label: 'Diseño', show: true },
      { id: 'images', icon: Image, label: 'Imagen', show: true },
      { id: 'background', icon: Paintbrush, label: 'Fondo', show: true }
    ];

    return allTabs.filter(tab => tab.show);
  }, []);

  // Verificar que activeTab sea válido
  React.useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab(tabs[0]?.id || 'title');
    }
  }, [tabs, activeTab]);

  const currentTab = tabs.find(t => t.id === activeTab);

  if (!currentPageData) return null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header compacto (móvil) */}
      <div className="lg:hidden flex-shrink-0 bg-indigo-600 text-white px-3 py-2 flex items-center justify-between">
        <h2 className="font-semibold text-sm">🛠️ Editor</h2>
        <button
          onClick={onCloseSidebar}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Cerrar panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs - UNA SOLA FILA HORIZONTAL */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex gap-1 p-1.5 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap
                  font-medium text-xs transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 bg-gray-50'
                  }
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido del tab activo - MÁS COMPACTO */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 max-w-4xl mx-auto">
          {/* TÍTULO */}
          {activeTab === 'title' && (
            <div className="space-y-2">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded">
                <h3 className="font-semibold text-blue-900 text-sm">✏️ Título</h3>
                <p className="text-xs text-blue-700">Escribe un título llamativo</p>
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
            <div className="space-y-2">
              <div className="bg-cyan-50 border-l-4 border-cyan-500 p-2 rounded">
                <h3 className="font-semibold text-cyan-900 text-sm">📝 Contenido</h3>
                <p className="text-xs text-cyan-700">Escribe la historia</p>
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
            <div className="space-y-2">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-2 rounded">
                <h3 className="font-semibold text-purple-900 text-sm">🎨 Diseño</h3>
                <p className="text-xs text-purple-700">Elige la distribución</p>
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
            <div className="space-y-2">
              <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
                <h3 className="font-semibold text-green-900 text-sm">🖼️ Imagen</h3>
                <p className="text-xs text-green-700">Sube una imagen</p>
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
            <div className="space-y-2">
              <div className="bg-teal-50 border-l-4 border-teal-500 p-2 rounded">
                <h3 className="font-semibold text-teal-900 text-sm">🎨 Fondo</h3>
                <p className="text-xs text-teal-700">Elige un fondo decorativo</p>
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
        </div>
      </div>
    </div>
  );
};