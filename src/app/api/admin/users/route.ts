import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/admin/admin-api";
import { apiSuccess } from "@/lib/api/api-response";

// GET /api/admin/users - List all users with pagination and filters
export const GET = withAdminAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const status = searchParams.get("status") || "";
  const universityId = searchParams.get("universityId") || "";

  // Build where clause
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (universityId) {
    where.universityId = universityId;
  }

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users with pagination
  const users = await prisma.user.findMany({
    where,
    include: {
      university: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          exams: true,
          studentAnswers: true,
          comments: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  return apiSuccess({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
