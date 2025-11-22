import React, { useState, KeyboardEvent } from 'react';

interface MultiPersonajeInputProps {
  personajes: string[];
  onChange: (personajes: string[]) => void;
  maxPersonajes?: number;
  placeholder?: string;
}

export function MultiPersonajeInput({
  personajes,
  onChange,
  maxPersonajes = 10,
  placeholder = 'Escribe el nombre del personaje y presiona Enter...',
}: MultiPersonajeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPersonaje();
    }
  };

  const addPersonaje = () => {
    const trimmedValue = inputValue.trim();
    
    if (!trimmedValue) return;
    
    if (personajes.length >= maxPersonajes) {
      alert(`Máximo ${maxPersonajes} personajes permitidos`);
      return;
    }
    
    if (personajes.some(p => p.toLowerCase() === trimmedValue.toLowerCase())) {
      alert('Este personaje ya fue agregado');
      return;
    }
    
    onChange([...personajes, trimmedValue]);
    setInputValue('');
  };

  const removePersonaje = (index: number) => {
    const newPersonajes = personajes.filter((_, i) => i !== index);
    onChange(newPersonajes);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(personajes[index]);
  };

  const saveEdit = (index: number) => {
    const trimmedValue = editValue.trim();
    
    if (!trimmedValue) {
      alert('El nombre del personaje no puede estar vacío');
      return;
    }
    
    const isDuplicate = personajes.some(
      (p, i) => i !== index && p.toLowerCase() === trimmedValue.toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Este personaje ya existe en la lista');
      return;
    }
    
    const newPersonajes = [...personajes];
    newPersonajes[index] = trimmedValue;
    onChange(newPersonajes);
    setEditingIndex(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const isMaxReached = personajes.length >= maxPersonajes;

  return (
    <div className="multi-personaje-container">
      {isMaxReached && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
          <span>⚠️</span>
          <span>Máximo de {maxPersonajes} personajes alcanzado. <strong>Elimina personajes para agregar otros.</strong></span>
        </div>
      )}

      <div className="mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isMaxReached ? 'Elimina personajes para agregar más' : placeholder}
          disabled={isMaxReached}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          💡 Presiona <strong>Enter</strong> para agregar el personaje
        </p>
      </div>

      {personajes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">
            🎭 Personajes agregados ({personajes.length}/{maxPersonajes}):
          </p>
          <div className="flex flex-wrap gap-2">
            {personajes.map((personaje, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 border border-purple-300 rounded-lg px-3 py-2 shadow-sm"
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
                      className="px-2 py-1 border border-purple-400 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(index)}
                      className="text-purple-600 hover:text-purple-800 font-bold"
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
                    <span className="text-sm font-medium text-gray-800">{personaje}</span>
                    <button
                      onClick={() => startEditing(index)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => removePersonaje(index)}
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

      {personajes.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No hay personajes agregados aún
        </p>
      )}
    </div>
  );
}