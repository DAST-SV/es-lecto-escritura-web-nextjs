"use client";

import React, { useState, useEffect } from "react";
import BrandLogo from "./BrandLogo";
import DesktopNavigation from "./DesktopNavigationProps";
import MobileToggleButton from "./MobileToggleButtonProps";
import MobileMenu from "./MobileMenu";

interface NavBarProps {
    brandName?: string;
    navItems?: string[];
    userAvatar?: string;
}

const NavBar: React.FC<NavBarProps> = ({ 
    brandName, 
    navItems, 
    userAvatar 
}) => {
    const defaultBrandName = brandName || "EslectoEscritura";
    const defaultNavItems = navItems || ["Explorar", "Logros", "Page"];
    const defaultUserAvatar = userAvatar || "https://csspicker.dev/api/image/?q=professional+avatar&image_type=photo";

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 w-full px-6 py-3 z-50 transition-all duration-300 ${
                isScrolled
                    ? "bg-white/60 backdrop-blur-lg shadow-md"
                    : "bg-white/50 backdrop-blur-lg"
            }`}
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Brand Logo */}
                <BrandLogo brandName={defaultBrandName} />

                {/* Desktop Navigation */}
                <DesktopNavigation 
                    navItems={defaultNavItems}
                    userAvatar={defaultUserAvatar}
                />

                {/* Mobile Toggle Button */}
                <MobileToggleButton 
                    isOpen={isMobileOpen}
                    onToggle={() => setIsMobileOpen((prev) => !prev)}
                />
            </div>

            {/* Mobile Menu */}
            <MobileMenu 
                isOpen={isMobileOpen}
                navItems={defaultNavItems}
                userAvatar={defaultUserAvatar}
            />
        </nav>
    );
};

export default NavBar;