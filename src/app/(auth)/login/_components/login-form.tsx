"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError("Email o password non validi");
        setIsLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Si è verificato un errore. Riprova.");
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl text-center">Accedi</CardTitle>
        <CardDescription className="text-center">
          Accedi al tuo account per continuare a studiare
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
              placeholder="La tua password"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accesso in corso...
              </>
            ) : (
              "Accedi"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <Button variant="link" className="text-muted-foreground hover:text-foreground">
            Ho dimenticato la password
          </Button>

          <div className="text-sm text-muted-foreground">
            Non hai un account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Registrati
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
