// SearchBar.tsx
import React from 'react';
import { BookOpen } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="relative">
        <input
          id="search-input"
          type="text"
          placeholder="Buscar cuentos... (Ctrl + /)"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-full focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
          aria-label="Buscar cuentos"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;