import { prisma } from "@/lib/prisma";
import { UsersTable } from "./_components/users-table";

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      university: true,
      channel: true,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie contas e permissões dos usuários
        </p>
      </div>

      <UsersTable users={users} />
    </div>
  );
}
