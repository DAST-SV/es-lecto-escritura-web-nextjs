'use client'

import React, { useState, useEffect } from "react";
import { BookOpen, ArrowLeft, Star, Sparkles, Heart, Gamepad2 } from "lucide-react";
import BookCarousel from "@/src/components/components-for-books/book/utils/BookCarousel";
import FlipBook from "@/src/components/components-for-books/book/utils/FlipBook";
import type { Page, LibroUI } from "@/src/typings/types-page-book/index";
import Link from "next/link";
import { getUserId } from "@/src/utils/supabase/utilsClient";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

interface BookData {
  pages: Page[];
  title?: string;
}

const MyBooks: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<{ json: string; caption: string } | null>(null);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [libros, setLibros] = useState<LibroUI[]>([]);

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const idUsuario = await getUserId();
        if (!idUsuario) return;

        const resLibros = await fetch(`/api/libros/bookinformation/${idUsuario}`);
        const dataLibros = await resLibros.json();
        const librosUsuario = dataLibros?.libros ?? [];

        const librosUI: LibroUI[] = librosUsuario.map((libro: any) => ({
          Json: libro.id_libro,
          src: libro.portada ?? libro.background ?? "/Imagenes/placeholder.png",
          caption: libro.titulo,
          description: libro.descripcion ?? "",
        }));

        setLibros(librosUI.filter(Boolean) as LibroUI[]);
      } catch (error) {
        console.error("❌ Error cargando libros y páginas:", error);
      }
    };

    fetchLibros();
  }, []);

  useEffect(() => {
    if (selectedBook) {
      const fetchBook = async () => {
        try {
          const response = await fetch(`/api/libros/pagesforbook/${selectedBook.json}`);
          const data = await response.json();
          setBookData({ pages: data.pages });
        } catch (error) {
          console.error("Error al cargar el libro:", error);
        }
      };
      fetchBook();
    } else {
      setBookData(null);
    }
  }, [selectedBook]);

  return (
    <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-cyan-50">
      {/* 🎨 Decoraciones de fondo sutiles y elegantes */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Nubes suaves */}
        <div className="absolute top-[10%] left-[-10%] w-60 h-32 bg-white rounded-full blur-3xl opacity-30 animate-cloud" />
        <div className="absolute top-[30%] right-[-10%] w-72 h-40 bg-white rounded-full blur-3xl opacity-25 animate-cloud-slow" />
        <div className="absolute bottom-[20%] left-[20%] w-48 h-28 bg-white rounded-full blur-3xl opacity-30 animate-cloud" />

        {/* Estrellas pequeñas y sutiles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-sky-300 animate-pulse opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* CONTENIDO */}
      {!selectedBook && (
        <>
          {/* Hero Section con Banner */}
          <div className="relative w-full mb-10">
            <div className="relative overflow-hidden rounded-b-3xl shadow-2xl">
              <img
                src="/Imagenes/Banner.jpg"
                alt="Banner"
                className="w-full max-h-80 h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-blue-600/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="inline-block mb-4 animate-bounce">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                    <BookOpen size={56} className="text-white drop-shadow-lg" />
                  </div>
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-3 drop-shadow-2xl text-center px-4"
                    style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.3)' }}>
                  📚 Mis Aventuras de Lectura
                </h1>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-300 animate-pulse" size={24} />
                  <p className="text-xl sm:text-2xl font-bold drop-shadow-lg">
                    Explora, aprende y diviértete
                  </p>
                  <Star className="text-yellow-300 animate-pulse" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas de estadísticas */}
          <div className="max-w-6xl mx-auto px-4 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 border-2 border-sky-200">
                <div className="flex items-center gap-4">
                  <div className="bg-sky-100 p-3 rounded-full">
                    <BookOpen size={32} className="text-sky-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">{libros.length}</p>
                    <p className="text-sm text-gray-600 font-semibold">Cuentos Disponibles</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 border-2 border-cyan-200">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-100 p-3 rounded-full">
                    <Sparkles size={32} className="text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">∞</p>
                    <p className="text-sm text-gray-600 font-semibold">Aventuras por Vivir</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 border-2 border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Heart size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-gray-800">100%</p>
                    <p className="text-sm text-gray-600 font-semibold">Aprendizaje Divertido</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Galería de Cuentos */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-black text-blue-700 mb-3"
                  style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.5)' }}>
                🌟 Galería de Cuentos 🌟
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-1.5 w-24 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-400 rounded-full" />
              </div>
              <p className="text-lg text-blue-600 font-semibold">
                Selecciona un cuento para comenzar tu aventura
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-sky-200">
              <BookCarousel
                libros={libros}
                onSelect={(book) => setSelectedBook({ json: book.Json ?? "", caption: book.caption })}
              />
            </div>
          </div>

          {/* Banner de Juegos */}
          <div className="max-w-4xl mx-auto px-4 mb-16">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl shadow-2xl p-1">
              <div className="bg-white rounded-3xl p-6">
                <div className="text-center mb-6">
                  <div className="inline-block mb-4">
                    <div className="bg-gradient-to-r from-sky-100 to-cyan-100 rounded-full p-4">
                      <Gamepad2 size={48} className="text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-black text-blue-700 mb-2"
                      style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.5)' }}>
                    🎮 ¡Es Hora de Jugar! 🎮
                  </h3>
                  <p className="text-blue-600 font-semibold text-lg">
                    Aprende mientras te diviertes con nuestros juegos educativos
                  </p>
                </div>

                <Link href="../../es/pages-games">
                  <div className="relative group cursor-pointer overflow-hidden rounded-2xl">
                    <img
                      src="/Imagenes/Juega aqui.jpg"
                      alt="Banner de juegos"
                      className="w-full rounded-2xl shadow-lg transform transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-8 py-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-blue-700 font-black text-xl">
                          ¡Click para jugar! 🚀
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vista de Lectura */}
      {selectedBook && bookData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
            <FlipBook pages={bookData.pages} />
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setSelectedBook(null)}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 text-white text-xl font-bold rounded-full shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}
            >
              <ArrowLeft size={24} />
              Volver a la galería
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes cloud {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(25px); }
        }
        @keyframes cloud-slow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        .animate-cloud {
          animation: cloud 25s ease-in-out infinite;
        }
        .animate-cloud-slow {
          animation: cloud-slow 35s ease-in-out infinite;
        }
      `}</style>
    </UnifiedLayout>
  );
};

export default MyBooks;