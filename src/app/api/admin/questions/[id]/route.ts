import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminApi, isErrorResponse } from "@/lib/admin/admin-api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdminApi();
  if (isErrorResponse(authResult)) return authResult;

  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id },
  });

  if (!question) {
    return NextResponse.json(
      { error: "Questão não encontrada" },
      { status: 404 }
    );
  }

  // If this is a canonical question, update variations to remove the link
  if (question.isCanonical) {
    await prisma.question.updateMany({
      where: { canonicalId: id },
      data: {
        canonicalId: null,
        isCanonical: true,
      },
    });
  }

  // Delete the question (cascade will delete related answers, comments, etc)
  await prisma.question.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
