// useNarration.ts - Versión optimizada para evitar bucles infinitos
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Book } from './types';

interface UseNarrationProps {
  book: Book | null;
  currentPage: number;
  autoAdvance: boolean;
  onNextPage: () => void;
}

interface UseNarrationReturn {
  isPlaying: boolean;
  isMuted: boolean;
  readingSpeed: number;
  toggleNarration: () => void;
  setIsMuted: (muted: boolean) => void;
  setReadingSpeed: (speed: number) => void;
  resetNarration: () => void;
  renderHighlightedText: (content: string, words?: Array<{text: string; start: number; end: number}>) => React.ReactNode;
}

export const useNarration = ({ 
  book, 
  currentPage, 
  autoAdvance, 
  onNextPage 
}: UseNarrationProps): UseNarrationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [readingSpeed, setReadingSpeed] = useState(1);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousBookId = useRef<string | null>(null);
  const previousPage = useRef<number>(-1);

  // Stable toggle function
  const toggleNarration = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Stable reset function
  const resetNarration = useCallback(() => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Stable mute setter
  const setIsMutedStable = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, []);

  // Stable speed setter
  const setReadingSpeedStable = useCallback((speed: number) => {
    setReadingSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  // Reset when book changes
  useEffect(() => {
    if (book && book.id !== previousBookId.current) {
      previousBookId.current = book.id;
      resetNarration();
    }
  }, [book?.id, resetNarration]);

  // Reset when page changes
  useEffect(() => {
    if (currentPage !== previousPage.current) {
      previousPage.current = currentPage;
      setCurrentWordIndex(-1);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [currentPage]);

  // Narration logic
  useEffect(() => {
    if (!isPlaying || !book || !book.pages[currentPage]) {
      return;
    }

    const currentPageData = book.pages[currentPage];
    const words = currentPageData.words || [];
    
    if (words.length === 0) {
      return;
    }

    let wordIndex = currentWordIndex + 1;
    
    const playNextWord = () => {
      if (wordIndex >= words.length) {
        setCurrentWordIndex(-1);
        setIsPlaying(false);
        
        if (autoAdvance) {
          setTimeout(() => {
            onNextPage();
          }, 1000);
        }
        return;
      }

      setCurrentWordIndex(wordIndex);
      
      const baseDuration = 500; // Base duration in ms
      const duration = baseDuration / readingSpeed;
      
      timeoutRef.current = setTimeout(() => {
        wordIndex++;
        playNextWord();
      }, duration);
    };

    playNextWord();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isPlaying, currentPage, currentWordIndex, book?.id, autoAdvance, readingSpeed]); // Dependencias estables

  // Stable render function using useMemo
  const renderHighlightedText = useMemo(() => {
    return (content: string, words?: Array<{text: string; start: number; end: number}>) => {
      if (!words || words.length === 0 || currentWordIndex === -1 || !isPlaying) {
        return <span>{content}</span>;
      }

      const currentWord = words[currentWordIndex];
      if (!currentWord) {
        return <span>{content}</span>;
      }

      const before = content.slice(0, currentWord.start);
      const highlighted = content.slice(currentWord.start, currentWord.end);
      const after = content.slice(currentWord.end);

      return (
        <span>
          {before}
          <span className="bg-yellow-300 text-black px-1 rounded transition-all duration-200">
            {highlighted}
          </span>
          {after}
        </span>
      );
    };
  }, [currentWordIndex, isPlaying]);

  return {
    isPlaying,
    isMuted,
    readingSpeed,
    toggleNarration,
    setIsMuted: setIsMutedStable,
    setReadingSpeed: setReadingSpeedStable,
    resetNarration,
    renderHighlightedText
  };
};