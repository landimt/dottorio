"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bot, Save, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/rich-text-editor";
import { toast } from "sonner";

interface AiAnswerEditorProps {
  questionId: string;
  initialData: {
    id: string;
    content: string;
    source: string | null;
    model: string | null;
  } | null;
}

export function AiAnswerEditor({ questionId, initialData }: AiAnswerEditorProps) {
  const t = useTranslations("admin.questionDetail.aiEditor");
  const tCommon = useTranslations("common");

  const [content, setContent] = useState(initialData?.content || "");
  const [source, setSource] = useState(initialData?.source || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(t("contentRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/questions/${questionId}/ai-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          source: source.trim() || undefined,
          model: model.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Errore nel salvataggio");
      }

      toast.success(t("saved"));
    } catch (error) {
      console.error("Error saving AI answer:", error);
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              {t("title")}
            </CardTitle>
            <CardDescription className="mt-1.5">{t("description")}</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {tCommon("loading")}
              </>
            ) : initialData ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t("update")}
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {t("create")}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        {/* Content Editor */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="content" className="text-sm font-medium">{t("content")}</Label>
            <p className="text-xs text-muted-foreground mt-1">{t("contentHelp")}</p>
          </div>
          <div className="border rounded-lg">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder={t("contentPlaceholder")}
              editable={true}
            />
          </div>
        </div>

        {/* Source and Model - Side by side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Source */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="source" className="text-sm font-medium">{t("source")}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t("sourceHelp")}</p>
            </div>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={t("sourcePlaceholder")}
            />
          </div>

          {/* Model */}
          <div className="space-y-2">
            <div>
              <Label htmlFor="model" className="text-sm font-medium">{t("model")}</Label>
              <p className="text-xs text-muted-foreground mt-1">{t("modelHelp")}</p>
            </div>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t("modelPlaceholder")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
