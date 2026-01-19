import { auth } from "@/lib/auth";
import { questionService } from "@/lib/services/question.service";
import { searchQuestionsSchema, createQuestionSchema } from "@/lib/validations/question.schema";
import { apiSuccess, apiUnknownError, ApiErrors } from "@/lib/api/api-response";
import { ZodError } from "zod";

// GET /api/questions - Search questions
export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);

    const params = {
      query: searchParams.get("query") || undefined,
      subjectId: searchParams.get("subjectId") || undefined,
      professorId: searchParams.get("professorId") || undefined,
      universityId: searchParams.get("universityId") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    };

    const validatedParams = searchQuestionsSchema.parse(params);
    const result = await questionService.search(validatedParams, session?.user?.id);

    return apiSuccess(result);
  } catch (error) {
    return apiUnknownError(error, "Errore nella ricerca delle domande");
  }
}

// POST /api/questions - Create a new question
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = createQuestionSchema.parse(body);

    const question = await questionService.create(validatedData, session.user.id);

    return apiSuccess(question, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiUnknownError(error);
    }

    if (error instanceof Error && error.message.includes("non trovato")) {
      return ApiErrors.notFound("Esame");
    }

    return apiUnknownError(error, "Errore nella creazione della domanda");
  }
}
