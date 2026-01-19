import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  MapPin,
  Calendar,
  BookOpen,
  MessageSquare,
  Star,
  Eye,
  Plus,
  Settings,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

async function getUserStats(userId: string) {
  const [
    questionsAdded,
    questionsSaved,
    commentsCount,
    answersCount,
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
  ]);

  return {
    questionsAdded,
    questionsSaved,
    commentsCount,
    answersCount,
  };
}

async function getRecentActivity(userId: string) {
  const recentQuestions = await prisma.question.findMany({
    where: { exam: { createdBy: userId } },
    include: {
      exam: {
        include: {
          subject: true,
          professor: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return recentQuestions;
}

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  const stats = await getUserStats(user.id);
  const recentActivity = await getRecentActivity(user.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={user.image || undefined} alt={user.name || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {user.name ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {user.isRepresentative && (
                  <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                    <Award className="w-3 h-3 mr-1" />
                    Rappresentante
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4">{user.email}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{user.universityName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{user.year}º Anno</span>
                </div>
                {user.channelName && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.channelName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Impostazioni
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Plus className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.questionsAdded}</p>
            <p className="text-xs text-muted-foreground">Domande Aggiunte</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats.questionsSaved}</p>
            <p className="text-xs text-muted-foreground">Domande Salvate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.commentsCount}</p>
            <p className="text-xs text-muted-foreground">Commenti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.answersCount}</p>
            <p className="text-xs text-muted-foreground">Risposte</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Attività Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((question) => (
                <Link
                  key={question.id}
                  href={`/questions/${question.id}`}
                  className="block"
                >
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {question.text}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {question.exam.subject.name}
                        </Badge>
                        <span>{question.exam.professor?.name}</span>
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
                Non hai ancora aggiunto domande
              </p>
              <Link href="/exams/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi la tua prima domanda
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
