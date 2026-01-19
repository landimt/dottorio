"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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

export default function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

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
    toast.success("Impostazioni salvate con successo!");
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
          <h1 className="text-2xl font-bold">Impostazioni</h1>
          <p className="text-muted-foreground">
            Gestisci le tue preferenze e il tuo account
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profilo
            </CardTitle>
            <CardDescription>
              Aggiorna le informazioni del tuo profilo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  defaultValue={user?.name || ""}
                  placeholder="Il tuo nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label>Università</Label>
                <Input
                  value={user?.universityName || ""}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Anno</Label>
                <Select defaultValue={String(user?.year || 1)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}º Anno
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
              Notifiche
            </CardTitle>
            <CardDescription>
              Configura come ricevere le notifiche
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifiche Email</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi aggiornamenti via email
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
                <Label>Nuove Risposte</Label>
                <p className="text-sm text-muted-foreground">
                  Notifica quando qualcuno risponde alle tue domande
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
                <Label>Nuovi Commenti</Label>
                <p className="text-sm text-muted-foreground">
                  Notifica quando qualcuno commenta le tue risposte
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
                <Label>Riepilogo Settimanale</Label>
                <p className="text-sm text-muted-foreground">
                  Ricevi un riepilogo settimanale delle attività
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

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Lingua
            </CardTitle>
            <CardDescription>
              Seleziona la lingua dell&apos;interfaccia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="it">
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="en" disabled>
                  English (coming soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy e Sicurezza
            </CardTitle>
            <CardDescription>
              Gestisci le impostazioni di sicurezza del tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profilo Pubblico</Label>
                <p className="text-sm text-muted-foreground">
                  Permetti ad altri studenti di vedere il tuo profilo
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostra Attività</Label>
                <p className="text-sm text-muted-foreground">
                  Mostra le tue attività recenti sul tuo profilo
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Separator />

            <div className="pt-2">
              <Button variant="outline" className="text-destructive hover:text-destructive">
                Elimina Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Questa azione è irreversibile. Tutti i tuoi dati saranno eliminati.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link href="/profile">
            <Button variant="outline">Annulla</Button>
          </Link>
          <Button onClick={handleSaveProfile} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salva Modifiche
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
