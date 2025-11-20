import React, { useState, useMemo, useCallback } from 'react';
import {
  Heading, FileText, Layout, Image, Paintbrush, X, AlertCircle
} from 'lucide-react';

// Tipos
import type { page } from '@/src/typings/types-page-book/index';
import type { UseImageHandlerReturn } from '../hooks/useImageHandler';
import type { UseBookNavigationReturn } from '../hooks/useBookNavigation';

// 🔥 NUEVO: Hook de paginación tipo Word
import { useWordLikePagination } from '../hooks/useWordLikePagination';

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
  setCurrentPage: (page: number) => void; // 🔥 NUEVA PROP
  imageHandler: UseImageHandlerReturn;
  navigation: UseBookNavigationReturn;
  
  // Metadatos
  selectedCategorias: (number | string)[];
  selectedGeneros: (number | string)[];
  selectedEtiquetas: (number | string)[];
  selectedValores: (number | string)[];
  selectedNivel: number | null;
  autores: string[]; // 🔥 CAMBIADO de autor a autores
  personajes: string[]; // 🔥 NUEVO
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
  onAutoresChange: (values: string[]) => void; // 🔥 CAMBIADO
  onPersonajesChange: (values: string[]) => void; // 🔥 NUEVO
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
  setCurrentPage, // 🔥 NUEVO
  imageHandler,
  navigation,
  selectedCategorias,
  selectedGeneros,
  selectedEtiquetas,
  selectedValores,
  selectedNivel,
  autores, // 🔥 CAMBIADO
  personajes, // 🔥 NUEVO
  descripcion,
  titulo,
  portada,
  portadaUrl,
  onCategoriasChange,
  onGenerosChange,
  onEtiquetasChange,
  onValoresChange,
  onNivelChange,
  onAutoresChange, // 🔥 CAMBIADO
  onPersonajesChange, // 🔥 NUEVO
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
  const [autoPaginationEnabled, setAutoPaginationEnabled] = useState(true);
  const [maxCharsPerPage, setMaxCharsPerPage] = useState(650);

  // Detectar tipo de página
  const isFirstPage = currentPage === 0;

  // 🔥 IMPORTANTE: Definir todos los hooks ANTES de cualquier return condicional
  const tabs = useMemo(() => {
    return [
      { id: 'title', icon: Heading, label: 'Título' },
      { id: 'text', icon: FileText, label: 'Texto' },
      { id: 'layout', icon: Layout, label: 'Diseño' },
      { id: 'images', icon: Image, label: 'Imagen' },
      { id: 'background', icon: Paintbrush, label: 'Fondo' }
    ];
  }, []);

  // 🔥 NUEVO: Hook de paginación tipo Word (bidireccional)
  const { handleTextChange: handleWordTextChange, isProcessing } = useWordLikePagination({
    pages,
    currentPage,
    setPages,
    setCurrentPage,
    enabled: autoPaginationEnabled,
    maxCharsPerPage
  });

  // Validar que el tab activo sea válido
  React.useEffect(() => {
    const validTabs = tabs.map(t => t.id);
    if (!validTabs.includes(activeTab)) {
      setActiveTab('title');
    }
  }, [tabs, activeTab]);

  // Validar que existe currentPageData
  if (!currentPageData) return null;

  // 🔥 SI ES PÁGINA 1: Solo mostrar fondo
  if (isFirstPage) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="lg:hidden flex-shrink-0 bg-purple-600 text-white px-3 py-2 flex items-center justify-between">
          <h2 className="font-semibold text-sm">🎨 Portada</h2>
          <button
            onClick={onCloseSidebar}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X size={20} />
          </button>
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
      {/* Header móvil */}
      <div className="lg:hidden flex-shrink-0 bg-indigo-600 text-white px-3 py-2 flex items-center justify-between">
        <h2 className="font-semibold text-sm">🛠️ Editor</h2>
        <button
          onClick={onCloseSidebar}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Toggle Auto-Paginación */}
      <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-3 py-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoPaginationEnabled}
            onChange={(e) => setAutoPaginationEnabled(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-xs font-medium text-blue-900">
            📄 Auto-paginación tipo Word
          </span>
        </label>
        {autoPaginationEnabled && (
          <div className="mt-2 ml-6">
            <div className="flex items-center justify-between text-[10px] text-blue-700 mb-1">
              <span>Caracteres por página:</span>
              <span className="font-bold">{maxCharsPerPage}</span>
            </div>
            <input
              type="range"
              min="400"
              max="900"
              step="50"
              value={maxCharsPerPage}
              onChange={(e) => setMaxCharsPerPage(Number(e.target.value))}
              className="w-full h-1 bg-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-blue-600 mt-1">
              <span>Menos</span>
              <span>Más</span>
            </div>
          </div>
        )}
        {autoPaginationEnabled && (
          <p className="text-[10px] text-blue-700 mt-2">
            <AlertCircle size={10} className="inline mr-1" />
            {isProcessing ? '⚙️ Procesando...' : '✅ Escribe y borra libremente'}
          </p>
        )}
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
        )}

        {activeTab === 'text' && (
          <RichTextEditor
            value={currentPageData.text || ''}
            onChange={handleWordTextChange}
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
};