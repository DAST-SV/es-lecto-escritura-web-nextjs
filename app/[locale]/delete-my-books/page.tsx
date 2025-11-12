'use client'

import React, { useState, useEffect } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import FlipBook from "@/src/components/components-for-books/book/utils/FlipBook";
import type { Page } from "@/src/typings/types-page-book/index";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { getUserId } from "@/src/utils/supabase/utilsClient";

interface BookData {
  pages: Page[];
  title?: string;
}

interface LibroUI {
  Json: string;
  src: string;
  caption: string;
  description?: string;
}

const MyBooks: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<{ json: string;} | null>(null);
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
    if (!confirm("🚨 ¿Estás seguro que quieres borrar este cuento mágico?")) return;

    try {
      const res = await fetch(`/api/libros/deletebook/${idLibro}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Libro eliminado correctamente ✅");
        setLibros((prev) => prev.filter((libro) => libro.Json !== idLibro));
      } else {
        alert(`Error al eliminar libro: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error al eliminar libro:", error);
    }
  };

  return (
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-yellow-100">
      {!selectedBook && (
        <>
          {/* BANNER */}
          <div className="w-full mb-6">
            <img
              src="/Imagenes/Banner.jpg"
              alt="Banner"
              className="w-full max-h-72 h-auto shadow-lg rounded-b-2xl"
            />
          </div>

          {/* Título principal */}
          <h2 className="text-4xl text-center font-extrabold my-6 text-blue-800 drop-shadow-md">
            🧸 Mis Libros Guardados
          </h2>
          <p className="text-center text-lg text-sky-600 mb-8">
            Explora, lee y si quieres... ¡borra lo que ya no necesites! 🚀
          </p>

          {/* GALERÍA */}
          <div className="max-w-5xl mx-auto px-4 mb-12">z
            <h2 className="text-2xl font-bold mb-6 text-center text-sky-700">Tu Galería de Cuentos</h2>

            <ImageGrid
              images={libros}
              shapeType={2}
              columns={3}
              onClick={(book) => setSelectedBook({ json: book.Json!})}
              showButton={true}
              buttonText="🗑"
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
            className="mt-4 px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 hover:scale-105 transition-all duration-300"
          >
            ⬅ Volver a la galería
          </button>
        </div>
      )}
    </UnifiedLayout>
  );
};

export default MyBooks;
