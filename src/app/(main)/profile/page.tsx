import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Plus,
  Settings,
  Bookmark,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { ProfileTabs } from "./_components/profile-tabs";

async function getUserStats(userId: string) {
  const [
    questionsAdded,
    questionsSaved,
    commentsCount,
    answersCount,
    totalViews,
  ] = await Promise.all([
    prisma.question.count({
      where: { exam: { createdBy: userId } },
    }),
    prisma.savedQuestion.count({
      where: { userId },
    }),
    prisma.comment.count({
      where: { userId },
    }),
    prisma.studentAnswer.count({
      where: { userId },
    }),
    prisma.question.aggregate({
      where: { exam: { createdBy: userId } },
      _sum: { views: true },
    }),
  ]);

  // Total contributions = answers + comments
  const contributions = answersCount + commentsCount;

  return {
    questionsAdded,
    questionsSaved,
    commentsCount,
    answersCount,
    contributions,
    totalViews: totalViews._sum.views || 0,
  };
}

async function getSavedQuestions(userId: string) {
  const savedQuestions = await prisma.savedQuestion.findMany({
    where: { userId },
    include: {
      question: {
        include: {
          exam: {
            include: {
              subject: true,
              professor: true,
              university: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return savedQuestions.map(sq => sq.question);
}

async function getUserContributions(userId: string) {
  // Get questions from user's answers and comments
  const [answerQuestions, commentQuestions] = await Promise.all([
    prisma.question.findMany({
      where: {
        studentAnswers: {
          some: { userId },
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.question.findMany({
      where: {
        comments: {
          some: { userId },
        },
      },
      include: {
        exam: {
          include: {
            subject: true,
            professor: true,
            university: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Merge and deduplicate by question ID
  const allQuestions = [...answerQuestions, ...commentQuestions];
  const uniqueQuestions = Array.from(
    new Map(allQuestions.map(q => [q.id, q])).values()
  );

  return uniqueQuestions;
}

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  const [stats, savedQuestions, contributions] = await Promise.all([
    getUserStats(user.id),
    getSavedQuestions(user.id),
    getUserContributions(user.id),
  ]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header - Simpler design */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                {/* Avatar - Medium size */}
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                  <AvatarFallback className="bg-primary text-white text-2xl font-semibold">
                    {user.name ? getInitials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div>
                  <h1 className="text-xl font-bold text-foreground mb-1">
                    {user.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mb-3">{user.email}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>{user.universityName || "Universidade"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{user.year}º Anno</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Button */}
              <Link href="/settings">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Impostazioni
                </Button>
              </Link>
            </div>

            {/* Stats Row - 3 cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.contributions}</p>
                  <p className="text-xs text-muted-foreground">Contribuições</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.questionsSaved}</p>
                  <p className="text-xs text-muted-foreground">Domande Salvate</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Visualizzazioni</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <ProfileTabs savedQuestions={savedQuestions} contributions={contributions} />
      </div>
    </div>
  );
}
