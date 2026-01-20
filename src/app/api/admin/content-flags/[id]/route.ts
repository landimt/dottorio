import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess, ApiErrors, apiValidationError } from "@/lib/api/api-response";
import { reviewContentFlagSchema } from "@/lib/validations/admin.schema";
import { ZodError } from "zod";

// GET /api/admin/content-flags/[id] - Get single content flag
export const GET = withAdminAuth<{ id: string }>(async (request, { params }) => {
  const { id } = await params;

  const flag = await prisma.contentFlag.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!flag) {
    return ApiErrors.notFound("Segnalazione");
  }

  return apiSuccess(flag);
});

// PUT /api/admin/content-flags/[id] - Take action on content flag
export const PUT = withAdminAuth<{ id: string }>(async (request, { params }, authResult) => {
  const { id } = await params;
  const body = await request.json();

  try {
    const data = reviewContentFlagSchema.parse(body);

    // Check flag exists
    const existingFlag = await prisma.contentFlag.findUnique({
      where: { id },
    });

    if (!existingFlag) {
      return ApiErrors.notFound("Segnalazione");
    }

    // If status is 'deleted', we should also delete the flagged content
    if (data.status === "deleted") {
      try {
        // Delete the flagged content based on type
        switch (existingFlag.type) {
          case "question":
            await prisma.question.delete({ where: { id: existingFlag.entityId } });
            break;
          case "answer":
            await prisma.studentAnswer.delete({ where: { id: existingFlag.entityId } });
            break;
          case "comment":
            await prisma.comment.delete({ where: { id: existingFlag.entityId } });
            break;
        }
      } catch {
        // Content might already be deleted, continue
      }
    }

    // Update the flag
    const flag = await prisma.contentFlag.update({
      where: { id },
      data: {
        status: data.status,
        action: data.action || data.status,
        reviewedBy: authResult.adminId,
        reviewedAt: new Date(),
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: authResult.adminId,
        action: `flag_${data.status}`,
        entityType: "content_flag",
        entityId: id,
        changes: JSON.stringify({
          flagType: existingFlag.type,
          flaggedEntityId: existingFlag.entityId,
          reason: existingFlag.reason,
          newStatus: data.status,
          action: data.action || data.status,
        }),
      },
    });

    return apiSuccess(flag);
  } catch (error) {
    if (error instanceof ZodError) {
      return apiValidationError(error);
    }
    throw error;
  }
});
