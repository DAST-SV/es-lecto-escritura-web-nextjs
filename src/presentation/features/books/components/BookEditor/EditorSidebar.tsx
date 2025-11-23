/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/EditorSidebar.tsx
 * COMPLETO: Imagen de contenido en pestaña Posiciones
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText, Layout, Paintbrush
} from 'lucide-react';

import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../../hooks/useBookNavigation';

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
   * ✅ Limpiar imagen al cambiar a TextCenterLayout
   */
  const handleLayoutChangeWithCleanup = (newLayout: string) => {
    const oldLayout = currentPageData.layout;
    
    if (newLayout === 'TextCenterLayout' && oldLayout !== 'TextCenterLayout') {
      if (currentPageData.image) {
        if (typeof currentPageData.image === 'string' && currentPageData.image.startsWith('blob:')) {
          URL.revokeObjectURL(currentPageData.image);
        }
        
        setPages(prev => {
          const updated = [...prev];
          updated[currentPage] = {
            ...updated[currentPage],
            image: null,
            file: null
          };
          return updated;
        });
      }
    }
    
    onLayoutChange(newLayout);
  };

  /**
   * 3 PESTAÑAS
   */
  const tabs = useMemo(() => {
    if (isFirstPage) {
      return [
        { id: 'backgrounds', icon: Paintbrush, label: 'Fondo Portada', color: 'purple' }
      ];
    }

    return [
      { id: 'content', icon: FileText, label: 'Contenido', color: 'blue' },
      { id: 'positions', icon: Layout, label: 'Posiciones', color: 'green' },
      { id: 'backgrounds', icon: Paintbrush, label: 'Fondos', color: 'purple' },
    ];
  }, [isFirstPage]);

  useEffect(() => {
    if (isFirstPage && activeTab !== 'backgrounds') {
      setActiveTab('backgrounds');
    }
  }, [isFirstPage, activeTab]);

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
              blue: isActive 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'text-blue-600 hover:bg-blue-50',
              green: isActive 
                ? 'bg-green-600 text-white border-green-600' 
                : 'text-green-600 hover:bg-green-50',
              purple: isActive 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'text-purple-600 hover:bg-purple-50',
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

      {/* Content - SCROLL */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
        
        {/* ✅ PESTAÑA 1: Contenido */}
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

        {/* ✅ PESTAÑA 2: Posiciones (CON imagen de contenido) */}
        {activeTab === 'positions' && !isFirstPage && (
          <>
            {/* ✅ 1. Selector de posiciones */}
            <LayoutPositionSelector
              currentLayout={currentPageData.layout}
              pageNumber={currentPage + 1}
              onLayoutChange={handleLayoutChangeWithCleanup}
              isFirstPage={isFirstPage}
            />

            {/* ✅ 2. Control de IMAGEN DE CONTENIDO (solo si NO es TextCenterLayout) */}
            {currentPageData.layout !== 'TextCenterLayout' && (
              <ImageControls
                hasImage={!!currentPageData.image}
                pageNumber={currentPage + 1}
                onImageChange={imageHandler.handleImageChange}
                onRemoveImage={imageHandler.removeImage}
                currentImage={currentPageData.image}
                currentLayout={currentPageData.layout}
              />
            )}
          </>
        )}

        {/* ✅ PESTAÑA 3: Fondos */}
        {activeTab === 'backgrounds' && (
          <BackgroundControls
            currentBackground={currentPageData.background}
            hasBackground={!!currentPageData.background}
            pageNumber={currentPage + 1}
            onBackgroundChange={onBackgroundChange}
            onBackgroundFileChange={imageHandler.handleBackgroundFile}
            onRemoveBackground={imageHandler.removeBackground}
            isFirstPage={isFirstPage}
          />
        )}
      </div>
    </div>
  );
}