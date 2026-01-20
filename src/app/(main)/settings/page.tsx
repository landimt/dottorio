"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Globe,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const t = useTranslations("settings");
  const tNav = useTranslations("navigation");
  const tAuth = useTranslations("auth");
  const currentLocale = useLocale();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    newAnswers: true,
    newComments: true,
    weeklyDigest: false,
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success(t("savedSuccess"));
  };

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    router.refresh();
    toast.success(
      newLocale === "it" 
        ? t("languageChangedIt") 
        : t("languageChangedEn")
    );
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{tNav("settings")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Language - Moved to top for easy testing */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {t("language")}
            </CardTitle>
            <CardDescription>
              {t("languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={currentLocale} onValueChange={handleLocaleChange}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue>
                  {localeFlags[currentLocale as Locale]} {localeNames[currentLocale as Locale]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{localeFlags[locale]}</span>
                      <span>{localeNames[locale]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-3">
              {t("languageRefreshNotice")}
            </p>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t("profile")}
            </CardTitle>
            <CardDescription>
              {t("profileDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  defaultValue={user?.name || ""}
                  placeholder={t("fullNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("university")}</Label>
                <Input
                  value={user?.universityName || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("year")}</Label>
                <Select defaultValue={String(user?.year || 1)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {tAuth("yearLabel", { year })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>
              {t("notificationsDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("emailNotifications")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("emailNotificationsDescription")}
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("newAnswers")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("newAnswersDescription")}
                </p>
              </div>
              <Switch
                checked={notifications.newAnswers}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newAnswers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("newComments")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("newCommentsDescription")}
                </p>
              </div>
              <Switch
                checked={notifications.newComments}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newComments: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("weeklyDigest")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("weeklyDigestDescription")}
                </p>
              </div>
              <Switch
                checked={notifications.weeklyDigest}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, weeklyDigest: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t("privacySecurity")}
            </CardTitle>
            <CardDescription>
              {t("privacySecurityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("publicProfile")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("publicProfileDescription")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("showActivity")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("showActivityDescription")}
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="pt-2">
              <Button variant="outline" className="text-destructive hover:text-destructive">
                {t("deleteAccount")}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                {t("deleteAccountWarning")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link href="/profile">
            <Button variant="outline">{tNav("profile")}</Button>
          </Link>
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t("saveChanges")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
