import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";
import { auth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]/related
 * Get related questions based on filters passed via URL query params
 * Accepts filters: subjectId, professorId, universityId, courseId, year
 * If no filters provided, falls back to same subject/professor of current question
 * Ordered by views (descending)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    // Get filters from URL query params
    const subjectIdFilter = searchParams.get("subjectId");
    const professorIdFilter = searchParams.get("professorId");
    const universityIdFilter = searchParams.get("universityId");
    const courseIdFilter = searchParams.get("courseId");
    const yearFilter = searchParams.get("year");

    const session = await auth();
    const userId = session?.user?.id;

    // First get the question with exam details (for fallback if no filters)
    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        examId: true,
        exam: {
          select: {
            subjectId: true,
            professorId: true,
            universityId: true,
            courseId: true,
            year: true,
          }
        }
      },
    });

    if (!question) {
      return apiSuccess({
        questions: [],
        pagination: { page, limit, total: 0, hasMore: false }
      });
    }

    // Build where clause based on filters (or fallback to question's data)
    const examFilters: any = {};

    // Subject filter (required - use filter or fallback to current question's subject)
    examFilters.subjectId = subjectIdFilter || question.exam.subjectId;

    // Optional filters - only add if provided
    if (professorIdFilter) {
      examFilters.professorId = professorIdFilter;
    }
    if (universityIdFilter) {
      examFilters.universityId = universityIdFilter;
    }
    if (courseIdFilter) {
      examFilters.courseId = courseIdFilter;
    }
    if (yearFilter) {
      examFilters.year = parseInt(yearFilter);
    }

    const whereClause = {
      id: { not: id },
      exam: examFilters,
    };

    // Get total count for pagination
    const total = await prisma.question.count({
      where: whereClause,
    });

    // Get related questions
    const relatedQuestions = await prisma.question.findMany({
      where: whereClause,
      include: {
        exam: {
          include: {
            professor: true,
            subject: true,
            university: true,
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
      skip,
      take: limit,
    });

    // Add isSaved field based on user session
    let questionsWithSavedStatus = relatedQuestions.map((q) => ({ ...q, isSaved: false }));

    if (userId) {
      // Fetch all saved questions in one query for efficiency
      const savedQuestions = await prisma.savedQuestion.findMany({
        where: {
          userId,
          questionId: {
            in: relatedQuestions.map((q) => q.id),
          },
        },
        select: {
          questionId: true,
        },
      });

      const savedQuestionIds = new Set(savedQuestions.map((sq) => sq.questionId));
      questionsWithSavedStatus = relatedQuestions.map((q) => ({
        ...q,
        isSaved: savedQuestionIds.has(q.id),
      }));
    }

    const hasMore = skip + limit < total;

    return apiSuccess({
      questions: questionsWithSavedStatus,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error) {
    return apiUnknownError(error, "Errore nel recupero delle domande correlate");
  }
}
