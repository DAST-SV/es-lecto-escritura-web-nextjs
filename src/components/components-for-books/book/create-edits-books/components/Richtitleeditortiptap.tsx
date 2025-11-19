import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TiptapUnderline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Type, Undo, Redo
} from 'lucide-react';

interface RichTitleEditorProps {
    value: string;
    onChange: (html: string) => void;
    pageNumber: number;
}

export const RichTitleEditor: React.FC<RichTitleEditorProps> = ({
    value,
    onChange,
    pageNumber
}) => {
    const [stats, setStats] = useState({ words: 0, characters: 0 });
    const [fontSize, setFontSize] = useState('16');
    const [lineHeight, setLineHeight] = useState('1.5');

    const editor = useEditor({
        immediatelyRender: false, // ✅ Fix para SSR en Next.js
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            TextAlign.configure({
                types: ['paragraph'],
            }),
            TiptapUnderline,
            TextStyle,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none min-h-[60px] p-3',
                style: `font-size: ${fontSize}px; line-height: ${lineHeight};`,
            },
        },
    });

    // Sincronizar value externo con editor
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    // Calcular estadísticas
    useEffect(() => {
        if (!editor) return;
        const text = editor.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;
        setStats({ words, characters });
    }, [value, editor]);

    // Aplicar tamaño de fuente y interlineado
    useEffect(() => {
        if (editor) {
            const view = editor.view;
            if (view?.dom) {
                view.dom.style.fontSize = `${fontSize}px`;
                view.dom.style.lineHeight = lineHeight;
            }
        }
    }, [fontSize, lineHeight, editor]);

    if (!editor) {
        return <div className="p-4 bg-gray-100 rounded-lg animate-pulse">Cargando editor...</div>;
    }

    const fontFamilies = [
        { label: 'Arial', value: 'Arial, sans-serif' },
        { label: 'Times New Roman', value: 'Times New Roman, serif' },
        { label: 'Georgia', value: 'Georgia, serif' },
        { label: 'Courier New', value: 'Courier New, monospace' },
        { label: 'Verdana', value: 'Verdana, sans-serif' },
    ];

    const applyFontFamily = (fontFamily: string) => {
        const view = editor.view;
        if (view?.dom) {
            view.dom.style.fontFamily = fontFamily;
        }
    };

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

            {/* Toolbar optimizado para libros */}
            <div className="bg-white border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-2 items-center">
                {/* Deshacer/Rehacer */}
                <div className="flex gap-1">
                    <button
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Deshacer"
                    >
                        <Undo size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        className="p-2 hover:bg-gray-100 rounded disabled:opacity-30"
                        title="Rehacer"
                    >
                        <Redo size={16} />
                    </button>
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* Fuente */}
                <select
                    onChange={(e) => applyFontFamily(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    title="Familia de fuente"
                >
                    {fontFamilies.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                    ))}
                </select>

                {/* Tamaño de fuente */}
                <div className="flex items-center gap-1">
                    <Type size={14} className="text-gray-600" />
                    <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title="Tamaño de fuente"
                    >
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
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        title="Interlineado"
                    >
                        <option value="1">1.0</option>
                        <option value="1.15">1.15</option>
                        <option value="1.5">1.5</option>
                        <option value="1.8">1.8</option>
                        <option value="2">2.0</option>
                        <option value="2.5">2.5</option>
                    </select>
                </div>

                <div className="w-px h-6 bg-gray-300" />

                {/* Formato de texto */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('bold') ? 'bg-purple-100' : ''}`}
                    title="Negrita"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('italic') ? 'bg-purple-100' : ''}`}
                    title="Cursiva"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('underline') ? 'bg-purple-100' : ''}`}
                    title="Subrayado"
                >
                    <UnderlineIcon size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('strike') ? 'bg-purple-100' : ''}`}
                    title="Tachado"
                >
                    <Strikethrough size={16} />
                </button>

                <div className="w-px h-6 bg-gray-300" />

                {/* Alineación */}
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-purple-100' : ''}`}
                    title="Alinear izquierda"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-purple-100' : ''}`}
                    title="Centrar"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-purple-100' : ''}`}
                    title="Alinear derecha"
                >
                    <AlignRight size={16} />
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-purple-100' : ''}`}
                    title="Justificar"
                >
                    <AlignJustify size={16} />
                </button>
            </div>

            {/* Editor */}
            <div className="bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
                <EditorContent editor={editor} />
            </div>

            {/* Alertas */}
            {stats.characters > 150 && (
                <div className="mt-3 p-2 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-sm">
                    ⚠️ Título muy largo - Puede salirse del libro.
                </div>
            )}
        </div>
    );
};