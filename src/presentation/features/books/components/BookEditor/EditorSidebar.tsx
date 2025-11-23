/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/EditorSidebar.tsx
 * 
 * Sidebar del editor con 2 pestañas:
 * - Contenido (título y texto de páginas)
 * - Diseño (layout, imagen, fondo de páginas)
 * 
 * MODIFICADO:
 * - Quitar control de posición en portada (debe ser pantalla completa)
 * - Quitar "Fondo de página 1:" en el selector de fondos
 */

import React, { useState, useMemo } from 'react';
import {
  FileText, Layout
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../../hooks/useBookNavigation';

// Componentes de edición
import { LayoutPositionSelector } from '../../../editor/components/LayoutSelector/LayoutPositionSelector';
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

  // Props sin usar (mantenidas para compatibilidad)
  titulo: string;
  autores: string[];
  descripcion: string;
  categoriasLabels: string[];
  generosLabels: string[];
  valoresLabels: string[];
  nivelLabel: string | null;
  cardBackgroundImage: File | null;
  cardBackgroundUrl: string | null;
  onCardBackgroundChange: (file: File | null) => void;

  // Handlers
  onLayoutChange: (layout: string) => void;
  onBackgroundChange: (value: string) => void;
  onAddPage: () => void;
  onDeletePage: () => void;
}

export function EditorSidebar({
  pages,
  currentPage,
  setPages,
  imageHandler,
  onLayoutChange,
  onBackgroundChange,
}: EditorSidebarProps) {

  const currentPageData = pages[currentPage];
  const [activeTab, setActiveTab] = useState<string>('content');
  const isFirstPage = currentPage === 0;

  /**
   * Definición de pestañas (solo 2)
   */
  const tabs = useMemo(() => {
    if (isFirstPage) {
      // Primera página: Solo Diseño
      return [
        { id: 'design', icon: Layout, label: 'Diseño Portada', color: 'indigo' }
      ];
    }

    // Resto de páginas: Contenido y Diseño
    return [
      { id: 'content', icon: FileText, label: 'Contenido', color: 'blue' },
      { id: 'design', icon: Layout, label: 'Diseño', color: 'green' },
    ];
  }, [isFirstPage]);

  if (!currentPageData) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            const colorClasses = {
              indigo: isActive 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'text-indigo-600 hover:bg-indigo-50',
              blue: isActive 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'text-blue-600 hover:bg-blue-50',
              green: isActive 
                ? 'bg-green-600 text-white border-green-600' 
                : 'text-green-600 hover:bg-green-50',
            };

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-all
                  ${isActive ? 'border-b-2' : ''}
                  ${colorClasses[tab.color as keyof typeof colorClasses]}
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Scroll interno */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
        
        {/* PESTAÑA: Contenido (páginas normales) */}
        {activeTab === 'content' && !isFirstPage && (
          <>
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
          </>
        )}

        {/* PESTAÑA: Diseño */}
        {activeTab === 'design' && (
          <>
            {/* Selector de Layout/Posición - Siempre visible */}
            <LayoutPositionSelector
              currentLayout={currentPageData.layout}
              pageNumber={currentPage + 1}
              onLayoutChange={onLayoutChange}
              isFirstPage={isFirstPage}
            />

            {/* Control de imagen - SIN selector de posición (ahora está en LayoutPositionSelector) */}
            <ImageControls
              hasImage={!!currentPageData.image}
              pageNumber={currentPage + 1}
              onImageChange={imageHandler.handleImageChange}
              onRemoveImage={imageHandler.removeImage}
              currentImage={currentPageData.image}
              imagePosition={currentPageData.imagePosition || 'center'}
              // NO pasamos onPositionChange - la posición la controla el layout
            />

            <BackgroundControls
              currentBackground={currentPageData.background}
              hasBackground={!!currentPageData.background}
              pageNumber={currentPage + 1}
              onBackgroundChange={onBackgroundChange}
              onBackgroundFileChange={imageHandler.handleBackgroundFile}
              onRemoveBackground={imageHandler.removeBackground}
              isFirstPage={isFirstPage}
            />
          </>
        )}
      </div>
    </div>
  );
}