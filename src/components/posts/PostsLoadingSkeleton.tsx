import { Skeleton } from "../ui/skeleton";

export default function PostsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  );
}

function PostLoadingSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-2xl bg-card p-6 shadow-md space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </div>
      </div>

      {/* Body text */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-4/6 rounded-md" />
      </div>

      {/* Image or block content preview */}
      <Skeleton className="h-52 w-full rounded-xl" />
    </div>
  );
}
