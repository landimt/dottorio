import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

export async function GET() {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        universityId: true,
      },
    });

    return apiSuccess(channels);
  } catch (error) {
    return apiUnknownError(error, "Errore nel caricamento dei canali");
  }
}
