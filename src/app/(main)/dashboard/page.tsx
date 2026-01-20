import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Eye,
  Star,
  Target,
  Clock,
  Zap,
  Bell,
  BarChart3,
  Trophy,
  Activity,
  Heart,
  Pill,
  Microscope,
  Droplets,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

async function getUserStats(userId: string) {
  const [questionsAdded, questionsSaved, answersCount, commentsCount] =
    await Promise.all([
      // Questions added by user (through exams they created)
      prisma.question.count({
        where: {
          exam: { createdBy: userId },
        },
      }),
      // Questions saved by user
      prisma.savedQuestion.count({
        where: { userId },
      }),
      // Answers written by user
      prisma.studentAnswer.count({
        where: { userId },
      }),
      // Comments by user
      prisma.comment.count({
        where: { userId },
      }),
    ]);

  // Simple streak calculation (would need proper activity tracking table)
  const streak =
    questionsAdded > 0
      ? Math.min(questionsAdded + answersCount + commentsCount, 30)
      : 0;

  return {
    questionsAdded,
    questionsSaved,
    questionsStudied: answersCount + commentsCount, // approximation
    streak,
  };
}

async function getRecentQuestions(userId: string) {
  // Get recent questions from exams the user created or saved
  const recentQuestions = await prisma.question.findMany({
    where: {
      OR: [
        { exam: { createdBy: userId } },
        { savedBy: { some: { userId } } },
      ],
    },
    include: {
      exam: {
        include: {
          subject: true,
          professor: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return recentQuestions;
}

// Mock data for weekly activity
const weeklyActivity = [
  { day: "Lun", questions: 5 },
  { day: "Mar", questions: 8 },
  { day: "Mer", questions: 12 },
  { day: "Gio", questions: 6 },
  { day: "Ven", questions: 9 },
  { day: "Sab", questions: 3 },
  { day: "Dom", questions: 4 },
];

// Mock data for top contributors
const topContributors = [
  { name: "Marco R.", questions: 24 },
  { name: "Giulia S.", questions: 19 },
  { name: "Andrea M.", questions: 15 },
];

// Mock data for community stats
const communityStats = {
  totalQuestions: 1247,
  activeStudents: 189,
  universities: 24,
  approvalRate: 98,
};

// Color mapping for recent questions icons - using CSS variables
const questionIcons = [
  { Icon: Heart, colorClass: "text-primary", bgClass: "bg-primary/10", borderClass: "border-primary/30" },
  { Icon: Pill, colorClass: "text-accent", bgClass: "bg-accent/10", borderClass: "border-accent/30" },
  { Icon: Microscope, colorClass: "text-red-600", bgClass: "bg-red-50", borderClass: "border-red-200" },
  { Icon: Droplets, colorClass: "text-muted-foreground", bgClass: "bg-muted", borderClass: "border-border" },
];

// Activity bar colors - using Tailwind classes
const activityColorClasses = [
  "bg-red-600",
  "bg-accent",
  "bg-primary",
  "bg-gray-400",
  "bg-gray-600",
  "bg-red-600",
  "bg-accent",
];

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const t = await getTranslations("dashboard");

  if (!user?.id) {
    return null;
  }

  const stats = await getUserStats(user.id);
  const recentQuestions = await getRecentQuestions(user.id);

  const statItems = [
    { label: t("questionsAdded"), value: stats.questionsAdded, icon: Plus },
    { label: t("questionsStudied"), value: stats.questionsStudied, icon: Eye },
    { label: t("questionsSaved"), value: stats.questionsSaved, icon: Star },
    { label: t("activity"), value: stats.streak, icon: Target },
  ];

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) return t("minAgo", { minutes });
    if (hours < 24) return t("hoursAgo", { hours });
    if (days < 7) return t("daysAgo", { days });
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "short",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-medium text-foreground">
            {t("greeting", { name: user?.name?.split(" ")[0] || "" })} 👋
          </h1>
          <p className="text-muted-foreground">
            {user?.universityName} • {user?.year}º Anno
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/exams/new">
            <Button
              variant="outline"
              className="px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2 group border-border hover:border-primary"
            >
              <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
              <span>{t("registerQuestion")}</span>
            </Button>
          </Link>

          <Link href="/search">
            <Button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors">
              <Search className="w-5 h-5" />
              <span>{t("searchQuestions")}</span>
            </Button>
          </Link>
        </div>

        {/* Announcements/Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Alert className="border-primary/30 hover:border-primary/60 transition-all duration-300 bg-card">
            <Zap className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <div className="space-y-1">
                <p className="font-medium">🎉 {t("newUpdate")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("newUpdateDescription")}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 bg-card">
            <Bell className="h-4 w-4 text-orange-500" />
            <AlertDescription className="text-foreground">
              <div className="space-y-1">
                <p className="font-medium">📚 {t("examPeriod")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("examPeriodDescription")}{" "}
                  {stats.streak > 0
                    ? t("studyStreak", { days: stats.streak })
                    : t("startStreak")}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center bg-muted">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <p className="text-2xl font-medium text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Questions & Weekly Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Questions */}
          <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 pb-4">
              <CardTitle className="text-foreground flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border/50">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <span>{t("recent")}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {recentQuestions.length} {t("questionsLabel")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {recentQuestions.length > 0 ? (
                <div className="space-y-2">
                  {recentQuestions.map((question, index) => {
                    const { Icon, colorClass, bgClass, borderClass } =
                      questionIcons[index % questionIcons.length];
                    return (
                      <Link
                        key={question.id}
                        href={`/questions/${question.id}`}
                        className="block"
                      >
                        <div
                          className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card to-muted/10 hover:shadow-md transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${bgClass} border ${borderClass}`}
                            >
                              <Icon
                                className={`w-5 h-5 ${colorClass}`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                {question.text}
                              </p>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  className={`text-xs px-2 py-0.5 ${bgClass} ${colorClass} border ${borderClass}`}
                                >
                                  {question.exam.subject.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  • {formatDate(question.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {t("noInteractions")}
                  </p>
                  <Link href="/search">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      {t("exploreQuestions")}
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span>{t("weeklyActivity")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {weeklyActivity.map((day, index) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground w-8">
                      {day.day}
                    </span>
                    <div className="flex-1 mx-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${activityColorClasses[index % 7]}`}
                          style={{
                            width: `${(day.questions / 12) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {day.questions}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Contributors */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>{t("topContributors")}</span>
                <Badge
                  variant="outline"
                  className="ml-auto text-xs border-border text-muted-foreground"
                >
                  {t("thisWeek")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {topContributors.map((contributor, index) => {
                  const colors = ["#DC2626", "#FFA78D", "#005a9c"];
                  return (
                    <div
                      key={contributor.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white"
                          style={{
                            backgroundColor: colors[index % 3],
                          }}
                        >
                          {index + 1}
                        </div>
                        <span className="font-medium text-foreground">
                          {contributor.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {contributor.questions}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("questionsLabel")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-foreground flex items-center space-x-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span>{t("communityStats")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center space-y-1">
                  <p className="text-2xl font-medium text-foreground">
                    {communityStats.totalQuestions.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("totalQuestions")}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-medium text-foreground">
                    {communityStats.activeStudents}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("activeStudents")}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-medium text-foreground">
                    {communityStats.universities}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("universities")}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-2xl font-medium text-foreground">
                    {communityStats.approvalRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("approvalRate")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
