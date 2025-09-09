'use client'


import React, { useState } from "react";
import ImageGrid from "@/utils/imagenes/ImageGrid";
import MazeGame from "../../games/laberinto/MazeGame"; // Reemplazamos MiniLaberinto por MazeGame

interface ImagenConDescripcion {
  src: string;
  caption: string;
  description: string;
}

const imagenes: ImagenConDescripcion[] = [
  { src: "/Imagenes/Secciones_juegos/Laberinto/Cerditos.jpg", caption: "Los tres cerditos", description: "Ayuda a los tres cerditos a escapar del lobo en este laberinto." },
  { src: "/Imagenes/Secciones_juegos/Laberinto/Caperucita.jpg", caption: "Caperucita Roja", description: "Acompaña a Caperucita y encuentra la salida del bosque." }
];

const imagenes2: ImagenConDescripcion[] = [
  { src: "/Imagenes/Secciones_juegos/Laberinto/washington.jpg", caption: "Washington", description: "Explora la ciudad y encuentra la salida del laberinto urbano." },
  { src: "/Imagenes/Secciones_juegos/Laberinto/Principito.jpg", caption: "El Principito", description: "Guía al principito a través de planetas y laberintos mágicos." },
  { src: "/Imagenes/Secciones_juegos/Laberinto/Patito.jpg", caption: "Patito", description: "Ayuda al patito a encontrar su camino de regreso al lago." },
  { src: "/Imagenes/Secciones_juegos/Laberinto/hanzel y gretel.jpg", caption: "Hanzel y Gretel", description: "Encuentra la salida antes de que la bruja los atrape." }
];

const Laberinto: React.FC = () => {
  const [juegoActivo, setJuegoActivo] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 via-yellow-100 to-pink-100">
      {/* Banner */}
      <div className="w-300 mx-auto mb-6">
        <img 
          src="/Imagenes/Secciones_juegos/Laberinto/Banner.jpg" 
          alt="Banner" 
          className="w-full max-h-85 h-auto shadow-lg rounded-b-xl"
        />
      </div>

      <h2 className="text-5xl text-center font-extrabold my-4 text-purple-700 drop-shadow-lg">
        Laberintos
      </h2>
      <h3 className="text-3xl text-center font-medium my-4 text-pink-600">
        ¡Encuentra la salida!
      </h3>

      {/* Mostrar MazeGame si hay juego activo */}
      {juegoActivo && (
        <div className="mx-auto my-6">
        <MazeGame Id={1} />
          <button 
            onClick={() => setJuegoActivo(null)} 
            className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Cerrar Laberinto
          </button>
        </div>
      )}

      {/* GALERÍA */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <ImageGrid images={imagenes} shapeType={2} onClick={(img) => setJuegoActivo(img.caption)} />
        <h3 className="text-3xl text-center font-bold my-6 text-blue-700">
          ¡Los laberintos más jugados!
        </h3>
        <ImageGrid images={imagenes2} shapeType={2} onClick={(img) => setJuegoActivo(img.caption)} />
      </div>
    </div>
  );
};

export default Laberinto;
