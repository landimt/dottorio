import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess } from "@/lib/api/api-response";

// GET /api/admin/audit-logs - List audit logs with pagination and filters
export const GET = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const adminId = searchParams.get("adminId") || "";
  const action = searchParams.get("action") || "";
  const entityType = searchParams.get("entityType") || "";

  // Build where clause
  const where: Record<string, unknown> = {};

  if (adminId) {
    where.adminId = adminId;
  }

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entityType = entityType;
  }

  // Get total count
  const total = await prisma.auditLog.count({ where });

  // Get audit logs with pagination
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      admin: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return apiSuccess({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
