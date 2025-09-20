// LevelSelector.tsx
import React from 'react';
import { Level } from './types';
import { booksByLevel } from './constants';

interface LevelSelectorProps {
  levels: Level[];
  selectedLevel: string;
  onLevelChange: (levelId: string) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ levels, selectedLevel, onLevelChange }) => {
  return (
    <section className="py-12 px-6 md:px-16" aria-labelledby="level-selector">
      <div className="max-w-6xl mx-auto">
        <h2 id="level-selector" className="text-3xl font-black text-center text-gray-800 mb-12">
          Elige tu Nivel de Lectura
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => onLevelChange(level.id)}
              className={`p-6 rounded-2xl transition-all duration-300 text-left border-2 ${
                selectedLevel === level.id
                  ? `bg-gradient-to-br ${level.color} text-white shadow-xl scale-105 border-white`
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl border-gray-200 hover:scale-102'
              }`}
              aria-pressed={selectedLevel === level.id}
              aria-describedby={`level-${level.id}-description`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-xl mb-2">{level.name}</h3>
                  <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    selectedLevel === level.id 
                      ? 'bg-white bg-opacity-20' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {level.ageRange}
                  </div>
                </div>
                {selectedLevel === level.id && (
                  <div className="bg-white bg-opacity-20 p-2 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <p id={`level-${level.id}-description`} className={`text-sm mb-4 ${selectedLevel === level.id ? 'opacity-90' : 'opacity-80'}`}>
                {level.description}
              </p>
              
              <div className="space-y-1">
                {level.features.slice(0, 3).map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedLevel === level.id ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelSelector;