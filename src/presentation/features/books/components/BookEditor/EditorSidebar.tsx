/**
 * UBICACIÓN: src/presentation/features/books/components/BookEditor/EditorSidebar.tsx
 * ACTUALIZADO: Con portada simplificada (solo subir imagen)
 */

import React, { useState, useMemo } from 'react';
import {
  FileText, Layout, Upload, X
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
   * ✅ Si es la PORTADA (página 0), mostrar solo subida de imagen SIN preview
   */
  if (isFirstPage) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            📖 Portada del Libro
          </h3>
          <p className="text-xs text-gray-600 mt-1">
            Sube una imagen que cubra toda la portada
          </p>
        </div>

        {/* ✅ SOLO subir imagen - SIN preview (se ve en el libro) */}
        <div className="space-y-4">
          {/* Estado de la imagen */}
          <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
            {currentPageData.image ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900">
                      Portada cargada correctamente
                    </p>
                    <p className="text-xs text-green-600">
                      La imagen se muestra en el libro →
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors text-sm">
                      <Upload size={16} />
                      Cambiar
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={imageHandler.handleImageChange}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={imageHandler.removeImage}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm"
                  >
                    <X size={16} />
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              // Sin imagen - mostrar botón para subir
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-indigo-300 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors p-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-200 rounded-full flex items-center justify-center mb-3">
                      <Upload size={28} className="text-indigo-600" />
                    </div>
                    
                    <h5 className="font-semibold text-gray-900 mb-1 text-sm">
                      Sube la imagen de portada
                    </h5>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      Haz clic para seleccionar
                    </p>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
                      <Upload size={16} />
                      Seleccionar imagen
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      JPG, PNG o WebP
                    </p>
                  </div>
                </div>
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={imageHandler.handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Información adicional */}
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Tip:</strong> La portada se mostrará a pantalla completa sin márgenes en el libro.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                📐 <strong>Tamaño recomendado:</strong> 800x1200px (formato vertical)
              </p>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs text-purple-800">
                👁️ <strong>Preview:</strong> Mira cómo queda tu portada en el libro de la derecha →
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Definición de pestañas (para páginas normales)
   */
  const tabs = useMemo(() => {
    return [
      { id: 'content', icon: FileText, label: 'Contenido', color: 'blue' },
      { id: 'design', icon: Layout, label: 'Diseño', color: 'green' },
    ];
  }, []);

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
        
        {/* PESTAÑA: Contenido */}
        {activeTab === 'content' && (
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
      </div>
    </div>
  );
}