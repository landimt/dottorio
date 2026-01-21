import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { apiSuccess, apiUnknownError } from "@/lib/api/api-response";

const cookieConsentSchema = z.object({
  userId: z.string().uuid().nullable(),
  preferences: z.object({
    necessary: z.boolean(),
    analytics: z.boolean().default(false),
    marketing: z.boolean().default(false),
  }),
  policyVersion: z.string().default("1.0.0"),
});

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = cookieConsentSchema.parse(body);

    const ipAddress = getClientIp(request);

    const consent = await prisma.cookieConsent.create({
      data: {
        userId: data.userId,
        ipAddress,
        preferences: data.preferences,
        policyVersion: data.policyVersion,
      },
    });

    return apiSuccess({ id: consent.id }, 201);
  } catch (error) {
    return apiUnknownError(error, "Errore durante il salvataggio del consenso");
  }
}
