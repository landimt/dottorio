import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";

export async function GET() {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          professors: true,
          users: true,
          channels: true,
        },
      },
    },
  });

  return NextResponse.json(universities);
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const body = await request.json();
  const { name, shortName, city, emoji } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nome é obrigatório" },
      { status: 400 }
    );
  }

  const university = await prisma.university.create({
    data: {
      name: name.trim(),
      shortName: shortName?.trim() || null,
      city: city?.trim() || null,
      emoji: emoji?.trim() || null,
    },
  });

  return NextResponse.json(university, { status: 201 });
}
