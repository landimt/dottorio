import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiUnknownError } from "@/lib/api/api-response";

export async function GET() {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            professors: true,
            exams: true,
          },
        },
      },
    });

    return apiSuccess(subjects);
  } catch (error) {
    return apiUnknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminApi();
    if (isErrorResponse(authResult)) return authResult;

    const body = await request.json();
    const { name, emoji, color } = body;

    if (!name?.trim()) {
      return ApiErrors.badRequest("Nome è obbligatorio");
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        emoji: emoji?.trim() || null,
        color: color?.trim() || null,
      },
    });

    return apiSuccess(subject, 201);
  } catch (error) {
    return apiUnknownError(error);
  }
}
