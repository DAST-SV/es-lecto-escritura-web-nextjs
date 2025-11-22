/**
 * UBICACIÓN: src/presentation/features/book/components/BookEditor/EditorSidebar.tsx
 * 
 * Sidebar del editor con tabs para controlar cada aspecto de la página
 * SIN auto-paginación
 */

import React, { useState, useMemo } from 'react';
import {
  Heading, FileText, Layout, Image, Paintbrush
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../../hooks/useBookNavigation';

// Componentes de edición
import { PageLayoutSelector } from '../../../editor/components/LayoutSelector/PageLayoutSelector';
import { ImageControls } from '../../../editor/components/ImageControls/ImageControls';
import { BackgroundControls } from '../../../editor/components/BackgroundControls/BackgroundControls';
import { RichTextEditor } from '../../../editor/components/RichTextEditor/RichTextEditor';
import { TitleEditor } from '../../../editor/components/RichTextEditor/TitleEditor';

interface EditorSidebarProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;
  
  // Metadatos (no se usan aquí, pero se pasan al padre)
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autores: string[];
  personajes: string[];
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
  onAutoresChange: (values: string[]) => void;
  onPersonajesChange: (values: string[]) => void;
  onDescripcionChange: (value: string) => void;
  onTituloChange: (value: string) => void;
  onPortadaChange: (value: File | null) => void;
  onLayoutChange: (layout: string) => void;
  onBackgroundChange: (value: string) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export function EditorSidebar({
  pages,
  currentPage,
  setPages,
  setCurrentPage,
  imageHandler,
  navigation,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  autores,
  personajes,
  descripcion,
  titulo,
  portada,
  portadaUrl,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
  onNivelChange,
  onAutoresChange,
  onPersonajesChange,
  onDescripcionChange,
  onTituloChange,
  onPortadaChange,
  onLayoutChange,
  onBackgroundChange,
  onAddPage,
  onDeletePage,
}: EditorSidebarProps) {
  
  const currentPageData = pages[currentPage];
  const [activeTab, setActiveTab] = useState<string>('title');

  // Detectar tipo de página
  const isFirstPage = currentPage === 0;

  // Tabs disponibles según el tipo de página
  const tabs = useMemo(() => {
    // Página 1 (Portada): solo fondo
    if (isFirstPage) {
      return [
        { id: 'background', icon: Paintbrush, label: 'Fondo' }
      ];
    }
    
    // Páginas normales: todos los controles
    return [
      { id: 'title', icon: Heading, label: 'Título' },
      { id: 'text', icon: FileText, label: 'Texto' },
      { id: 'layout', icon: Layout, label: 'Diseño' },
      { id: 'images', icon: Image, label: 'Imagen' },
      { id: 'background', icon: Paintbrush, label: 'Fondo' }
    ];
  }, [isFirstPage]);

  // Validar que el tab activo sea válido
  React.useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  if (!currentPageData) return null;

  // SI ES PÁGINA 1: Solo mostrar fondo
  if (isFirstPage) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-shrink-0 bg-purple-600 text-white px-3 py-2">
          <h2 className="font-semibold text-sm">🎨 Portada - Solo Fondo</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-900 font-medium">
              📄 Página 1 - Portada
            </p>
            <p className="text-xs text-purple-700 mt-1">
              Solo puedes editar el fondo de esta página
            </p>
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
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-indigo-600 text-white px-3 py-2">
        <h2 className="font-semibold text-sm">🛠️ Editor de Página {currentPage + 1}</h2>
      </div>

      {/* Tabs horizontales */}
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

      {/* Contenido del tab activo */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'title' && (
          <TitleEditor
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
        )}

        {activeTab === 'text' && (
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
        )}

        {activeTab === 'layout' && (
          <PageLayoutSelector
            currentLayout={currentPageData.layout}
            pageNumber={currentPage + 1}
            onLayoutChange={onLayoutChange}
          />
        )}

        {activeTab === 'images' && (
          <ImageControls
            hasImage={!!currentPageData.image}
            pageNumber={currentPage + 1}
            onImageChange={imageHandler.handleImageChange}
            onRemoveImage={imageHandler.removeImage}
          />
        )}

        {activeTab === 'background' && (
          <BackgroundControls
            currentBackground={currentPageData.background}
            hasBackground={!!currentPageData.background}
            pageNumber={currentPage + 1}
            onBackgroundChange={onBackgroundChange}
            onBackgroundFileChange={imageHandler.handleBackgroundFile}
            onRemoveBackground={imageHandler.removeBackground}
          />
        )}
      </div>
    </div>
  );
}