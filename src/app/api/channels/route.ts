import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        universityId: true,
      },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    return NextResponse.json(
      { error: "Errore nel caricamento dei canali" },
      { status: 500 }
    );
  }
}
