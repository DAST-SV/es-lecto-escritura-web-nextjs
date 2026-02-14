// ============================================================================
// src/presentation/features/navigation/components/NavBar/NavBarSkeleton.tsx
// ============================================================================
import React from "react";

export const NavBarDesktopSkeleton: React.FC = () => (
  <div className="hidden md:flex items-center space-x-4 animate-pulse">
    {/* Nav items */}
    <div className="h-4 w-16 bg-gray-200 rounded" />
    <div className="h-4 w-20 bg-gray-200 rounded" />
    <div className="h-4 w-14 bg-gray-200 rounded" />
    {/* Language selector placeholder */}
    <div className="h-8 w-12 bg-gray-200 rounded-md" />
    {/* Avatar placeholder */}
    <div className="h-8 w-8 bg-gray-200 rounded-full" />
  </div>
);

export const NavBarMobileSkeleton: React.FC = () => (
  <div className="md:hidden animate-pulse">
    <div className="h-8 w-8 bg-gray-200 rounded" />
  </div>
);
