import { prisma } from "@/lib/prisma";
import { StatCard } from "./_components/stat-card";
import { QuickActions } from "./_components/quick-actions";
import { MessageSquare, Users, BookOpen, GraduationCap, School, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

async function getAdminStats() {
  const [
    totalUsers,
    totalQuestions,
    totalExams,
    totalProfessors,
    totalUniversities,
    totalSubjects,
    activeUsers,
    pendingFlags,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.exam.count(),
    prisma.professor.count(),
    prisma.university.count(),
    prisma.subject.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.contentFlag.count({ where: { status: "pending" } }),
  ]);

  return {
    totalUsers,
    totalQuestions,
    totalExams,
    totalProfessors,
    totalUniversities,
    totalSubjects,
    activeUsers,
    pendingFlags,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const quickActions = [
    {
      title: "Gerenciar Usuários",
      description: "Ver e editar contas e permissões",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Cadastros",
      description: "Universidades, matérias e professores",
      href: "/admin/cadastros",
      icon: School,
    },
    {
      title: "Gerenciar Questões",
      description: "Ver e moderar questões",
      href: "/admin/questions",
      icon: BookOpen,
    },
    {
      title: "Moderação",
      description: "Conteúdos reportados",
      href: "/admin/moderation",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema Dottorio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Questões"
          value={stats.totalQuestions}
          subtitle="No catálogo"
          icon={MessageSquare}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title="Usuários"
          value={stats.totalUsers}
          subtitle={`${stats.activeUsers} ativos`}
          icon={Users}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title="Exames"
          value={stats.totalExams}
          subtitle="Cadastrados"
          icon={BookMarked}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
        <StatCard
          title="Professores"
          value={stats.totalProfessors}
          subtitle="No sistema"
          icon={GraduationCap}
          iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <QuickActions actions={quickActions} />

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
            <CardDescription>Informações do Dottorio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Universidades:</span>
                <span className="text-muted-foreground">{stats.totalUniversities}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Matérias:</span>
                <span className="text-muted-foreground">{stats.totalSubjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Professores:</span>
                <span className="text-muted-foreground">{stats.totalProfessors}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Exames:</span>
                <span className="text-muted-foreground">{stats.totalExams}</span>
              </div>
            </div>

            {stats.pendingFlags > 0 && (
              <div className="mt-4 rounded-lg bg-amber-100 p-4 dark:bg-amber-900/20">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                  ⚠️ {stats.pendingFlags} conteúdo(s) aguardando moderação
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
