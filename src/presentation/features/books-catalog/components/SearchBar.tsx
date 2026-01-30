// src/presentation/features/books-catalog/components/SearchBar.tsx
'use client';

import { useState, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useBookSearch } from '../hooks/useBookSearch';
import { BookCard } from './BookCard';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Buscar libros...' }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const { results, isSearching, search, clearSearch, query } = useBookSearch();

  const handleSearch = useCallback((value: string) => {
    setInputValue(value);
    if (value.trim().length >= 2) {
      search(value);
    } else if (value.trim().length === 0) {
      clearSearch();
    }
  }, [search, clearSearch]);

  const handleClear = () => {
    setInputValue('');
    clearSearch();
  };

  return (
    <div className="relative">
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {isSearching ? (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        ) : inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {query && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[70vh] overflow-y-auto z-50">
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">
              {results.length} resultado{results.length !== 1 ? 's' : ''} para &quot;{query}&quot;
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {results.slice(0, 6).map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  categorySlug={book.categorySlug}
                />
              ))}
            </div>
            {results.length > 6 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                Y {results.length - 6} resultados más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {query && results.length === 0 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-8 text-center z-50">
          <p className="text-gray-500">
            No se encontraron libros para &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
