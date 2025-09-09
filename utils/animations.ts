// src/utils/animations.ts
import type { Variants } from "framer-motion";

// Animaciones mejoradas
export const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.4, 0, 0.2, 1] // curva de animación suave tipo “easeInOut”
      } 
    },
  },
  slideUp: {
    hidden: { y: 40, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.6, 
        ease: [0.42, 0, 0.58, 1], // curva de “easeInOutCubic”
        delay: 0.1
      } 
    },
  },
  bounce: {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 350, 
        damping: 20, 
        mass: 0.8 
      } 
    },
  },
  slideLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1, 
      transition: { duration: 0.6, ease: "easeOut" } 
    },
  },
  zoomIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  },
};

// Función para obtener animación por nombre
export const getAnimation = (name: string) => animations[name] || animations.fadeIn;
