// ============================================================================
// src/presentation/features/navigation/components/LanguageSelector/LanguageSelector.tsx
// ============================================================================
"use client";

import { useLanguage } from '../../hooks/useLanguage';
import { LanguageWithFlag } from '../../types/navigation.types';

const LanguageSelector: React.FC = () => {
  const { currentLocale, isOpen, setIsOpen, changeLanguage } = useLanguage();

  const languagesWithFlags: LanguageWithFlag[] = [
    { code: "es", country: "ES" },
    { code: "en", country: "US" },
  ];

  const currentLang = languagesWithFlags.find((lang) => lang.code === currentLocale.code) || languagesWithFlags[0];

  const toggleDropdown = (): void => setIsOpen((prev) => !prev);
  const closeDropdown = (): void => setIsOpen(false);

  return (
    <div className="relative">
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
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center space-x-3 ${
                  currentLocale.code === lang.code ? "bg-blue-50" : ""
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