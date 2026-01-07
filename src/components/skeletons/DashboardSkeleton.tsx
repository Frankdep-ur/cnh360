import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header skeleton */}
      <header className="bg-card border-b border-border px-6 pt-8 pb-6 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-40" />
            </div>
            <Skeleton className="w-12 h-12 rounded-full" />
          </div>
        </div>
      </header>

      {/* Content skeleton */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Cards */}
          <Skeleton className="h-40 w-full rounded-2xl" />
          
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
