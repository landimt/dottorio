import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function QuestionDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          {/* Back button skeleton */}
          <Skeleton className="h-9 w-40 mb-4" />

          {/* Mobile Question Selector Skeleton */}
          <div className="md:hidden mb-4">
            <Card className="p-3 bg-gradient-to-br from-card to-muted border-2">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <Skeleton className="h-12 w-full" />
            </Card>
          </div>
        </div>

        {/* 3 Column Layout */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 min-h-[calc(100vh-180px)]">
          {/* Left Column - Related Questions (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 space-y-3">
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            {/* Question list skeleton */}
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Question Detail */}
          <div className="col-span-12 md:col-span-6 bg-card rounded-lg border border-border overflow-hidden flex flex-col">
            {/* Question Header */}
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
                <Skeleton className="h-9 w-24 shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Tabs Header */}
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 h-12 p-1 bg-muted/50 rounded-xl">
                  <Skeleton className="h-full rounded-lg" />
                  <Skeleton className="h-full rounded-lg" />
                  <Skeleton className="h-full rounded-lg hidden md:block" />
                </div>
              </div>

              {/* Tab Content - AI Answer Skeleton */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 border-l-4 border-[primary] pl-3">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>

                {/* Rating Section */}
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-36" />
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="w-5 h-5 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Callout Intro Skeleton */}
                <div className="bg-[primary/10] dark:bg-[primary]/10 rounded-lg p-4 border-l-4 border-[primary]">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>

                {/* Answer Content Skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Key Points Callout Skeleton */}
                <div className="bg-[accent/10] dark:bg-[accent]/5 rounded-lg p-4 border-l-4 border-[accent] mt-6">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-6 h-6 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Comments (Hidden on mobile) */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border overflow-hidden flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full" />
            </div>

            {/* Comments List Skeleton */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="pb-4 border-b border-border last:border-b-0">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="flex items-center gap-4 pt-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Skeleton */}
            <div className="p-4 border-t border-border">
              <Skeleton className="h-24 w-full mb-3" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
