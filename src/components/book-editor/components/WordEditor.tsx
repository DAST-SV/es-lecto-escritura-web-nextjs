import React, { useState, useRef } from 'react';
import { EditorContent } from '@tiptap/react';
import { Palette, Settings, ChevronDown, Layers, FileText } from 'lucide-react';
import { WordToolbar } from './WordToolbar';
import { useWordEditor } from '../hooks/useWordEditor';

interface WordEditorProps {
  initialPages?: any[];
  bookTitle?: string;
  onSave?: (pages: any[]) => Promise<void>;
  onPreview?: () => void;
  onPageChange?: (pageIndex: number) => void;
  onPagesUpdate?: (pages: any[]) => void;
  hideHeader?: boolean;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  initialPages = [],
  onPageChange,
  onPagesUpdate,
  hideHeader = false
}) => {
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const {
    editor,
    pages,
    currentPage,
    totalPages,
    goToPage,
    addSheet,
    deleteSheet,
    setBackground,
    getCurrentSheet,
    getTotalSheets,
    isFirstPage,
    isLastPage,
    getPageSide
  } = useWordEditor({
    initialPages,
    onPagesChange: onPagesUpdate
  });

  React.useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange]);

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
  const currentSheetNumber = getCurrentSheet();
  const totalSheets = getTotalSheets();
  const pageSide = getPageSide();

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
      <WordToolbar editor={editor} />

      {/* Área principal */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel lateral izquierdo: Hojas */}
        <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          
          <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-700">
                Libro: {totalSheets} {totalSheets === 1 ? 'Hoja' : 'Hojas'}
              </span>
            </div>
            <div className="text-xs text-gray-600">
              {totalPages} páginas ({totalPages / 2} hojas)
            </div>
          </div>

          <div className="p-2 border-b border-gray-200">
            <button
              onClick={addSheet}
              className="w-full py-2 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Layers size={14} />
              + Agregar Hoja
            </button>
            <p className="text-[10px] text-gray-500 mt-1 text-center">
              Agrega 2 páginas (frente + reverso)
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {Array.from({ length: totalSheets }, (_, sheetIndex) => {
              const frontPageIndex = sheetIndex * 2;
              const backPageIndex = sheetIndex * 2 + 1;
              const frontPage = pages[frontPageIndex];
              const backPage = pages[backPageIndex];
              const isCurrentSheet = Math.floor(currentPage / 2) === sheetIndex;
              
              return (
                <div
                  key={`sheet-${sheetIndex}`}
                  className={`border-2 rounded-lg overflow-hidden transition-all ${
                    isCurrentSheet
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`px-2 py-1.5 text-xs font-bold flex items-center justify-between ${
                    isCurrentSheet
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    <div className="flex items-center gap-1">
                      <FileText size={12} />
                      <span>Hoja {sheetIndex + 1}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => goToPage(frontPageIndex)}
                    className={`w-full p-2 text-left transition-colors border-b ${
                      currentPage === frontPageIndex
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white hover:bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        currentPage === frontPageIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {frontPageIndex === 0 ? '📖 Portada' : `Pág. ${frontPageIndex + 1}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Frente {frontPageIndex === 0 ? '(Exterior)' : ''}
                    </span>
                  </button>

                  <button
                    onClick={() => goToPage(backPageIndex)}
                    className={`w-full p-2 text-left transition-colors ${
                      currentPage === backPageIndex
                        ? 'bg-blue-50'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${
                        currentPage === backPageIndex ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {backPageIndex === pages.length - 1 ? '📕 Contraportada' : `Pág. ${backPageIndex + 1}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Reverso {backPageIndex === pages.length - 1 ? '(Exterior)' : ''}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Área del editor */}
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <span className="text-sm font-semibold text-gray-700">
                    Hoja {currentSheetNumber} / {totalSheets}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({pageSide === 'front' ? 'Frente' : 'Reverso'})
                  </span>
                </div>

                {isFirstPage() && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    📖 Portada Exterior
                  </div>
                )}
                {isLastPage() && (
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                    📕 Contraportada Exterior
                  </div>
                )}
              </div>

              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                Página {currentPage + 1} de {totalPages}
              </div>
            </div>

            {(isFirstPage() || isLastPage()) && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 rounded-lg">
                <p className="text-sm font-bold text-purple-800 mb-1">
                  {isFirstPage() ? '📖 Página de Portada (Cara Exterior)' : '📕 Contraportada (Cara Exterior)'}
                </p>
                <p className="text-xs text-purple-600">
                  Esta es la cara {isFirstPage() ? 'frontal' : 'trasera'} exterior del libro. 
                  En el modo vista previa, se mostrará con un fondo degradado automáticamente.
                </p>
              </div>
            )}

            {/* ⭐ HOJA DE PAPEL - TODO EN PORCENTAJES */}
            <div 
              className="page-editor-container"
              style={{
                ...(currentPageData?.background && {
                  backgroundImage: `url(${currentPageData.background})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                })
              }}
            >
              <EditorContent 
                editor={editor}
                className="page-editor-content"
              />
            </div>
          </div>
        </div>

        {/* Panel lateral derecho: Herramientas */}
        <div className="w-56 bg-white border-l border-gray-200 overflow-y-auto">
          
          <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="text-center mb-2">
              <div className="text-2xl mb-1">
                {pageSide === 'front' ? '📄' : '📃'}
              </div>
              <div className="text-xs font-bold text-gray-700">
                {pageSide === 'front' ? 'FRENTE' : 'REVERSO'}
              </div>
              <div className="text-[10px] text-gray-500 mt-1">
                Hoja {currentSheetNumber} de {totalSheets}
              </div>
            </div>
          </div>

          {/* Fondo */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
              className="flex items-center justify-between w-full mb-2"
            >
              <div className="flex items-center gap-2">
                <Palette size={16} className="text-purple-600" />
                <span className="font-semibold text-sm text-gray-700">Fondo</span>
              </div>
              <ChevronDown size={14} className={`transform transition-transform ${showBackgroundPanel ? 'rotate-180' : ''}`} />
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
                  className="w-full py-2 px-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-xs font-medium transition-colors"
                >
                  {currentPageData?.background ? '🔄 Cambiar' : '➕ Agregar'}
                </button>
                {currentPageData?.background && (
                  <button
                    onClick={() => setBackground(currentPage, '')}
                    className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs font-medium transition-colors"
                  >
                    🗑️ Quitar
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Opciones de hoja */}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-gray-600" />
              <span className="font-semibold text-sm text-gray-700">Opciones de Hoja</span>
            </div>
            
            {(isFirstPage() || isLastPage()) && (
              <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                <p className="text-purple-700 font-semibold mb-1">
                  ℹ️ Página especial
                </p>
                <p className="text-purple-600">
                  {isFirstPage() 
                    ? 'Esta es la portada exterior del libro.' 
                    : 'Esta es la contraportada exterior.'}
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                const sheetIndex = Math.floor(currentPage / 2);
                deleteSheet(sheetIndex);
              }}
              disabled={totalSheets <= 1}
              className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-colors"
            >
              🗑️ Eliminar Hoja Completa
            </button>
            
            {totalSheets <= 1 && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Mínimo 1 hoja (2 páginas)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ⭐ ESTILOS CON PORCENTAJES */}
      <style jsx global>{`
        /* ===========================
           CONTENEDOR DE PÁGINA - PORCENTAJES
           =========================== */
        .page-editor-container {
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          overflow: hidden;
          
          /* ⭐ Dimensiones en proporción A4 con porcentajes */
          width: 100%;
          max-width: 21cm;
          aspect-ratio: 210 / 297; /* Ratio A4 exacto */
          
          /* ⭐ Padding en porcentaje (12% = ~2.54cm en A4) */
          padding: 12% 12%;
          
          box-sizing: border-box;
          margin: 0 auto;
        }

        /* ===========================
           CONTENIDO DEL EDITOR
           =========================== */
        .page-editor-content {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .page-editor-content .ProseMirror {
          outline: none;
          width: 100%;
          height: 100%;
          overflow-y: auto;
          
          /* ⭐ Tipografía base */
          font-family: 'Times New Roman', serif;
          font-size: 1rem; /* Base relativo */
          line-height: 1.5;
          color: #000;
        }

        /* ===========================
           TIPOGRAFÍA - EM RELATIVO
           =========================== */
        .page-editor-content p {
          margin-bottom: 0.5em;
          margin-top: 0;
        }

        .page-editor-content h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          line-height: 1.2;
        }

        .page-editor-content h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          line-height: 1.2;
        }

        .page-editor-content h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 1em;
          line-height: 1.2;
        }

        /* ===========================
           LISTAS
           =========================== */
        .page-editor-content ul,
        .page-editor-content ol {
          padding-left: 1.5em;
          margin-bottom: 0.5em;
          margin-top: 0.5em;
        }

        .page-editor-content ul {
          list-style-type: disc;
        }

        .page-editor-content ul ul {
          list-style-type: circle;
        }

        .page-editor-content ol {
          list-style-type: decimal;
        }

        .page-editor-content li {
          margin-bottom: 0.25em;
        }

        /* ===========================
           FORMATO
           =========================== */
        .page-editor-content strong,
        .page-editor-content b {
          font-weight: bold;
        }

        .page-editor-content em,
        .page-editor-content i {
          font-style: italic;
        }

        .page-editor-content u {
          text-decoration: underline;
        }

        .page-editor-content s {
          text-decoration: line-through;
        }

        .page-editor-content blockquote {
          border-left: 4px solid #ddd;
          padding-left: 1em;
          margin-left: 0;
          color: #666;
          font-style: italic;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .page-editor-content code {
          background-color: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }

        .page-editor-content pre {
          background-color: #f5f5f5;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .page-editor-content hr {
          border: none;
          border-top: 2px solid #ddd;
          margin: 2em 0;
        }
      `}</style>
    </div>
  );
};

export default WordEditor;