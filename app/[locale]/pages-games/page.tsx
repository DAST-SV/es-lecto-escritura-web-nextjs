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
    src: "/Imagenes/Secciones_juegos/Laberinto.jpg",
    alt: "Laberinto",
    route: "/pages-games/laberinto",
    description: "Encuentra la salida en emocionantes laberintos 🌀"
  },
  {
    src: "/Imagenes/Secciones_juegos/Colorea.jpg",
    alt: "Colorea",
    route: "/pages-games/coloreo",
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

      <div className="max-w-5xl mx-auto flex flex-col items-center gap-10">

        {/* 🔹 Primera fila — dos imágenes lado a lado */}
        <div className="flex justify-center gap-8 flex-wrap">
          {/* Rompecabezas */}
          <Link href="/pages-games/rompecabezas">
            <div className="bg-white rounded-2xl shadow-md hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden w-100">
              <img
                src="/Imagenes/Secciones_juegos/Rompe-cabezas.jpg"
                alt="Rompe Cabezas"
                className="w-full h-40 object-contain bg-white"
              />
              <div className="text-center p-2 bg-white">
                <h3 className="font-bold text-blue-800 text-lg">Rompe Cabezas</h3>
                <p className="text-sm text-sky-700">Ejercita tu mente resolviendo divertidos rompecabezas 🧩</p>
              </div>
            </div>
          </Link>

          {/* Laberinto */}
          <Link href="/pages-games/laberinto">
            <div className="bg-white rounded-2xl shadow-md hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden w-100">
              <img
                src="/Imagenes/Secciones_juegos/Laberinto.jpg"
                alt="Laberinto"
                className="w-full h-40 object-contain bg-white"
              />
              <div className="text-center p-2 bg-white">
                <h3 className="font-bold text-blue-800 text-lg">Laberinto</h3>
                <p className="text-sm text-sky-700">Encuentra la salida en emocionantes laberintos 🌀</p>
              </div>
            </div>
          </Link>
        </div>

        {/* 🔹 Segunda fila — imagen centrada */}
        <div className="flex justify-center">
          <Link href="/pages-games/coloreo">
            <div className="bg-white rounded-2xl shadow-md hover:scale-105 hover:shadow-2xl transition-all duration-300 overflow-hidden w-100">
              <img
                src="/Imagenes/Secciones_juegos/Colorea.jpg"
                alt="Colorea"
                className="w-full h-40 object-contain bg-white"
              />
              <div className="text-center p-2 bg-white">
                <h3 className="font-bold text-blue-800 text-lg">Colorea</h3>
                <p className="text-sm text-sky-700">Da rienda suelta a tu creatividad coloreando dibujos 🎨</p>
              </div>
            </div>
          </Link>
        </div>

      </div>





    </UnifiedLayout>
  );
};

export default SeccionJuegos;
