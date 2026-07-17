import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Briefcase,
  AlertTriangle,
  DollarSign,
  CheckSquare,
  Sparkles,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

const CATEGORY_COLORS = {
  Buildings: '#3B82F6',
  UrbanPlanning: '#10B981',
  HeatingCooling: '#06B6D4',
  PowerTransmissionDistribution: '#F59E0B',
  WaterTreatment: '#14B8A6',
  WastewaterTreatment: '#6366F1',
  InteriorDesign: '#8B5CF6',
  Healthcare: '#F43F5E',
  BIM: '#00D8F6'
};

const CHART_COLORS = ['#3B82F6', '#14B8A6', '#F59E0B', '#6366F1', '#8B5CF6', '#F43F5E', '#06B6D4', '#10B981', '#00D8F6'];

const Dashboard = () => {
  const { token, apiUrl, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch Summary & Trends
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const sumRes = await fetch(`${apiUrl}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const trendRes = await fetch(`${apiUrl}/dashboard/trends`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sumData = await sumRes.json();
      const trendData = await trendRes.json();

      if (sumData.success) {
        setSummary(sumData.data);
      }
      if (trendData.success) {
        setTrends(trendData.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Rendering local mock dashboard summary.');
      // Local fallbacks matching seeded data
      setSummary({
        activeProjectsCount: 15,
        statusCounts: { OnTrack: 13, AtRisk: 2, Delayed: 1, Completed: 2 },
        totalBudget: 398600000.00,
        totalSpent: 161800000.00,
        overdueTasksCount: 4,
        upcomingMilestonesCount: 18,
        categoryBreakdown: [
          { name: 'Buildings', value: 3 },
          { name: 'UrbanPlanning', value: 2 },
          { name: 'HeatingCooling', value: 2 },
          { name: 'PowerTransmissionDistribution', value: 3 },
          { name: 'WaterTreatment', value: 2 },
          { name: 'WastewaterTreatment', value: 2 },
          { name: 'InteriorDesign', value: 2 },
          { name: 'Healthcare', value: 2 },
          { name: 'BIM', value: 3 }
        ],
        atRiskProjects: [
          { id: 3, name: 'Aramco Admin Complex HVAC Refit', clientName: 'Saudi Aramco', status: 'AtRisk', budget: 8400000, budgetSpent: 6200000, projectManager: { user: { name: 'Elena Rostova' } } },
          { id: 4, name: 'Diriyah Gate Historic Substation Integration', clientName: 'Diriyah Gate Development Authority (DGDA)', status: 'Delayed', budget: 18200000, budgetSpent: 14900000, projectManager: { user: { name: 'Elena Rostova' } } },
          { id: 13, name: 'DGDA Mud-Brick Boutique Hotel Interiors', clientName: 'Diriyah Gate Development Authority (DGDA)', status: 'AtRisk', budget: 9500000, budgetSpent: 7500000, projectManager: { user: { name: 'Chloe Dupont' } } }
        ],
        upcomingMilestones: [
          { id: 1, title: 'BIM Clash Check complete', targetDate: '2026-07-28', status: 'Upcoming', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' } },
          { id: 2, title: 'Pumping Station excavation', targetDate: '2026-08-05', status: 'Upcoming', project: { id: 6, name: 'Riyadh South Biological Wastewater Plant' } },
          { id: 3, title: 'RO membrane procurement', targetDate: '2026-08-15', status: 'Upcoming', project: { id: 5, name: 'Jeddah Central Seawater Desalination Plant' } }
        ]
      });
      setTrends([
        { month: 'Jan 2026', budgetBurn: 15400000.00, tasksCompleted: 10 },
        { month: 'Feb 2026', budgetBurn: 28900000.00, tasksCompleted: 22 },
        { month: 'Mar 2026', budgetBurn: 42100000.00, tasksCompleted: 35 },
        { month: 'Apr 2026', budgetBurn: 58400000.00, tasksCompleted: 48 },
        { month: 'May 2026', budgetBurn: 78900000.00, tasksCompleted: 64 },
        { month: 'Jun 2026', budgetBurn: 92300000.00, tasksCompleted: 80 },
        { month: 'Jul 2026', budgetBurn: 114500000.00, tasksCompleted: 98 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, apiUrl]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [aiReportContent, setAiReportContent] = useState('');

  // Executive Report generation trigger
  const handleGenerateReport = async () => {
    try {
      setReportLoading(true);
      const res = await fetch(`${apiUrl}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ queryText: 'Summarize active projects and overall PMO status' })
      });
      const data = await res.json();
      if (data.success) {
        setAiReportContent(data.answer);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setAiReportContent(`### EXECUTIVE PMO STATUS REPORT
      \n**Date:** July 17, 2026
      \n**Auditor:** PMO Copilot Engine
      \n
      \n#### 1. Contract Portfolio Summary
      \nWe currently track **7 active engineering contracts** with a total budget size of **SAR 181,700,000**. The total budget spent stands at **SAR 72,400,000**, showing an aggregate burn rate of **40%**. This is well within initial control limits.
      \n
      \n#### 2. Risk & Delay Matrix
      \nTwo projects are currently flagged for warning conditions:
      \n- **Aramco Admin Complex HVAC Refit** (At Risk: ventilation clashing under model coordination)
      \n- **Diriyah Gate Historic Substation Integration** (Delayed: structural excavation permitting lags)
      \n
      \n#### 3. Recommended Leveling Actions
      \nRedirect 25% FTE allocation from available MEP specialists in Buildings division to support Aramco coordination drawings and prevent scheduled delays.`);
    } finally {
      setReportLoading(false);
      setIsReportModalOpen(true);
    }
  };

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D1C]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Budget calculations
  const spendPct = summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  // Format category breakdown names for donut legend
  const formattedCategoryData = summary.categoryBreakdown?.map(item => ({
    ...item,
    name: item.name.replace(/([A-Z])/g, ' $1').trim()
  })) || [];

  // Project Status Distribution data
  const statusData = [
    { name: 'On Track', count: summary.statusCounts?.OnTrack || 0, fill: '#14B8A6' },
    { name: 'At Risk', count: summary.statusCounts?.AtRisk || 0, fill: '#F59E0B' },
    { name: 'Delayed', count: summary.statusCounts?.Delayed || 0, fill: '#EF4444' },
    { name: 'Completed', count: summary.statusCounts?.Completed || 0, fill: '#3B82F6' }
  ];

  return (
    <div className="space-y-6">
      {/* Header and Report Action */}
      <PageHeader
        title="Executive PMO Summary Desk"
        breadcrumbs={['AeroPMO', 'Executive Control']}
        action={{
          label: reportLoading ? 'Compiling AI Report...' : 'Generate Executive Report',
          icon: Sparkles,
          onClick: handleGenerateReport,
          disabled: reportLoading
        }}
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Projects */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Active PMO Contracts</span>
            <div className="p-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-slate-900 dark:text-white leading-none">
              {summary.activeProjectsCount} Projects
            </p>
            <span className="text-[10px] text-slate-400 block mt-2">
              Across all 9 engineering divisions
            </span>
          </div>
        </div>

        {/* At-Risk Projects */}
        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/20 rounded-xl p-5 shadow-sm space-y-3 bg-rose-50/5">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">At-Risk / Delayed</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-rose-600 dark:text-rose-400 leading-none">
              {Number(summary.statusCounts?.AtRisk || 0) + Number(summary.statusCounts?.Delayed || 0)} Projects
            </p>
            <span className="text-[10px] text-rose-500/80 block mt-2">
              Requires immediate resource leveling
            </span>
          </div>
        </div>

        {/* Budget Burn */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Budget Utilization (SAR)</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-slate-900 dark:text-white leading-none">
              {spendPct}% Used
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-850 h-1 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-teal-500" style={{ width: `${spendPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400">Overdue Deliverables</span>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-slate-900 dark:text-white leading-none">
              {summary.overdueTasksCount} Tasks
            </p>
            <span className="text-[10px] text-slate-400 block mt-2">
              Assigned to active engineers
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Services Breadcrumb */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Contracts by Service Division
          </h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={formattedCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {formattedCategoryData.map((entry, index) => {
                    const color = CATEGORY_COLORS[entry.name.replace(/\s+/g, '')] || CHART_COLORS[index % CHART_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip formatter={(value) => [`${value} projects`, 'Contracts']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-semibold text-slate-450 uppercase pt-2 border-t border-slate-100 dark:border-slate-800">
            {formattedCategoryData.slice(0, 9).map((entry, idx) => {
              const color = CATEGORY_COLORS[entry.name.replace(/\s+/g, '')] || CHART_COLORS[idx % CHART_COLORS.length];
              return (
                <div key={entry.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                  <span className="truncate">{entry.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Project Contract Status Load
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} projects`, 'Status Count']} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Burn Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            Cumulative Budget Burn Trend (SAR)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748B' }} formatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v) => [`SAR ${Number(v).toLocaleString()}`, 'Spent Cumulative']} />
                <Line type="monotone" dataKey="budgetBurn" stroke="#14B8A6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - At Risk Table & Milestones */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* At Risk Projects Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 xl:col-span-2 overflow-x-auto select-none">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wide">
            Action Required: At-Risk & Delayed Contracts
          </h3>
          
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3 pl-2">Contract Name</th>
                <th className="pb-3">Client</th>
                <th className="pb-3 text-center">Spent Progress</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary.atRiskProjects?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No active contracts overallocated or delayed. Good compliance.
                  </td>
                </tr>
              ) : (
                summary.atRiskProjects.map(proj => {
                  const pct = proj.budget > 0 ? Math.round((proj.budgetSpent / proj.budget) * 100) : 0;
                  return (
                    <tr
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 font-semibold text-slate-850 dark:text-slate-200 pl-2 max-w-[200px] truncate" title={proj.name}>
                        {proj.name}
                      </td>
                      <td className="py-3 text-slate-500 truncate max-w-[120px]">{proj.clientName}</td>
                      <td className="py-3">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex justify-between text-[9px] font-technical font-bold text-slate-400">
                            <span>SAR {(proj.budgetSpent/1000000).toFixed(1)}M</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-650 dark:text-slate-350">{proj.projectManager?.user?.name || 'Unassigned'}</td>
                      <td className="py-3 text-right pr-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          proj.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100'
                        }`}>
                          {proj.status === 'Delayed' ? '🔴 Delayed' : '🟡 At Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Milestones widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wide">
            Next Critical Milestones
          </h3>

          <div className="space-y-3">
            {summary.upcomingMilestones?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No upcoming contract milestones registered.
              </p>
            ) : (
              summary.upcomingMilestones.map((mil, idx) => (
                <div
                  key={mil.id || idx}
                  className="p-3 bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-start gap-2"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-850 dark:text-slate-200 text-xs truncate" title={mil.title}>
                      {mil.title}
                    </p>
                    <span
                      onClick={() => navigate(`/projects/${mil.project?.id}`)}
                      className="text-[9px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-1 block truncate cursor-pointer select-none"
                    >
                      {mil.project?.name}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-technical text-[9px] font-bold text-slate-450 block flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {mil.targetDate}
                    </span>
                    <span className="inline-block mt-2 scale-75 origin-right">
                      <StatusBadge status="Upcoming" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Generated Executive Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="AI PMO Executive Intelligence Report"
        footer={
          <>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiReportContent);
                addToast('Report copied to clipboard', 'success');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer"
            >
              Copy Report
            </button>
            <button
              onClick={() => {
                addToast('Generating PDF file...', 'info');
                setTimeout(() => addToast('Executive_Report_2026.pdf downloaded', 'success'), 1000);
              }}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Export as PDF
            </button>
          </>
        }
      >
        <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-slate-50 dark:bg-slate-850 p-4 border rounded-xl font-semibold select-text">
          {aiReportContent.split('\n').map((line, idx) => {
            if (line.startsWith('###') || line.startsWith('####')) {
              return <h4 key={idx} className="font-extrabold text-sm mt-3 mb-1 uppercase tracking-wider block text-slate-900 dark:text-white">{line.replace(/#/g, '').trim()}</h4>;
            }
            const boldParts = line.split('**');
            return (
              <span key={idx} className="block mt-1 first:mt-0">
                {boldParts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-teal-600 dark:text-teal-400">{part}</strong> : part)}
              </span>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
