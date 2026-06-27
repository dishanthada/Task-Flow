import { useState } from 'react';
import { Plus, LayoutGrid, Layers } from 'lucide-react';
import useBoards from '../hooks/useBoards';
import BoardCard from '../components/boards/BoardCard';
import BoardForm from '../components/boards/BoardForm';
import { BoardCardSkeleton } from '../components/common/SkeletonCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useBoards();
  const [showCreate, setShowCreate] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'there';
  const totalTasks = boards.reduce((sum, b) => sum + (b.taskCount || 0), 0);

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-primary)' }}>
              Welcome back 👋
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {firstName}&apos;s Workspace
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Manage all your project boards and track tasks efficiently.
            </p>
          </div>

          <Button
            onClick={() => setShowCreate(true)}
            icon={<Plus size={16} strokeWidth={2.5} />}
            className="self-start sm:self-auto"
          >
            New Board
          </Button>
        </div>

        {/* Stats bar */}
        {!loading && boards.length > 0 && (
          <div className="flex items-center gap-4 mt-6 flex-wrap">
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))', color: '#6366f1' }}>
                <LayoutGrid size={18} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{boards.length}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Boards</p>
              </div>
            </div>

            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))', color: '#10b981' }}>
                <Layers size={18} />
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: 'var(--text-primary)' }}>{totalTasks}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Tasks</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <BoardCardSkeleton key={i} />)}
        </div>
      ) : boards.length === 0 ? (
        <div
          className="text-center py-20 px-8 rounded-3xl max-w-lg mx-auto"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--border-color)' }}
        >
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No boards yet
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Create your first board to start organizing tasks, tracking progress, and collaborating on projects.
          </p>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} strokeWidth={2.5} />}>
            Create Your First Board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {boards.map((board, idx) => (
            <div
              key={board._id}
              className="animate-card-in"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <BoardCard
                board={board}
                onUpdate={updateBoard}
                onDelete={deleteBoard}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <BoardForm
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            const res = await createBoard(data);
            if (res.success) setShowCreate(false);
          }}
          title="Create New Board"
        />
      )}
    </div>
  );
};

export default DashboardPage;
