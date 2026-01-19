import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const universities = await prisma.university.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        emoji: true,
      },
    });

    return NextResponse.json(universities);
  } catch (error) {
    console.error("Error fetching universities:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento delle università" },
      { status: 500 }
    );
  }
}
