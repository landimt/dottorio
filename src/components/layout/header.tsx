"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Bell,
  BookOpen,
  GraduationCap,
  Home,
  LogOut,
  Moon,
  Plus,
  Search,
  Settings,
  Sun,
  User,
  Shield,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("navigation");
  const tHeader = useTranslations("header");
  const tAuth = useTranslations("auth");

  const navigationItems = [
    { id: "dashboard", href: "/dashboard", icon: Home, label: t("home") },
    { id: "search", href: "/search", icon: Search, label: t("search") },
    { id: "notebooks", href: "/notebooks", icon: BookOpen, label: t("notebooks") },
    { id: "add", href: "/exams/new", icon: Plus, label: t("add") },
  ];

  const user = session?.user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Header Desktop */}
      <header className="hidden md:flex bg-card/95 backdrop-blur-md border-b border-border h-14 items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center w-full max-w-7xl mx-auto">
          {/* Logo - Left */}
          <div className="flex-1">
            <Link href="/dashboard" className="flex items-center space-x-3 group w-fit">
              <span className="text-lg font-semibold text-foreground">Dottorio</span>
            </Link>
          </div>

          {/* Navigation Icons - Center */}
          <nav className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link key={item.id} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-10 h-10 p-0 transition-all duration-200 ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end space-x-3">
            {/* Admin Panel Button - Only for admins */}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 h-9 px-3 text-primary hover:text-primary hover:bg-primary/10 font-medium"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden lg:inline">{tHeader("adminPanel")}</span>
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0 relative text-muted-foreground hover:text-foreground group"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 h-auto py-2 px-3 hover:bg-muted/50 rounded-lg"
                >
                  <UserAvatar
                    name={user?.name}
                    image={user?.image}
                    size="sm"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="font-medium leading-tight text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {user?.universityName}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{tHeader("myAccount")}</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {tHeader("year", { year: user?.year ?? 1 })}
                    </span>
                    {user?.courseName && (
                      <span className="text-xs text-muted-foreground">• {user.courseName}</span>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator />

                {/* Language Switcher */}
                <div className="px-2 py-1.5">
                  <LocaleSwitcher />
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{tHeader("myProfile")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{tHeader("settings")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Theme Toggle */}
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? tHeader("lightMode") : tHeader("darkMode")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{tAuth("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Header Mobile */}
      <header className="md:hidden flex bg-card/95 backdrop-blur-md border-b border-border h-14 items-center px-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between w-full">
          <Link href="/dashboard">
            <span className="text-lg font-semibold text-foreground">Dottorio</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Admin Panel Button Mobile - Only for admins */}
            {isAdmin && (
              <Link href="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Shield className="w-5 h-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 w-9 p-0 rounded-full">
                  <UserAvatar
                    name={user?.name}
                    image={user?.image}
                    size="sm"
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{tHeader("myAccount")}</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <DropdownMenuSeparator />

                {/* Language Switcher Mobile */}
                <div className="px-2 py-1.5">
                  <LocaleSwitcher />
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{tHeader("myProfile")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{tHeader("settings")}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Theme Toggle Mobile */}
                <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>{theme === "dark" ? tHeader("lightMode") : tHeader("darkMode")}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{tAuth("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border shadow-lg pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link key={item.id} href={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full flex flex-col items-center gap-1 h-auto py-2 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] leading-tight">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
