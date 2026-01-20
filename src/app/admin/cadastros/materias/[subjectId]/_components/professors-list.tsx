"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus,
  Trash2,
  Search,
  FileText,
  UserPlus,
  Mail,
  ExternalLink,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  useCreateProfessor,
  useAssociateProfessors,
  useDisassociateProfessor,
} from "@/lib/query/hooks/use-admin";

interface Professor {
  id: string;
  name: string;
  email: string | null;
  professorSubjectId: string;
  _count: {
    exams: number;
  };
}

interface AvailableProfessor {
  id: string;
  name: string;
  email: string | null;
}

interface ProfessorsListProps {
  professors: Professor[];
  availableProfessors: AvailableProfessor[];
  subjectId: string;
  subjectName: string;
  universityId: string;
}

export function ProfessorsList({
  professors: initialProfessors,
  availableProfessors: initialAvailableProfessors,
  subjectId,
  universityId,
}: ProfessorsListProps) {
  const router = useRouter();
  const t = useTranslations("admin.professorsPage");
  const tCommon = useTranslations("admin.common");

  const [professors, setProfessors] = useState(initialProfessors);
  const [availableProfessors, setAvailableProfessors] = useState(
    initialAvailableProfessors
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProfessors, setSelectedProfessors] = useState<string[]>([]);
  const [dialogSearchTerm, setDialogSearchTerm] = useState("");
  const [newProfessorName, setNewProfessorName] = useState("");
  const [newProfessorEmail, setNewProfessorEmail] = useState("");

  // Mutations
  const createProfessorMutation = useCreateProfessor();
  const associateProfessorsMutation = useAssociateProfessors();
  const disassociateProfessorMutation = useDisassociateProfessor();

  const filteredProfessors = professors.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableProfessors = availableProfessors.filter((p) =>
    p.name?.toLowerCase().includes(dialogSearchTerm.toLowerCase())
  );

  const resetDialog = () => {
    setSelectedProfessors([]);
    setDialogSearchTerm("");
    setNewProfessorName("");
    setNewProfessorEmail("");
  };

  const toggleProfessorSelection = (professorId: string) => {
    setSelectedProfessors((prev) =>
      prev.includes(professorId)
        ? prev.filter((id) => id !== professorId)
        : [...prev, professorId]
    );
  };

  const handleAssociate = async () => {
    if (selectedProfessors.length === 0 && !newProfessorName.trim()) {
      return;
    }

    const professorsToAssociate = [...selectedProfessors];

    // Helper function to associate professors
    const doAssociate = (profIds: string[]) => {
      associateProfessorsMutation.mutate(
        { subjectId, professorIds: profIds },
        {
          onSuccess: (result) => {
            const data = result as { professors: Professor[] };
            setProfessors([...professors, ...data.professors]);
            setAvailableProfessors(
              availableProfessors.filter((p) => !profIds.includes(p.id))
            );
            setIsDialogOpen(false);
            resetDialog();
            router.refresh();
          },
        }
      );
    };

    // If creating a new professor
    if (newProfessorName.trim()) {
      createProfessorMutation.mutate(
        {
          name: newProfessorName.trim(),
          email: newProfessorEmail.trim() || undefined,
          universityId,
        },
        {
          onSuccess: (result) => {
            const newProfessor = result as { id: string };
            professorsToAssociate.push(newProfessor.id);
            doAssociate(professorsToAssociate);
          },
        }
      );
    } else {
      doAssociate(professorsToAssociate);
    }
  };

  const handleDisassociate = async (
    professorSubjectId: string,
    professorId: string
  ) => {
    if (!confirm(t("confirmDisassociate"))) return;

    // Find the professor being removed to add back to available
    const removedProfessor = professors.find((p) => p.id === professorId);

    disassociateProfessorMutation.mutate(
      { subjectId, professorSubjectId },
      {
        onSuccess: () => {
          setProfessors(professors.filter((p) => p.id !== professorId));

          if (removedProfessor) {
            setAvailableProfessors([
              ...availableProfessors,
              {
                id: removedProfessor.id,
                name: removedProfessor.name,
                email: removedProfessor.email,
              },
            ]);
          }
          router.refresh();
        },
      }
    );
  };

  const isSubmitting =
    createProfessorMutation.isPending || associateProfessorsMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>
              {t("count", { count: professors.length })}
            </CardDescription>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetDialog();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t("associateProfessor")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("associateProfessorTitle")}</DialogTitle>
                <DialogDescription>
                  {t("associateProfessorDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Search existing professors */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={t("searchProfessorPlaceholder")}
                      value={dialogSearchTerm}
                      onChange={(e) => setDialogSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Available professors list */}
                  <div className="max-h-[200px] overflow-y-auto border rounded-md">
                    {filteredAvailableProfessors.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {dialogSearchTerm
                          ? t("noResultsFound")
                          : t("noProfessorsAvailable")}
                      </p>
                    ) : (
                      filteredAvailableProfessors.map((professor) => (
                        <div
                          key={professor.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                          onClick={() => toggleProfessorSelection(professor.id)}
                        >
                          <Checkbox
                            checked={selectedProfessors.includes(professor.id)}
                            onCheckedChange={() =>
                              toggleProfessorSelection(professor.id)
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {professor.name}
                            </p>
                            {professor.email && (
                              <p className="text-sm text-muted-foreground truncate">
                                {professor.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Separator />

                {/* Create new professor section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Plus className="h-4 w-4" />
                    {t("orCreateNew")}
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="newName">{t("professorName")}</Label>
                      <Input
                        id="newName"
                        value={newProfessorName}
                        onChange={(e) => setNewProfessorName(e.target.value)}
                        placeholder={t("professorNamePlaceholder")}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="newEmail">{t("professorEmail")}</Label>
                      <Input
                        id="newEmail"
                        type="email"
                        value={newProfessorEmail}
                        onChange={(e) => setNewProfessorEmail(e.target.value)}
                        placeholder={t("professorEmailPlaceholder")}
                      />
                    </div>
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
                <Button onClick={handleAssociate} disabled={isSubmitting}>
                  {isSubmitting ? t("associating") : t("associate")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {professors.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("professorName")}</TableHead>
              <TableHead>{t("professorEmail")}</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  {t("exams")}
                </div>
              </TableHead>
              <TableHead className="w-[120px]">{tCommon("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfessors.map((professor) => (
              <TableRow key={professor.id}>
                <TableCell>
                  <span className="font-medium">{professor.name}</span>
                </TableCell>
                <TableCell>
                  {professor.email ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{professor.email}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {professor._count.exams}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        window.open(
                          `/admin/professores/${professor.id}`,
                          "_blank"
                        )
                      }
                      title={t("viewDetails")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDisassociate(
                          professor.professorSubjectId,
                          professor.id
                        )
                      }
                      disabled={disassociateProfessorMutation.isPending}
                      title={t("disassociate")}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProfessors.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm ? t("noResults") : t("noProfessors")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
