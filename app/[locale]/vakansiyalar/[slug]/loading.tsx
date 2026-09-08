import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="site-container pb-24 pt-6" aria-busy="true">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-3 h-12 w-3/4" />
          <Skeleton className="mt-3 h-6 w-1/2" />
          <div className="mt-6 flex items-end justify-between border-y border-soft-200 py-5">
            <Skeleton className="h-10 w-56" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="mt-10 h-7 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <Skeleton className="mt-12 h-40 w-full rounded-16" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Skeleton className="h-44 w-full rounded-16" />
          <Skeleton className="h-56 w-full rounded-16" />
        </div>
      </div>
    </div>
  );
}
