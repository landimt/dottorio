"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import { toast } from "sonner";

// ============================================================================
// Universities Admin Hooks
// ============================================================================

export function useCreateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; shortName?: string; city?: string; emoji?: string }) =>
      API.admin.universities.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("Università creata con successo!");
    },
    onError: () => {
      toast.error("Errore nella creazione dell'università");
    },
  });
}

export function useUpdateUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; shortName?: string; city?: string; emoji?: string } }) =>
      API.admin.universities.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("Università aggiornata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento dell'università");
    },
  });
}

export function useDeleteUniversity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => API.admin.universities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("Università eliminata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione dell'università");
    },
  });
}

// ============================================================================
// Subjects Admin Hooks
// ============================================================================

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; emoji?: string; color?: string }) =>
      API.admin.subjects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Materia creata con successo!");
    },
    onError: () => {
      toast.error("Errore nella creazione della materia");
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; emoji?: string; color?: string } }) =>
      API.admin.subjects.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Materia aggiornata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento della materia");
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => API.admin.subjects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Materia eliminata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione della materia");
    },
  });
}

// ============================================================================
// Professors Admin Hooks
// ============================================================================

export function useCreateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; universityId?: string; subjectIds?: string[] }) =>
      API.admin.professors.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professore creato con successo!");
    },
    onError: () => {
      toast.error("Errore nella creazione del professore");
    },
  });
}

export function useUpdateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; universityId?: string; subjectIds?: string[] } }) =>
      API.admin.professors.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professore aggiornato con successo!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento del professore");
    },
  });
}

export function useDeleteProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => API.admin.professors.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professore eliminato con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione del professore");
    },
  });
}

// ============================================================================
// Users Admin Hooks
// ============================================================================

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; role?: string; status?: string } }) =>
      API.admin.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Utente aggiornato con successo!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento dell'utente");
    },
  });
}

// ============================================================================
// Content Flags Admin Hooks
// ============================================================================

export function useReviewContentFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, action }: { id: string; status: string; action?: string }) =>
      fetch(`/api/admin/content-flags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, action }),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update flag");
        return res.json();
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "content-flags"] });
      const messages: Record<string, string> = {
        reviewed: "Segnalazione rivista con successo",
        dismissed: "Segnalazione archiviata",
        deleted: "Contenuto eliminato con successo",
      };
      toast.success(messages[variables.status] || "Azione completata");
    },
    onError: () => {
      toast.error("Errore nell'azione sulla segnalazione");
    },
  });
}
