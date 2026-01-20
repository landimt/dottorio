"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  ChevronRight,
  Search,
  FileText,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
} from "@/lib/query/hooks/use-admin";

interface Subject {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  semester: number | null;
  year: number | null;
  credits: number | null;
  _count: {
    professors: number;
    exams: number;
  };
}

interface SubjectsListProps {
  subjects: Subject[];
  courseId: string;
  courseName: string;
  courseYears: number;
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

export function SubjectsList({
  subjects: initialSubjects,
  courseId,
  courseYears,
}: SubjectsListProps) {
  const router = useRouter();
  const t = useTranslations("admin.subjectsPage");
  const tCommon = useTranslations("admin.common");

  const [subjects, setSubjects] = useState(initialSubjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    color: "blue",
    year: "",
    semester: "",
    credits: "",
  });

  // Mutations
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch = s.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesYear =
      yearFilter === "all" || s.year?.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      emoji: "",
      color: "blue",
      year: "",
      semester: "",
      credits: "",
    });
    setEditingSubject(null);
  };

  const openEditDialog = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      emoji: subject.emoji || "",
      color: subject.color || "blue",
      year: subject.year?.toString() || "",
      semester: subject.semester?.toString() || "",
      credits: subject.credits?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const subjectData = {
      name: formData.name.trim(),
      courseId,
      emoji: formData.emoji.trim() || undefined,
      color: formData.color || undefined,
      year: formData.year ? parseInt(formData.year) : null,
      semester: formData.semester ? parseInt(formData.semester) : null,
      credits: formData.credits ? parseInt(formData.credits) : null,
    };

    if (editingSubject) {
      updateSubjectMutation.mutate(
        {
          id: editingSubject.id,
          data: {
            name: subjectData.name,
            emoji: subjectData.emoji,
            color: subjectData.color,
            year: subjectData.year,
            semester: subjectData.semester,
            credits: subjectData.credits,
          },
        },
        {
          onSuccess: (savedSubject) => {
            setSubjects(
              subjects.map((s) =>
                s.id === editingSubject.id
                  ? { ...(savedSubject as Subject), _count: s._count }
                  : s
              )
            );
            setIsDialogOpen(false);
            resetForm();
            router.refresh();
          },
        }
      );
    } else {
      createSubjectMutation.mutate(subjectData, {
        onSuccess: (savedSubject) => {
          setSubjects([
            ...subjects,
            {
              ...(savedSubject as Subject),
              _count: { professors: 0, exams: 0 },
            },
          ]);
          setIsDialogOpen(false);
          resetForm();
          router.refresh();
        },
      });
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t("confirmDelete"))) return;

    deleteSubjectMutation.mutate(
      { id, courseId },
      {
        onSuccess: () => {
          setSubjects(subjects.filter((s) => s.id !== id));
          router.refresh();
        },
      }
    );
  };

  const navigateToProfessors = (subjectId: string) => {
    router.push(`/admin/cadastros/materias/${subjectId}`);
  };

  const getColorClass = (color: string | null) => {
    return colorOptions.find((c) => c.value === color)?.class || "bg-gray-500";
  };

  const isSubmitting =
    createSubjectMutation.isPending || updateSubjectMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("count", { count: subjects.length })}
            </CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
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
                <DialogDescription>{t("fillData")}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("name")} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={t("namePlaceholder")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="emoji">{t("emoji")}</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji}
                      onChange={(e) =>
                        setFormData({ ...formData, emoji: e.target.value })
                      }
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
                            formData.color === color.value
                              ? "ring-2 ring-offset-2 ring-primary"
                              : ""
                          }`}
                          onClick={() =>
                            setFormData({ ...formData, color: color.value })
                          }
                          title={color.value}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="year">{t("year")}</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        setFormData({ ...formData, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectYear")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: courseYears }, (_, i) => i + 1).map(
                          (y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}° {t("yearLabel")}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="semester">{t("semester")}</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) =>
                        setFormData({ ...formData, semester: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectSemester")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1° {t("semesterLabel")}</SelectItem>
                        <SelectItem value="2">2° {t("semesterLabel")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="credits">{t("credits")}</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="30"
                      value={formData.credits}
                      onChange={(e) =>
                        setFormData({ ...formData, credits: e.target.value })
                      }
                      placeholder="9"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? "..."
                    : editingSubject
                      ? tCommon("save")
                      : tCommon("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("allYears")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allYears")}</SelectItem>
                {Array.from({ length: courseYears }, (_, i) => i + 1).map(
                  (y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}° {t("yearLabel")}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead className="text-center">{t("yearSem")}</TableHead>
              <TableHead className="text-center">{t("credits")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {t("profs")}
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  {t("exams")}
                </div>
              </TableHead>
              <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow
                key={subject.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigateToProfessors(subject.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${getColorClass(
                        subject.color
                      )}`}
                    />
                    <span className="text-lg">{subject.emoji}</span>
                    <span className="font-medium">{subject.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {subject.year && subject.semester ? (
                    <Badge variant="outline">
                      {subject.year}° anno - {subject.semester}° sem
                    </Badge>
                  ) : subject.year ? (
                    <Badge variant="outline">{subject.year}° anno</Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {subject.credits ? `${subject.credits} CFU` : "-"}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {subject._count.professors}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {subject._count.exams}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => openEditDialog(subject, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(subject.id, e)}
                      disabled={deleteSubjectMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {filteredSubjects.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm || yearFilter !== "all"
                    ? t("noResults")
                    : t("noSubjects")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
