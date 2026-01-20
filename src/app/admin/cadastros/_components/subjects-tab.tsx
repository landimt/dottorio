"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, GraduationCap, BookMarked } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  _count: {
    professors: number;
    exams: number;
  };
}

interface SubjectsTabProps {
  subjects: Subject[];
}

const colorOptions = [
  { value: "red", class: "bg-red-500" },
  { value: "orange", class: "bg-orange-500" },
  { value: "yellow", class: "bg-yellow-500" },
  { value: "green", class: "bg-green-500" },
  { value: "teal", class: "bg-teal-500" },
  { value: "blue", class: "bg-blue-500" },
  { value: "indigo", class: "bg-indigo-500" },
  { value: "purple", class: "bg-purple-500" },
  { value: "pink", class: "bg-pink-500" },
  { value: "rose", class: "bg-rose-500" },
  { value: "gray", class: "bg-gray-500" },
];

export function SubjectsTab({ subjects: initialSubjects }: SubjectsTabProps) {
  const t = useTranslations("admin.subjectsTab");
  const tCommon = useTranslations("admin.common");

  const [subjects, setSubjects] = useState(initialSubjects);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    color: "blue",
  });

  const resetForm = () => {
    setFormData({ name: "", emoji: "", color: "blue" });
    setEditingSubject(null);
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      emoji: subject.emoji || "",
      color: subject.color || "blue",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error(tCommon("nameRequired"));
      return;
    }

    try {
      const url = editingSubject
        ? `/api/admin/subjects/${editingSubject.id}`
        : "/api/admin/subjects";
      const method = editingSubject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Errore nel salvataggio");

      const savedSubject = await response.json();

      if (editingSubject) {
        setSubjects(subjects.map(s =>
          s.id === savedSubject.id ? { ...savedSubject, _count: s._count } : s
        ));
        toast.success(t("subjectUpdated"));
      } else {
        setSubjects([...subjects, { ...savedSubject, _count: { professors: 0, exams: 0 } }]);
        toast.success(t("subjectCreated"));
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
      const response = await fetch(`/api/admin/subjects/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Errore nell'eliminazione");

      setSubjects(subjects.filter(s => s.id !== id));
      toast.success(t("subjectDeleted"));
    } catch {
      toast.error(t("deleteError"));
    }
  };

  const getColorClass = (color: string | null) => {
    return colorOptions.find(c => c.value === color)?.class || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("count", { count: subjects.length })}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("newSubject")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? t("editSubject") : t("newSubject")}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="emoji">{t("emoji")}</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder={t("emojiPlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("color")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`h-6 w-6 rounded-full ${color.class} ${
                            formData.color === color.value ? "ring-2 ring-offset-2 ring-primary" : ""
                          }`}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          title={color.value}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingSubject ? tCommon("save") : tCommon("create")}
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
              <TableHead>{t("color")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {t("profs")}
                </div>
              </TableHead>
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
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{subject.emoji}</span>
                    <span className="font-medium">{subject.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`h-4 w-4 rounded-full ${getColorClass(subject.color)}`} />
                    <span className="text-sm text-muted-foreground">{subject.color}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">{subject._count.professors}</TableCell>
                <TableCell className="text-center">{subject._count.exams}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(subject)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(subject.id)}
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
