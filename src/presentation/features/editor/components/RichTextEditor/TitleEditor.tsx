/**
 * UBICACIÓN: src/presentation/features/editor/components/RichTextEditor/TitleEditor.tsx
 * COMPACTO: Menos padding
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
      PasteHandlerExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-base focus:outline-none px-2 py-2',
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          return true;
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
    return <div className="p-3 bg-gray-100 rounded-lg animate-pulse">Cargando...</div>;
  }

  const isNearLimit = stats.characters > characterLimit * 0.8;
  const isOverLimit = stats.characters > characterLimit;

  return (
    <div className="space-y-2 p-2 bg-purple-50 rounded-lg">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700">
          📌 Título p.{pageNumber}
        </label>
        <div className="text-xs text-gray-500">
          {stats.characters}/{characterLimit}
        </div>
      </div>

      {/* Toolbar compacto */}
      <div className="bg-white border border-gray-300 rounded-t-lg p-1 flex gap-0.5">
        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().selectAll().setFontFamily(e.target.value).run();
            }
          }}
          className="text-xs border border-gray-300 rounded px-1 py-0.5"
        >
          <option value="">Fuente</option>
          {Object.entries(FONT_FAMILIES).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().selectAll().setFontSize(e.target.value).run();
            }
          }}
          className="text-xs border border-gray-300 rounded px-1 py-0.5"
        >
          <option value="">Tamaño</option>
          {Object.entries(FONT_SIZES).map(([label, value]) => (
            <option key={value} value={value}>
              {label.replace('-', ' ')}
            </option>
          ))}
        </select>

        <div className="w-px h-5 bg-gray-300 mx-0.5" />

        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive('bold') ? 'bg-purple-100' : ''}`}
        >
          <BoldIcon size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive('italic') ? 'bg-purple-100' : ''}`}
        >
          <ItalicIcon size={14} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 hover:bg-gray-100 rounded ${editor.isActive('underline') ? 'bg-purple-100' : ''}`}
        >
          <UnderlineIcon size={14} />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Alertas */}
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

      <div className="text-xs text-gray-500">
        💡 No puedes usar Enter en títulos
      </div>
    </div>
  );
}