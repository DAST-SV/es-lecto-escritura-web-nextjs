'use client';

import React, { useState,useEffect } from 'react';
import { BookOpen, Star, Moon, Cloud, TreePine, Flame } from 'lucide-react';
import { Libro } from '@/src/typings/Libro';
import { useLibros } from '@/src/components/components-for-books/book/books/hooks/useLibros';

// 🌙 Componente LibroCard con estilo "Libro de Cuentos Nocturno"
const LibroCard = ({ libro }: { libro: Libro }) => {


  const [isOpen, setIsOpen] = useState(false);
  
  // Generar color basado en id_tipo
  const colorByType = {
    '1': 'from-purple-400 to-pink-400',
    '2': 'from-blue-400 to-cyan-400',
    '3': 'from-green-400 to-emerald-400',
  };
  
  const color = 'from-indigo-400 to-purple-400';
  
  // Imagen por defecto si no tiene portada
  const portada = libro.portada || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
  
  return (
    <div 
      className="relative perspective-1000"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Libro cerrado/abierto con efecto 3D */}
      <div 
        className={`relative transition-all duration-700 transform-style-3d ${
          isOpen ? 'rotate-y-15' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Lomo del libro (lado izquierdo) */}
        <div className={`absolute left-0 top-0 w-8 h-full bg-gradient-to-b ${color} rounded-l-xl shadow-inner transform -translate-x-8 opacity-0 transition-all duration-500 ${isOpen ? 'opacity-100 translate-x-0' : ''}`}>
          <div className="h-full flex items-center justify-center">
            <div className="transform -rotate-90 text-white font-black text-xs whitespace-nowrap">
              {libro.titulo.slice(0, 15)}
            </div>
          </div>
        </div>

        {/* Portada del libro */}
        <div className={`relative bg-gradient-to-br ${color} rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-700/30 transition-all duration-500 ${
          isOpen ? 'shadow-[20px_20px_60px_rgba(0,0,0,0.3)]' : 'shadow-xl'
        }`}>
          
          {/* Textura de libro antiguo */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
          
          {/* Marco dorado decorativo */}
          <div className="absolute inset-0 border-8 border-amber-200/40 rounded-2xl m-2" />
          
          {/* Imagen de portada */}
          <div className="relative h-80 overflow-hidden">
            <img 
              src={portada} 
              alt={libro.titulo}
              className={`w-full h-full object-cover transition-all duration-700 ${
                isOpen ? 'scale-110 blur-sm' : 'scale-100'
              }`}
            />
            
            {/* Overlay con viñeta */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>

          {/* Área de título - Estilo libro clásico */}
          <div className="relative bg-slate-800/90 backdrop-blur-sm p-6 border-t-2 border-amber-200/50">
            {/* Ornamento superior */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-amber-200 rounded-full border-2 border-slate-700" />
            
            <h3 className="text-white font-serif text-xl font-bold mb-3 leading-tight text-center min-h-[3.5rem] flex items-center justify-center">
              {libro.titulo}
            </h3>
            
            {/* Descripción o fecha */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-8 bg-amber-200/50" />
              <span className="text-amber-200 text-xs font-medium">
                {libro.descripcion?.slice(0, 30) || new Date(libro.fecha_creacion).toLocaleDateString('es')}
              </span>
              <div className="h-px w-8 bg-amber-200/50" />
            </div>

            {/* Botón de lectura - Aparece al hover */}
            <div className={`transition-all duration-500 transform ${
              isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <button className="w-full bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-400 hover:to-amber-600 text-slate-900 font-bold py-3 rounded-lg shadow-lg transition-all duration-300 hover:shadow-amber-300/50 hover:scale-105 border-2 border-amber-600">
                Abrir Libro
              </button>
            </div>
          </div>

          {/* Marcador de página */}
          <div className={`absolute top-0 right-8 w-12 h-20 bg-gradient-to-b from-red-600 to-red-800 shadow-lg transition-all duration-500 ${
            isOpen ? 'translate-y-0' : '-translate-y-16'
          }`}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-t-[12px] border-t-red-800" />
          </div>

          {/* Brillo de página */}
          {isOpen && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine pointer-events-none" />
          )}
        </div>
      </div>

      {/* Sombra del libro */}
      <div className={`absolute inset-0 bg-slate-900/20 blur-2xl -z-10 transition-all duration-500 ${
        isOpen ? 'scale-110 opacity-70' : 'scale-95 opacity-30'
      }`} />
    </div>
  );
};

export default function LibrosPage() {
  const { libros, loading, error, fetchLibros } = useLibros();

  // 🌙 LOADING - Estilo "Biblioteca Nocturna"
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
        {/* Estrellas parpadeantes */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Luna llena */}
        <div className="absolute top-20 right-20 w-32 h-32">
          <div className="w-full h-full rounded-full bg-amber-100 shadow-[0_0_80px_rgba(251,191,36,0.6)] animate-pulse" />
          <Moon className="absolute inset-0 m-auto w-16 h-16 text-amber-200" />
        </div>

        {/* Libro flotante girando */}
        <div className="relative">
          <div className="w-48 h-64 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg shadow-2xl animate-float border-4 border-amber-200/30 flex items-center justify-center">
            <BookOpen className="w-24 h-24 text-amber-200 animate-pulse" />
          </div>
          <p className="text-center mt-8 text-2xl font-serif text-amber-200 animate-pulse">
            Abriendo tu biblioteca...
          </p>
        </div>
      </div>
    );
  }

  // 🔥 ERROR - Estilo "Página Quemada"
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-orange-900 to-slate-900 p-6">
        <div className="max-w-lg bg-amber-50 rounded-lg shadow-2xl p-10 text-center relative overflow-hidden border-8 border-amber-900">
          {/* Efecto de papel quemado en los bordes */}
          <div className="absolute inset-0 border-8 border-transparent bg-gradient-to-r from-orange-900 via-transparent to-orange-900 opacity-20 blur-sm" />
          
          <Flame className="w-20 h-20 text-orange-600 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-slate-700 mb-8 font-serif italic">
            "{error}"
          </p>
          <button
            onClick={fetchLibros}
            className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-lg shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 border-2 border-amber-800"
          >
            Restaurar Página
          </button>
        </div>
      </div>
    );
  }

  // 📚 MAIN - Estilo "Bosque de Historias"
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      
      {/* Fondo de bosque místico */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(15)].map((_, i) => (
          <TreePine
            key={i}
            className="absolute text-emerald-800"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${20 + (i * 13) % 60}%`,
              width: `${30 + Math.random() * 40}px`,
              height: `${30 + Math.random() * 40}px`,
              opacity: 0.3 + Math.random() * 0.3
            }}
          />
        ))}
      </div>

      {/* Niebla flotante */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <Cloud
            key={i}
            className="absolute text-slate-400/20 animate-float-slow"
            style={{
              left: `${(i * 20) % 100}%`,
              top: `${10 + (i * 15) % 70}%`,
              width: `${80 + i * 20}px`,
              height: `${60 + i * 15}px`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${20 + i * 5}s`
            }}
          />
        ))}
      </div>

      {/* Header - Estilo "Entrada a la Biblioteca" */}
      <header className="relative z-10 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Arco de entrada decorativo */}
          <div className="relative mb-8">
            <div className="absolute left-0 right-0 top-0 h-32 bg-gradient-to-b from-amber-900/30 to-transparent rounded-t-[100%]" />
            <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-64 h-16 bg-slate-800 rounded-full border-4 border-amber-600 shadow-2xl flex items-center justify-center">
              <span className="text-amber-200 font-serif font-bold text-2xl tracking-wider">
                MI BIBLIOTECA
              </span>
            </div>
          </div>

          <div className="text-center mt-16">
            <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 mb-4 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              El Bosque de las Historias
            </h1>
            <p className="text-xl text-amber-200/80 font-serif italic">
              {libros.length} {libros.length === 1 ? 'libro aguarda' : 'libros aguardan'} en los estantes encantados
            </p>

            {/* Contador con estrellas */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Star className="w-6 h-6 text-amber-400 animate-pulse" />
              <div className="px-6 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border-2 border-amber-600/50">
                <span className="text-3xl font-bold text-amber-300">{libros.length}</span>
              </div>
              <Star className="w-6 h-6 text-amber-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* Estado vacío - "Biblioteca desierta" */}
        {libros.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl border-4 border-amber-700/50 p-16 text-center overflow-hidden">
              
              {/* Candelabro */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <Flame className="w-12 h-12 text-orange-400 animate-pulse" />
              </div>

              <BookOpen className="w-32 h-32 text-amber-600/40 mx-auto mb-8" />
              
              <h3 className="text-4xl font-serif font-bold text-amber-200 mb-4">
                Los Estantes Esperan...
              </h3>
              <p className="text-xl text-amber-300/70 mb-8 font-serif italic">
                La primera historia aún no ha sido escrita en estos antiguos pergaminos
              </p>

              <button className="px-10 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-slate-900 font-serif font-bold text-xl rounded-lg shadow-lg hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 border-2 border-amber-800">
                Crear la Primera Historia
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Separador decorativo */}
            <div className="flex items-center justify-center mb-12">
              <div className="h-px w-32 bg-gradient-to-r from-transparent to-amber-600/50" />
              <div className="px-6 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border-2 border-amber-600/50">
                <span className="text-amber-200 font-serif">Los Tomos Coleccionados</span>
              </div>
              <div className="h-px w-32 bg-gradient-to-l from-transparent to-amber-600/50" />
            </div>

            {/* Estantería de libros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {libros.map((libro) => (
                <LibroCard key={libro.id_libro} libro={libro} />
              ))}
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine 2s ease-in-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .rotate-y-15 {
          transform: rotateY(-15deg);
        }
      `}</style>
    </div>
  );
}