/**
 * HomeBackground Component
 * @file src/presentation/features/home/components/HomeBackground/HomeBackground.tsx
 * @description Unified background component for the entire homepage
 */

'use client';

import React from 'react';
import { Cloud } from '@/src/presentation/components/ui/Cloud';

export const HomeBackground: React.FC = () => {
  return (
    <>
      {/* Nubes decorativas */}
      <Cloud className="top-8 left-16 opacity-90" />
      <Cloud className="top-16 right-20 opacity-80" />
      <Cloud className="top-1/4 left-1/3 opacity-70" />
      <Cloud className="top-1/3 right-1/4 opacity-75" />
      <Cloud className="bottom-1/3 left-20 opacity-70" />
      <Cloud className="bottom-1/4 right-28 opacity-80" />
      <Cloud className="bottom-20 left-10 opacity-70" />
      <Cloud className="bottom-8 right-16 opacity-85" />

      {/* Letras decorativas - Superior izquierda */}
      <div 
        className="absolute top-16 left-24 text-4xl font-black text-yellow-400 opacity-15 transform rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        A
      </div>
      <div 
        className="absolute top-32 left-40 text-3xl font-black text-green-400 opacity-15 transform -rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        B
      </div>

      {/* Letras decorativas - Superior derecha */}
      <div 
        className="absolute top-20 right-32 text-3xl font-black text-orange-400 opacity-15 transform -rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        C
      </div>
      <div 
        className="absolute top-40 right-20 text-4xl font-black text-pink-400 opacity-15 transform rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        D
      </div>

      {/* Números decorativos - Medio */}
      <div 
        className="absolute top-1/2 left-12 text-3xl font-black text-blue-400 opacity-15 transform rotate-45 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        1
      </div>
      <div 
        className="absolute top-1/2 right-16 text-3xl font-black text-purple-400 opacity-15 transform -rotate-45 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        2
      </div>

      {/* Letras decorativas - Inferior izquierda */}
      <div 
        className="absolute bottom-32 left-16 text-3xl font-black text-cyan-400 opacity-15 transform rotate-45 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        E
      </div>
      <div 
        className="absolute bottom-20 left-36 text-4xl font-black text-lime-400 opacity-15 transform -rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        F
      </div>

      {/* Números decorativos - Inferior derecha */}
      <div 
        className="absolute bottom-36 right-24 text-3xl font-black text-red-400 opacity-15 transform -rotate-45 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        3
      </div>
      <div 
        className="absolute bottom-16 right-40 text-3xl font-black text-indigo-400 opacity-15 transform rotate-12 hidden lg:block" 
        style={{ fontFamily: "Nunito, 'Varela Round', Comfortaa, sans-serif" }}
      >
        4
      </div>

    </>
  );
};

export default HomeBackground;