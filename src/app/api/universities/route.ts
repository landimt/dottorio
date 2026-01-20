import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        emoji: true,
      },
    });

    return apiSuccess(universities);
  } catch (error) {
    return apiUnknownError(error, "Errore nel caricamento delle università");
  }
}
