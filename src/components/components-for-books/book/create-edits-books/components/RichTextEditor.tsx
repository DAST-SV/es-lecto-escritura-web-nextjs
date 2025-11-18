import React, { useMemo, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import '@/src/style/RichTextEditor.css';

let isLineHeightRegistered = false;

const registerLineHeightFormat = async () => {
  if (isLineHeightRegistered) return;
  try {
    const QuillModule = await import('react-quill-new');
    const Quill = QuillModule.default.Quill || QuillModule.Quill;
    if (!Quill) return;
    const Parchment = Quill.import('parchment');
    const LineHeightStyle = new Parchment.StyleAttributor('lineheight', 'line-height', {
      scope: Parchment.Scope.BLOCK,
      whitelist: ['0.5', '1', '1.15', '1.5', '1.75', '2', '2.5', '3']
    });
    Quill.register(LineHeightStyle, true);
    isLineHeightRegistered = true;
  } catch (error) {
    console.error('Error al registrar line-height:', error);
  }
};

const ReactQuillWrapper = dynamic(
  async () => {
    await registerLineHeightFormat();
    const { default: RQ } = await import('react-quill-new');
    return React.forwardRef<any, any>((props, ref) => {
      const innerRef = React.useRef<any>(null);
      React.useImperativeHandle(ref, () => ({
        getEditor: () => innerRef.current?.getEditor(),
      }));
      return <RQ ref={innerRef} {...props} />;
    });
  },
  { ssr: false, loading: () => <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando...</div> }
);

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, pageNumber }) => {
  const quillRef = React.useRef<any>(null);
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [textTooLong, setTextTooLong] = useState(false);

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

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'list', 'indent', 'align', 'lineheight', 'link', 'blockquote'];

  useEffect(() => {
    if (typeof document !== 'undefined' && !document.getElementById('quill-lineheight-styles')) {
      const style = document.createElement('style');
      style.id = 'quill-lineheight-styles';
      style.innerHTML = `.ql-editor p, .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6, .ql-editor ol, .ql-editor ul, .ql-editor li, .ql-editor div, .ql-editor blockquote { line-height: inherit; } .ql-editor [style*="line-height"] { line-height: inherit !important; } .ql-editor [style*="line-height"] * { line-height: inherit; }`;
      document.head.appendChild(style);
    }
  }, []);

  const handleCleanText = useCallback(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const text = editor.getText();
      editor.setContents([]);
      editor.insertText(0, text);
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!value) {
      setStats({ words: 0, characters: 0 });
      setTextTooLong(false);
      return;
    }
    const temp = document.createElement('div');
    temp.innerHTML = value;
    const text = temp.textContent || temp.innerText || '';
    setStats({
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      characters: text.length
    });
    setTextTooLong(text.length > 650);
  }, [value]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          ✏ Texto de página {pageNumber}:
        </label>
        <div className="text-xs text-gray-500">
          {stats.words} palabras, {stats.characters} caracteres
        </div>
      </div>

      <div className="mb-3">
        <ReactQuillWrapper
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Escribe tu texto aquí..."
          style={{ backgroundColor: 'white', borderRadius: '8px', color: 'black' }}
        />
      </div>

      {textTooLong && (
        <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
          ⚠️ Texto muy largo - Considera dividirlo en varias páginas.
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className={textTooLong ? 'text-yellow-600 font-medium' : ''}>
          {stats.characters} caracteres
        </span>
        <button onClick={handleCleanText} className="text-gray-400 hover:text-gray-600 underline" type="button">
          Limpiar formato
        </button>
      </div>
    </div>
  );
};