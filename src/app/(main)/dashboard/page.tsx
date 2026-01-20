import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Star, Calendar, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

async function getUserStats(userId: string) {
  const [questionsAdded, questionsSaved, answersCount, commentsCount] = await Promise.all([
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
  const streak = questionsAdded > 0 ? Math.min(questionsAdded + answersCount + commentsCount, 30) : 0;

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
    take: 5,
  });

  return recentQuestions;
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const t = await getTranslations("dashboard");
  const tCommon = await getTranslations("common");

  if (!user?.id) {
    return null;
  }

  const stats = await getUserStats(user.id);
  const recentQuestions = await getRecentQuestions(user.id);

  const statItems = [
    { label: t("questionsAdded"), value: stats.questionsAdded, icon: Plus },
    { label: t("questionsStudied"), value: stats.questionsStudied, icon: Eye },
    { label: t("questionsSaved"), value: stats.questionsSaved, icon: Star },
    { label: t("activity"), value: stats.streak, icon: Calendar },
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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          {t("greeting", { name: user?.name?.split(" ")[0] || "" })}
        </h1>
        <p className="text-muted-foreground">
          {user?.universityName} • {user?.year}º Anno
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/exams/new">
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              {t("registerQuestion")}
            </Button>
          </Link>
          <Link href="/search">
            <Button className="gap-2 bg-primary hover:bg-primary/90">
              <Search className="w-4 h-4" />
              {t("searchQuestions")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-6">
                <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <p className="font-medium text-green-700 dark:text-green-400 mb-1">
              {t("newUpdate")}
            </p>
            <p className="text-sm text-green-600 dark:text-green-500">
              {t("newUpdateDescription")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <p className="font-medium text-orange-700 dark:text-orange-400 mb-1">
              {t("examPeriod")}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-500">
              {t("examPeriodDescription")}{" "}
              {stats.streak > 0
                ? t("studyStreak", { days: stats.streak })
                : t("startStreak")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t("recent")}
          </CardTitle>
          {recentQuestions.length > 0 && (
            <Link href="/search">
              <Button variant="ghost" size="sm" className="text-primary">
                {t("viewAll")}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {recentQuestions.length > 0 ? (
            <div className="space-y-3">
              {recentQuestions.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2 mb-2">
                        {question.text}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {question.exam.subject.name}
                        </Badge>
                        <span>{question.exam.professor?.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {question.views}
                        </span>
                        <span>•</span>
                        <span>{formatDate(question.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
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
    </div>
  );
}
