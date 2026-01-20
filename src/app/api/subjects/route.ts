import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

// GET /api/subjects - List all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { exams: true },
        },
      },
    });

    return apiSuccess(subjects);
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero delle materie");
  }
}
