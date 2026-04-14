import { Card, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={i}
          className="hover:shadow-md transition animate-pulse"
          data-testid="skeleton-card"
        >
          <CardContent className="p-4 flex flex-col gap-0">
            <div className="flex items-start justify-between mb-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-12 ml-2 rounded-full" />
            </div>

            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-3" />

            <div className="flex items-center justify-between text-xs">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            <Skeleton className="h-3 w-1/2 mt-3" />

            <div className="flex items-center gap-1 mt-2 text-xs">
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
