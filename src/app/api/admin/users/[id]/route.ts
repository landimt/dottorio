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

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      university: true,
      channel: true,
      _count: {
        select: {
          exams: true,
          studentAnswers: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;
  const body = await request.json();
  const { name, role, status } = body;

  // Validate role
  const validRoles = ["student", "representative", "admin", "super_admin"];
  if (role && !validRoles.includes(role)) {
    return NextResponse.json(
      { error: "Role inválida" },
      { status: 400 }
    );
  }

  // Validate status
  const validStatuses = ["active", "suspended", "banned"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json(
      { error: "Status inválido" },
      { status: 400 }
    );
  }

  // Prevent changing own role (security measure)
  if (role === "super_admin" && authResult.adminRole !== "super_admin") {
    return NextResponse.json(
      { error: "Apenas super admins podem promover outros a super admin" },
      { status: 403 }
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(role && { role }),
      ...(status && { status }),
      // Sync isRepresentative with role
      ...(role && { isRepresentative: role === "representative" }),
    },
  });

  return NextResponse.json(user);
}
