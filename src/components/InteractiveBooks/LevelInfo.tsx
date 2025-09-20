// LevelInfo.tsx
import React from 'react';
import { Level, Book } from './types';

interface LevelInfoProps {
  level: Level;
  totalBooks: number;
  freeBooks: number;
}

const LevelInfo: React.FC<LevelInfoProps> = ({ level, totalBooks, freeBooks }) => {
  return (
    <div className="text-center mb-12">
      <div className={`inline-block bg-gradient-to-r ${level.color} text-white px-8 py-6 rounded-2xl shadow-xl`}>
        <h3 className="text-2xl font-black mb-2">
          {level.name}
        </h3>
        <p className="text-lg opacity-90 mb-4">
          Para niños de {level.ageRange}
        </p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">📖</div>
            <div>Texto {level.textSize === 'large' ? 'grande' : level.textSize === 'medium' ? 'mediano' : 'normal'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📚</div>
            <div>{totalBooks} cuentos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div>{freeBooks} gratis</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelInfo;