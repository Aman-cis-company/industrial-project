import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import DataTable from '../components/DataTable';
import { CategoryConfig } from './Projects';
import { getFileIcon } from './Documents';
import {
  Briefcase,
  Users,
  CheckSquare,
  FileText,
  AlertTriangle,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Building,
  ArrowLeft,
  ChevronRight,
  UserPlus,
  Layers,
  Sparkles,
  Play,
  CheckCircle,
  HelpCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Columns,
  List,
  Edit2,
  Grid,
  Download,
  UploadCloud,
  FileUp,
  Sliders,
  ShieldCheck,
  Award,
  GitCommit
} from 'lucide-react';

const TaskPriorityColors = {
  Low: 'border-l-4 border-l-slate-400',
  Medium: 'border-l-4 border-l-amber-500',
  High: 'border-l-4 border-l-rose-500'
};

const MilestoneColors = {
  Achieved: 'bg-emerald-500 text-white ring-4 ring-emerald-500/10',
  Upcoming: 'bg-amber-500 text-white ring-4 ring-amber-500/10',
  Missed: 'bg-rose-500 text-white ring-4 ring-rose-500/10'
};

const ScoreColors = (score) => {
  if (score >= 15) return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100';
  if (score >= 8) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100';
  return 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100';
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, apiUrl, user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Tasks views
  const [taskViewMode, setTaskViewMode] = useState('kanban'); 
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // DMS views
  const [docViewMode, setDocViewMode] = useState('list'); 
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDocDrawerOpen, setIsDocDrawerOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // DMS Upload Drag Zone
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    discipline: 'General',
    description: ''
  });
  const [uploading, setUploading] = useState(false);

  // DMS Filters
  const [docSearch, setDocSearch] = useState('');
  const [docDisciplineFilter, setDocDisciplineFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  // Risks & Compliance (Module 7)
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [isAddRiskOpen, setIsAddRiskOpen] = useState(false);
  const [newRiskData, setNewRiskData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    probability: 3,
    impact: 3,
    mitigationPlan: '',
    ownerId: '',
    identifiedDate: new Date().toISOString().split('T')[0]
  });

  // Assign Team Member Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    roleOnProject: '',
    allocationPercent: 100
  });

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    clientName: '',
    serviceCategory: '',
    description: '',
    budget: '',
    currentPhase: '',
    status: ''
  });

  // Task Form State
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    priority: 'Medium',
    phase: 'Design'
  });

  const [taskErrors, setTaskErrors] = useState({});

  // Fetch Project Details
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projRes = await fetch(`${apiUrl}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const projData = await projRes.json();
      const empData = await empRes.json();

      if (projData.success) {
        setProject(projData.data);
        setEditFormData({
          name: projData.data.name,
          clientName: projData.data.clientName,
          serviceCategory: projData.data.serviceCategory,
          description: projData.data.description || '',
          budget: projData.data.budget,
          currentPhase: projData.data.currentPhase,
          status: projData.data.status
        });
      }
      if (empData.success) {
        setEmployees(empData.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Fetching project from mock directory.');
      // Local seed fallbacks
      const mockProjectsList = [
        { 
          id: 1, 
          name: 'NEOM Spine Tunnel Structural Design', 
          clientName: 'NEOM Authority', 
          serviceCategory: 'Buildings', 
          description: 'Detailed structural design and load analysis for the deep structural concrete tunnel segments under the central Spine infrastructure.', 
          budget: 45000000.00, 
          budgetSpent: 12500000.00, 
          startDate: '2026-01-10', 
          endDate: '2027-12-30', 
          currentPhase: 'Execution', 
          status: 'OnTrack', 
          projectManager: { user: { name: 'Elena Rostova', email: 'pm.buildings@industrial-project.com' } },
          tasks: [],
          milestones: [],
          documents: [],
          risks: [],
          complianceItems: [],
          approvalWorkflows: [],
          team: []
        }
      ];
      
      const found = mockProjectsList.find(p => p.id === Number(id)) || mockProjectsList[0];
      
      // Seed mock employees & team assignments
      const mockTeam = [
        { id: 1, employeeId: 7, roleOnProject: 'Lead MEP Liaison', allocationPercent: 25, employee: { id: 7, user: { name: 'Carlos Mendez', email: 'eng.mep@industrial-project.com' } } },
        { id: 2, employeeId: 8, roleOnProject: 'Lead BIM Coordinator', allocationPercent: 50, employee: { id: 8, user: { name: 'Priya Patel', email: 'eng.bim@industrial-project.com' } } },
        { id: 3, employeeId: 10, roleOnProject: 'Lead Structural Engineer', allocationPercent: 100, employee: { id: 10, user: { name: 'Mei Tanaka', email: 'mei.tanaka@industrial-project.com' } } }
      ];

      const mockTasks = [
        { id: 101, title: 'BIM Model Clash Detection Review', description: 'Perform conflict checking.', assigneeId: 8, dueDate: '2026-07-25', priority: 'High', status: 'InProgress', phase: 'Design', assignee: mockTeam[1].employee },
        { id: 102, title: 'Foundation Load Analysis Report', description: 'Compute loading limits.', assigneeId: 10, dueDate: '2026-06-15', priority: 'High', status: 'Done', phase: 'Design', assignee: mockTeam[2].employee }
      ];

      const mockMilestones = [
        { id: 1, title: 'Initial Design Sign-off', targetDate: '2026-02-15', status: 'Achieved' },
        { id: 2, title: 'Subcontractor Mobilization', targetDate: '2026-07-01', status: 'Achieved' }
      ];

      const mockDocuments = [
        { id: 201, fileName: 'NEOM_Spine_Design_Criteria.pdf', fileType: 'pdf', filePath: '#', version: 1, discipline: 'General', description: 'Primary design bounds.', fileSizeKB: 1450, uploadedAt: '2026-07-02T10:00:00.000Z', uploader: { designation: 'PM', user: { name: 'Elena Rostova' } } }
      ];

      const mockRisks = [
        { id: 1, title: 'Structural deflection due to excavation weight shifts', description: 'Subsurface density variations.', category: 'Technical', probability: 3, impact: 4, riskScore: 12, status: 'Open', mitigationPlan: 'Perform continuous load balancing using spatial sensors.', ownerId: 10, identifiedDate: '2026-02-10', owner: { user: { name: 'Mei Tanaka' } } }
      ];

      const mockCompliance = [
        { id: 1, requirementName: 'Municipality Construction License', applicableServiceCategory: 'Buildings', status: 'Compliant', dueDate: '2026-05-15', notes: 'Expedited approval secured.', projectId: 1 }
      ];

      const mockWorkflows = [
        {
          id: 1,
          name: 'NEOM Spine Phase Transition Gate: Design ➔ Approval',
          phaseTrigger: 'Design→Approval',
          status: 'Approved',
          steps: [
            { id: 10, stepOrder: 1, approverRole: 'Project Manager', status: 'Approved', comments: 'Structural canopy loading calculations verified.', actionedAt: '2026-07-15T10:00:00.000Z', approverUser: { name: 'Elena Rostova' } },
            { id: 11, stepOrder: 2, approverRole: 'PMO Director', status: 'Approved', comments: 'Phase sign-off approved. Moving contract budget locks.', actionedAt: '2026-07-16T14:30:00.000Z', approverUser: { name: 'Marcus Vance' } }
          ]
        }
      ];

      found.team = mockTeam;
      found.tasks = mockTasks;
      found.milestones = mockMilestones;
      found.documents = mockDocuments;
      found.risks = mockRisks;
      found.complianceItems = mockCompliance;
      found.approvalWorkflows = mockWorkflows;
      setProject(found);

      setEmployees([
        { id: 7, user: { name: 'Carlos Mendez', email: 'eng.mep@industrial-project.com' }, designation: 'Lead Mechanical Engineer', department: 'Buildings Division', discipline: 'MEP' },
        { id: 8, user: { name: 'Priya Patel', email: 'eng.bim@industrial-project.com' }, designation: 'BIM Coordinator', department: 'BIM Division', discipline: 'BIM' },
        { id: 10, user: { name: 'Mei Tanaka', email: 'mei.tanaka@industrial-project.com' }, designation: 'Lead Structural Engineer', department: 'Buildings Division', discipline: 'Civil' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [aiSummary, setAiSummary] = useState('');
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const fetchAiSummary = async () => {
    try {
      setLoadingAiSummary(true);
      const res = await fetch(`${apiUrl}/ai/executive-summary/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAiSummary(data.summary);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const localBudgetRatio = project ? Math.round((parseFloat(project.budgetSpent || 0) / parseFloat(project.budget || 1)) * 100) : 0;
      setAiSummary(`The **${project?.name || 'contract'}** for **${project?.clientName || 'our client'}** is currently in the **${project?.currentPhase || 'Design'}** phase and is flagged as **${project?.status || 'OnTrack'}**. Budget burn is running at **${localBudgetRatio}%** control, which is well within design safety bounds. Engineering team deliverables are aligned, and the initial Design gate transition has been signed off.`);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id, token, apiUrl]);

  useEffect(() => {
    if (project && !aiSummary) {
      fetchAiSummary();
    }
  }, [project]);

  // Edit Project Details Submit
  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Project scope updated', 'success');
        fetchProjectDetails();
        setIsEditProjectOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProject(prev => ({
        ...prev,
        ...editFormData,
        budget: parseFloat(editFormData.budget)
      }));
      addToast('Project details updated (Demo)', 'success');
      setIsEditProjectOpen(false);
    }
  };

  // Team Member Assignment Handler
  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignForm.employeeId || !assignForm.roleOnProject) {
      addToast('Please fill in all team assignment fields', 'warning');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/projects/${id}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(assignForm)
      });
      const data = await res.json();
      if (data.success) {
        addToast('Resource assigned to project team', 'success');
        fetchProjectDetails();
        setIsAssignModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const empObj = employees.find(e => e.id === Number(assignForm.employeeId));
      const existingMemberIdx = project.team.findIndex(m => m.employeeId === Number(assignForm.employeeId));
      
      if (existingMemberIdx > -1) {
        const updatedTeam = [...project.team];
        updatedTeam[existingMemberIdx].roleOnProject = assignForm.roleOnProject;
        updatedTeam[existingMemberIdx].allocationPercent = Number(assignForm.allocationPercent);
        setProject({ ...project, team: updatedTeam });
      } else {
        const newMember = {
          id: project.team.length + 1,
          employeeId: Number(assignForm.employeeId),
          roleOnProject: assignForm.roleOnProject,
          allocationPercent: Number(assignForm.allocationPercent),
          employee: {
            id: Number(assignForm.employeeId),
            user: {
              name: empObj?.user?.name || 'Assigned Specialist',
              email: empObj?.user?.email || 'specialist@industrial-project.com'
            }
          }
        };
        setProject({ ...project, team: [...project.team, newMember] });
      }
      addToast('Resource assigned (Demo Local Cache)', 'success');
      setIsAssignModalOpen(false);
    }
  };

  // Team Member Delete Handler
  const handleUnassignMember = async (employeeId) => {
    try {
      const res = await fetch(`${apiUrl}/projects/${id}/team/${employeeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Resource unassigned successfully', 'success');
        fetchProjectDetails();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProject({
        ...project,
        team: project.team.filter(m => m.employeeId !== employeeId)
      });
      addToast('Resource unassigned (Demo)', 'error');
    }
  };

  // -------------------------------------------------------------
  // Task Actions
  // -------------------------------------------------------------

  const validateTaskForm = () => {
    const errors = {};
    if (!newTaskData.title.trim()) errors.title = 'Title is required';
    if (!newTaskData.dueDate) errors.dueDate = 'Due date is required';
    if (!newTaskData.assigneeId) errors.assigneeId = 'Assignee is required';
    setTaskErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    try {
      const res = await fetch(`${apiUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newTaskData,
          projectId: project.id,
          status: 'NotStarted'
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task registered successfully', 'success');
        fetchProjectDetails();
        setIsAddTaskOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const assigneeObj = project.team.find(m => m.employeeId === Number(newTaskData.assigneeId))?.employee;
      const newTaskVal = {
        id: project.tasks.length + 101,
        ...newTaskData,
        status: 'NotStarted',
        assignee: assigneeObj || { user: { name: 'Firm Engineer' } }
      };
      setProject({
        ...project,
        tasks: [...project.tasks, newTaskVal]
      });
      addToast('Task registered (Demo Cache)', 'success');
      setIsAddTaskOpen(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
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
        addToast('Task status updated', 'success');
        fetchProjectDetails();
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(prev => ({ ...prev, status: nextStatus }));
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      }));
      addToast('Task status updated (Demo)', 'success');
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: nextStatus }));
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Task removed', 'success');
        fetchProjectDetails();
        setIsTaskDrawerOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProject(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      addToast('Task removed (Demo)', 'error');
      setIsTaskDrawerOpen(false);
    }
  };

  // -------------------------------------------------------------
  // DMS Upload Zone Handlers
  // -------------------------------------------------------------

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleDocumentUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      addToast('Please drop or select a file to upload', 'warning');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('projectId', project.id);
      formData.append('discipline', uploadForm.discipline);
      formData.append('description', uploadForm.description);

      const res = await fetch(`${apiUrl}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        addToast('Document uploaded successfully', 'success');
        fetchProjectDetails();
        setUploadedFile(null);
        setUploadForm({ discipline: 'General', description: '' });
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const ext = uploadedFile.name.split('.').pop() || 'pdf';
      const maxId = project.documents.reduce((max, d) => d.id > max ? d.id : max, 200);
      
      const newDoc = {
        id: maxId + 1,
        fileName: uploadedFile.name,
        fileType: ext,
        filePath: '#',
        version: 1,
        uploadedAt: new Date().toISOString(),
        discipline: uploadForm.discipline,
        description: uploadForm.description || 'Uploaded document blueprint',
        fileSizeKB: Math.round(uploadedFile.size / 1024),
        uploader: { designation: 'Technical Staff', user: { name: currentUser?.name || 'Staff' } }
      };

      const matchingDocs = project.documents.filter(d => d.fileName.toLowerCase() === uploadedFile.name.toLowerCase());
      if (matchingDocs.length > 0) {
        const latestVer = matchingDocs.reduce((max, d) => d.version > max ? d.version : max, 0);
        newDoc.version = latestVer + 1;
      }

      setProject(prev => ({
        ...prev,
        documents: [newDoc, ...prev.documents]
      }));

      addToast('File uploaded (Demo Local Cache)', 'success');
      setUploadedFile(null);
      setUploadForm({ discipline: 'General', description: '' });
    } finally {
      setUploading(false);
    }
  };

  const openDocHistoryDrawer = async (doc) => {
    setSelectedDoc(doc);
    setIsDocDrawerOpen(true);
    try {
      setLoadingHistory(true);
      const res = await fetch(`${apiUrl}/documents/${doc.id}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVersionHistory(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setVersionHistory([
        { id: doc.id, version: doc.version, uploadedAt: doc.uploadedAt, fileSizeKB: doc.fileSizeKB, uploader: doc.uploader, filePath: doc.filePath },
        ...(doc.version > 1 ? Array.from({ length: doc.version - 1 }).map((_, i) => ({
          id: doc.id - i - 1,
          version: doc.version - i - 1,
          uploadedAt: new Date(new Date(doc.uploadedAt).getTime() - (i+1)*24*60*60*1000).toISOString(),
          fileSizeKB: Math.round(doc.fileSizeKB * 0.9),
          uploader: doc.uploader,
          filePath: '#'
        })) : [])
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // -------------------------------------------------------------
  // Risks & Compliance Actions (Module 7)
  // -------------------------------------------------------------

  const handleAddRiskSubmit = async (e) => {
    e.preventDefault();
    if (!newRiskData.title.trim()) {
      addToast('Please enter a risk title', 'warning');
      return;
    }
    if (!newRiskData.ownerId) {
      addToast('Please select a risk owner', 'warning');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/risks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newRiskData,
          projectId: project.id
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Risk committed to register', 'success');
        fetchProjectDetails();
        setIsAddRiskOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const ownerObj = project.team.find(m => m.employeeId === Number(newRiskData.ownerId))?.employee;
      const score = Number(newRiskData.probability) * Number(newRiskData.impact);
      const newRisk = {
        id: (project.risks?.length || 0) + 101,
        ...newRiskData,
        riskScore: score,
        status: 'Open',
        owner: ownerObj || { user: { name: 'Division Engineer' } }
      };

      setProject(prev => ({
        ...prev,
        risks: [...(prev.risks || []), newRisk]
      }));

      addToast('Risk committed (Demo Local Cache)', 'success');
      setIsAddRiskOpen(false);
    }
  };

  const handleUpdateComplianceStatus = async (itemId, nextStatus) => {
    try {
      const res = await fetch(`${apiUrl}/compliance/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Compliance checkmark status updated', 'success');
        fetchProjectDetails();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setProject(prev => ({
        ...prev,
        complianceItems: prev.complianceItems.map(item =>
          item.id === itemId ? { ...item, status: nextStatus } : item
        )
      }));
      addToast('Compliance status updated (Demo)', 'success');
    }
  };

  // -------------------------------------------------------------
  // Memos & Computed States
  // -------------------------------------------------------------

  const kanbanColumns = useMemo(() => {
    const cols = { NotStarted: [], InProgress: [], Blocked: [], Done: [] };
    if (project.tasks) {
      project.tasks.forEach(t => {
        if (cols[t.status]) cols[t.status].push(t);
        else cols.NotStarted.push(t);
      });
    }
    return cols;
  }, [project.tasks]);

  const filteredProjectDocuments = useMemo(() => {
    if (!project.documents) return [];
    return project.documents.filter(doc => {
      const text = docSearch.toLowerCase();
      const matchDiscipline = !docDisciplineFilter || doc.discipline === docDisciplineFilter;
      const matchType = !docTypeFilter || doc.fileType.toLowerCase() === docTypeFilter.toLowerCase();
      const matchSearch = !docSearch ||
        doc.fileName.toLowerCase().includes(text) ||
        (doc.description && doc.description.toLowerCase().includes(text));
      return matchDiscipline && matchType && matchSearch;
    });
  }, [project.documents, docSearch, docDisciplineFilter, docTypeFilter]);

  const projectDocDisciplines = useMemo(() => {
    if (!project.documents) return [];
    return ['', ...new Set(project.documents.map(d => d.discipline).filter(Boolean))];
  }, [project.documents]);

  const projectDocTypes = useMemo(() => {
    if (!project.documents) return [];
    return ['', ...new Set(project.documents.map(d => d.fileType.toLowerCase()).filter(Boolean))];
  }, [project.documents]);

  // Active workflow selection for visual trail (Module 8)
  const activeWorkflow = useMemo(() => {
    if (!project.approvalWorkflows) return null;
    return project.approvalWorkflows.find(w => w.status === 'Pending') || project.approvalWorkflows[0];
  }, [project.approvalWorkflows]);

  const totalVal = project ? parseFloat(project.budget || 0) : 0;
  const spentVal = project ? parseFloat(project.budgetSpent || 0) : 0;
  const budgetRatio = totalVal > 0 ? Math.round((spentVal / totalVal) * 100) : 0;
  const phases = ['Design', 'Approval', 'Execution', 'Handover', 'Completed'];
  const currentPhaseIndex = project ? phases.indexOf(project.currentPhase) : 0;

  // Columns & Tables configs
  const taskColumns = [
    {
      header: 'Task Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <span onClick={() => { setSelectedTask(row); setIsTaskDrawerOpen(true); }} className="font-semibold text-slate-850 dark:text-slate-100 hover:underline cursor-pointer block">{row.title}</span>
      )
    },
    {
      header: 'Assignee',
      render: (row) => <span className="text-xs font-semibold">{row.assignee?.user?.name || 'Unassigned'}</span>
    },
    {
      header: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (row) => {
        const priorityColors = {
          Low: 'bg-slate-100 text-slate-700 dark:bg-slate-850 dark:text-slate-350',
          Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-955/20',
          High: 'bg-rose-50 text-rose-700 dark:bg-rose-955/20'
        };
        return <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${priorityColors[row.priority]}`}>{row.priority}</span>;
      }
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      sortable: true,
      render: (row) => <span className="font-technical text-xs font-semibold">{row.dueDate}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const statusMap = { NotStarted: 'Pending', InProgress: 'At Risk', Blocked: 'Delayed', Done: 'Completed' };
        return <StatusBadge status={statusMap[row.status] || row.status} />;
      }
    }
  ];

  const taskActions = [
    { label: 'Open Details', onClick: (row) => { setSelectedTask(row); setIsTaskDrawerOpen(true); } }
  ];

  const documentColumns = [
    {
      header: 'Document Title',
      accessor: 'fileName',
      sortable: true,
      render: (row) => {
        const style = getFileIcon(row.fileType);
        const Icon = style.icon;
        return (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => openDocHistoryDrawer(row)}>
            <div className={`p-2 rounded-lg ${style.color} shrink-0`}><Icon className="w-5 h-5" /></div>
            <div>
              <p className="font-semibold text-slate-850 dark:text-white group-hover:underline leading-tight">{row.fileName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{row.description}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Version',
      accessor: 'version',
      render: (row) => <span className="inline-flex text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-600 rounded-full">v{row.version}</span>
    },
    {
      header: 'Discipline',
      accessor: 'discipline',
      sortable: true,
      render: (row) => <span className="text-xs font-semibold px-2 py-0.5 bg-slate-105 text-slate-655 rounded">{row.discipline}</span>
    },
    {
      header: 'Size',
      accessor: 'fileSizeKB',
      sortable: true,
      render: (row) => <span className="font-technical text-xs font-bold text-slate-500">{row.fileSizeKB} KB</span>
    }
  ];

  const riskColumns = [
    {
      header: 'Risk Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <span onClick={() => { setSelectedRisk(row); setIsRiskDrawerOpen(true); }} className="font-semibold text-slate-855 dark:text-slate-100 hover:underline cursor-pointer block">{row.title}</span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded">{row.category}</span>
    },
    {
      header: 'Score',
      accessor: 'riskScore',
      sortable: true,
      render: (row) => <span className={`inline-flex px-2.5 py-0.5 text-xs font-technical font-bold rounded-full ${ScoreColors(row.riskScore)}`}>{row.riskScore}</span>
    },
    {
      header: 'Owner',
      render: (row) => <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.owner?.user?.name || 'Unassigned'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const rMap = { Open: 'Pending', Mitigating: 'At Risk', Closed: 'Completed' };
        return <StatusBadge status={rMap[row.status] || row.status} />;
      }
    }
  ];

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const cat = CategoryConfig[project.serviceCategory] || { label: project.serviceCategory, icon: Briefcase, color: '' };
  const CatIcon = cat.icon;

  return (
    <div className="space-y-6">
      {/* Back to projects hub */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Back to projects hub
      </button>

      {/* Detail Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-202 p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full ${cat.color}`}>
              <CatIcon className="w-3.5 h-3.5 shrink-0" />
              {cat.label}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-850 border border-slate-205 text-slate-655 dark:text-slate-350 px-2 py-0.5 rounded font-bold">
              {project.currentPhase} Phase
            </span>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2 leading-snug">{project.name}</h1>
          <p className="text-xs font-semibold text-slate-400 mt-1">Client: {project.clientName}</p>
        </div>

        {(currentUser?.role === 'Admin' || currentUser?.role === 'PMO Director') && (
          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="px-4 py-2 border border-slate-202 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-350 flex items-center gap-1.5 cursor-pointer shadow-xs select-none"
          >
            Modify Scope
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
        {['Overview', 'Team', 'Tasks', 'Documents', 'Risks'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer relative select-none ${
              activeTab === tab ? 'border-teal-500 text-teal-600 dark:text-teal-400' : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-205'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-2">
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Project Scope Summary</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{project.description}</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Contract Timeline Phase Progression</h3>
                <div className="relative flex justify-between items-center w-full pt-4 select-none">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 transition-all duration-300" style={{ width: `${(currentPhaseIndex / (phases.length - 1)) * 100}%` }}></div>
                  {phases.map((ph, idx) => {
                    const isPassed = idx <= currentPhaseIndex;
                    const isCurrent = idx === currentPhaseIndex;
                    return (
                      <div key={ph} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-200 ${isCurrent ? 'bg-teal-500 border-teal-500 text-white scale-110 ring-4 ring-teal-500/10' : isPassed ? 'bg-white dark:bg-slate-900 border-teal-500 text-teal-600 dark:text-teal-400' : 'bg-white dark:bg-slate-900 border-slate-202 text-slate-350 dark:text-slate-655'}`}>{idx + 1}</div>
                        <span className={`absolute top-10 text-[10px] font-bold tracking-tight uppercase whitespace-nowrap ${isCurrent ? 'text-teal-600 dark:text-teal-450 font-extrabold' : 'text-slate-400'}`}>{ph}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-6"></div>
              </div>

              {/* MODULE 8: PHASE GATE APPROVAL TRAIL TIMELINE stepper */}
              {activeWorkflow && (
                <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                        Digital Phase-Gate Approval Trail
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">{activeWorkflow.name}</p>
                    </div>
                    <span className="scale-90"><StatusBadge status={activeWorkflow.status} /></span>
                  </div>

                  <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800/80 pt-2">
                    {activeWorkflow.steps?.map((step) => {
                      const isPending = step.status === 'Pending';
                      const isApproved = step.status === 'Approved';
                      const isRejected = step.status === 'Rejected';

                      return (
                        <div key={step.id || step.stepOrder} className="relative">
                          {/* Circle Node */}
                          <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-technical font-extrabold text-[8px] text-white shadow-xs ${
                            isApproved ? 'bg-teal-500' : isRejected ? 'bg-rose-500' : 'bg-slate-350 dark:bg-slate-700 animate-pulse'
                          }`}>
                            {step.stepOrder}
                          </div>

                          <div className={`p-4 rounded-xl border transition-all ${
                            isPending 
                              ? 'bg-slate-50/50 dark:bg-slate-850/50 border-slate-200 dark:border-slate-800 ring-2 ring-teal-500/10'
                              : 'bg-slate-50/20 dark:bg-slate-850/10 border-slate-150 dark:border-slate-800/60'
                          }`}>
                            <div className="flex justify-between items-center text-xs font-semibold">
                              <span className={`font-bold ${isPending ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-250'}`}>
                                {step.approverRole} Check-off
                              </span>
                              <span className={`text-[9px] font-bold ${
                                isApproved ? 'text-teal-500' : isRejected ? 'text-rose-500' : 'text-slate-400'
                              }`}>
                                {isPending ? '⚠️ Active Review' : step.status}
                              </span>
                            </div>

                            {!isPending && (
                              <div className="text-[10px] text-slate-500 mt-2 space-y-1.5">
                                <p className="italic">"{step.comments || 'No comment logged'}"</p>
                                <p className="text-[9px] text-slate-400">Signed by: <strong className="text-slate-700 dark:text-slate-300">{step.approverUser?.name || 'Authorized Lead'}</strong> on {step.actionedAt?.split('T')[0]}</p>
                              </div>
                            )}

                            {isPending && (
                              <p className="text-[10px] text-slate-400 mt-1.5">Awaiting decisive sign-off review comments.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* AI Project Health Summary Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-1">
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5 select-none">
                    <Sparkles className="w-5 h-5 text-teal-500 shrink-0" />
                    AI Health Insight
                  </h3>
                  <button
                    onClick={fetchAiSummary}
                    disabled={loadingAiSummary}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-650 rounded transition-colors cursor-pointer"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>

                {loadingAiSummary ? (
                  <div className="flex items-center gap-1 py-4 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {aiSummary.split('**').map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="font-extrabold text-teal-650 dark:text-teal-400">{part}</strong> : part)}
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1"><DollarSign className="w-5 h-5 text-teal-500" />Financial Status (SAR)</h3>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold"><span className="text-slate-400">Total Spent</span><span className="text-slate-850 dark:text-white font-technical font-bold">{budgetRatio}% used</span></div>
                  <p className="text-2xl font-bold font-technical tracking-tight text-slate-950 dark:text-white">${spentVal.toLocaleString()}</p>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${budgetRatio > 90 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(budgetRatio, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'Team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-805 dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-teal-500" />Assigned Team Division ({project.team?.length || 0} Members)</h3>
              <button onClick={() => setIsAssignModalOpen(true)} className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"><UserPlus className="w-4 h-4" />Assign Member</button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase">
                    <th className="px-6 py-3">Employee Name</th>
                    <th className="px-6 py-3">Project Role</th>
                    <th className="px-6 py-3">Resource Allocation</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {project.team?.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/20">
                      <td className="px-6 py-4 font-semibold">{member.employee?.user?.name}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">{member.roleOnProject}</td>
                      <td className="px-6 py-4 font-technical font-bold text-slate-850 dark:text-white">{member.allocationPercent}%</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => handleUnassignMember(member.employeeId)} className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100/50 cursor-pointer">Unassign</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'Tasks' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white">Project Deliverable Milestones</h3>
              <div className="relative flex justify-between items-start w-full pt-6 select-none overflow-x-auto">
                <div className="absolute top-10 left-0 right-0 h-0.5 bg-slate-205 dark:bg-slate-800"></div>
                {project.milestones?.map((mil, mIdx) => (
                  <div key={mil.id || mIdx} className="relative z-10 flex flex-col items-center flex-1 px-2 text-center">
                    <div className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-xs shadow-sm ${MilestoneColors[mil.status] || ''}`}>{mIdx + 1}</div>
                    <h4 className="text-xs font-bold text-slate-805 dark:text-slate-200 mt-3 max-w-[120px] mx-auto truncate">{mil.title}</h4>
                    <p className="text-[10px] font-technical text-slate-405 mt-1">{mil.targetDate}</p>
                    <span className="mt-2 scale-75"><StatusBadge status={mil.status} /></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-202">
                <button onClick={() => setTaskViewMode('kanban')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${taskViewMode === 'kanban' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-500'}`}><Columns className="w-3.5 h-3.5" />Kanban Board</button>
                <button onClick={() => setTaskViewMode('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${taskViewMode === 'list' ? 'bg-white text-slate-850 shadow-xs' : 'text-slate-505'}`}><List className="w-3.5 h-3.5" />List Directory</button>
              </div>
              <button onClick={() => setIsAddTaskOpen(true)} className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"><Plus className="w-4 h-4" />Add Task</button>
            </div>

            {taskViewMode === 'list' ? (
              <DataTable columns={taskColumns} data={project.tasks} actions={taskActions} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start select-none">
                {Object.keys(kanbanColumns).map((colKey) => (
                  <div key={colKey} className="bg-slate-50/60 dark:bg-slate-900/30 border border-slate-200/50 p-3 min-h-[300px] rounded-xl flex flex-col gap-3">
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-350">{colKey}</span>
                    <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
                      {kanbanColumns[colKey].map((task) => (
                        <div key={task.id} onClick={() => { setSelectedTask(task); setIsTaskDrawerOpen(true); }} className={`bg-white dark:bg-slate-900 border border-slate-202 p-3 rounded-lg shadow-xs hover:shadow-sm cursor-pointer hover:border-slate-350 transition-all ${TaskPriorityColors[task.priority]}`}>
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-105 leading-snug line-clamp-2">{task.title}</h4>
                          <span className="text-[9px] font-technical text-slate-400 mt-2 block">{task.dueDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'Documents' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-202">
                  <button onClick={() => setDocViewMode('list')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${docViewMode === 'list' ? 'bg-white text-slate-855 shadow-xs' : 'text-slate-500'}`}><List className="w-3.5 h-3.5" />List View</button>
                  <button onClick={() => setDocViewMode('grid')} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${docViewMode === 'grid' ? 'bg-white text-slate-855 shadow-xs' : 'text-slate-505'}`}><Grid className="w-3.5 h-3.5" />Grid Cards</button>
                </div>
              </div>

              {filteredProjectDocuments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-202 p-8 rounded-xl text-center text-xs text-slate-400">No project drawings loaded.</div>
              ) : docViewMode === 'list' ? (
                <DataTable columns={documentColumns} data={filteredProjectDocuments} actions={[
                  { label: 'Version Timeline', onClick: (row)=>openDocHistoryDrawer(row) }
                ]} />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProjectDocuments.map(doc => {
                    const style = getFileIcon(doc.fileType);
                    const DocIcon = style.icon;
                    return (
                      <div key={doc.id} onClick={()=>openDocHistoryDrawer(doc)} className="bg-white dark:bg-slate-900 border border-slate-202 p-4 rounded-xl hover:shadow-xs cursor-pointer transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className={`p-2 rounded ${style.color}`}><DocIcon className="w-4 h-4" /></div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded-full">v{doc.version}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-855 dark:text-white mt-3 line-clamp-1">{doc.fileName}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{doc.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-855 dark:text-white">Upload Drawings / BIM Specs</h3>
              <form onSubmit={handleDocumentUploadSubmit} className="space-y-4">
                <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors relative ${isDragOver ? 'border-teal-505 bg-teal-50/10' : 'border-slate-202'}`}>
                  <input type="file" onChange={onFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-755 dark:text-slate-300">Drag files here or click to browse</p>
                  {uploadedFile && <p className="text-[10px] text-emerald-600 font-semibold mt-2">{uploadedFile.name}</p>}
                </div>
                <button type="submit" disabled={uploading || !uploadedFile} className={`w-full py-2 rounded-lg text-xs font-semibold text-white ${!uploadedFile ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-accent hover:bg-accent-hover'}`}>{uploading ? 'Committing...' : 'Commit Upload'}</button>
              </form>
            </div>
          </div>
        )}

        {/* Risks Tab */}
        {activeTab === 'Risks' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start select-none">
            <div className="xl:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-2"><Sliders className="w-5 h-5 text-teal-500" />Contract Risk Log</h3>
                <button onClick={() => setIsAddRiskOpen(true)} className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"><Plus className="w-4 h-4" />Identify Risk</button>
              </div>

              {project.risks?.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-202 p-8 rounded-xl text-center text-xs text-slate-400">No project risks logged.</div>
              ) : (
                <DataTable columns={riskColumns} data={project.risks || []} actions={[{ label: 'Open Dossier', onClick: (row) => { setSelectedRisk(row); setIsRiskDrawerOpen(true); } }]} />
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-202 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-1.5"><ShieldCheck className="w-5 h-5 text-teal-500" />Regulatory Checklist</h3>
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {project.complianceItems?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">No compliance checks assigned.</p>
                ) : (
                  project.complianceItems?.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-bold text-slate-855 dark:text-slate-200 text-xs leading-snug">{item.requirementName}</p>
                          <p className="text-[10px] font-technical text-slate-405 mt-1">Due: {item.dueDate}</p>
                        </div>
                        <select value={item.status} onChange={(e) => handleUpdateComplianceStatus(item.id, e.target.value)} className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-202 rounded px-1.5 py-0.5 font-bold cursor-pointer">
                          <option value="Pending">Pending</option>
                          <option value="InProgress">In Progress</option>
                          <option value="Compliant">Compliant</option>
                          <option value="NonCompliant">Non-Compliant</option>
                        </select>
                      </div>
                      <p className="text-[10px] text-slate-400 italic leading-relaxed">{item.notes}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Project Scope Form Drawer */}
      <Drawer
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        title="Modify Contract Parameters"
        footer={
          <>
            <button onClick={() => setIsEditProjectOpen(false)} className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-705 cursor-pointer">Cancel</button>
            <button onClick={handleEditProject} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm">Save Parameters</button>
          </>
        }
      >
        <form onSubmit={handleEditProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Project Name</label>
            <input type="text" required value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Client / Organization</label>
            <input type="text" required value={editFormData.clientName} onChange={e => setEditFormData({ ...editFormData, clientName: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Scope Description</label>
            <textarea rows={4} value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contract Phase</label>
              <select value={editFormData.currentPhase} onChange={e => setEditFormData({ ...editFormData, currentPhase: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
                <option value="Design">Design</option>
                <option value="Approval">Approval</option>
                <option value="Execution">Execution</option>
                <option value="Handover">Handover</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status Indicator</label>
              <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
                <option value="OnTrack">On Track</option>
                <option value="AtRisk">At Risk</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Budget (SAR)</label>
            <input type="number" required value={editFormData.budget} onChange={e => setEditFormData({ ...editFormData, budget: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 font-technical" />
          </div>
        </form>
      </Drawer>

      {/* Assign Member Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Technical Specialist"
        footer={
          <>
            <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-705 cursor-pointer">Cancel</button>
            <button onClick={handleAssignMember} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg cursor-pointer">Confirm Assignment</button>
          </>
        }
      >
        <form onSubmit={handleAssignMember} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Specialist *</label>
            <select value={assignForm.employeeId} required onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
              <option value="">Choose Employee...</option>
              {employees.filter(emp => !project.team?.some(m => m.employeeId === emp.id)).map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role on this Project *</label>
            <input type="text" required value={assignForm.roleOnProject} onChange={e => setAssignForm({ ...assignForm, roleOnProject: e.target.value })} placeholder="e.g. Lead Mechanical Draftsman" className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title="Schedule Project Task"
        footer={
          <>
            <button onClick={() => setIsAddTaskOpen(false)} className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-705 cursor-pointer">Cancel</button>
            <button onClick={handleAddTask} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg cursor-pointer">Confirm Task</button>
          </>
        }
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Task Title *</label>
            <input type="text" required value={newTaskData.title} onChange={e => setNewTaskData({ ...newTaskData, title: e.target.value })} placeholder="e.g. Design review checklist sign-off" className={`w-full bg-white border ${taskErrors.title ? 'border-rose-500' : 'border-slate-202'} rounded-lg px-3 py-2 text-sm text-slate-900`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Assignee *</label>
              <select value={newTaskData.assigneeId} required onChange={e => setNewTaskData({ ...newTaskData, assigneeId: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
                <option value="">Select Team Member...</option>
                {project.team?.map(m => (
                  <option key={m.employeeId} value={m.employeeId}>{m.employee?.user?.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Due Date *</label>
              <input type="date" required value={newTaskData.dueDate} onChange={e => setNewTaskData({ ...newTaskData, dueDate: e.target.value })} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 font-technical" />
            </div>
          </div>
        </form>
      </Modal>

      {/* Task Detail Drawer */}
      <Drawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        title="Project Task Dossier"
        footer={
          <>
            <button onClick={() => setIsTaskDrawerOpen(false)} className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-705 cursor-pointer">Close Drawer</button>
            <button onClick={() => handleDeleteTask(selectedTask.id)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm select-none"><Trash2 className="w-4 h-4 shrink-0" />Delete Task</button>
          </>
        }
      >
        {selectedTask && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-650">{selectedTask.phase} Phase Deliverable</span>
              <h3 className="text-base font-bold text-slate-905 mt-1 leading-snug">{selectedTask.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-100 rounded-xl">
              <div>
                <span className="text-slate-455 font-bold uppercase block mb-1">Status</span>
                <select value={selectedTask.status} onChange={(e) => handleUpdateTaskStatus(selectedTask.id, e.target.value)} className="bg-white border border-slate-202 rounded px-2 py-1 font-semibold cursor-pointer">
                  <option value="NotStarted">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed bg-white border p-3 rounded-lg">{selectedTask.description}</p>
          </div>
        )}
      </Drawer>

      {/* Document History Drawer */}
      <Drawer
        isOpen={isDocDrawerOpen}
        onClose={() => setIsDocDrawerOpen(false)}
        title="File Version Log"
        footer={<button onClick={() => setIsDocDrawerOpen(false)} className="px-4 py-2 border border-slate-202 text-sm font-semibold rounded-lg text-slate-705 cursor-pointer">Close Logs</button>}
      >
        {selectedDoc && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-teal-650 uppercase bg-teal-50 px-2 py-0.5 rounded">{selectedDoc.discipline} Discipline</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{selectedDoc.fileName}</h3>
            </div>
            <div className="relative pl-6 space-y-5 border-l border-slate-200">
              {versionHistory.map((ver, idx) => (
                <div key={ver.id || ver.version} className="relative">
                  <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-teal-505' : 'bg-slate-350'}`}></div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-800">v{ver.version}</span><span className="font-technical text-[10px] text-slate-400">{ver.uploadedAt.split('T')[0]}</span></div>
                    <button onClick={() => addToast('Downloading version...','success')} className="px-2 py-1 bg-white border rounded text-[9px] font-bold cursor-pointer"><Download className="w-3.5 h-3.5 inline mr-1" />Download</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Identify Risk Modal */}
      <Modal
        isOpen={isAddRiskOpen}
        onClose={() => setIsAddRiskOpen(false)}
        title="Identify Project Risk"
        footer={
          <>
            <button onClick={() => setIsAddRiskOpen(false)} className="px-4 py-2 border border-slate-202 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-705 cursor-pointer">Cancel</button>
            <button onClick={handleAddRiskSubmit} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg cursor-pointer">Commit Risk</button>
          </>
        }
      >
        <form onSubmit={handleAddRiskSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">Risk Title *</label>
            <input type="text" required value={newRiskData.title} onChange={e=>setNewRiskData({...newRiskData, title: e.target.value})} placeholder="e.g. Subcontractor earthmoving delays" className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">Category</label>
              <select value={newRiskData.category} onChange={e=>setNewRiskData({...newRiskData, category: e.target.value})} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
                <option value="Technical">Technical</option>
                <option value="Financial">Financial</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Schedule">Schedule</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-550 mb-1.5">Risk Owner *</label>
              <select value={newRiskData.ownerId} required onChange={e=>setNewRiskData({...newRiskData, ownerId: e.target.value})} className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 cursor-pointer">
                <option value="">Choose owner...</option>
                {project.team?.map(m => (
                  <option key={m.employeeId} value={m.employeeId}>{m.employee?.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 border border-slate-100 rounded-xl items-center">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Probability</span><span className="font-technical text-teal-650">{newRiskData.probability}/5</span></div>
              <input type="range" min="1" max="5" value={newRiskData.probability} onChange={e=>setNewRiskData({...newRiskData, probability: Number(e.target.value)})} className="w-full h-1.5 bg-slate-205 rounded-lg cursor-pointer" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1"><span>Impact</span><span className="font-technical text-teal-650">{newRiskData.impact}/5</span></div>
              <input type="range" min="1" max="5" value={newRiskData.impact} onChange={e=>setNewRiskData({...newRiskData, impact: Number(e.target.value)})} className="w-full h-1.5 bg-slate-205 rounded-lg cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">Mitigation Plan</label>
            <textarea rows={2.5} value={newRiskData.mitigationPlan} onChange={e=>setNewRiskData({...newRiskData, mitigationPlan: e.target.value})} placeholder="Draft mitigation guidelines..." className="w-full bg-white border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900" />
          </div>
        </form>
      </Modal>

      {/* Selected Risk Details Drawer */}
      <Drawer
        isOpen={isRiskDrawerOpen}
        onClose={() => setIsRiskDrawerOpen(false)}
        title="Project Risk Dossier"
        footer={<button onClick={() => setIsRiskDrawerOpen(false)} className="px-4 py-2 border border-slate-202 text-sm font-semibold rounded-lg text-slate-705 cursor-pointer">Close Dossier</button>}
      >
        {selectedRisk && (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-teal-650 uppercase bg-teal-50 px-2 py-0.5 rounded">{selectedRisk.category} Category</span>
              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{selectedRisk.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-100 rounded-xl">
              <div><span className="text-slate-455 font-bold uppercase block mb-1">Probability</span><span className="font-technical text-slate-850 dark:text-white">{selectedRisk.probability} / 5</span></div>
              <div><span className="text-slate-455 font-bold uppercase block mb-1">Impact</span><span className="font-technical text-slate-850 dark:text-white">{selectedRisk.impact} / 5</span></div>
              <div className="pt-2 border-t border-slate-200"><span className="text-slate-455 font-bold uppercase block mb-0.5">Calculated Score</span><span className={`inline-flex px-2 py-0.5 text-xs font-technical font-bold rounded-full ${ScoreColors(selectedRisk.riskScore)}`}>{selectedRisk.riskScore}</span></div>
              <div className="pt-2 border-t border-slate-200"><span className="text-slate-455 font-bold uppercase block mb-0.5">Owner</span><span className="font-semibold text-slate-850 dark:text-slate-300">{selectedRisk.owner?.user?.name || 'Unassigned'}</span></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ProjectDetail;
