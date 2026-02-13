// ============================================================================
// src/presentation/features/navigation/components/BrowserNavControls/NavControlsToggle.tsx
// Toggle para activar/desactivar los controles de navegacion browser
// Desktop: icono compacto junto a los controles
// Mobile: fila con texto dentro del MobileMenu
// ============================================================================
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { useBrowserNav } from "../../context/BrowserNavContext";

interface NavControlsToggleProps {
  isMobile?: boolean;
}

const NavControlsToggle: React.FC<NavControlsToggleProps> = ({ isMobile = false }) => {
  const { isEnabled, toggleEnabled } = useBrowserNav();

  // ========================================
  // Mobile: fila completa con texto
  // ========================================
  if (isMobile) {
    return (
      <button
        onClick={toggleEnabled}
        className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-white/60 active:bg-white/80 transition-colors rounded-lg gap-3"
      >
        <Compass
          size={18}
          className={`transition-colors duration-200 ${
            isEnabled ? "text-blue-500" : "text-gray-400"
          }`}
        />
        <span className="text-sm font-medium">
          {isEnabled ? "Ocultar navegacion" : "Mostrar navegacion"}
        </span>
        {/* Indicador on/off */}
        <div
          className={`ml-auto w-8 h-4.5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${
            isEnabled ? "bg-blue-500" : "bg-gray-300"
          }`}
        >
          <motion.div
            className="w-3.5 h-3.5 bg-white rounded-full shadow-sm"
            animate={{ x: isEnabled ? 14 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </button>
    );
  }

  // ========================================
  // Desktop: icono compacto
  // ========================================
  return (
    <motion.button
      onClick={toggleEnabled}
      aria-label={isEnabled ? "Ocultar controles de navegacion" : "Mostrar controles de navegacion"}
      title={isEnabled ? "Ocultar controles de navegacion" : "Mostrar controles de navegacion"}
      className={`
        p-1.5 rounded-lg transition-all duration-200
        ${isEnabled
          ? "text-blue-500 bg-blue-50/80 hover:bg-blue-100/80"
          : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
        }
      `}
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.1 }}
    >
      <Compass size={16} strokeWidth={2} />
    </motion.button>
  );
};

export default NavControlsToggle;
