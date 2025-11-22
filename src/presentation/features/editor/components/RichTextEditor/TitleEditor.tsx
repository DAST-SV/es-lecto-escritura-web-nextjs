/**
 * UBICACIÓN: src/presentation/features/editor/components/RichTextEditor/TitleEditor.tsx
 * 
 * Editor de título - Sin Enter, sin listas, límite 150 caracteres
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import { PasteHandlerExtension } from '../../extensions/PasteHandler.extension';
import { FontSizeExtension, FONT_SIZES } from '../../extensions/FontSize.extension';
import { FontFamilyExtension, FONT_FAMILIES } from '../../extensions/FontFamily.extension';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon,
  Type 
} from 'lucide-react';

export interface TitleEditorProps {
  value: string;
  onChange: (html: string) => void;
  pageNumber?: number;
  characterLimit?: number;
}

export function TitleEditor({
  value,
  onChange,
  pageNumber = 1,
  characterLimit = 150,
}: TitleEditorProps) {
  const [stats, setStats] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      TextStyle,
      Bold,
      Italic,
      Underline,
      FontSizeExtension,
      FontFamilyExtension,
      PasteHandlerExtension, // ✅ Pegar sin formato
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none px-4 py-3',
      },
      /**
       * BLOQUEAR la tecla Enter para evitar saltos de línea
       */
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          return true; // Evento manejado (bloqueado)
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      setStats({
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        characters: text.length
      });
      
      // No permitir exceder el límite
      if (text.length > characterLimit) {
        return;
      }
      
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>;
  }

  const isNearLimit = stats.characters > characterLimit * 0.8;
  const isOverLimit = stats.characters > characterLimit;

  return (
    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
      {/* Header con stats */}
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-bold text-gray-700">
          📌 Título de página {pageNumber}:
        </label>
        <div className="text-xs text-gray-500">
          {stats.words} palabras • {stats.characters} caracteres
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-2 flex gap-1">
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

        {/* Tamaño (REM) */}
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

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Formato */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('bold') ? 'bg-purple-100' : ''}`}
          title="Negrita"
        >
          <BoldIcon size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('italic') ? 'bg-purple-100' : ''}`}
          title="Cursiva"
        >
          <ItalicIcon size={16} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('underline') ? 'bg-purple-100' : ''}`}
          title="Subrayado"
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Alertas */}
      {isOverLimit && (
        <div className="mt-3 p-2 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
          ❌ Título demasiado largo — Has excedido el límite de {characterLimit} caracteres
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
          ⚠️ Acercándote al límite — {characterLimit - stats.characters} caracteres restantes
        </div>
      )}

      {/* Ayuda */}
      <div className="mt-2 text-xs text-gray-500">
        💡 <strong>Nota:</strong> No puedes usar Enter en los títulos (solo una línea)
      </div>
    </div>
  );
}