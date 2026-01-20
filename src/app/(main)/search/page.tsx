import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchClient } from "./_components/search-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function getFiltersData() {
  const [subjects, professors, universities, courses] = await Promise.all([
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
    prisma.course.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        universityId: true,
        university: {
          select: { shortName: true },
        },
      },
    }),
  ]);

  return { subjects, professors, universities, courses };
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
        {/* Header */}
        <div className="space-y-4 animate-fade-in">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
          </div>
        </div>

        {/* Filters Card */}
        <Card className="glass-card">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-6 w-36" />
              </div>
              <Skeleton className="w-5 h-5" />
            </div>
          </CardHeader>
        </Card>

        {/* Subject Title */}
        <div className="text-center space-y-2">
          <Skeleton className="h-7 w-56 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6 text-center space-y-4">
                {/* Emoji skeleton */}
                <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                {/* Subject name */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 mx-auto" />
                  {/* Exam count */}
                  <div className="flex items-center justify-center space-x-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAB skeleton */}
      <div className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-50">
        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
    </div>
  );
}
