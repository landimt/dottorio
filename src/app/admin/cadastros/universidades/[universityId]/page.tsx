import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CoursesList } from "./_components/courses-list";
import { Breadcrumb } from "../../_components/breadcrumb";

interface PageProps {
  params: Promise<{ universityId: string }>;
}

async function getUniversityWithCourses(universityId: string) {
  const university = await prisma.university.findUnique({
    where: { id: universityId },
    include: {
      courses: {
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              subjects: true,
              users: true,
              exams: true,
            },
          },
        },
      },
      _count: {
        select: {
          professors: true,
        },
      },
    },
  });

  return university;
}

export default async function UniversityCoursesPage({ params }: PageProps) {
  const { universityId } = await params;
  const university = await getUniversityWithCourses(universityId);
  const t = await getTranslations("admin.coursesPage");

  if (!university) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Anagrafiche", href: "/admin/cadastros" },
    { label: university.name },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{university.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{university.name}</h1>
            <p className="text-muted-foreground">
              {university.city} - {t("professorsCount", { count: university._count.professors })}
            </p>
          </div>
        </div>
      </div>

      <CoursesList
        courses={university.courses}
        universityId={university.id}
        universityName={university.name}
      />
    </div>
  );
}
