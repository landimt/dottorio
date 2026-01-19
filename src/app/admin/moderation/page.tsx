import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Flag, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getModerationStats() {
  const [pending, reviewed, dismissed] = await Promise.all([
    prisma.contentFlag.count({ where: { status: "pending" } }),
    prisma.contentFlag.count({ where: { status: "reviewed" } }),
    prisma.contentFlag.count({ where: { status: "dismissed" } }),
  ]);

  const recentFlags = await prisma.contentFlag.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      reporter: {
        select: { name: true, email: true },
      },
    },
  });

  return { pending, reviewed, dismissed, recentFlags };
}

export default async function ModerationPage() {
  const stats = await getModerationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderação</h1>
        <p className="text-muted-foreground">
          Gerencie conteúdos reportados e denúncias
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando revisão</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revisados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
            <p className="text-xs text-muted-foreground">Ação tomada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dispensados</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dismissed}</div>
            <p className="text-xs text-muted-foreground">Sem ação necessária</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Denúncias Pendentes</CardTitle>
          <CardDescription>
            Conteúdos reportados aguardando revisão
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentFlags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Flag className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">Nenhuma denúncia pendente</h3>
              <p className="text-sm text-muted-foreground">
                Quando usuários reportarem conteúdos, eles aparecerão aqui para revisão.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{flag.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Reportado por {flag.reporter.name}
                      </span>
                    </div>
                    <p className="text-sm">{flag.reason}</p>
                  </div>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
