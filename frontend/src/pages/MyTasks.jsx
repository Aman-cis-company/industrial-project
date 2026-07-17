import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Drawer from '../components/Drawer';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Bookmark,
  Activity,
  Trash2
} from 'lucide-react';

const MyTasks = () => {
  const { token, apiUrl, user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Tasks
  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/tasks/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock tasks desk.');
      // Local fallback data
      setTasks([
        { id: 101, title: 'BIM Model Clash Detection Review', description: 'Perform conflict checking between MEP ducts and structural steel roof columns.', dueDate: new Date().toISOString().split('T')[0], priority: 'High', status: 'InProgress', phase: 'Design', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings' } },
        { id: 102, title: 'Foundation Load Analysis Report', description: 'Compute final loading limits for concrete footings based on core sample data.', dueDate: '2026-06-15', priority: 'High', status: 'Done', phase: 'Design', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings' } },
        { id: 103, title: 'Trench Cabling Survey', description: 'Verify underground electrical conduit clearance from neighboring water pipes.', dueDate: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], priority: 'Medium', status: 'Blocked', phase: 'Execution', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings' } },
        { id: 104, title: 'LEED Gold Building Envelope Assessment', description: 'Evaluate solar gain profiles on exterior glazed windows.', dueDate: new Date(Date.now() + 4*24*60*60*1000).toISOString().split('T')[0], priority: 'Low', status: 'NotStarted', phase: 'Design', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings' } },
        { id: 105, title: 'Zoning Code Compliance Review', description: 'Audit proposed park borders relative to residential buffer zones.', dueDate: new Date(Date.now() + 15*24*60*60*1000).toISOString().split('T')[0], priority: 'High', status: 'NotStarted', phase: 'Design', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan', clientName: 'King Salman Park Foundation', serviceCategory: 'UrbanPlanning' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [token, apiUrl]);

  // Update Task Status In-Line
  const handleUpdateStatus = async (taskId, nextStatus) => {
    try {
      const res = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task status updated successfully', 'success');
        fetchMyTasks();
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(prev => ({ ...prev, status: nextStatus }));
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      );
      addToast('Status updated (Demo)', 'success');
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: nextStatus }));
      }
    }
  };

  // Group Tasks by Urgency
  const groupedTasks = useMemo(() => {
    const groups = {
      Overdue: [],
      DueToday: [],
      ThisWeek: [],
      Later: []
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    tasks.forEach(t => {
      // Completed tasks go to Later/Completed or completed bucket
      if (t.status === 'Done') {
        groups.Later.push(t);
        return;
      }

      const taskDate = new Date(t.dueDate);
      const timeDiff = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (diffDays < 0) {
        groups.Overdue.push(t);
      } else if (diffDays === 0) {
        groups.DueToday.push(t);
      } else if (diffDays <= 7) {
        groups.ThisWeek.push(t);
      } else {
        groups.Later.push(t);
      }
    });

    return groups;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Engineering Taskboard"
        breadcrumbs={['AeroPMO', 'My Tasks']}
      />

      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-450 dark:text-slate-500 py-16">
          <CheckSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-350">You have no tasks assigned</h3>
          <p className="text-xs text-slate-400 mt-1">
            Excellent! Your schedule is fully clear. Contact your PMO Director for contract tasks mapping.
          </p>
        </div>
      ) : (
        /* Urgency Buckets Layout */
        <div className="space-y-6">
          {[
            {
              key: 'Overdue',
              title: 'Critical Overdue Action Items',
              tasksList: groupedTasks.Overdue,
              bgColor: 'bg-rose-50/20 dark:bg-rose-950/5',
              borderColor: 'border-rose-200 dark:border-rose-900/40',
              iconColor: 'text-rose-500',
              badgeColor: 'bg-rose-500 text-white',
              icon: AlertTriangle
            },
            {
              key: 'DueToday',
              title: 'Deliverables Due Today',
              tasksList: groupedTasks.DueToday,
              bgColor: 'bg-amber-50/20 dark:bg-amber-950/5',
              borderColor: 'border-amber-200 dark:border-amber-900/40',
              iconColor: 'text-amber-500',
              badgeColor: 'bg-amber-500 text-white',
              icon: Clock
            },
            {
              key: 'ThisWeek',
              title: 'Action Items Due This Week',
              tasksList: groupedTasks.ThisWeek,
              bgColor: 'bg-teal-50/10 dark:bg-teal-950/5',
              borderColor: 'border-teal-100 dark:border-teal-900/20',
              iconColor: 'text-teal-500',
              badgeColor: 'bg-teal-500 text-white',
              icon: Calendar
            },
            {
              key: 'Later',
              title: 'Planned Later / Verified Done',
              tasksList: groupedTasks.Later,
              bgColor: 'bg-transparent',
              borderColor: 'border-slate-200 dark:border-slate-800',
              iconColor: 'text-slate-400',
              badgeColor: 'bg-slate-400 text-white',
              icon: Bookmark
            }
          ].map(({ key, title, tasksList, bgColor, borderColor, iconColor, badgeColor, icon: Icon }) => {
            if (tasksList.length === 0 && key !== 'Overdue') return null; // Hide empty buckets except Overdue to draw clear focus
            return (
              <div
                key={key}
                className={`border rounded-xl p-5 shadow-xs space-y-4 transition-all ${bgColor} ${borderColor}`}
              >
                {/* Bucket Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 tracking-wide uppercase">
                      {title}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-technical font-bold rounded ${badgeColor}`}>
                    {tasksList.length} Tasks
                  </span>
                </div>

                {/* Tasks elements */}
                {tasksList.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    No overdue action items. Compliance on schedule.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasksList.map(task => {
                      const priorityColors = {
                        Low: 'border-l-4 border-l-slate-400',
                        Medium: 'border-l-4 border-l-amber-500',
                        High: 'border-l-4 border-l-rose-500'
                      };
                      return (
                        <div
                          key={task.id}
                          className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-all ${priorityColors[task.priority]}`}
                        >
                          <div>
                            {/* Project title */}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/projects/${task.project?.id}`);
                              }}
                              className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1 leading-none select-none"
                            >
                              {task.project?.name}
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>

                            {/* Task details */}
                            <h4
                              onClick={() => {
                                setSelectedTask(task);
                                setIsDrawerOpen(true);
                              }}
                              className="font-bold text-slate-850 dark:text-slate-100 text-xs hover:underline cursor-pointer mt-2 leading-snug line-clamp-2"
                            >
                              {task.title}
                            </h4>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] font-technical font-semibold text-slate-400 dark:text-slate-550 flex items-center gap-1 select-none">
                              <Calendar className="w-3 h-3" />
                              Due: {task.dueDate}
                            </span>

                            {/* Inline status update */}
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                              className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1 text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-hidden"
                            >
                              <option value="NotStarted">Pending</option>
                              <option value="InProgress">In Progress</option>
                              <option value="Blocked">Blocked</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Engineering Task Dossier"
        footer={
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Close Dossier
          </button>
        }
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <span
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate(`/projects/${selectedTask.project?.id}`);
                }}
                className="text-[10px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1 select-none"
              >
                Project: {selectedTask.project?.name}
                <ArrowRight className="w-3 h-3" />
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                {selectedTask.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-slate-450 font-bold uppercase block mb-1">Status</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateStatus(selectedTask.id, e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 font-semibold text-slate-700 dark:text-slate-250 cursor-pointer focus:outline-hidden"
                >
                  <option value="NotStarted">Pending (Not Started)</option>
                  <option value="InProgress">Active (In Progress)</option>
                  <option value="Blocked">Blocked / Delayed</option>
                  <option value="Done">Done / Verified</option>
                </select>
              </div>
              <div>
                <span className="text-slate-450 font-bold uppercase block mb-1">Priority</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{selectedTask.priority}</span>
              </div>
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <span className="text-slate-450 font-bold uppercase block mb-0.5">Due Date</span>
                <span className="font-technical font-bold text-slate-850 dark:text-slate-350">{selectedTask.dueDate}</span>
              </div>
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <span className="text-slate-450 font-bold uppercase block mb-0.5">Deliverable Phase</span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{selectedTask.phase} Phase</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Deliverable description</h4>
              <p className="text-sm text-slate-500 leading-relaxed bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                {selectedTask.description || 'No description loaded.'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Comment Logs</h4>
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-center text-xs text-slate-400 dark:text-slate-550 bg-slate-50/50 dark:bg-slate-900/10 py-6">
                Real-time activity logs will connect in Module 5 (AI Co-pilot audits) integrations.
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MyTasks;
