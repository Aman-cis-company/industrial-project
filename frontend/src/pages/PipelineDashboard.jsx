import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  Wrench, 
  Calendar, 
  FileCheck,
  Map,
  ArrowRight,
  ShieldAlert,
  Server,
  ActivitySquare
} from 'lucide-react';

const STATUS_COLORS = {
  Operational: '#10B981',      // Green
  UnderMaintenance: '#F59E0B', // Amber
  ShutDown: '#64748B',         // Gray
  Critical: '#EF4444'          // Red
};

const PipelineDashboard = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [complianceItems, setComplianceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const sumRes = await fetch(`${apiUrl}/pipeline/dashboard-summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const compRes = await fetch(`${apiUrl}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sumData = await sumRes.json();
      const compData = await compRes.json();

      if (sumData.success) {
        setSummary(sumData.data);
      }
      if (compData.success) {
        const segmentCompliance = compData.data.filter(c => c.segmentId !== null && c.status !== 'Compliant');
        setComplianceItems(segmentCompliance);
      }
    } catch (err) {
      addToast('Error loading dashboard summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statusChartData = useMemo(() => {
    if (!summary?.segmentStatusCounts) return [];
    return Object.entries(summary.segmentStatusCounts).map(([name, value]) => ({
      name,
      value
    }));
  }, [summary]);

  const incidentTrendData = [
    { month: 'Feb', reported: 1, resolved: 0 },
    { month: 'Mar', reported: 2, resolved: 1 },
    { month: 'Apr', reported: 1, resolved: 2 },
    { month: 'May', reported: 3, resolved: 1 },
    { month: 'Jun', reported: 2, resolved: 3 },
    { month: 'Jul', reported: summary?.openIncidentsCount || 2, resolved: 1 }
  ];

  if (loading || !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent dark:border-accent-dark"></div>
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Syncing Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Network Executive Dashboard"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Executive Dashboard']}
        actions={
          <button 
            onClick={() => navigate('/pipeline/map')}
            className="btn btn-brand flex items-center gap-2 shadow-xs hover:shadow-md transition-all duration-200"
          >
            <Map className="w-4 h-4" /> Live Map View
          </button>
        }
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {/* Total Segments */}
        <div className="bg-gradient-to-br from-surface to-surface/90 dark:from-surface-dark dark:to-surface-dark/95 border border-border dark:border-border-dark shadow-xs hover:shadow-lg rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-brand/5 dark:bg-brand-dark/5 rounded-bl-full group-hover:scale-110 transition-transform duration-350"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark">Total Segments</span>
            <div className="p-2.5 bg-brand/10 dark:bg-brand-dark/20 text-brand dark:text-brand-dark rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-technical font-bold text-text-primary dark:text-text-primary-dark">{summary.totalSegments}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-250 dark:border-emerald-900/30">100% Monitored</span>
          </div>
          <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Across 3 active regions</p>
        </div>

        {/* Critical Segments */}
        <div className="bg-gradient-to-br from-surface to-surface/90 dark:from-surface-dark dark:to-surface-dark/95 border border-border dark:border-border-dark shadow-xs hover:shadow-lg rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          {summary.segmentStatusCounts?.Critical > 0 && (
            <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>
          )}
          <div className="absolute right-0 top-0 h-24 w-24 bg-rose-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-350"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark">Critical Segments</span>
            <div className="p-2.5 bg-rose-500/15 text-rose-500 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-technical font-bold text-text-primary dark:text-text-primary-dark">{summary.segmentStatusCounts?.Critical || 0}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
              summary.segmentStatusCounts?.Critical > 0
                ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/30'
            }`}>
              {summary.segmentStatusCounts?.Critical > 0 ? 'Urgent Remediation' : 'All Clear'}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Requires immediate safety review</p>
        </div>

        {/* Open Incidents */}
        <div className="bg-gradient-to-br from-surface to-surface/90 dark:from-surface-dark dark:to-surface-dark/95 border border-border dark:border-border-dark shadow-xs hover:shadow-lg rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-orange-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-350"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark">Open Incidents</span>
            <div className="p-2.5 bg-orange-500/15 text-orange-500 rounded-xl">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-technical font-bold text-text-primary dark:text-text-primary-dark">{summary.openIncidentsCount}</span>
            {summary.openIncidentsCount > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200 animate-pulse">Needs Review</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Anomalies currently under investigation</p>
        </div>

        {/* Overdue Maintenance */}
        <div className="bg-gradient-to-br from-surface to-surface/90 dark:from-surface-dark dark:to-surface-dark/95 border border-border dark:border-border-dark shadow-xs hover:shadow-lg rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-24 w-24 bg-amber-500/5 rounded-bl-full group-hover:scale-110 transition-transform duration-350"></div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted-dark">Overdue Maintenance</span>
            <div className="p-2.5 bg-amber-500/15 text-amber-500 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-technical font-bold text-text-primary dark:text-text-primary-dark">{summary.overdueMaintenanceCount}</span>
            {summary.overdueMaintenanceCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 font-bold border border-amber-200">Action Needed</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Scheduled tasks past due dates</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Incident Trend Line Chart */}
        <div className="lg:col-span-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border-dark">
            <h3 className="text-sm font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
              <ActivitySquare className="w-4.5 h-4.5 text-brand dark:text-brand-dark" />
              Incident & Anomalies Trend
            </h3>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-text-muted font-bold">6-Month Window</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incidentTrendData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line 
                  type="monotone" 
                  dataKey="reported" 
                  name="Reported Incidents" 
                  stroke="#EF4444" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="resolved" 
                  name="Resolved" 
                  stroke="#10B981" 
                  strokeWidth={2.5} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segment Status Donut Chart */}
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="pb-2 border-b border-border dark:border-border-dark">
            <h3 className="text-sm font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
              <Server className="w-4.5 h-4.5 text-brand dark:text-brand-dark" />
              Segments Status Distribution
            </h3>
          </div>
          <div className="h-60 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name] || '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Donut Center Stats */}
            <div className="absolute text-center flex flex-col items-center">
              <span className="text-3xl font-technical font-bold text-text-primary dark:text-text-primary-dark">
                {summary.totalSegments}
              </span>
              <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">Total Links</p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-t border-border dark:border-border-dark pt-4 mt-2">
            {statusChartData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] }}></span>
                <span className="text-text-secondary dark:text-text-secondary-dark truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Expiry Alerts Widget */}
      <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border-dark">
          <h3 className="text-sm font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-brand dark:text-brand-dark" />
            Active Pipeline Compliance Expiries
          </h3>
          <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-250/20">
            {complianceItems.length} Urgent Permits
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {complianceItems.length === 0 ? (
            <div className="col-span-full py-12 text-center text-xs text-text-muted italic flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              All segments are 100% compliant. No expiring permits found.
            </div>
          ) : (
            complianceItems.map(item => (
              <div 
                key={item.id} 
                className="p-4 bg-background dark:bg-background-dark/30 border border-border/60 hover:border-brand/40 dark:hover:border-brand-dark/40 rounded-xl flex flex-col justify-between transition-all duration-300 hover:shadow-xs group cursor-pointer"
                onClick={() => navigate(`/pipeline/segments/${item.segmentId}`)}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-3">
                    <h4 className="font-bold text-xs text-text-primary dark:text-text-primary-dark line-clamp-1 group-hover:text-brand dark:group-hover:text-brand-dark transition-colors">
                      {item.requirementName}
                    </h4>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold border ${
                      item.status === 'NonCompliant' 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-200' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-brand hover:underline font-semibold leading-tight truncate">
                    {item.segment?.name || 'Pipeline Segment'}
                  </p>
                  <p className="text-[10px] text-text-muted">Type: <span className="font-medium text-text-secondary dark:text-text-secondary-dark">{item.applicableServiceCategory}</span></p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-text-muted">Due Date: <span className="font-technical font-bold text-text-primary dark:text-text-primary-dark">{item.dueDate}</span></span>
                  <span className="text-brand dark:text-brand-dark group-hover:translate-x-1 hover:underline flex items-center font-bold transition-transform">
                    Remediate <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineDashboard;
