import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text");
    const excludeId = searchParams.get("excludeId");

    if (!text || text.length < 3) {
      return NextResponse.json({ questions: [] });
    }

    // Search for similar questions using text search
    // Split the search text into words and search for any of them
    const searchWords = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 5); // Limit to 5 words

    if (searchWords.length === 0) {
      return NextResponse.json({ questions: [] });
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

    // Count total questions in each group
    const questionsWithGroupCount = await Promise.all(
      similarQuestions.map(async (q) => {
        const groupCount = await prisma.question.count({
          where: { groupId: q.groupId },
        });

        return {
          id: q.id,
          text: q.text,
          groupId: q.groupId,
          views: q.views,
          timesAsked: groupCount,
          hasAiAnswer: !!q.aiAnswer,
          studentAnswersCount: q._count.studentAnswers,
          exam: {
            subject: q.exam.subject.name,
            professor: q.exam.professor?.name || "N/A",
            university: q.exam.university.name,
          },
        };
      })
    );

    return NextResponse.json({ questions: questionsWithGroupCount });
  } catch (error) {
    console.error("Error searching similar questions:", error);
    return NextResponse.json(
      { error: "Errore nella ricerca" },
      { status: 500 }
    );
  }
}
