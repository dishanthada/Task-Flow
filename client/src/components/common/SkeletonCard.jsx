/** Skeleton card for board loading — matches premium BoardCard dimensions */
export const BoardCardSkeleton = () => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 240,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-xs)',
  }}>
    {/* Top bar */}
    <div style={{ height: 3, background: 'var(--border-color)' }} />

    <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
      {/* Icon + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 11 }} />
        <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 20 }} />
      </div>

      {/* Title */}
      <div className="skeleton" style={{ height: 18, width: '72%', borderRadius: 6 }} />

      {/* Description lines */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="skeleton" style={{ height: 13, width: '100%', borderRadius: 5 }} />
        <div className="skeleton" style={{ height: 13, width: '60%', borderRadius: 5 }} />
      </div>

      {/* Progress */}
      <div style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="skeleton" style={{ height: 10, width: 60, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 10, width: 30, borderRadius: 4 }} />
        </div>
        <div className="skeleton" style={{ height: 5, width: '100%', borderRadius: 99 }} />
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Buttons */}
      <div style={{
        display: 'flex', gap: 8,
        paddingTop: 16, borderTop: '1px solid var(--border-color)',
      }}>
        <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 9 }} />
        <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 9 }} />
        <div className="skeleton" style={{ height: 32, width: 68, borderRadius: 9, marginLeft: 'auto' }} />
      </div>
    </div>
  </div>
);

/** Skeleton card for task loading */
export const TaskCardSkeleton = () => (
  <div className="task-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 5 }} />
    <div className="skeleton" style={{ height: 11, width: '100%', borderRadius: 4 }} />
    <div className="skeleton" style={{ height: 11, width: '65%', borderRadius: 4 }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
      <div className="skeleton" style={{ height: 20, width: 56, borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 14, width: 80, borderRadius: 4 }} />
    </div>
  </div>
);

/** Generic skeleton line */
export const SkeletonLine = ({ width = '100%', height = '1rem', className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: 6 }}
  />
);

export default { BoardCardSkeleton, TaskCardSkeleton, SkeletonLine };
