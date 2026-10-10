import Skeleton from "../../components/Skeleton";

export default function SessionsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading sessions">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border-b border-white/10 py-6 first:pt-0">
          <div className="mb-4 flex items-center gap-4">
            <Skeleton className="h-16 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-hidden">
            {[0, 1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-26 w-65 shrink-0" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}