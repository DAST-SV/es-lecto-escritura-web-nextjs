// ============================================================================
// src/presentation/features/navigation/components/BrowserNavControls/NavControlsToggle.tsx
// Toggle para activar/desactivar los controles de navegacion browser
// Desktop: icono ultra-discreto tipo "pin" de Word (esquina, poco visible)
// Mobile: fila con texto dentro del MobileMenu
// ============================================================================
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, PinOff, Pin } from "lucide-react";
import { useBrowserNav } from "../../context/BrowserNavContext";
import { useSupabaseTranslations } from '../../../translations/hooks/useSupabaseTranslations';

interface NavControlsToggleProps {
  isMobile?: boolean;
}

const NavControlsToggle: React.FC<NavControlsToggleProps> = ({ isMobile = false }) => {
  const { isEnabled, toggleEnabled } = useBrowserNav();
  const { t } = useSupabaseTranslations('nav');
  const [isHovered, setIsHovered] = useState(false);

  const showLabel = t('browser_nav.show') || 'Mostrar navegacion';
  const hideLabel = t('browser_nav.hide') || 'Ocultar navegacion';

  // ========================================
  // Mobile: fila completa con texto + switch
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
          {isEnabled ? hideLabel : showLabel}
        </span>
        {/* Switch iOS-like */}
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
  // Desktop: icono ultra-discreto tipo "pin" de Word
  // Casi invisible, se revela al hover, en la esquina
  // ========================================
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        onClick={toggleEnabled}
        aria-label={isEnabled ? hideLabel : showLabel}
        className={`
          p-1 rounded transition-all duration-300 cursor-pointer
          ${isEnabled
            ? "text-gray-400/60 hover:text-blue-500 hover:bg-blue-50/50"
            : "text-gray-300/40 hover:text-gray-500 hover:bg-gray-100/50"
          }
        `}
        whileTap={{ scale: 0.85 }}
        animate={{
          opacity: isHovered ? 1 : (isEnabled ? 0.5 : 0.25),
        }}
        transition={{ duration: 0.2 }}
      >
        {isEnabled ? (
          <Pin size={13} strokeWidth={1.8} className="rotate-45" />
        ) : (
          <PinOff size={13} strokeWidth={1.8} />
        )}
      </motion.button>

      {/* Tooltip al hacer hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-1
              bg-gray-800/90 text-white text-[10px] rounded whitespace-nowrap z-50
              pointer-events-none"
          >
            {isEnabled ? hideLabel : showLabel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavControlsToggle;
