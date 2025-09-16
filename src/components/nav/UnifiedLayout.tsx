"use client";

import React from "react";
import NavBar from "./NavBar";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  backgroundComponent?: React.ReactNode;
  className?: string;
  mainClassName?: string;
  showNavbar?: boolean;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  backgroundComponent,
  className = "",
  mainClassName = "",
  showNavbar = true,
}) => {
  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      {/* Fondo */}
      {backgroundComponent && (
        <div className="absolute inset-0 z-0">{backgroundComponent}</div>
      )}

      {/* Header flotante - fixed positioning ya manejado en NavBar */}
      {showNavbar && <NavBar />}

      {/* Main con padding mínimo para el navbar */}
      <main className={`flex-1 relative z-10 pt-14 ${mainClassName}`}>
        {children}
      </main>
    </div>
  );
};

export default UnifiedLayout;