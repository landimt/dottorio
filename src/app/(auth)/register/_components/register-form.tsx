"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, User, GraduationCap, Building2, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface University {
  id: string;
  name: string;
  shortName: string | null;
}

interface Course {
  id: string;
  name: string;
  universityId: string;
}

// Known institutional email domains by university
const institutionalDomains: Record<string, string[]> = {
  "sapienza": ["uniroma1.it", "studenti.uniroma1.it"],
  "default": [".edu", ".ac.it", "studenti.", "uniroma", "unibo", "unimi", "unina", "unipd", "unifi", "unito", "unict", "uniba", "unica", "unige", "univr", "unipv", "unipi", "unical", "units", "uniss", "uniud", "unimore", "unipr", "unife", "unimib", "uninsubria", "unint", "unicatt", "unibocconi", "polimi", "polito"],
};

// Years as numbers (1-6)
const years = [1, 2, 3, 4, 5, 6];

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [email, setEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [isRepresentative, setIsRepresentative] = useState(false);

  // Filtered courses by selected university
  const universityCourses = useMemo(
    () => courses.filter((c) => c.universityId === universityId),
    [courses, universityId]
  );

  // Check if email looks institutional
  const isInstitutionalEmail = useMemo(() => {
    if (!email || !email.includes("@")) return null;
    const domain = email.split("@")[1]?.toLowerCase() || "";

    // Check against known domains
    const allDomains = [...institutionalDomains.default];
    return allDomains.some((d) => domain.includes(d));
  }, [email]);

  useEffect(() => {
    async function loadData() {
      try {
        const [uniRes, courseRes] = await Promise.all([
          fetch("/api/universities"),
          fetch("/api/courses"),
        ]);
        if (uniRes.ok) {
          const uniResult = await uniRes.json();
          setUniversities(uniResult.data || []);
        }
        if (courseRes.ok) {
          const courseResult = await courseRes.json();
          setCourses(courseResult.data || []);
        }
      } catch {
        // Fallback to empty arrays
      }
    }
    loadData();
  }, []);

  // Handler for university change - also resets course
  const handleUniversityChange = (value: string) => {
    setUniversityId(value);
    setCourseId(""); // Reset course when university changes
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate required fields
    if (!name.trim()) {
      setError("Inserisci il tuo nome");
      setIsLoading(false);
      return;
    }

    if (!universityId) {
      setError("Seleziona la tua università");
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError("Inserisci la tua email istituzionale");
      setIsLoading(false);
      return;
    }

    if (isInstitutionalEmail === false) {
      setError("Utilizza un'email istituzionale della tua università");
      setIsLoading(false);
      return;
    }

    if (!courseId) {
      setError("Seleziona il tuo corso");
      setIsLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError("La password deve avere almeno 6 caratteri");
      setIsLoading(false);
      return;
    }

    const data = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      universityId,
      year: year || 1,
      courseId,
      isRepresentative,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorResult = await res.json();
        setError(errorResult.error?.message || "Errore durante la registrazione");
        setIsLoading(false);
        return;
      }

      // TODO: In future, redirect to email verification page
      // For now, redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setError("Si è verificato un errore. Riprova.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-2xl border-border/50 animate-scale-in">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Nome Completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Il tuo nome e cognome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Università */}
          <div className="space-y-2">
            <Label htmlFor="university" className="text-sm font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Università
            </Label>
            <Select value={universityId} onValueChange={handleUniversityChange} disabled={isLoading}>
              <SelectTrigger className="h-11 text-left">
                {universityId ? (
                  <span>{universities.find((u) => u.id === universityId)?.name}</span>
                ) : (
                  <SelectValue placeholder="Seleziona la tua università" />
                )}
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

          {/* Email Istituzionale */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email Istituzionale
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="nome.cognome@studenti.uniroma1.it"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className={`h-11 pr-10 ${
                  email && isInstitutionalEmail === true
                    ? "border-emerald-500 focus-visible:ring-emerald-500"
                    : email && isInstitutionalEmail === false
                    ? "border-amber-500 focus-visible:ring-amber-500"
                    : ""
                }`}
              />
              {email && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isInstitutionalEmail === true ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isInstitutionalEmail === false ? (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ) : null}
                </div>
              )}
            </div>
            {email && isInstitutionalEmail === false && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Usa l&apos;email fornita dalla tua università per verificare la tua identità
              </p>
            )}
          </div>

          {/* Corso */}
          <div className="space-y-2">
            <Label htmlFor="course" className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground" />
              Corso di Laurea
            </Label>
            <Select
              value={courseId}
              onValueChange={setCourseId}
              disabled={isLoading || !universityId}
            >
              <SelectTrigger className="h-11 text-left">
                {courseId ? (
                  <span>{courses.find((c) => c.id === courseId)?.name}</span>
                ) : (
                  <SelectValue
                    placeholder={
                      !universityId
                        ? "Seleziona prima l'università"
                        : universityCourses.length === 0
                        ? "Nessun corso disponibile"
                        : "Seleziona il tuo corso"
                    }
                  />
                )}
              </SelectTrigger>
              <SelectContent>
                {universityCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Anno (Opzionale) */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium text-muted-foreground">
              Anno di corso <span className="text-xs">(opzionale)</span>
            </Label>
            <Select
              value={year ? String(year) : ""}
              onValueChange={(value) => setYear(value ? parseInt(value, 10) : null)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-11 text-left">
                {year ? (
                  <span>{year}º Anno</span>
                ) : (
                  <SelectValue placeholder="Seleziona l'anno" />
                )}
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

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimo 6 caratteri"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              disabled={isLoading}
              className="h-11"
            />
          </div>

          {/* Rappresentante */}
          <div className="flex items-start space-x-3 rounded-lg border bg-muted/30 p-4">
            <Checkbox
              id="isRepresentative"
              checked={isRepresentative}
              onCheckedChange={(checked) => setIsRepresentative(checked === true)}
              className="mt-0.5"
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor="isRepresentative" className="text-sm cursor-pointer font-medium">
                Sono rappresentante di classe
              </Label>
              <p className="text-xs text-muted-foreground">
                Potrai generare link condivisibili per raccogliere domande d&apos;esame dalla tua classe
              </p>
            </div>
          </div>

          {/* Info box about email verification */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Dopo la registrazione, riceverai un&apos;email per verificare il tuo account.
                {/* TODO: Implement email verification */}
              </span>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creazione account...
              </>
            ) : (
              "Crea Account Gratuito"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Accedi
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
