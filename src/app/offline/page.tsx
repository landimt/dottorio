"use client";

import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <WifiOff className="w-8 h-8 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Sei offline</h1>

        <p className="text-muted-foreground mb-8">
          Sembra che tu non sia connesso a Internet. Controlla la tua connessione
          e riprova.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="gap-2"
          size="lg"
        >
          <RefreshCw className="w-4 h-4" />
          Riprova
        </Button>

        <p className="text-sm text-muted-foreground mt-8">
          Alcune funzionalit&agrave; potrebbero essere disponibili offline se hai
          gi&agrave; visitato le pagine in precedenza.
        </p>
      </div>
    </div>
  );
}
