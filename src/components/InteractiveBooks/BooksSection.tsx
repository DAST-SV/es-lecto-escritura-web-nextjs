// BooksSection.tsx
import React from 'react';
import { Star, Lock } from 'lucide-react';
import { Book } from './types';
import BookCard from './BookCard';

interface BooksSectionProps {
  freeBooks: Book[];
  premiumBooks: Book[];
  searchTerm: string;
  onReadBook: (book: Book) => void;
}

const BooksSection: React.FC<BooksSectionProps> = ({ 
  freeBooks, 
  premiumBooks, 
  searchTerm, 
  onReadBook 
}) => {
  const totalBooks = freeBooks.length + premiumBooks.length;

  return (
    <section className="py-12 px-6 md:px-16" aria-labelledby="books-section">
      <div className="max-w-6xl mx-auto">
        
        {searchTerm && (
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-600">
              {totalBooks > 0 
                ? `Encontramos ${totalBooks} cuento${totalBooks === 1 ? '' : 's'} para "${searchTerm}"`
                : `No encontramos cuentos para "${searchTerm}"`
              }
            </p>
          </div>
        )}

        {/* Free Books */}
        {freeBooks.length > 0 && (
          <div className="mb-16">
            <h2 id="books-section" className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              Cuentos Gratuitos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {freeBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onRead={onReadBook} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Premium Books */}
        {premiumBooks.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-500" />
              Cuentos Premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumBooks.map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  onRead={onReadBook} 
                />
              ))}
            </div>
          </div>
        )}

        {/* No Books Message */}
        {totalBooks === 0 && !searchTerm && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">📚</div>
            <h3 className="text-3xl font-black text-gray-700 mb-4">
              Próximamente más cuentos
            </h3>
            <p className="text-xl text-gray-600">
              Estamos preparando increíbles historias para este nivel.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BooksSection;