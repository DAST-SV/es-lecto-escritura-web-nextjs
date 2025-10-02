"use client";

import React from "react";
import NavBar from "./NavBar";

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
      {/* Fondo */}
      {backgroundComponent && (
        <div className="absolute inset-0 z-0">{backgroundComponent}</div>
      )}

      {/* Header flotante - fixed positioning ya manejado en NavBar */}
      {showNavbar && <NavBar brandName={brandName} />}

      {/* Main que ocupa toda la altura menos el navbar */}
      <main 
        className={`relative z-10 ${mainClassName}`}
        style={{
          minHeight: showNavbar ? 'calc(100vh - 60px)' : '100vh',
          marginTop: showNavbar ? '60px' : '0'
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default UnifiedLayout;