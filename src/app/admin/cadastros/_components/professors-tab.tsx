"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  emoji: string | null;
}

interface University {
  id: string;
  name: string;
  shortName: string | null;
  emoji: string | null;
}

interface Professor {
  id: string;
  name: string;
  university: University | null;
  subjects: { subject: Subject }[];
  _count: {
    exams: number;
  };
}

interface ProfessorsTabProps {
  professors: Professor[];
  universities: University[];
  subjects: Subject[];
}

export function ProfessorsTab({ professors: initialProfessors, universities, subjects }: ProfessorsTabProps) {
  const t = useTranslations("admin.professorsTab");
  const tCommon = useTranslations("admin.common");

  const [professors, setProfessors] = useState(initialProfessors);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    universityId: "",
    subjectIds: [] as string[],
  });

  const resetForm = () => {
    setFormData({ name: "", universityId: "", subjectIds: [] });
    setEditingProfessor(null);
  };

  const openEditDialog = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      name: professor.name,
      universityId: professor.university?.id || "",
      subjectIds: professor.subjects.map(s => s.subject.id),
    });
    setIsDialogOpen(true);
  };

  const toggleSubject = (subjectId: string) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter(id => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(tCommon("nameRequired"));
      return;
    }

    try {
      const url = editingProfessor
        ? `/api/admin/professors/${editingProfessor.id}`
        : "/api/admin/professors";
      const method = editingProfessor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Errore nel salvataggio");

      const savedProfessor = await response.json();

      // Rebuild professor object with relations
      const universityObj = universities.find(u => u.id === formData.universityId) || null;
      const subjectsObj = formData.subjectIds.map(id => ({
        subject: subjects.find(s => s.id === id)!,
      }));

      const fullProfessor = {
        ...savedProfessor,
        university: universityObj,
        subjects: subjectsObj,
        _count: editingProfessor?._count || { exams: 0 },
      };

      if (editingProfessor) {
        setProfessors(professors.map(p =>
          p.id === savedProfessor.id ? fullProfessor : p
        ));
        toast.success(t("professorUpdated"));
      } else {
        setProfessors([...professors, fullProfessor]);
        toast.success(t("professorCreated"));
      }

      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error(t("saveError"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;

    try {
      const response = await fetch(`/api/admin/professors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Errore nell'eliminazione");

      setProfessors(professors.filter(p => p.id !== id));
      toast.success(t("professorDeleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("count", { count: professors.length })}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("newProfessor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingProfessor ? t("editProfessor") : t("newProfessor")}
                </DialogTitle>
                <DialogDescription>
                  {t("fillData")}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("namePlaceholder")}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t("university")}</Label>
                  <Select
                    value={formData.universityId}
                    onValueChange={(value) => setFormData({ ...formData, universityId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectUniversity")} />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.emoji} {uni.shortName || uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t("subjects")}</Label>
                  <div className="max-h-48 overflow-y-auto rounded-md border p-3">
                    <div className="grid gap-2">
                      {subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`subject-${subject.id}`}
                            checked={formData.subjectIds.includes(subject.id)}
                            onCheckedChange={() => toggleSubject(subject.id)}
                          />
                          <label
                            htmlFor={`subject-${subject.id}`}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <span>{subject.emoji}</span>
                            <span>{subject.name}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {formData.subjectIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {t("subjectsSelected", { count: formData.subjectIds.length })}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingProfessor ? tCommon("save") : tCommon("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("university")}</TableHead>
              <TableHead>{t("subjects")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <BookMarked className="h-4 w-4" />
                  {t("exams")}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">{tCommon("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {professors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell className="font-medium">{professor.name}</TableCell>
                <TableCell>
                  {professor.university ? (
                    <div className="flex items-center gap-1">
                      <span>{professor.university.emoji}</span>
                      <span>{professor.university.shortName || professor.university.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {professor.subjects.length > 0 ? (
                      professor.subjects.map((ps) => (
                        <Badge key={ps.subject.id} variant="secondary" className="text-xs">
                          {ps.subject.emoji} {ps.subject.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">{professor._count.exams}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(professor)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(professor.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
