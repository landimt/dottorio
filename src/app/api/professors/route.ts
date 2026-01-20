import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

// GET /api/professors - List all professors (optionally filtered by subject)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const professors = await prisma.professor.findMany({
      where: subjectId
        ? {
            subjects: {
              some: { subjectId },
            },
          }
        : undefined,
      orderBy: { name: "asc" },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: { exams: true },
        },
      },
    });

    return apiSuccess(professors);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero dei professori");
  }
}
