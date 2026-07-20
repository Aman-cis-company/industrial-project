import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  Briefcase,
  Route,
  GitBranch,
  Settings as SettingsIcon,
  Radio,
  Shield,
  Clipboard,
  Activity,
  Plus,
  LayoutGrid,
  List,
  Search,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Percent
} from 'lucide-react';

export const CategoryConfig = {
  PipelineTransmission: { label: 'Pipeline Transmission', icon: Route, color: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30' },
  GatheringDistribution: { label: 'Gathering & Distribution', icon: GitBranch, color: 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30' },
  PumpValveTelemetry: { label: 'Pump & Valve Telemetry', icon: SettingsIcon, color: 'text-sky-600 border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-800/30' },
  LeakDetectionSensors: { label: 'Leak Detection & Sensors', icon: Radio, color: 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/30' },
  CathodicProtection: { label: 'Cathodic Protection', icon: Shield, color: 'text-teal-600 border-teal-200 bg-teal-50 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-800/30' },
  RegulatoryCompliance: { label: 'Regulatory & Compliance', icon: Clipboard, color: 'text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-800/30' }
};

const Projects = () => {
  const { token, apiUrl, user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
  // Drawer States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPhase, setFilterPhase] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPM, setFilterPM] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    clientName: '',
    serviceCategory: 'PipelineTransmission',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    currentPhase: 'Design',
    status: 'OnTrack',
    projectManagerId: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await fetch(`${apiUrl}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projData = await projRes.json();
      const empData = await empRes.json();

      if (projData.success) {
        setProjects(projData.data);
      }
      if (empData.success) {
        // Filter only PMs / Directors or all employees for PM pick
        setEmployees(empData.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Loading mock project database.');
      // Local seed fallback
      setProjects([
        { id: 1, name: 'GAIL Hazira-Vijaipur-Jagdishpur (HVJ) Pipeline Expansion', clientName: 'GAIL (India) Limited', serviceCategory: 'PipelineTransmission', description: 'Detailed expansion design of the major trunk line and control valves.', budget: 45000000.00, budgetSpent: 12500000.00, startDate: '2026-01-10', endDate: '2027-12-30', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 3, projectManager: { user: { name: 'Elena Rostova' } }, teamMembers: [{}, {}, {}, {}] },
        { id: 2, name: 'IOCL Koyali Refinery Chilled Loop Overhaul', clientName: 'Indian Oil Corporation (IOCL)', serviceCategory: 'PumpValveTelemetry', description: 'Upgrading the chilled water layout and refinery air processing blocks.', budget: 8400000.00, budgetSpent: 6200000.00, startDate: '2025-06-01', endDate: '2026-09-30', currentPhase: 'Execution', status: 'AtRisk', projectManagerId: 3, projectManager: { user: { name: 'Elena Rostova' } }, teamMembers: [{}, {}, {}] },
        { id: 3, name: 'ONGC KG Basin Subsea Grid Substation Integration', clientName: 'Oil and Natural Gas Corporation (ONGC)', serviceCategory: 'CathodicProtection', description: 'Concealed layout designs for remote underwater operations and corrosion safety.', budget: 18200000.00, budgetSpent: 14900000.00, startDate: '2025-08-15', endDate: '2026-11-20', currentPhase: 'Execution', status: 'Delayed', projectManagerId: 3, projectManager: { user: { name: 'Elena Rostova' } }, teamMembers: [{}, {}] },
        { id: 4, name: 'Chennai Minjur Desalination Plant Expansion Layout', clientName: 'Delhi Jal Board (DJB)', serviceCategory: 'GatheringDistribution', description: 'Desalination piping structural support layouts and gathering lines.', budget: 35000000.00, budgetSpent: 4200000.00, startDate: '2026-05-01', endDate: '2028-06-15', currentPhase: 'Design', status: 'OnTrack', projectManagerId: 4, projectManager: { user: { name: 'David Kojo' } }, teamMembers: [{}, {}] },
        { id: 5, name: 'Yamuna Action Plan Phase 3 Wastewater Plant', clientName: 'National Health Authority (NHA)', serviceCategory: 'RegulatoryCompliance', description: 'Activated biological sludge process engineering and safety compliance audits.', budget: 52000000.00, budgetSpent: 28300000.00, startDate: '2025-03-01', endDate: '2027-02-28', currentPhase: 'Execution', status: 'OnTrack', projectManagerId: 4, projectManager: { user: { name: 'David Kojo' } }, teamMembers: [{}, {}, {}] },
        { id: 6, name: 'DLF CyberCity Phase 3 Fire Mains Layout', clientName: 'DLF Limited', serviceCategory: 'LeakDetectionSensors', description: 'Detailed custom piping, leak sensors, and pressure safety bypass layouts.', budget: 6800000.00, budgetSpent: 2100000.00, startDate: '2026-02-01', endDate: '2026-12-15', currentPhase: 'Approval', status: 'OnTrack', projectManagerId: 6, projectManager: { user: { name: 'Chloe Dupont' } }, teamMembers: [{}, {}] }
      ]);
      setEmployees([
        { id: 3, user: { name: 'Elena Rostova' }, designation: 'Senior Project Manager' },
        { id: 4, user: { name: 'David Kojo' }, designation: 'Project Manager - Water' },
        { id: 5, user: { name: 'Liam Chen' }, designation: 'Project Manager - Healthcare' },
        { id: 6, user: { name: 'Chloe Dupont' }, designation: 'Design Manager' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, apiUrl]);

  // Unique Project Managers list for filters
  const projectManagers = useMemo(() => {
    const pms = projects.map(p => p.projectManager?.user?.name).filter(Boolean);
    return ['', ...new Set(pms)];
  }, [projects]);

  // Search & Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchCategory = !filterCategory || p.serviceCategory === filterCategory;
      const matchPhase = !filterPhase || p.currentPhase === filterPhase;
      const matchStatus = !filterStatus || p.status === filterStatus;
      const matchPM = !filterPM || p.projectManager?.user?.name === filterPM;
      const matchSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchPhase && matchStatus && matchPM && matchSearch;
    });
  }, [projects, searchQuery, filterCategory, filterPhase, filterStatus, filterPM]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    if (!formData.clientName.trim()) errors.clientName = 'Client name is required';
    if (!formData.budget || isNaN(formData.budget) || parseFloat(formData.budget) <= 0) {
      errors.budget = 'Valid budget is required';
    }
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (!formData.projectManagerId) errors.projectManagerId = 'Project Manager is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Form
  const openForm = (proj = null) => {
    setFormErrors({});
    if (proj) {
      setIsEditMode(true);
      setSelectedProject(proj);
      setFormData({
        name: proj.name,
        clientName: proj.clientName,
        serviceCategory: proj.serviceCategory,
        description: proj.description || '',
        budget: proj.budget,
        startDate: proj.startDate,
        endDate: proj.endDate,
        currentPhase: proj.currentPhase,
        status: proj.status,
        projectManagerId: proj.projectManagerId
      });
    } else {
      setIsEditMode(false);
      setSelectedProject(null);
      setFormData({
        name: '',
        clientName: '',
        serviceCategory: 'Buildings',
        description: '',
        budget: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
        currentPhase: 'Design',
        status: 'OnTrack',
        projectManagerId: employees[0]?.id || ''
      });
    }
    setIsFormOpen(true);
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = isEditMode ? `${apiUrl}/projects/${selectedProject.id}` : `${apiUrl}/projects`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          isEditMode ? 'Project details updated successfully' : 'Project registered successfully',
          'success'
        );
        fetchData();
        setIsFormOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Offline fallback
      const pManager = employees.find(e => e.id === Number(formData.projectManagerId));
      if (isEditMode) {
        setProjects(prev =>
          prev.map(p =>
            p.id === selectedProject.id
              ? {
                  ...p,
                  ...formData,
                  budget: parseFloat(formData.budget),
                  projectManager: { user: { name: pManager?.user?.name || 'Project Manager' } }
                }
              : p
          )
        );
        addToast('Project updated (Demo Cache)', 'success');
      } else {
        const newProj = {
          id: projects.length + 1,
          ...formData,
          budget: parseFloat(formData.budget),
          budgetSpent: 0,
          projectManager: { user: { name: pManager?.user?.name || 'Project Manager' } },
          teamMembers: []
        };
        setProjects([...projects, newProj]);
        addToast('Project created (Demo Cache)', 'success');
      }
      setIsFormOpen(false);
    }
  };

  // Delete project
  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/projects/${projectToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Project deleted successfully', 'success');
        fetchData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      addToast('Project removed (Demo)', 'error');
    }
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };

  // DataTable column structure
  const columns = [
    {
      header: 'Project / Client',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div
          className="cursor-pointer group"
          onClick={() => navigate(`/projects/${row.id}`)}
        >
          <p className="font-semibold text-slate-900 dark:text-white group-hover:underline leading-tight">
            {row.name}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{row.clientName}</p>
        </div>
      )
    },
    {
      header: 'Category / Domain',
      accessor: 'serviceCategory',
      sortable: true,
      render: (row) => {
        const cat = CategoryConfig[row.serviceCategory] || { label: row.serviceCategory, icon: Briefcase, color: '' };
        const Icon = cat.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cat.color}`}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {cat.label}
          </span>
        );
      }
    },
    {
      header: 'Current Phase',
      accessor: 'currentPhase',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/60 rounded">
          {row.currentPhase}
        </span>
      )
    },
    {
      header: 'Budget Performance (SAR)',
      accessor: 'budget',
      sortable: true,
      render: (row) => {
        const pct = row.budget > 0 ? Math.round((row.budgetSpent / row.budget) * 100) : 0;
        return (
          <div className="w-48 max-w-full">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 font-technical">
              <span>${Number(row.budgetSpent).toLocaleString()}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Project Lead',
      accessor: 'projectManagerId',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.projectManager?.user?.name || 'Unassigned PM'}
        </span>
      )
    },
    {
      header: 'Team Size',
      render: (row) => (
        <span className="text-xs font-technical font-bold text-slate-500 dark:text-slate-400">
          {row.teamMembers?.length || 0} members
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />
    }
  ];

  const actions = [
    {
      label: 'Open workspace',
      onClick: (row) => navigate(`/projects/${row.id}`)
    }
  ];

  if (currentUser?.role === 'Admin' || currentUser?.role === 'PMO Director') {
    actions.push(
      {
        label: 'Edit',
        onClick: (row) => openForm(row)
      },
      {
        label: 'Delete',
        danger: true,
        onClick: (row) => {
          setProjectToDelete(row);
          setIsDeleteModalOpen(true);
        }
      }
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pipeline PMO & Projects"
        breadcrumbs={['PetroFlow', 'Pipeline PMO & Projects']}
        action={
          currentUser?.role === 'Admin' || currentUser?.role === 'PMO Director'
            ? {
                label: 'Register Project',
                icon: Plus,
                onClick: () => openForm()
              }
            : null
        }
      />

      {/* Toggle mode, search, and filters */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        {/* Toggle Mode */}
        <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800/80 w-full xl:w-auto shrink-0 justify-center sm:justify-start">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Registry List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Visual Cards
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-100"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[110px]"
          >
            <option value="">All Services</option>
            {Object.keys(CategoryConfig).map(catKey => (
              <option key={catKey} value={catKey}>{CategoryConfig[catKey].label}</option>
            ))}
          </select>

          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[100px]"
          >
            <option value="">All Phases</option>
            <option value="Design">Design</option>
            <option value="Approval">Approval</option>
            <option value="Execution">Execution</option>
            <option value="Handover">Handover</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[100px]"
          >
            <option value="">All Statuses</option>
            <option value="OnTrack">On Track</option>
            <option value="AtRisk">At Risk</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filterPM}
            onChange={(e) => setFilterPM(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[120px]"
          >
            <option value="">All PMs</option>
            {projectManagers.filter(Boolean).map(pm => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredProjects}
          searchPlaceholder="Global registry search..."
          actions={actions}
          emptyStateTitle="No engineering contracts found"
          emptyStateDescription="Click 'Register Project' to map contract records."
        />
      ) : (
        /* Visual Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const cat = CategoryConfig[proj.serviceCategory] || { label: proj.serviceCategory, icon: Briefcase, color: '' };
            const CatIcon = cat.icon;
            const budgetPct = proj.budget > 0 ? Math.round((proj.budgetSpent / proj.budget) * 100) : 0;
            return (
              <div
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow space-y-4 relative flex flex-col justify-between"
              >
                <div>
                  {/* Category and status badge row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${cat.color}`}>
                      <CatIcon className="w-3.5 h-3.5 shrink-0" />
                      {cat.label}
                    </span>
                    <StatusBadge status={proj.status} />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mt-3 hover:underline line-clamp-2">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{proj.clientName}</p>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                    {proj.description || 'No project description loaded.'}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Phase & PM */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Phase: <strong className="font-semibold text-slate-650 dark:text-slate-300">{proj.currentPhase}</strong></span>
                    <span className="font-semibold text-slate-700 dark:text-slate-350 truncate max-w-[140px]">
                      PM: {proj.projectManager?.user?.name || 'Unassigned'}
                    </span>
                  </div>

                  {/* Budget Spent Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-450 dark:text-slate-550 font-technical">
                      <span>Spent: ${Number(proj.budgetSpent).toLocaleString()}</span>
                      <span>Total: ${Number(proj.budget).toLocaleString()} ({budgetPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          budgetPct > 90 ? 'bg-rose-500' : budgetPct > 75 ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${Math.min(budgetPct, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sliding Register Form Drawer */}
      <Drawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'Modify Project Parameters' : 'Register New Engineering Contract'}
        footer={
          <>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Save Project
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dhahran Central Substation Design"
              className={`w-full bg-white dark:bg-slate-800 border ${formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
            />
            {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Client / Organization *
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="e.g. Saudi Aramco"
              className={`w-full bg-white dark:bg-slate-800 border ${formErrors.clientName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
            />
            {formErrors.clientName && <p className="text-[10px] text-rose-500 mt-1">{formErrors.clientName}</p>}
          </div>

          {/* SERVICE CATEGORY VISUALLY DISTINCT ICON-GRID SELECTOR */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Engineering Service Category *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.keys(CategoryConfig).map((catKey) => {
                const cat = CategoryConfig[catKey];
                const Icon = cat.icon;
                const isSelected = formData.serviceCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setFormData({ ...formData, serviceCategory: catKey })}
                    className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1.5 transition-all select-none cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-[9px] font-bold tracking-tight uppercase leading-none break-words">
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Detailed Scope Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context and high-level milestones..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Contract Budget (SAR) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                  SAR
                </div>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="5000000"
                  className={`w-full bg-white dark:bg-slate-800 border ${formErrors.budget ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg pl-10 pr-3 py-2 text-sm text-slate-900 dark:text-white font-technical`}
                />
              </div>
              {formErrors.budget && <p className="text-[10px] text-rose-500 mt-1">{formErrors.budget}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Project Lead (PM) *
              </label>
              <select
                value={formData.projectManagerId}
                onChange={e => setFormData({ ...formData, projectManagerId: e.target.value })}
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.projectManagerId ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer`}
              >
                <option value="">Choose Project Manager</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} ({emp.designation})
                  </option>
                ))}
              </select>
              {formErrors.projectManagerId && <p className="text-[10px] text-rose-500 mt-1">{formErrors.projectManagerId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.startDate ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-technical`}
              />
              {formErrors.startDate && <p className="text-[10px] text-rose-500 mt-1">{formErrors.startDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                End Date (Contractual) *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.endDate ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-technical`}
              />
              {formErrors.endDate && <p className="text-[10px] text-rose-500 mt-1">{formErrors.endDate}</p>}
            </div>
          </div>

          {isEditMode && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Current Project Phase
                </label>
                <select
                  value={formData.currentPhase}
                  onChange={e => setFormData({ ...formData, currentPhase: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Design">Design</option>
                  <option value="Approval">Approval</option>
                  <option value="Execution">Execution</option>
                  <option value="Handover">Handover</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Status Indicator
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="OnTrack">🟢 On Track</option>
                  <option value="AtRisk">🟡 At Risk</option>
                  <option value="Delayed">🔴 Delayed</option>
                  <option value="Completed">🔵 Completed</option>
                </select>
              </div>
            </div>
          )}
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Project Contract Removal"
        footer={
          <>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Remove Project
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-slate-800 dark:text-slate-200 leading-normal">
            Are you sure you want to permanently delete the contract project{' '}
            <strong className="font-bold text-slate-900 dark:text-white">
              {projectToDelete?.name}
            </strong>
            ?
          </p>
          <p className="text-slate-450 dark:text-slate-500 text-xs">
            This will purge the contract record, remove all associated resource allocations, and delete linked tasks/risks from the PMO database.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
