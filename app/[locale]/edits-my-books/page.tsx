'use client'

import React, { useState, useEffect } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import { Book } from "@/src/components/components-for-books/book/create-edits-books/components/Book";
import type { page } from "@/src/typings/types-page-book/index";
import Link from "next/link";
import { getUserId } from "@/src/utils/supabase/utilsClient";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

interface BookData {
  pages: page[];
  title?: string;
}

interface LibroUI {
  Json: string;
  src: string;
  caption: string;
  description?: string;
}

const transformPageData = (page: any, index: number): page => ({
  id: `page-${index + 1}`,
  layout: page.layout || 'CoverLayout',
  title: page.title || "Mi Libro Interactivo",
  text: page.text || "Una historia maravillosa comienza aquí...",
  image: page.image || null,
  textColor: page.textColor || null,
  background: page.background || 'Gradiente Azul',
  font: page.font || 'Georgia'
});

const MyBooks: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<{ json: string; caption: string } | null>(null);
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [libros, setLibros] = useState<LibroUI[]>([]);

  // 🔹 Cargar libros
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

  // 🔹 Cargar libro seleccionado
  useEffect(() => {
    if (selectedBook) {
      const fetchBook = async () => {
        try {
          const response = await fetch(`/api/libros/pagesforbook/${selectedBook.json}`);
          const data = await response.json();
          const transformedPages = data.pages.map((p: any, idx: number) => transformPageData(p, idx));
          setBookData({ pages: transformedPages, title: selectedBook.caption });
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
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-yellow-100 relative overflow-hidden">
      {/* ✨ Fondo Animado */}
      <div className="absolute inset-0 -z-10">
        {/* Nubes */}
        <div className="absolute top-10 left-[-20%] w-60 h-32 bg-white rounded-full blur-xl opacity-70 animate-cloud" />
        <div className="absolute top-1/3 left-[60%] w-72 h-40 bg-white rounded-full blur-2xl opacity-60 animate-cloud-slow" />
        <div className="absolute top-[60%] left-[-15%] w-48 h-28 bg-white rounded-full blur-xl opacity-70 animate-cloud" />

        {/* Estrellitas y confetti */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ["#fbbf24", "#34d399", "#60a5fa", "#a78bfa", "#f472b6"][i % 5],
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {!selectedBook && (
        <>
          {/* Banner */}
          <div className="w-full mb-6">
            <img
              src="/Imagenes/Banner.jpg"
              alt="Banner"
              className="w-full max-h-72 h-auto shadow-lg rounded-b-2xl"
            />
          </div>

          <h2 className="text-4xl text-center font-extrabold my-6 text-blue-800 drop-shadow-md">
            🧸 Mis Libros Interactivos
          </h2>
          <p className="text-center text-lg text-sky-600 mb-8">
            Edita tus cuentos, juega y diviértete ✨📚
          </p>

          {/* Galería */}
          <div className="max-w-5xl mx-auto px-4 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Galería de Cuentos</h2>
            <ImageGrid
              images={libros}
              shapeType={2}
              columns={3}
              onClick={(book) => setSelectedBook({ json: book.Json ?? "", caption: book.caption })}
              showButton={true}
              buttonText="✏️ Editar"
              buttonColor="blue"
              buttonPosition="corner"
              onButtonClick={(book) => setSelectedBook({ json: book.Json ?? "", caption: book.caption })}
            />
          </div>

          {/* Banner juegos */}
          <div className="max-w-4xl mx-auto mb-12">
            <Link href="../../pages/pages-games">
              <img
                src="/Imagenes/Juega aqui.jpg"
                alt="Banner"
                className="w-full h-auto rounded-lg shadow-md hover:scale-110 transition-transform duration-300"
              />
            </Link>
            <p className="text-center mt-2 text-lg text-pink-600 font-medium">
              ¡Haz clic y juega mientras editas tus libros! 🎮✨
            </p>
          </div>
        </>
      )}

      {/* Book Editor */}
      {selectedBook && bookData && (
        <div className="mx-auto my-6 w-full h-full flex flex-col items-center">
          <Book initialPages={bookData.pages} IdLibro={selectedBook.json} />
          <button
            onClick={() => setSelectedBook(null)}
            className="mt-4 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 hover:scale-105 transition-all duration-300"
          >
            ⬅ Volver a la galería
          </button>
        </div>
      )}
    </UnifiedLayout>
  );
}

export default MyBooks;
