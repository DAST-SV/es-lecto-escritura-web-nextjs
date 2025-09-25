'use client'
import React from "react";
import Image from "next/image";
import ImageGrid, { ImageItem } from "@/src/utils/imagenes/ImageGrid";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";

// 🔹 Imports de imágenes
import fondo from "@/public/Imagenes/explore-content/Fondo.jpg";
import Cuentos from "@/public/Imagenes/explore-content/categorias/79c80681-ef41-4c3e-949b-34fcd3dc78b5.jpg";
import Fabulas from "@/public/Imagenes/explore-content/categorias/5edbfbf6-4768-481a-b301-39a00d1f2f2b.jpg";
import Poemas from "@/public/Imagenes/explore-content/categorias/65d2dbfa-d6f3-4187-8df2-ac6833d4904d.jpg";
import Leyendas from "@/public/Imagenes/explore-content/categorias/50c6a1f6-eac7-498c-9051-397ab4efe255.jpg";
import Adivinanzas from "@/public/Imagenes/explore-content/categorias/7ac87c2b-43ab-4940-9046-7fb9a4768325.jpg";
import Historietas from "@/public/Imagenes/explore-content/categorias/a5ccc1f4-99db-4e23-ad79-ea7122e1e027.jpg";
import Trabalenguas from "@/public/Imagenes/explore-content/categorias/136104fb-592f-44ef-a327-59724400f150.jpg";
import Refranes from "@/public/Imagenes/explore-content/categorias/5fb1ddb5-d22b-4d39-89fe-d070cafc9929.jpg";

import Creatulibro from "@/public/Imagenes/explore-content/2d43332e-d758-4522-a557-3c190e53fb95.jpg";
import Mislibros from "@/public/Imagenes/explore-content/395e87e6-37fc-4a9f-8915-87c11a93caa7.jpg";
import Diariopersonal from "@/public/Imagenes/explore-content/b274a0a3-3a24-4f8f-8f48-ade72fb8394a.jpg";

import Caracoles from "@/public/Imagenes/explore-content/top10/04e5ba5c-10d1-4f6d-ac86-82b8a0ba59fc.jpg";
import Hamster from "@/public/Imagenes/explore-content/top10/52063d7e-8fd6-4f18-9ce2-d05abbb78fbb.jpg";
import Dragon from "@/public/Imagenes/explore-content/top10/9d6e7983-33e9-4192-af7c-80d5ce7186ae.jpg";


const Page: React.FC = () => {
    const explorarContenido: ImageItem[] = [
        {
            caption: "Cuentos",
            component: <Image src={Cuentos} alt="Cuentos" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Fábulas",
            component: <Image src={Fabulas} alt="Fábulas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Poemas",
            component: <Image src={Poemas} alt="Poemas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Leyendas",
            component: <Image src={Leyendas} alt="Leyendas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Adivinanzas",
            component: <Image src={Adivinanzas} alt="Adivinanzas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Historietas",
            component: <Image src={Historietas} alt="Historietas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Trabalenguas",
            component: <Image src={Trabalenguas} alt="Trabalenguas" className="w-full h-auto object-cover" />,
        },
        {
            caption: "Refranes",
            component: <Image src={Refranes} alt="Refranes" className="w-full h-auto object-cover" />,
        },
    ];

    const topLecturas: ImageItem[] = [
        {
            caption: "El Dragón de las Nubes",
            component: <Image src={Dragon} alt="Dragón" width={400} height={300} className="w-full h-auto object-cover" />,
        },
        {
            caption: "El Hámster Viajero",
            component: <Image src={Hamster} alt="Hámster" width={400} height={300} className="w-full h-auto object-cover" />,
        },
        {
            caption: "La Carrera de los Caracoles Valientes",
            component: <Image src={Caracoles} alt="Caracoles" width={400} height={300} className="w-full h-auto object-cover" />,
        },
    ];

    const extras: ImageItem[] = [
        {
            caption: "Crea tu Libro",
            component: <Image src={Creatulibro} alt="Crea tu Libro" width={300} height={300} className="w-full h-auto object-cover" />,
        },
        {
            caption: "Diario Personal",
            component: <Image src={Diariopersonal} alt="Diario" width={300} height={300} className="w-full h-auto object-cover" />,
        },
        {
            caption: "Mis Libros",
            component: <Image src={Mislibros}alt="Mis Libros" width={300} height={300} className="w-full h-auto object-cover" />,
        },
    ];

    return (
     <UnifiedLayout className="relative flex flex-col min-h-screen overflow-hidden">
        <div className="p-6 space-y-10 bg-white">
            {/* Explorar Contenido con fondo */}
            <div
                className="rounded-2xl p-6 shadow-lg bg-cover bg-center"
                style={{
                    backgroundImage: `url(${fondo.src})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
            >
                <h2
                    style={{ fontFamily: "'Itim', cursive" }}
                    className="font-bold mb-4 text-center text-blue-600 text-5xl"
                >
                    Explorar Contenido
                </h2>

                <ImageGrid images={explorarContenido} columns={4} shapeType={2} captionColor="#ffffff"
                textBackgroundColor="#87CEEB" captionSize="text-2xl" descriptionSize="text-sm" />

            </div>

            {/* Top lecturas */}
            <div>
                <h2 className="text-5xl font-bold mb-4 text-center text-black font-">
                    Top 10 de Lecturas
                </h2>
                <ImageGrid images={topLecturas} columns={3} shapeType={1} />
            </div>

            {/* Extras */}
            <div>
                <ImageGrid images={extras} columns={3} shapeType={2} />
            </div>
        </div>
     </UnifiedLayout>
    );
};

export default Page;
