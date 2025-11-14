// /app/[locale]/library/page.tsx
"use client";

import React, { JSX, useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import Carousel from "@/src/utils/components/Carousel";
import CarouselLibros from "@/src/utils/components/CarouselLibros";
import { motion } from "framer-motion";
import { Trophy, BookOpen, Sparkles } from "lucide-react";

/* Imágenes */
import Cuentos from "@/public/Imagenes/explore-content/categorias/79c80681-ef41-4c3e-949b-34fcd3dc78b5.jpg";
import Fabulas from "@/public/Imagenes/explore-content/categorias/5edbfbf6-4768-481a-b301-39a00d1f2f2b.jpg";
import Poemas from "@/public/Imagenes/explore-content/categorias/65d2dbfa-d6f3-4187-8df2-ac6833d4904d.jpg";
import Leyendas from "@/public/Imagenes/explore-content/categorias/50c6a1f6-eac7-498c-9051-397ab4efe255.jpg";
import Historietas from "@/public/Imagenes/explore-content/categorias/a5ccc1f4-99db-4e23-ad79-ea7122e1e027.jpg";
import Refranes from "@/public/Imagenes/explore-content/categorias/5fb1ddb5-d22b-4d39-89fe-d070cafc9929.jpg";
import Novelas from "@/public/Imagenes/explore-content/categorias/8f70911b-4c6c-4e09-b382-00c0115c90d6.jpg";
import Historiasdemiabuelo from "@/public/Imagenes/explore-content/categorias/4b490074-ffda-40b7-88f2-2ade734d659b.jpg";

import Creatulibro from "@/public/Imagenes/explore-content/2d43332e-d758-4522-a557-3c190e53fb95.jpg";
import Mislibros from "@/public/Imagenes/explore-content/395e87e6-37fc-4a9f-8915-87c11a93caa7.jpg";
import Diariopersonal from "@/public/Imagenes/explore-content/b274a0a3-3a24-4f8f-8f48-ade72fb8394a.jpg";

import Caracoles from "@/public/Imagenes/explore-content/top10/04e5ba5c-10d1-4f6d-ac86-82b8a0ba59fc.jpg";
import Hamster from "@/public/Imagenes/explore-content/top10/52063d7e-8fd6-4f18-9ce2-d05abbb78fbb.jpg";
import Dragon from "@/public/Imagenes/explore-content/top10/9d6e7983-33e9-4192-af7c-80d5ce7186ae.jpg";
import Mascuentos from "@/public/Imagenes/explore-content/top10/assets_task_01k61vx6wwftbrtw2644gnfvhb_1758852016_img_1.webp";

/* Tipos */
interface ImageItem {
  caption: string;
  src: StaticImageData;
  Json?: string;
}

interface SectionTitleProps {
  icon: JSX.Element;
  title: string;
  subtitle?: string;
}

/* Componentes */
const SectionTitle: React.FC<SectionTitleProps> = ({ icon, title, subtitle }) => (
  <div className="text-center mb-8">
    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl border-4 border-yellow-300">
      {icon}
    </div>

    <h2
      className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4"
      style={{ fontFamily: "Comic Sans MS, cursive" }}
    >
      {title}
    </h2>

    {subtitle && (
      <p
        className="text-gray-700 text-sm md:text-base max-w-2xl mx-auto mt-2"
        style={{ fontFamily: "Comic Sans MS, cursive" }}
      >
        {subtitle}
      </p>
    )}
  </div>
);

const ExtraCard: React.FC<{ item: ImageItem; onClick?: () => void }> = ({ item, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
    className="group relative h-72 rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-300 bg-white/60 backdrop-blur-xl"
  >
    <div className="absolute inset-0">
      <Image src={item.src} alt={item.caption} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>

    <div className="absolute bottom-4 left-0 right-0 text-center">
      <p
        className="text-white font-semibold text-lg"
        style={{ fontFamily: "Comic Sans MS, cursive", textShadow: "0 2px 6px rgba(0,0,0,0.6)" }}
      >
        {item.caption}
      </p>
    </div>
  </motion.button>
);

const Page: React.FC = () => {
  const explorarContenido: ImageItem[] = [
    { caption: "Cuentos", src: Cuentos },
    { caption: "Fábulas", src: Fabulas },
    { caption: "Poemas", src: Poemas },
    { caption: "Leyendas", src: Leyendas },
    { caption: "Refranes", src: Refranes },
    { caption: "Historietas", src: Historietas },
    { caption: "Historias de mi abuelo", src: Historiasdemiabuelo },
    { caption: "Novelas", src: Novelas },
  ];

  const topLecturas: ImageItem[] = [
    { caption: "El Dragón de las Nubes", src: Dragon, Json: "/detalle-de-cuento" },
    { caption: "El Hámster Viajero", src: Hamster, Json: "/detalle-de-cuento" },
    { caption: "La Carrera de los Caracoles", src: Caracoles, Json: "/detalle-de-cuento" },
    { caption: "Más Cuentos", src: Mascuentos, Json: "/cuentos" },
  ];

  const extras: ImageItem[] = [
    { caption: "Crea tu Libro", src: Creatulibro },
    { caption: "Diario Personal", src: Diariopersonal },
    { caption: "Mis Libros", src: Mislibros },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = 3;

  /* Registrar secciones */
  useEffect(() => {
    if (!containerRef.current) return;
    sectionsRef.current = Array.from(containerRef.current.querySelectorAll("section"));
  }, []);

  /* Función de scroll con debounce */
  const scrollTo = (index: number) => {
    if (index < 0 || index >= total) return;
    const el = sectionsRef.current[index];
    if (el) {
      setActiveIndex(index);
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* CONTROLAR SCROLL DEL MOUSE */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isScrolling = false;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      isScrolling = true;

      if (e.deltaY > 0 && activeIndex < total - 1) {
        scrollTo(activeIndex + 1);
      } else if (e.deltaY < 0 && activeIndex > 0) {
        scrollTo(activeIndex - 1);
      }

      setTimeout(() => {
        isScrolling = false;
      }, 800);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [activeIndex, total]);

  /* CONTROLAR TECLADO ↑ ↓ 1 2 3 */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && activeIndex < total - 1) {
        e.preventDefault();
        scrollTo(activeIndex + 1);
      }
      if (e.key === "ArrowUp" && activeIndex > 0) {
        e.preventDefault();
        scrollTo(activeIndex - 1);
      }
      if (["1", "2", "3"].includes(e.key)) {
        const targetIndex = parseInt(e.key) - 1;
        if (targetIndex >= 0 && targetIndex < total) {
          scrollTo(targetIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, total]);

  return (
    <UnifiedLayout
      className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-cyan-200"
      mainClassName="pt-0"
      showNavbar
      brandName="Biblioteca"
    >
      <div ref={containerRef} className="h-[calc(100vh-60px)] overflow-hidden snap-y snap-mandatory">

        {/* SECTION 1 */}
        <section className="snap-start h-[calc(100vh-60px)] flex items-center justify-center px-6 py-10">
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-yellow-300 p-6 md:p-8 max-w-6xl">
              <SectionTitle
                icon={<Trophy className="w-14 h-14 text-yellow-500" />}
                title="Top 10 de Lecturas"
                subtitle="Los libros favoritos de todos"
              />
              <CarouselLibros images={topLecturas} itemsToShow={4} />
            </div>
          </motion.div>
        </section>

        {/* SECTION 2 */}
        <section className="snap-start h-[calc(100vh-60px)] flex items-center justify-center px-6 py-10">
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-blue-300 p-6 md:p-8 max-w-6xl">
              <SectionTitle
                icon={<BookOpen className="w-14 h-14 text-blue-600" />}
                title="Categorías"
                subtitle="Explora todos los géneros"
              />
              <Carousel images={explorarContenido} itemsToShow={4} />
            </div>
          </motion.div>
        </section>

        {/* SECTION 3 */}
        <section className="snap-start h-[calc(100vh-60px)] flex items-center justify-center px-6 py-10">
          <motion.div 
            initial={{ opacity: 0, y: 25 }} 
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-purple-300 p-6 md:p-8 max-w-5xl">
              <SectionTitle
                icon={<Sparkles className="w-14 h-14 text-purple-500" />}
                title="Extras"
                subtitle="Crea tu propia magia"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                {extras.map((item, i) => (
                  <ExtraCard key={i} item={item} />
                ))}
              </div>
            </div>
          </motion.div>
        </section>

      </div>

      {/* NAV LATERAL */}
      <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50" aria-label="Navegación de secciones">
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <button
                onClick={() => scrollTo(i)}
                aria-label={`Ir a sección ${i + 1}`}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeIndex === i
                    ? "scale-150 bg-yellow-400 ring-4 ring-yellow-300"
                    : "bg-white/70 ring-2 ring-white/40"
                }`}
              />
            </li>
          ))}
        </ul>
      </nav>
    </UnifiedLayout>
  );
};

export default Page;