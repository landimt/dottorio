import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: "postgresql://dottorio:dottorio_dev_2024@localhost:5435/dottorio",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const text = "tessuto muscolare";
    const searchWords = text
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 5);

    console.log("Search words:", searchWords);

    const searchConditions = searchWords.map((word) => ({
      text: {
        contains: word,
        mode: "insensitive" as const,
      },
    }));

    console.log("Searching for similar questions...");

    const similarQuestions = await prisma.question.findMany({
      where: {
        AND: [
          { isCanonical: true },
          { OR: searchConditions },
        ],
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
        aiAnswer: {
          select: { id: true },
        },
        _count: {
          select: {
            studentAnswers: { where: { isPublic: true } },
            variations: true,
          },
        },
      },
      orderBy: [
        { views: "desc" },
        { createdAt: "desc" },
      ],
      take: 5,
    });

    console.log("Found questions:", similarQuestions.length);
    similarQuestions.forEach(q => {
      console.log("\n- ", q.text.substring(0, 50) + "...");
      console.log("  Subject:", q.exam.subject.name);
      console.log("  Professor:", q.exam.professor?.name || "N/A");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
