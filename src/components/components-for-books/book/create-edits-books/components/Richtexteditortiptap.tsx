import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';

// ⭐ IMPORTAR EXTENSIONES PERSONALIZADAS
import { FontSize, LineHeight, FontFamily } from './tiptap-extensions';

import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, Trash2, Type
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  pageNumber 
}) => {

  const [fontSize, setFontSize] = useState("16");
  const [lineHeight, setLineHeight] = useState("1.5");
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      // ⭐ EXTENSIONES PERSONALIZADAS
      FontSize,
      LineHeight.configure({
        types: ['paragraph', 'heading'],
        defaultLineHeight: '1.5',
      }),
      FontFamily,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Sync externo
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Stats
  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    setStats({ words, characters });
  }, [value, editor]);

  if (!editor) return <div className="p-4 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>;

  // ⭐ FUNCIONES PARA APLICAR ESTILOS AL CONTENIDO
  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    editor.chain().focus().selectAll().setFontSize(`${newSize}px`).run();
  };

  const handleLineHeightChange = (newHeight: string) => {
    setLineHeight(newHeight);
    editor.chain().focus().setLineHeight(newHeight).run();
  };

  const handleFontFamilyChange = (newFamily: string) => {
    setFontFamily(newFamily);
    editor.chain().focus().selectAll().setFontFamily(newFamily).run();
  };

  // Fuentes disponibles
  const fonts = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
    { label: 'Impact', value: 'Impact, fantasy' },
  ];

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          ✏️ Texto de página {pageNumber}:
        </label>
        <div className="text-xs text-gray-500">
          {stats.words} palabras • {stats.characters} caracteres
        </div>
      </div>

      {/* Toolbar SIMPLIFICADO */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-1">

        {/* Undo / Redo */}
        <button onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Deshacer">
          <Undo size={18} />
        </button>

        <button onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Rehacer">
          <Redo size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Fuente */}
        <select
          value={fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1"
          title="Tipo de fuente">
          {fonts.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Tamaño de fuente */}
        <div className="flex items-center gap-1">
          <Type size={14} className="text-gray-600" />
          <select
            value={fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            title="Tamaño">
            {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>

        {/* Interlineado */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 font-medium">Interlineado:</span>
          <select
            value={lineHeight}
            onChange={(e) => handleLineHeightChange(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            title="Espaciado entre líneas">
            <option value="1">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="1.8">1.8</option>
            <option value="2">2.0</option>
            <option value="2.5">2.5</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formato básico */}
        <button onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bold") ? "bg-blue-100" : ""}`}
          title="Negrita">
          <Bold size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("italic") ? "bg-blue-100" : ""}`}
          title="Cursiva">
          <Italic size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("underline") ? "bg-blue-100" : ""}`}
          title="Subrayado">
          <UnderlineIcon size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("strike") ? "bg-blue-100" : ""}`}
          title="Tachado">
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Listas */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bulletList") ? "bg-blue-100" : ""}`}
          title="Lista con viñetas">
          <List size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("orderedList") ? "bg-blue-100" : ""}`}
          title="Lista numerada">
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alineación */}
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
          title="Alinear izquierda">
          <AlignLeft size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
          title="Centrar">
          <AlignCenter size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
          title="Alinear derecha">
          <AlignRight size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
          title="Justificar">
          <AlignJustify size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Cita */}
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("blockquote") ? "bg-blue-100" : ""}`}
          title="Cita">
          <Quote size={18} />
        </button>

        {/* Limpiar formato */}
        <button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 hover:bg-gray-100 rounded text-red-600"
          title="Limpiar formato">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Alerta */}
      {stats.characters > 650 && (
        <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
          ⚠️ Texto muy largo — Considera dividirlo en varias páginas.
        </div>
      )}

      {/* Ayuda rápida */}
      <div className="mt-2 text-xs text-gray-500">
        💡 <strong>Tip:</strong> Usa las imágenes desde el panel "Imagen" para agregar fotos a tu libro.
      </div>

    </div>
  );
};