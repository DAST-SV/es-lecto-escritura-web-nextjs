/**
 * UBICACIÓN: src/presentation/features/editor/components/TitleEditor/TitleEditor.tsx
 * 
 * Editor de título - VERSIÓN FINAL SIN ERRORES
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
import { PasteHandlerExtension } from '../extensions/PasteHandlerExtension';
import { FontSizeExtension } from '../extensions/FontSizeExtension';

export interface TitleEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  characterLimit?: number;
}

export function TitleEditor({
  value = '',
  onChange,
  placeholder = 'Título del libro...',
  characterLimit = 150,
}: TitleEditorProps) {
  const [characterCount, setCharacterCount] = useState(0);

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
      PasteHandlerExtension,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none px-4 py-3',
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
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-1">
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
          <option value="1rem">Normal</option>
          <option value="1.25rem">Grande</option>
          <option value="1.5rem">Muy grande</option>
          <option value="2rem">Enorme</option>
        </select>
      </div>

      <EditorContent editor={editor} />

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