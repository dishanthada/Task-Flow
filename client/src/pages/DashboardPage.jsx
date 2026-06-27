import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, LayoutGrid, Layers, Calendar as CalendarIcon, 
  BarChart2, Users, Settings, Sparkles, AlertCircle, 
  ArrowUpRight, Clock, UserPlus, CheckCircle
} from 'lucide-react';
import useBoards from '../hooks/useBoards';
import BoardCard from '../components/boards/BoardCard';
import BoardForm from '../components/boards/BoardForm';
import { BoardCardSkeleton } from '../components/common/SkeletonCard';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../api/tasksApi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const { boards, loading, createBoard, updateBoard, deleteBoard } = useBoards();
  const [showCreate, setShowCreate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'boards';
  const firstName = user?.name?.split(' ')[0] || 'there';

  // Task fetching state
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    if (boards.length === 0) return;
    const fetchAllTasks = async () => {
      setTasksLoading(true);
      try {
        const promises = boards.map(b => getTasks(b._id));
        const results = await Promise.all(promises);
        const combined = results.flatMap(res => res.data?.tasks || []);
        setAllTasks(combined);
      } catch (err) {
        console.error('Error fetching dashboard tasks:', err);
      } finally {
        setTasksLoading(false);
      }
    };
    fetchAllTasks();
  }, [boards]);

  // Calculations
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = allTasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Chart data formatting
  const boardChartData = boards.map(b => {
    const boardTasks = allTasks.filter(t => t.boardId === b._id || t.board === b._id);
    const titleVal = b.title || 'Untitled Board';
    return {
      name: titleVal.length > 12 ? titleVal.substring(0, 10) + '...' : titleVal,
      Tasks: boardTasks.length,
      Completed: boardTasks.filter(t => t.status === 'done').length
    };
  });

  const priorityChartData = [
    { name: 'High', value: allTasks.filter(t => t.priority === 'high').length, color: '#DC2626' },
    { name: 'Medium', value: allTasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: allTasks.filter(t => t.priority === 'low').length, color: '#16A34A' }
  ].filter(d => d.value > 0);

  // AI insights calculation
  const getAIInsights = () => {
    const insights = [];
    const overdueTasks = allTasks.filter(t => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today && t.status !== 'done';
    });

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'danger',
        message: `Alert: ${overdueTasks.length} task${overdueTasks.length > 1 ? 's' : ''} past due. Recommended: Re-assign or update deadlines immediately.`
      });
    }

    const highPriorityTodo = allTasks.filter(t => t.priority === 'high' && t.status !== 'done');
    if (highPriorityTodo.length > 2) {
      insights.push({
        type: 'warning',
        message: `Warning: High load of incomplete high priority tasks (${highPriorityTodo.length} tasks). Recommended: Focus on clearing priority backlogs.`
      });
    }

    if (completionRate > 75) {
      insights.push({
        type: 'success',
        message: `Awesome work! Completion rate is at ${completionRate}%. Your team velocity is in optimal range.`
      });
    } else if (totalTasks > 0 && completionRate < 35) {
      insights.push({
        type: 'info',
        message: `Insights: Task clearance rate is currently low (${completionRate}%). Breaking large tasks into smaller sub-tasks may help increase momentum.`
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'info',
        message: 'No actions required. Keep up the clean workspace!'
      });
    }

    return insights;
  };

  // Calendar View helper variables
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getDaysInMonth = () => {
    const date = new Date(year, month, 1);
    const days = [];
    const firstDayIdx = date.getDay();

    // Previous month filler days
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      days.push({ day: prevMonthDaysCount - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDaysCount - i) });
    }

    // Current month days
    const daysCount = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysCount; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    // Next month filler days
    const totalSlots = 42; // 6 rows * 7 days
    const nextMonthDaysCount = totalSlots - days.length;
    for (let i = 1; i <= nextMonthDaysCount; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
          Welcome back 👋
        </p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
              {firstName}&apos;s Workspace
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage your projects, evaluate workspace analytics, and estimate tasks effortlessly.
            </p>
          </div>
          <Button
            onClick={() => setShowCreate(true)}
            icon={<Plus size={14} strokeWidth={2.5} />}
            className="self-start sm:self-auto btn-primary shadow-sm rounded-lg py-2 text-xs"
          >
            New Board
          </Button>
        </div>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Tasks</span>
            <Layers size={14} />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mt-1">{totalTasks}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Active task count</span>
        </div>

        <div className="p-4 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">In Progress</span>
            <Clock size={14} />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mt-1">{inProgressTasks}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Actively being worked on</span>
        </div>

        <div className="p-4 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle size={14} />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mt-1">{completedTasks}</p>
          <span className="text-[10px] text-neutral-400 mt-1 block">Total finished goals</span>
        </div>

        <div className="p-4 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Productivity</span>
            <BarChart2 size={14} />
          </div>
          <p className="text-2xl font-bold text-black dark:text-white mt-1">{completionRate}%</p>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-black dark:bg-white h-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#E8E8E8] dark:border-neutral-800 gap-6 mb-6">
        {[
          { id: 'boards', label: 'My Boards', Icon: LayoutGrid },
          { id: 'analytics', label: 'Productivity Analytics', Icon: BarChart2 },
          { id: 'calendar', label: 'Calendar View', Icon: CalendarIcon },
          { id: 'team', label: 'Team Members', Icon: Users },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-black text-black dark:border-white dark:text-white'
                : 'border-transparent text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <tab.Icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div>
        {/* Tab 1: Boards Grid */}
        {activeTab === 'boards' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <BoardCardSkeleton key={i} />)}
              </div>
            ) : boards.length === 0 ? (
              <div className="text-center py-20 px-8 rounded-xl border border-dashed border-[#E8E8E8] dark:border-neutral-800 max-w-lg mx-auto bg-white dark:bg-[#121212]">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-bold mb-1 text-black dark:text-white">No boards yet</h3>
                <p className="text-xs text-neutral-400 mb-6 max-w-xs mx-auto">
                  Create your first board to start organizing tasks, tracking progress, and collaborating on projects.
                </p>
                <Button onClick={() => setShowCreate(true)} icon={<Plus size={14} strokeWidth={2.5} />} className="btn-primary py-2 text-xs">
                  Create Your First Board
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {boards.map((board) => (
                  <div key={board._id} className="hover:scale-102 transition-transform duration-200">
                    <BoardCard
                      board={board}
                      onUpdate={updateBoard}
                      onDelete={deleteBoard}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Analytics & AI Insights */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts section */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Board Tasks Chart */}
              <div className="p-5 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-4">Tasks per Board</h3>
                <div className="h-64">
                  {boardChartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-xs text-neutral-400">No chart data available</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={boardChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
                        <XAxis dataKey="name" stroke="#999999" fontSize={10} tickLine={false} />
                        <YAxis stroke="#999999" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                        <Bar dataKey="Tasks" fill="#000000" radius={[4, 4, 0, 0]} barSize={24} />
                        <Bar dataKey="Completed" fill="#666666" radius={[4, 4, 0, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Priority distribution */}
              <div className="p-5 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-4">Task Priority Distribution</h3>
                <div className="h-48 flex items-center justify-between">
                  <div className="w-1/2 h-full">
                    {priorityChartData.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-xs text-neutral-400">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {priorityChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="w-1/2 flex flex-col gap-2.5 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
                      <span>High Priority ({allTasks.filter(t => t.priority === 'High').length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                      <span>Medium Priority ({allTasks.filter(t => t.priority === 'Medium').length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
                      <span>Low Priority ({allTasks.filter(t => t.priority === 'Low').length})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="flex flex-col gap-6">
              <div className="p-5 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs flex-1">
                <div className="flex items-center gap-2 text-black dark:text-white mb-4">
                  <Sparkles size={16} className="text-[#A855F7]" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider">AI Copilot Insights</h3>
                </div>

                <div className="flex flex-col gap-3">
                  {getAIInsights().map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                        insight.type === 'danger'
                          ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-950/10 dark:border-red-900/30'
                          : insight.type === 'warning'
                          ? 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-950/10 dark:border-amber-900/30'
                          : insight.type === 'success'
                          ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-950/10 dark:border-green-900/30'
                          : 'bg-neutral-50 border-[#E8E8E8] text-neutral-600 dark:bg-neutral-900/50 dark:border-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{insight.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deadlines list */}
              <div className="p-5 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white mb-3 flex items-center gap-2">
                  <Clock size={14} /> Upcoming Deadlines
                </h3>
                <div className="flex flex-col gap-2">
                  {allTasks
                    .filter(t => t.dueDate && t.status !== 'done')
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
                    .map(task => (
                      <div key={task._id} className="flex items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors border border-[#F5F5F5] dark:border-neutral-900">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-black dark:text-white truncate">{task.title}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium">
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  {allTasks.filter(t => t.dueDate && t.status !== 'done').length === 0 && (
                    <p className="text-xs text-neutral-400 text-center py-4">No upcoming deadlines.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calendar View */}
        {activeTab === 'calendar' && (
          <div className="bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl p-5 shadow-xs">
            {/* Header controls */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-black dark:text-white">
                {monthName} {year}
              </h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-1 px-3 border border-[#E8E8E8] dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg text-xs transition-colors">
                  &lt; Prev
                </button>
                <button onClick={handleNextMonth} className="p-1 px-3 border border-[#E8E8E8] dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg text-xs transition-colors">
                  Next &gt;
                </button>
              </div>
            </div>

            {/* Days header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((d, index) => {
                // Find tasks due on this day
                const dayTasks = allTasks.filter(t => {
                  if (!t.dueDate) return false;
                  const dDate = new Date(t.dueDate);
                  return (
                    dDate.getDate() === d.date.getDate() &&
                    dDate.getMonth() === d.date.getMonth() &&
                    dDate.getFullYear() === d.date.getFullYear()
                  );
                });

                return (
                  <div
                    key={index}
                    className={`min-h-[70px] p-1.5 border border-[#E8E8E8] dark:border-neutral-800 rounded-xl flex flex-col gap-1 transition-all ${
                      d.isCurrentMonth
                        ? 'bg-white dark:bg-neutral-950'
                        : 'bg-neutral-50 text-neutral-300 dark:bg-neutral-900/40 dark:text-neutral-700'
                    }`}
                  >
                    <span className="text-[10px] font-semibold">{d.day}</span>
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[50px] scrollbar-none">
                      {dayTasks.map(t => (
                        <div
                          key={t._id}
                          onClick={() => {
                            const bId = t.boardId || t.board;
                            if (bId) navigate(`/boards/${bId}`);
                          }}
                          className="text-[9px] px-1.5 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black font-medium truncate cursor-pointer hover:opacity-80"
                          title={t.title}
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

        {/* Tab 4: Team Members Panel */}
        {activeTab === 'team' && (
          <div className="p-6 bg-white border border-[#E8E8E8] dark:bg-[#121212] dark:border-neutral-800 rounded-xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white">Workspace Members</h3>
                <p className="text-xs text-neutral-400 mt-1">Manage team roles, invite members, and configure workspace rights.</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-all">
                <UserPlus size={14} /> Invite Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: user?.name || 'Dishant', email: user?.email || 'dishanthada@gmail.com', role: 'Workspace Admin', status: 'Active' },
                { name: 'Aarav Mehta', email: 'aarav.mehta@company.co', role: 'Collaborator', status: 'Active' },
                { name: 'Diya Sharma', email: 'diya.sharma@company.co', role: 'Viewer', status: 'Pending Invite' },
              ].map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-[#E8E8E8] dark:border-neutral-800 rounded-xl hover:border-black dark:hover:border-white transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-semibold text-black dark:text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black dark:text-white">{member.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-neutral-500 block">{member.role}</span>
                    <span className={`text-[9px] mt-1 inline-block px-1.5 py-0.5 rounded-full font-semibold ${
                      member.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Board Creation Modal */}
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
