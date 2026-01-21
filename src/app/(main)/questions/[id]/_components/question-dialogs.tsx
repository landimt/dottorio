"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { GitBranch, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Question, QuestionVariation } from "./types";

interface QuestionDialogsProps {
  question: Question;
  variations: QuestionVariation[];
  isVariationsOpen: boolean;
  onVariationsClose: () => void;
  isLinkOpen: boolean;
  onLinkClose: () => void;
  isReportOpen: boolean;
  onReportClose: () => void;
  onNavigate: (id: string) => void;
}

/**
 * QuestionDialogs - All modal dialogs for QuestionDetail
 *
 * Contains:
 * - VariationsDialog - Show question variations
 * - LinkQuestionDialog - Link similar questions (WIP)
 * - ReportDialog - Report inappropriate content
 */
export function QuestionDialogs({
  question,
  variations,
  isVariationsOpen,
  onVariationsClose,
  isLinkOpen,
  onLinkClose,
  isReportOpen,
  onReportClose,
  onNavigate,
}: QuestionDialogsProps) {
  const t = useTranslations("question");
  const tCommon = useTranslations("common");

  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [reportReason, setReportReason] = useState("");

  const variationsCount = variations.length + 1;

  const handleNavigateToVariation = (id: string) => {
    onVariationsClose();
    onNavigate(id);
  };

  const handleSubmitReport = () => {
    // TODO: Implement report API
    toast.success("Denúncia enviada com sucesso!");
    setReportReason("");
    onReportClose();
  };

  return (
    <>
      {/* Variations Dialog */}
      <Dialog open={isVariationsOpen} onOpenChange={onVariationsClose}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-primary" />
              {t("variations.title")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("variations.description", { count: variationsCount })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Current Question */}
            <Card
              className={`p-4 ${
                question.isCanonical
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border"
              }`}
            >
              <div className="flex items-start gap-3">
                <Badge
                  className={
                    question.isCanonical
                      ? "bg-primary text-primary-foreground shrink-0"
                      : "bg-muted text-muted-foreground shrink-0"
                  }
                >
                  {question.isCanonical ? t("variations.main") : t("variations.current")}
                </Badge>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">{question.text}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{question.exam.professor?.name || "N/A"}</span>
                    <span>•</span>
                    <span>{question.exam.university.name}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* If current is not canonical, show the canonical question */}
            {!question.isCanonical && question.canonical && (
              <Card
                className="p-4 border-2 border-primary bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => handleNavigateToVariation(question.canonical!.id)}
              >
                <div className="flex items-start gap-3">
                  <Badge className="bg-primary text-primary-foreground shrink-0">
                    {t("variations.main")}
                  </Badge>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {question.canonical.text}
                    </p>
                    <p className="text-xs text-primary">{t("variations.viewMain")}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Other Variations */}
            {variations.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                  {t("variations.otherVariations")}
                </p>
                <div className="space-y-2">
                  {variations.map((variation, index) => (
                    <Card
                      key={variation.id}
                      className="p-4 border border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => handleNavigateToVariation(variation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 border-border text-muted-foreground"
                        >
                          #{index + 1}
                        </Badge>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm text-foreground">{variation.text}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span>{variation.exam.professor?.name || "N/A"}</span>
                            <span>•</span>
                            <span>{variation.exam.university.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(variation.createdAt).toLocaleDateString("it-IT")}
                            </span>
                            {variation._count.studentAnswers > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span>
                                    {t("variations.answers", {
                                      count: variation._count.studentAnswers,
                                    })}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button onClick={onVariationsClose} variant="outline" className="hover:bg-muted">
              {tCommon("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Question Dialog */}
      <Dialog open={isLinkOpen} onOpenChange={onLinkClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vincolar Questão</DialogTitle>
            <DialogDescription>
              Pesquise e vincule esta questão a outra semelhante para unir estatísticas e
              respostas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sua questão:</label>
              <div className="p-3 bg-muted rounded-md text-sm">{question.text}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pesquisar questão existente:
              </label>
              <input
                type="text"
                placeholder="Digite para pesquisar..."
                value={linkSearchQuery}
                onChange={(e) => setLinkSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {linkSearchQuery.length >= 3 && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Busca em desenvolvimento...
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onLinkClose}>
                Cancelar
              </Button>
              <Button onClick={onLinkClose} disabled>
                Vincolar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={onReportClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Denunciar Questão</DialogTitle>
            <DialogDescription>
              Ajude-nos a manter a qualidade da plataforma reportando conteúdo inadequado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Motivo da denúncia:</label>
              <Textarea
                placeholder="Descreva o motivo da denúncia..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onReportClose}>
                Cancelar
              </Button>
              <Button onClick={handleSubmitReport} disabled={!reportReason.trim()}>
                Enviar Denúncia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
