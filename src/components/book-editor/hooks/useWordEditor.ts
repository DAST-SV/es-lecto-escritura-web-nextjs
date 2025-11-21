'use client';

import { useCallback, useState, useEffect } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';

// Importar extensiones personalizadas
import { FontSize, LineHeight, FontFamily } from '../extensions/tiptap-extensions-complete';

interface Page {
  id: string;
  content: string;
  image?: string | null;
  background?: string | null;
}

interface UseWordEditorProps {
  initialPages?: Page[];
  maxCharsPerPage?: number;
  onPagesChange?: (pages: Page[]) => void;
}

interface UseWordEditorReturn {
  editor: any;
  pages: Page[];
  currentPage: number;
  totalPages: number;
  
  // Navegación
  goToPage: (pageIndex: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  
  // Gestión de páginas
  addPage: () => void;
  deletePage: (pageIndex: number) => void;
  
  // Imágenes y fondos
  addImage: (pageIndex: number, imageUrl: string) => void;
  removeImage: (pageIndex: number) => void;
  setBackground: (pageIndex: number, background: string) => void;
  
  // Exportar
  exportToFlipBook: () => any[];
}

export const useWordEditor = ({
  initialPages = [],
  onPagesChange
}: UseWordEditorProps): UseWordEditorReturn => {
  
  // Estado de páginas - SIN auto-paginación
  const [pages, setPages] = useState<Page[]>(() => {
    if (initialPages.length > 0) {
      return initialPages.map(page => ({
        id: page.id || `page-${Date.now()}-${Math.random()}`,
        content: page.content || '<p></p>',
        image: page.image || null,
        background: page.background || null
      }));
    }
    
    return [{
      id: `page-${Date.now()}`,
      content: '<p></p>',
      image: null,
      background: null
    }];
  });
  
  const [currentPage, setCurrentPage] = useState(0);
  
  // Editor TipTap
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      FontSize,
      LineHeight.configure({
        types: ['paragraph', 'heading'],
        defaultLineHeight: '1.5',
      }),
    ],
    content: pages[currentPage]?.content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'word-editor-content prose prose-sm sm:prose lg:prose-lg focus:outline-none',
        style: 'min-height: 100%; padding: 1rem;'
      },
    },
    onUpdate: ({ editor }) => {
      // Actualizar SOLO el contenido de la página actual
      setPages(prev => {
        const updated = [...prev];
        if (updated[currentPage]) {
          updated[currentPage] = {
            ...updated[currentPage],
            content: editor.getHTML()
          };
        }
        return updated;
      });
    },
  });
  
  // Sincronizar contenido cuando cambia la página actual
  useEffect(() => {
    if (editor && pages[currentPage]) {
      const currentContent = pages[currentPage].content;
      const editorContent = editor.getHTML();
      
      // ✅ Solo actualizar si el contenido es diferente - SIN segundo parámetro
      if (editorContent !== currentContent) {
        editor.commands.setContent(currentContent);
      }
    }
  }, [currentPage, editor, pages]);
  
  // Notificar cambios externos
  useEffect(() => {
    if (onPagesChange) {
      onPagesChange(pages);
    }
  }, [pages, onPagesChange]);
  
  /**
   * Navegación entre páginas
   */
  const goToPage = useCallback((pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  }, [pages.length]);
  
  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, pages.length]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  /**
   * Gestión de páginas
   */
  const addPage = useCallback(() => {
    const newPage: Page = {
      id: `page-${Date.now()}-${Math.random()}`,
      content: '<p></p>',
      image: null,
      background: null
    };
    
    setPages(prev => [...prev, newPage]);
    
    // Ir automáticamente a la nueva página
    setTimeout(() => {
      setCurrentPage(pages.length);
    }, 0);
  }, [pages.length]);
  
  const deletePage = useCallback((pageIndex: number) => {
    // NO permitir eliminar si solo hay 1 página
    if (pages.length <= 1) {
      return;
    }
    
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setPages(prev => prev.filter((_, i) => i !== pageIndex));
      
      // Ajustar página actual si es necesario
      if (currentPage >= pageIndex && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else if (currentPage >= pages.length - 1) {
        setCurrentPage(pages.length - 2);
      }
    }
  }, [pages.length, currentPage]);
  
  /**
   * Gestión de imágenes - FIXED
   */
  const addImage = useCallback((pageIndex: number, imageUrl: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          image: imageUrl 
        };
      }
      return updated;
    });
  }, []);
  
  const removeImage = useCallback((pageIndex: number) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          image: null 
        };
      }
      return updated;
    });
  }, []);
  
  /**
   * Gestión de fondos
   */
  const setBackground = useCallback((pageIndex: number, background: string) => {
    setPages(prev => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = { 
          ...updated[pageIndex], 
          background: background || null 
        };
      }
      return updated;
    });
  }, []);
  
  /**
   * Exportar al formato FlipBook - FIXED
   */
  const exportToFlipBook = useCallback(() => {
    return pages.map((page) => ({
      layout: 'TextCenterLayout',
      title: '',
      text: page.content || '',
      image: page.image || null,
      background: page.background || null,
      id: page.id
    }));
  }, [pages]);
  
  return {
    editor,
    pages,
    currentPage,
    totalPages: pages.length,
    goToPage,
    nextPage,
    prevPage,
    addPage,
    deletePage,
    addImage,
    removeImage,
    setBackground,
    exportToFlipBook
  };
};