"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/lib/api/fetcher";
import { toast } from "sonner";

// ============================================================================
// Admin Query Keys - for consistent cache invalidation
// ============================================================================

export const adminKeys = {
  universities: {
    all: ["admin", "universities"] as const,
    detail: (id: string) => ["admin", "universities", id] as const,
  },
  courses: {
    all: ["admin", "courses"] as const,
    byUniversity: (universityId: string) => ["admin", "courses", "university", universityId] as const,
    detail: (id: string) => ["admin", "courses", id] as const,
  },
  subjects: {
    all: ["admin", "subjects"] as const,
    byCourse: (courseId: string) => ["admin", "subjects", "course", courseId] as const,
    detail: (id: string) => ["admin", "subjects", id] as const,
  },
  professors: {
    all: ["admin", "professors"] as const,
    byUniversity: (universityId: string) => ["admin", "professors", "university", universityId] as const,
    bySubject: (subjectId: string) => ["admin", "professors", "subject", subjectId] as const,
    detail: (id: string) => ["admin", "professors", id] as const,
  },
  users: {
    all: ["admin", "users"] as const,
  },
  contentFlags: {
    all: ["admin", "content-flags"] as const,
  },
};

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
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.detail(id) });
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
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
      toast.success("Università eliminata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione dell'università");
    },
  });
}

// ============================================================================
// Courses Admin Hooks
// ============================================================================

interface CreateCourseData {
  name: string;
  universityId: string;
  year?: number | null;
  emoji?: string;
  description?: string;
}

interface UpdateCourseData {
  name?: string;
  year?: number | null;
  emoji?: string;
  description?: string;
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseData) => API.admin.courses.create(data),
    onSuccess: (_, { universityId }) => {
      // Invalidate all course-related queries
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.byUniversity(universityId) });
      // Also invalidate university detail since it shows course count
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.detail(universityId) });
      toast.success("Corso creato con successo!");
    },
    onError: () => {
      toast.error("Errore nella creazione del corso");
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }) =>
      API.admin.courses.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.detail(id) });
      toast.success("Corso aggiornato con successo!");
    },
    onError: () => {
      toast.error("Errore nell'aggiornamento del corso");
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, universityId }: { id: string; universityId: string }) =>
      API.admin.courses.delete(id),
    onSuccess: (_, { universityId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.byUniversity(universityId) });
      // Also invalidate university since it shows course count
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.detail(universityId) });
      toast.success("Corso eliminato con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione del corso");
    },
  });
}

// ============================================================================
// Subjects Admin Hooks
// ============================================================================

interface CreateSubjectData {
  name: string;
  courseId: string;
  emoji?: string;
  color?: string;
  year?: number | null;
  semester?: number | null;
  credits?: number | null;
}

interface UpdateSubjectData {
  name?: string;
  emoji?: string;
  color?: string;
  year?: number | null;
  semester?: number | null;
  credits?: number | null;
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubjectData) => API.admin.subjects.create(data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.byCourse(courseId) });
      // Also invalidate course since it shows subject count
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.detail(courseId) });
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
    mutationFn: ({ id, data }: { id: string; data: UpdateSubjectData }) =>
      API.admin.subjects.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.detail(id) });
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
    mutationFn: ({ id, courseId }: { id: string; courseId: string }) =>
      API.admin.subjects.delete(id),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.byCourse(courseId) });
      // Also invalidate course since it shows subject count
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.courses.detail(courseId) });
      toast.success("Materia eliminata con successo!");
    },
    onError: () => {
      toast.error("Errore nell'eliminazione della materia");
    },
  });
}

// ============================================================================
// Subject-Professor Association Hooks
// ============================================================================

export function useAssociateProfessors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, professorIds }: { subjectId: string; professorIds: string[] }) =>
      API.admin.subjects.associateProfessors(subjectId, professorIds),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.bySubject(subjectId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.detail(subjectId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professori associati con successo!");
    },
    onError: () => {
      toast.error("Errore nell'associazione dei professori");
    },
  });
}

export function useDisassociateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, professorSubjectId }: { subjectId: string; professorSubjectId: string }) =>
      API.admin.subjects.disassociateProfessor(subjectId, professorSubjectId),
    onSuccess: (_, { subjectId }) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.bySubject(subjectId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.detail(subjectId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects.all });
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      toast.success("Professore disassociato con successo!");
    },
    onError: () => {
      toast.error("Errore nella disassociazione del professore");
    },
  });
}

// ============================================================================
// Professors Admin Hooks
// ============================================================================

interface CreateProfessorData {
  name: string;
  email?: string;
  universityId: string;
  subjectIds?: string[];
}

interface UpdateProfessorData {
  name?: string;
  email?: string;
  universityId?: string;
  subjectIds?: string[];
}

export function useCreateProfessor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfessorData) => API.admin.professors.create(data),
    onSuccess: (_, { universityId }) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.byUniversity(universityId) });
      // Also invalidate university since it shows professor count
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.detail(universityId) });
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
    mutationFn: ({ id, data }: { id: string; data: UpdateProfessorData }) =>
      API.admin.professors.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.detail(id) });
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
    mutationFn: ({ id, universityId }: { id: string; universityId: string }) =>
      API.admin.professors.delete(id),
    onSuccess: (_, { universityId }) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.professors.byUniversity(universityId) });
      // Also invalidate university since it shows professor count
      queryClient.invalidateQueries({ queryKey: adminKeys.universities.all });
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
