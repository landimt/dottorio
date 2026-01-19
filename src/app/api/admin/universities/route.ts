import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiUnknownError } from "@/lib/api/api-response";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const universities = await prisma.university.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            professors: true,
            users: true,
            channels: true,
          },
        },
      },
    });

    return apiSuccess(universities);
  } catch (error) {
    return apiUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const body = await request.json();
    const { name, shortName, city, emoji } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    const university = await prisma.university.create({
      data: {
        name: name.trim(),
        shortName: shortName?.trim() || null,
        city: city?.trim() || null,
        emoji: emoji?.trim() || null,
      },
    });

    return apiSuccess(university, 201);
  } catch (error) {
    return apiUnknownError(error);
  }
}
