'use client'

import React, { useState, useEffect } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import FlipBook from "@/src/components-for-books/book/FlipBook";
import type { Page } from "@/src/typings/types-page-book/index";
import Link from "next/link";
import "@/app/globals.css"
// import Juega from '@/public/Imagenes/Juega aqui.jpg'
// import banner from '@/public/Imagenes/banner.jpg'

// Array de libros disponibles (simulación de catálogo)
// Array de imágenes con caption const imagenes =
const libros = 
[   
   { 
      Json:'/Libros/data/cuento.json',
      src: "/Libros/Blade/Portada.png",
      caption: "Blade", 
      description: "Acompaña al principito en un viaje lleno de aventuras y enseñanzas." 
   },

   { 
     Json:'/Libros/data/DragonDelCielo.json',
     src: "/Libros/El-Dragon-de-las-Nubes/Portado.jpg",
     caption: "El Patito Feo", 
     description: "Descubre cómo un pequeño pato diferente encuentra su lugar en el mundo." 
   },

   { 
    Json:'/Libros/data/librs.json',
    src: "/Imagenes/Cuentos/Caperucita_roja.jpg", 
    caption: "Caperucita Roja", 
    description: "Sigue a Caperucita en el bosque y aprende sobre valentía y astucia." 
   }, 

   { 

    Json:'/Libros/data/cuento.json',
    src: "/Imagenes/Cuentos/Los_Tres_Cerditos.jpg",
    caption: "Los Tres Cerditos", 
    description: "Conoce a los tres cerditos y sus ingeniosas construcciones para protegerse del lobo."
   } 
  ];
interface BookData {
  pages: Page[];
  title?: string;
}

const MyBooks: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<{ json: string; caption: string } | null>(null);
  const [bookData, setBookData] = useState<BookData | null>(null);

  // Simulación de fetch
  useEffect(() => {
  if (selectedBook) {
    const fetchBook = async () => {
      try {
        // Siempre cargamos el mismo JSON
        const response = await fetch(selectedBook.json);
        const data: BookData = await response.json();
        setBookData(data);
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

          {/* Título principal */}
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
              shapeType={1}
              onClick={(book) => setSelectedBook({ json: book.Json ?? "", caption: book.caption })}
            />
          </div>
          
           {/* BANNER centrado para Juegos */}
            <div className="max-w-4xl mx-auto mb-12">
            <Link href="../../pages/pages-games">
              <img
                src="/Imagenes/Juega aqui.jpg"
                alt="Banner"
                className="w-150 h-auto rounded-lg shadow-md hover:scale-110 transition-transform duration-300"
              />
            </Link>
            <p className="text-center mt-2 text-lg text-pink-600 font-medium">
              ¡Haz clic y juega mientras aprendes! 🎮✨
            </p>
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
}

export default MyBooks;
