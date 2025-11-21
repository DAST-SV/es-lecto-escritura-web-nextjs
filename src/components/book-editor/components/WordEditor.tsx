'use client';

import React, { useState, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { 
  BookOpen, Eye, FileText, Save, ChevronLeft, ChevronRight,
  Image as ImageIcon, Palette, Info, Settings
} from 'lucide-react';
import { WordToolbar } from './WordToolbar';
import { useWordEditor } from '../hooks/useWordEditor';

interface WordEditorProps {
  initialPages?: any[];
  bookTitle?: string;
  onSave?: (pages: any[]) => Promise<void>;
  onPreview?: () => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  initialPages = [],
  bookTitle = 'Mi Libro',
  onSave,
  onPreview
}) => {
  const [showStats, setShowStats] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const {
    editor,
    pages,
    currentPage,
    totalPages,
    isProcessing,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    addImage,
    removeImage,
    setBackground,
    getPageStats,
    exportToFlipBook
  } = useWordEditor({
    initialPages,
    maxCharsPerPage: 650
  });

  const stats = getPageStats(currentPage);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const flipbookPages = exportToFlipBook();
      await onSave(flipbookPages);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      addImage(currentPage, imageUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bgUrl = event.target?.result as string;
      setBackground(currentPage, bgUrl);
    };
    reader.readAsDataURL(file);
  };

  const currentPageData = pages[currentPage];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={24} />
          <div>
            <h1 className="text-lg font-bold">{bookTitle}</h1>
            <p className="text-xs opacity-90">Editor tipo Word</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Navegación de páginas */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-medium px-2">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="p-1 hover:bg-white/20 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Botones de acción */}
          <button
            onClick={onPreview}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <Eye size={18} />
            <span className="text-sm font-medium">Vista Previa</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            <span className="text-sm font-medium">
              {isSaving ? 'Guardando...' : 'Guardar'}
            </span>
          </button>
        </div>
      </div>

      {/* Toolbar de formato */}
      <WordToolbar 
        editor={editor} 
        onImageUpload={() => setShowImagePanel(!showImagePanel)}
      />

      {/* Área principal */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel lateral izquierdo: Páginas */}
        <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={addPage}
              className="w-full py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              + Nueva Página
            </button>
          </div>

          <div className="p-2 space-y-2">
            {pages.map((page, index) => (
              <button
                key={page.id}
                onClick={() => goToPage(index)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  index === currentPage
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-bold ${index === currentPage ? 'text-blue-700' : 'text-gray-700'}`}>
                    Página {index + 1}
                  </span>
                  {page.image && <ImageIcon size={12} className="text-green-600" />}
                </div>
                <div className="text-xs text-gray-500">
                  {getPageStats(index).chars} caracteres
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Área del editor - simulando hoja de papel */}
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Imagen de la página (si existe) */}
            {currentPageData?.image && (
              <div className="bg-white mb-4 rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={currentPageData.image}
                    alt="Imagen de página"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <button
                    onClick={() => removeImage(currentPage)}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            )}

            {/* Hoja de papel con el editor */}
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{
                minHeight: '29.7cm', // A4
                width: '21cm',
                padding: '2.54cm', // Márgenes de 1 pulgada
                ...(currentPageData?.background && {
                  backgroundImage: `url(${currentPageData.background})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                })
              }}
            >
              <EditorContent 
                editor={editor}
                className="word-editor-wrapper"
              />
            </div>
          </div>
        </div>

        {/* Panel lateral derecho: Herramientas */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          
          {/* Estadísticas */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                <span className="font-semibold text-gray-700">Estadísticas</span>
              </div>
              <ChevronRight size={16} className={`transform transition-transform ${showStats ? 'rotate-90' : ''}`} />
            </button>
            
            {showStats && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Caracteres:</span>
                  <span className="font-medium">{stats.chars}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Palabras:</span>
                  <span className="font-medium">{stats.words}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Páginas:</span>
                  <span className="font-medium">{totalPages}</span>
                </div>
                {isProcessing && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    ⚙️ Procesando paginación...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Imagen de página */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowImagePanel(!showImagePanel)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-green-600" />
                <span className="font-semibold text-gray-700">Imagen</span>
              </div>
              <ChevronRight size={16} className={`transform transition-transform ${showImagePanel ? 'rotate-90' : ''}`} />
            </button>

            {showImagePanel && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  {currentPageData?.image ? 'Cambiar imagen' : 'Agregar imagen'}
                </button>
                {currentPageData?.image && (
                  <button
                    onClick={() => removeImage(currentPage)}
                    className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Quitar imagen
                  </button>
                )}
                <p className="text-xs text-gray-500">
                  La imagen aparecerá sobre el texto de la página
                </p>
              </div>
            )}
          </div>

          {/* Fondo de página */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-purple-600" />
                <span className="font-semibold text-gray-700">Fondo</span>
              </div>
              <ChevronRight size={16} className={`transform transition-transform ${showBackgroundPanel ? 'rotate-90' : ''}`} />
            </button>

            {showBackgroundPanel && (
              <div className="space-y-3">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                >
                  {currentPageData?.background ? 'Cambiar fondo' : 'Agregar fondo'}
                </button>
                {currentPageData?.background && (
                  <button
                    onClick={() => setBackground(currentPage, '')}
                    className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    Quitar fondo
                  </button>
                )}
                <p className="text-xs text-gray-500">
                  El fondo aparece detrás del texto
                </p>
              </div>
            )}
          </div>

          {/* Opciones de página */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={18} className="text-gray-600" />
              <span className="font-semibold text-gray-700">Opciones</span>
            </div>
            
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta página?')) {
                  deletePage(currentPage);
                }
              }}
              disabled={totalPages === 1}
              className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Eliminar página
            </button>
          </div>
        </div>
      </div>

      {/* Estilos personalizados */}
      <style jsx global>{`
        .word-editor-wrapper {
          font-family: 'Times New Roman', serif;
          font-size: 16px;
          line-height: 1.5;
        }

        .word-editor-content {
          outline: none;
        }

        .word-editor-content p {
          margin-bottom: 0.5em;
        }

        .word-editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .word-editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .word-editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .word-editor-content ul,
        .word-editor-content ol {
          padding-left: 1.5em;
          margin-bottom: 0.5em;
        }

        .word-editor-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          color: #666;
          font-style: italic;
        }

        .word-editor-content code {
          background-color: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }

        .word-editor-content pre {
          background-color: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
        }

        .editor-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
};

export default WordEditor;