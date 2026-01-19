import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { ExamForm } from "./_components/exam-form";

async function getFormData() {
  const [subjects, professors, universities, channels] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.professor.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.university.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.channel.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return { subjects, professors, universities, channels };
}

export default async function NewExamPage() {
  const formData = await getFormData();

  return (
    <Suspense fallback={<FormSkeleton />}>
      <ExamForm {...formData} />
    </Suspense>
  );
}

function FormSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-[600px] bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  );
}
