import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";

export async function GET() {
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

  return NextResponse.json(subjects);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const body = await request.json();
  const { name, emoji, color } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  const subject = await prisma.subject.create({
    data: {
      name: name.trim(),
      emoji: emoji?.trim() || null,
      color: color?.trim() || null,
    },
  });

  return NextResponse.json(subject, { status: 201 });
}
