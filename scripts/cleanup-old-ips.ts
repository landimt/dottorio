import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupOldIps() {
  const twentyOneDaysAgo = new Date();
  twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);

  console.log(`🧹 Cleaning up IPs older than ${twentyOneDaysAgo.toISOString()}`);

  // Cleanup User registration IPs
  const usersUpdated = await prisma.user.updateMany({
    where: {
      registrationIp: { not: null },
      createdAt: { lt: twentyOneDaysAgo },
    },
    data: {
      registrationIp: null,
    },
  });

  console.log(`✅ Cleaned ${usersUpdated.count} user registration IPs`);

  // Cleanup CookieConsent IPs
  const consentsUpdated = await prisma.cookieConsent.updateMany({
    where: {
      ipAddress: { not: null },
      consentDate: { lt: twentyOneDaysAgo },
    },
    data: {
      ipAddress: null,
    },
  });

  console.log(`✅ Cleaned ${consentsUpdated.count} cookie consent IPs`);

  await prisma.$disconnect();
}

cleanupOldIps()
  .catch((error) => {
    console.error("❌ Error during IP cleanup:", error);
    process.exit(1);
  });
