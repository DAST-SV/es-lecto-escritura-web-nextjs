"use client";

import React from "react";
import NavigationItems from "./NavigationItems";
import LanguageSelector from "./LanguageSelector";
import UserMenu from "./UserMenu";

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navItems,
  userAvatar,
  isAuthenticated,
  onLogout,
}) => {
  return (
    <div className="hidden md:flex items-center space-x-4">
      {navItems.map((item) =>
        item.href === "#" ? (
          <button
            key={item.label}
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            {item.label}
          </button>
        ) : (
          <NavigationItems
            key={item.label}
            items={[item]} // NavigationItems recibe un array
          />
        )
      )}

      <LanguageSelector />
      {isAuthenticated && userAvatar && <UserMenu userAvatar={userAvatar} />}
    </div>
  );
};

export default DesktopNavigation;
