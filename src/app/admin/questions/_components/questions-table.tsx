"use client";

import { useState } from "react";
import { Eye, Link2, MessageSquare, Search, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  views: number;
  timesAsked: number;
  isCanonical: boolean;
  groupId: string | null;
  createdAt: Date;
  exam: {
    subject: { name: string; emoji: string | null };
    professor: { name: string } | null;
    university: { shortName: string | null; name: string };
  };
  canonical: { id: string; text: string } | null;
  _count: {
    variations: number;
    studentAnswers: number;
    comments: number;
  };
}

interface QuestionsTableProps {
  questions: Question[];
}

export function QuestionsTable({ questions: initialQuestions }: QuestionsTableProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.exam.subject.name.toLowerCase().includes(search.toLowerCase()) ||
    q.exam.professor?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta questão?")) return;

    try {
      const response = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir");

      setQuestions(questions.filter(q => q.id !== id));
      toast.success("Questão excluída!");
    } catch {
      toast.error("Erro ao excluir questão");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lista de Questões</CardTitle>
            <CardDescription>{questions.length} questões (últimas 100)</CardDescription>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar questão, matéria ou professor..."
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
              <TableHead className="w-[400px]">Questão</TableHead>
              <TableHead>Matéria</TableHead>
              <TableHead>Professor</TableHead>
              <TableHead className="text-center">Stats</TableHead>
              <TableHead>Links</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-sm">{question.text}</p>
                    <div className="flex items-center gap-2">
                      {question.isCanonical ? (
                        <Badge variant="default" className="text-xs">
                          Canonical
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Variação
                        </Badge>
                      )}
                      {question._count.variations > 0 && (
                        <span className="text-xs text-muted-foreground">
                          +{question._count.variations} variações
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span>{question.exam.subject.emoji}</span>
                    <span className="text-sm">{question.exam.subject.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {question.exam.professor?.name || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1" title="Visualizações">
                      <Eye className="h-3 w-3" />
                      {question.views}
                    </span>
                    <span className="flex items-center gap-1" title="Respostas">
                      <MessageSquare className="h-3 w-3" />
                      {question._count.studentAnswers}
                    </span>
                    <span title="Vezes perguntada">
                      x{question.timesAsked}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {question.groupId ? (
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Grupo
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(question.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
