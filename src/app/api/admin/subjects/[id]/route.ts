import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      professors: {
        include: {
          professor: true,
        },
      },
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Matéria não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(subject);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { name, emoji, color } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  const subject = await prisma.subject.update({
    where: { id },
    data: {
      name: name.trim(),
      emoji: emoji?.trim() || null,
      color: color?.trim() || null,
    },
  });

  return NextResponse.json(subject);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;

  // Check if subject has dependencies
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!subject) {
    return NextResponse.json(
      { error: "Matéria não encontrada" },
      { status: 404 }
    );
  }

  if (subject._count.exams > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir matéria com exames vinculados" },
      { status: 400 }
    );
  }

  // Delete professor-subject relations first
  await prisma.professorSubject.deleteMany({
    where: { subjectId: id },
  });

  await prisma.subject.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
