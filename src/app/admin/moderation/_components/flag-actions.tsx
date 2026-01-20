"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ContentFlag {
  id: string;
  type: string;
  entityId: string;
  reason: string;
  status: string;
  reporter: {
    name: string | null;
    email: string;
  } | null;
  createdAt: Date;
}

interface FlagActionsProps {
  flag: ContentFlag;
}

export function FlagActions({ flag }: FlagActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAction = async (action: "reviewed" | "dismissed" | "deleted") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/content-flags/${flag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Errore nell'azione");
      }

      const statusMessages = {
        reviewed: "Segnalazione rivista con successo",
        dismissed: "Segnalazione archiviata",
        deleted: "Contenuto eliminato con successo",
      };

      toast.success(statusMessages[action]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Errore nell'azione");
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (flag.status !== "pending") {
    return (
      <Badge variant={flag.status === "dismissed" ? "secondary" : "default"}>
        {flag.status === "reviewed" ? "Rivisto" : "Archiviato"}
      </Badge>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction("reviewed")}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Segna come rivisto
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("dismissed")}>
            <X className="mr-2 h-4 w-4 text-gray-500" />
            Archivia
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina contenuto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo contenuto ({flag.type})? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleAction("deleted")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
