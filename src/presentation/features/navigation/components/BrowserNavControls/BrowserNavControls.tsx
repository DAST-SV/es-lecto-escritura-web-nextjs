// ============================================================================
// src/presentation/features/navigation/components/BrowserNavControls/BrowserNavControls.tsx
// Botones de navegacion tipo browser: Atras, Adelante, Recargar
// Se muestran al lado del BrandLogo cuando estan habilitados
// ============================================================================
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { useBrowserNav } from "../../context/BrowserNavContext";
import { useSupabaseTranslations } from '../../../translations/hooks/useSupabaseTranslations';

// ============================================================================
// Sub-componente: Boton individual de navegacion
// ============================================================================
const NavButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
  children: React.ReactNode;
}> = ({ onClick, disabled = false, ariaLabel, children }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={`
      p-1.5 rounded-lg transition-colors duration-150 btn-native
      ${disabled
        ? "text-gray-300 cursor-not-allowed"
        : "text-gray-600 hover:text-gray-900 hover:bg-white/60 active:bg-white/80"
      }
    `}
    whileTap={disabled ? undefined : { scale: 0.85 }}
    whileHover={disabled ? undefined : { scale: 1.1 }}
  >
    {children}
  </motion.button>
);

// ============================================================================
// Componente principal
// ============================================================================
const BrowserNavControls: React.FC<{ className?: string }> = ({ className }) => {
  const { isEnabled, canGoBack, canGoForward, goBack, goForward, refresh, isLoading } =
    useBrowserNav();
  const { t } = useSupabaseTranslations('nav');

  return (
    <AnimatePresence>
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, width: 0, x: -8 }}
          animate={{ opacity: 1, width: "auto", x: 0 }}
          exit={{ opacity: 0, width: 0, x: -8 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={`flex items-center gap-0.5 overflow-hidden ${className || ""}`}
        >
          {/* Separador sutil */}
          <div className="w-px h-5 bg-gray-300/50 mr-1" />

          {/* Atras */}
          <NavButton
            onClick={goBack}
            disabled={!canGoBack}
            ariaLabel={t('browser_nav.back') || 'Volver'}
          >
            <ArrowLeft size={17} strokeWidth={2.2} />
          </NavButton>

          {/* Adelante */}
          <NavButton
            onClick={goForward}
            disabled={!canGoForward}
            ariaLabel={t('browser_nav.forward') || 'Adelante'}
          >
            <ArrowRight size={17} strokeWidth={2.2} />
          </NavButton>

          {/* Recargar — gira continuamente mientras la pagina carga */}
          <NavButton
            onClick={refresh}
            disabled={isLoading}
            ariaLabel={t('browser_nav.refresh') || 'Recargar'}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isLoading
                  ? { duration: 0.8, repeat: Infinity, ease: "linear" }
                  : { duration: 0.3, ease: "easeOut" }
              }
            >
              <RotateCw
                size={15}
                strokeWidth={2.2}
                className={`transition-colors duration-200 ${
                  isLoading ? "text-blue-500" : ""
                }`}
              />
            </motion.div>
          </NavButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrowserNavControls;
