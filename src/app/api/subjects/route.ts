import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

// GET /api/subjects - List all subjects (optionally filtered by course and/or year)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const year = searchParams.get("year");

    const where: { courseId?: string; year?: number } = {};
    if (courseId) where.courseId = courseId;
    if (year) where.year = parseInt(year, 10);

    const subjects = await prisma.subject.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
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
