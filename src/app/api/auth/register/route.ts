import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password deve ter no mínimo 6 caracteres"),
  universityId: z.string().uuid("Universidade inválida"),
  year: z.number().int().min(1).max(6, "Anno deve essere tra 1 e 6"),
  channelId: z.string().uuid().optional().nullable(),
  isRepresentative: z.boolean().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già registrata" },
        { status: 400 }
      );
    }

    // Check if university exists
    const university = await prisma.university.findUnique({
      where: { id: data.universityId },
    });

    if (!university) {
      return NextResponse.json(
        { error: "Università non trovata" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        universityId: data.universityId,
        year: data.year,
        channelId: data.channelId || null,
        isRepresentative: data.isRepresentative,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione" },
      { status: 500 }
    );
  }
}
