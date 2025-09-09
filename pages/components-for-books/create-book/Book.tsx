import React, { useState, useRef, useCallback, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { layouts } from "../layouts/index";
import { HtmlFontFamilies } from "@/../typings/types-page-book/HtmlFontFamilies";
import type { LayoutType, backgroundstype, HtmlFontFamiliestype } from "@/../typings/types-page-book/index";
import { backgrounds } from "@/../typings/types-page-book/backgrounds";
import { PageRenderer } from "../book/PageRenderer";
import type { Page } from "@/../typings/types-page-book/index";
import { FlipBook } from "../book/FlipBook"
// Tipos
interface page {
    id: string;
    layout: string;
    title?: string;
    text?: string;
    image?: string | null;
    background?: string | null;
    font?: string;
}

interface BookData {
    pages: Page[];
    title?: string;
}

interface PageRendererIndexProps {
    page: page;
    pageNumber: number;
}

// Conversor de `page` a `Page`
function convertPage(oldPage: page): Page {
    return {
        layout: oldPage.layout as LayoutType,
        title: oldPage.title,
        text: oldPage.text,
        image: oldPage.image ?? undefined,
        background: oldPage.background as backgroundstype,
        font: oldPage.font as HtmlFontFamiliestype,
        animation: undefined,
        audio: undefined,
        interactiveGame: undefined,
        items: [],
        border: undefined
    };
}

// ============= COMPONENTE RENDERIZADOR DE PÁGINA =============
const PageRendererIndex: React.FC<PageRendererIndexProps> = ({ page, pageNumber }) => {

    const Pagina = convertPage(page);
    return (
        <div className="w-full h-full relative overflow-hidden">
            {/* Overlay para mejorar legibilidad si hay imagen de fondo */}
            {page.background && page.background !== "blanco" && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "rgba(255, 255, 255, 0.1)" }}
                />
            )}

            {/* Contenido del layout */}
            <div className="relative z-10 h-full">
                <PageRenderer page={Pagina} />
            </div>

            {/* CAMBIO 1: Aumenté z-50 y bg-opacity-70 para que el número sea más visible */}
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-bold bg-black bg-opacity-70 text-white z-50">
                {pageNumber}
            </div>
        </div>
    );
};

// ============= COMPONENTE PRINCIPAL DEL LIBRO =============
export function Book() {
    const [pages, setpages] = useState<page[]>([
        {
            id: 'page-1',
            layout: 'CoverLayout',
            title: "Mi Libro Interactivo",
            text: "Una historia maravillosa comienza aquí...",
            image: null,
            background: 'Gradiente Azul',
            font: 'Georgia'
        },
        {
            id: 'page-2',
            layout: 'TextLeftImageRightLayout',
            title: "Capítulo 1",
            text: "Érase una vez en un reino muy lejano, donde las historias cobran vida...",
            image: null,
            background: null,
            font: 'Arial'
        },
    ]);

    const [currentpage, setCurrentpage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [bookKey, setBookKey] = useState(0);
    const [editingField, setEditingField] = useState<'title' | 'text' | null>(null);
    const [editingTitle, setEditingTitle] = useState("");
    const [editingText, setEditingText] = useState("");
    const [finalBookPages, setFinalBookPages] = useState<Page[] | null>(null);
    const bookRef = useRef<any>(null);

    // Sincronizar campos de edición con la página actual
    useEffect(() => {
        if (currentpage >= 0 && currentpage < pages.length) {
            setEditingTitle(pages[currentpage].title || "");
            setEditingText(pages[currentpage].text || "");
        }
    }, [currentpage, pages]);

    // Handlers para páginas
    const addpage = useCallback(() => {
        const newpageId = `page-${Date.now()}`;
        setpages(prev => [...prev, {
            id: newpageId,
            layout: 'FullpageLayout',
            title: `Página ${prev.length + 1}`,
            text: `Continúa tu historia aquí...`,
            image: null,
            background: null,
            font: 'Arial'
        }]);
    }, []);

    const deletepage = useCallback(() => {
        if (pages.length > 2) {
            setpages(prev => prev.filter((_, index) => index !== currentpage));
            if (currentpage > 0) setCurrentpage(currentpage - 1);
            setBookKey(prev => prev + 1);
        }
    }, [pages.length, currentpage]);

    // Handlers para edición
    const saveField = useCallback((field: 'title' | 'text') => {
        setpages(prev => {
            const updated = [...prev];
            if (field === 'title') {
                updated[currentpage] = { ...updated[currentpage], title: editingTitle };
            } else {
                updated[currentpage] = { ...updated[currentpage], text: editingText };
            }
            return updated;
        });
        setEditingField(null);
    }, [currentpage, editingTitle, editingText]);

    // Handler para layout
    const handleLayoutChange = useCallback((layout: string) => {
        setpages(prev => {
            const updated = [...prev];
            updated[currentpage] = { ...updated[currentpage], layout };
            return updated;
        });
        setBookKey(prev => prev + 1);
    }, [currentpage]);

    // Handler para imágenes
    const handleImageChange = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                // Limitamos la imagen a 800x800 (puedes ajustar)
                const dataUrl = await resizeImage(file, 800, 800);

                setpages(prev => {
                    const updated = [...prev];
                    updated[currentpage] = { ...updated[currentpage], image: dataUrl };
                    return updated;
                });
            } catch (error) {
                console.error("Error al procesar la imagen:", error);
            }
        },
        [currentpage]
    );

    const removeImage = useCallback(() => {
        setpages(prev => {
            const updated = [...prev];
            updated[currentpage] = { ...updated[currentpage], image: null };
            return updated;
        });
    }, [currentpage]);

    // Handlers para fondos
    const handleBackgroundChange = useCallback((value: string) => {
        setpages(prev => {
            const updated = [...prev];
            updated[currentpage] = {
                ...updated[currentpage],
                background: value || null
            };
            return updated;
        });
        setTimeout(() => setBookKey(prev => prev + 1), 50);
    }, [currentpage]);

    const handleBackgroundFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                handleBackgroundChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [handleBackgroundChange]);

    // Handler para fuentes
    const handleFontChange = useCallback((font: string) => {
        setpages(prev => {
            const updated = [...prev];
            updated[currentpage] = { ...updated[currentpage], font };
            return updated;
        });
    }, [currentpage]);

    // CAMBIO 2: Mejoré la navegación con try-catch y mejor validación
    const goTopage = useCallback((pageIndex: number) => {
        if (!isFlipping && bookRef.current && pageIndex >= 0 && pageIndex < pages.length) {
            setIsFlipping(true);
            const inputFileImg = document.getElementById("background_fileimg") as HTMLInputElement;
            const inputFileBackground = document.getElementById("background_filebackground") as HTMLInputElement;
            try {
                bookRef.current.pageFlip().flip(pageIndex);
                if (inputFileImg) {
                    const newInput = inputFileImg.cloneNode(true) as HTMLInputElement; // clona el nodo
                    inputFileImg.parentNode?.replaceChild(newInput, inputFileImg); // reemplaza el viejo
                }

                if (inputFileBackground) {
                    const newInput = inputFileBackground.cloneNode(true) as HTMLInputElement;
                    inputFileBackground.parentNode?.replaceChild(newInput, inputFileBackground);
                }
                setCurrentpage(pageIndex);
            } catch (error) {
                console.error("Error al cambiar de página:", error);
                setIsFlipping(false);
            }
            setTimeout(() => setIsFlipping(false), 1000);
        }
    }, [pages.length, isFlipping]);

    const nextpage = useCallback(() => {
        if (!isFlipping && currentpage < pages.length - 1) {
            goTopage(currentpage + 1);
        }
    }, [currentpage, pages.length, isFlipping, goTopage]);

    const prevpage = useCallback(() => {
        if (!isFlipping && currentpage > 0) {
            goTopage(currentpage - 1);
        }
    }, [currentpage, isFlipping, goTopage]);

    // CAMBIO 3: Agregué validación en onFlip para evitar índices fuera de rango
    const onFlip = useCallback((e: unknown) => {
        const ev = e as { data: number };
        // Validar que el índice está dentro del rango válido
        if (ev.data >= 0 && ev.data < pages.length) {
            setCurrentpage(ev.data);
            setEditingField(null);
        }
    }, [pages.length]);


    const createBookJson = useCallback(async () => {
        const convertedPages: Page[] = pages.map(p => convertPage(p));

        const bookObject: BookData = {
            pages: convertedPages,
            title: "Mi libro"
        };

        // Guardamos las páginas para renderizar FlipBook
        setFinalBookPages(bookObject.pages);

        // Convertimos a JSON
        const json = JSON.stringify(bookObject, null, 2);

        try {
            // 🔹 Petición POST al backend en C#
            const response = await fetch("https://localhost:44391/api/LibrosGuardado/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fileName: "mi_libro",   // 👈 Nombre con el que quieres guardarlo
                    jsonContent: json       // 👈 El contenido real del JSON
                })
            });

            if (!response.ok) {
                throw new Error("Error al guardar el libro");
            }

            const result = await response.json();
            console.log("✅ Libro guardado en backend:", result);
        } catch (error) {
            console.error("❌ Error guardando libro:", error);
        }

        // 🔹 (Opcional) También descargar el JSON en el cliente
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "mi_libro.json";
        link.click();
        URL.revokeObjectURL(url);
    }, [pages]);





    function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                if (!e.target?.result) return reject("No se pudo leer el archivo");
                img.src = e.target.result as string;
            };

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // Calculamos las proporciones para que la imagen no se distorsione
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("No se pudo obtener contexto del canvas");

                ctx.drawImage(img, 0, 0, width, height);
                // Convertimos a Base64 (JPEG con calidad 0.8)
                const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
                resolve(dataUrl);
            };

            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">

                {finalBookPages?.length ? (
                    <div className="mx-auto my-6 w-full h-full">
                        <div className="mt-8 flex justify-center">
                            <FlipBook pages={finalBookPages} width={400} height={600} />
                        </div>
                    </div>
                ) : null}

                {!finalBookPages && (
                    <>
                        {/* Panel de Control */}
                        <div className="lg:w-96 bg-white rounded-xl shadow-xl p-6 border border-gray-100 h-fit max-h-screen overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                                <span className="mr-2">📚</span> Editor de Libro
                            </h2>

                            {/* Selector de Layout */}
                            <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    🎨 Layout de página {currentpage + 1}:
                                </label>
                                <select
                                    value={pages[currentpage]?.layout}
                                    onChange={(e) => handleLayoutChange(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    {Object.keys(layouts).map(layoutName => (
                                        <option key={layoutName} value={layoutName}>
                                            {layoutName.replace(/Layout$/, '').replace(/([A-Z])/g, ' $1').trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Editor de título */}
                            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    📝 Título de página {currentpage + 1}:
                                </label>

                                {editingField === 'title' ? (
                                    <>
                                        <input
                                            type="text"
                                            value={editingTitle}
                                            onChange={(e) => setEditingTitle(e.target.value)}
                                            className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500"
                                            placeholder="Escribe el título aquí..."
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => saveField('title')}
                                                className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                            >
                                                ✅ Guardar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingTitle(pages[currentpage].title || "");
                                                    setEditingField(null);
                                                }}
                                                className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3">
                                            <p className="text-sm text-gray-700">
                                                {pages[currentpage].title || "Sin título"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setEditingField('title')}
                                            className="w-full p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
                                        >
                                            ✏ Editar Título
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Editor de texto */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    ✏ Texto de página {currentpage + 1}:
                                </label>

                                {editingField === 'text' ? (
                                    <>
                                        <textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="w-full p-3 border-2 border-blue-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                                            rows={6}
                                            placeholder="Escribe tu texto aquí..."
                                        />
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => saveField('text')}
                                                className="flex-1 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                            >
                                                ✅ Guardar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingText(pages[currentpage].text || "");
                                                    setEditingField(null);
                                                }}
                                                className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                                            >
                                                ❌ Cancelar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <div className="p-3 bg-white rounded-lg border border-gray-200 mb-3 max-h-24 overflow-auto">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                                {pages[currentpage].text || "Sin texto"}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setEditingField('text')}
                                            className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                        >
                                            📝 Editar Texto
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Control de imagen */}
                            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    🖼 Imagen de página {currentpage + 1}:
                                </label>

                                <input
                                    key={currentpage + "-img"} // forzamos un nuevo input al cambiar de página
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer mb-3"
                                />

                                {pages[currentpage]?.image && (
                                    <button
                                        onClick={removeImage}
                                        className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                                    >
                                        🗑 Quitar Imagen
                                    </button>
                                )}
                            </div>

                            {/* Control de fondo */}
                            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    🎨 Fondo de página {currentpage + 1}:
                                </label>

                                <select
                                    value={pages[currentpage]?.background || ""}
                                    onChange={(e) => handleBackgroundChange(e.target.value)}
                                    className="w-full mb-3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sin fondo (blanco)</option>
                                    {Object.keys(backgrounds).filter(k => k !== 'blanco').map(key => (
                                        <option key={key} value={key}>{key}</option>
                                    ))}
                                </select>

                                <input
                                    key={currentpage + "-background"} // forzamos un nuevo input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleBackgroundFile}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer mb-3"
                                />

                                {pages[currentpage]?.background && (
                                    <button
                                        onClick={() => handleBackgroundChange("")}
                                        className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                                    >
                                        🗑 Quitar Fondo
                                    </button>
                                )}
                            </div>

                            {/* Control de fuente */}
                            <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    🔤 Fuente de página {currentpage + 1}:
                                </label>

                                <select
                                    value={pages[currentpage]?.font || "Arial"}
                                    onChange={(e) => handleFontChange(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                >
                                    {Object.keys(HtmlFontFamilies).map(fontName => (
                                        <option key={fontName} value={fontName}>{fontName}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={createBookJson}
                                className="w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 font-medium transition-all mt-2"
                            >
                                📖 Crear Libro
                            </button>

                            {/* Navegación y control de páginas */}
                            <div className="space-y-3 pt-4">
                                <select
                                    value={currentpage}
                                    onChange={(e) => goTopage(parseInt(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    disabled={isFlipping}
                                >
                                    {pages.map((_, index) => (
                                        <option key={index} value={index}>
                                            Página {index + 1}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex gap-2">
                                    <button
                                        onClick={prevpage}
                                        disabled={currentpage === 0 || isFlipping}
                                        className="flex-1 p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all"
                                    >
                                        ⬅ Anterior
                                    </button>
                                    <button
                                        onClick={nextpage}
                                        disabled={currentpage === pages.length - 1 || isFlipping}
                                        className="flex-1 p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium transition-all"
                                    >
                                        Siguiente ➡
                                    </button>
                                </div>

                                <button
                                    onClick={addpage}
                                    className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium transition-all"
                                >
                                    ➕ Agregar Página Nueva
                                </button>

                                {pages.length > 2 && (
                                    <button
                                        onClick={deletepage}
                                        className="w-full p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium transition-all"
                                    >
                                        🗑 Eliminar Página Actual
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Libro */}
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <div className="bg-white rounded-xl shadow-2xl p-4">
                                <HTMLFlipBook
                                    key={bookKey}
                                    width={400}
                                    height={600}
                                    className="shadow-2xl"
                                    style={{ borderRadius: '12px' }}
                                    ref={bookRef}
                                    onFlip={onFlip}
                                    drawShadow={true}
                                    flippingTime={1000}
                                    usePortrait={false}
                                    startPage={Math.min(currentpage)}
                                    startZIndex={0}
                                    autoSize={false}
                                    maxShadowOpacity={0.5}
                                    showCover={true}
                                    mobileScrollSupport={false}
                                    clickEventForward={false}
                                    useMouseEvents={true}
                                    swipeDistance={30}
                                    disableFlipByClick={false}
                                    size="stretch"
                                    minWidth={400}
                                    maxWidth={400}
                                    minHeight={600}
                                    maxHeight={600}
                                >
                                    {pages.map((page, index) => (
                                        <div key={page.id} className="bg-white">
                                            <PageRendererIndex page={page} pageNumber={index + 1} />
                                        </div>
                                    ))}
                                </HTMLFlipBook>
                            </div>

                            {/* Indicadores de página */}
                            <div className="mt-6 flex gap-2">
                                {pages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goTopage(index)}
                                        disabled={isFlipping}
                                        className={`h-3 rounded-full transition-all ${currentpage === index
                                            ? "bg-indigo-600 w-8"
                                            : "bg-gray-300 hover:bg-gray-400 w-3"
                                            }`}
                                        title={`Ir a página ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Instrucciones */}
                            <div className="mt-4 text-center text-sm text-gray-600 bg-white rounded-lg p-4 shadow max-w-md">
                                <p className="font-semibold mb-2">💡 Instrucciones:</p>
                                <ul className="text-left space-y-1">
                                    <li>• Selecciona diferentes layouts para cada página</li>
                                    <li>• Edita título y texto por separado</li>
                                    <li>• Agrega imágenes y fondos personalizados</li>
                                    <li>• Cambia la fuente de cada página</li>
                                    <li>• Navega con los botones o haciendo clic en las páginas</li>
                                </ul>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
export default Book;