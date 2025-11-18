import React, { useMemo, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuillWrapper = dynamic(
  async () => {
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

interface RichTitleEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber: number;
}

export const RichTitleEditor: React.FC<RichTitleEditorProps> = ({ value, onChange, pageNumber }) => {
  const quillRef = React.useRef<any>(null);
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [titleTooLong, setTitleTooLong] = useState(false);

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
    clipboard: { matchVisual: false }
  }), []);

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'color', 'background', 'indent', 'align', 'link', 'blockquote'];

  const handleCleanTitle = useCallback(() => {
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
      setTitleTooLong(false);
      return;
    }
    const temp = document.createElement('div');
    temp.innerHTML = value;
    const text = temp.textContent || temp.innerText || '';
    setStats({
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      characters: text.length
    });
    setTitleTooLong(text.length > 500);
  }, [value]);

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          ✏ Título de página {pageNumber}:
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
          placeholder="Escribe tu título aquí..."
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        />
      </div>

      {titleTooLong && (
        <div className="mb-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
          ⚠️ Título muy largo - Puede salirse del libro.
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className={titleTooLong ? 'text-yellow-600 font-medium' : ''}>
          {stats.characters} caracteres
        </span>
        <button onClick={handleCleanTitle} className="text-gray-400 hover:text-gray-600 underline" type="button">
          Limpiar formato
        </button>
      </div>
    </div>
  );
};