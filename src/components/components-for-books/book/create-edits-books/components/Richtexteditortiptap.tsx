import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';

import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, Link2, Table as TableIcon, Image as ImageIcon,
  Heading1, Heading2, Heading3, Trash2, Type
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

  // ➤ NUEVO
  const [fontSize, setFontSize] = useState("16");
  const [lineHeight, setLineHeight] = useState("1.5");
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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] p-4',
        style: `font-size:${fontSize}px; line-height:${lineHeight};`,
      },
    },
  });

  // Sync externo
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // ➤ NUEVO: aplicar fontSize + lineHeight directo al DOM
  useEffect(() => {
    if (editor?.view?.dom) {
      editor.view.dom.style.fontSize = `${fontSize}px`;
      editor.view.dom.style.lineHeight = lineHeight;
    }
  }, [fontSize, lineHeight, editor]);

  // Stats
  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    setStats({ words, characters });
  }, [value, editor]);

  if (!editor) return <div className="p-4 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>;

  // Insertar elementos
  const addLink = () => {
    const url = window.prompt('URL del enlace:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();

  // Fuentes
  const fonts = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
  ];

  const applyFontFamily = (font: string) => {
    if (editor?.view?.dom) {
      editor.view.dom.style.fontFamily = font;
    }
  };

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

      {/* Toolbar */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-1">

        {/* Undo / Redo */}
        <button onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30">
          <Undo size={18} />
        </button>

        <button onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30">
          <Redo size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Fuente */}
        <select
          onChange={(e) => applyFontFamily(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1">
          {fonts.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Tamaño de fuente */}
        <div className="flex items-center gap-1">
          <Type size={14} className="text-gray-600" />
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1">
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
            onChange={(e) => setLineHeight(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1">
            <option value="1">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="1.8">1.8</option>
            <option value="2">2.0</option>
            <option value="2.5">2.5</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formato */}
        <button onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bold") ? "bg-blue-100" : ""}`}>
          <Bold size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("italic") ? "bg-blue-100" : ""}`}>
          <Italic size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("underline") ? "bg-blue-100" : ""}`}>
          <UnderlineIcon size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("strike") ? "bg-blue-100" : ""}`}>
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Listas */}
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bulletList") ? "bg-blue-100" : ""}`}>
          <List size={18} />
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("orderedList") ? "bg-blue-100" : ""}`}>
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alineación */}
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}>
          <AlignLeft size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}>
          <AlignCenter size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}>
          <AlignRight size={18} />
        </button>

        <button onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}>
          <AlignJustify size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Extras */}
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("blockquote") ? "bg-blue-100" : ""}`}>
          <Quote size={18} />
        </button>

        <button onClick={addLink} className="p-2 hover:bg-gray-100 rounded">
          <Link2 size={18} />
        </button>

        <button onClick={addTable} className="p-2 hover:bg-gray-100 rounded">
          <TableIcon size={18} />
        </button>

        <button onClick={addImage} className="p-2 hover:bg-gray-100 rounded">
          <ImageIcon size={18} />
        </button>

        <button onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 hover:bg-gray-100 rounded text-red-600">
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

    </div>
  );
};
