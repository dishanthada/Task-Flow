import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus, LayoutGrid, Calendar as CalendarIcon,
  BarChart2, Users, Sparkles, AlertCircle,
  Clock, UserPlus, CheckCircle, Layers,
  TrendingUp, Kanban, Activity, ChevronLeft, ChevronRight,
  ArrowUpRight, Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useBoards from '../hooks/useBoards';
import BoardCard from '../components/boards/BoardCard';
import BoardForm from '../components/boards/BoardForm';
import { BoardCardSkeleton } from '../components/common/SkeletonCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasksApi';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';

/* ────────────────────────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────────────────────────── */
const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const priorityColor = (p) => {
  if (!p) return { bg: 'var(--bg-surface-3)', text: 'var(--text-muted)' };
  const l = p.toLowerCase();
  if (l === 'high')   return { bg: 'rgba(220,38,38,0.08)',  text: '#DC2626' };
  if (l === 'medium') return { bg: 'rgba(217,119,6,0.08)',  text: '#D97706' };
  return                     { bg: 'rgba(22,163,74,0.08)',  text: '#16A34A' };
};

/* ────────────────────────────────────────────────────────────────
   STAT CARD
   ──────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, Icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 18,
      padding: '24px 26px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-sm)',
      flex: 1,
      minWidth: 0,
      cursor: 'default',
      transition: 'box-shadow 0.25s ease, transform 0.25s ease, border-color 0.2s ease',
    }}
    whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          marginBottom: 10,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          letterSpacing: '-0.04em',
        }}>
          {value}
        </div>
        {sub && (
          <div style={{
            fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontWeight: 400,
          }}>
            {sub}
          </div>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--bg-surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', flexShrink: 0,
      }}>
        <Icon size={18} strokeWidth={1.75} />
      </div>
    </div>
  </motion.div>
);

/* ────────────────────────────────────────────────────────────────
   RECENT ACTIVITY
   ──────────────────────────────────────────────────────────────── */
const RecentActivity = ({ boards, allTasks }) => {
  const navigate = useNavigate();

  const activities = [
    ...boards.map(b => ({
      id: b._id,
      type: 'board',
      title: b.title,
      action: 'Board updated',
      time: b.updatedAt || b.createdAt,
      icon: Kanban,
      onClick: () => navigate(`/boards/${b._id}`),
    })),
    ...allTasks.slice(0, 5).map(t => ({
      id: t._id,
      type: 'task',
      title: t.title,
      action: t.status === 'done' ? 'Task completed' : 'Task updated',
      time: t.updatedAt || t.createdAt,
      icon: t.status === 'done' ? CheckCircle : Activity,
    })),
  ]
    .filter(a => a.time)
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 6);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 18,
      padding: '24px 26px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Recent Activity
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Latest updates across your workspace
          </div>
        </div>
        <Activity size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
      </div>

      {activities.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '32px 0', gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--bg-surface-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            📋
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
            No recent activity yet.<br />Create a board to get started.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {activities.map((act, i) => {
            const IconComp = act.icon;
            const isLast = i === activities.length - 1;
            return (
              <div key={act.id + i} style={{ display: 'flex', gap: 14 }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'var(--bg-surface-3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', flexShrink: 0, marginTop: 2,
                  }}>
                    <IconComp size={13} strokeWidth={2} />
                  </div>
                  {!isLast && (
                    <div style={{
                      width: 1, flex: 1, minHeight: 16,
                      background: 'var(--border-color)',
                      margin: '6px 0',
                    }} />
                  )}
                </div>

                {/* Content */}
                <div
                  style={{
                    flex: 1, minWidth: 0,
                    paddingBottom: isLast ? 0 : 16,
                    cursor: act.onClick ? 'pointer' : 'default',
                  }}
                  onClick={act.onClick}
                >
                  <div style={{
                    display: 'flex', alignItems: 'baseline',
                    justifyContent: 'space-between', gap: 8,
                  }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {timeAgo(act.time)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {act.action}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   UPCOMING DEADLINES
   ──────────────────────────────────────────────────────────────── */
const UpcomingDeadlines = ({ allTasks, navigate }) => {
  const upcoming = allTasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 6);

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 18,
      padding: '24px 26px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Upcoming Deadlines
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Tasks due soon
          </div>
        </div>
        <Clock size={16} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
      </div>

      {upcoming.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '28px 0', gap: 10,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--bg-surface-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            🗓️
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            No upcoming deadlines.<br />You're all caught up!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {upcoming.map(task => {
            const overdue = isOverdue(task.dueDate);
            const pc = priorityColor(task.priority);
            return (
              <div
                key={task._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border-color)',
                  background: overdue ? 'rgba(220,38,38,0.03)' : 'var(--bg-surface-2)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.background = 'var(--bg-surface-3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.background = overdue ? 'rgba(220,38,38,0.03)' : 'var(--bg-surface-2)';
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {task.title}
                  </div>
                  <div style={{
                    fontSize: 11, marginTop: 3,
                    color: overdue ? '#DC2626' : 'var(--text-muted)',
                    fontWeight: overdue ? 600 : 400,
                  }}>
                    {overdue ? '⚠ Overdue · ' : ''}{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                {task.priority && (
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    padding: '3px 8px', borderRadius: 6,
                    background: pc.bg, color: pc.text,
                    flexShrink: 0, letterSpacing: '0.02em',
                    textTransform: 'capitalize',
                  }}>
                    {task.priority}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   AI INSIGHTS CARD
   ──────────────────────────────────────────────────────────────── */
const AIInsightsCard = ({ insights }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 18,
    padding: '24px 26px',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'var(--bg-surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Sparkles size={16} strokeWidth={2} style={{ color: 'var(--text-primary)' }} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          AI Copilot Insights
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Powered by workspace analytics
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {insights.map((insight, idx) => {
        const styles = {
          danger:  { bg: 'rgba(220,38,38,0.06)',  border: 'rgba(220,38,38,0.15)',  text: '#DC2626' },
          warning: { bg: 'rgba(217,119,6,0.06)',  border: 'rgba(217,119,6,0.15)',  text: '#D97706' },
          success: { bg: 'rgba(22,163,74,0.06)',  border: 'rgba(22,163,74,0.15)',  text: '#16A34A' },
          info:    { bg: 'var(--bg-surface-2)',   border: 'var(--border-color)',    text: 'var(--text-secondary)' },
        }[insight.type] || { bg: 'var(--bg-surface-2)', border: 'var(--border-color)', text: 'var(--text-secondary)' };

        return (
          <div
            key={idx}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: styles.bg,
              border: `1px solid ${styles.border}`,
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={14} style={{ color: styles.text, flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.55 }}>
              {insight.message}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   QUICK STATS CARD
   ──────────────────────────────────────────────────────────────── */
const QuickStatsCard = ({ totalBoards, totalTasks, completionRate, completedTasks }) => (
  <div style={{
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 18,
    padding: '24px 26px',
    boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 20 }}>
      Quick Stats
    </div>
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }}>
      <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalBoards}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>Boards</div>
      </div>
      <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalTasks}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>Tasks</div>
      </div>
      <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{completionRate}%</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>Completion</div>
      </div>
      <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: 12, border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{completedTasks}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>Completed</div>
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   PRODUCTIVITY CARD (for stat bar)
   ──────────────────────────────────────────────────────────────── */
const ProductivityCard = ({ rate, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: 18,
      padding: '24px 26px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      boxShadow: 'var(--shadow-sm)',
      flex: 1,
      minWidth: 0,
    }}
    whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11, fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          marginBottom: 10,
        }}>
          Productivity
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1, letterSpacing: '-0.04em',
        }}>
          {rate}%
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{
            height: 6, borderRadius: 99,
            background: 'var(--bg-surface-3)',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rate}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                borderRadius: 99,
                background: 'var(--color-primary)',
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            completion rate
          </div>
        </div>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'var(--bg-surface-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-secondary)', flexShrink: 0,
      }}>
        <TrendingUp size={18} strokeWidth={1.75} />
      </div>
    </div>
  </motion.div>
);

/* ════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ════════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user } = useAuth();
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useBoards();
  const [showCreate, setShowCreate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'boards';
  const firstName = user?.name?.split(' ')[0] || 'there';

  /* Listen for Navbar "New Board" button */
  useEffect(() => {
    const handler = () => setShowCreate(true);
    window.addEventListener('taskflow:new-board', handler);
    return () => window.removeEventListener('taskflow:new-board', handler);
  }, []);

  /* Task fetching */
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    if (boards.length === 0) return;
    const fetchAllTasks = async () => {
      setTasksLoading(true);
      try {
        const results = await Promise.all(boards.map(b => getTasks(b._id)));
        setAllTasks(results.flatMap(res => res.data?.tasks || []));
      } catch (err) {
        console.error('Error fetching dashboard tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchAllTasks();
  }, [boards]);

  /* Calculations */
  const totalTasks      = allTasks.length;
  const completedTasks  = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  /* Chart data */
  const boardChartData = boards.map(b => {
    const bt = allTasks.filter(t => t.boardId === b._id || t.board === b._id);
    const name = (b.title || 'Untitled').length > 12
      ? b.title.substring(0, 10) + '…'
      : b.title || 'Untitled';
    return { name, Tasks: bt.length, Completed: bt.filter(t => t.status === 'done').length };
  });

  const priorityChartData = [
    { name: 'High',   value: allTasks.filter(t => t.priority === 'high').length,   color: '#DC2626' },
    { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length, color: '#D97706' },
    { name: 'Low',    value: allTasks.filter(t => t.priority === 'low').length,    color: '#16A34A' },
  ].filter(d => d.value > 0);

  /* AI insights */
  const getAIInsights = () => {
    const insights = [];
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    });
    if (overdueTasks.length > 0) {
      insights.push({ type: 'danger', message: `Alert: ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past due. Re-assign or update deadlines immediately.` });
    }
    const highPriorityTodo = allTasks.filter(t => t.priority === 'high' && t.status !== 'done');
    if (highPriorityTodo.length > 2) {
      insights.push({ type: 'warning', message: `High load of incomplete high-priority tasks (${highPriorityTodo.length}). Focus on clearing priority backlogs first.` });
    }
    if (completionRate > 75) {
      insights.push({ type: 'success', message: `Excellent! Completion rate is at ${completionRate}%. Your team velocity is in the optimal range.` });
    } else if (totalTasks > 0 && completionRate < 35) {
      insights.push({ type: 'info', message: `Task clearance is at ${completionRate}%. Breaking tasks into smaller items may help build momentum.` });
    }
    if (insights.length === 0) {
      insights.push({ type: 'info', message: 'No actions required. Your workspace is looking clean!' });
    }
    return insights;
  };

  /* Calendar */
  const [currentDate, setCurrentDate] = useState(new Date());
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDaysInMonth = () => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIdx = date.getDay();
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    const daysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysCount; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }
    const needed = 42 - days.length;
    for (let i = 1; i <= needed; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }
    return days;
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  /* Tabs config */
  const TABS = [
    { id: 'boards',    label: 'My Boards',   Icon: LayoutGrid  },
    { id: 'analytics', label: 'Analytics',   Icon: BarChart2   },
    { id: 'calendar',  label: 'Calendar',    Icon: CalendarIcon },
    { id: 'team',      label: 'Members',     Icon: Users        },
  ];

  /* ── RENDER ──────────────────────────────────────────────────── */
  return (
    <div
      className="animate-fade-in"
      style={{ padding: '36px 36px 48px', minHeight: '100%' }}
    >
      {/* ══ Hero Section ══════════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          fontSize: 12, fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}>
          👋 Welcome back
        </div>
        <h1 style={{
          fontSize: 'var(--fs-hero)',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          marginBottom: 10,
        }}>
          {firstName}&apos;s Workspace
        </h1>
        <p style={{
          fontSize: 'var(--fs-body)',
          color: 'var(--text-secondary)',
          fontWeight: 400,
          lineHeight: 1.6,
          maxWidth: 480,
        }}>
          Manage projects, monitor productivity and organize your work efficiently.
        </p>
      </div>

      {/* ══ Stats Grid ═════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 36,
        flexWrap: 'wrap',
      }}>
        <StatCard label="Total Tasks"   value={totalTasks}      sub="across all boards"      Icon={Layers}       delay={0}    />
        <StatCard label="In Progress"   value={inProgressTasks} sub="actively being worked"  Icon={Clock}        delay={0.06} />
        <StatCard label="Completed"     value={completedTasks}  sub="total finished goals"   Icon={CheckCircle}  delay={0.12} />
        <ProductivityCard               rate={completionRate}                                                    delay={0.18} />
        <StatCard label="Boards"        value={boards.length}   sub="total workspaces"       Icon={Folder}       delay={0.24} />
      </div>

      {/* ══ Tabs ════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: 2,
        marginBottom: 32,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px',
                border: 'none',
                borderBottom: active
                  ? '2px solid var(--color-primary)'
                  : '2px solid transparent',
                background: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                marginBottom: -1,
                transition: 'color 0.15s ease, border-color 0.15s ease',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}
            >
              <tab.Icon size={14} strokeWidth={active ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ Tab Panels ══════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >

          {/* ─ Tab 1: Boards ──────────────────────────────────────── */}
          {activeTab === 'boards' && (
            <div style={{ display: 'grid', gap: 32, alignItems: 'start' }} className="grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* Left: Board Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
                {loading ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 24,
                  }}>
                    {[1, 2, 3].map(i => <BoardCardSkeleton key={i} />)}
                  </div>
                ) : boards.length === 0 ? (
                  <div style={{
                    background: 'var(--bg-surface)',
                    border: '1.5px dashed var(--border-color)',
                    borderRadius: 20,
                    padding: '64px 32px',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: 'var(--bg-surface-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                      fontSize: 28,
                    }}>
                      📋
                    </div>
                    <h3 style={{
                      fontSize: 18, fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: 8, letterSpacing: '-0.02em',
                    }}>
                      No boards yet
                    </h3>
                    <p style={{
                      fontSize: 14, color: 'var(--text-muted)',
                      marginBottom: 24, lineHeight: 1.6,
                      maxWidth: 320, margin: '0 auto 24px',
                    }}>
                      Create your first board to start organizing tasks, tracking progress, and collaborating.
                    </p>
                    <Button
                      onClick={() => setShowCreate(true)}
                      icon={<Plus size={14} strokeWidth={2.5} />}
                    >
                      Create Your First Board
                    </Button>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 24,
                  }}>
                    {boards.map((board, i) => (
                      <motion.div
                        key={board._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                      >
                        <BoardCard
                          board={board}
                          onUpdate={updateBoard}
                          onDelete={deleteBoard}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recent Activity — below boards */}
                <RecentActivity boards={boards} allTasks={allTasks} />
              </div>

              {/* Right sidebar: Deadlines + AI quick */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
              }}
                className="hidden xl:flex"
              >
                <UpcomingDeadlines allTasks={allTasks} navigate={navigate} />
                {boards.length > 0 && (
                  <AIInsightsCard insights={getAIInsights()} />
                )}
                <QuickStatsCard 
                  totalBoards={boards.length} 
                  totalTasks={totalTasks} 
                  completionRate={completionRate} 
                  completedTasks={completedTasks} 
                />
              </div>
            </div>
          )}

          {/* ─ Tab 2: Analytics ───────────────────────────────────── */}
          {activeTab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}
              className="grid-cols-1 xl:grid-cols-[1fr_340px]"
            >
              {/* Left: Charts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Bar Chart */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  padding: '28px 28px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    Tasks per Board
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Distribution of total and completed tasks
                  </div>
                  <div style={{ height: 280 }}>
                    {boardChartData.length === 0 ? (
                      <div style={{
                        height: '100%', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 12,
                      }}>
                        <span style={{ fontSize: 24 }}>📊</span>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No chart data available yet</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={boardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--bg-surface)',
                              borderColor: 'var(--border-color)',
                              borderRadius: 10, fontSize: 12,
                            }}
                          />
                          <Bar dataKey="Tasks" fill="var(--color-primary)" radius={[6,6,0,0]} barSize={28} />
                          <Bar dataKey="Completed" fill="var(--gray-300)" radius={[6,6,0,0]} barSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-primary)', display: 'inline-block' }} />
                      Total Tasks
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--gray-300)', display: 'inline-block' }} />
                      Completed
                    </div>
                  </div>
                </div>

                {/* Priority Pie */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 18,
                  padding: '28px 28px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
                    Priority Distribution
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                    Breakdown of task priorities
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', height: 200, gap: 32 }}>
                    <div style={{ flex: 1, height: '100%' }}>
                      {priorityChartData.length === 0 ? (
                        <div style={{
                          height: '100%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No data</span>
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={priorityChartData}
                              cx="50%" cy="50%"
                              innerRadius={52} outerRadius={76}
                              paddingAngle={4} dataKey="value"
                            >
                              {priorityChartData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--bg-surface)',
                                borderColor: 'var(--border-color)',
                                borderRadius: 10, fontSize: 12,
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flexShrink: 0 }}>
                      {[
                        { label: 'High Priority',   color: '#DC2626', key: 'high'   },
                        { label: 'Medium Priority', color: '#D97706', key: 'medium' },
                        { label: 'Low Priority',    color: '#16A34A', key: 'low'    },
                      ].map(({ label, color, key }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {label} ({allTasks.filter(t => t.priority === key).length})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: AI + Deadlines */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <AIInsightsCard insights={getAIInsights()} />
                <UpcomingDeadlines allTasks={allTasks} navigate={navigate} />
              </div>
            </div>
          )}

          {/* ─ Tab 3: Calendar ────────────────────────────────────── */}
          {activeTab === 'calendar' && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '28px 28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    {monthName} {year}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    {allTasks.filter(t => t.dueDate).length} tasks with due dates
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handlePrevMonth}
                    style={{
                      width: 36, height: 36, borderRadius: 9,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    style={{
                      width: 36, height: 36, borderRadius: 9,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface-3)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 8, marginBottom: 10,
              }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{
                    textAlign: 'center',
                    fontSize: 11, fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    padding: '6px 0',
                  }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {days.map((d, idx) => {
                  const dayTasks = allTasks.filter(t => {
                    if (!t.dueDate) return false;
                    const dd = new Date(t.dueDate);
                    return (
                      dd.getDate() === d.date.getDate() &&
                      dd.getMonth() === d.date.getMonth() &&
                      dd.getFullYear() === d.date.getFullYear()
                    );
                  });
                  const isToday = d.isCurrentMonth &&
                    d.date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: 80,
                        padding: '8px',
                        borderRadius: 10,
                        border: isToday
                          ? '1.5px solid var(--color-primary)'
                          : '1px solid var(--border-color)',
                        background: d.isCurrentMonth
                          ? 'var(--bg-surface)'
                          : 'var(--bg-surface-2)',
                        display: 'flex', flexDirection: 'column', gap: 4,
                        opacity: d.isCurrentMonth ? 1 : 0.45,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{
                        fontSize: 11, fontWeight: isToday ? 800 : 500,
                        color: isToday ? 'var(--color-primary)' : 'var(--text-secondary)',
                        lineHeight: 1,
                      }}>
                        {d.day}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', maxHeight: 48 }}>
                        {dayTasks.map(t => (
                          <div
                            key={t._id}
                            onClick={() => {
                              const bId = t.boardId || t.board;
                              if (bId) navigate(`/boards/${bId}`);
                            }}
                            title={t.title}
                            style={{
                              fontSize: 9, fontWeight: 600,
                              padding: '2px 5px',
                              borderRadius: 4,
                              background: 'var(--color-primary)',
                              color: 'var(--bg-surface)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─ Tab 4: Team Members ────────────────────────────────── */}
          {activeTab === 'team' && (
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 20,
              padding: '28px 28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between', gap: 16, marginBottom: 28,
                flexWrap: 'wrap',
              }}>
                <div>
                  <h2 style={{
                    fontSize: 20, fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em', marginBottom: 6,
                  }}>
                    Workspace Members
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    Manage team roles, invite members, and configure workspace permissions.
                  </p>
                </div>
                <button
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px',
                    background: 'var(--color-primary)',
                    color: 'var(--bg-surface)',
                    border: 'none', borderRadius: 10,
                    fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                >
                  <UserPlus size={14} /> Invite Member
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 14,
              }}>
                {[
                  { name: user?.name || 'Dishant', email: user?.email || 'dishanthada@gmail.com', role: 'Workspace Admin', status: 'Active' },
                  { name: 'Aarav Mehta', email: 'aarav.mehta@company.co', role: 'Collaborator', status: 'Active' },
                  { name: 'Diya Sharma', email: 'diya.sharma@company.co', role: 'Viewer', status: 'Pending Invite' },
                ].map((member, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 18px',
                      borderRadius: 14,
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'var(--bg-surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700,
                        color: 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                      }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {member.role}
                      </div>
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        fontSize: 10, fontWeight: 600,
                        padding: '3px 8px', borderRadius: 6,
                        background: member.status === 'Active'
                          ? 'rgba(22,163,74,0.08)' : 'rgba(217,119,6,0.08)',
                        color: member.status === 'Active' ? '#16A34A' : '#D97706',
                      }}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ══ Board Creation Modal ════════════════════════════════════ */}
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
