"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Cookie, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieBanner() {
  const t = useTranslations("legal");
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("dottorio_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const saveCookieConsent = async (prefs: CookiePreferences) => {
    try {
      await fetch("/api/cookie-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: null, // For logged-in users, pass session.user.id
          preferences: prefs,
          policyVersion: "1.0.0",
        }),
      });

      // Save to localStorage
      localStorage.setItem("dottorio_cookie_consent", JSON.stringify(prefs));

      // Update GTM consent if analytics enabled
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("consent", "update", {
          analytics_storage: prefs.analytics ? "granted" : "denied",
          ad_storage: prefs.marketing ? "granted" : "denied",
        });
      }
    } catch (error) {
      console.error("Failed to save cookie consent:", error);
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    await saveCookieConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    const onlyNecessary = { necessary: true, analytics: false, marketing: false };
    await saveCookieConsent(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await saveCookieConsent(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-6 left-6 z-50 max-w-md animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border shadow-2xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cookie className="w-6 h-6 text-white" />
              <h3 className="text-white font-semibold text-lg">
                {t("cookieBanner.title")}
              </h3>
            </div>
            <button
              onClick={handleRejectAll}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("cookieBanner.message")}{" "}
              <Link
                href="/legal/privacy"
                className="text-primary hover:underline font-medium"
              >
                {t("cookieBanner.privacyPolicy")}
              </Link>{" "}
              e{" "}
              <Link
                href="/legal/cookies"
                className="text-primary hover:underline font-medium"
              >
                {t("cookieBanner.cookiePolicy")}
              </Link>
              .
            </p>

            {/* Quick preferences preview */}
            <div className="bg-muted/30 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">🔒 {t("cookieSettings.necessary.title")}</span>
                <span className="text-emerald-600 font-semibold">{t("cookieSettings.necessary.subtitle")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">📊 {t("cookieSettings.analytics.title")}</span>
                <span className="text-muted-foreground">{t("cookieSettings.analytics.subtitle")}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">🎯 {t("cookieSettings.marketing.title")}</span>
                <span className="text-muted-foreground">{t("cookieSettings.marketing.subtitle")}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleAcceptAll}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Cookie className="w-4 h-4 mr-2" />
                {t("cookieBanner.acceptAll")}
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t("cookieSettings.customize")}
                </Button>

                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex-1"
                >
                  {t("cookieBanner.reject")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              {t("cookieSettings.title")}
            </DialogTitle>
            <DialogDescription>
              {t("cookieSettings.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Necessary Cookies */}
            <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-emerald-600" />
                  <div>
                    <Label className="text-base font-semibold">
                      {t("cookieSettings.necessary.title")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("cookieSettings.necessary.subtitle")}
                    </p>
                  </div>
                </div>
                <Switch checked disabled />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("cookieSettings.necessary.description")}
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Esempi:</strong> {t("cookieSettings.necessary.examples")}
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                      {t("cookieSettings.analytics.title")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("cookieSettings.analytics.subtitle")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("cookieSettings.analytics.description")}
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Esempi:</strong> {t("cookieSettings.analytics.examples")}
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="w-5 h-5 text-purple-600" />
                  <div>
                    <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                      {t("cookieSettings.marketing.title")}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t("cookieSettings.marketing.subtitle")}
                    </p>
                  </div>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("cookieSettings.marketing.description")}
              </p>
              <div className="text-xs text-muted-foreground">
                <strong>Esempi:</strong> {t("cookieSettings.marketing.examples")}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => {
                setPreferences({ necessary: true, analytics: false, marketing: false });
                handleSavePreferences();
              }}
              variant="outline"
              className="flex-1"
            >
              {t("cookieSettings.rejectAll")}
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {t("cookieSettings.savePreferences")}
            </Button>
            <Button
              onClick={() => {
                setPreferences({ necessary: true, analytics: true, marketing: true });
                handleSavePreferences();
              }}
              className="flex-1"
            >
              {t("cookieSettings.acceptAll")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
