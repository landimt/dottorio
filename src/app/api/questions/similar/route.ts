import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const excludeId = searchParams.get("excludeId");

    if (!text || text.length < 3) {
      return apiSuccess({ questions: [] });
    }

    // Search for similar questions using text search
    // Split the search text into words and search for any of them
    const searchWords = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 5); // Limit to 5 words

    if (searchWords.length === 0) {
      return apiSuccess({ questions: [] });
    }

    // Build search conditions - question must contain at least one of the words
    const searchConditions = searchWords.map((word) => ({
      text: {
        contains: word,
        mode: "insensitive" as const,
      },
    }));

    // Find canonical questions that match the search
    const similarQuestions = await prisma.question.findMany({
      where: {
        AND: [
          { isCanonical: true },
          { OR: searchConditions },
          excludeId ? { id: { not: excludeId } } : {},
        ],
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
        aiAnswer: {
          select: { id: true },
        },
        _count: {
          select: {
            studentAnswers: { where: { isPublic: true } },
            variations: true,
          },
        },
      },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    });

    // Get unique groupIds and batch count them (fixes N+1 query)
    const groupIds = [...new Set(similarQuestions.map((q) => q.groupId).filter(Boolean))] as string[];

    const groupCounts = groupIds.length > 0
      ? await prisma.question.groupBy({
          by: ["groupId"],
          where: { groupId: { in: groupIds } },
          _count: { id: true },
        })
      : [];

    // Create lookup map for O(1) access
    const groupCountMap = new Map(
      groupCounts.map((g) => [g.groupId, g._count.id])
    );

    const questionsWithGroupCount = similarQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      groupId: q.groupId,
      views: q.views,
      timesAsked: q.groupId ? groupCountMap.get(q.groupId) ?? 1 : 1,
      hasAiAnswer: !!q.aiAnswer,
      studentAnswersCount: q._count.studentAnswers,
      exam: {
        subject: q.exam.subject.name,
        professor: q.exam.professor?.name || "N/A",
        university: q.exam.university.name,
      },
    }));

    return apiSuccess({ questions: questionsWithGroupCount });
  } catch (error) {
    return apiUnknownError(error, "Errore nella ricerca di domande simili");
  }
}
