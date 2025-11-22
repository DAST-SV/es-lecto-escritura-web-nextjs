/**
 * UBICACIÓN: src/presentation/features/editor/hooks/useEditor.ts
 * 
 * Hook personalizado para manejar el estado del editor
 */

import { useState, useCallback } from 'react';

export interface EditorState {
  title: string;
  content: string;
  characterCount: {
    title: number;
    content: number;
  };
  isDirty: boolean;
}

export interface UseEditorOptions {
  initialTitle?: string;
  initialContent?: string;
  titleLimit?: number;
  contentLimit?: number;
  onSave?: (state: EditorState) => void | Promise<void>;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useEditor(options: UseEditorOptions = {}) {
  const {
    initialTitle = '',
    initialContent = '',
    titleLimit = 150,
    contentLimit = 650,
    onSave,
    autoSave = false,
    autoSaveDelay = 3000,
  } = options;

  const [state, setState] = useState<EditorState>({
    title: initialTitle,
    content: initialContent,
    characterCount: {
      title: initialTitle.length,
      content: initialContent.length,
    },
    isDirty: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Actualizar título
  const setTitle = useCallback((title: string) => {
    setState((prev) => ({
      ...prev,
      title,
      characterCount: {
        ...prev.characterCount,
        title: title.length,
      },
      isDirty: true,
    }));
  }, []);

  // Actualizar contenido
  const setContent = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      content,
      characterCount: {
        ...prev.characterCount,
        content: content.length,
      },
      isDirty: true,
    }));
  }, []);

  // Guardar
  const save = useCallback(async () => {
    if (!onSave || !state.isDirty) return;

    setIsSaving(true);
    try {
      await onSave(state);
      setState((prev) => ({ ...prev, isDirty: false }));
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error al guardar:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [state, onSave]);

  // Reset
  const reset = useCallback(() => {
    setState({
      title: initialTitle,
      content: initialContent,
      characterCount: {
        title: initialTitle.length,
        content: initialContent.length,
      },
      isDirty: false,
    });
  }, [initialTitle, initialContent]);

  // Validaciones
  const isValidTitle = state.characterCount.title > 0 && state.characterCount.title <= titleLimit;
  const isValidContent = state.characterCount.content <= contentLimit;
  const isValid = isValidTitle && isValidContent;

  // Warnings
  const titleWarning = state.characterCount.title > titleLimit * 0.8;
  const contentWarning = state.characterCount.content > contentLimit * 0.8;

  return {
    // Estado
    title: state.title,
    content: state.content,
    characterCount: state.characterCount,
    isDirty: state.isDirty,
    
    // Acciones
    setTitle,
    setContent,
    save,
    reset,
    
    // Estado de guardado
    isSaving,
    lastSaved,
    
    // Validaciones
    isValid,
    isValidTitle,
    isValidContent,
    
    // Warnings
    titleWarning,
    contentWarning,
    
    // Límites
    titleLimit,
    contentLimit,
  };
}