'use client'

import React, { useState, useEffect } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import FlipBook from "@/src/components/components-for-books/book/FlipBook";
import type { Page } from "@/src/typings/types-page-book/index";
import Link from "next/link";
import { getUserId } from "@/src/utils/supabase/utilsClient";

interface BookData {
  pages: Page[];
  title?: string;
}

interface LibroUI {
  Json: string;      // idlibro
  src: string;       // imagen o background de la primera página
  caption: string;   // título del libro
  description?: string; // title de la primera página
}

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

        const librosUI: LibroUI[] = await Promise.all(
          librosUsuario.map(async (libro: any) => {
            const resPages = await fetch(`/api/libros/pagesforbook/${libro.idlibro}`);
            const dataPages = await resPages.json();
            const pages: Page[] = dataPages?.pages ?? [];

            if (!pages.length) return null;

            const firstPage = pages[0];
            return {
              Json: libro.idlibro,
              src: firstPage.image ?? firstPage.background ?? "/Imagenes/placeholder.png",
              caption: libro.titulo,
              description: firstPage.title ?? "",
            };
          })
        );

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

  // 🔹 Eliminar libro
  const handleDeleteBook = async (idLibro: string) => {
    if (!confirm("¿Seguro que deseas eliminar este libro?")) return;

    try {
      const res = await fetch(`/api/libros/deletebook/${idLibro}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Libro eliminado correctamente ✅");
        // Actualizar la lista en el estado
        setLibros((prev) => prev.filter((libro) => libro.Json !== idLibro));
      } else {
        alert(`Error al eliminar libro: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error al eliminar libro:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100">
      {!selectedBook && (
        <>
          {/* BANNER */}
          <div className="w-full mb-6">
            <img
              src="/Imagenes/Banner.jpg"
              alt="Banner"
              className="w-full max-h-85 h-auto shadow-lg rounded-b-xl"
            />
          </div>

          {/* Título */}
          <h2 className="text-5xl text-center font-extrabold my-6 text-purple-700 drop-shadow-lg">
            ¡Bienvenidos a Mis Lecturas!
          </h2>
          <p className="text-center text-lg text-pink-600 mb-8">
            Explora cuentos mágicos, aprende y diviértete. 📚✨
          </p>

          {/* GALERÍA */}
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Galería de Cuentos</h2>

            <ImageGrid
              images={libros}
              shapeType={2}
              columns={3}
              onClick={(book) => setSelectedBook({ json: book.Json!, caption: book.caption })}
              showButton={true}
              buttonText="Eliminar"
              buttonColor="red"
              buttonPosition="corner"
              onButtonClick={(book) => handleDeleteBook(book.Json!)}
            />
          </div>
        </>
      )}

      {/* FlipBook */}
      {selectedBook && bookData && (
        <div className="mx-auto my-6 w-full h-full">
          <FlipBook pages={bookData.pages} />
          <button
            onClick={() => setSelectedBook(null)}
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Volver a la galería
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBooks;
