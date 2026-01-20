"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Search, Shield, ShieldCheck, User, UserX } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface UserType {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  year: number;
  isRepresentative: boolean;
  createdAt: Date;
  university: {
    id: string;
    name: string;
    shortName: string | null;
    emoji: string | null;
  };
  course: {
    id: string;
    name: string;
  } | null;
  _count: {
    exams: number;
    studentAnswers: number;
    comments: number;
  };
}

interface UsersTableProps {
  users: UserType[];
}

export function UsersTable({ users: initialUsers }: UsersTableProps) {
  const t = useTranslations("admin.usersPage");
  const tCommon = useTranslations("admin.common");

  const roleLabels: Record<string, { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    student: { label: t("roles.student"), icon: <User className="h-3 w-3" />, variant: "secondary" },
    representative: { label: t("roles.representative"), icon: <Shield className="h-3 w-3" />, variant: "outline" },
    admin: { label: t("roles.admin"), icon: <ShieldCheck className="h-3 w-3" />, variant: "default" },
    super_admin: { label: t("roles.super_admin"), icon: <ShieldCheck className="h-3 w-3" />, variant: "destructive" },
  };

  const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: t("statuses.active"), variant: "default" },
    suspended: { label: t("statuses.suspended"), variant: "outline" },
    banned: { label: t("statuses.banned"), variant: "destructive" },
  };

  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "student",
    status: "active",
  });

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      role: user.role,
      status: user.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Errore nel salvataggio");

      const updatedUser = await response.json();

      setUsers(users.map(u =>
        u.id === updatedUser.id ? { ...u, ...updatedUser } : u
      ));

      toast.success(t("userUpdated"));
      setIsDialogOpen(false);
    } catch {
      toast.error(t("updateError"));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("count", { count: users.length })}</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("university")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-center">{t("activity")}</TableHead>
              <TableHead>{t("registration")}</TableHead>
              <TableHead className="w-[80px]">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => {
              const roleInfo = roleLabels[user.role] || roleLabels.student;
              const statusInfo = statusLabels[user.status] || statusLabels.active;

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span>{user.university.emoji}</span>
                      <span className="text-sm">{user.university.shortName || user.university.name}</span>
                    </div>
                    {user.course && (
                      <div className="text-xs text-muted-foreground">{user.course.name} • {t("year", { year: user.year })}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleInfo.variant} className="flex w-fit items-center gap-1">
                      {roleInfo.icon}
                      {roleInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                      <span title={t("exams")}>{user._count.exams} {t("exams")}</span>
                      <span title={t("answers")}>{user._count.studentAnswers} {t("answers")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: it })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editUser")}</DialogTitle>
              <DialogDescription>
                {editingUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t("role")}</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {t("roles.student")}
                      </div>
                    </SelectItem>
                    <SelectItem value="representative">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {t("roles.representative")}
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        {t("roles.admin")}
                      </div>
                    </SelectItem>
                    <SelectItem value="super_admin">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-destructive" />
                        {t("roles.super_admin")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t("status")}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        {t("statuses.active")}
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        {t("statuses.suspended")}
                      </div>
                    </SelectItem>
                    <SelectItem value="banned">
                      <div className="flex items-center gap-2">
                        <UserX className="h-4 w-4 text-destructive" />
                        {t("statuses.banned")}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleSubmit}>
                {tCommon("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
