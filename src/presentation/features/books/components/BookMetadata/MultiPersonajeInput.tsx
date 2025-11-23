// src/presentation/features/books/components/BookMetadata/MultiPersonajeInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, Users } from 'lucide-react';

interface MultiPersonajeInputProps {
  personajes: string[];
  onChange: (personajes: string[]) => void;
  maxPersonajes?: number;
}

export function MultiPersonajeInput({
  personajes,
  onChange,
  maxPersonajes = 10,
}: MultiPersonajeInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPersonaje();
    }
  };

  const addPersonaje = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || personajes.length >= maxPersonajes) return;
    if (personajes.some(p => p.toLowerCase() === trimmed.toLowerCase())) return;
    
    onChange([...personajes, trimmed]);
    setInputValue('');
  };

  const removePersonaje = (index: number) => {
    onChange(personajes.filter((_, i) => i !== index));
  };

  const isMaxReached = personajes.length >= maxPersonajes;

  return (
    <div className="space-y-2">
      {/* Input Container */}
      <div 
        className={`
          relative rounded-lg border-2 transition-all duration-200
          ${isFocused 
            ? 'border-purple-500 ring-4 ring-purple-100' 
            : 'border-gray-200 hover:border-gray-300'
          }
          ${isMaxReached ? 'bg-gray-50' : 'bg-white'}
        `}
      >
        <div className="flex items-center px-3 py-2">
          <Users size={18} className="text-gray-400 mr-2 flex-shrink-0" />
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isMaxReached}
            placeholder={isMaxReached ? `Máximo ${maxPersonajes} personajes` : 'Añadir personaje...'}
            className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent disabled:cursor-not-allowed"
          />

          {inputValue && !isMaxReached && (
            <button
              onClick={addPersonaje}
              className="ml-2 p-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex-shrink-0"
              title="Añadir personaje"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Progress indicator */}
        {personajes.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
            <div 
              className={`h-full transition-all duration-300 ${
                isMaxReached ? 'bg-red-500' : 'bg-purple-500'
              }`}
              style={{ width: `${(personajes.length / maxPersonajes) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Tags Container */}
      {personajes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {personajes.map((personaje, index) => (
            <div
              key={index}
              className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-sm transition-all"
            >
              <span className="text-sm font-medium text-purple-900">{personaje}</span>
              <button
                onClick={() => removePersonaje(index)}
                className="p-0.5 text-purple-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Eliminar"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Counter & Help */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          💡 Presiona <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Enter</kbd> para añadir
        </span>
        <span className={`font-medium ${isMaxReached ? 'text-red-600' : 'text-gray-600'}`}>
          {personajes.length}/{maxPersonajes}
        </span>
      </div>
    </div>
  );
}