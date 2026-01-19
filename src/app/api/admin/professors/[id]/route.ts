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

  const professor = await prisma.professor.findUnique({
    where: { id },
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

  if (!professor) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(professor);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { name, universityId, subjectIds } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  // Update professor and rebuild subjects relation
  const professor = await prisma.$transaction(async (tx) => {
    // Delete existing subject relations
    await tx.professorSubject.deleteMany({
      where: { professorId: id },
    });

    // Update professor with new subjects
    return tx.professor.update({
      where: { id },
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
  });

  return NextResponse.json(professor);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;

  // Check if professor has dependencies
  const professor = await prisma.professor.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          exams: true,
        },
      },
    },
  });

  if (!professor) {
    return NextResponse.json(
      { error: "Professor não encontrado" },
      { status: 404 }
    );
  }

  if (professor._count.exams > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir professor com exames vinculados" },
      { status: 400 }
    );
  }

  // Delete professor-subject relations first
  await prisma.professorSubject.deleteMany({
    where: { professorId: id },
  });

  await prisma.professor.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
