import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { QuestionDetail } from "./_components/question-detail";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getQuestion(id: string, userId?: string) {
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      exam: {
        include: {
          subject: true,
          professor: true,
          university: true,
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      aiAnswer: true,
      studentAnswers: {
        where: { isPublic: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              university: { select: { name: true } },
              year: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              university: { select: { name: true } },
              year: true,
            },
          },
          _count: {
            select: { likes: true },
          },
          likes: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: "desc" },
      },
      savedBy: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      _count: {
        select: {
          studentAnswers: true,
          comments: true,
          savedBy: true,
        },
      },
    },
  });

  if (!question) return null;

  // Get user's personal answer if exists
  let personalAnswer = null;
  if (userId) {
    personalAnswer = await prisma.studentAnswer.findUnique({
      where: {
        questionId_userId: {
          questionId: id,
          userId,
        },
      },
    });
  }

  return {
    ...question,
    isSaved: userId ? question.savedBy && question.savedBy.length > 0 : false,
    studentAnswers: question.studentAnswers.map((a) => ({
      ...a,
      isLiked: userId ? a.likes && a.likes.length > 0 : false,
      likesCount: a._count.likes,
      likes: undefined,
      _count: undefined,
    })),
    comments: question.comments.map((c) => ({
      ...c,
      isLiked: userId ? c.likes && c.likes.length > 0 : false,
      likesCount: c._count.likes,
      likes: undefined,
      _count: undefined,
    })),
    personalAnswer,
    savedBy: undefined,
  };
}

// Get related questions from same exam/subject
async function getRelatedQuestions(questionId: string, examId: string) {
  return prisma.question.findMany({
    where: {
      examId,
      id: { not: questionId },
    },
    include: {
      exam: {
        include: {
          professor: true,
        },
      },
      _count: {
        select: {
          studentAnswers: true,
          savedBy: true,
        },
      },
    },
    orderBy: { views: "desc" },
    take: 15,
  });
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const question = await getQuestion(id, userId);

  if (!question) {
    notFound();
  }

  const relatedQuestions = await getRelatedQuestions(id, question.examId);

  // Increment view count
  await prisma.question.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return (
    <QuestionDetail
      question={question}
      relatedQuestions={relatedQuestions}
      userId={userId}
    />
  );
}
