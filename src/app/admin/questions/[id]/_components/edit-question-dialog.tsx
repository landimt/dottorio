"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: {
    id: string;
    text: string;
  };
}

export function EditQuestionDialog({
  open,
  onOpenChange,
  question,
}: EditQuestionDialogProps) {
  const t = useTranslations("admin.questionDetail.editDialog");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [text, setText] = useState(question.text);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error(t("textRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        throw new Error("Errore nel salvataggio");
      }

      toast.success(t("saved"));
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(tCommon("error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">{t("questionText")}</Label>
            <Textarea
              id="question-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("questionPlaceholder")}
              className="min-h-[120px]"
              disabled={isSaving}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !text.trim()}>
            {isSaving ? tCommon("loading") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
