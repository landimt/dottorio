"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LocaleSwitcher } from "@/components/ui/locale-switcher";
import { Loader2, ArrowRight, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error types
        if (result.error === "CredentialsSignin") {
          setError(t("invalidCredentials"));
        } else {
          setError(t("genericError"));
        }
        setIsLoading(false);
        return;
      }

      // If no error, redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(t("genericError"));
      setIsLoading(false);
    }
  }

  // Use resolvedTheme for actual theme (handles "system" preference)
  const currentTheme = resolvedTheme || theme;

  return (
    <>
      {/* Theme and Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {/* Language Switcher */}
        <div className="w-[140px]">
          <LocaleSwitcher />
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
          className="w-10 h-10 p-0 rounded-xl transition-all hover:bg-muted"
        >
          {mounted ? (
            currentTheme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4 h-4" /> // Placeholder to avoid hydration mismatch
          )}
        </Button>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg border-2 border-border bg-card">
        <CardContent className="p-8">
          <form onSubmit={onSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                {t("email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                disabled={isLoading}
                className="h-12 border-2 hover:border-muted-foreground focus:border-primary transition-all rounded-xl shadow-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                {t("password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                required
                disabled={isLoading}
                className="h-12 border-2 hover:border-muted-foreground focus:border-primary transition-all rounded-xl shadow-sm bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loggingIn")}
                </>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t("login")}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Button
                variant="link"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                {t("forgotPassword")}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 font-medium bg-card text-muted-foreground">
                  oppure
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full h-12 border-2 font-semibold rounded-xl transition-all border-border hover:border-primary hover:bg-primary/5"
            >
              <Link href="/register">Crea nuovo account</Link>
            </Button>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-muted-foreground mt-6 leading-relaxed">
            Continuando, accetti i{" "}
            <button className="font-medium hover:underline text-primary">
              Termini
            </button>
            {" "}e la{" "}
            <button className="font-medium hover:underline text-primary">
              Privacy
            </button>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
