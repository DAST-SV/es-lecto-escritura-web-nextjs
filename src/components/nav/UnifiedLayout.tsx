"use client";

import React from "react";
import NavBar from "./NavBar";
import LoginBackground from "../auth/LoginBackground";

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  backgroundComponent,
  className = "",
  mainClassName = "",
  showNavbar = true,
  brandName
}) => {
  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      {/* Fondo - z-0 */}
      {backgroundComponent ? (
        <div className="absolute inset-0 z-0">{backgroundComponent}</div>
      ) : <LoginBackground />}

      {/* Header flotante - z-50 (NavBar maneja su propio z-index) */}
      {showNavbar && <NavBar brandName={brandName} />}

      {/* Main - z-10 (menor que toast z-99999) */}
      <main 
        className={`relative ${mainClassName}`}
        style={{
          minHeight: showNavbar ? 'calc(100vh - 60px)' : '100vh',
          marginTop: showNavbar ? '60px' : '0',
          zIndex: 10 // ✅ Asegurar que esté por debajo del toast
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default UnifiedLayout;