import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-xl bg-white/5',
        className
      )}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-7 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-20 rounded-xl" />
        <Skeleton className="h-10 w-4 self-center" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <tr>
      {[8, 40, 16, 16, 16].map((w, i) => (
        <td key={i} className="p-3">
          <Skeleton className={`h-4 w-${w}`} />
        </td>
      ))}
    </tr>
  );
}

export function QuestionCardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
  );
}
