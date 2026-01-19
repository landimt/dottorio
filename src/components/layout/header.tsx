"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
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
  Home,
  Search,
  Plus,
  User,
  Settings,
  LogOut,
  GraduationCap,
  BookOpen,
  Bell,
  Sun,
  Moon,
} from "lucide-react";

const navigationItems = [
  { id: "dashboard", href: "/dashboard", icon: Home, label: "Home" },
  { id: "search", href: "/search", icon: Search, label: "Cerca" },
  { id: "notebooks", href: "/notebooks", icon: BookOpen, label: "Cadernos" },
  { id: "add", href: "/exams/new", icon: Plus, label: "Aggiungi" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  const user = session?.user;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      {/* Header Desktop */}
      <header className="hidden md:flex bg-card/95 backdrop-blur-md border-b border-border h-14 items-center px-6 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <span className="text-lg font-semibold text-foreground">Dottorio</span>
          </Link>

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
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
              title={theme === "dark" ? "Modo Chiaro" : "Modo Scuro"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
              ) : (
                <Moon className="w-5 h-5 transition-transform duration-300 hover:-rotate-12" />
              )}
            </Button>

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
                  <Avatar className="h-10 w-10 ring-2 ring-border">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary font-medium">
                      {user?.name ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="font-medium leading-tight text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {user?.universityName}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Il Mio Account</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {user?.year}º Anno
                    </span>
                    {user?.channelName && (
                      <span className="text-xs text-muted-foreground">• {user.channelName}</span>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Il Mio Profilo</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Impostazioni</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
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
            {/* Theme Toggle Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              title={theme === "dark" ? "Modo Chiaro" : "Modo Scuro"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

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
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      {user?.name ? getInitials(user.name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Il Mio Account</DropdownMenuLabel>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Il Mio Profilo</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Esci</span>
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
