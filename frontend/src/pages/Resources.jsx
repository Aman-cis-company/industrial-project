import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  Users,
  AlertTriangle,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Bookmark,
  Calendar,
  Grid,
  BarChart3,
  Activity,
  Briefcase,
  Search
} from 'lucide-react';

const HeatmapColors = (pct) => {
  if (pct === 0) return 'bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-600';
  if (pct < 40) return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'; // Underutilized (Gray)
  if (pct <= 90) return 'bg-teal-500 text-white font-bold'; // Healthy (Teal/Green)
  if (pct <= 100) return 'bg-amber-500 text-white font-bold'; // Near Capacity (Amber)
  return 'bg-rose-500 text-white font-bold animate-pulse'; // Overallocated (Red)
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-lg space-y-2 text-xs">
        <p className="font-bold text-slate-850 dark:text-white">{data.name}</p>
        <p className="font-semibold text-slate-500">Designation: <span className="text-slate-700 dark:text-slate-300">{data.designation}</span></p>
        <p className="font-semibold text-slate-500">Total Workload: <span className={`font-technical font-bold ${data.totalAllocation > 100 ? 'text-rose-500' : 'text-teal-600'}`}>{data.totalAllocation}%</span></p>
        
        {data.allocations && data.allocations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Active Allocations:</p>
            {data.allocations.map(alloc => (
              <div key={alloc.projectId} className="flex justify-between gap-4 font-semibold text-[10px]">
                <span className="truncate max-w-[120px] dark:text-slate-350">{alloc.projectName}</span>
                <span className="font-technical text-slate-700 dark:text-slate-200">{alloc.allocationPercent}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};

const Resources = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap' or 'chart'

  // Filters State
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer details
  const [selectedResource, setSelectedResource] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch utilization data
  const fetchUtilization = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/resources/utilization`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setResources(data.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Setting mock utilization matrix.');
      // Local fallback data matches seeder configuration
      setResources([
        { id: 1, name: 'Sarah Jenkins', designation: 'Managing Director & HR Lead', department: 'PMO & Administration', discipline: 'Civil', totalAllocation: 0, status: 'Underutilized', allocations: [] },
        { id: 2, name: 'Marcus Vance', designation: 'PMO Director', department: 'PMO Office', discipline: 'Civil', totalAllocation: 0, status: 'Underutilized', allocations: [] },
        { id: 3, name: 'Elena Rostova', designation: 'Senior Project Manager', department: 'Buildings Division', discipline: 'Civil', totalAllocation: 0, status: 'Underutilized', allocations: [] },
        { id: 7, name: 'Carlos Mendez', designation: 'Lead Mechanical Engineer', department: 'Buildings Division', discipline: 'MEP', totalAllocation: 125, status: 'Overallocated', allocations: [{ projectId: 1, projectName: 'NEOM Spine Tunnel Structural Design', allocationPercent: 25 }, { projectId: 3, projectName: 'Aramco Admin Complex HVAC Refit', allocationPercent: 100 }] },
        { id: 8, name: 'Priya Patel', designation: 'BIM Coordinator', department: 'BIM Division', discipline: 'BIM', totalAllocation: 150, status: 'Overallocated', allocations: [{ projectId: 1, projectName: 'NEOM Spine Tunnel Structural Design', allocationPercent: 50 }, { projectId: 9, projectName: 'Qiddiya Water Theme Park BIM Coordination', allocationPercent: 100 }] },
        { id: 9, name: 'Aisha Diallo', designation: 'Lead Process Engineer', department: 'Infrastructure Division', discipline: 'WaterEnvironmental', totalAllocation: 250, status: 'Overallocated', allocations: [{ projectId: 2, projectName: 'King Salman Park Infrastructure Master Plan', allocationPercent: 50 }, { projectId: 5, projectName: 'Jeddah Central Seawater Desalination Plant', allocationPercent: 100 }, { projectId: 6, projectName: 'Riyadh South Biological Wastewater Plant', allocationPercent: 100 }] },
        { id: 10, name: 'Mei Tanaka', designation: 'Lead Structural Engineer', department: 'Buildings Division', discipline: 'Civil', totalAllocation: 140, status: 'Overallocated', allocations: [{ projectId: 1, projectName: 'NEOM Spine Tunnel Structural Design', allocationPercent: 100 }, { projectId: 6, projectName: 'Riyadh South Biological Wastewater Plant', allocationPercent: 40 }] },
        { id: 11, name: 'Hans Meyer', designation: 'Senior Foundation Specialist', department: 'Buildings Division', discipline: 'Civil', totalAllocation: 75, status: 'Healthy', allocations: [{ projectId: 1, projectName: 'NEOM Spine Tunnel Structural Design', allocationPercent: 75 }] },
        { id: 13, name: 'Omar Al-Fayed', designation: 'Wastewater Operations Designer', department: 'Infrastructure Division', discipline: 'WaterEnvironmental', totalAllocation: 50, status: 'Healthy', allocations: [{ projectId: 1, projectName: 'NEOM Spine Tunnel Structural Design', allocationPercent: 50 }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilization();
  }, [token, apiUrl]);

  // Unique list of disciplines & departments for filters
  const disciplines = useMemo(() => ['', ...new Set(resources.map(r => r.discipline).filter(Boolean))], [resources]);
  const departments = useMemo(() => ['', ...new Set(resources.map(r => r.department).filter(Boolean))], [resources]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const matchDiscipline = !disciplineFilter || r.discipline === disciplineFilter;
      const matchDept = !departmentFilter || r.department === departmentFilter;
      const matchSearch = !searchQuery || 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.designation?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDiscipline && matchDept && matchSearch;
    });
  }, [resources, disciplineFilter, departmentFilter, searchQuery]);

  // Summary Metrics Card Calculations
  const stats = useMemo(() => {
    let overallocated = 0;
    let totalActiveAlloc = 0;
    let activeEngineersCount = 0;
    let availableFTECapacity = 0; // Sum of remaining capacity for non-overallocated staff

    filteredResources.forEach(r => {
      if (r.totalAllocation > 100) {
        overallocated++;
      }
      totalActiveAlloc += r.totalAllocation;
      if (r.totalAllocation > 0) {
        activeEngineersCount++;
      }
      
      // Calculate available margin
      if (r.totalAllocation < 100) {
        availableFTECapacity += (100 - r.totalAllocation);
      }
    });

    const avgUtil = filteredResources.length > 0 ? Math.round(totalActiveAlloc / filteredResources.length) : 0;

    return {
      overallocated,
      avgUtil,
      availableFTECapacity: Math.round(availableFTECapacity / 100) // Express in FTE count
    };
  }, [filteredResources]);

  // Heatmap months configuration starting from July 2026 (Demo lock)
  const heatmapMonths = [
    { key: 'Jul', label: 'Jul 2026', offset: 0 },
    { key: 'Aug', label: 'Aug 2026', offset: 1 },
    { key: 'Sep', label: 'Sep 2026', offset: 2 },
    { key: 'Oct', label: 'Oct 2026', offset: 3 },
    { key: 'Nov', label: 'Nov 2026', offset: 4 },
    { key: 'Dec', label: 'Dec 2026', offset: 5 }
  ];

  // Calculate allocation per month dynamically based on project durations
  const getResourceMonthlyAllocation = (resource, monthOffset) => {
    // Current locked date: July 2026
    const baseDate = new Date('2026-07-01');
    const targetMonth = new Date(baseDate.setMonth(baseDate.getMonth() + monthOffset));
    const targetYearVal = targetMonth.getFullYear();
    const targetMonthVal = targetMonth.getMonth(); // 0-11

    let sum = 0;
    if (resource.allocations) {
      resource.allocations.forEach(alloc => {
        if (!alloc.startDate || !alloc.endDate) return;
        const start = new Date(alloc.startDate);
        const end = new Date(alloc.endDate);

        // Check overlap
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        const endYear = end.getFullYear();
        const endMonth = end.getMonth();

        const startScore = startYear * 12 + startMonth;
        const endScore = endYear * 12 + endMonth;
        const targetScore = targetYearVal * 12 + targetMonthVal;

        if (targetScore >= startScore && targetScore <= endScore) {
          sum += alloc.allocationPercent;
        }
      });
    }
    return sum;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Specialist Allocation Heatmap"
        breadcrumbs={['PetroFlow', 'Specialist Heatmap']}
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Avg Utilization */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Avg Resource Utilization</span>
            <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
              {stats.avgUtil}%
            </span>
          </div>
        </div>

        {/* Overallocated */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Overallocated Specialists</span>
            <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
              {stats.overallocated} Employees
            </span>
          </div>
        </div>

        {/* Available Capacity */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Available Bench Capacity</span>
            <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
              ~ {stats.availableFTECapacity} FTEs free
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar & View Mode Toggle */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        {/* Toggle Mode */}
        <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800/80 w-full xl:w-auto shrink-0 justify-center sm:justify-start">
          <button
            onClick={() => setViewMode('heatmap')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'heatmap'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            Monthly Heatmap
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'chart'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Workload Chart
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, designation..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-accent"
            />
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[120px]"
          >
            <option value="">All Disciplines</option>
            {disciplines.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[130px]"
          >
            <option value="">All Departments</option>
            {departments.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[250px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : viewMode === 'heatmap' ? (
        /* Heatmap grid table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-x-auto select-none">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/10 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee / Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Total Active FTE</th>
                {heatmapMonths.map(m => (
                  <th key={m.key} className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredResources.map((res) => (
                <tr
                  key={res.id}
                  onClick={() => {
                    setSelectedResource(res);
                    setIsDrawerOpen(true);
                  }}
                  className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {res.avatarUrl ? (
                        <img
                          src={res.avatarUrl}
                          alt={res.name}
                          className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        />
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">
                          {res.name[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-850 dark:text-white leading-snug">{res.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{res.designation} | {res.discipline}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Total active workload */}
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-technical font-bold rounded ${
                      res.totalAllocation > 100 
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                        : res.totalAllocation >= 90
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                        : res.totalAllocation >= 40
                        ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {res.totalAllocation}%
                    </span>
                  </td>

                  {/* Monthly Heatmap columns */}
                  {heatmapMonths.map(m => {
                    const monthlyPct = getResourceMonthlyAllocation(res, m.offset);
                    return (
                      <td key={m.key} className="px-4 py-4 text-center">
                        <div className={`w-14 py-2 mx-auto rounded-lg text-xs font-technical font-bold select-none ${HeatmapColors(monthlyPct)}`}>
                          {monthlyPct > 0 ? `${monthlyPct}%` : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Recharts visual chart representation */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-6">FTE Allocation Matrix by Employee</h3>
          
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredResources}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 150]} unit="%" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#64748B' }} width={120} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                
                <Bar dataKey="totalAllocation" radius={[0, 4, 4, 0]} barSize={16}>
                  {filteredResources.map((entry, index) => {
                    let barColor = '#64748B'; // Gray (Underutilized)
                    if (entry.totalAllocation > 100) barColor = '#F43F5E'; // Red (Overallocated)
                    else if (entry.totalAllocation >= 90) barColor = '#F59E0B'; // Amber (Near Capacity)
                    else if (entry.totalAllocation >= 40) barColor = '#14B8A6'; // Teal (Healthy)
                    
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
                
                {/* Visual line at 100% capacity */}
                <ReferenceLine x={100} stroke="#EF4444" strokeDasharray="3 3" label={{ value: '100% FTE Limit', fill: '#EF4444', fontSize: 10, position: 'top' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detail breakdown Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Employee Workload Profile"
        footer={
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Close Profile
          </button>
        }
      >
        {selectedResource && (
          <div className="space-y-6 animate-fade-in">
            {/* Header details */}
            <div className="flex items-center gap-4">
              {selectedResource.avatarUrl ? (
                <img
                  src={selectedResource.avatarUrl}
                  alt={selectedResource.name}
                  className="w-14 h-14 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg">
                  {selectedResource.name[0]}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedResource.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{selectedResource.designation}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{selectedResource.department} | {selectedResource.discipline}</p>
              </div>
            </div>

            {/* Overall workload status card */}
            <div className="p-4 border rounded-xl flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-850 dark:border-slate-800">
              <div>
                <span className="text-slate-450 font-bold uppercase block mb-1">Utilization Status</span>
                <span className={`inline-flex px-2 py-0.5 font-bold rounded ${
                  selectedResource.totalAllocation > 100
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                    : selectedResource.totalAllocation >= 90
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                    : selectedResource.totalAllocation >= 40
                    ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {selectedResource.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-450 font-bold uppercase block mb-1">FTE Total Load</span>
                <span className="font-technical text-lg font-bold text-slate-850 dark:text-white">
                  {selectedResource.totalAllocation}%
                </span>
              </div>
            </div>

            {/* Active allocations breakdown list */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-500" />
                Active Engineering Contracts
              </h4>

              {selectedResource.allocations?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-3 text-center border rounded-xl border-dashed">
                  This specialist is currently unallocated (available capacity 100%).
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  {selectedResource.allocations.map(alloc => (
                    <div key={alloc.projectId} className="p-4 bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-850 dark:text-white hover:underline cursor-pointer" onClick={() => navigate(`/projects/${alloc.projectId}`)}>
                          {alloc.projectName}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Duration: {alloc.startDate} to {alloc.endDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-technical font-bold text-slate-900 dark:text-white block text-sm">
                          {alloc.allocationPercent}%
                        </span>
                        <span className="text-[9px] text-slate-450">FTE allocation</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Resources;
