/** Skeleton card for board loading state */
export const BoardCardSkeleton = () => (
  <div className="surface p-5 flex flex-col gap-3">
    <div className="skeleton h-5 w-3/4 rounded" />
    <div className="skeleton h-4 w-full rounded" />
    <div className="skeleton h-4 w-1/2 rounded" />
    <div className="flex gap-2 mt-2">
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  </div>
);

/** Skeleton card for task loading state */
export const TaskCardSkeleton = () => (
  <div className="task-card p-4 flex flex-col gap-2">
    <div className="skeleton h-4 w-4/5 rounded" />
    <div className="skeleton h-3 w-full rounded" />
    <div className="skeleton h-3 w-2/3 rounded" />
    <div className="flex justify-between mt-2">
      <div className="skeleton h-5 w-14 rounded-full" />
      <div className="skeleton h-4 w-20 rounded" />
    </div>
  </div>
);

/** Generic skeleton line */
export const SkeletonLine = ({ width = '100%', height = '1rem', className = '' }) => (
  <div
    className={`skeleton rounded ${className}`}
    style={{ width, height }}
  />
);

export default { BoardCardSkeleton, TaskCardSkeleton, SkeletonLine };
