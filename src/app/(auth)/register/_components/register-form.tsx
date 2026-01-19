"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface University {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  universityId: string;
}

// Years as numbers (1-6)
const years = [1, 2, 3, 4, 5, 6];

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);

  // Form state for select components
  const [universityId, setUniversityId] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [channelId, setChannelId] = useState("");
  const [isRepresentative, setIsRepresentative] = useState(false);

  // Filtered channels by selected university
  const universityChannels = channels.filter(
    (ch) => ch.universityId === universityId
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [uniRes, channelRes] = await Promise.all([
          fetch("/api/universities"),
          fetch("/api/channels"),
        ]);
        if (uniRes.ok) {
          const uniData = await uniRes.json();
          setUniversities(uniData);
        }
        if (channelRes.ok) {
          const channelData = await channelRes.json();
          setChannels(channelData);
        }
      } catch {
        // Fallback to empty arrays
      }
    }
    loadData();
  }, []);

  // Reset channel when university changes
  useEffect(() => {
    setChannelId("");
  }, [universityId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    // Validate required select fields
    if (!universityId) {
      setError("Seleziona la tua università");
      setIsLoading(false);
      return;
    }

    if (!year) {
      setError("Seleziona il tuo anno");
      setIsLoading(false);
      return;
    }

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      universityId,
      year, // Now a number
      channelId: channelId || null,
      isRepresentative,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Errore durante la registrazione");
        setIsLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Si è verificato un errore. Riprova.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl text-center">Crea Account</CardTitle>
        <CardDescription className="text-center">
          Inserisci i tuoi dati per creare un account gratuito
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Il tuo nome completo"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tua@email.it"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimo 6 caratteri"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="universityId">Università</Label>
            <Select value={universityId} onValueChange={setUniversityId}>
              <SelectTrigger disabled={isLoading}>
                <SelectValue placeholder="Seleziona la tua università" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((uni) => (
                  <SelectItem key={uni.id} value={uni.id}>
                    {uni.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Anno</Label>
              <Select
                value={year ? String(year) : ""}
                onValueChange={(value) => setYear(parseInt(value, 10))}
              >
                <SelectTrigger disabled={isLoading}>
                  <SelectValue placeholder="Anno" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}º Anno
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Canale</Label>
              <Select
                value={channelId}
                onValueChange={setChannelId}
              >
                <SelectTrigger disabled={isLoading || universityChannels.length === 0}>
                  <SelectValue
                    placeholder={
                      universityChannels.length === 0
                        ? "Seleziona prima l'università"
                        : "Canale"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {universityChannels.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border bg-muted/30 p-4">
            <Checkbox
              id="isRepresentative"
              checked={isRepresentative}
              onCheckedChange={(checked) => setIsRepresentative(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor="isRepresentative" className="text-sm cursor-pointer">
                Sono rappresentante di classe
              </Label>
              <p className="text-xs text-muted-foreground">
                Potrai generare link condivisibili per la raccolta delle domande
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creazione in corso...
              </>
            ) : (
              "Crea Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Accedi
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
