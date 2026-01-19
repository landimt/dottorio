import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/professors - List all professors (optionally filtered by subject)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const professors = await prisma.professor.findMany({
      where: subjectId
        ? {
            subjects: {
              some: { subjectId },
            },
          }
        : undefined,
      orderBy: { name: "asc" },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: { exams: true },
        },
      },
    });

    return NextResponse.json(professors);
  } catch (error) {
    console.error("Error fetching professors:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei professori" },
      { status: 500 }
    );
  }
}
