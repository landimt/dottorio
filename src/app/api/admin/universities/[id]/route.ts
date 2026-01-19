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

  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      channels: true,
      _count: {
        select: {
          professors: true,
          users: true,
        },
      },
    },
  });

  if (!university) {
    return NextResponse.json(
      { error: "Universidade não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(university);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { name, shortName, city, emoji } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  const university = await prisma.university.update({
    where: { id },
    data: {
      name: name.trim(),
      shortName: shortName?.trim() || null,
      city: city?.trim() || null,
      emoji: emoji?.trim() || null,
    },
  });

  return NextResponse.json(university);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;

  // Check if university has dependencies
  const university = await prisma.university.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
          professors: true,
          exams: true,
        },
      },
    },
  });

  if (!university) {
    return NextResponse.json(
      { error: "Universidade não encontrada" },
      { status: 404 }
    );
  }

  if (university._count.users > 0 || university._count.exams > 0) {
    return NextResponse.json(
      { error: "Não é possível excluir universidade com usuários ou exames vinculados" },
      { status: 400 }
    );
  }

  await prisma.university.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
