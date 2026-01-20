import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, BookOpen, GraduationCap } from "lucide-react";
import { UniversitiesTab } from "./_components/universities-tab";
import { SubjectsTab } from "./_components/subjects-tab";
import { ProfessorsTab } from "./_components/professors-tab";

async function getCadastrosData() {
  const [universities, subjects, professors] = await Promise.all([
    prisma.university.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            professors: true,
            users: true,
            courses: true,
          },
        },
      },
    }),
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            professors: true,
            exams: true,
          },
        },
      },
    }),
    prisma.professor.findMany({
      orderBy: { name: "asc" },
      include: {
        university: true,
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    }),
  ]);

  return { universities, subjects, professors };
}

export default async function CadastrosPage() {
  const { universities, subjects, professors } = await getCadastrosData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cadastros</h1>
        <p className="text-muted-foreground">
          Gerencie universidades, matérias e professores
        </p>
      </div>

      <Tabs defaultValue="universities" className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <School className="h-4 w-4" />
            Universidades
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Matérias
          </TabsTrigger>
          <TabsTrigger value="professors" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Professores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universities">
          <UniversitiesTab universities={universities} />
        </TabsContent>

        <TabsContent value="subjects">
          <SubjectsTab subjects={subjects} />
        </TabsContent>

        <TabsContent value="professors">
          <ProfessorsTab professors={professors} universities={universities} subjects={subjects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
