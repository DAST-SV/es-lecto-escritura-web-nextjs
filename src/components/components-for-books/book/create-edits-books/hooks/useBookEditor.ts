import { useState, useCallback, useEffect } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookEditorProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
}

export interface UseBookEditorReturn {
  // Estados de edición
  editingField: 'title' | 'text' | null;
  editingTitle: string;
  editingText: string;
  
  // Métodos de control de edición
  setEditingField: (field: 'title' | 'text' | null) => void;
  setEditingTitle: (title: string) => void;
  setEditingText: (text: string) => void;
  
  // Métodos principales
  startEdit: (field: 'title' | 'text') => void;
  saveField: (field: 'title' | 'text') => void;
  cancelEdit: (field: 'title' | 'text') => void;
  
  // Getters para datos actuales
  getCurrentTitle: () => string;
  getCurrentText: () => string;
}

export const useBookEditor = ({ 
  pages, 
  currentPage, 
  setPages 
}: UseBookEditorProps): UseBookEditorReturn => {
  
  // Estados para campos en edición
  const [editingField, setEditingField] = useState<'title' | 'text' | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingText, setEditingText] = useState("");

  // Sincronizar campos de edición con la página actual
  useEffect(() => {
    if (currentPage >= 0 && currentPage < pages.length) {
      setEditingTitle(pages[currentPage].title || "");
      setEditingText(pages[currentPage].text || "");
    }
  }, [currentPage, pages]);

  // Obtener título actual
  const getCurrentTitle = useCallback(() => {
    return pages[currentPage]?.title || "";
  }, [pages, currentPage]);

  // Obtener texto actual
  const getCurrentText = useCallback(() => {
    return pages[currentPage]?.text || "";
  }, [pages, currentPage]);

  // Iniciar edición de un campo
  const startEdit = useCallback((field: 'title' | 'text') => {
    setEditingField(field);
    if (field === 'title') {
      setEditingTitle(getCurrentTitle());
    } else if (field === 'text') {
      setEditingText(getCurrentText());
    }
  }, [getCurrentTitle, getCurrentText]);

  // Guardar cambios de un campo
  const saveField = useCallback((field: 'title' | 'text') => {
    setPages(prev => {
      const updated = [...prev];
      const currentPageData = updated[currentPage];
      
      if (field === 'title') {
        updated[currentPage] = { 
          ...currentPageData, 
          title: editingTitle 
        };
      } else if (field === 'text') {
        updated[currentPage] = { 
          ...currentPageData, 
          text: editingText 
        };
      }
      
      return updated;
    });
    setEditingField(null);
  }, [currentPage, editingTitle, editingText, setPages]);

  
  // Cancelar edición y restaurar valor original
  const cancelEdit = useCallback((field: 'title' | 'text') => {
    if (field === 'title') {
      setEditingTitle(getCurrentTitle());
    } else if (field === 'text') {
      setEditingText(getCurrentText());
    }
    setEditingField(null);
  }, [getCurrentTitle, getCurrentText]);

  return {
    // Estados
    editingField,
    editingTitle,
    editingText,
    
    // Setters
    setEditingField,
    setEditingTitle,
    setEditingText,
    
    // Métodos principales
    startEdit,
    saveField,
    cancelEdit,
    
    // Getters
    getCurrentTitle,
    getCurrentText
  };
};