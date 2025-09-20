// BookModalControls.tsx - Versión original que funciona
import React from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Book } from './types';
import { levelConfig } from './constants';

interface BookModalControlsProps {
  book: Book;
  isPlaying: boolean;
  isMuted: boolean;
  readingSpeed: number;
  onToggleNarration: () => void;
  onToggleMute: (muted: boolean) => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const BookModalControls: React.FC<BookModalControlsProps> = ({
  book,
  isPlaying,
  isMuted,
  readingSpeed,
  onToggleNarration,
  onToggleMute,
  onSpeedChange,
  onReset,
  onClose
}) => {
  const level = levelConfig.find(l => l.id === book.level);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex-shrink-0" style={{ height: '10vh' }}>
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="text-2xl">{book.coverImage}</span>
          <div>
            <h2 className="text-lg md:text-xl font-bold">{book.title}</h2>
            <div className="text-sm opacity-90">
              {level?.name} • {book.ageRange} • {book.duration}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Narration Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onToggleMute(!isMuted)}
              className={`p-2 rounded-full transition-all ${
                isMuted ? 'bg-red-100/20 text-red-400' : 'bg-white/20 text-white'
              }`}
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <select
              value={readingSpeed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="text-sm px-2 py-1 bg-white/20 border border-white/30 rounded text-white"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          <button
            onClick={onToggleNarration}
            className={`${
              isPlaying 
                ? 'bg-red-500/80 hover:bg-red-600/80' 
                : 'bg-green-500/80 hover:bg-green-600/80'
            } text-white p-2 rounded-full transition-all`}
            title={isPlaying ? 'Pausar narración' : 'Reproducir narración'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={onReset}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
            title="Reiniciar libro"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
            title="Cerrar libro"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookModalControls;