import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { QuestionsTable } from "./_components/questions-table";

async function getQuestions() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      exam: {
        include: {
          subject: true,
          professor: true,
          university: true,
        },
      },
      canonical: true,
      _count: {
        select: {
          variations: true,
          studentAnswers: true,
          comments: true,
        },
      },
    },
  });

  return questions;
}

export default async function QuestionsPage() {
  const questions = await getQuestions();
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("questions")}</h1>
        <p className="text-muted-foreground">
          {t("quickActions.manageQuestionsDesc")}
        </p>
      </div>

      <QuestionsTable questions={questions} />
    </div>
  );
}
