import React, { useState, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { 
  Image as ImageIcon, Palette, Settings, ChevronDown
} from 'lucide-react';
import { WordToolbar } from './WordToolbar';
import { useWordEditor } from '../hooks/useWordEditor';

interface WordEditorProps {
  initialPages?: any[];
  bookTitle?: string;
  onSave?: (pages: any[]) => Promise<void>;
  onPreview?: () => void;
  onPageChange?: (pageIndex: number) => void;
  onPagesUpdate?: (pages: any[]) => void; // ⭐ NUEVO
  hideHeader?: boolean;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  initialPages = [],
  onPageChange,
  onPagesUpdate, // ⭐ NUEVO
  hideHeader = false
}) => {
  const [showImagePanel, setShowImagePanel] = useState(false);
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const {
    editor,
    pages,
    currentPage,
    totalPages,
    goToPage,
    addPage,
    deletePage,
    addImage,
    removeImage,
    setBackground,
    exportToFlipBook
  } = useWordEditor({
    initialPages,
    onPagesChange: onPagesUpdate // ⭐ Pasar el callback
  });

  // Notificar cambios de página al padre
  React.useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

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

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      
      {/* Toolbar de formato */}
      <WordToolbar 
        editor={editor} 
        onImageUpload={() => setShowImagePanel(!showImagePanel)}
      />

      {/* Área principal */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel lateral izquierdo: Páginas */}
        <div className="w-40 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={addPage}
              className="w-full py-1.5 px-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs font-medium"
            >
              + Página
            </button>
          </div>

          <div className="p-1.5 space-y-1.5">
            {pages.map((page, index) => {
              // Determinar si es portada o contraportada
              const isFirstPage = index === 0;
              const isLastPage = index === pages.length - 1;
              
              return (
                <button
                  key={page.id}
                  onClick={() => goToPage(index)}
                  className={`w-full p-2 rounded text-left transition-colors ${
                    index === currentPage
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${index === currentPage ? 'text-blue-700' : 'text-gray-700'}`}>
                        {isFirstPage ? '📖 Portada' : isLastPage ? '📕 Contraportada' : `Pág. ${index + 1}`}
                      </span>
                      {(isFirstPage || isLastPage) && (
                        <span className="text-[10px] text-gray-500 mt-0.5">
                          Doble cara
                        </span>
                      )}
                    </div>
                    {page.image && <ImageIcon size={10} className="text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Área del editor */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Indicador de tipo de página */}
            {(currentPage === 0 || currentPage === pages.length - 1) && (
              <div className="mb-4 p-3 bg-purple-100 border-l-4 border-purple-500 rounded">
                <p className="text-sm font-semibold text-purple-800">
                  {currentPage === 0 ? '📖 Página de Portada (Doble cara)' : '📕 Página de Contraportada (Doble cara)'}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Esta página se mostrará en ambos lados en el libro. El frente tendrá fondo degradado automáticamente.
                </p>
              </div>
            )}

            {/* Imagen de la página */}
            {currentPageData?.image && (
              <div className="bg-white mb-3 rounded-lg shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={currentPageData.image}
                    alt="Imagen de página"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                  <button
                    onClick={() => removeImage(currentPage)}
                    className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            )}

            {/* Hoja de papel */}
            <div 
              className={`bg-white shadow-2xl rounded-lg overflow-hidden ${
                currentPage === 0 || currentPage === pages.length - 1 
                  ? 'border-4 border-purple-300' 
                  : ''
              }`}
              style={{
                minHeight: '29.7cm',
                width: '21cm',
                padding: '2.54cm',
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
        <div className="w-52 bg-white border-l border-gray-200 overflow-y-auto">
          
          {/* Imagen */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setShowImagePanel(!showImagePanel)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-1.5">
                <ImageIcon size={14} className="text-green-600" />
                <span className="font-semibold text-xs text-gray-700">Imagen</span>
              </div>
              <ChevronDown size={12} className={`transform transition-transform ${showImagePanel ? 'rotate-180' : ''}`} />
            </button>

            {showImagePanel && (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1.5 px-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                >
                  {currentPageData?.image ? 'Cambiar' : 'Agregar'}
                </button>
                {currentPageData?.image && (
                  <button
                    onClick={() => removeImage(currentPage)}
                    className="w-full py-1.5 px-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    Quitar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Fondo */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-1.5">
                <Palette size={14} className="text-purple-600" />
                <span className="font-semibold text-xs text-gray-700">Fondo</span>
              </div>
              <ChevronDown size={12} className={`transform transition-transform ${showBackgroundPanel ? 'rotate-180' : ''}`} />
            </button>

            {showBackgroundPanel && (
              <div className="space-y-2">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  className="hidden"
                />
                <button
                  onClick={() => backgroundInputRef.current?.click()}
                  className="w-full py-1.5 px-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                >
                  {currentPageData?.background ? 'Cambiar' : 'Agregar'}
                </button>
                {currentPageData?.background && (
                  <button
                    onClick={() => setBackground(currentPage, '')}
                    className="w-full py-1.5 px-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    Quitar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Opciones */}
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Settings size={14} className="text-gray-600" />
              <span className="font-semibold text-xs text-gray-700">Opciones</span>
            </div>
            
            {/* Info de portadas */}
            {(currentPage === 0 || currentPage === pages.length - 1) && (
              <div className="mb-3 p-2 bg-purple-50 rounded text-xs">
                <p className="text-purple-700 font-semibold mb-1">
                  ℹ️ Página especial
                </p>
                <p className="text-purple-600">
                  {currentPage === 0 
                    ? 'La portada aparecerá en el frente con fondo degradado morado.' 
                    : 'La contraportada aparecerá en la parte trasera con fondo degradado.'}
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                if (currentPage === 0) {
                  alert('⚠️ No puedes eliminar la portada. Es la primera página del libro.');
                  return;
                }
                if (currentPage === pages.length - 1 && pages.length > 1) {
                  alert('⚠️ No puedes eliminar la contraportada. Elimina otras páginas primero.');
                  return;
                }
                if (confirm('¿Eliminar esta página?')) {
                  deletePage(currentPage);
                }
              }}
              disabled={totalPages <= 2}
              className="w-full py-1.5 px-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              Eliminar página
            </button>
            
            {totalPages <= 2 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mínimo 2 páginas (portada y contraportada)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estilos */}
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