import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, User, FileText, AlertTriangle } from "lucide-react";

async function getAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Get stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayCount = await prisma.auditLog.count({
    where: { createdAt: { gte: today } },
  });

  const totalCount = await prisma.auditLog.count();

  return { logs, todayCount, totalCount };
}

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-800 border-green-200",
  update: "bg-blue-100 text-blue-800 border-blue-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  suspend: "bg-amber-100 text-amber-800 border-amber-200",
  flag_reviewed: "bg-purple-100 text-purple-800 border-purple-200",
  flag_dismissed: "bg-gray-100 text-gray-800 border-gray-200",
  flag_deleted: "bg-red-100 text-red-800 border-red-200",
};

const entityIcons: Record<string, typeof User> = {
  user: User,
  question: FileText,
  content_flag: AlertTriangle,
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AuditLogsPage() {
  const { logs, todayCount, totalCount } = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Log di Audit</h1>
        <p className="text-muted-foreground">
          Cronologia di tutte le azioni amministrative
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Azioni oggi</CardTitle>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayCount}</div>
            <p className="text-xs text-muted-foreground">Azioni eseguite oggi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Totale azioni</CardTitle>
            <ScrollText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Tutte le azioni registrate</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Cronologia recente</CardTitle>
          <CardDescription>
            Ultime 100 azioni amministrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ScrollText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-medium">Nessuna azione registrata</h3>
              <p className="text-sm text-muted-foreground">
                Le azioni amministrative appariranno qui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = entityIcons[log.entityType] || FileText;
                const colorClass = actionColors[log.action] || "bg-gray-100 text-gray-800 border-gray-200";

                return (
                  <div
                    key={log.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-muted p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={colorClass}>
                            {log.action}
                          </Badge>
                          <Badge variant="secondary">{log.entityType}</Badge>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">{log.admin.name || log.admin.email}</span>
                          {" "}ha eseguito l&apos;azione su{" "}
                          <code className="rounded bg-muted px-1 text-xs">
                            {log.entityId || "N/A"}
                          </code>
                        </p>
                        {log.reason && (
                          <p className="text-sm text-muted-foreground">
                            Motivo: {log.reason}
                          </p>
                        )}
                        {log.changes && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              Mostra dettagli
                            </summary>
                            <pre className="mt-2 overflow-auto rounded bg-muted p-2">
                              {JSON.stringify(JSON.parse(log.changes), null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
