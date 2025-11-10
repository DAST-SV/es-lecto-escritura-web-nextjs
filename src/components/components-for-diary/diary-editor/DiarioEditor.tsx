'use client';

import { NodeSelection } from 'prosemirror-state';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/src/utils/supabase/utilsClient';
import { PaginaDiario } from '@/src/typings/types-diary/types';
import Toolbar from '@/src/components/components-for-diary/diary-editor/Toolbar';
import StatusGuardado from '@/src/components/components-for-diary/diary-editor/StatusGuardado';
import Image from '@tiptap/extension-image';
import styles from '@/src/style/DiarioEditor.module.css';

interface DiarioEditorProps {
  idEntrada: number;
  paginaInicial: PaginaDiario;
}

export default function DiarioEditor({ idEntrada, paginaInicial }: DiarioEditorProps) {
  const [pagina, setPagina] = useState<PaginaDiario>(paginaInicial);
  const [guardando, setGuardando] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(200);
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right' | 'none'>('none');
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageMenuPosition, setImageMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isInteractingWithMenu, setIsInteractingWithMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingSlider = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
        Image.extend({
          addAttributes() {
            const parent = (this as any).parent?.();
          return {
            ...parent,
            width: {
              default: '200px',
              parseHTML: (element: HTMLElement) =>
                element.getAttribute('width'),
              renderHTML: (attributes: any) => {
                return {
                  width: attributes.width,
                };
              },
            },
            align: {
              default: 'none',
              parseHTML: (element: HTMLElement) =>
                element.getAttribute('data-align') || 'none',
              renderHTML: (attributes: any) => {
                if (attributes.align === 'none') {
                  return {
                    'data-align': 'none',
                    style: 'display: inline; vertical-align: middle;'
                  };
                }
                return {
                  'data-align': attributes.align,
                  style: `display: block; margin-left: ${attributes.align === 'center' ? 'auto' : attributes.align === 'right' ? 'auto' : '0'
                    }; margin-right: ${attributes.align === 'center' ? 'auto' : attributes.align === 'right' ? '0' : 'auto'
                    };`
                };
              },
            },
          };
        },
      }).configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'inline-image',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),

      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer',
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return '¿Qué título le pondrás?';
          }
          return 'Escribe tu historia aquí... Puedes arrastrar o pegar imágenes directamente.';
        },
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:absolute before:text-gray-400 before:pointer-events-none',
      }),
    ],
    content: pagina.contenido || '',
    editorProps: {
      attributes: {
        class: styles['notebook-content'],
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const files = Array.from(event.dataTransfer.files);
          const imageFiles = files.filter(file => file.type.includes('image/'));

          if (imageFiles.length > 0) {
            event.preventDefault();

            setIsDraggingImage(true);

            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              (window as any).__dropPosition = coordinates.pos;
            }

            imageFiles.forEach(file => handleImageUpload(file));

            setTimeout(() => setIsDraggingImage(false), 500);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        const files = [];
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) files.push(file);
          }
        }

        if (files.length > 0) {
          event.preventDefault();
          files.forEach(file => handleImageUpload(file));
          return true;
        }
        return false;
      },
      handleClick: (view, pos, event) => {
        if (isDraggingImage) return false; // ❌ si se está arrastrando, no mostrar menú

        const node = view.state.doc.nodeAt(pos);
        if (node?.type.name === 'image') {
          const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
          view.dispatch(tr);

          const domNode = view.nodeDOM(pos) as HTMLElement;
          if (domNode) {
            const rect = domNode.getBoundingClientRect();
            setSelectedImage(node.attrs.src);
            setImageWidth(parseInt(node.attrs.width || '200'));
            setImageAlign(node.attrs.align || 'none');
            setImageMenuPosition({
              top: rect.bottom + window.scrollY + 10,
              left: rect.left + window.scrollX + rect.width / 2,
            });
          }

          return true;
        }

        return false;
      }

    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      guardarContenido();
    }, 30000);

    return () => clearInterval(interval);
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
    if (isInteractingWithMenu || isDraggingSlider.current || !isDraggingImage) return;

      const { selection } = editor.state;
      const node = (selection as any).node;

      if (node?.type.name === 'image') {
        setSelectedImage(node.attrs.src);
        const widthValue = parseInt(node.attrs.width || '200');
        setImageWidth(widthValue);
        setImageAlign(node.attrs.align || 'none');

        const domNode = editor.view.nodeDOM(selection.from);
        if (domNode instanceof HTMLElement) {
          const rect = domNode.getBoundingClientRect();
          setImageMenuPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + window.scrollX + (rect.width / 2)
          });
        }
      } else {
        setSelectedImage(null);
        setImageMenuPosition(null);
      }
    };

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, isInteractingWithMenu]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editor?.getHTML() !== pagina.contenido) {
        guardarContenido();
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
        setImageMenuPosition(null);
        setIsDraggingMenu(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && !isDraggingMenu && !isDraggingSlider.current) {
        setSelectedImage(null);
        setImageMenuPosition(null);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingMenu && imageMenuPosition) {
        e.preventDefault();
        requestAnimationFrame(() => {
          setImageMenuPosition({
            top: e.clientY + dragOffsetRef.current.y,
            left: e.clientX + dragOffsetRef.current.x
          });
        });
      }
    };

    const handleMouseUp = () => {
      if (isDraggingMenu) {
        setIsDraggingMenu(false);
        setIsInteractingWithMenu(false);
      }
      if (isDraggingSlider.current) {
        isDraggingSlider.current = false;
        setIsInteractingWithMenu(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [editor, pagina.contenido, selectedImage, isDraggingMenu, imageMenuPosition]);

  const guardarContenido = useCallback(async () => {
    if (!editor) return;

    setGuardando(true);

    try {
      const contenidoHTML = editor.getHTML();

      console.log('💾 Guardando contenido...');

      const { error } = await supabase
        .from('paginas_de_diario')
        .update({ contenido: contenidoHTML })
        .eq('id_pagina', pagina.id_pagina);

      if (error) throw error;

      setPagina(prev => ({ ...prev, contenido: contenidoHTML }));
      setUltimoGuardado(new Date());

      console.log('✅ Contenido guardado exitosamente');

    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar el contenido. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  }, [editor, pagina.id_pagina]);

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    console.log('📸 Procesando imagen:', file.name);

    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ La imagen es muy grande. Máximo 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('⚠️ Solo se permiten archivos de imagen.');
      return;
    }

    setSubiendoImagen(true);

    try {
      const base64 = await convertirImagenABase64(file);

      console.log('✅ Imagen convertida a Base64');

      const dropPosition = (window as any).__dropPosition;

      if (dropPosition !== undefined) {
        editor.chain()
          .insertContentAt(dropPosition, {
            type: 'image',
            attrs: { src: base64, width: '200px', align: 'none' }
          })
          .run();

        delete (window as any).__dropPosition;
      } else {
        editor.chain().focus().setImage({ src: base64, width: 200 }).run();
      }

      console.log('✅ Imagen insertada inline en el editor');

      setTimeout(() => guardarContenido(), 500);

    } catch (error: any) {
      console.error('❌ Error al procesar imagen:', error);
      alert('❌ Error al procesar la imagen. Intenta de nuevo.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  const convertirImagenABase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error al leer la imagen'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer la imagen'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleImageWidthChange = useCallback((value: number) => {
    setImageWidth(value);
    if (editor && !editor.isDestroyed) {
      const { from } = editor.state.selection;

      // Actualizar atributos sin perder la selección
      editor.chain()
        .updateAttributes('image', { width: `${value}px` })
        .setNodeSelection(from)
        .run();
    }
  }, [editor]);

  const handleImageAlignChange = (align: 'left' | 'center' | 'right' | 'none') => {
    setImageAlign(align);
    if (editor && !editor.isDestroyed) {
      const { from } = editor.state.selection;

      // Actualizar atributos sin perder la selección
      editor.chain()
        .updateAttributes('image', { align })
        .setNodeSelection(from)
        .run();
    }
  };

  const handleMenuDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (imageMenuPosition && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: rect.left - e.clientX,
        y: rect.top - e.clientY
      };
      setIsDraggingMenu(true);
      setIsInteractingWithMenu(true);
    }
  };

  const handleToolbarImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      files.forEach(file => handleImageUpload(file));
    };
    input.click();
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-800 mx-auto mb-4"></div>
          <p className="text-amber-900">Preparando tu cuaderno...</p>
        </div>
      </div>
    );
  }

  const characterCount = editor.storage.characterCount;

  return (
    <div className="flex flex-col h-screen  from-amber-50 via-orange-50 to-amber-100">
      {/* Header */}
      <div className="from-amber-800 to-amber-900 text-amber-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-amber-50 hover:text-amber-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <div className="flex items-center gap-4">
            <div className="text-sm flex flex-col items-end">
              <StatusGuardado
                guardando={guardando}
                ultimoGuardado={ultimoGuardado}
                subiendoImagen={subiendoImagen}
              />
              <span className="text-amber-300 text-xs mt-1">
                {characterCount.characters()} caracteres • {characterCount.words()} palabras
              </span>
            </div>

            <button
              onClick={guardarContenido}
              disabled={guardando}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
            >
              💾 Guardar ahora
            </button>
          </div>
        </div>
      </div>

      <Toolbar
        editor={editor}
        onImageClick={handleToolbarImageClick}
        subiendoImagen={subiendoImagen}
      />

      {/* Menú flotante para controles de imagen */}
      {imageMenuPosition && !isDraggingImage && (
        <div
          ref={menuRef}
          className={`fixed z-50 from-amber-800 to-orange-700 text-white rounded-2xl shadow-2xl p-5 ${isDraggingMenu ? 'cursor-grabbing' : ''
            }`}
          style={{
            top: `${imageMenuPosition.top}px`,
            left: `${imageMenuPosition.left}px`,
            transform: 'translateX(-50%)',
            minWidth: '380px',
            maxWidth: '90vw',
            userSelect: 'none',
            transition: isDraggingMenu ? 'none' : 'top 0.1s ease-out, left 0.1s ease-out'
          }}
        >
          {/* Header del menú - ARRASTRABLE */}
          <div
            className="flex items-center justify-between mb-4 pb-3 border-b border-white/20 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMenuDragStart}
          >
            <span className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              Editar imagen
            </span>

            <button
              onClick={() => {
                setSelectedImage(null);
                setImageMenuPosition(null);
                setIsDraggingMenu(false);
              }}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
              title="Cerrar (o clic fuera)"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Control de tamaño */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Tamaño: <span className="font-mono text-amber-200">{imageWidth}px</span>
            </label>

            <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageWidthChange(Math.max(50, imageWidth - 50))}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                title="Reducir"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              <input
                type="range"
                min="50"
                max="600"
                value={imageWidth}
                onInput={(e) => {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  handleImageWidthChange(value);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isDraggingSlider.current = true;
                  setIsInteractingWithMenu(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  isDraggingSlider.current = true;
                  setIsInteractingWithMenu(true);
                }}
                className={`flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer ${styles['slider-thumb']}`}
              />

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageWidthChange(Math.min(600, imageWidth + 50))}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                title="Aumentar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {/* Presets rápidos */}
            <div className="flex gap-2 mt-2">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageWidthChange(150)}
                className={`flex-1 py-1 px-2 text-xs rounded-lg transition-all ${imageWidth === 150 ? 'bg-white text-amber-800 font-bold' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                Pequeño
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageWidthChange(300)}
                className={`flex-1 py-1 px-2 text-xs rounded-lg transition-all ${imageWidth === 300 ? 'bg-white text-amber-800 font-bold' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                Mediano
              </button>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageWidthChange(500)}
                className={`flex-1 py-1 px-2 text-xs rounded-lg transition-all ${imageWidth === 500 ? 'bg-white text-amber-800 font-bold' : 'bg-white/20 hover:bg-white/30'
                  }`}
              >
                Grande
              </button>
            </div>
          </div>

          {/* Control de alineación */}
          <div>
            <label className="text-sm font-semibold mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Alineación
            </label>

            <div className="grid grid-cols-4 gap-2">
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageAlignChange('none')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${imageAlign === 'none'
                  ? 'bg-white text-amber-800 font-bold shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30'
                  }`}
                title="Sin alineación (inline con texto)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M18 18L6 6" />
                </svg>
                <span className="text-[10px]">Ninguna</span>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageAlignChange('left')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${imageAlign === 'left'
                  ? 'bg-white text-amber-800 font-bold shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30'
                  }`}
                title="Izquierda"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
                <span className="text-[10px]">Izquierda</span>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageAlignChange('center')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${imageAlign === 'center'
                  ? 'bg-white text-amber-800 font-bold shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30'
                  }`}
                title="Centro"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                </svg>
                <span className="text-[10px]">Centro</span>
              </button>

              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => handleImageAlignChange('right')}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${imageAlign === 'right'
                  ? 'bg-white text-amber-800 font-bold shadow-lg scale-105'
                  : 'bg-white/20 hover:bg-white/30'
                  }`}
                title="Derecha"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                </svg>
                <span className="text-[10px]">Derecha</span>
              </button>
            </div>
          </div>

          {/* Indicador de ayuda */}
          <div className="mt-4 pt-3 border-t border-white/20">
            <p className="text-xs text-white/70 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Arrastra desde el título • Clic fuera o ESC para cerrar
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto my-8">
          <div className={`${styles['notebook-wrapper']} rounded-r-lg`}>
            {/* Anillos de espiral */}
            <div className={styles['spiral-binding']}>
              {[...Array(20)].map((_, i) => (
                <div key={i} className={styles['spiral-ring']} />
              ))}
            </div>

            {/* Textura de papel */}
            <div className={styles['paper-texture']} />

            {/* Contenido con líneas */}
            <div className={styles['notebook-lines'] + ' relative'}>
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de subida de imagen */}
      {subiendoImagen && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-amber-800 text-amber-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse z-50">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-50" />
          <span className="font-medium">Procesando imagen...</span>
        </div>
      )}

      {/* Tip flotante */}
      {editor.isEmpty && (
        <div className="fixed bottom-8 right-8 bg-amber-800 text-amber-50 px-6 py-4 rounded-xl shadow-2xl max-w-sm z-40">
          <p className="font-bold mb-2 flex items-center gap-2 text-lg">
            <span className="text-2xl">✍️</span>
            <span>Tips de uso:</span>
          </p>
          <ul className="text-sm space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-200">•</span>
              <span>🎯 Arrastra o pega imágenes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-200">•</span>
              <span>🖼️ Click en imagen → ajusta y arrastra el menú</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-200">•</span>
              <span>↔️ Arrastra el slider para cambios en tiempo real</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-200">•</span>
              <span>Selecciona texto para aplicar formatos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-200">•</span>
              <span>Guarda automáticamente cada 30 segundos</span>
            </li>
          </ul>
        </div>
      )}
   </div>
  ) ;
}