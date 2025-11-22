import React, { useState, KeyboardEvent } from 'react';

interface MultiAuthorInputProps {
  authors: string[];
  onChange: (authors: string[]) => void;
  maxAuthors?: number;
  placeholder?: string;
}

export function MultiAuthorInput({
  authors,
  onChange,
  maxAuthors = 5,
  placeholder = 'Escribe el nombre del autor y presiona Enter...',
}: MultiAuthorInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  const addAuthor = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) return;
    
    if (authors.length >= maxAuthors) {
      alert(`Máximo ${maxAuthors} autores permitidos`);
      return;
    }
    
    if (authors.some(a => a.toLowerCase() === trimmedValue.toLowerCase())) {
      alert('Este autor ya fue agregado');
      return;
    }
    
    onChange([...authors, trimmedValue]);
    setInputValue('');
  };

  const removeAuthor = (index: number) => {
    const newAuthors = authors.filter((_, i) => i !== index);
    onChange(newAuthors);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(authors[index]);
  };

  const saveEdit = (index: number) => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      alert('El nombre del autor no puede estar vacío');
      return;
    }
    
    const isDuplicate = authors.some(
      (a, i) => i !== index && a.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Este autor ya existe en la lista');
      return;
    }
    
    const newAuthors = [...authors];
    newAuthors[index] = trimmedValue;
    onChange(newAuthors);
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const isMaxReached = authors.length >= maxAuthors;

  return (
    <div className="multi-author-container">
      {isMaxReached && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>Máximo de {maxAuthors} autores alcanzado. <strong>Elimina autores para agregar otros.</strong></span>
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMaxReached ? 'Elimina autores para agregar más' : placeholder}
          disabled={isMaxReached}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          💡 Presiona <strong>Enter</strong> para agregar el autor
        </p>
      </div>

      {authors.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            👥 Autores agregados ({authors.length}/{maxAuthors}):
          </p>
          <div className="flex flex-wrap gap-2">
            {authors.map((author, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 border border-green-300 rounded-lg px-3 py-2 shadow-sm"
              >
                {editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(index);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="px-2 py-1 border border-green-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(index)}
                      className="text-green-600 hover:text-green-800 font-bold"
                      title="Guardar"
                    >
                      ✓
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700 font-bold"
                      title="Cancelar"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-800">{author}</span>
                    <button
                      onClick={() => startEditing(index)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removeAuthor(index)}
                      className="text-red-600 hover:text-red-800 font-bold"
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {authors.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay autores agregados aún
        </p>
      )}
    </div>
  );
}