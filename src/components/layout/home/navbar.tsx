"use client";

import {
  Book,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  Sunset,
  Trees,
  User,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLogoutMutation } from "@/services/auth/auth.queries";
import type { UserProfileResponse } from "@/services/user/types";
import { useAuthStore } from "@/stores/auth/useAuthStore";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  className?: string;
  inverted?: boolean;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
    className?: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
  profile?: UserProfileResponse | null;
}

const Navbar = ({
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "Shadcnblocks.com",
  },
  menu = [
    { title: "Home", url: "#" },
    {
      title: "Products",
      url: "#",
      items: [
        {
          title: "Blog",
          description: "The latest industry news, updates, and info",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Company",
          description: "Our mission is to innovate and empower the world",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Careers",
          description: "Browse job listing and discover our workspace",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Support",
          description:
            "Get in touch with our support team or visit our community forums",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Help Center",
          description: "Get all the answers you need right here",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Terms of Service",
          description: "Our terms and conditions for using our services",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "Pricing",
      url: "#",
    },
    {
      title: "Blog",
      url: "#",
    },
  ],
  auth = {
    login: { title: "Login", url: "#" },
    signup: { title: "Sign up", url: "#" },
  },
  profile = null,
  inverted = false,
  className,
}: Navbar1Props) => {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const userId = useAuthStore((state) => state.userId);
  const clearSession = useAuthStore((state) => state.clearSession);
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutMutation();

  const userProfile = getUserProfile(profile, userId);
  const isManagementUser = ["ADMIN", "MANAGER"].includes((profile?.role ?? "").toUpperCase());

  const isAuthenticated = Boolean(accessToken);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await logout({ refreshToken });
      }
    } finally {
      clearSession();
      navigate("/sign-in");
    }
  };

  return (
    <section className={cn("py-4", className)}>
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a
              href={logo.url}
              className={cn(
                "flex items-center gap-2 text-primary transition-colors duration-150",
                inverted && "text-white",
              )}
            >
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </a>
          </div>
          <div className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                {menu.map((item) => renderMenuItem(item, inverted))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {!isAuthenticated ? (
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors duration-150",
                  inverted
                    ? "border-white/70 bg-transparent text-white hover:bg-white/10"
                    : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
                )}
              >
                <a href={auth.login.url}>{auth.login.title}</a>
              </Button>
              <Button
                asChild
                size="sm"
                className={cn(
                  "transition-colors duration-150",
                  inverted
                    ? "bg-white text-sky-700 hover:bg-white/90"
                    : "bg-primary text-white hover:bg-sky-700",
                )}
              >
                <a href={auth.signup.url}>{auth.signup.title}</a>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-auto rounded-full px-2 py-1 hover:bg-muted/60",
                    inverted && "text-white hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9 border border-slate-200/50">
                      <AvatarImage
                        alt={userProfile.name}
                        src={userProfile.avatarUrl}
                      />
                      <AvatarFallback>{userProfile.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      Hey, {userProfile.name}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {userProfile.name}
                    </p>
                    {userProfile.email && (
                      <p className="text-muted-foreground text-xs leading-none">
                        {userProfile.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User />
                  Profile
                </DropdownMenuItem>
                {isManagementUser ? (
                  <DropdownMenuItem onClick={() => navigate("/manager/posts") }>
                    <Book />
                    Manage posts
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  onClick={() => navigate("/profile?tab=account")}
                >
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("#contact")}>
                  <HelpCircle />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => void handleLogout()}
                  disabled={isLoggingOut}
                >
                  <LogOut />
                  {isLoggingOut ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-8 dark:invert"
                alt={logo.alt}
              />
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "transition-colors duration-150",
                    inverted &&
                      "border-white/70 bg-transparent text-white hover:bg-white/10",
                  )}
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img
                        src={logo.src}
                        className="max-h-8 dark:invert"
                        alt={logo.alt}
                      />
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  {!isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <Button asChild variant="outline">
                        <a href={auth.login.url}>{auth.login.title}</a>
                      </Button>
                      <Button asChild>
                        <a href={auth.signup.url}>{auth.signup.title}</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            alt={userProfile.name}
                            src={userProfile.avatarUrl}
                          />
                          <AvatarFallback>
                            {userProfile.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            Hey, {userProfile.name}
                          </p>
                          {userProfile.email && (
                            <p className="text-muted-foreground text-xs">
                              {userProfile.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                      >
                        <LogOut className="mr-2 size-4" />
                        {isLoggingOut ? "Logging out" : "Log out"}
                      </Button>
                    </div>
                  )}
                  {isAuthenticated && isManagementUser ? (
                    <Button asChild variant="outline" className="w-full">
                      <a href="/manager/posts">
                        <Book className="mr-2 size-4" />
                        Manage posts
                      </a>
                    </Button>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem, inverted: boolean) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger
          className={cn(
            "transition-colors duration-150",
            inverted
              ? "text-white hover:text-white"
              : "bg-transparent text-slate-900 shadow-none hover:bg-transparent hover:text-slate-900 hover:shadow-sm data-open:bg-transparent data-open:hover:bg-transparent",
          )}
        >
          {item.title}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className={cn(
          "group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150",
          inverted
            ? "bg-transparent text-white hover:bg-white/10 hover:text-white"
            : "bg-transparent text-slate-900 shadow-none hover:bg-transparent hover:text-slate-900 hover:shadow-sm",
        )}
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="flex min-w-80 flex-row gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none hover:bg-muted hover:text-accent-foreground"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-sm leading-snug text-muted-foreground">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  initials: string;
}

const getUserProfile = (
  profile: UserProfileResponse | null,
  userId: string | null,
): UserProfile => {
  const fallbackName = userId ? `User ${userId.slice(0, 6)}` : "User";
  const name =
    getFullName(profile?.firstName, profile?.lastName) ??
    profile?.username ??
    fallbackName;

  const email = profile?.email ?? "";
  const avatarUrl = profile?.profileImageUrl ?? "";

  return {
    name,
    email,
    avatarUrl,
    initials: getInitials(name),
  };
};

const getFullName = (
  givenName?: string | null,
  familyName?: string | null,
): string | null => {
  const fullName = [givenName, familyName].filter(Boolean).join(" ").trim();
  return fullName || null;
};

const getInitials = (name: string): string => {
  const words = name
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return "U";
  }

  return words
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
};

export { Navbar };
