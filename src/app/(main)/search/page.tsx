import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { SearchClient } from "./_components/search-client";

async function getFiltersData() {
  const [subjects, professors, universities, channels] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { exams: true },
        },
      },
    }),
    prisma.professor.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.university.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.channel.findMany({
      orderBy: { name: "asc" },
      include: {
        university: {
          select: { shortName: true },
        },
      },
    }),
  ]);

  return { subjects, professors, universities, channels };
}

export default async function SearchPage() {
  const filtersData = await getFiltersData();

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchClient {...filtersData} />
    </Suspense>
  );
}

function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
