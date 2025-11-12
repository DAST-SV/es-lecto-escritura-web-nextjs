import React, { useMemo, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import '@/src/style/RichTextEditor.css';

// Variable para registro único
let isLineHeightRegistered = false;

// Función para registrar el formato de line-height ANTES de crear Quill
const registerLineHeightFormat = async () => {
  if (isLineHeightRegistered) return;
  
  try {
    // Importar Quill dinámicamente
    const QuillModule = await import('react-quill-new');
    const Quill = QuillModule.default.Quill || QuillModule.Quill;
    
    if (!Quill) {
      console.error('No se pudo cargar Quill');
      return;
    }

    // Importar Parchment
    const Parchment = Quill.import('parchment');
    
    // Crear un Attributor de estilo para line-height
    const LineHeightStyle = new Parchment.StyleAttributor('lineheight', 'line-height', {
      scope: Parchment.Scope.BLOCK,
      whitelist: ['0.5', '1', '1.15', '1.5', '1.75', '2', '2.5', '3']
    });
    
    // Registrar el formato en Quill
    Quill.register(LineHeightStyle, true);
    
    console.log('✅ Line-height format registrado correctamente');
    isLineHeightRegistered = true;
    
  } catch (error) {
    console.error('Error al registrar line-height:', error);
  }
};

// ✅ Wrapper de ReactQuill con registro previo
const ReactQuillWrapper = dynamic(
  async () => {
    // CRÍTICO: Registrar el formato ANTES de retornar el componente
    await registerLineHeightFormat();
    
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

interface RichTextEditorProps {
  isEditing: boolean;
  currentText: string;
  editingText: string;
  pageNumber: number;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTextChange: (html: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  isEditing,
  currentText,
  editingText,
  pageNumber,
  onStartEdit,
  onSave,
  onCancel,
  onTextChange
}) => {
  const quillRef = React.useRef<any>(null);

  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [textTooLong, setTextTooLong] = useState(false);

  // Toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }],
        [{ 'lineheight': ['0.5', '1', '1.15', '1.5', '1.75', '2', '2.5', '3'] }],
        ['link', 'blockquote'],
        ['clean']
      ]
    },
    clipboard: { matchVisual: false }
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'indent', 'align', 'lineheight', 'link', 'blockquote'
  ];

  // Inyectar estilos CSS una sola vez
  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('quill-lineheight-styles')) {
      const style = document.createElement('style');
      style.id = 'quill-lineheight-styles';
      style.innerHTML = `
        /* Asegurar que line-height se vea en el editor */
        .ql-editor p,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6,
        .ql-editor ol,
        .ql-editor ul,
        .ql-editor li,
        .ql-editor div,
        .ql-editor blockquote {
          line-height: inherit;
        }
        
        .ql-editor [style*="line-height"] {
          line-height: inherit !important;
        }
        
        .ql-editor [style*="line-height"] * {
          line-height: inherit;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

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

  const handleCleanText = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const text = editor.getText();
      editor.setContents([]);
      editor.insertText(0, text);
    }
  }, []);

  // Calcular stats solo en cliente
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const html = editingText || currentText;
    if (!html) {
      setStats({ words: 0, characters: 0 });
      setTextTooLong(false);
      return;
    }

    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';

    setStats({
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      characters: text.length
    });

    setTextTooLong(text.length > 650);
  }, [editingText, currentText]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          ✏ Texto de página {pageNumber}:
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
              value={editingText}
              onChange={onTextChange}
              modules={modules}
              formats={formats}
              placeholder="Escribe tu texto aquí... Usa Ctrl+Enter para guardar, Esc para cancelar"
              style={{ backgroundColor: 'white', borderRadius: '8px', color: 'black' }}
            />
          </div>

          {textTooLong && (
            <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
              ⚠️ Texto muy largo - Puede salirse del libro. Considera dividirlo en varias páginas.
            </div>
          )}

          <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
            <span className={textTooLong ? 'text-yellow-600 font-medium' : ''}>
              {stats.words} palabras, {stats.characters} caracteres
            </span>
            <button
              onClick={handleCleanText}
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
            {currentText ? (
              <div className="rich-content">
                <div dangerouslySetInnerHTML={{ __html: currentText }} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Sin texto - Click "Editar Texto" para agregar contenido
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onStartEdit}
              className="flex-1 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              📝 Editar Texto
            </button>
            {currentText && (
              <button
                onClick={() => navigator.clipboard.writeText(currentText)}
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