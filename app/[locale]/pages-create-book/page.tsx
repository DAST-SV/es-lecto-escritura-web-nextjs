"use client";

import React from "react";
import Link from "next/link";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";

const CreateBook: React.FC = () => {
  const acciones: ImageItem[] = [
    { src: "/Imagenes/create-libros/creatulibro.png", caption: "Crea tu libro",Json: "/es/interfaz-create-book" },
    { src: "/Imagenes/create-libros/editatuslibros.png", caption: "Edita tus libros" },
  ];

  const acciones3: ImageItem[] = [
    { src: "/Imagenes/create-libros/papelera.png", caption: "Papelera" },
  ];

  const guardarIdeas: ImageItem[] = [
    { src: "/Imagenes/create-libros/guardatusideas.png", caption: "Guarda tus ideas" },
    { src: "/Imagenes/create-libros/guardatusimagenes.png", caption: "Guarda tus imágenes" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100 px-4 py-8 flex flex-col items-center space-y-6">

      {/* Banner principal */}
      <div className="bg-teal-400 rounded-xl w-full max-w-2xl p-4 flex flex-col items-center text-center space-y-2">
        <h1 className="text-lg sm:text-xl font-bold text-white">Crea tu libro</h1>
        <p className="text-white text-xs sm:text-sm">¡Personaliza y crea tu propia historia!</p>
        <Link href="/es/interfaz-create-book">
          <button className="bg-orange-500 text-white px-3 py-1 rounded-lg hover:bg-orange-600 text-xs sm:text-sm transition">
            Empezar
          </button>
        </Link>
      </div>

      {/* Primera sección: fila de 2 imágenes */}
      <ImageGrid
        images={acciones}
        shapeType={3}
        onClick={(img) =>
          window.location.href = `${img.Json?.toLowerCase().replace(/\s/g, "")}`
        }
      />

      {/* Segunda sección: 1 imagen */}
      <ImageGrid
        images={acciones3}
        shapeType={3}
        onClick={() => window.location.href = "/crear-libro/papelera"}
      />

      {/* Tercera sección: fila de 2 imágenes */}
      <ImageGrid
        images={guardarIdeas}
        shapeType={3}
        onClick={(img) => console.log(img.caption)}
      />

      {/* Botón de regreso */}
      <div className="w-full max-w-xl flex justify-center mt-4">
        <Link href="/menu-lectoescritura">
          <button className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500 text-xs sm:text-sm transition">
            Regresar al menú de LECTOESCRITURA
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CreateBook;
