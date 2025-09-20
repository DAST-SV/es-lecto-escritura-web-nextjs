// ImprovedBookCategoryPage.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { SingleCategoryPageProps, Book, Level } from './types';
import { levelConfig, booksByLevel } from './constants';
import PageHeader from './PageHeader';
import LevelSelector from './LevelSelector';
import SearchBar from './SearchBar';
import LevelInfo from './LevelInfo';
import BooksSection from './BooksSection';
import CallToAction from './CallToAction';
import PageFooter from './PageFooter';
import BookModal from './BookModal';

const ImprovedBookCategoryPage: React.FC<SingleCategoryPageProps> = ({ 
  category: initialCategory 
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('preschool');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const enhancedLevels: Level[] = levelConfig.map(levelDef => {
    const existingLevel = initialCategory.levels?.find(l => l.id === levelDef.id);
    return existingLevel ? { ...levelDef, ...existingLevel } : levelDef;
  });

  const category = {
    ...initialCategory,
    levels: enhancedLevels
  };

  const handleReadBook = useCallback((book: Book) => {
    if (book.isPremium) {
      // In a real app, check if user has premium access
      const hasAccess = false; // This would come from your auth/subscription system
      if (!hasAccess) {
        alert('Este contenido requiere suscripción premium. ¿Te gustaría ver nuestros planes?');
        return;
      }
    }
    setSelectedBook(book);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedBook(null);
  }, []);

  const handleViewPlans = useCallback(() => {
    alert('Redirigiendo a planes de suscripción...');
  }, []);

  const handleStartTrial = useCallback(() => {
    alert('Iniciando prueba gratuita...');
  }, []);

  const selectedLevelData = category.levels.find(level => level.id === selectedLevel);
  const allBooks = booksByLevel[selectedLevel] || [];
  
  // Filter books by search term
  const filteredBooks = allBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const freeBooks = filteredBooks.filter(book => !book.isPremium);
  const premiumBooks = filteredBooks.filter(book => book.isPremium);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showModal) return; // Let modal handle its own shortcuts
      
      if (e.key === '/' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Header Section */}
      <PageHeader category={category} />

      {/* Level Selector */}
      <LevelSelector
        levels={category.levels}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
      />

      {/* Search Bar */}
      <div className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {/* Level Info */}
          {selectedLevelData && (
            <LevelInfo
              level={selectedLevelData}
              totalBooks={allBooks.length}
              freeBooks={freeBooks.length}
            />
          )}
        </div>
      </div>

      {/* Books Section */}
      <BooksSection
        freeBooks={freeBooks}
        premiumBooks={premiumBooks}
        searchTerm={searchTerm}
        onReadBook={handleReadBook}
      />

      {/* Call to Action */}
      <div className="px-6 md:px-16">
        <div className="max-w-6xl mx-auto">
          <CallToAction
            category={category}
            onViewPlans={handleViewPlans}
            onStartTrial={handleStartTrial}
          />
        </div>
      </div>

      {/* Footer */}
      <PageFooter />

      {/* Book Modal */}
      <BookModal 
        book={selectedBook} 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default ImprovedBookCategoryPage;