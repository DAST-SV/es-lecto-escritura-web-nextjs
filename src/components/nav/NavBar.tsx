"use client";

import React, { useState, useEffect } from "react";
import BrandLogo from "./BrandLogo";
import MobileMenu from "./MobileMenu";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/src/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import DesktopNavigation from "./DesktopNavigationProps";
import MobileToggleButton from "./MobileToggleButtonProps";

interface NavBarProps {
  brandName?: string;
  userAvatar?: string;
}

const NavBar: React.FC<NavBarProps> = ({ brandName, userAvatar }) => {
  const defaultBrandName = brandName || "Eslectoescritura";
  const defaultUserAvatar =
    userAvatar ||
    "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png";

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();
  const t = useTranslations("nav");
  const locale = useLocale();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      listener.subscription.unsubscribe();
    };
  }, []); // no incluir supabase aquí

  const publicItems = [
    {
      label: t("about.text"),
      href: `/${locale}${t("about.href")}`,
      title: t("about.title"),
    },
    {
      label: t("auth.login.text"),
      href: `/${locale}${t("auth.login.href")}`,
      title: t("auth.login.title"),
    },
    {
      label: t("auth.register.text"),
      href: `/${locale}${t("auth.register.href")}`,
      title: t("auth.register.title"),
    },
  ];

  const privateItems = [
    {
      label: t("library.text"),
      href: `/${locale}${t("library.href")}`,
      title: t("library.title"),
    },
    {
      label: t("myWorld.text"),
      href: `/${locale}${t("myWorld.href")}`,
      title: t("myWorld.title"),
    },
    {
      label: t("myProgress.text"),
      href: `/${locale}${t("myProgress.href")}`,
      title: t("myProgress.title"),
    },
  ];

  const navItems = user ? privateItems : publicItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full px-6 py-3 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/60 backdrop-blur-lg shadow-md"
          : "bg-white/50 backdrop-blur-lg"
      }`}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <BrandLogo brandName={defaultBrandName} />

        <DesktopNavigation
          navItems={navItems}
          userAvatar={defaultUserAvatar}
          onLogout={handleLogout}
          isAuthenticated={!!user}
        />

        <MobileToggleButton
          isOpen={isMobileOpen}
          onToggle={() => setIsMobileOpen((prev) => !prev)}
        />
      </div>

      <MobileMenu
        isOpen={isMobileOpen}
        navItems={navItems}
        userAvatar={defaultUserAvatar}
        onLogout={handleLogout}
        isAuthenticated={!!user}
      />
    </nav>
  );
};

export default NavBar;