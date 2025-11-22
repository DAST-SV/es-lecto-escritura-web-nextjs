/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/EditorSidebar.tsx
 * 
 * Sidebar del editor con pestañas:
 * - Ficha Literaria (NUEVA - totalmente separada, para catálogos públicos)
 * - Contenido (título y texto de páginas)
 * - Diseño (layout, imagen, fondo de páginas)
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles, FileText, Layout, Image, Paintbrush,
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

// NUEVO: Componente de Ficha Literaria
import { LiteraryCardEditor } from '../LiteraryCard/LiteraryCardEditor';

interface EditorSidebarProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
  setCurrentPage: (page: number) => void;
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;

  // Datos del libro (para ficha literaria)
  titulo: string;
  autores: string[];
  descripcion: string;
  
  // Clasificación (arrays de strings - nombres legibles)
  categoriasLabels: string[];
  generosLabels: string[];
  valoresLabels: string[];
  nivelLabel: string | null;
  
  // Imagen de fondo de la FICHA LITERARIA (NO la portada del libro)
  cardBackgroundImage: File | null;
  cardBackgroundUrl: string | null;

  // Handlers
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
  setCurrentPage,
  imageHandler,
  navigation,
  titulo,
  autores,
  descripcion,
  categoriasLabels,
  generosLabels,
  valoresLabels,
  nivelLabel,
  cardBackgroundImage,
  cardBackgroundUrl,
  onCardBackgroundChange,
  onLayoutChange,
  onBackgroundChange,
  onAddPage,
  onDeletePage,
}: EditorSidebarProps) {

  const currentPageData = pages[currentPage];
  const [activeTab, setActiveTab] = useState<string>('content');
  const isFirstPage = currentPage === 0;

  /**
   * Definición de pestañas
   */
  const tabs = useMemo(() => {
    if (isFirstPage) {
      // Primera página: Solo Ficha Literaria y Fondo de portada
      return [
        { id: 'card', icon: Sparkles, label: 'Ficha Literaria', color: 'purple' },
        { id: 'background', icon: Paintbrush, label: 'Fondo Portada', color: 'indigo' }
      ];
    }

    // Resto de páginas: Contenido, Diseño, Ficha Literaria
    return [
      { id: 'content', icon: FileText, label: 'Contenido', color: 'blue' },
      { id: 'design', icon: Layout, label: 'Diseño', color: 'green' },
      { id: 'card', icon: Sparkles, label: 'Ficha Literaria', color: 'purple' },
    ];
  }, [isFirstPage]);

  if (!currentPageData) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Tabs - Ultra compactos con colores distintivos */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200">
        <div className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Colores por pestaña
            const colorClasses = {
              purple: isActive 
                ? 'bg-purple-600 text-white border-purple-600' 
                : 'text-purple-600 hover:bg-purple-50',
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
                {tab.id === 'card' && <span className="text-[9px] opacity-75">(Pública)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Scroll interno */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
        
        {/* PESTAÑA: Ficha Literaria (NUEVA) */}
        {activeTab === 'card' && (
          <div>
            <LiteraryCardEditor
              titulo={titulo}
              autores={autores}
              descripcion={descripcion}
              categorias={categoriasLabels}
              generos={generosLabels}
              valores={valoresLabels}
              nivel={nivelLabel}
              cardBackgroundImage={cardBackgroundImage}
              cardBackgroundUrl={cardBackgroundUrl}
              onCardBackgroundChange={onCardBackgroundChange}
            />
          </div>
        )}

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

        {/* PESTAÑA: Diseño (páginas normales) */}
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
              currentImage={currentPageData.image}
              imagePosition={currentPageData.imagePosition || 'center'}
              onPositionChange={(position) => {
                setPages(prev => {
                  const newPages = [...prev];
                  newPages[currentPage] = {
                    ...newPages[currentPage],
                    imagePosition: position
                  };
                  return newPages;
                });
              }}
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

        {/* PESTAÑA: Fondo de Portada (solo primera página) */}
        {activeTab === 'background' && isFirstPage && (
          <div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-indigo-900">
                📄 Fondo de la Portada (Página 1)
              </p>
              <p className="text-xs text-indigo-700 mt-1">
                Este es el fondo de la primera página de tu libro (la portada interna), 
                diferente de la Ficha Literaria.
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
        )}
      </div>
    </div>
  );
}