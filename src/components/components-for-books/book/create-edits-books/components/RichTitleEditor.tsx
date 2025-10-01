import React, { useMemo, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// ✅ Crear un wrapper que maneje el ref
const ReactQuillWrapper = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    
    // Componente wrapper con forwardRef
    return React.forwardRef<any, any>((props, ref) => {
      const innerRef = React.useRef<any>(null);
      
      React.useImperativeHandle(ref, () => ({
        getEditor: () => innerRef.current?.getEditor(),
      }));

      return <RQ ref={innerRef} {...props} />;
    });
  },
  {
    ssr: false,
    loading: () => <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>
  }
);

interface RichTitleEditorProps {
  isEditing: boolean;
  currentTitle: string;
  editingTitle: string;
  pageNumber: number;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTitleChange: (html: string) => void;
}

export const RichTitleEditor: React.FC<RichTitleEditorProps> = ({
  isEditing,
  currentTitle,
  editingTitle,
  pageNumber,
  onStartEdit,
  onSave,
  onCancel,
  onTitleChange
}) => {
  const quillRef = React.useRef<any>(null);

  // Estado para stats
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [titleTooLong, setTitleTooLong] = useState(false);

  // Configuración del toolbar
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'blockquote'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'indent', 'align', 'link', 'blockquote'
  ];

  // Enfocar editor al abrir
  useEffect(() => {
    if (isEditing && quillRef.current) {
      const timer = setTimeout(() => {
        const editor = quillRef.current?.getEditor();
        if (editor) {
          editor.focus();
          const length = editor.getLength();
          editor.setSelection(length - 1, 0);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSave();
  }, [onCancel, onSave]);

  const handleCleanTitle = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const Title = editor.getText();
      editor.setContents([]);
      editor.insertText(0, Title);
    }
  }, []);

  // -----------------------------
  // Calcular stats solo en cliente
  // -----------------------------
  useEffect(() => {
    if (typeof document === 'undefined') return; // SSR safe
    const html = editingTitle || currentTitle;
    if (!html) {
      setStats({ words: 0, characters: 0 });
      setTitleTooLong(false);
      return;
    }

    const temp = document.createElement('div');
    temp.innerHTML = html;
    const Title = temp.textContent || temp.innerText || '';

    setStats({
      words: Title.trim() ? Title.trim().split(/\s+/).length : 0,
      characters: Title.length
    });

    setTitleTooLong(Title.length > 500);
  }, [editingTitle, currentTitle]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          ✏ Titulo de página {pageNumber}:
        </label>
        {!isEditing && (
          <div className="text-xs text-gray-500">
            {stats.words} palabras, {stats.characters} caracteres
          </div>
        )}
      </div>

      {isEditing ? (
        <>
          <div className="mb-4" onKeyDown={handleKeyDown}>
            <ReactQuillWrapper
              ref={quillRef}
              theme="snow"
              value={editingTitle}
              onChange={onTitleChange}
              modules={modules}
              formats={formats}
              placeholder="Escribe tu título aquí... Usa Ctrl+Enter para guardar, Esc para cancelar"
              style={{ backgroundColor: 'white', borderRadius: '8px' }}
            />
          </div>

          {titleTooLong && (
            <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
              ⚠️ Título muy largo - Puede salirse del libro. Considera acortarlo.
            </div>
          )}

          <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
            <span className={titleTooLong ? 'text-yellow-600 font-medium' : ''}>
              {stats.words} palabras, {stats.characters} caracteres
            </span>
            <button
              onClick={handleCleanTitle}
              className="text-gray-400 hover:text-gray-600 underline"
              type="button"
            >
              Limpiar formato
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              title="Ctrl+Enter"
            >
              ✅ Guardar
            </button>
            <button
              onClick={onCancel}
              className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
              title="Escape"
            >
              ❌ Cancelar
            </button>
          </div>
        </>
      ) : (
        <div>
          <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3 max-h-40 overflow-auto min-h-[4rem]">
            {currentTitle ? (
              <div className="rich-content">
                <div dangerouslySetInnerHTML={{ __html: currentTitle }} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Sin título - Click "Editar Título" para agregar contenido
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onStartEdit}
              className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              📝 Editar Título
            </button>
            {currentTitle && (
              <button
                onClick={() => navigator.clipboard.writeText(currentTitle)}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm transition-colors"
                title="Copiar HTML"
              >
                📋
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};