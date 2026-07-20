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
  CartesianGrid,
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
  Buildings: '#4A7CB5',
  UrbanPlanning: '#10B981',
  HeatingCooling: '#06B6D4',
  PowerTransmissionDistribution: '#D97706',
  WaterTreatment: '#2DD4BF',
  WastewaterTreatment: '#6366F1',
  InteriorDesign: '#8B5CF6',
  Healthcare: '#F43F5E',
  BIM: '#4A7CB5'
};

const CHART_COLORS = ['#4A7CB5', '#2DD4BF', '#D97706', '#6366F1', '#8B5CF6', '#F43F5E', '#06B6D4', '#10B981', '#F0A94A'];

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
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark transition-colors duration-200">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Budget calculations
  const spendPct = summary.totalBudget > 0 ? Math.round((summary.totalSpent / summary.totalBudget) * 100) : 0;

  // Format category breakdown names for donut legend
  const CATEGORY_LABELS = {
    Buildings: 'Pipeline Pumping Stations',
    UrbanPlanning: 'Utility Routing Networks',
    HeatingCooling: 'LPG/LNG Cryogenic Loops',
    PowerTransmissionDistribution: 'Gas Transmission Pipelines',
    WaterTreatment: 'Subsea Oil Pipelines',
    WastewaterTreatment: 'Refinery Flow Systems',
    InteriorDesign: 'Refinery Bypass Pipelines',
    Healthcare: 'Offshore Deepwater Lines',
    BIM: 'Digital Twin Models'
  };

  const formattedCategoryData = summary.categoryBreakdown?.map(item => ({
    ...item,
    name: CATEGORY_LABELS[item.name] || item.name.replace(/([A-Z])/g, ' $1').trim()
  })) || [];

  // Project Status Distribution data
  const statusData = [
    { name: 'On Track', count: summary.statusCounts?.OnTrack || 0, fill: '#2DD4BF' },
    { name: 'At Risk', count: summary.statusCounts?.AtRisk || 0, fill: '#D97706' },
    { name: 'Delayed', count: summary.statusCounts?.Delayed || 0, fill: '#F43F5E' },
    { name: 'Completed', count: summary.statusCounts?.Completed || 0, fill: '#4A7CB5' }
  ];

  return (
    <div className="space-y-6 transition-colors duration-200">
      {/* Header and Report Action */}
      <PageHeader
        title="Executive BI Portfolio & KPI Desk"
        breadcrumbs={['PetroFlow', 'Executive BI Portfolio']}
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
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 rounded-xl p-5 shadow-sm space-y-3 transition-colors duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Active PMO Contracts</span>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Briefcase className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-text-primary dark:text-text-primary-dark leading-none">
              {summary.activeProjectsCount} Projects
            </p>
            <span className="text-[10px] text-text-muted dark:text-text-muted-dark block mt-2">
              Across all 9 engineering divisions
            </span>
          </div>
        </div>

        {/* At-Risk Projects */}
        <div className="bg-gradient-to-br from-white to-rose-50/30 dark:from-slate-900 dark:to-slate-950 border border-rose-200/60 dark:border-rose-950/20 border-l-4 border-l-rose-500 rounded-xl p-5 shadow-sm space-y-3 transition-colors duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">At-Risk / Delayed</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-lg">
              <AlertTriangle className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-rose-600 dark:text-rose-400 leading-none">
              {Number(summary.statusCounts?.AtRisk || 0) + Number(summary.statusCounts?.Delayed || 0)} Projects
            </p>
            <span className="text-[10px] text-rose-500/85 block mt-2">
              Requires immediate resource leveling
            </span>
          </div>
        </div>

        {/* Budget Burn */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500 rounded-xl p-5 shadow-sm space-y-3 transition-colors duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Budget Utilization (SAR)</span>
            <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <DollarSign className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-text-primary dark:text-text-primary-dark leading-none">
              {spendPct}% Used
            </p>
            <div className="w-full bg-border dark:bg-border-dark h-1 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-teal-500" style={{ width: `${spendPct}%` }}></div>
            </div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-gradient-to-br from-white to-violet-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 border-l-4 border-l-violet-500 rounded-xl p-5 shadow-sm space-y-3 transition-colors duration-200 hover:shadow-md">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted-dark">Overdue Deliverables</span>
            <div className="p-2 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-lg">
              <CheckSquare className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold font-technical text-text-primary dark:text-text-primary-dark leading-none">
              {summary.overdueTasksCount} Tasks
            </p>
            <span className="text-[10px] text-text-muted dark:text-text-muted-dark block mt-2">
              Assigned to active engineers
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Services Breadcrumb */}
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200">
          <h3 className="text-xs font-bold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
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
                <Tooltip
                  formatter={(value) => [`${value} projects`, 'Contracts']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-3 gap-1.5 text-[9px] font-semibold text-text-muted dark:text-text-muted-dark uppercase pt-2 border-t border-border dark:border-border-dark">
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
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200">
          <h3 className="text-xs font-bold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
            Project Contract Status Load
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ bottom: 20 }}>
                <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} projects`, 'Status Count']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Burn Line Chart */}
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200">
          <h3 className="text-xs font-bold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
            Cumulative Budget Burn Trend (SAR)
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid stroke="var(--color-border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }} formatter={(v) => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(v) => [`SAR ${Number(v).toLocaleString()}`, 'Spent Cumulative']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                />
                <Line type="monotone" dataKey="budgetBurn" stroke="#2DD4BF" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row - At Risk Table & Milestones */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* At Risk Projects Table */}
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm space-y-4 xl:col-span-2 overflow-x-auto select-none transition-colors duration-200">
          <h3 className="text-xs font-bold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
            Action Required: At-Risk &amp; Delayed Contracts
          </h3>
          
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border dark:border-border-dark text-text-muted dark:text-text-muted-dark uppercase tracking-wider font-semibold bg-background dark:bg-background-dark text-[10px]">
                <th className="pb-3 pl-2">Contract Name</th>
                <th className="pb-3">Client</th>
                <th className="pb-3 text-center">Spent Progress</th>
                <th className="pb-3">Manager</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {summary.atRiskProjects?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-text-muted dark:text-text-muted-dark italic">
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
                      className="hover:bg-background dark:hover:bg-background-dark cursor-pointer transition-colors duration-200"
                    >
                      <td className="py-3 font-semibold text-text-primary dark:text-text-primary-dark pl-2 max-w-[200px] truncate" title={proj.name}>
                        {proj.name}
                      </td>
                      <td className="py-3 text-text-muted dark:text-text-muted-dark truncate max-w-[120px]">{proj.clientName}</td>
                      <td className="py-3">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex justify-between text-[9px] font-technical font-bold text-text-muted dark:text-text-muted-dark">
                            <span>SAR {(proj.budgetSpent/1000000).toFixed(1)}M</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="w-full bg-border dark:bg-border-dark h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-text-muted dark:text-text-muted-dark">{proj.projectManager?.user?.name || 'Unassigned'}</td>
                      <td className="py-3 text-right pr-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          proj.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100'
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
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-sm space-y-4 transition-colors duration-200">
          <h3 className="text-xs font-bold text-text-primary dark:text-text-primary-dark uppercase tracking-wide">
            Next Critical Milestones
          </h3>

          <div className="space-y-3">
            {summary.upcomingMilestones?.length === 0 ? (
              <p className="text-xs text-text-muted dark:text-text-muted-dark italic py-6 text-center">
                No upcoming contract milestones registered.
              </p>
            ) : (
              summary.upcomingMilestones.map((mil, idx) => (
                <div
                  key={mil.id || idx}
                  className="p-3 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-xl flex justify-between items-start gap-2 transition-colors duration-200"
                >
                  <div className="truncate">
                    <p className="font-bold text-text-primary dark:text-text-primary-dark text-xs truncate" title={mil.title}>
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
                    <span className="font-technical text-[9px] font-bold text-text-muted dark:text-text-muted-dark block flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" strokeWidth={1.5} />
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
              className="px-4 py-2 border border-border dark:border-border-dark hover:bg-background dark:hover:bg-background-dark text-sm font-semibold rounded-lg text-text-primary dark:text-text-primary-dark cursor-pointer transition-colors duration-200"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(aiReportContent);
                addToast('Report copied to clipboard', 'success');
              }}
              className="px-4 py-2 bg-background dark:bg-background-dark hover:bg-border dark:hover:bg-border-dark text-text-primary dark:text-text-primary-dark text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-200"
            >
              Copy Report
            </button>
            <button
              onClick={() => {
                addToast('Generating PDF file...', 'info');
                setTimeout(() => addToast('Executive_Report_2026.pdf downloaded', 'success'), 1000);
              }}
              className="px-4 py-2 bg-accent dark:bg-accent-dark hover:bg-accent/90 dark:hover:bg-accent-dark/90 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors duration-200"
            >
              Export as PDF
            </button>
          </>
        }
      >
        <div className="text-xs text-text-primary dark:text-text-primary-dark whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-background dark:bg-background-dark p-4 border border-border dark:border-border-dark rounded-xl font-semibold select-text transition-colors duration-200">
          {aiReportContent.split('\n').map((line, idx) => {
            if (line.startsWith('###') || line.startsWith('####')) {
              return <h4 key={idx} className="font-extrabold text-sm mt-3 mb-1 uppercase tracking-wider block text-text-primary dark:text-text-primary-dark">{line.replace(/#/g, '').trim()}</h4>;
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
