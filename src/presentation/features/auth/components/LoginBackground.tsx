"use client";

import { Cloud } from '@/src/presentation/components/ui/Cloud';
import React from 'react';

export function LoginBackground() {
  return (
    <>
      <Cloud className="top-8 left-16 opacity-90" />
      <Cloud className="top-16 right-20 opacity-80" />
      <Cloud className="bottom-20 left-10 opacity-70" />
      <Cloud className="bottom-8 right-16 opacity-85" />

      <div 
        className="absolute top-16 left-24 text-4xl font-black text-red-500 opacity-15 transform rotate-12" 
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        A
      </div>
      <div 
        className="absolute top-24 right-32 text-3xl font-black text-yellow-500 opacity-15 transform -rotate-12" 
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        B
      </div>
      <div 
        className="absolute bottom-32 left-16 text-3xl font-black text-green-500 opacity-15 transform rotate-45" 
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        C
      </div>
      <div 
        className="absolute bottom-16 right-24 text-3xl font-black text-purple-500 opacity-15 transform -rotate-45" 
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        1
      </div>
    </>
  );
}