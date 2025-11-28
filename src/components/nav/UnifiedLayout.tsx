/**
 * UBICACIÓN: src/components/nav/UnifiedLayout.tsx
 * ✅ CORREGIDO: Soporte para modo fullscreen y z-index apropiados
 */

"use client";

import React from "react";
import NavBar from "./NavBar";
import LoginBackground from "../auth/LoginBackground";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  backgroundComponent?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showNavbar?: boolean;
  brandName?: string;
  fullscreen?: boolean; // ✅ NUEVO: Modo pantalla completa
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  backgroundComponent,
  className = "",
  mainClassName = "",
  showNavbar = true,
  brandName,
  fullscreen = false, // ✅ Por defecto false
}) => {
  
  // ✅ Si es fullscreen, no renderizar el layout completo
  if (fullscreen) {
    return <>{children}</>;
  }

  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      {/* Fondo - z-0 */}
      {backgroundComponent ? (
        <div className="absolute inset-0 z-0">{backgroundComponent}</div>
      ) : (
        <LoginBackground />
      )}

      {/* Header flotante - z-50 */}
      {showNavbar && <NavBar brandName={brandName} />}

      {/* Main - z-10 */}
      <main
        className={`relative ${mainClassName}`}
        style={{
          minHeight: showNavbar ? "calc(100vh - 60px)" : "100vh",
          marginTop: showNavbar ? "60px" : "0",
          zIndex: 10,
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default UnifiedLayout;