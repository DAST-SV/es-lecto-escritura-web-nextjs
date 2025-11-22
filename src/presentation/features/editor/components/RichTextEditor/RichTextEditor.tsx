/**
 * UBICACIÓN: src/presentation/features/editor/components/RichTextEditor/RichTextEditor.tsx
 * 
 * Editor de texto rico - VERSIÓN FINAL SIN ERRORES
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { FontSizeExtension } from './extensions/FontSizeExtension';
import { LineHeightExtension } from './extensions/LineHeightExtension';
import { PasteHandlerExtension } from './extensions/PasteHandlerExtension';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  characterLimit?: number;
}

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Escribe aquí...',
  characterLimit = 650,
}: RichTextEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      FontSizeExtension,
      LineHeightExtension,
      PasteHandlerExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      setCharacterCount(text.length);
      
      if (text.length > characterLimit) {
        return;
      }
      
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const isNearLimit = characterCount > characterLimit * 0.8;
  const isOverLimit = characterCount > characterLimit;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('bold') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          <strong>B</strong>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('italic') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          <em>I</em>
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-3 py-1 rounded ${
            editor.isActive('underline') ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          <u>U</u>
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setFontSize(e.target.value).run();
            }
          }}
          className="px-2 py-1 rounded border border-gray-300 text-sm"
        >
          <option value="">Tamaño</option>
          <option value="0.75rem">Pequeño</option>
          <option value="0.875rem">Normal</option>
          <option value="1rem">Mediano</option>
          <option value="1.125rem">Grande</option>
          <option value="1.25rem">Muy grande</option>
        </select>

        <select
          onChange={(e) => {
            if (e.target.value) {
              editor.chain().focus().setLineHeight(e.target.value).run();
            }
          }}
          className="px-2 py-1 rounded border border-gray-300 text-sm"
        >
          <option value="">Interlineado</option>
          <option value="1">Compacto</option>
          <option value="1.15">Ajustado</option>
          <option value="1.5">Normal</option>
          <option value="1.8">Relajado</option>
          <option value="2">Amplio</option>
        </select>

        <div className="w-px bg-gray-300 mx-1" />

        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-3 py-1 rounded ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          ⬅
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-3 py-1 rounded ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          ⬌
        </button>

        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-3 py-1 rounded ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'
          }`}
          type="button"
        >
          ➡
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Contador */}
      <div
        className={`bg-gray-50 border-t border-gray-300 px-4 py-2 text-sm text-right ${
          isOverLimit
            ? 'text-red-600 font-semibold'
            : isNearLimit
            ? 'text-orange-500'
            : 'text-gray-600'
        }`}
      >
        {characterCount} / {characterLimit} caracteres
      </div>
    </div>
  );
}