import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/subjects - List all subjects
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { exams: true },
        },
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle materie" },
      { status: 500 }
    );
  }
}
