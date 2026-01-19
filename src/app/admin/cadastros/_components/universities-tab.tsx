"use client";

import { useState } from "react";
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
    channels: number;
  };
}

interface UniversitiesTabProps {
  universities: University[];
}

export function UniversitiesTab({ universities: initialUniversities }: UniversitiesTabProps) {
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
      toast.error("Nome é obrigatório");
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

      if (!response.ok) throw new Error("Erro ao salvar");

      const savedUniversity = await response.json();

      if (editingUniversity) {
        setUniversities(universities.map(u =>
          u.id === savedUniversity.id ? { ...savedUniversity, _count: u._count } : u
        ));
        toast.success("Universidade atualizada!");
      } else {
        setUniversities([...universities, { ...savedUniversity, _count: { professors: 0, users: 0, channels: 0 } }]);
        toast.success("Universidade criada!");
      }

      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erro ao salvar universidade");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta universidade?")) return;

    try {
      const response = await fetch(`/api/admin/universities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      setUniversities(universities.filter(u => u.id !== id));
      toast.success("Universidade excluída!");
    } catch {
      toast.error("Erro ao excluir universidade");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Universidades</CardTitle>
            <CardDescription>{universities.length} universidades cadastradas</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Universidade
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUniversity ? "Editar Universidade" : "Nova Universidade"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da universidade
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Sapienza Università di Roma"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="shortName">Sigla</Label>
                    <Input
                      id="shortName"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="Sapienza"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="emoji">Emoji</Label>
                    <Input
                      id="emoji"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder="🏛️"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Roma"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingUniversity ? "Salvar" : "Criar"}
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
              <TableHead>Nome</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  Profs
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
                  Canais
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
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
                <TableCell className="text-center">{university._count.channels}</TableCell>
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
