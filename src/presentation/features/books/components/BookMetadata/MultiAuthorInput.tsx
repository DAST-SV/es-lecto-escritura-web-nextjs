// src/presentation/features/books/components/BookMetadata/MultiAuthorInput.tsx
import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, User } from 'lucide-react';

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
  placeholder = 'Añadir autor...',
}: MultiAuthorInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAuthor();
    }
  };

  const addAuthor = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || authors.length >= maxAuthors) return;
    if (authors.some(a => a.toLowerCase() === trimmed.toLowerCase())) return;
    
    onChange([...authors, trimmed]);
    setInputValue('');
  };

  const removeAuthor = (index: number) => {
    onChange(authors.filter((_, i) => i !== index));
  };

  const isMaxReached = authors.length >= maxAuthors;

  return (
    <div className="space-y-2">
      {/* Input Container */}
      <div 
        className={`
          relative rounded-lg border-2 transition-all duration-200
          ${isFocused 
            ? 'border-indigo-500 ring-4 ring-indigo-100' 
            : 'border-gray-200 hover:border-gray-300'
          }
          ${isMaxReached ? 'bg-gray-50' : 'bg-white'}
        `}
      >
        <div className="flex items-center px-3 py-2">
          <User size={18} className="text-gray-400 mr-2 flex-shrink-0" />
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isMaxReached}
            placeholder={isMaxReached ? `Máximo ${maxAuthors} autores` : placeholder}
            className="flex-1 outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent disabled:cursor-not-allowed"
          />

          {inputValue && !isMaxReached && (
            <button
              onClick={addAuthor}
              className="ml-2 p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex-shrink-0"
              title="Añadir autor"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Progress indicator */}
        {authors.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
            <div 
              className={`h-full transition-all duration-300 ${
                isMaxReached ? 'bg-red-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${(authors.length / maxAuthors) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Tags Container */}
      {authors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {authors.map((author, index) => (
            <div
              key={index}
              className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg hover:shadow-sm transition-all"
            >
              <span className="text-sm font-medium text-indigo-900">{author}</span>
              <button
                onClick={() => removeAuthor(index)}
                className="p-0.5 text-indigo-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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
          {authors.length}/{maxAuthors}
        </span>
      </div>
    </div>
  );
}