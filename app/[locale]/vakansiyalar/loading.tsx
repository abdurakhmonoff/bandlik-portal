import { Skeleton } from "@/components/ui/skeleton";
import { HillSkeleton } from "@/components/site/hill";

/** Skeleton that matches the real list layout — no spinners. */
export default function Loading() {
  return (
    <div className="site-container pb-16 pt-8 sm:pt-10" aria-busy="true">
      <div className="max-w-3xl">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-5 h-14 w-full rounded-16" />
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_1fr] lg:gap-12">
        <div className="hidden lg:block">
          <Skeleton className="h-6 w-24" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between border-b border-soft-200 py-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="border-t border-strong-950">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-6 border-b border-soft-200 py-5">
                <div className="flex-1 space-y-2.5">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="hidden h-7 w-32 sm:block" />
              </div>
            ))}
          </div>
          <HillSkeleton className="mt-10" />
        </div>
      </div>
    </div>
  );
}
