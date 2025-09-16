"use client";

import React, { useState, useEffect } from "react";
import BrandLogo from "./BrandLogo";
import DesktopNavigation from "./DesktopNavigationProps";
import MobileToggleButton from "./MobileToggleButtonProps";
import MobileMenu from "./MobileMenu";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/src/utils/supabase/client";
import type { User } from "@supabase/supabase-js";

const NavBar: React.FC<NavBarProps> = ({ brandName, userAvatar }) => {
    const defaultBrandName = brandName || "EslectoEscritura";
    const defaultUserAvatar =
        userAvatar ||
        "https://csspicker.dev/api/image/?q=professional+avatar&image_type=photo";

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Estado de usuario con Supabase
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const t = useTranslations("nav");
    const locale = useLocale();

    useEffect(() => {
        // Scroll effect
        const onScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);

        // Verificar sesión inicial
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        // Escuchar cambios de auth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
            subscription.unsubscribe();
        };
    }, [supabase]);


    // Menú público
    const publicItems = [
        {
            label: t("about.text"),
            href: `/${locale}${t("about.href")}`,
            title: t("about.title")
        },
        {
            label: t("auth.login.text"),
            href: `/${locale}${t("auth.login.href")}`,
            title: t("auth.login.title")
        },
        {
            label: t("auth.register.text"),
            href: `/${locale}${t("auth.register.href")}`,
            title: t("auth.register.title")
        },
    ];

    // Menú privado
    const privateItems = [
        {
            label: t("myBooks.text"),
            href: `/${locale}${t("myBooks.href")}`,
            title: t("myBooks.title")
        },
        {
            label: t("profile.text"),
            href: `/${locale}${t("profile.href")}`,
            title: t("profile.title")
        }
    ];

    const defaultNavItems = user ? [...publicItems, ...privateItems] : publicItems;

    // Logout handler
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <nav
            className={`fixed top-0 left-0 w-full px-6 py-3 z-50 transition-all duration-300 ${isScrolled
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
                    onLogout={handleLogout} // pasamos logout
                    isAuthenticated={!!user}
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
                onLogout={handleLogout}
                isAuthenticated={!!user}
            />
        </nav>
    );
};

export default NavBar;
