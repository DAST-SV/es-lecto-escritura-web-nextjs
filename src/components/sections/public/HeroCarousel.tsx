"use client";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen, Zap, Award } from "lucide-react";
import UnifiedLayout from "@/src/components/nav/UnifiedLayout";
import { eslectoescriturav1, cuentosv1, fabulasv1, poemasv1, leyendasv1, adivinanzasv1, historietasv1, trabalenguasv1 } from "@/public/images";


const slides = [
    {
        title: "ESLectoescritura",
        icon: "🌟",
        description: "Aprender a leer y escribir nunca fue tan divertido. Explora cuentos, fábulas, poemas y más, mientras juegas, avanzas de nivel y ganas recompensas por tu esfuerzo. ¡Una plataforma hecha para estudiantes, familias y docentes que creen en el poder de la lectura!",
        image: eslectoescriturav1,
        button: "Comenzar Aventura",
    },
    {
        title: "Cuentos",
        icon: "📖",
        description: "Sumérgete en un mundo de aventuras, magia y personajes inolvidables. Los cuentos te invitan a imaginar, soñar y aprender mientras disfrutas cada página.",
        image: cuentosv1,
        button: "Explorar Cuentos",
    },
    {
        title: "Fábulas",
        icon: "🦊",
        description: "Historias breves con grandes enseñanzas. Las fábulas, a través de animales y situaciones divertidas, transmiten valores que nunca olvidarás.",
        image: fabulasv1,
        button: "Descubrir Fábulas",
    },
    {
        title: "Poemas",
        icon: "✒️",
        description: "Deja que las palabras cobren vida en versos llenos de ritmo, emoción y belleza. La poesía te invita a sentir y soñar.",
        image: poemasv1,
        button: "Leer Poemas",
    },
    {
        title: "Leyendas",
        icon: "🏞️",
        description: "Descubre los relatos que forman parte de nuestra historia y cultura. Las leyendas guardan misterios, tradiciones y aprendizajes únicos.",
        image: leyendasv1,
        button: "Conocer Leyendas",
    },
    {
        title: "Adivinanzas",
        icon: "❓",
        description: "Pon a prueba tu ingenio con divertidos acertijos que desafiarán tu mente y harán volar tu imaginación.",
        image: adivinanzasv1,
        button: "Resolver Adivinanzas",
    },
    {
        title: "Historietas",
        icon: "💬",
        description: "Historias ilustradas llenas de color y diversión. Aprende y ríe mientras acompañas a personajes únicos en sus aventuras.",
        image: historietasv1,
        button: "Ver Historietas",
    },
    {
        title: "Trabalenguas",
        icon: "👅",
        description: "Reta tu pronunciación y diviértete jugando con palabras. ¡Entre más rápido lo intentes, más divertido será!",
        image: trabalenguasv1,
        button: "Practicar Trabalenguas",
    },
    {
        title: "Refranes",
        icon: "🗣️",
        description: "Pequeñas frases con grandes verdades. Los refranes encierran la sabiduría de generaciones en pocas palabras.",
        image: trabalenguasv1,
        button: "Aprender Refranes",
    },
];

// Componente TabsSection con nueva paleta
const TabsSection = () => {
    const [activeTab, setActiveTab] = useState('personalized');

    const tabs = [
        {
            id: 'personalized',
            label: 'Atención Personalizada',
            title: 'Atención Personalizada',
            content: 'Entendemos que cada estudiante es único. Ofrecemos soluciones educativas personalizadas que se adaptan a las necesidades individuales de aprendizaje de cada alumno.',
            icon: BookOpen,
            image: eslectoescriturav1
        },
        {
            id: 'simplified',
            label: 'Proceso Simplificado',
            title: 'Proceso Simplificado',
            content: 'Nuestro proceso de aprendizaje es sencillo y efectivo, diseñado para minimizar la complejidad y maximizar el tiempo de comprensión lectora.',
            icon: Zap,
            image: eslectoescriturav1
        },
        {
            id: 'flexibility',
            label: 'Flexibilidad y Transparencia',
            title: 'Flexibilidad y Transparencia',
            content: 'Ofrecemos horarios flexibles y nos esforzamos por mantener una comunicación clara y transparente con padres y educadores sobre el progreso de cada estudiante.',
            icon: Award,
            image: eslectoescriturav1
        }
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <section className="py-16 px-8 md:px-16 bg-gray-50 relative overflow-hidden">
            {/* Formas decorativas de fondo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <svg className="absolute -left-20 top-10 text-blue-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
                    <path d="M-50 50C-50 100 0 150 50 150C100 150 150 200 150 250C150 300 100 350 50 350"
                        stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
                <svg className="absolute -right-20 bottom-10 text-orange-100" width="200" height="400" viewBox="0 0 200 400" fill="none">
                    <path d="M250 350C250 300 200 250 150 250C100 250 50 200 50 150C50 100 100 50 150 50"
                        stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                </svg>
            </div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div className="text-center mb-12">
                    <p className="text-blue-600 text-sm font-bold uppercase tracking-wide mb-3">
                        QUE NOS DIFERENCIA DE LOS DEMÁS
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                        Porque EslectoEscritura es diferente que otras plataformas educativas
                    </h2>
                </div>

                {/* Tabs Navigation */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md'
                                    }`}
                            >
                                <IconComponent className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        {/* Content */}
                        <div className="order-2 lg:order-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                                {activeTabData?.title}
                            </h3>
                            <div className="text-gray-600 text-lg leading-relaxed">
                                <p>{activeTabData?.content}</p>
                            </div>
                            <div className="mt-8">
                                <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-8 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                    Conoce Más
                                </button>
                            </div>
                        </div>

                        {/* Image */}
                        <div className="order-1 lg:order-2 text-center">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-2xl transform rotate-3 opacity-20"></div>
                                <Image
                                    src={activeTabData?.image || '/hero/slide1.png'}
                                    alt={activeTabData?.title || ''}
                                    width={400}
                                    height={320}
                                    className="relative w-full max-w-md mx-auto h-80 object-fill rounded-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">1000+</h4>
                        <p className="text-gray-600">Estudiantes Activos</p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">95%</h4>
                        <p className="text-gray-600">Mejora en Comprensión</p>
                    </div>

                    <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">50+</h4>
                        <p className="text-gray-600">Instituciones Aliadas</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function HeroCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        skipSnaps: false,
        dragFree: false
    });
    const [selected, setSelected] = useState(0);

    // Auto-play functionality
    useEffect(() => {
        if (!emblaApi) return;

        const autoPlay = setInterval(() => {
            emblaApi.scrollNext();
        }, 5000);

        return () => clearInterval(autoPlay);
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        onSelect();

        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((i: number) => emblaApi && emblaApi.scrollTo(i), [emblaApi]);

    return (
        <UnifiedLayout className="bg-ba bg-gradient-to-r bg-[#39cffd] " mainClassName="pt-0">
            {/* Carousel Section - 100vh menos navbar */}
            <div className="relative h-[calc(100vh-56px)] overflow-hidden">
                <div className={`bg-[url('/images/a076a7e2c35970e29ff54ba0759f8ae275ffd8fda1fa6a500879f473aef9896b.webp')] bg-cover bg-center embla h-full`} ref={emblaRef}>
                    <div className="embla__container flex h-full">
                        {slides.map((slide, i) => (
                            <div
                                key={i}
                                className="embla__slide w-full flex-shrink-0 h-full"
                            >
                                <div className="w-full flex items-center px-6 md:px-16 py-10">
                                    {/* Contenido Desktop */}
                                    <div className="hidden md:flex w-full h-full items-center">
                                        {/* Texto */}
                                        <div className="w-1/2 pr-8 text-slate-800 flex flex-col justify-center">
                                            <div className="flex items-center mb-6">
                                                <span className="text-6xl mr-6 drop-shadow-lg">{slide.icon}</span>
                                                <h2 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 drop-shadow-sm">
                                                    {slide.title}
                                                </h2>
                                            </div>
                                            <p className="text-xl leading-relaxed font-medium mb-8 text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg border-l-4 border-slate-800">
                                                "{slide.description}"
                                            </p>
                                            <button className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-105 w-fit text-lg border-2 border-slate-600 hover:border-slate-500">
                                                {slide.button}
                                            </button>
                                        </div>

                                        {/* Imagen */}
                                        <div className="w-1/2 flex justify-center items-center">
                                            <div className="relative">
                                                <Image
                                                    src={slide.image}
                                                    alt={slide.title}
                                                    width={500}
                                                    height={500}
                                                    className="rounded-2xl object-fill max-h-[70vh] shadow-2xl"
                                                    priority={i === 0}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contenido Mobile */}
                                    <div className="md:hidden w-full h-full flex flex-col justify-center items-center text-slate-800 text-center px-4">
                                        <div className="flex items-center justify-center mb-6">
                                            <span className="text-5xl mr-4 drop-shadow-lg">{slide.icon}</span>
                                            <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm">
                                                {slide.title}
                                            </h2>
                                        </div>

                                        <div className="mb-6">
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                width={320}
                                                height={320}
                                                className="rounded-xl object-fill shadow-2xl"
                                                priority={i === 0}
                                            />
                                        </div>

                                        <p className="text-base leading-relaxed font-medium mb-6 max-w-md text-slate-700 bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                                            "{slide.description}"
                                        </p>

                                        <button className="bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold px-6 py-3 rounded-lg shadow-2xl border-2 border-slate-600">
                                            {slide.button}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controles del carousel */}
                <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-colors z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/80 hover:bg-slate-700/90 p-3 rounded-full transition-colors z-20 backdrop-blur-sm shadow-xl border-2 border-slate-600"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            className={`w-4 h-4 rounded-full transition-all duration-300 border-2 ${selected === i 
                                ? "bg-slate-800 border-slate-600 scale-125 shadow-lg" 
                                : "bg-white/70 border-slate-800/50 hover:bg-white hover:border-slate-600"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Sección de Tabs */}
            <TabsSection />

            {/* Call to Action Section */}
            <section className="py-16 px-8 md:px-16 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="max-w-4xl mx-auto text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                        ¿Listo para transformar la lectura?
                    </h3>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Únete a miles de educadores que ya están mejorando la comprensión lectora de sus estudiantes.
                    </p>
                    <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold px-10 py-4 rounded-xl shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 text-lg">
                        Comenzar Ahora
                    </button>
                </div>
            </section>

            <style jsx global>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
        }
      `}</style>
        </UnifiedLayout>
    );
}