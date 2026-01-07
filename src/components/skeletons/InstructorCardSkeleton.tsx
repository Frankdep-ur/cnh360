import { Skeleton } from "@/components/ui/skeleton";

export function InstructorCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
      <div className="flex gap-4">
        {/* Photo skeleton */}
        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />

        {/* Info skeleton */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      </div>

      {/* Price skeleton */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function InstructorListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <InstructorCardSkeleton key={i} />
      ))}
    </div>
  );
}
