/**
 * UBICACIÓN: src/presentation/features/editor/components/RichTextEditor/RichTextEditor.tsx
 * 
 * Editor de texto rico MEJORADO - Sin pixeles, con REM, sin auto-paginación
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
import { 
  FontFamilyExtension, 
  FONT_FAMILIES, 
  FontFamilyKey 
} from '../../extensions/FontFamily.extension';
import { PasteHandlerExtension } from '../../extensions/PasteHandler.extension';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Undo, Redo, Trash2, Type, Users
} from 'lucide-react';
import { LINE_HEIGHTS, LineHeightExtension } from '../../extensions/LineHeight.extension';
import { FONT_SIZES, FontSizeExtension } from '../../extensions/FontSize.extension';

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber?: number;
  characterLimit?: number;
}

export function RichTextEditor({
  value,
  onChange,
  pageNumber = 1,
  characterLimit = 650
}: RichTextEditorProps) {
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
      // Extensiones personalizadas
      FontSizeExtension,
      LineHeightExtension.configure({
        types: ['paragraph', 'heading'],
        defaultLineHeight: '1.5',
      }),
      FontFamilyExtension,
      PasteHandlerExtension, // ✅ Pegar SIN formato
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

  if (!editor) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>;
  }

  const isNearLimit = stats.characters > characterLimit * 0.8;
  const isOverLimit = stats.characters > characterLimit;

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
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Deshacer"
        >
          <Undo size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Rehacer"
        >
          <Redo size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Fuente */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().selectAll().setFontFamily(e.target.value).run();
            }
          }}
          className="text-xs border border-gray-300 rounded px-2 py-1"
          title="Tipo de fuente"
        >
          <option value="">Fuente</option>
          {Object.entries(FONT_FAMILIES).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Tamaño de fuente (REM - responsive) */}
        <div className="flex items-center gap-1">
          <Type size={14} className="text-gray-600" />
          <select
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().selectAll().setFontSize(e.target.value).run();
              }
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            title="Tamaño"
          >
            <option value="">Tamaño</option>
            {Object.entries(FONT_SIZES).map(([label, value]) => (
              <option key={value} value={value}>
                {label.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Interlineado */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600 font-medium">Interlineado:</span>
          <select
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().setLineHeight(e.target.value).run();
              }
            }}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            title="Espaciado entre líneas"
          >
            {Object.entries(LINE_HEIGHTS).map(([label, value]) => (
              <option key={value} value={value}>
                {label.replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formato básico */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bold") ? "bg-blue-100" : ""}`}
          title="Negrita"
        >
          <Bold size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("italic") ? "bg-blue-100" : ""}`}
          title="Cursiva"
        >
          <Italic size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("underline") ? "bg-blue-100" : ""}`}
          title="Subrayado"
        >
          <UnderlineIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("strike") ? "bg-blue-100" : ""}`}
          title="Tachado"
        >
          <Strikethrough size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Listas */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("bulletList") ? "bg-blue-100" : ""}`}
          title="Lista con viñetas"
        >
          <List size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("orderedList") ? "bg-blue-100" : ""}`}
          title="Lista numerada"
        >
          <ListOrdered size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alineación */}
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "left" }) ? "bg-blue-100" : ""}`}
          title="Alinear izquierda"
        >
          <AlignLeft size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "center" }) ? "bg-blue-100" : ""}`}
          title="Centrar"
        >
          <AlignCenter size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "right" }) ? "bg-blue-100" : ""}`}
          title="Alinear derecha"
        >
          <AlignRight size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: "justify" }) ? "bg-blue-100" : ""}`}
          title="Justificar"
        >
          <AlignJustify size={18} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Cita */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive("blockquote") ? "bg-blue-100" : ""}`}
          title="Cita"
        >
          <Quote size={18} />
        </button>

        {/* Limpiar formato */}
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="p-2 hover:bg-gray-100 rounded text-red-600"
          title="Limpiar formato"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Alerta */}
      {isOverLimit && (
        <div className="mt-3 p-2 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
          ❌ Texto demasiado largo — Has excedido el límite de {characterLimit} caracteres
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
          ⚠️ Acercándote al límite — {characterLimit - stats.characters} caracteres restantes
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-2 text-xs text-gray-500">
        💡 <strong>Tip:</strong> Al pegar texto, se pegará automáticamente SIN formato (solo texto plano)
      </div>
    </div>
  );
}