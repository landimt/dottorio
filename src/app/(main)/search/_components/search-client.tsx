"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Eye,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  Edit,
  Upload,
  Plus,
  X,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  _count: { exams: number };
}

interface Professor {
  id: string;
  name: string;
}

interface University {
  id: string;
  name: string;
  shortName: string | null;
}

interface Channel {
  id: string;
  name: string;
  university: { shortName: string | null };
}

interface Question {
  id: string;
  text: string;
  difficulty: string | null;
  views: number;
  isSaved?: boolean;
  exam: {
    subject: { id: string; name: string; emoji: string | null; color: string | null };
    professor: { id: string; name: string } | null;
    university: { id: string; name: string; shortName: string | null };
    creator: { id: string; name: string | null };
  };
  _count: {
    studentAnswers: number;
    comments: number;
    savedBy: number;
  };
}

interface SearchClientProps {
  subjects: Subject[];
  professors: Professor[];
  universities: University[];
  channels: Channel[];
}

// Subject colors and icons mapping
const subjectStyles: Record<string, { icon: string; color: string }> = {
  "Anatomia I": { icon: "🫀", color: "#F7B29D" },
  "Anatomia II": { icon: "🦴", color: "#FFC857" },
  Fisiologia: { icon: "🧠", color: "#A5D6F6" },
  Biochimica: { icon: "🧬", color: "#C9B3F9" },
  Istologia: { icon: "🔍", color: "#FFC857" },
  Patologia: { icon: "🔬", color: "#A5D6F6" },
  Farmacologia: { icon: "💊", color: "#F7B29D" },
  Microbiologia: { icon: "🦠", color: "#C9B3F9" },
  Immunologia: { icon: "🛡️", color: "#FF6B9D" },
  Neurologia: { icon: "🧠", color: "#FF6B9D" },
  Cardiologia: { icon: "❤️", color: "#F7B29D" },
};

export function SearchClient({ subjects, professors, universities, channels }: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    subjectId: searchParams.get("subjectId") || "",
    professorId: searchParams.get("professorId") || "",
    universityId: searchParams.get("universityId") || "",
    channelId: searchParams.get("channelId") || "",
    difficulty: searchParams.get("difficulty") || "",
  });

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const hasActiveFilters = Object.values(filters).some((v) => v);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setShowResults(true);

    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.subjectId) params.set("subjectId", filters.subjectId);
    if (filters.professorId) params.set("professorId", filters.professorId);
    if (filters.universityId) params.set("universityId", filters.universityId);
    if (filters.channelId) params.set("channelId", filters.channelId);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));

    try {
      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      setQuestions(data.questions || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error searching questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectClick = (subjectId: string) => {
    setFilters((prev) => ({ ...prev, subjectId }));
    setShowResults(true);
  };

  const handleClearFilters = () => {
    setFilters({
      query: "",
      subjectId: "",
      professorId: "",
      universityId: "",
      channelId: "",
      difficulty: "",
    });
    setShowResults(false);
    setQuestions([]);
  };

  useEffect(() => {
    if (showResults) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.subjectId, pagination.page]);

  const getFilterDescription = () => {
    const parts = [];
    const subject = subjects.find((s) => s.id === filters.subjectId);
    const professor = professors.find((p) => p.id === filters.professorId);
    const university = universities.find((u) => u.id === filters.universityId);
    const channel = channels.find((c) => c.id === filters.channelId);

    if (subject) parts.push(subject.name);
    if (professor) parts.push(professor.name);
    if (university) parts.push(university.shortName);
    if (channel) parts.push(channel.name);
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.difficulty) parts.push(filters.difficulty);

    return parts.length > 0 ? parts.join(" • ") : "Tutte le domande";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-medium text-foreground">
              {showResults ? "Risultati della Ricerca" : "Trova Domande"}
            </h1>
            {showResults && (
              <p className="text-muted-foreground">{getFilterDescription()}</p>
            )}
          </div>
        </div>

        {/* Filtri */}
        <Card className="glass-card animate-scale-in">
          <CardHeader
            className="border-b border-border pb-3 cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          >
            <CardTitle className="text-foreground flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="icon-container w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <span>Filtri di Ricerca</span>
                {hasActiveFilters && !isFiltersExpanded && (
                  <Badge
                    variant="outline"
                    className="ml-2 border-primary/30 text-primary"
                  >
                    {Object.values(filters).filter((v) => v).length} attivi
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {showResults && isFiltersExpanded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowResults(false);
                    }}
                    className="border-border text-foreground"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Modifica Filtri
                  </Button>
                )}
                {isFiltersExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>

          {isFiltersExpanded && (
            <CardContent className="p-4 md:p-6 space-y-4 animate-fade-in">
              {/* Ricerca per parola chiave */}
              <div className="space-y-1.5">
                <Label htmlFor="keyword" className="text-foreground text-sm">
                  Cerca per termine
                </Label>
                <Input
                  id="keyword"
                  placeholder="Scrivi parole chiave della domanda..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange("query", e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground h-9"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-foreground text-sm">
                    Materia
                  </Label>
                  <Select
                    value={filters.subjectId}
                    onValueChange={(value) =>
                      handleFilterChange("subjectId", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9">
                      <SelectValue placeholder="Tutte" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutte</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="professor" className="text-foreground text-sm">
                    Professore
                  </Label>
                  <Select
                    value={filters.professorId}
                    onValueChange={(value) =>
                      handleFilterChange("professorId", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9">
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutti</SelectItem>
                      {professors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="university" className="text-foreground text-sm">
                    Università
                  </Label>
                  <Select
                    value={filters.universityId}
                    onValueChange={(value) =>
                      handleFilterChange("universityId", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9">
                      <SelectValue placeholder="Tutte" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutte</SelectItem>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.shortName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="channel" className="text-foreground text-sm">
                    Canale
                  </Label>
                  <Select
                    value={filters.channelId}
                    onValueChange={(value) =>
                      handleFilterChange("channelId", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9">
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutti</SelectItem>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name} {channel.university?.shortName && `(${channel.university.shortName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="difficulty" className="text-foreground text-sm">
                    Difficoltà
                  </Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) =>
                      handleFilterChange("difficulty", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-9">
                      <SelectValue placeholder="Tutte" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutte</SelectItem>
                      <SelectItem value="easy">Facile</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="hard">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 group h-9"
                >
                  <Search className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  {isLoading ? "Cercando..." : "Cerca Domande"}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="glass-card border-border hover:border-accent transition-all duration-300 h-9"
                  >
                    Cancella Filtri
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Contenuto principale */}
        {!showResults ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-medium text-foreground">
                Esplora per Materia
              </h2>
              <p className="text-muted-foreground">
                Clicca su una materia per vedere tutte le domande disponibili
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subjects.map((subject) => {
                const style = subjectStyles[subject.name] || {
                  icon: "📚",
                  color: "#A5D6F6",
                };
                return (
                  <Card
                    key={subject.id}
                    className="cursor-pointer transition-all duration-200 hover:scale-105 bg-card border-border hover:border-accent/50"
                    onClick={() => handleSubjectClick(subject.id)}
                    style={{
                      background: `linear-gradient(135deg, ${style.color}15 0%, transparent 100%)`,
                    }}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="text-4xl">{style.icon}</div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {subject.name}
                        </h3>
                        <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground mt-2">
                          <BookOpen className="w-4 h-4" />
                          <span>{subject._count.exams} esami</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                {isLoading
                  ? "Cercando..."
                  : `${questions.length} domanda/e trovata/e`}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {questions.map((question) => (
                <Link key={question.id} href={`/questions/${question.id}`} className="block">
                  <Card className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:border-primary/50 hover:shadow-md bg-card border-border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className="font-medium text-foreground leading-relaxed">
                          {question.text}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-accent/10 text-accent border-accent/20">
                            {question.exam.subject.name}
                          </Badge>
                          {question.exam.professor && (
                            <Badge
                              variant="outline"
                              className="border-border text-muted-foreground"
                            >
                              {question.exam.professor.name}
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="border-border text-muted-foreground"
                          >
                            {question.exam.university.shortName}
                          </Badge>
                          {question.difficulty && (
                            <Badge
                              variant="outline"
                              className="border-border text-muted-foreground"
                            >
                              {question.difficulty === "easy"
                                ? "Facile"
                                : question.difficulty === "medium"
                                  ? "Media"
                                  : "Difficile"}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4 text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{question.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{question._count.studentAnswers}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Bookmark className="w-4 h-4" />
                              <span>{question._count.savedBy}</span>
                            </div>
                          </div>
                          <span className="text-accent font-medium">
                            Vedi risposta →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {!isLoading && questions.length === 0 && (
              <Card className="bg-card border-border text-center">
                <CardContent className="p-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Nessuna domanda trovata
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Prova ad adattare i filtri o usare parole chiave diverse.
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="border-border text-foreground"
                  >
                    Cancella Filtri
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  Precedente
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  Pagina {pagination.page} di {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Successiva
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB Overlay */}
      {isFabOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB Menu */}
      {isFabOpen && (
        <div className="fixed bottom-24 md:bottom-28 right-6 md:right-8 z-50 flex flex-col gap-3 animate-fade-in">
          <Link href="/exams/new">
            <button className="flex items-center gap-3 bg-white hover:bg-gray-50 text-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 border border-border">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <span className="pr-2 text-sm font-medium whitespace-nowrap">
                Aggiungi Domanda
              </span>
            </button>
          </Link>

          <button
            onClick={() => {
              setIsFabOpen(false);
              alert("Funzionalità in arrivo!");
            }}
            className="flex items-center gap-3 bg-white hover:bg-gray-50 text-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 border border-border"
          >
            <div className="w-10 h-10 bg-[#FFA78D] rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span className="pr-2 text-sm font-medium whitespace-nowrap">
              Importa Domande
            </span>
          </button>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setIsFabOpen(!isFabOpen)}
        className={`fixed bottom-6 md:bottom-8 right-6 md:right-8 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-110 ${
          isFabOpen
            ? "bg-muted-foreground rotate-45"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isFabOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
