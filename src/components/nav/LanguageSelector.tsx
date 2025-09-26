"use client"; 
// ✅ Esto le dice a Next.js que este componente se ejecuta en el cliente (no en el servidor).

import { useState, useEffect } from "react"; 
// ✅ useState y useEffect: hooks de React para manejar estado y efectos secundarios.
import { useLocale } from "next-intl"; 
// ✅ Hook de next-intl para obtener el idioma actual de la aplicación.
import { useRouter, usePathname } from "next/navigation"; 
// ✅ useRouter: permite navegar entre rutas en Next.js.
// ✅ usePathname: devuelve el path actual (ej: /es/auth/login).

// ✅ Interfaz para manejar idiomas con banderas
interface LanguageWithFlag {
  code: string;   // Código del idioma (ej: "es", "en")
  country: string; // Código del país usado para mostrar la bandera
}

// ✅ Diccionario de traducciones de rutas
const routeTranslations: Record<string, Record<string, string>> = {
  es: {
    "/auth/login": "/auth/ingresar",    // Si está en español, login se traduce a ingresar
    "/auth/register": "/auth/registro", // register → registro
  },
  en: {
    "/auth/ingresar": "/auth/login",    // Si está en inglés, ingresar → login
    "/auth/registro": "/auth/register", // registro → register
  },
};

const LanguageSelector: React.FC = () => {
  const locale = useLocale(); // ✅ Idioma actual (ejemplo: "es" o "en")
  const router = useRouter(); // ✅ Para navegar entre páginas
  const pathname = usePathname(); // ✅ Obtiene la URL actual sin el dominio (ej: "/es/auth/login")

  const [isOpen, setIsOpen] = useState(false); 
  // ✅ Estado local para saber si el menú desplegable de idiomas está abierto

  // ✅ Lista de idiomas soportados con sus banderas
  const languagesWithFlags: LanguageWithFlag[] = [
    { code: "es", country: "ES" }, // Español con bandera de España
    { code: "en", country: "US" }, // Inglés con bandera de Estados Unidos
  ];

  // ✅ Encuentra el idioma actual en la lista, o usa el primero como fallback
  const currentLang =
    languagesWithFlags.find((lang) => lang.code === locale) ||
    languagesWithFlags[0];

  // ✅ Función para cambiar idioma
  const handleLanguageChange = (langCode: string): void => {
    const segments = pathname.split("/"); 
    // Divide la ruta en segmentos, ej: "/es/auth/login" → ["", "es", "auth", "login"]

    const restOfPath = "/" + segments.slice(2).join("/"); 
    // Quita el idioma actual (primer segmento), queda solo "/auth/login"

    // ✅ Busca la traducción de la ruta en el nuevo idioma, si no existe, deja la misma
    const translatedPath =
      routeTranslations[langCode]?.[restOfPath] ?? restOfPath;

    // ✅ Construye la nueva ruta con el idioma y mantiene el hash (#)
    const newPath = `/${langCode}${translatedPath}${window.location.hash}`;

    // ✅ Navega a la nueva ruta sin perder el scroll actual
    router.push(newPath, { scroll: false });

    setIsOpen(false); // ✅ Cierra el menú
    document.documentElement.lang = langCode; // ✅ Cambia el atributo lang en <html>
  };

  // ✅ Alterna el menú de selección
  const toggleDropdown = (): void => setIsOpen((prev) => !prev);

  // ✅ Cierra el menú
  const closeDropdown = (): void => setIsOpen(false);

  // ✅ Hook para escuchar la tecla Escape y cerrar el menú
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Botón principal del selector de idioma */}
      <button
        onClick={toggleDropdown} // ✅ Al hacer clic abre/cierra el menú
        className="cursor-pointer w-9 h-9 rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110 flex items-center justify-center"
        type="button"
        aria-label={`Select language - Current: ${currentLang.code.toUpperCase()}`}
      >
        {/* ✅ Bandera del idioma actual */}
        <img
          src={`https://flagcdn.com/w40/${currentLang.country.toLowerCase()}.png`}
          alt={`${currentLang.country} flag`}
          className="w-6 h-4 rounded-sm object-cover"
          loading="lazy"
        />
      </button>

      {/* Dropdown con opciones de idioma */}
      {isOpen && (
        <>
          {/* Fondo transparente para cerrar el menú al hacer clic afuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          {/* Menú desplegable */}
          <div
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg overflow-hidden z-50 min-w-[85px]"
            role="menu"
            aria-label="Language options"
          >
            {/* ✅ Recorre la lista de idiomas */}
            {languagesWithFlags.map((lang) => (
              <button
                key={lang.code} // ✅ Clave única para React
                onClick={() => handleLanguageChange(lang.code)} // ✅ Cambia el idioma al seleccionar
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center space-x-3 ${
                  locale === lang.code ? "bg-blue-50" : "" // ✅ Marca el idioma actual
                }`}
                type="button"
                role="menuitem"
                aria-label={`Switch to ${lang.code.toUpperCase()}`}
              >
                {/* Bandera del idioma */}
                <img
                  src={`https://flagcdn.com/w40/${lang.country.toLowerCase()}.png`}
                  alt={`${lang.country} flag`}
                  className="w-5 h-3 rounded-sm object-cover"
                  loading="lazy"
                />
                {/* Código del idioma (EN, ES) */}
                <span className="text-sm font-medium text-gray-700">
                  {lang.code.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector; 
// ✅ Exporta el componente para poder usarlo en otras partes de la app