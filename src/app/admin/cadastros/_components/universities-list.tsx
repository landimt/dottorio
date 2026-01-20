"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Search,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateUniversity,
  useUpdateUniversity,
  useDeleteUniversity,
} from "@/lib/query/hooks/use-admin";

interface University {
  id: string;
  name: string;
  shortName: string | null;
  city: string | null;
  emoji: string | null;
  _count: {
    professors: number;
    users: number;
    courses: number;
  };
}

interface UniversitiesListProps {
  universities: University[];
}

export function UniversitiesList({
  universities: initialUniversities,
}: UniversitiesListProps) {
  const router = useRouter();
  const t = useTranslations("admin.universitiesTab");
  const tCommon = useTranslations("admin.common");

  const [universities, setUniversities] = useState(initialUniversities);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] =
    useState<University | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    city: "",
    emoji: "",
  });

  // Mutations
  const createUniversityMutation = useCreateUniversity();
  const updateUniversityMutation = useUpdateUniversity();
  const deleteUniversityMutation = useDeleteUniversity();

  const filteredUniversities = universities.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ name: "", shortName: "", city: "", emoji: "" });
    setEditingUniversity(null);
  };

  const openEditDialog = (university: University, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUniversity(university);
    setFormData({
      name: university.name,
      shortName: university.shortName || "",
      city: university.city || "",
      emoji: university.emoji || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    const universityData = {
      name: formData.name.trim(),
      shortName: formData.shortName.trim() || undefined,
      city: formData.city.trim() || undefined,
      emoji: formData.emoji.trim() || undefined,
    };

    if (editingUniversity) {
      updateUniversityMutation.mutate(
        { id: editingUniversity.id, data: universityData },
        {
          onSuccess: (savedUniversity) => {
            setUniversities(
              universities.map((u) =>
                u.id === editingUniversity.id
                  ? { ...(savedUniversity as University), _count: u._count }
                  : u
              )
            );
            setIsDialogOpen(false);
            resetForm();
            router.refresh();
          },
        }
      );
    } else {
      createUniversityMutation.mutate(universityData, {
        onSuccess: (savedUniversity) => {
          setUniversities([
            ...universities,
            {
              ...(savedUniversity as University),
              _count: { professors: 0, users: 0, courses: 0 },
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

    deleteUniversityMutation.mutate(id, {
      onSuccess: () => {
        setUniversities(universities.filter((u) => u.id !== id));
        router.refresh();
      },
    });
  };

  const navigateToCourses = (universityId: string) => {
    router.push(`/admin/cadastros/universidades/${universityId}`);
  };

  const isSubmitting =
    createUniversityMutation.isPending || updateUniversityMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("count", { count: universities.length })}
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
                {t("newUniversity")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUniversity ? t("editUniversity") : t("newUniversity")}
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
                    <Label htmlFor="shortName">{t("shortName")}</Label>
                    <Input
                      id="shortName"
                      value={formData.shortName}
                      onChange={(e) =>
                        setFormData({ ...formData, shortName: e.target.value })
                      }
                      placeholder={t("shortNamePlaceholder")}
                    />
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
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder={t("cityPlaceholder")}
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
                    : editingUniversity
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
              <TableHead>{t("city")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {t("channels")}
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {t("profs")}
                </div>
              </TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Users className="h-4 w-4" />
                  Users
                </div>
              </TableHead>
              <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUniversities.map((university) => (
              <TableRow
                key={university.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigateToCourses(university.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{university.emoji}</span>
                    <div>
                      <div className="font-medium">{university.name}</div>
                      {university.shortName && (
                        <div className="text-xs text-muted-foreground">
                          {university.shortName}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {university.city || "-"}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {university._count.courses}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {university._count.professors}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {university._count.users}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => openEditDialog(university, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(university.id, e)}
                      disabled={deleteUniversityMutation.isPending}
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
            {filteredUniversities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm ? t("noResults") : t("noUniversities")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
