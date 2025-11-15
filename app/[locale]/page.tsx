"use client";
import React from 'react';
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import HeroCarousel from '@/src/components/sections/public/HeroCarousel';
import { 
  SeasonRanking, 
  CommunityTopVoted, 
  SchoolRanking,
  mockSeasonData,
  mockCommunityData,
  mockSchoolData
} from '@/src/components/sections/public/PodiumRanking3D';

const HomePage: React.FC = () => {
  return (
    <UnifiedLayout className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200" mainClassName="pt-0">
      <div className="w-full">
        <HeroCarousel />
      </div>

      {/* Ranking por Temporada */}
      <div className="w-full px-4 py-12">
        <SeasonRanking 
          entries={mockSeasonData}
          seasonName="Temporada Verano 2025"
          timeRemaining="15d 8h 32m"
        />
      </div>

      {/* Top Votados Comunidad */}
      <div className="w-full px-4 py-12">
        <CommunityTopVoted entries={mockCommunityData} />
      </div>

      {/* Ranking Escuelas */}
      <div className="w-full px-4 py-12">
        <SchoolRanking entries={mockSchoolData} />
      </div>
    </UnifiedLayout>
  );
};

export default HomePage;