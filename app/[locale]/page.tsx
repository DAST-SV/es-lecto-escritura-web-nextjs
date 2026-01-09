"use client";
import React from 'react';
import { UnifiedLayout } from '@/src/presentation/features/navigation';

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200" mainClassName="pt-0">
      <div className="w-full"></div>
    </UnifiedLayout>
  );
};

export default HomePage;