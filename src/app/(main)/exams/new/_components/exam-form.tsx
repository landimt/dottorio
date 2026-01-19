"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, ArrowLeft, Plus, X, Link2, Copy } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  universityId: string;
}

interface ExamFormProps {
  subjects: Subject[];
  professors: Professor[];
  universities: University[];
  channels: Channel[];
}

export function ExamForm({ subjects, professors, universities, channels }: ExamFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Prefill data from URL params (shared links)
  const prefillData = {
    subject: searchParams.get("subject") || "",
    professor: searchParams.get("professor") || "",
    channelId: searchParams.get("channelId") || "",
  };

  const hasPrefill = prefillData.subject || prefillData.professor || prefillData.channelId;

  const [formData, setFormData] = useState({
    universityId: session?.user?.universityId || "",
    year: session?.user?.year || 1, // Now a number (1-6)
    channelId: prefillData.channelId,
    subjectId: prefillData.subject,
    professorId: prefillData.professor,
    questions: [""], // Array of questions
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareableLink, setShareableLink] = useState("");

  // Update form if prefillData changes
  useEffect(() => {
    if (hasPrefill) {
      setFormData((prev) => ({
        ...prev,
        channelId: prefillData.channelId || prev.channelId,
        subjectId: prefillData.subject || prev.subjectId,
        professorId: prefillData.professor || prev.professorId,
      }));
    }
  }, [hasPrefill, prefillData.channelId, prefillData.subject, prefillData.professor]);

  // Update university from session
  useEffect(() => {
    if (session?.user?.universityId) {
      setFormData((prev) => ({
        ...prev,
        universityId: session.user.universityId || "",
        year: session.user.year || prev.year,
      }));
    }
  }, [session?.user?.universityId, session?.user?.year]);

  // Years as numbers (1-6)
  const years = [1, 2, 3, 4, 5, 6];

  // Filter channels by user's university
  const universityChannels = channels.filter(
    (ch) => ch.universityId === formData.universityId
  );

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add new question
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  // Remove specific question
  const handleRemoveQuestion = (index: number) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  // Update specific question text
  const handleQuestionChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter empty questions
    const filledQuestions = formData.questions.filter((q) => q.trim());
    if (filledQuestions.length === 0) return;

    setIsSubmitting(true);

    try {
      // First, create or find an exam
      const examResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: formData.subjectId,
          professorId: formData.professorId,
          universityId: formData.universityId,
          channelId: formData.channelId || undefined,
          year: formData.year || undefined,
        }),
      });

      if (!examResponse.ok) {
        throw new Error("Errore nella creazione dell'esame");
      }

      const exam = await examResponse.json();

      // Then, create all questions for this exam
      const questionPromises = filledQuestions.map((text) =>
        fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            text,
          }),
        })
      );

      await Promise.all(questionPromises);

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting questions:", error);
      toast.error("Errore durante l'invio delle domande");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate shareable link (only for class representatives)
  const handleGenerateShareableLink = () => {
    if (!formData.subjectId || !formData.professorId) {
      toast.error("Seleziona materia e professore prima di generare il link");
      return;
    }

    const baseUrl = window.location.origin + "/exams/new";
    const params = new URLSearchParams({
      subject: formData.subjectId,
      professor: formData.professorId,
      ...(formData.channelId && { channelId: formData.channelId }),
    });

    const link = `${baseUrl}?${params.toString()}`;
    setShareableLink(link);
    setShowShareDialog(true);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      toast.success("Link copiato negli appunti!");
    } catch {
      toast.error("Errore durante la copia del link");
    }
  };

  // Check if at least one question is filled
  const hasValidQuestion = formData.questions.some((q) => q.trim());

  // Get display names for prefill data
  const getSubjectName = (id: string) => subjects.find((s) => s.id === id)?.name || id;
  const getProfessorName = (id: string) => professors.find((p) => p.id === id)?.name || id;
  const getUniversityName = (id: string) => universities.find((u) => u.id === id)?.name || id;
  const getChannelName = (id: string) => channels.find((c) => c.id === id)?.name || id;
  const getYearLabel = (year: number) => `${year}º Anno`;

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-border text-center animate-scale-in">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8 text-accent-foreground" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              {formData.questions.filter((q) => q.trim()).length > 1
                ? "Domande Inviate!"
                : "Domanda Inviata!"}
            </h2>
            <p className="text-muted-foreground">
              Grazie per aver contribuito alla comunità.{" "}
              {formData.questions.filter((q) => q.trim()).length > 1
                ? "Le tue domande saranno verificate"
                : "La tua domanda sarà verificata"}{" "}
              e presto{" "}
              {formData.questions.filter((q) => q.trim()).length > 1
                ? "saranno disponibili"
                : "sarà disponibile"}{" "}
              per altri studenti.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Banner for shared links */}
        {hasPrefill && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] dark:from-[#005A9C]/20 dark:via-[#005A9C]/10 dark:to-[#005A9C]/5 border-2 border-primary/30 shadow-lg animate-slide-in-up">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

            <div className="relative p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center animate-bounce">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">
                    Link Condiviso dal Rappresentante! 🎉
                  </h3>
                  <p className="text-sm text-primary/80">
                    I campi sono già precompilati - aggiungi solo le tue domande
                  </p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {prefillData.subject && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">Materia</p>
                    <p className="font-medium text-foreground">
                      {getSubjectName(prefillData.subject)}
                    </p>
                  </div>
                )}
                {prefillData.professor && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">Professore</p>
                    <p className="font-medium text-foreground">
                      {getProfessorName(prefillData.professor)}
                    </p>
                  </div>
                )}
                {prefillData.channelId && (
                  <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3 border border-primary/20 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">Canale</p>
                    <p className="font-medium text-foreground">{getChannelName(prefillData.channelId)}</p>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm text-primary/90">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Scorri in basso per aggiungere le domande dell&apos;esame</span>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna alla Dashboard
          </Button>

          {!hasPrefill && (
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-medium text-foreground">
                Contribuisci alla Comunità
              </h1>
              <p className="text-muted-foreground">
                Aggiungi le domande che sono state fatte nel tuo esame orale per aiutare
                altri studenti
              </p>
            </div>
          )}
        </div>

        {/* Form Card */}
        <Card className="bg-card border-border animate-slide-in-up">
          <CardHeader className="border-b border-border">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <CardTitle className="text-foreground">
                  Informazioni sulla Domanda
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Compila i campi con precisione in modo che altri studenti possano
                  trovarle facilmente
                </CardDescription>
              </div>

              {/* Generate link button - only for class representatives */}
              {session?.user?.isRepresentative && (
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-30 group-hover:opacity-60 transition-all" />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateShareableLink}
                    className="relative flex-shrink-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                    disabled={!formData.subjectId || !formData.professorId}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Genera Link
                    <span className="ml-2 text-xs opacity-75">✨</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-foreground">
                    Università
                  </Label>
                  <Input
                    id="university"
                    value={getUniversityName(formData.universityId)}
                    disabled
                    className="bg-muted border-border text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-foreground">
                    Anno del Corso
                  </Label>
                  <Select
                    value={formData.year ? String(formData.year) : ""}
                    onValueChange={(value) => handleInputChange("year", parseInt(value, 10))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      {formData.year ? (
                        <span>{formData.year}º Anno</span>
                      ) : (
                        <SelectValue placeholder="Seleziona l'anno" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {years.map((year) => (
                        <SelectItem
                          key={year}
                          value={String(year)}
                          className="text-foreground focus:bg-[#FEF2F2] focus:text-[#DC2626] data-[state=checked]:bg-[#FFE4E6] data-[state=checked]:text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                        >
                          {year}º Anno
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="channel" className="text-foreground flex items-center gap-2">
                    Canale
                    {prefillData.channelId && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Precompilato
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.channelId}
                    onValueChange={(value) => handleInputChange("channelId", value)}
                  >
                    <SelectTrigger
                      disabled={!!prefillData.channelId || universityChannels.length === 0}
                      className={`${
                        prefillData.channelId
                          ? "bg-primary/5 border-primary/30 text-primary cursor-not-allowed"
                          : "bg-input border-border text-foreground"
                      }`}
                    >
                      {formData.channelId ? (
                        <span>{getChannelName(formData.channelId)}</span>
                      ) : (
                        <SelectValue placeholder={universityChannels.length === 0 ? "Nessun canale disponibile" : "Seleziona il canale"} />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {universityChannels.map((channel) => (
                        <SelectItem
                          key={channel.id}
                          value={channel.id}
                          className="text-foreground focus:bg-[#FEF2F2] focus:text-[#DC2626] data-[state=checked]:bg-[#FFE4E6] data-[state=checked]:text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                        >
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 relative">
                  <Label htmlFor="subject" className="text-foreground flex items-center gap-2">
                    Materia
                    {prefillData.subject && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Precompilato
                      </span>
                    )}
                  </Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => handleInputChange("subjectId", value)}
                  >
                    <SelectTrigger
                      disabled={!!prefillData.subject}
                      className={`${
                        prefillData.subject
                          ? "bg-primary/5 border-primary/30 text-primary cursor-not-allowed"
                          : "bg-input border-border text-foreground"
                      }`}
                    >
                      {formData.subjectId ? (
                        <span>{getSubjectName(formData.subjectId)}</span>
                      ) : (
                        <SelectValue placeholder="Seleziona la materia" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {subjects.map((subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.id}
                          className="text-foreground focus:bg-[#FEF2F2] focus:text-[#DC2626] data-[state=checked]:bg-[#FFE4E6] data-[state=checked]:text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="professor" className="text-foreground flex items-center gap-2">
                  Professore
                  {prefillData.professor && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Precompilato
                    </span>
                  )}
                </Label>
                <Select
                  value={formData.professorId}
                  onValueChange={(value) => handleInputChange("professorId", value)}
                >
                  <SelectTrigger
                    disabled={!!prefillData.professor}
                    className={`${
                      prefillData.professor
                        ? "bg-primary/5 border-primary/30 text-primary cursor-not-allowed"
                        : "bg-input border-border text-foreground"
                    }`}
                  >
                    {formData.professorId ? (
                      <span>{getProfessorName(formData.professorId)}</span>
                    ) : (
                      <SelectValue placeholder="Seleziona il professore" />
                    )}
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {professors.map((professor) => (
                      <SelectItem
                        key={professor.id}
                        value={professor.id}
                        className="text-foreground focus:bg-[#FEF2F2] focus:text-[#DC2626] data-[state=checked]:bg-[#FFE4E6] data-[state=checked]:text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                      >
                        {professor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Multiple Questions Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Domande dell&apos;Esame</Label>
                  <span className="text-xs text-muted-foreground">
                    {formData.questions.length}{" "}
                    {formData.questions.length === 1 ? "domanda" : "domande"}
                  </span>
                </div>

                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <div
                      key={index}
                      className="relative group animate-slide-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Question number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EFF6FF] dark:bg-[#005A9C]/10 flex items-center justify-center mt-2 transition-all group-hover:bg-[#DBEAFE] dark:group-hover:bg-[#005A9C]/20">
                          <span className="text-sm text-[#005A9C] dark:text-[#60A5FA]">
                            {index + 1}
                          </span>
                        </div>

                        {/* Text field */}
                        <div className="flex-1">
                          <Textarea
                            placeholder={
                              index === 0
                                ? "Scrivi qui la prima domanda..."
                                : `Domanda ${index + 1}...`
                            }
                            value={question}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            className="min-h-24 bg-muted/30 rounded-lg border border-border text-foreground placeholder:text-muted-foreground resize-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                            required={index === 0}
                          />
                        </div>

                        {/* Remove button - only shows if there's more than one question */}
                        {formData.questions.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                            className="flex-shrink-0 mt-2 h-8 w-8 p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                            title="Rimuovi domanda"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add more questions button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddQuestion}
                  className="w-full border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all group"
                >
                  <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
                  Aggiungi un&apos;altra domanda
                </Button>

                <p className="text-xs text-muted-foreground italic">
                  💡 I professori spesso fanno più domande durante l&apos;esame orale.
                  Aggiungile tutte per aiutare altri studenti!
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground transition-all"
                  disabled={
                    !hasValidQuestion ||
                    !formData.subjectId ||
                    !formData.professorId ||
                    isSubmitting
                  }
                >
                  {isSubmitting
                    ? "Invio..."
                    : `Invia ${
                        formData.questions.filter((q) => q.trim()).length > 1
                          ? "Domande"
                          : "Domanda"
                      }`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Alert */}
        {!hasPrefill && (
          <Alert className="bg-card border-border animate-fade-in">
            <AlertDescription className="text-foreground">
              💡{" "}
              {formData.questions.filter((q) => q.trim()).length > 1
                ? "Le tue domande saranno esaminate"
                : "La tua domanda sarà esaminata"}{" "}
              dal nostro team prima di essere{" "}
              {formData.questions.filter((q) => q.trim()).length > 1
                ? "disponibili"
                : "disponibile"}{" "}
              per altri studenti. Questo processo richiede solitamente fino a 24 ore.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Share Link Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-lg bg-card border-border overflow-hidden">
          {/* Header with gradient */}
          <div className="relative -mx-6 -mt-6 mb-4 p-6 bg-gradient-to-br from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE] dark:from-[#005A9C]/20 dark:via-[#005A9C]/10 dark:to-[#005A9C]/5 border-b border-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-foreground text-xl">
                    Link Generato con Successo! 🎉
                  </DialogTitle>
                  <DialogDescription className="text-primary/80">
                    Pronto per essere condiviso con la classe
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-1">
            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#005A9C]/10 dark:to-[#005A9C]/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">📚 Materia</p>
                <p className="font-semibold text-primary">
                  {getSubjectName(formData.subjectId)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#005A9C]/10 dark:to-[#005A9C]/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">👨‍🏫 Professore</p>
                <p className="font-semibold text-primary">
                  {getProfessorName(formData.professorId)}
                </p>
              </div>
              {formData.channelId && (
                <div className="col-span-2 bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#005A9C]/10 dark:to-[#005A9C]/5 rounded-lg p-3 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">📍 Canale</p>
                  <p className="font-semibold text-primary">{getChannelName(formData.channelId)}</p>
                </div>
              )}
            </div>

            {/* Link with glassmorphism effect */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-30 group-hover:opacity-50 transition-all" />
              <div className="relative bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-lg border border-primary/30 p-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                  <Link2 className="w-3 h-3" />
                  Link Condivisibile
                </p>
                <p className="text-sm text-foreground break-all font-mono bg-muted/50 p-2 rounded">
                  {shareableLink}
                </p>
              </div>
            </div>

            {/* Modern buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleCopyLink}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copia Link
              </Button>
              <Button
                onClick={() => setShowShareDialog(false)}
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/5 transition-all"
              >
                Chiudi
              </Button>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-br from-[#FFF7ED] to-[#FED7AA] dark:from-[#FFA78D]/10 dark:to-[#FFA78D]/5 rounded-lg p-4 border border-[#FFA78D]/30">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFA78D]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-lg">💡</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-[#92400E] dark:text-[#FFA78D]">
                    Come Condividere:
                  </p>
                  <ul className="text-xs text-[#92400E]/80 dark:text-[#FFA78D]/80 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FFA78D]" />
                      Copia il link cliccando sul pulsante sopra
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FFA78D]" />
                      Incollalo nel gruppo WhatsApp/Telegram della classe
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-[#FFA78D]" />
                      Gli studenti avranno i campi già precompilati!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
