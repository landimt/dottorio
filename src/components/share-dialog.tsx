"use client";

import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Users, Globe, Lock } from "lucide-react";

interface ShareDialogProps {
  isOpen: boolean;
  onConfirm: (makePublic: boolean) => void;
  onCancel: () => void;
}

export function ShareDialog({ isOpen, onConfirm, onCancel }: ShareDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Compartilhar com a comunidade?</h3>
            <p className="text-sm text-muted-foreground">
              Quer tornar sua resposta pública e ajudar outros estudantes?
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => onConfirm(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Globe className="w-4 h-4 mr-2" />
            Sim, compartilhar publicamente
          </Button>
          <Button onClick={() => onConfirm(false)} variant="outline" className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Não, manter privado
          </Button>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            Cancelar
          </Button>
        </div>
      </Card>
    </div>
  );
}
