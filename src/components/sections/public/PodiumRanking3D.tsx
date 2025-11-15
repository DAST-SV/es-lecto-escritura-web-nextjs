"use client";
import { useState, useEffect } from "react";
import { 
  Trophy, Crown, Star, Flame, Zap, TrendingUp, 
  Award, Target, Medal, Calendar, Users, BookOpen,
  ThumbsUp, Heart, Timer, Swords
} from "lucide-react";

// 🎯 TIPOS BASE
type SeasonRankingEntry = {
  id: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
  position: number;
  previousPosition?: number;
  trend?: "up" | "down" | "stable";
};

type CommunityRankingEntry = {
  id: string;
  title: string;
  cover: string;
  votes: number;
  rating: number;
  category: string;
  position: number;
};

type SchoolRankingEntry = {
  id: string;
  schoolName: string;
  logo: string;
  totalPoints: number;
  activeStudents: number;
  position: number;
  badge?: string;
};

// 🏆 COMPONENTE 1: RANKING POR TEMPORADA (Competitivo)
interface SeasonRankingProps {
  entries: SeasonRankingEntry[];
  seasonName: string;
  timeRemaining: string;
}

export const SeasonRanking: React.FC<SeasonRankingProps> = ({ 
  entries, 
  seasonName,
  timeRemaining 
}) => {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);

  const getPodiumHeight = (position: number) => {
    if (position === 1) return 'h-64';
    if (position === 2) return 'h-52';
    return 'h-44';
  };

  const getPodiumColor = (position: number) => {
    if (position === 1) return 'from-yellow-400 to-orange-500';
    if (position === 2) return 'from-gray-300 to-gray-500';
    return 'from-amber-600 to-orange-700';
  };

  const getMedal = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl p-8 shadow-2xl border-4 border-purple-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-2xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {seasonName}
            </h2>
            <p className="text-purple-300 font-bold">Ranking por Puntos</p>
          </div>
        </div>
        
        <div className="bg-red-500 px-6 py-3 rounded-xl border-2 border-white">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-white" />
            <span className="text-white font-black text-lg">{timeRemaining}</span>
          </div>
        </div>
      </div>

      {/* Podio Minimalista */}
      <div className="flex items-end justify-center gap-4 mb-8">
        {/* 2do Lugar */}
        <div className="flex flex-col items-center">
          <img 
            src={top3[1]?.avatar} 
            alt={top3[1]?.name}
            className="w-20 h-20 rounded-full border-4 border-gray-400 mb-2 object-cover"
          />
          <span className="text-white font-bold text-sm mb-2">{top3[1]?.name}</span>
          <div className={`w-32 ${getPodiumHeight(2)} bg-gradient-to-br ${getPodiumColor(2)} rounded-t-2xl flex flex-col items-center justify-center border-4 border-white/30 shadow-xl`}>
            <span className="text-5xl mb-2">🥈</span>
            <span className="text-white font-black text-2xl">{top3[1]?.points.toLocaleString()}</span>
            <span className="text-white/80 text-xs font-bold">puntos</span>
          </div>
        </div>

        {/* 1er Lugar */}
        <div className="flex flex-col items-center -mt-8">
          <Crown className="w-12 h-12 text-yellow-400 fill-yellow-400 mb-2 animate-bounce" />
          <img 
            src={top3[0]?.avatar} 
            alt={top3[0]?.name}
            className="w-24 h-24 rounded-full border-4 border-yellow-400 mb-2 object-cover ring-4 ring-yellow-400/50"
          />
          <span className="text-white font-black text-base mb-2">{top3[0]?.name}</span>
          <div className={`w-36 ${getPodiumHeight(1)} bg-gradient-to-br ${getPodiumColor(1)} rounded-t-2xl flex flex-col items-center justify-center border-4 border-yellow-400 shadow-2xl shadow-yellow-400/50`}>
            <span className="text-6xl mb-2">🥇</span>
            <span className="text-white font-black text-3xl">{top3[0]?.points.toLocaleString()}</span>
            <span className="text-white/80 text-xs font-bold">puntos</span>
          </div>
        </div>

        {/* 3er Lugar */}
        <div className="flex flex-col items-center">
          <img 
            src={top3[2]?.avatar} 
            alt={top3[2]?.name}
            className="w-20 h-20 rounded-full border-4 border-amber-600 mb-2 object-cover"
          />
          <span className="text-white font-bold text-sm mb-2">{top3[2]?.name}</span>
          <div className={`w-32 ${getPodiumHeight(3)} bg-gradient-to-br ${getPodiumColor(3)} rounded-t-2xl flex flex-col items-center justify-center border-4 border-white/30 shadow-xl`}>
            <span className="text-5xl mb-2">🥉</span>
            <span className="text-white font-black text-2xl">{top3[2]?.points.toLocaleString()}</span>
            <span className="text-white/80 text-xs font-bold">puntos</span>
          </div>
        </div>
      </div>

      {/* Lista 4-10 (Competitiva y Limpia) */}
      <div className="space-y-2">
        {rest.map((entry) => (
          <div 
            key={entry.id}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-slate-700/50 transition-all border border-slate-700 hover:border-purple-500"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-black text-white text-xl">
                {entry.position}
              </div>
              <img 
                src={entry.avatar} 
                alt={entry.name}
                className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
              />
              <div>
                <p className="text-white font-black">{entry.name}</p>
                <p className="text-purple-300 text-sm font-bold">Nivel {entry.level}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {entry.trend === "up" && (
                <TrendingUp className="w-5 h-5 text-green-400" />
              )}
              <div className="text-right">
                <p className="text-white font-black text-xl">{entry.points.toLocaleString()}</p>
                <p className="text-purple-300 text-xs">puntos</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 📚 COMPONENTE 2: TOP VOTADOS POR COMUNIDAD
interface CommunityRankingProps {
  entries: CommunityRankingEntry[];
}

export const CommunityTopVoted: React.FC<CommunityRankingProps> = ({ entries }) => {
  const top3 = entries.slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-8 shadow-2xl border-4 border-blue-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-2xl">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Top Votados por la Comunidad
          </h2>
          <p className="text-blue-300 font-bold">Los favoritos de todos</p>
        </div>
      </div>

      {/* Grid de Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {top3.map((entry, idx) => (
          <div 
            key={entry.id}
            className={`relative group cursor-pointer ${
              idx === 0 ? 'md:scale-110 md:-translate-y-4' : ''
            }`}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-400 hover:border-yellow-400 transition-all hover:scale-105">
              {/* Badge de posición */}
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-2xl font-black">{entry.position}</span>
              </div>

              {/* Cover del libro */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={entry.cover} 
                  alt={entry.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-xl font-black text-gray-800 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                  {entry.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-5 h-5 text-pink-500" />
                    <span className="text-gray-800 font-black text-lg">{entry.votes.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i}
                        className={`w-4 h-4 ${
                          i < entry.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <span className="inline-block mt-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  {entry.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 🏫 COMPONENTE 3: RANKING DE ESCUELAS
interface SchoolRankingProps {
  entries: SchoolRankingEntry[];
}

export const SchoolRanking: React.FC<SchoolRankingProps> = ({ entries }) => {
  const top5 = entries.slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 rounded-3xl p-8 shadow-2xl border-4 border-green-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-2xl">
          <Award className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
            Ranking de Escuelas
          </h2>
          <p className="text-green-300 font-bold">Competencia institucional</p>
        </div>
      </div>

      <div className="space-y-4">
        {top5.map((entry) => (
          <div 
            key={entry.id}
            className={`relative bg-gradient-to-r rounded-2xl p-6 border-4 transition-all hover:scale-105 ${
              entry.position === 1 
                ? 'from-yellow-400 to-orange-500 border-yellow-300 shadow-2xl shadow-yellow-400/50' 
                : 'from-emerald-600 to-teal-600 border-emerald-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-black text-4xl ${
                  entry.position === 1 ? 'bg-white/30' : 'bg-white/20'
                } backdrop-blur-sm border-2 border-white`}>
                  {entry.position}
                </div>
                
                <img 
                  src={entry.logo} 
                  alt={entry.schoolName}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                />
                
                <div>
                  <h3 className="text-2xl font-black text-white mb-1" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    {entry.schoolName}
                  </h3>
                  <div className="flex items-center gap-4 text-white/90 text-sm font-bold">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {entry.activeStudents} estudiantes
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-white font-black text-4xl mb-1">
                  {entry.totalPoints.toLocaleString()}
                </p>
                <p className="text-white/80 text-sm font-bold">puntos totales</p>
              </div>
            </div>

            {entry.position === 1 && (
              <div className="absolute -top-3 -right-3 bg-white px-4 py-2 rounded-full shadow-xl border-2 border-yellow-400 animate-bounce">
                <span className="text-2xl">👑</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 📊 DATOS MOCK
export const mockSeasonData: SeasonRankingEntry[] = [
  { id: "1", name: "Carlos García", avatar: "/avatars/carlos.jpg", points: 145200, level: 52, position: 1, trend: "stable" },
  { id: "2", name: "Sofía Martínez", avatar: "/avatars/sofia.jpg", points: 125840, level: 47, position: 2, trend: "up", previousPosition: 3 },
  { id: "3", name: "Ana López", avatar: "/avatars/ana.jpg", points: 98500, level: 42, position: 3, trend: "up", previousPosition: 5 },
  { id: "4", name: "Luis Rodríguez", avatar: "/avatars/luis.jpg", points: 87300, level: 38, position: 4, trend: "down", previousPosition: 2 },
  { id: "5", name: "María Hernández", avatar: "/avatars/maria.jpg", points: 76500, level: 35, position: 5, trend: "stable" },
  { id: "6", name: "Pedro Sánchez", avatar: "/avatars/pedro.jpg", points: 68200, level: 32, position: 6, trend: "up" },
  { id: "7", name: "Laura Torres", avatar: "/avatars/laura.jpg", points: 61800, level: 30, position: 7, trend: "stable" },
  { id: "8", name: "Diego Ramírez", avatar: "/avatars/diego.jpg", points: 55400, level: 28, position: 8, trend: "up" },
  { id: "9", name: "Elena Flores", avatar: "/avatars/elena.jpg", points: 49100, level: 26, position: 9, trend: "down" },
  { id: "10", name: "Jorge Castro", avatar: "/avatars/jorge.jpg", points: 43800, level: 24, position: 10, trend: "stable" },
];

export const mockCommunityData: CommunityRankingEntry[] = [
  { id: "1", title: "El Principito", cover: "/books/principito.jpg", votes: 15420, rating: 5, category: "Cuentos", position: 1 },
  { id: "2", title: "Caperucita Roja", cover: "/books/caperucita.jpg", votes: 12350, rating: 5, category: "Cuentos", position: 2 },
  { id: "3", title: "Los Tres Cerditos", cover: "/books/cerditos.jpg", votes: 10890, rating: 4, category: "Fábulas", position: 3 },
];

export const mockSchoolData: SchoolRankingEntry[] = [
  { id: "1", schoolName: "Colegio San Francisco", logo: "/schools/san-francisco.jpg", totalPoints: 2450000, activeStudents: 850, position: 1 },
  { id: "2", schoolName: "Instituto Nacional", logo: "/schools/nacional.jpg", totalPoints: 2180000, activeStudents: 920, position: 2 },
  { id: "3", schoolName: "Escuela República", logo: "/schools/republica.jpg", totalPoints: 1950000, activeStudents: 750, position: 3 },
  { id: "4", schoolName: "Colegio Santa María", logo: "/schools/santa-maria.jpg", totalPoints: 1720000, activeStudents: 680, position: 4 },
  { id: "5", schoolName: "Centro Escolar Libertad", logo: "/schools/libertad.jpg", totalPoints: 1580000, activeStudents: 620, position: 5 },
];