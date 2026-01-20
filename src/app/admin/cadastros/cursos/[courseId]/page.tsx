import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SubjectsList } from "./_components/subjects-list";
import { Breadcrumb } from "../../_components/breadcrumb";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function getCourseWithSubjects(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      university: true,
      subjects: {
        orderBy: [{ year: "asc" }, { semester: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: {
              professors: true,
              exams: true,
            },
          },
        },
      },
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  return course;
}

export default async function CourseSubjectsPage({ params }: PageProps) {
  const { courseId } = await params;
  const course = await getCourseWithSubjects(courseId);
  const t = await getTranslations("admin.subjectsPage");

  if (!course) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Anagrafiche", href: "/admin/cadastros" },
    {
      label: course.university.name,
      href: `/admin/cadastros/universidades/${course.university.id}`,
    },
    { label: course.name },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{course.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold">{course.name}</h1>
            <p className="text-muted-foreground">
              {course.university.name}
              {course.year && ` - ${course.year} anni`}
              {" - "}
              {t("studentsCount", { count: course._count.users })}
            </p>
          </div>
        </div>
      </div>

      <SubjectsList
        subjects={course.subjects}
        courseId={course.id}
        courseName={course.name}
        courseYears={course.year || 6}
      />
    </div>
  );
}
