import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { apiSuccess, apiError, apiUnknownError } from "@/lib/api/api-response";

const registerSchema = z.object({
  name: z.string().min(2, "Il nome deve avere almeno 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
  universityId: z.string().uuid("Università non valida"),
  year: z.number().int().min(1).max(6, "L'anno deve essere tra 1 e 6"),
  courseId: z.string().uuid("Corso non valido"),
  isRepresentative: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return apiError("Email già registrata", 400, "EMAIL_EXISTS");
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: data.universityId },
    });

    if (!university) {
      return apiError("Università non trovata", 400, "UNIVERSITY_NOT_FOUND");
    }

    // Hash password
    const passwordHash = await hash(data.password, 12);

    // Check if course exists and belongs to university
    const course = await prisma.course.findFirst({
      where: { id: data.courseId, universityId: data.universityId },
    });

    if (!course) {
      return apiError("Corso non trovato o non appartiene all'università selezionata", 400, "COURSE_NOT_FOUND");
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        universityId: data.universityId,
        year: data.year,
        courseId: data.courseId,
        isRepresentative: data.isRepresentative,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return apiSuccess(user, 201);
  } catch (error) {
    return apiUnknownError(error, "Errore durante la registrazione");
  }
}
