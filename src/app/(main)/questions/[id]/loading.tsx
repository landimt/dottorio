import { Skeleton } from "@/components/ui/skeleton";

export default function QuestionDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border p-4">
            <div className="space-y-3 w-full">
              <Skeleton className="h-5 w-40" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Column */}
          <div className="col-span-12 md:col-span-6 bg-card rounded-lg border border-border p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-8 space-y-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:flex md:col-span-3 bg-card rounded-lg border border-border p-4">
            <div className="space-y-4 w-full">
              <Skeleton className="h-5 w-36" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
