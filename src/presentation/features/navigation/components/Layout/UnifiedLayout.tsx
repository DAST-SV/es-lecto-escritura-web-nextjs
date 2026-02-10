// ============================================================================
// src/presentation/features/navigation/components/Layout/UnifiedLayout.tsx
// ============================================================================
"use client";

import React from "react";
import NavBar from "../NavBar";
import { UnifiedLayoutProps } from '../../types/navigation.types';

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  backgroundComponent,
  className = "",
  mainClassName = "",
  showNavbar = true,
  brandName,
  fullscreen = false,
}) => {
  
  if (fullscreen) {
    return <>{children}</>;
  }

  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      {backgroundComponent && (
        <div className="fixed inset-0 z-0 pointer-events-none">{backgroundComponent}</div>
      )}

      {showNavbar && <NavBar brandName={brandName} />}

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