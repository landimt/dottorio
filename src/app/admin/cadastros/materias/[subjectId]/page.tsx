import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProfessorsList } from "./_components/professors-list";
import { SubjectSummary } from "./_components/subject-summary";
import { Breadcrumb } from "../../_components/breadcrumb";

interface PageProps {
  params: Promise<{ subjectId: string }>;
}

async function getSubjectWithProfessors(subjectId: string) {
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      course: {
        include: {
          university: true,
        },
      },
      professors: {
        include: {
          professor: {
            include: {
              _count: {
                select: {
                  exams: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  return subject;
}

async function getUniversityProfessors(universityId: string, subjectId: string) {
  // Get all professors from this university that are NOT already associated with this subject
  const professors = await prisma.professor.findMany({
    where: {
      universityId,
      subjects: {
        none: {
          subjectId,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return professors;
}

export default async function SubjectProfessorsPage({ params }: PageProps) {
  const { subjectId } = await params;
  const subject = await getSubjectWithProfessors(subjectId);
  const t = await getTranslations("admin.professorsPage");

  if (!subject) {
    notFound();
  }

  const availableProfessors = await getUniversityProfessors(
    subject.course.university.id,
    subjectId
  );

  const breadcrumbItems = [
    { label: "Anagrafiche", href: "/admin/cadastros" },
    {
      label: subject.course.university.name,
      href: `/admin/cadastros/universidades/${subject.course.university.id}`,
    },
    {
      label: subject.course.name,
      href: `/admin/cadastros/cursos/${subject.course.id}`,
    },
    { label: subject.name },
  ];

  // Transform the data to extract professors from the join table
  const subjectProfessors = subject.professors.map((ps) => ({
    ...ps.professor,
    professorSubjectId: ps.id,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{subject.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{subject.name}</h1>
            <p className="text-muted-foreground">
              {subject.course.name} - {subject.course.university.name}
            </p>
          </div>
        </div>
      </div>

      <SubjectSummary
        year={subject.year}
        semester={subject.semester}
        credits={subject.credits}
        examsCount={subject._count.exams}
        color={subject.color}
      />

      <ProfessorsList
        professors={subjectProfessors}
        availableProfessors={availableProfessors}
        subjectId={subject.id}
        subjectName={subject.name}
        universityId={subject.course.university.id}
      />
    </div>
  );
}
