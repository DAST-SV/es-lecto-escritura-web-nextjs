import React, { useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo, Minus, Plus,
  Type, Palette, Highlighter, ChevronDown, Image as ImageIcon,
  Heading1, Heading2, Heading3, Code, Quote, Minus as MinusIcon
} from 'lucide-react';

interface WordToolbarProps {
  editor: any;
  onImageUpload?: () => void;
}

export const WordToolbar: React.FC<WordToolbarProps> = ({ editor, onImageUpload }) => {
  const [fontSize, setFontSize] = useState('16');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  if (!editor) return null;

  // Listas de opciones
  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];
  const lineHeights = ['1', '1.15', '1.5', '2', '2.5', '3'];
  const fontFamilies = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
    { name: 'Trebuchet', value: '"Trebuchet MS", sans-serif' },
    { name: 'Impact', value: 'Impact, fantasy' },
  ];

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  ];

  const applyFontSize = (size: string) => {
    setFontSize(size);
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
  };

  const applyLineHeight = (height: string) => {
    setLineHeight(height);
    editor.chain().focus().setLineHeight(height).run();
  };

  const applyFontFamily = (family: string, name: string) => {
    setFontFamily(name);
    editor.chain().focus().setFontFamily(family).run();
  };

  const applyTextColor = (color: string) => {
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const applyHighlight = (color: string) => {
    setHighlightColor(color);
    editor.chain().focus().toggleHighlight({ color }).run();
    setShowHighlightPicker(false);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Primera fila: Fuente, Tamaño, Formato básico */}
      <div className="flex items-center gap-1 p-2 flex-wrap border-b border-gray-100">
        
        {/* Deshacer/Rehacer */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Fuente */}
        <select
          value={fontFamily}
          onChange={(e) => {
            const selected = fontFamilies.find(f => f.name === e.target.value);
            if (selected) applyFontFamily(selected.value, selected.name);
          }}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minWidth: '140px' }}
        >
          {fontFamilies.map(font => (
            <option key={font.name} value={font.name}>{font.name}</option>
          ))}
        </select>

        {/* Tamaño */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-2">
          <button
            onClick={() => {
              const current = parseInt(fontSize);
              if (current > 8) applyFontSize((current - 1).toString());
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Disminuir tamaño"
          >
            <Minus size={16} />
          </button>
          <select
            value={fontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ width: '65px' }}
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <button
            onClick={() => {
              const current = parseInt(fontSize);
              if (current < 72) applyFontSize((current + 1).toString());
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Aumentar tamaño"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Formato de texto */}
        <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Negrita (Ctrl+B)"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Cursiva (Ctrl+I)"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Subrayado (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('strike') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Tachado"
          >
            <Strikethrough size={18} />
          </button>
        </div>

        {/* Color de texto */}
        <div className="relative border-l border-gray-200 pl-2 ml-2">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowHighlightPicker(false);
            }}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded"
            title="Color de texto"
          >
            <Type size={18} />
            <div className="w-4 h-1 rounded" style={{ backgroundColor: textColor }} />
            <ChevronDown size={14} />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50">
              <div className="grid grid-cols-10 gap-1" style={{ width: '220px' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => applyTextColor(color)}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resaltado */}
        <div className="relative">
          <button
            onClick={() => {
              setShowHighlightPicker(!showHighlightPicker);
              setShowColorPicker(false);
            }}
            className="flex items-center gap-1 p-2 hover:bg-gray-100 rounded"
            title="Color de resaltado"
          >
            <Highlighter size={18} />
            <div className="w-4 h-1 rounded" style={{ backgroundColor: highlightColor }} />
            <ChevronDown size={14} />
          </button>
          
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-50">
              <div className="grid grid-cols-10 gap-1" style={{ width: '220px' }}>
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => applyHighlight(color)}
                    className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Segunda fila: Párrafo, Alineación, Listas */}
      <div className="flex items-center gap-1 p-2 flex-wrap">
        
        {/* Estilos de encabezado */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 hover:bg-gray-100 rounded text-sm font-semibold ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Título 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 hover:bg-gray-100 rounded text-sm font-semibold ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Título 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1 hover:bg-gray-100 rounded text-sm font-semibold ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Título 3"
          >
            H3
          </button>
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-3 py-1 hover:bg-gray-100 rounded text-sm ${editor.isActive('paragraph') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Párrafo normal"
          >
            P
          </button>
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Lista con viñetas"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Lista numerada"
          >
            <ListOrdered size={18} />
          </button>
        </div>

        {/* Alineación */}
        <div className="flex gap-1 border-r border-gray-200 pr-2 mr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Alinear izquierda"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Centrar"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Alinear derecha"
          >
            <AlignRight size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Justificar"
          >
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Interlineado */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-medium">Interlineado:</span>
          <select
            value={lineHeight}
            onChange={(e) => applyLineHeight(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{ width: '70px' }}
          >
            {lineHeights.map(height => (
              <option key={height} value={height}>{height}</option>
            ))}
          </select>
        </div>

        {/* Otros */}
        <div className="flex gap-1 border-l border-gray-200 pl-2 ml-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Cita"
          >
            <Quote size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 hover:bg-gray-100 rounded ${editor.isActive('codeBlock') ? 'bg-blue-100 text-blue-700' : ''}`}
            title="Bloque de código"
          >
            <Code size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 hover:bg-gray-100 rounded"
            title="Línea horizontal"
          >
            <MinusIcon size={18} />
          </button>
          {onImageUpload && (
            <button
              onClick={onImageUpload}
              className="p-2 hover:bg-gray-100 rounded"
              title="Insertar imagen"
            >
              <ImageIcon size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};