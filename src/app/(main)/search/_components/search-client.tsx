"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuestions } from "@/lib/query";
import {
    Bookmark,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Edit,
    Eye,
    Filter,
    Loader2,
    MessageSquare,
    Plus,
    Search,
    Upload,
    X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

interface Course {
  id: string;
  name: string;
  universityId: string;
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
  courses: Course[];
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

export function SearchClient({ subjects, professors, universities, courses }: SearchClientProps) {
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    universityId: searchParams.get("universityId") || "",
    courseId: searchParams.get("courseId") || "",
    year: searchParams.get("year") || "",
    subjectId: searchParams.get("subjectId") || "",
    professorId: searchParams.get("professorId") || "",
  });

  // Pre-fill university, course and year from user session
  useEffect(() => {
    if (session?.user) {
      setFilters((prev) => ({
        ...prev,
        universityId: prev.universityId || session.user.universityId || "",
        courseId: prev.courseId || session.user.courseId || "",
        year: prev.year || (session.user.year ? String(session.user.year) : ""),
      }));
    }
  }, [session?.user]);

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [page, setPage] = useState(1);

  // State to control which select is open (for auto-open behavior)
  const [openSelects, setOpenSelects] = useState({
    university: false,
    course: false,
    year: false,
    subject: false,
    professor: false,
  });

  // Dynamic filtered lists based on selections
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>(subjects);
  const [filteredProfessors, setFilteredProfessors] = useState<Professor[]>(professors);

  // Load subjects when course or year changes
  useEffect(() => {
    async function loadSubjects() {
      if (!filters.courseId) {
        setFilteredSubjects(subjects);
        return;
      }
      try {
        const params = new URLSearchParams({ courseId: filters.courseId });
        if (filters.year) {
          params.append("year", filters.year);
        }
        const response = await fetch(`/api/subjects?${params.toString()}`);
        if (response.ok) {
          const result = await response.json();
          setFilteredSubjects(result.data || []);
        }
      } catch {
        setFilteredSubjects([]);
      }
    }
    loadSubjects();
  }, [filters.courseId, filters.year, subjects]);

  // Load professors when subject changes
  useEffect(() => {
    async function loadProfessors() {
      if (!filters.subjectId) {
        setFilteredProfessors(professors);
        return;
      }
      try {
        const response = await fetch(`/api/professors?subjectId=${filters.subjectId}`);
        if (response.ok) {
          const result = await response.json();
          setFilteredProfessors(result.data || []);
        }
      } catch {
        setFilteredProfessors([]);
      }
    }
    loadProfessors();
  }, [filters.subjectId, professors]);

  // Filter courses when university changes
  useEffect(() => {
    if (!filters.universityId) {
      setFilteredCourses(courses);
    } else {
      setFilteredCourses(courses.filter(c => c.universityId === filters.universityId));
    }
  }, [filters.universityId, courses]);

  // Build query params for TanStack Query
  const queryParams = useMemo(() => {
    if (!showResults) return null;
    return {
      query: filters.query || undefined,
      subjectId: filters.subjectId || undefined,
      professorId: filters.professorId || undefined,
      universityId: filters.universityId || undefined,
      courseId: filters.courseId || undefined,
      year: filters.year || undefined,
      page: String(page),
      limit: "20",
    };
  }, [showResults, filters, page]);

  // Use TanStack Query for fetching questions
  const { data, isLoading, isFetching } = useQuestions(queryParams ?? {});

  const questions = data?.questions ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 };

  const hasActiveFilters = Object.values(filters).some((v) => v);

  // Cascading filter change - resets dependent filters and auto-opens next select
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [field]: value };

      // Cascading reset logic
      if (field === "universityId") {
        // Reset course, year, subject, professor when university changes
        newFilters.courseId = "";
        newFilters.year = "";
        newFilters.subjectId = "";
        newFilters.professorId = "";
      } else if (field === "courseId") {
        // Reset year, subject and professor when course changes
        newFilters.year = "";
        newFilters.subjectId = "";
        newFilters.professorId = "";
      } else if (field === "year") {
        // Reset subject and professor when year changes
        newFilters.subjectId = "";
        newFilters.professorId = "";
      } else if (field === "subjectId") {
        // Reset professor when subject changes
        newFilters.professorId = "";
      }

      return newFilters;
    });

    // Auto-open next select when a value is selected (not "all")
    if (value && value !== "all") {
      setTimeout(() => {
        if (field === "universityId") {
          setOpenSelects((prev) => ({ ...prev, course: true }));
        } else if (field === "courseId") {
          setOpenSelects((prev) => ({ ...prev, year: true }));
        } else if (field === "year") {
          setOpenSelects((prev) => ({ ...prev, subject: true }));
        } else if (field === "subjectId") {
          setOpenSelects((prev) => ({ ...prev, professor: true }));
        }
      }, 100);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setShowResults(true);
  };

  const handleSubjectClick = (subjectId: string) => {
    setFilters((prev) => ({ ...prev, subjectId }));
    setPage(1);
    setShowResults(true);
  };

  const handleClearFilters = () => {
    setFilters({
      query: "",
      universityId: "",
      courseId: "",
      year: "",
      subjectId: "",
      professorId: "",
    });
    setPage(1);
    setShowResults(false);
  };

  // Helper functions to get names from IDs
  const getUniversityName = (id: string) => universities.find((u) => u.id === id)?.shortName || universities.find((u) => u.id === id)?.name || "";
  const getCourseName = (id: string) => courses.find((c) => c.id === id)?.name || "";
  const getYearName = (year: string) => year ? `${year}º Anno` : "";
  const getSubjectName = (id: string) => {
    const subject = filteredSubjects.find((s) => s.id === id) || subjects.find((s) => s.id === id);
    return subject?.name || "";
  };
  const getProfessorName = (id: string) => {
    const professor = filteredProfessors.find((p) => p.id === id) || professors.find((p) => p.id === id);
    return professor?.name || "";
  };

  const getFilterDescription = () => {
    const parts = [];
    if (filters.universityId) parts.push(getUniversityName(filters.universityId));
    if (filters.courseId) parts.push(getCourseName(filters.courseId));
    if (filters.year) parts.push(getYearName(filters.year));
    if (filters.subjectId) parts.push(getSubjectName(filters.subjectId));
    if (filters.professorId) parts.push(getProfessorName(filters.professorId));
    if (filters.query) parts.push(`"${filters.query}"`);

    return parts.length > 0 ? parts.join(" • ") : "Tutte le domande";
  };

  // Years array for select
  const years = [1, 2, 3, 4, 5, 6];

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

            {/* Active filter badges when collapsed */}
            {!isFiltersExpanded && hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                {filters.universityId && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    {getUniversityName(filters.universityId)}
                    <button
                      onClick={() => handleFilterChange("universityId", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.courseId && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    {getCourseName(filters.courseId)}
                    <button
                      onClick={() => handleFilterChange("courseId", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.year && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    {getYearName(filters.year)}
                    <button
                      onClick={() => handleFilterChange("year", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.subjectId && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    {getSubjectName(filters.subjectId)}
                    <button
                      onClick={() => handleFilterChange("subjectId", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.professorId && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    {getProfessorName(filters.professorId)}
                    <button
                      onClick={() => handleFilterChange("professorId", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {filters.query && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 pl-3 pr-1 py-1 gap-1">
                    &quot;{filters.query}&quot;
                    <button
                      onClick={() => handleFilterChange("query", "")}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>

          {isFiltersExpanded && (
            <CardContent className="p-4 md:p-6 space-y-4 animate-fade-in">
              {/* Row 1: Cerca per termine (1/2), Università (1/4), Corso (1/4) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Cerca per termine - 2 columns (half width) */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="keyword" className="text-foreground text-sm">
                    Cerca per termine
                  </Label>
                  <Input
                    id="keyword"
                    placeholder="Parole chiave..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange("query", e.target.value)}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground h-10"
                  />
                </div>

                {/* Università - 1 column (quarter width) */}
                <div className="space-y-1.5">
                  <Label htmlFor="university" className="text-foreground text-sm">
                    Università
                  </Label>
                  <Select
                    value={filters.universityId}
                    onValueChange={(value) =>
                      handleFilterChange("universityId", value === "all" ? "" : value)
                    }
                    open={openSelects.university}
                    onOpenChange={(open) => setOpenSelects((prev) => ({ ...prev, university: open }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-10 text-left">
                      {filters.universityId ? (
                        <span>{getUniversityName(filters.universityId)}</span>
                      ) : (
                        <SelectValue placeholder="Tutte" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutte</SelectItem>
                      {universities.map((university) => (
                        <SelectItem key={university.id} value={university.id}>
                          {university.shortName || university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Corso */}
                <div className="space-y-1.5">
                  <Label htmlFor="course" className="text-foreground text-sm">
                    Corso
                  </Label>
                  <Select
                    value={filters.courseId}
                    onValueChange={(value) =>
                      handleFilterChange("courseId", value === "all" ? "" : value)
                    }
                    open={openSelects.course}
                    onOpenChange={(open) => setOpenSelects((prev) => ({ ...prev, course: open }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-10 text-left">
                      {filters.courseId ? (
                        <span>{getCourseName(filters.courseId)}</span>
                      ) : (
                        <SelectValue placeholder="Tutti" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutti</SelectItem>
                      {filteredCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Anno, Materia, Professore */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Anno */}
                <div className="space-y-1.5">
                  <Label htmlFor="year" className="text-foreground text-sm">
                    Anno
                  </Label>
                  <Select
                    value={filters.year}
                    onValueChange={(value) =>
                      handleFilterChange("year", value === "all" ? "" : value)
                    }
                    open={openSelects.year}
                    onOpenChange={(open) => setOpenSelects((prev) => ({ ...prev, year: open }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-10 text-left">
                      {filters.year ? (
                        <span>{getYearName(filters.year)}</span>
                      ) : (
                        <SelectValue placeholder="Tutti" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutti</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}º Anno
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Materia */}
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-foreground text-sm">
                    Materia
                  </Label>
                  <Select
                    value={filters.subjectId}
                    onValueChange={(value) =>
                      handleFilterChange("subjectId", value === "all" ? "" : value)
                    }
                    open={openSelects.subject}
                    onOpenChange={(open) => setOpenSelects((prev) => ({ ...prev, subject: open }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-10 text-left">
                      {filters.subjectId ? (
                        <span>{getSubjectName(filters.subjectId)}</span>
                      ) : (
                        <SelectValue placeholder="Tutte" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutte</SelectItem>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Professore */}
                <div className="space-y-1.5">
                  <Label htmlFor="professor" className="text-foreground text-sm">
                    Professore
                  </Label>
                  <Select
                    value={filters.professorId}
                    onValueChange={(value) =>
                      handleFilterChange("professorId", value === "all" ? "" : value)
                    }
                    open={openSelects.professor}
                    onOpenChange={(open) => setOpenSelects((prev) => ({ ...prev, professor: open }))}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground h-10 text-left">
                      {filters.professorId ? (
                        <span>{getProfessorName(filters.professorId)}</span>
                      ) : (
                        <SelectValue placeholder="Tutti" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="all">Tutti</SelectItem>
                      {filteredProfessors.map((professor) => (
                        <SelectItem key={professor.id} value={professor.id}>
                          {professor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || isFetching}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 group h-9"
                >
                  {(isLoading || isFetching) ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  {(isLoading || isFetching) ? "Cercando..." : "Cerca Domande"}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all duration-300 h-9"
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
                {(isLoading || isFetching) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cercando...
                  </span>
                ) : (
                  `${pagination.total} domanda/e trovata/e`
                )}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Skeleton cards when loading */}
              {(isLoading || isFetching) && questions.length === 0 ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Question text skeleton */}
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-5 w-4/5" />
                        </div>

                        {/* Badges skeleton */}
                        <div className="flex flex-wrap gap-2">
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-28 rounded-full" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>

                        {/* Stats skeleton */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                questions.map((question) => (
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
                ))
              )}
            </div>

            {!isLoading && !isFetching && questions.length === 0 && (
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
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
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
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Precedente
                </Button>
                <span className="flex items-center px-4 text-muted-foreground">
                  Pagina {page} di {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === pagination.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
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
