import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess } from "@/lib/api/api-response";

// GET /api/admin/content-flags - List content flags with pagination and filters
export const GET = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const status = searchParams.get("status") || "";
  const type = searchParams.get("type") || "";

  // Build where clause
  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  // Get total count
  const total = await prisma.contentFlag.count({ where });

  // Get content flags with pagination
  const flags = await prisma.contentFlag.findMany({
    where,
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
    orderBy: [
      { status: "asc" }, // Pending first
      { createdAt: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  return apiSuccess({
    flags,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
