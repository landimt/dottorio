import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌ Forneça um email: tsx scripts/make-admin.ts usuario@email.com");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      role: "admin",
      status: "active"
    },
  });

  console.log(`✅ Usuário ${user.name} (${user.email}) agora é ADMIN!`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
