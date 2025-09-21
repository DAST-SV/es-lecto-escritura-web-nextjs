'use client'

import React, { useState } from "react";
import ImageGrid from "@/src/utils/imagenes/ImageGrid";
import MazeGame from "@/src/components/games/laberinto/MazeGame";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

interface ImagenConDescripcion {
  src: string;
  caption: string;
  description: string;
}

const imagenes: ImagenConDescripcion[] = [
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/Cerditos.jpg",
    caption: "Los tres cerditos",
    description: "Ayuda a los tres cerditos a escapar del lobo en este laberinto.",
  },
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/Caperucita.jpg",
    caption: "Caperucita Roja",
    description: "Acompaña a Caperucita y encuentra la salida del bosque.",
  },
];

const imagenes2: ImagenConDescripcion[] = [
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/washington.jpg",
    caption: "Washington",
    description: "Explora la ciudad y encuentra la salida del laberinto urbano.",
  },
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/Principito.jpg",
    caption: "El Principito",
    description: "Guía al principito a través de planetas y laberintos mágicos.",
  },
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/Patito.jpg",
    caption: "Patito",
    description: "Ayuda al patito a encontrar su camino de regreso al lago.",
  },
  {
    src: "/Imagenes/Secciones_juegos/Laberinto/hanzel y gretel.jpg",
    caption: "Hanzel y Gretel",
    description: "Encuentra la salida antes de que la bruja los atrape.",
  },
];

const Laberinto: React.FC = () => {
  const [juegoActivo, setJuegoActivo] = useState<string | null>(null);

  // Si hay un juego activo, mostrar solo el juego en pantalla completa
  if (juegoActivo) {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <MazeGame Id={1} />
        {/* Botón de cerrar flotante */}
        <button
          onClick={() => setJuegoActivo(null)}
          className="fixed top-4 left-4 z-[60] px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors duration-200 font-semibold"
          style={{ touchAction: 'manipulation' }}
        >
          ← Salir
        </button>
      </div>
    );
  }

  return (
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 via-yellow-100 to-pink-100">
      {/* Banner */}
      <div className="w-full max-w-5xl mx-auto mb-6 px-2 sm:px-4">
        <img
          src="/Imagenes/Secciones_juegos/Laberinto/Banner.jpg"
          alt="Banner"
          className="w-full max-h-[400px] h-auto object-cover shadow-lg rounded-b-xl"
        />
      </div>

      {/* Títulos */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl text-center font-extrabold my-4 text-purple-700 drop-shadow-lg">
        Laberintos
      </h2>
      <h3 className="text-xl sm:text-2xl lg:text-3xl text-center font-medium my-4 text-pink-600">
        ¡Encuentra la salida!
      </h3>

      {/* Galería */}
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mb-12">
        <ImageGrid
          images={imagenes}
          shapeType={2}
          onClick={(img) => setJuegoActivo(img.caption)}
        />

        <h3 className="text-2xl sm:text-3xl lg:text-4xl text-center font-bold my-6 text-blue-700">
          ¡Los laberintos más jugados!
        </h3>

        <ImageGrid
          images={imagenes2}
          shapeType={2}
          onClick={(img) => setJuegoActivo(img.caption)}
        />
      </div>
    </UnifiedLayout>
  );
};

export default Laberinto;