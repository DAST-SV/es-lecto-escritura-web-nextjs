/**
 * RichTextEditor.tsx - Editor de contenido con tamaños pequeños
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { FontFamilyExtension, FONT_FAMILIES } from '../../extensions/FontFamily.extension';
import { PasteHandlerExtension } from '../../extensions/PasteHandler.extension';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, Trash2
} from 'lucide-react';
import { LINE_HEIGHTS, LineHeightExtension } from '../../extensions/LineHeight.extension';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber?: number;
  characterLimit?: number;
}

// ✅ Tamaños predefinidos para CONTENIDO en ESPAÑOL
const CONTENT_SIZES = {
  'Extra Pequeño': '0.75rem',   // 12px - DEFAULT
  'Pequeño': '0.875rem',        // 14px
  'Normal': '1rem',             // 16px
  'Mediano': '1.125rem',        // 18px
  'Grande': '1.25rem'           // 20px
} as const;

export function RichTextEditor({
  value,
  onChange,
  pageNumber = 1,
  characterLimit = 650
}: RichTextEditorProps) {
  const [stats, setStats] = useState({ words: 0, characters: 0 });
  const [currentSize, setCurrentSize] = useState('Extra Pequeño'); // ✅ DEFAULT

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
      LineHeightExtension.configure({
        types: ['paragraph', 'heading'],
        defaultLineHeight: '1.6', // ✅ Interlineado por defecto
      }),
      FontFamilyExtension,
      PasteHandlerExtension,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[150px] p-2',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor) return;
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    setStats({ words, characters });
  }, [value, editor]);

  if (!editor) {
    return <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando...</div>;
  }

  const isNearLimit = stats.characters > characterLimit * 0.8;
  const isOverLimit = stats.characters > characterLimit;

  // ✅ Aplicar tamaño al texto seleccionado
  const applyFontSize = (size: string) => {
    const fontSize = CONTENT_SIZES[size as keyof typeof CONTENT_SIZES];
    editor.chain().focus().selectAll().setMark('textStyle', { fontSize }).run();
    setCurrentSize(size);
  };

  return (
    <div className="space-y-2 p-2 bg-blue-50 rounded-lg">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700">
          ✏️ Texto p.{pageNumber}
        </label>
        <div className="text-xs text-gray-500">
          {stats.characters}/{characterLimit}
        </div>
      </div>

      {/* Toolbar compacto */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-1 flex flex-wrap gap-0.5">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Deshacer"
        >
          <Undo size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Rehacer"
        >
          <Redo size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        {/* ✅ Fuente */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().selectAll().setFontFamily(e.target.value).run();
            }
          }}
          className="text-xs border border-gray-300 rounded px-1 py-0.5"
          title="Fuente"
        >
          <option value="">Fuente</option>
          {Object.entries(FONT_FAMILIES).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* ✅ Tamaño (predefinido para contenido) */}
        <select
          value={currentSize}
          onChange={(e) => applyFontSize(e.target.value)}
          className="text-xs border border-gray-300 rounded px-1 py-0.5"
          title="Tamaño"
        >
          {Object.keys(CONTENT_SIZES).map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        {/* ✅ Interlineado */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setLineHeight(e.target.value).run();
            }
          }}
          className="text-xs border border-gray-300 rounded px-1 py-0.5"
          title="Interlineado"
        >
          <option value="">Interlín</option>
          {Object.entries(LINE_HEIGHTS).map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("bold") ? "bg-blue-100" : ""}`}
          title="Negrita"
        >
          <Bold size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("italic") ? "bg-blue-100" : ""}`}
          title="Cursiva"
        >
          <Italic size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("underline") ? "bg-blue-100" : ""}`}
          title="Subrayado"
        >
          <UnderlineIcon size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("strike") ? "bg-blue-100" : ""}`}
          title="Tachado"
        >
          <Strikethrough size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("bulletList") ? "bg-blue-100" : ""}`}
          title="Lista"
        >
          <List size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("orderedList") ? "bg-blue-100" : ""}`}
          title="Lista numerada"
        >
          <ListOrdered size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
          title="Izquierda"
        >
          <AlignLeft size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
          title="Centro"
        >
          <AlignCenter size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
          title="Derecha"
        >
          <AlignRight size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
          title="Justificado"
        >
          <AlignJustify size={14} />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive("blockquote") ? "bg-blue-100" : ""}`}
          title="Cita"
        >
          <Quote size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-1 hover:bg-gray-100 rounded text-red-600"
          title="Limpiar formato"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Alertas compactas */}
      {isOverLimit && (
        <div className="p-1.5 bg-red-100 border-l-2 border-red-500 text-red-700 text-xs">
          ❌ Excede {characterLimit} caracteres
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="p-1.5 bg-yellow-100 border-l-2 border-yellow-500 text-yellow-700 text-xs">
          ⚠️ {characterLimit - stats.characters} restantes
        </div>
      )}
    </div>
  );
}