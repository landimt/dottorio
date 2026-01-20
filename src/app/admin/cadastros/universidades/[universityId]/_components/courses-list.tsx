"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  ChevronRight,
  Search,
  FileText,
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
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
} from "@/lib/query/hooks/use-admin";

interface Course {
  id: string;
  name: string;
  year: number | null;
  emoji: string | null;
  description: string | null;
  _count: {
    subjects: number;
    users: number;
    exams: number;
  };
}

interface CoursesListProps {
  courses: Course[];
  universityId: string;
  universityName: string;
}

export function CoursesList({
  courses: initialCourses,
  universityId,
}: CoursesListProps) {
  const router = useRouter();
  const t = useTranslations("admin.coursesPage");
  const tCommon = useTranslations("admin.common");

  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    emoji: "",
    description: "",
  });

  // Mutations
  const createCourseMutation = useCreateCourse();
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  const filteredCourses = courses.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", year: "", emoji: "", description: "" });
    setEditingCourse(null);
  };

  const openEditDialog = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCourse(course);
    setFormData({
      name: course.name,
      year: course.year?.toString() || "",
      emoji: course.emoji || "",
      description: course.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const courseData = {
      name: formData.name.trim(),
      universityId,
      year: formData.year ? parseInt(formData.year) : null,
      emoji: formData.emoji.trim() || undefined,
      description: formData.description.trim() || undefined,
    };

    if (editingCourse) {
      updateCourseMutation.mutate(
        {
          id: editingCourse.id,
          data: {
            name: courseData.name,
            year: courseData.year,
            emoji: courseData.emoji,
            description: courseData.description,
          },
        },
        {
          onSuccess: (savedCourse) => {
            setCourses(
              courses.map((c) =>
                c.id === editingCourse.id
                  ? { ...(savedCourse as Course), _count: c._count }
                  : c
              )
            );
            setIsDialogOpen(false);
            resetForm();
            router.refresh();
          },
        }
      );
    } else {
      createCourseMutation.mutate(courseData, {
        onSuccess: (savedCourse) => {
          setCourses([
            ...courses,
            {
              ...(savedCourse as Course),
              _count: { subjects: 0, users: 0, exams: 0 },
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

    deleteCourseMutation.mutate(
      { id, universityId },
      {
        onSuccess: () => {
          setCourses(courses.filter((c) => c.id !== id));
          router.refresh();
        },
      }
    );
  };

  const navigateToSubjects = (courseId: string) => {
    router.push(`/admin/cadastros/cursos/${courseId}`);
  };

  const isSubmitting =
    createCourseMutation.isPending || updateCourseMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("count", { count: courses.length })}
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
                {t("newCourse")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? t("editCourse") : t("newCourse")}
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
                    <Label htmlFor="year">{t("duration")}</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) =>
                        setFormData({ ...formData, year: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectDuration")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">
                          {t("years", { count: 3 })}
                        </SelectItem>
                        <SelectItem value="5">
                          {t("years", { count: 5 })}
                        </SelectItem>
                        <SelectItem value="6">
                          {t("years", { count: 6 })}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t("description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={t("descriptionPlaceholder")}
                    rows={2}
                  />
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
                    : editingCourse
                      ? tCommon("save")
                      : tCommon("create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead className="text-center">{t("duration")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {t("subjects")}
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  {t("exams")}
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4" />
                  {t("students")}
                </div>
              </TableHead>
              <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow
                key={course.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigateToSubjects(course.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{course.emoji}</span>
                    <div>
                      <div className="font-medium">{course.name}</div>
                      {course.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {course.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {course.year ? `${course.year} anni` : "-"}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {course._count.subjects}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {course._count.exams}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {course._count.users}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => openEditDialog(course, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(course.id, e)}
                      disabled={deleteCourseMutation.isPending}
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
            {filteredCourses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm ? t("noResults") : t("noCourses")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
