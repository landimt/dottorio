import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";

export async function GET() {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const professors = await prisma.professor.findMany({
    orderBy: { name: "asc" },
    include: {
      university: true,
      subjects: {
        include: {
          subject: true,
        },
      },
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  return NextResponse.json(professors);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const body = await request.json();
  const { name, universityId, subjectIds } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  // Create professor with subjects relation
  const professor = await prisma.professor.create({
    data: {
      name: name.trim(),
      universityId: universityId || null,
      subjects: {
        create: (subjectIds || []).map((subjectId: string) => ({
          subjectId,
        })),
      },
    },
    include: {
      university: true,
      subjects: {
        include: {
          subject: true,
        },
      },
    },
  });

  return NextResponse.json(professor, { status: 201 });
}
