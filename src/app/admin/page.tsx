import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { StatCard } from "./_components/stat-card";
import { QuickActions } from "./_components/quick-actions";
import { MessageSquare, Users, GraduationCap, BookMarked } from "lucide-react";
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
  const t = await getTranslations("admin");

  const quickActions = [
    {
      title: t("quickActions.manageUsers"),
      description: t("quickActions.manageUsersDesc"),
      href: "/admin/users",
      icon: "users" as const,
    },
    {
      title: t("quickActions.registries"),
      description: t("quickActions.registriesDesc"),
      href: "/admin/cadastros",
      icon: "school" as const,
    },
    {
      title: t("quickActions.manageQuestions"),
      description: t("quickActions.manageQuestionsDesc"),
      href: "/admin/questions",
      icon: "book-open" as const,
    },
    {
      title: t("quickActions.moderation"),
      description: t("quickActions.moderationDesc"),
      href: "/admin/moderation",
      icon: "graduation-cap" as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">
          {t("systemOverview")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("questions")}
          value={stats.totalQuestions}
          subtitle={t("inCatalog")}
          icon={MessageSquare}
          iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          title={t("users")}
          value={stats.totalUsers}
          subtitle={t("activeCount", { count: stats.activeUsers })}
          icon={Users}
          iconClassName="bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        />
        <StatCard
          title={t("exams")}
          value={stats.totalExams}
          subtitle={t("registered")}
          icon={BookMarked}
          iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
        <StatCard
          title={t("professors")}
          value={stats.totalProfessors}
          subtitle={t("inSystem")}
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
            <CardTitle>{t("aboutSystem")}</CardTitle>
            <CardDescription>{t("systemInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("universities")}:</span>
                <span className="text-muted-foreground">{stats.totalUniversities}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("subjects")}:</span>
                <span className="text-muted-foreground">{stats.totalSubjects}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("professors")}:</span>
                <span className="text-muted-foreground">{stats.totalProfessors}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">{t("exams")}:</span>
                <span className="text-muted-foreground">{stats.totalExams}</span>
              </div>
            </div>

            {stats.pendingFlags > 0 && (
              <div className="mt-4 rounded-lg bg-amber-100 p-4 dark:bg-amber-900/20">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-400">
                  {t("pendingModeration", { count: stats.pendingFlags })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
