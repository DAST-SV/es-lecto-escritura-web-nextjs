'use client'

import React, { useState, useEffect } from "react";
import BookCarousel from "@/src/components/components-for-books/book/BookCarousel";
import FlipBook from "@/src/components/components-for-books/book/FlipBook";
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
    <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden">
      {/* 🎨 BACKGROUND MÁGICO - tonos celeste/azul */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-200 via-blue-100 to-white overflow-hidden">
        {/* Nubes ☁️ */}
        <div className="absolute top-[10%] left-[-20%] w-60 h-32 bg-white rounded-full blur-xl opacity-70 animate-cloud" />
        <div className="absolute top-[30%] left-[60%] w-72 h-40 bg-white rounded-full blur-2xl opacity-60 animate-cloud-slow" />
        <div className="absolute top-[55%] left-[-15%] w-48 h-28 bg-white rounded-full blur-xl opacity-70 animate-cloud" />

        {/* Estrellas 🌟 - tonos suaves */}
        <div className="absolute left-[20%] top-[20%] w-6 h-6 bg-blue-300 rounded-full shadow-lg animate-star" />
        <div className="absolute left-[75%] top-[40%] w-8 h-8 bg-cyan-300 rounded-full shadow-lg animate-star" />
        <div className="absolute left-[50%] top-[70%] w-5 h-5 bg-blue-200 rounded-full shadow-lg animate-star" />

        {/* Globos 🎈 - azul, celeste y amarillo */}
        <div className="absolute w-12 h-16 bg-blue-400 rounded-full animate-balloon left-[10%] bottom-[-20%]" />
        <div className="absolute w-14 h-20 bg-cyan-400 rounded-full animate-balloon-slow left-[60%] bottom-[-25%]" />
        <div className="absolute w-10 h-14 bg-yellow-300 rounded-full animate-balloon left-[85%] bottom-[-30%]" />

        {/* Confetti ✨ - tonos coherentes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * -100}%`,
              backgroundColor: ["#60a5fa", "#38bdf8", "#22d3ee", "#0ea5e9"][Math.floor(Math.random() * 4)],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* CONTENIDO */}
      {!selectedBook && (
        <>
          {/* BANNER */}
          <div className="relative w-full mb-8">
            <img
              src="/Imagenes/Banner.jpg"
              alt="Banner"
              className="w-full max-h-96 h-auto shadow-lg rounded-b-3xl"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-b-3xl">
              <h1 className="text-6xl font-extrabold text-white drop-shadow-xl animate-bounce">
                📚 ¡Mis Aventuras!
              </h1>
            </div>
          </div>

          {/* Título principal */}
          <h2 className="text-5xl text-center font-extrabold my-6 text-blue-900 drop-shadow-md animate-pulse">
            ¡Bienvenidos a Mis Lecturas!
          </h2>
          <p className="text-center text-xl text-blue-700 mb-10 font-medium">
            Explora cuentos mágicos, aprende y diviértete. ✨🌈
          </p>

          {/* GALERÍA - Carrusel de cuentos */}
          <div className="max-w-6xl mx-auto px-6 mb-16">
            <h2 className="text-4xl font-bold mb-8 text-center text-blue-800 drop-shadow-sm">
              🌟 Galería de Cuentos 🌟
            </h2>
            <BookCarousel
              libros={libros}
              onSelect={(book) => setSelectedBook({ json: book.Json ?? "", caption: book.caption })}
            />
          </div>

          {/* BANNER Juegos */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <Link href="../../es/pages-games">
              <img
                src="/Imagenes/Juega aqui.jpg"
                alt="Banner"
                className="w-full rounded-2xl shadow-lg hover:scale-110 hover:rotate-2 transition-transform duration-300 ease-out"
              />
            </Link>
            <p className="mt-4 text-xl text-blue-700 font-semibold animate-bounce">
              🎮 ¡Haz clic y juega mientras aprendes! ✨
            </p>
          </div>
        </>
      )}

      {/* FlipBook */}
      {selectedBook && bookData && (
        <div className="mx-auto my-6 w-full h-full text-center">
          <FlipBook pages={bookData.pages} />
          <button
            onClick={() => setSelectedBook(null)}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-lg font-bold rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            ⬅️ Volver a la galería
          </button>
        </div>
      )}
    </UnifiedLayout>
  );
};

export default MyBooks;
