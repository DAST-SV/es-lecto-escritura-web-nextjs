'use client'

import React from "react";
import Link from "next/link";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

interface Juego {
  src: string;
  alt: string;
  route: string;
  description: string;
}

const juegos: Juego[] = [
  { 
    src: "/Imagenes/Secciones_juegos/Rompe-cabezas.jpg", 
    alt: "Rompe Cabezas", 
    route: "/pages-games/rompecabezas",
    description: "Ejercita tu mente resolviendo divertidos rompecabezas 🧩"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Quizes.jpg", 
    alt: "Quizes", 
    route: "/pages/pages-games/quizes",
    description: "Pon a prueba tus conocimientos con quizzes interactivos 🎓"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Laberinto.jpg", 
    alt: "Laberinto", 
    route: "/pages/pages-games/laberinto",
    description: "Encuentra la salida en emocionantes laberintos 🌀"
  },
  { 
    src: "/Imagenes/Secciones_juegos/Colorea.jpg", 
    alt: "Colorea", 
    route: "/pages/pages-games/coloreo",
    description: "Da rienda suelta a tu creatividad coloreando dibujos 🎨"
  },
];

const SeccionJuegos: React.FC = () => {
  return (
    <UnifiedLayout className="flex flex-col min-h-screen bg-gradient-to-b from-sky-200 via-blue-100 to-yellow-100 relative overflow-hidden">

      {/* ✨ Fondo animado */}
      <div className="absolute inset-0 -z-10">
        {/* Nubes */}
        <div className="absolute top-10 left-[-20%] w-60 h-32 bg-white rounded-full blur-xl opacity-70 animate-cloud" />
        <div className="absolute top-1/3 left-[60%] w-72 h-40 bg-white rounded-full blur-2xl opacity-60 animate-cloud-slow" />
        <div className="absolute top-[60%] left-[-15%] w-48 h-28 bg-white rounded-full blur-xl opacity-70 animate-cloud" />
        {/* Estrellitas y globitos */}
        {Array.from({ length: 20 }).map((_, i) => (
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

      {/* Banner principal */}
      <div className="w-full mb-6">
        <img 
          src="/Imagenes/Seccion_de_juegos.jpg" 
          alt="Banner" 
          className="w-full max-h-72 h-auto shadow-lg rounded-b-2xl"
        />
      </div>

      {/* Título */}
      <h2 className="text-4xl font-extrabold text-center text-blue-800 drop-shadow-md mb-6">
        🎮 ¡Sala de Juegos Interactiva!
      </h2>
      <p className="text-center text-lg text-sky-600 mb-8">
        Diviértete, aprende y crea recuerdos mágicos con nuestros juegos ✨
      </p>

      {/* Grid de juegos */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {juegos.map((juego) => (
          <Link key={juego.alt} href={juego.route}>
            <div className="flex flex-col items-center bg-white rounded-2xl shadow-lg p-3 hover:scale-105 hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              {/* Animación de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 via-cyan-100 to-pink-100 opacity-30 rounded-2xl pointer-events-none animate-pulse-slow" />
              <img
                src={juego.src}
                alt={juego.alt}
                className="w-full h-48 object-cover rounded-lg mb-2 shadow-inner"
              />
              <h3 className="font-bold text-blue-800 text-lg">{juego.alt}</h3>
              <p className="text-sm text-sky-700 text-center">{juego.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </UnifiedLayout>
  );
};

export default SeccionJuegos;
