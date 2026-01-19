import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/questions/canonical - Search canonical questions for linking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const excludeId = searchParams.get("excludeId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    // Build where clause
    const whereClause: Record<string, unknown> = {
      isCanonical: true,
    };

    // Add search condition if query provided
    if (query.length >= 2) {
      whereClause.text = {
        contains: query,
        mode: "insensitive",
      };
    }

    // Exclude specific question if provided
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    // Find canonical questions
    const questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
          },
        },
        _count: {
          select: {
            variations: true,
          },
        },
      },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Format response
    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      groupId: q.groupId,
      variationsCount: q._count.variations,
      subject: q.exam.subject.name,
      professor: q.exam.professor?.name || null,
    }));

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error) {
    console.error("Error searching canonical questions:", error);
    return NextResponse.json(
      { error: "Errore nella ricerca" },
      { status: 500 }
    );
  }
}
