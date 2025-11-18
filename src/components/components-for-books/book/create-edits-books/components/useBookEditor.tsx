import { useState, useCallback } from 'react';
import type { page } from '@/src/typings/types-page-book/index';

interface UseBookEditorProps {
  pages: page[];
  currentPage: number;
  setPages: React.Dispatch<React.SetStateAction<page[]>>;
}

export interface UseBookEditorReturn {
  // Estados de edición (mantener compatibilidad)
  editingField: 'title' | 'text' | null;
  editingTitle: string;
  editingText: string;
  
  // Setters
  setEditingField: (field: 'title' | 'text' | null) => void;
  setEditingTitle: (value: string) => void;
  setEditingText: (value: string) => void;
  
  // Métodos de edición (antiguo sistema - mantener por compatibilidad)
  startEdit: (field: 'title' | 'text') => void;
  saveField: (field: 'title' | 'text') => void;
  cancelEdit: (field: 'title' | 'text') => void;
  
  // Métodos NUEVOS para cambios directos
  updateTitle: (html: string) => void;
  updateText: (html: string) => void;
  
  // Getters
  getCurrentTitle: () => string;
  getCurrentText: () => string;
}

export function useBookEditor({ pages, currentPage, setPages }: UseBookEditorProps): UseBookEditorReturn {
  const [editingField, setEditingField] = useState<'title' | 'text' | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingText, setEditingText] = useState('');

  // Getters
  const getCurrentTitle = useCallback(() => {
    return pages[currentPage]?.title || '';
  }, [pages, currentPage]);

  const getCurrentText = useCallback(() => {
    return pages[currentPage]?.text || '';
  }, [pages, currentPage]);

  // ✨ NUEVOS: Métodos para actualización directa (sin modo edición)
  const updateTitle = useCallback((html: string) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPage] = { ...newPages[currentPage], title: html };
      return newPages;
    });
  }, [currentPage, setPages]);

  const updateText = useCallback((html: string) => {
    setPages(prev => {
      const newPages = [...prev];
      newPages[currentPage] = { ...newPages[currentPage], text: html };
      return newPages;
    });
  }, [currentPage, setPages]);

  // Métodos antiguos (mantener para compatibilidad con otros componentes)
  const startEdit = useCallback((field: 'title' | 'text') => {
    setEditingField(field);
    if (field === 'title') {
      setEditingTitle(getCurrentTitle());
    } else {
      setEditingText(getCurrentText());
    }
  }, [getCurrentTitle, getCurrentText]);

  const saveField = useCallback((field: 'title' | 'text') => {
    setPages(prev => {
      const newPages = [...prev];
      if (field === 'title') {
        newPages[currentPage] = { ...newPages[currentPage], title: editingTitle };
      } else {
        newPages[currentPage] = { ...newPages[currentPage], text: editingText };
      }
      return newPages;
    });
    setEditingField(null);
  }, [currentPage, editingTitle, editingText, setPages]);

  const cancelEdit = useCallback((field: 'title' | 'text') => {
    setEditingField(null);
    if (field === 'title') {
      setEditingTitle('');
    } else {
      setEditingText('');
    }
  }, []);

  return {
    // Estados
    editingField,
    editingTitle,
    editingText,
    
    // Setters
    setEditingField,
    setEditingTitle,
    setEditingText,
    
    // Métodos antiguos
    startEdit,
    saveField,
    cancelEdit,
    
    // Métodos NUEVOS para cambios directos
    updateTitle,
    updateText,
    
    // Getters
    getCurrentTitle,
    getCurrentText,
  };
}