/**
 * UBICACIÓN: src/presentation/features/book/components/BookEditor/EditorSidebar.tsx
 * 
 * Sidebar del editor con tabs para controlar cada aspecto de la página
 * SIN auto-paginación
 */

import React, { useState, useMemo } from 'react';
import {
  Heading, FileText, Layout, Image, Paintbrush,
  BookOpen,
  FileCheck
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
import { BookMetadataForm } from '../BookMetadata/BookMetadataForm';

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
  const [activeTab, setActiveTab] = useState<string>('content');
  const isFirstPage = currentPage === 0;

  const tabs = useMemo(() => {
    if (isFirstPage) {
      return [
        { id: 'meta', icon: BookOpen, label: 'Libro' },
        { id: 'background', icon: Paintbrush, label: 'Fondo' }
      ];
    }
    
    return [
      { id: 'content', icon: FileText, label: 'Contenido' },
      { id: 'design', icon: Layout, label: 'Diseño' },
      { id: 'meta', icon: FileCheck, label: 'Libro' },
    ];
  }, [isFirstPage]);

  if (!currentPageData) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Tabs - Ultra compactos */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors
                  ${isActive 
                    ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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

      {/* Content - Scroll interno */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
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

        {activeTab === 'design' && !isFirstPage && (
          <>
            <PageLayoutSelector
              currentLayout={currentPageData.layout}
              pageNumber={currentPage + 1}
              onLayoutChange={onLayoutChange}
            />

            <ImageControls
              hasImage={!!currentPageData.image}
              pageNumber={currentPage + 1}
              onImageChange={imageHandler.handleImageChange}
              onRemoveImage={imageHandler.removeImage}
            />

            <BackgroundControls
              currentBackground={currentPageData.background}
              hasBackground={!!currentPageData.background}
              pageNumber={currentPage + 1}
              onBackgroundChange={onBackgroundChange}
              onBackgroundFileChange={imageHandler.handleBackgroundFile}
              onRemoveBackground={imageHandler.removeBackground}
            />
          </>
        )}

        {activeTab === 'meta' && (
          <BookMetadataForm
            selectedCategorias={selectedCategorias}
            selectedGeneros={selectedGeneros}
            selectedEtiquetas={selectedEtiquetas}
            selectedValores={selectedValores}
            selectedNivel={selectedNivel}
            autores={autores}
            personajes={personajes}
            descripcion={descripcion}
            titulo={titulo}
            onCategoriasChange={onCategoriasChange}
            onGenerosChange={onGenerosChange}
            onEtiquetasChange={onEtiquetasChange}
            onValoresChange={onValoresChange}
            onNivelChange={onNivelChange}
            onAutoresChange={onAutoresChange}
            onPersonajesChange={onPersonajesChange}
            onDescripcionChange={onDescripcionChange}
            onTituloChange={onTituloChange}
            onSave={async () => {}}
          />
        )}

        {activeTab === 'background' && isFirstPage && (
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