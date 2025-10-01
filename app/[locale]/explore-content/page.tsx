'use client'
import React from "react";
import Image from "next/image";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
import Carousel from "@/src/utils/components/Carousel"; // 🔹 Ajusta la ruta según tu estructura
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// 🔹 Imports de imágenes
import fondo from "@/public/Imagenes/explore-content/Fondo.jpg";
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
import Mascuentos from "@/public/Imagenes/explore-content/top10/assets_task_01k61vx6wwftbrtw2644gnfvhb_1758852016_img_1.webp"; // 🔹 Ajusta la ruta según tu imagen

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
    { caption: "La Carrera de los Caracoles Valientes", src: Caracoles, Json: "/detalle-de-cuento" },
    { caption: "El Dragón de las Nubes 2", src: Dragon, Json: "/detalle-de-cuento" },
    { caption: "El Hámster Viajero 2", src: Hamster, Json: "/detalle-de-cuento" },
    { caption: "La Carrera de los Caracoles Valientes 2", src: Caracoles, Json: "/detalle-de-cuento" },
    { caption: "Mas Cuentos", src: Mascuentos, Json: "/cuentos" },
  ];

  const extras: ImageItem[] = [
    { caption: "Crea tu Libro", src: Creatulibro },
    { caption: "Diario Personal", src: Diariopersonal },
    { caption: "Mis Libros", src: Mislibros },
  ];

  // 🔹 Función para manejar clicks en el carrusel
  const handleCarouselClick = (img: ImageItem, index: number) => {
    console.log('Clicked on:', img.caption, 'at index:', index);
    
    // 🔹 Usar la ruta definida en Json o una ruta por defecto
    const targetRoute = img.Json || "/detalle-de-cuento";
    
    // 🔹 Redirigir usando Next.js router o window.location
    window.location.href = targetRoute;
    
    // 🔹 Alternativa con Next.js router (descomenta si prefieres esta opción):
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push(targetRoute);
  };

  return (
    <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden">
      <div className="px-10 py-6 space-y-16 bg-white">
        {/* Explorar Contenido con fondo */}
        <div
          className="rounded-xl p-4 shadow-md bg-cover bg-center"
          style={{
            backgroundImage: `url(${fondo.src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        >
          <h2
            style={{ fontFamily: "'Itim', cursive" }}
            className="font-bold mb-4 text-center text-blue-600 text-4xl"
          >
            Explorar Contenido
          </h2>

          <ImageGrid
            images={explorarContenido}
            columns={4}
            shapeType={2}
            captionColor="#ffffff"
            textBackgroundColor="#87CEEB"
            aspectRatio="2/2"
            captionSize="text-2xl"
            descriptionSize="text-sm"
          />
        </div>

        {/* 🔹 Top lecturas con CARRUSEL GENÉRICO */}
        <div className="rounded-xl p-6 shadow-md bg-white">
          <h2 className="text-3xl font-bold mb-6 text-center text-black">
            Top 10 de Lecturas
          </h2>
          
          <Carousel
            images={topLecturas}
            itemsToShow={4}
            aspectRatio="3/4"
            onClick={handleCarouselClick}
            showIndicators={true}
            showArrows={true}
            gap="gap-4"
          />
        </div>

        {/* 🔹 Ejemplo adicional: Carrusel de extras con configuración diferente */}
        <div className="rounded-xl p-6 shadow-md bg-gradient-to-r from-purple-100 to-pink-100">
          <h2 className="text-2xl font-bold mb-4 text-center text-purple-800">
            Herramientas Creativas
          </h2>
          
          <Carousel
            images={extras}
            itemsToShow={3}
            aspectRatio="4/5"
            onClick={(img, index) => {
              console.log('Extra clicked:', img.caption);
              alert(`Clicked: ${img.caption}`);
            }}
            showIndicators={false}
            showArrows={true}
            gap="gap-6"
          />
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default Page;