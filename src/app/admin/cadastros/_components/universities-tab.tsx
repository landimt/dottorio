"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Users, GraduationCap, Hash } from "lucide-react";
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

interface UniversitiesTabProps {
  universities: University[];
}

export function UniversitiesTab({ universities: initialUniversities }: UniversitiesTabProps) {
  const t = useTranslations("admin.universitiesTab");
  const tCommon = useTranslations("admin.common");

  const [universities, setUniversities] = useState(initialUniversities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    city: "",
    emoji: "",
  });

  const resetForm = () => {
    setFormData({ name: "", shortName: "", city: "", emoji: "" });
    setEditingUniversity(null);
  };

  const openEditDialog = (university: University) => {
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
      toast.error(tCommon("nameRequired"));
      return;
    }

    try {
      const url = editingUniversity
        ? `/api/admin/universities/${editingUniversity.id}`
        : "/api/admin/universities";
      const method = editingUniversity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Errore nel salvataggio");

      const savedUniversity = await response.json();

      if (editingUniversity) {
        setUniversities(universities.map(u =>
          u.id === savedUniversity.id ? { ...savedUniversity, _count: u._count } : u
        ));
        toast.success(t("universityUpdated"));
      } else {
        setUniversities([...universities, { ...savedUniversity, _count: { professors: 0, users: 0, courses: 0 } }]);
        toast.success(t("universityCreated"));
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
      const response = await fetch(`/api/admin/universities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Errore nell'eliminazione");

      setUniversities(universities.filter(u => u.id !== id));
      toast.success(t("universityDeleted"));
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
            <CardDescription>{t("count", { count: universities.length })}</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
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
                    <Label htmlFor="shortName">{t("shortName")}</Label>
                    <Input
                      id="shortName"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder={t("shortNamePlaceholder")}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emoji">{t("emoji")}</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder={t("emojiPlaceholder")}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t("cityPlaceholder")}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {tCommon("cancel")}
                </Button>
                <Button onClick={handleSubmit}>
                  {editingUniversity ? tCommon("save") : tCommon("create")}
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
              <TableHead>{t("city")}</TableHead>
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
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Hash className="h-4 w-4" />
                  {t("channels")}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">{tCommon("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {universities.map((university) => (
              <TableRow key={university.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{university.emoji}</span>
                    <div>
                      <div className="font-medium">{university.name}</div>
                      {university.shortName && (
                        <div className="text-xs text-muted-foreground">{university.shortName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{university.city || "-"}</TableCell>
                <TableCell className="text-center">{university._count.professors}</TableCell>
                <TableCell className="text-center">{university._count.users}</TableCell>
                <TableCell className="text-center">{university._count.courses}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(university)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(university.id)}
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
