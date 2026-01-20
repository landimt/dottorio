import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { QuestionsLayout } from "./_components/questions-layout";

async function getQuestion(id: string) {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: {
        include: {
          subject: true,
          professor: true,
          university: true,
          course: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      aiAnswer: {
        include: {
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      studentAnswers: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              university: {
                select: {
                  name: true,
                  shortName: true,
                },
              },
              year: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      variations: {
        include: {
          exam: {
            include: {
              subject: { select: { name: true, emoji: true } },
              professor: { select: { name: true } },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          variations: true,
          comments: true,
          savedBy: true,
        },
      },
    },
  });

  return question;
}

async function getAllQuestions() {
  const questions = await prisma.question.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: {
      exam: {
        include: {
          subject: { select: { id: true, name: true, emoji: true } },
          professor: { select: { id: true, name: true } },
          university: { select: { id: true, name: true, shortName: true } },
        },
      },
      aiAnswer: { select: { id: true } },
      _count: {
        select: {
          comments: true,
          savedBy: true,
        },
      },
    },
  });

  return questions;
}

async function getFilterData() {
  const [universities, courses, subjects, professors] = await Promise.all([
    prisma.university.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.course.findMany({
      select: { id: true, name: true, universityId: true },
      orderBy: { name: "asc" },
    }),
    prisma.subject.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.professor.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { universities, courses, subjects, professors };
}

export default async function AdminQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [question, allQuestions, filterData] = await Promise.all([
    getQuestion(id),
    getAllQuestions(),
    getFilterData(),
  ]);

  const t = await getTranslations("admin.questionDetail");

  if (!question) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <QuestionsLayout
        initialQuestionId={id}
        questions={allQuestions}
        selectedQuestion={question}
        universities={filterData.universities}
        courses={filterData.courses}
        subjects={filterData.subjects}
        professors={filterData.professors}
      />
    </div>
  );
}
