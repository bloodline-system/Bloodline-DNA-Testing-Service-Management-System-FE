import { useEffect, useState } from "react";

import LogoImageWhite from "@/assets/toggle-logo-white.png";
import LogoImage from "@/assets/toggle-logo.png";
import { Navbar } from "@/components/layout/home/navbar";
import type { UserProfileResponse } from "@/services/user/types";

const HOME_MENU = [
  { title: "Home", url: "#" },
  { title: "Services", url: "#services" },
  { title: "About", url: "#about" },
  { title: "Pricing", url: "#pricing" },
  { title: "FAQ", url: "#faq" },
  { title: "How It Works", url: "#how-it-works" },
  { title: "Contact", url: "#contact" },
];

const HOME_AUTH = {
  login: { title: "Sign In", url: "/sign-in" },
  signup: { title: "Sign Up", url: "/sign-up" },
};

interface HomeHeaderProps {
  profile?: UserProfileResponse | null;
}

export const HomeHeader = ({ profile = null }: HomeHeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const isManagementUser = ["ADMIN", "MANAGER"].includes(
    (profile?.role ?? "").toUpperCase(),
  );
  const isLoggedIn = !!profile;

  const headerMenu = [
    HOME_MENU[0],
    ...(isLoggedIn
      ? [
          ...(isManagementUser
            ? [{ title: "Dashboard", url: "/dashboard" }]
            : []),
          { title: "Orders", url: "/orders" },
        ]
      : []),
    ...HOME_MENU.slice(1),
  ];

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const logo = !isScrolled
    ? {
        url: "#home",
        src: LogoImageWhite,
        alt: "Bloodline logo",
        title: "Bloodline DNA",
      }
    : {
        url: "#home",
        src: LogoImage,
        alt: "Bloodline logo",
        title: "Bloodline DNA",
      };

  return (
    <header
      className={`sticky top-0 z-50 flex justify-center transition-colors duration-150 ${
        isScrolled
          ? "border-b bg-white/95 text-slate-900 backdrop-blur"
          : "border-b border-transparent bg-[#4285f4] text-white"
      }`}
    >
      <Navbar
        className="flex w-11/12 justify-center py-3"
        inverted={!isScrolled}
        logo={logo}
        menu={headerMenu}
        auth={HOME_AUTH}
        profile={profile}
      />
    </header>
  );
};
