import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import { TableSkeleton } from '../components/LoadingSkeleton';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone as PhoneIcon,
  Briefcase,
  Layers,
  Zap,
  Droplet,
  Palette,
  Heart,
  Network,
  List,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Calendar,
  Building,
  Check,
  Building2,
  UserCheck
} from 'lucide-react';

const DisciplineIcons = {
  Civil: Layers,
  MEP: Zap,
  BIM: Layers,
  WaterEnvironmental: Droplet,
  InteriorDesign: Palette,
  HealthcarePlanning: Heart
};

const DisciplineColors = {
  Civil: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30',
  MEP: 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/30',
  BIM: 'bg-teal-50 dark:bg-teal-950/20 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/30',
  WaterEnvironmental: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30',
  InteriorDesign: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/30',
  HealthcarePlanning: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
};

const EmployeeDirectory = () => {
  const { token, apiUrl, user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'chart'
  
  // Drawer & Modal States
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  
  // Filters State
  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Engineer',
    department: '',
    discipline: 'Civil',
    designation: '',
    reportingManagerId: '',
    phone: '',
    joinDate: '',
    availabilityStatus: 'Available'
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Employees List
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.warn('Backend connection failed, using offline fallback employee list.');
      // Local seed fallback for offline demonstration
      setEmployees([
        { id: 1, userId: 1, department: 'PMO & Administration', discipline: 'Civil', designation: 'Managing Director & HR Lead', phone: '+1-555-0100', joinDate: '2020-01-15', availabilityStatus: 'Available', user: { id: 1, name: 'Sarah Jenkins', email: 'admin@industrial-project.com', role: 'Admin', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }, reportingManager: null },
        { id: 2, userId: 2, department: 'PMO Office', discipline: 'Civil', designation: 'PMO Director', phone: '+1-555-0101', joinDate: '2021-03-01', availabilityStatus: 'Available', user: { id: 2, name: 'Marcus Vance', email: 'director@industrial-project.com', role: 'PMO Director', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }, reportingManager: { id: 1, user: { name: 'Sarah Jenkins' } } },
        { id: 3, userId: 3, department: 'Buildings & Structural Division', discipline: 'Civil', designation: 'Senior Project Manager', phone: '+1-555-0102', joinDate: '2022-05-10', availabilityStatus: 'Available', user: { id: 3, name: 'Elena Rostova', email: 'pm.buildings@industrial-project.com', role: 'Project Manager', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' }, reportingManager: { id: 2, user: { name: 'Marcus Vance' } } },
        { id: 4, userId: 4, department: 'Infrastructure & Hydrology Division', discipline: 'WaterEnvironmental', designation: 'Project Manager - Water Treatment', phone: '+1-555-0103', joinDate: '2022-08-15', availabilityStatus: 'Available', user: { id: 4, name: 'David Kojo', email: 'pm.water@industrial-project.com', role: 'Project Manager', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' }, reportingManager: { id: 2, user: { name: 'Marcus Vance' } } },
        { id: 5, userId: 5, department: 'Healthcare & Life Sciences Planning', discipline: 'HealthcarePlanning', designation: 'Project Manager - Medical Facilities', phone: '+1-555-0104', joinDate: '2023-01-20', availabilityStatus: 'Available', user: { id: 5, name: 'Liam Chen', email: 'pm.healthcare@industrial-project.com', role: 'Project Manager', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }, reportingManager: { id: 2, user: { name: 'Marcus Vance' } } },
        { id: 6, userId: 6, department: 'Interior Architecture & Design', discipline: 'InteriorDesign', designation: 'Design Manager', phone: '+1-555-0105', joinDate: '2023-04-12', availabilityStatus: 'Available', user: { id: 6, name: 'Chloe Dupont', email: 'pm.design@industrial-project.com', role: 'Project Manager', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' }, reportingManager: { id: 2, user: { name: 'Marcus Vance' } } },
        { id: 7, userId: 7, department: 'Buildings & Structural Division', discipline: 'MEP', designation: 'Lead Mechanical Engineer', phone: '+1-555-0113', joinDate: '2022-09-01', availabilityStatus: 'Available', user: { id: 7, name: 'Carlos Mendez', email: 'eng.mep@industrial-project.com', role: 'Engineer', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' }, reportingManager: { id: 3, user: { name: 'Elena Rostova' } } },
        { id: 8, userId: 8, department: 'BIM & Digital Twin Division', discipline: 'BIM', designation: 'BIM Coordinator', phone: '+1-555-0116', joinDate: '2022-12-15', availabilityStatus: 'Available', user: { id: 8, name: 'Priya Patel', email: 'eng.bim@industrial-project.com', role: 'Engineer', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' }, reportingManager: { id: 3, user: { name: 'Elena Rostova' } } },
        { id: 9, userId: 9, department: 'Infrastructure & Hydrology Division', discipline: 'WaterEnvironmental', designation: 'Lead Process Engineer', phone: '+1-555-0109', joinDate: '2023-07-22', availabilityStatus: 'Available', user: { id: 9, name: 'Aisha Diallo', email: 'aisha.diallo@industrial-project.com', role: 'Engineer', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150' }, reportingManager: { id: 4, user: { name: 'David Kojo' } } },
        { id: 10, userId: 10, department: 'Buildings & Structural Division', discipline: 'Civil', designation: 'Lead Structural Engineer', phone: '+1-555-0106', joinDate: '2023-06-01', availabilityStatus: 'Available', user: { id: 10, name: 'Mei Tanaka', email: 'mei.tanaka@industrial-project.com', role: 'Engineer', isActive: true, avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' }, reportingManager: { id: 3, user: { name: 'Elena Rostova' } } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token, apiUrl]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const deps = employees.map(e => e.department);
    return ['', ...new Set(deps)];
  }, [employees]);

  // Filter and Search logic (custom filtering before table slicing)
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchDiscipline = !selectedDiscipline || emp.discipline === selectedDiscipline;
      const matchDepartment = !selectedDepartment || emp.department === selectedDepartment;
      const matchAvailability = !selectedAvailability || emp.availabilityStatus === selectedAvailability;
      
      const matchSearch = !searchQuery || 
        emp.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDiscipline && matchDepartment && matchAvailability && matchSearch;
    });
  }, [employees, selectedDiscipline, selectedDepartment, selectedAvailability, searchQuery]);

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!isEditMode && !formData.password) errors.password = 'Password is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.designation.trim()) errors.designation = 'Designation is required';
    if (!formData.joinDate) errors.joinDate = 'Join date is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Form Drawer
  const openForm = (emp = null) => {
    setFormErrors({});
    if (emp) {
      setIsEditMode(true);
      setSelectedEmployee(emp);
      setFormData({
        name: emp.user?.name || '',
        email: emp.user?.email || '',
        password: '', // Leave blank for edit
        role: emp.user?.role || 'Engineer',
        department: emp.department || '',
        discipline: emp.discipline || 'Civil',
        designation: emp.designation || '',
        reportingManagerId: emp.reportingManagerId || '',
        phone: emp.phone || '',
        joinDate: emp.joinDate || '',
        availabilityStatus: emp.availabilityStatus || 'Available'
      });
    } else {
      setIsEditMode(false);
      setSelectedEmployee(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Engineer',
        department: '',
        discipline: 'Civil',
        designation: '',
        reportingManagerId: '',
        phone: '',
        joinDate: new Date().toISOString().split('T')[0],
        availabilityStatus: 'Available'
      });
    }
    setIsFormDrawerOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = isEditMode ? `${apiUrl}/employees/${selectedEmployee.id}` : `${apiUrl}/employees`;
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
          isEditMode ? 'Employee profile updated successfully' : 'Employee registered successfully',
          'success'
        );
        fetchEmployees();
        setIsFormDrawerOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Offline fallback mock creation/edit
      if (isEditMode) {
        setEmployees(prev =>
          prev.map(e =>
            e.id === selectedEmployee.id
              ? {
                  ...e,
                  department: formData.department,
                  discipline: formData.discipline,
                  designation: formData.designation,
                  phone: formData.phone,
                  joinDate: formData.joinDate,
                  availabilityStatus: formData.availabilityStatus,
                  reportingManagerId: formData.reportingManagerId ? Number(formData.reportingManagerId) : null,
                  reportingManager: formData.reportingManagerId
                    ? { user: { name: employees.find(m => m.id === Number(formData.reportingManagerId))?.user?.name || 'Manager' } }
                    : null,
                  user: {
                    ...e.user,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                  }
                }
              : e
          )
        );
        addToast('Profile updated (Local Cache Demo Mode)', 'success');
      } else {
        const newId = employees.length + 1;
        const newEmpObj = {
          id: newId,
          department: formData.department,
          discipline: formData.discipline,
          designation: formData.designation,
          phone: formData.phone,
          joinDate: formData.joinDate,
          availabilityStatus: formData.availabilityStatus,
          reportingManagerId: formData.reportingManagerId ? Number(formData.reportingManagerId) : null,
          reportingManager: formData.reportingManagerId
            ? { user: { name: employees.find(m => m.id === Number(formData.reportingManagerId))?.user?.name || 'Manager' } }
            : null,
          user: {
            id: newId + 100,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            isActive: true,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D8488&color=fff`
          }
        };
        setEmployees([...employees, newEmpObj]);
        addToast('Employee added (Local Cache Demo Mode)', 'success');
      }
      setIsFormDrawerOpen(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/employees/${employeeToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Employee removed successfully', 'success');
        fetchEmployees();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setEmployees(prev => prev.filter(e => e.id !== employeeToDelete.id));
      addToast('Employee profile removed (Demo)', 'error');
    }
    setIsDeleteModalOpen(false);
    setEmployeeToDelete(null);
  };

  // DataTable column structure
  const columns = [
    {
      header: 'Employee Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setSelectedEmployee(row);
            setIsDetailDrawerOpen(true);
          }}
        >
          {row.user?.avatarUrl ? (
            <img
              src={row.user.avatarUrl}
              alt={row.user.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-sm">
              {row.user?.name ? row.user.name.split(' ').map(n=>n[0]).join('').slice(0, 2) : 'EM'}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight hover:underline">
              {row.user?.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{row.user?.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Discipline',
      accessor: 'discipline',
      sortable: true,
      render: (row) => {
        const Icon = DisciplineIcons[row.discipline] || Layers;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${DisciplineColors[row.discipline] || ''}`}>
            <Icon className="w-3.5 h-3.5" />
            {row.discipline === 'WaterEnvironmental' ? 'Water/Env' : row.discipline === 'HealthcarePlanning' ? 'Healthcare' : row.discipline === 'InteriorDesign' ? 'Interiors' : row.discipline}
          </span>
        );
      }
    },
    {
      header: 'Department',
      accessor: 'department',
      sortable: true,
      render: (row) => <span className="font-medium text-xs">{row.department}</span>
    },
    {
      header: 'Designation / Role',
      accessor: 'designation',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-250 text-xs">{row.designation}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{row.user?.role}</p>
        </div>
      )
    },
    {
      header: 'Reports To',
      accessor: 'reportingManagerId',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          {row.reportingManager?.user?.name || 'Managing Board'}
        </span>
      )
    },
    {
      header: 'Availability',
      accessor: 'availabilityStatus',
      sortable: true,
      render: (row) => <StatusBadge status={row.availabilityStatus} />
    }
  ];

  const actions = [];
  // Only Admin or PMO Director can perform actions on employees
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
          setEmployeeToDelete(row);
          setIsDeleteModalOpen(true);
        }
      }
    );
  }

  // -------------------------------------------------------------
  // Org Chart View Logic (Custom interactive structural tree)
  // -------------------------------------------------------------
  const buildHierarchyTree = (allEmps) => {
    // Index map
    const map = {};
    const roots = [];

    allEmps.forEach(e => {
      map[e.id] = { ...e, children: [] };
    });

    allEmps.forEach(e => {
      const empNode = map[e.id];
      if (e.reportingManagerId && map[e.reportingManagerId]) {
        map[e.reportingManagerId].children.push(empNode);
      } else {
        roots.push(empNode);
      }
    });

    return roots;
  };

  const rootsList = useMemo(() => buildHierarchyTree(employees), [employees]);

  const OrgNode = ({ node }) => {
    const [collapsed, setCollapsed] = useState(false);
    const Icon = DisciplineIcons[node.discipline] || Layers;

    return (
      <div className="flex flex-col items-center">
        {/* User Card */}
        <div
          onClick={() => {
            setSelectedEmployee(node);
            setIsDetailDrawerOpen(true);
          }}
          className="w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer hover:border-teal-500/50 transition-all text-center relative"
        >
          {node.user?.avatarUrl ? (
            <img
              src={node.user.avatarUrl}
              alt={node.user.name}
              className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-slate-200 dark:border-slate-800"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-base mx-auto">
              {node.user?.name ? node.user.name.split(' ').map(n=>n[0]).join('').slice(0, 2) : 'EM'}
            </div>
          )}
          <h4 className="font-bold text-slate-850 dark:text-white mt-3 text-sm truncate leading-tight">
            {node.user?.name}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {node.designation}
          </p>
          <div className="flex justify-center gap-1.5 mt-2.5">
            <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold rounded-full ${DisciplineColors[node.discipline] || ''}`}>
              {node.discipline}
            </span>
            <span className="scale-75 origin-center">
              <StatusBadge status={node.availabilityStatus} />
            </span>
          </div>
        </div>

        {/* Child toggler and child connector lines */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
              className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center shadow-xs -mt-2.5 z-10 cursor-pointer transition-colors"
            >
              {collapsed ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3 rotate-180" />
              )}
            </button>

            {!collapsed && (
              <div className="flex flex-col items-center w-full mt-4">
                <div className="relative flex justify-center w-full">
                  {/* Horizontal joining branch line */}
                  {node.children.length > 1 && (
                    <div className="absolute top-0 h-px bg-slate-350 dark:bg-slate-700 w-[calc(100%-14rem)]"></div>
                  )}
                </div>
                <div className="flex gap-8 justify-center pt-4">
                  {node.children.map(child => (
                    <div key={child.id} className="relative flex flex-col items-center">
                      {/* Vertical line pointing into child */}
                      <div className="absolute -top-4 w-px h-4 bg-slate-350 dark:bg-slate-700"></div>
                      <OrgNode node={child} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Resources & Employee Directory"
        breadcrumbs={['AeroPMO', 'Resources & Team']}
        action={
          currentUser?.role === 'Admin' || currentUser?.role === 'PMO Director'
            ? {
                label: 'Add Employee',
                icon: Plus,
                onClick: () => openForm()
              }
            : null
        }
      />

      {/* Mode Select Tabs & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Toggle Mode */}
        <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800/80">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold select-none transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Directory Grid
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold select-none transition-colors cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            Hierarchy Org Chart
          </button>
        </div>

        {/* Filter bar (Only for directory list mode) */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer min-w-[120px]"
            >
              <option value="">All Disciplines</option>
              <option value="Civil">Civil</option>
              <option value="MEP">MEP</option>
              <option value="BIM">BIM</option>
              <option value="WaterEnvironmental">Water & Environmental</option>
              <option value="InteriorDesign">Interior Design</option>
              <option value="HealthcarePlanning">Healthcare Planning</option>
            </select>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer min-w-[120px]"
            >
              <option value="">All Departments</option>
              {departments.filter(Boolean).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer min-w-[120px]"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="OnLeave">On Leave</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredEmployees}
          searchPlaceholder="Search by name, email, designation..."
          actions={actions}
          emptyStateTitle="No Employees Found"
          emptyStateDescription="Verify your filter combinations or add a new employee profile to database."
        />
      ) : (
        /* Visual Org Chart Area */
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 overflow-auto min-h-[500px] shadow-sm flex flex-col items-center">
          <div className="mb-8 text-center max-w-md">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Engineering Org Chart</h3>
            <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">
              Reporting trees dynamically compiled from employee data. Click nodes to examine details.
            </p>
          </div>
          
          <div className="flex gap-16 justify-center">
            {rootsList.map(root => (
              <OrgNode key={root.id} node={root} />
            ))}
          </div>
        </div>
      )}

      {/* Employee Detail Drawer */}
      <Drawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title="Employee Technical Dossier"
        footer={
          <>
            <button
              onClick={() => setIsDetailDrawerOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Close Dossier
            </button>
            {(currentUser?.role === 'Admin' || currentUser?.role === 'PMO Director') && (
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  openForm(selectedEmployee);
                }}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </>
        }
      >
        {selectedEmployee && (
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl">
              {selectedEmployee.user?.avatarUrl ? (
                <img
                  src={selectedEmployee.user.avatarUrl}
                  alt={selectedEmployee.user.name}
                  className="w-16 h-16 rounded-full object-cover border border-slate-300 dark:border-slate-800"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-2xl">
                  {selectedEmployee.user?.name ? selectedEmployee.user.name.split(' ').map(n=>n[0]).join('').slice(0, 2) : 'EM'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {selectedEmployee.user?.name}
                </h3>
                <p className="text-sm font-medium text-slate-550 dark:text-slate-400 mt-1">
                  {selectedEmployee.designation}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${DisciplineColors[selectedEmployee.discipline] || ''}`}>
                    {selectedEmployee.discipline} Division
                  </span>
                  <StatusBadge status={selectedEmployee.availabilityStatus} />
                </div>
              </div>
            </div>

            {/* Profile Contact info card */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Contact & Affiliation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Technical Email</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{selectedEmployee.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <PhoneIcon className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone Extension</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.phone || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Building className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Join Date</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reporting relations section */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Reporting Architecture</h4>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">Direct Manager:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedEmployee.reportingManager?.user?.name || 'Managing Director'}
                  </span>
                </div>
                {selectedEmployee.directReports && selectedEmployee.directReports.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block mb-2">Direct Reports ({selectedEmployee.directReports.length}):</span>
                    <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
                      {selectedEmployee.directReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-center justify-between text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-md"
                        >
                          <span className="font-semibold text-slate-700 dark:text-slate-350">{report.user?.name}</span>
                          <span className="text-[10px] text-slate-400">{report.designation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Assignments placeholder */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Active Project Engagements</h4>
              <div className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-100 dark:border-slate-850/80 text-center text-xs text-slate-400 dark:text-slate-500 py-6">
                Active project assignments will load from Module 2 (Projects Register) sync integrations.
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Add / Edit Form Drawer */}
      <Drawer
        isOpen={isFormDrawerOpen}
        onClose={() => setIsFormDrawerOpen(false)}
        title={isEditMode ? 'Modify Employee Technical Profile' : 'Register New Employee Account'}
        footer={
          <>
            <button
              onClick={() => setIsFormDrawerOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Save Profile
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 pb-1.5 border-b border-slate-100 dark:border-slate-800">
              Account Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
              />
              {formErrors.name && <p className="text-[10px] text-rose-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Technical Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@industrial-project.com"
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
              />
              {formErrors.email && <p className="text-[10px] text-rose-500 mt-1">{formErrors.email}</p>}
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Initial Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
              />
              {formErrors.password && <p className="text-[10px] text-rose-500 mt-1">{formErrors.password}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Engineer">Engineer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="PMO Director">PMO Director</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Discipline Division
              </label>
              <select
                value={formData.discipline}
                onChange={e => setFormData({ ...formData, discipline: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Civil">🏗️ Civil / Structural</option>
                <option value="MEP">⚡ MEP & Power Systems</option>
                <option value="BIM">⚙️ BIM & Digital Twins</option>
                <option value="WaterEnvironmental">💧 Water & Environmental</option>
                <option value="InteriorDesign">🎨 Interior Design</option>
                <option value="HealthcarePlanning">🏥 Healthcare Planning</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase text-teal-600 dark:text-teal-400 pb-1.5 pt-3 border-b border-slate-100 dark:border-slate-800">
              Department & Position Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Designation / Title *
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Lead Concrete Specialist"
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.designation ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
              />
              {formErrors.designation && <p className="text-[10px] text-rose-500 mt-1">{formErrors.designation}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Department Name *
              </label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Buildings Division"
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.department ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white`}
              />
              {formErrors.department && <p className="text-[10px] text-rose-500 mt-1">{formErrors.department}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Reporting Manager
              </label>
              <select
                value={formData.reportingManagerId}
                onChange={e => setFormData({ ...formData, reportingManagerId: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">No Manager (MD Level)</option>
                {employees
                  .filter(e => !selectedEmployee || e.id !== selectedEmployee.id) // Avoid self-reporting
                  .map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user?.name} ({emp.designation})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Phone extension
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-01XX"
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-technical"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Join Date *
              </label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={e => setFormData({ ...formData, joinDate: e.target.value })}
                className={`w-full bg-white dark:bg-slate-800 border ${formErrors.joinDate ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-technical`}
              />
              {formErrors.joinDate && <p className="text-[10px] text-rose-500 mt-1">{formErrors.joinDate}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Availability Status
              </label>
              <select
                value={formData.availabilityStatus}
                onChange={e => setFormData({ ...formData, availabilityStatus: e.target.value })}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Available">🟢 Available</option>
                <option value="Busy">🟡 Busy</option>
                <option value="OnLeave">🔴 On Leave</option>
              </select>
            </div>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Employee Record Deletion"
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
              Confirm Delete
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <p className="text-slate-800 dark:text-slate-200 leading-normal">
            Are you sure you want to permanently delete the profile for{' '}
            <strong className="font-bold text-slate-900 dark:text-white">
              {employeeToDelete?.user?.name}
            </strong>
            ?
          </p>
          <p className="text-slate-450 dark:text-slate-500 text-xs">
            This action will remove the Employee profile and delete their User credentials. They will no longer be able to log in to the PMO platform.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeDirectory;
