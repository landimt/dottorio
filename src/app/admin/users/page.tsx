import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { UsersTable } from "./_components/users-table";

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      university: true,
      course: true,
      _count: {
        select: {
          exams: true,
          studentAnswers: true,
          comments: true,
        },
      },
    },
  });

  return users;
}

export default async function UsersPage() {
  const users = await getUsers();
  const t = await getTranslations("admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("users")}</h1>
        <p className="text-muted-foreground">
          {t("quickActions.manageUsersDesc")}
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
