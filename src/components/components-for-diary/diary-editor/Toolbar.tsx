'use client';

import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Palette,
  Highlighter,
  Link as LinkIcon,
  Unlink,
  Quote,
  Code,
  Minus,
  Check,
  X
} from 'lucide-react';
import { useState, useCallback } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onImageClick: () => void;
  subiendoImagen: boolean;
}

const COLORES_TEXTO = [
  { nombre: 'Negro', valor: '#1a1a1a' },
  { nombre: 'Azul', valor: '#2563eb' },
  { nombre: 'Rojo', valor: '#dc2626' },
  { nombre: 'Verde', valor: '#16a34a' },
  { nombre: 'Morado', valor: '#9333ea' },
  { nombre: 'Rosa', valor: '#ec4899' },
  { nombre: 'Naranja', valor: '#ea580c' },
  { nombre: 'Café', valor: '#92400e' },
];

const COLORES_RESALTADO = [
  { nombre: 'Amarillo', valor: '#fef08a' },
  { nombre: 'Verde', valor: '#bbf7d0' },
  { nombre: 'Azul', valor: '#bfdbfe' },
  { nombre: 'Rosa', valor: '#fbcfe8' },
  { nombre: 'Morado', valor: '#e9d5ff' },
  { nombre: 'Naranja', valor: '#fed7aa' },
];

export default function Toolbar({ editor, onImageClick, subiendoImagen }: ToolbarProps) {
  const [mostrarColores, setMostrarColores] = useState(false);
  const [mostrarResaltado, setMostrarResaltado] = useState(false);
  const [mostrarLink, setMostrarLink] = useState(false);
  const [urlLink, setUrlLink] = useState('');

  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    if (urlLink === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setMostrarLink(false);
      return;
    }

    const url = urlLink.startsWith('http') ? urlLink : `https://${urlLink}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setMostrarLink(false);
    setUrlLink('');
  }, [editor, urlLink]);

  const ToolbarButton = ({ 
    onClick, 
    active, 
    disabled, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    disabled?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-2 rounded transition-all ${
        active 
          ? 'bg-amber-800 text-amber-50' 
          : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gradient-to-b from-amber-200 to-amber-100 border-b-2 border-amber-300 shadow-md sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-wrap gap-2 items-center">
          
          {/* Formato de texto */}
          <div className="flex gap-1 border-r border-amber-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              title="Negrita (Ctrl+B)"
            >
              <Bold className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              title="Cursiva (Ctrl+I)"
            >
              <Italic className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              title="Subrayado (Ctrl+U)"
            >
              <UnderlineIcon className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              title="Código"
            >
              <Code className="w-5 h-5" />
            </ToolbarButton>
          </div>

          {/* Encabezados */}
          <div className="flex gap-1 border-r border-amber-300 pr-2">
            <ToolbarButton
              onClick={() => {
                if (editor.isActive('heading', { level: 1 })) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().setHeading({ level: 1 }).run();
                }
              }}
              active={editor.isActive('heading', { level: 1 })}
              title="Título grande"
            >
              <Heading1 className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => {
                if (editor.isActive('heading', { level: 2 })) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().setHeading({ level: 2 }).run();
                }
              }}
              active={editor.isActive('heading', { level: 2 })}
              title="Título mediano"
            >
              <Heading2 className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => {
                if (editor.isActive('heading', { level: 3 })) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().setHeading({ level: 3 }).run();
                }
              }}
              active={editor.isActive('heading', { level: 3 })}
              title="Título pequeño"
            >
              <Heading3 className="w-5 h-5" />
            </ToolbarButton>
          </div>

          {/* Alineación */}
          <div className="flex gap-1 border-r border-amber-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })}
              title="Alinear izquierda"
            >
              <AlignLeft className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })}
              title="Alinear centro"
            >
              <AlignCenter className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })}
              title="Alinear derecha"
            >
              <AlignRight className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              active={editor.isActive({ textAlign: 'justify' })}
              title="Justificar"
            >
              <AlignJustify className="w-5 h-5" />
            </ToolbarButton>
          </div>

          {/* Listas y elementos */}
          <div className="flex gap-1 border-r border-amber-300 pr-2">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              title="Lista con viñetas"
            >
              <List className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              title="Lista numerada"
            >
              <ListOrdered className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              title="Cita"
            >
              <Quote className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Línea separadora"
            >
              <Minus className="w-5 h-5" />
            </ToolbarButton>
          </div>

          {/* Color de texto */}
          <div className="flex gap-1 border-r border-amber-300 pr-2 relative">
            <button
              type="button"
              onClick={() => {
                setMostrarColores(!mostrarColores);
                setMostrarResaltado(false);
                setMostrarLink(false);
              }}
              className={`p-2 rounded transition-all shadow-sm flex items-center gap-1 ${
                mostrarColores ? 'bg-amber-800 text-amber-50' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
              }`}
              title="Color de texto"
            >
              <Palette className="w-5 h-5" />
            </button>
            
            {mostrarColores && (
              <div className="absolute top-full left-0 mt-1 bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-xl z-20">
                <p className="text-xs font-semibold mb-2 text-amber-900">Color de texto</p>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {COLORES_TEXTO.map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color.valor).run();
                        setMostrarColores(false);
                      }}
                      className="w-8 h-8 rounded-full border-2 border-amber-300 hover:scale-110 transition-transform shadow-md"
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                    setMostrarColores(false);
                  }}
                  className="w-full text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded"
                >
                  Quitar color
                </button>
              </div>
            )}
          </div>

          {/* Resaltador */}
          <div className="flex gap-1 border-r border-amber-300 pr-2 relative">
            <button
              type="button"
              onClick={() => {
                setMostrarResaltado(!mostrarResaltado);
                setMostrarColores(false);
                setMostrarLink(false);
              }}
              className={`p-2 rounded transition-all shadow-sm flex items-center gap-1 ${
                editor.isActive('highlight') || mostrarResaltado
                  ? 'bg-amber-800 text-amber-50'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
              }`}
              title="Resaltar texto"
            >
              <Highlighter className="w-5 h-5" />
            </button>
            
            {mostrarResaltado && (
              <div className="absolute top-full left-0 mt-1 bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-xl z-20">
                <p className="text-xs font-semibold mb-2 text-amber-900">Resaltar</p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {COLORES_RESALTADO.map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color: color.valor }).run();
                        setMostrarResaltado(false);
                      }}
                      className="w-8 h-8 rounded border-2 border-amber-300 hover:scale-110 transition-transform shadow-md"
                      style={{ backgroundColor: color.valor }}
                      title={color.nombre}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetHighlight().run();
                    setMostrarResaltado(false);
                  }}
                  className="w-full text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded"
                >
                  Quitar resaltado
                </button>
              </div>
            )}
          </div>

          {/* Enlaces */}
          <div className="flex gap-1 border-r border-amber-300 pr-2 relative">
            <ToolbarButton
              onClick={() => {
                if (editor.isActive('link')) {
                  editor.chain().focus().unsetLink().run();
                } else {
                  setMostrarLink(!mostrarLink);
                  setMostrarColores(false);
                  setMostrarResaltado(false);
                }
              }}
              active={editor.isActive('link')}
              title={editor.isActive('link') ? 'Quitar enlace' : 'Insertar enlace'}
            >
              {editor.isActive('link') ? (
                <Unlink className="w-5 h-5" />
              ) : (
                <LinkIcon className="w-5 h-5" />
              )}
            </ToolbarButton>

            {mostrarLink && (
              <div className="absolute top-full left-0 mt-1 bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-xl z-20 w-64">
                <p className="text-xs font-semibold mb-2 text-amber-900">Insertar enlace</p>
                <input
                  type="text"
                  placeholder="https://ejemplo.com"
                  value={urlLink}
                  onChange={(e) => setUrlLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setLink();
                    } else if (e.key === 'Escape') {
                      setMostrarLink(false);
                      setUrlLink('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-amber-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={setLink}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Agregar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarLink(false);
                      setUrlLink('');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Imagen */}
          <div className="flex gap-1 border-r border-amber-300 pr-2">
            <ToolbarButton
              onClick={onImageClick}
              disabled={subiendoImagen}
              title="Insertar imágenes (múltiples)"
            >
              {subiendoImagen ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-800" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </ToolbarButton>
          </div>

          {/* Deshacer/Rehacer */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Deshacer (Ctrl+Z)"
            >
              <Undo className="w-5 h-5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rehacer (Ctrl+Y)"
            >
              <Redo className="w-5 h-5" />
            </ToolbarButton>
          </div>

        </div>
      </div>
    </div>
  );
}