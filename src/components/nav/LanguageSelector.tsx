"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

interface LanguageWithFlag {
  code: string;   // Código del idioma (ej: 'es', 'en')
  country: string; // Código de país para la bandera
}

// 🔑 Mapa de traducciones de rutas
const routeTranslations: Record<string, Record<string, string>> = {
  es: {
    "/auth/login": "/auth/ingresar",
    "/auth/register": "/auth/registro",
  },
  en: {
    "/auth/ingresar": "/auth/login",
    "/auth/registro": "/auth/register",
  },
};

const LanguageSelector: React.FC = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const languagesWithFlags: LanguageWithFlag[] = [
    { code: "es", country: "ES" },
    { code: "en", country: "US" },
  ];

  const currentLang =
    languagesWithFlags.find((lang) => lang.code === locale) ||
    languagesWithFlags[0];

  const handleLanguageChange = (langCode: string): void => {
    const segments = pathname.split("/");
    const restOfPath = "/" + segments.slice(2).join("/"); // quita el locale actual

    // Buscar traducción de la ruta en el nuevo idioma
    const translatedPath =
      routeTranslations[langCode]?.[restOfPath] ?? restOfPath;

    // Construir la nueva URL
    const newPath = `/${langCode}${translatedPath}`;
    router.push(newPath); // ✅ solo string, no objeto

    setIsOpen(false);
    document.documentElement.lang = langCode;
  };

  const toggleDropdown = (): void => setIsOpen((prev) => !prev);
  const closeDropdown = (): void => setIsOpen(false);

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
      {/* Botón principal */}
      <button
        onClick={toggleDropdown}
        className="cursor-pointer w-9 h-9 rounded-full bg-white shadow-sm transition-transform duration-200 hover:scale-110 flex items-center justify-center"
        type="button"
        aria-label={`Select language - Current: ${currentLang.code.toUpperCase()}`}
      >
        <img
          src={`https://flagcdn.com/w40/${currentLang.country.toLowerCase()}.png`}
          alt={`${currentLang.country} flag`}
          className="w-6 h-4 rounded-sm object-cover"
          loading="lazy"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={closeDropdown}
            aria-hidden="true"
          />
          <div
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg overflow-hidden z-50 min-w-[85px]"
            role="menu"
            aria-label="Language options"
          >
            {languagesWithFlags.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center space-x-3 ${
                  locale === lang.code ? "bg-blue-50" : ""
                }`}
                type="button"
                role="menuitem"
                aria-label={`Switch to ${lang.code.toUpperCase()}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${lang.country.toLowerCase()}.png`}
                  alt={`${lang.country} flag`}
                  className="w-5 h-3 rounded-sm object-cover"
                  loading="lazy"
                />
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