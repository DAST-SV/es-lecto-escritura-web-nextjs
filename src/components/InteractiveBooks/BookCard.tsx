// BookCard.tsx
import React from 'react';
import { Clock, BookOpen, Lock } from 'lucide-react';
import { Book } from './types';
import { levelConfig, difficultyColors } from './constants';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onRead }) => {
  const level = levelConfig.find(l => l.id === book.level);
  
  return (
    <article className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:scale-105 border border-gray-200">
      
      {/* Cover */}
      <div className="relative h-48 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
          <span 
            className="text-6xl transform group-hover:scale-110 transition-transform duration-300"
            role="img"
            aria-label={book.title}
          >
            {book.coverImage}
          </span>
        </div>
        
        {/* Premium Badge */}
        {book.isPremium && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 p-2 rounded-full shadow-lg">
            <Lock className="w-4 h-4" />
          </div>
        )}
        
        {/* Level Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${difficultyColors[book.difficulty]}`}>
          {level?.name}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onRead(book)}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-gray-800 rounded-full p-4 shadow-xl hover:shadow-2xl transform scale-75 group-hover:scale-100"
            aria-label={`Leer ${book.title}`}
          >
            <BookOpen className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl" role="img" aria-label={book.title}>
            {book.coverImage}
          </span>
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
          {book.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full font-semibold">
            <Clock className="w-3 h-3" />
            <span>{book.duration}</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {book.ageRange}
          </div>
        </div>

        {/* Features */}
        {level && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">
              {level.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {level.features.slice(0, 2).map((feature, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Read Button */}
        <button
          onClick={() => onRead(book)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          aria-label={`Leer ${book.title}`}
        >
          <BookOpen className="w-4 h-4" />
          Leer Cuento
        </button>
      </div>
    </article>
  );
};

export default BookCard;