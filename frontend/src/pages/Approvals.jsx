import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
  GitCommit,
  User
} from 'lucide-react';

const Approvals = () => {
  const { token, apiUrl, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action modal
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionData, setActionData] = useState({
    stepId: null,
    status: '', // 'Approved' or 'Rejected'
    comments: '',
    workflowName: '',
    projectName: ''
  });

  // Details drawer
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Fetch pending and workflows
  const fetchApprovalsData = async () => {
    try {
      setLoading(true);
      const pendRes = await fetch(`${apiUrl}/approvals/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const wfRes = await fetch(`${apiUrl}/approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pendData = await pendRes.json();
      const wfData = await wfRes.json();

      if (pendData.success) setPendingApprovals(pendData.data);
      if (wfData.success) setWorkflows(wfData.data);
    } catch (err) {
      console.warn('Backend server offline. Setting mock approval registries.');
      // PMO Director user get a pending task
      if (user?.role === 'PMO Director') {
        setPendingApprovals([
          {
            stepId: 2,
            workflowId: 2,
            workflowName: 'Diriyah Gate Substation Phase Gate: Approval ➔ Execution',
            phaseTrigger: 'Approval→Execution',
            stepOrder: 2,
            projectName: 'Diriyah Gate Historic Substation Integration',
            clientName: 'Diriyah Gate Development Authority (DGDA)',
            approverRole: 'PMO Director',
            status: 'Pending'
          }
        ]);
      } else {
        setPendingApprovals([]);
      }

      setWorkflows([
        {
          id: 1,
          name: 'NEOM Spine Phase Transition Gate: Design ➔ Approval',
          phaseTrigger: 'Design→Approval',
          status: 'Approved',
          project: { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority' },
          steps: [
            { id: 10, stepOrder: 1, approverRole: 'Project Manager', status: 'Approved', comments: 'Structural canopy loading calculations verified.', actionedAt: '2026-07-15T10:00:00.000Z', approverUser: { name: 'Elena Rostova' } },
            { id: 11, stepOrder: 2, approverRole: 'PMO Director', status: 'Approved', comments: 'Phase sign-off approved. Moving contract budget locks.', actionedAt: '2026-07-16T14:30:00.000Z', approverUser: { name: 'Marcus Vance' } }
          ]
        },
        {
          id: 2,
          name: 'Diriyah Gate Substation Phase Gate: Approval ➔ Execution',
          phaseTrigger: 'Approval→Execution',
          status: 'Pending',
          project: { id: 4, name: 'Diriyah Gate Historic Substation Integration', clientName: 'Diriyah Gate Development Authority (DGDA)' },
          steps: [
            { id: 12, stepOrder: 1, approverRole: 'Project Manager', status: 'Approved', comments: 'Easements cleared by municipal planning teams.', actionedAt: '2026-07-16T09:00:00.000Z', approverUser: { name: 'Elena Rostova' } },
            { id: 13, stepOrder: 2, approverRole: 'PMO Director', status: 'Pending', comments: null, actionedAt: null, approverUser: null }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalsData();
  }, [token, apiUrl, user]);

  const handleOpenActionModal = (step, status) => {
    setActionData({
      stepId: step.stepId,
      status,
      comments: '',
      workflowName: step.workflowName,
      projectName: step.projectName
    });
    setIsActionModalOpen(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!actionData.comments.trim()) {
      addToast('Comments are required to log actions', 'warning');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/approvals/${actionData.stepId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: actionData.status,
          comments: actionData.comments
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Approval step committed: ${actionData.status}`, 'success');
        fetchApprovalsData();
        setIsActionModalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Mock update local states
      setPendingApprovals(pendingApprovals.filter(p => p.stepId !== actionData.stepId));
      
      // Update matching step in workflows state
      setWorkflows(prev => prev.map(flow => {
        if (flow.id === 2 && actionData.stepId === 2) {
          return {
            ...flow,
            status: actionData.status === 'Approved' ? 'Approved' : 'Rejected',
            steps: flow.steps.map(s => s.stepOrder === 2 ? {
              ...s,
              status: actionData.status,
              comments: actionData.comments,
              actionedAt: new Date().toISOString(),
              approverUser: { name: user?.name || 'Director' }
            } : s)
          };
        }
        return flow;
      }));

      addToast(`Action committed (Demo Cache): ${actionData.status}`, 'success');
      setIsActionModalOpen(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/approvals/${selectedWorkflow.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: newCommentText })
      });
      const data = await res.json();
      if (data.success) {
        let comments = [];
        try {
          comments = JSON.parse(selectedWorkflow.discussionComments || '[]');
        } catch (err) {
          comments = [];
        }
        const updatedComments = [...comments, data.data];
        const updatedWorkflow = {
          ...selectedWorkflow,
          discussionComments: JSON.stringify(updatedComments)
        };
        setSelectedWorkflow(updatedWorkflow);
        setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
        setNewCommentText('');
        addToast('Comment added successfully', 'success');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      const mockComment = {
        id: Date.now(),
        userName: user?.name || 'Director',
        userRole: user?.role || 'PMO Director',
        commentText: newCommentText.trim(),
        timestamp: new Date().toISOString()
      };
      let comments = [];
      try {
        comments = JSON.parse(selectedWorkflow?.discussionComments || '[]');
      } catch (err) {
        comments = [];
      }
      const updatedComments = [...comments, mockComment];
      const updatedWorkflow = {
        ...selectedWorkflow,
        discussionComments: JSON.stringify(updatedComments)
      };
      setSelectedWorkflow(updatedWorkflow);
      setWorkflows(prev => prev.map(w => w.id === selectedWorkflow.id ? updatedWorkflow : w));
      setNewCommentText('');
      addToast('Comment added (Demo Cache)', 'success');
    }
  };

  // Stepper color indicators for workflows list
  const getStepStatusMarker = (status) => {
    if (status === 'Approved') return 'bg-teal-500';
    if (status === 'Rejected') return 'bg-rose-500';
    return 'bg-slate-300 dark:bg-slate-700 animate-pulse';
  };

  // DataTable columns configuration
  const columns = [
    {
      header: 'Workflow Name',
      accessor: 'name',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => {
            setSelectedWorkflow(row);
            setIsDrawerOpen(true);
          }}
          className="font-semibold text-slate-850 dark:text-slate-100 hover:underline cursor-pointer block"
        >
          {row.name}
        </span>
      )
    },
    {
      header: 'Project Scope',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-550 truncate max-w-[160px] block">
          {row.project?.name || 'General PMO'}
        </span>
      )
    },
    {
      header: 'Phase Gate Transition',
      accessor: 'phaseTrigger',
      render: (row) => (
        <span className="inline-flex items-center text-[10px] font-technical font-extrabold uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 shadow-xs">
          {row.phaseTrigger}
        </span>
      )
    },
    {
      header: 'Approval Trail Progression',
      render: (row) => {
        const approvedCount = row.steps?.filter(s => s.status === 'Approved').length || 0;
        const total = row.steps?.length || 0;
        const isRejected = row.steps?.some(s => s.status === 'Rejected');
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1 shrink-0 select-none">
              {row.steps?.map((step) => (
                <span
                  key={step.id || step.stepOrder}
                  className={`w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${getStepStatusMarker(step.status)}`}
                  title={`Step ${step.stepOrder}: ${step.approverRole} (${step.status})`}
                ></span>
              ))}
            </div>
            <span className="text-[10px] font-technical font-bold text-slate-450">
              {isRejected ? 'Chain Rejected' : `${approvedCount} of ${total} signed`}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => {
        const statusMap = {
          Pending: 'Pending',
          Approved: 'Completed',
          Rejected: 'Delayed'
        };
        return <StatusBadge status={statusMap[row.status] || row.status} />;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workflow Automation & Approvals"
        breadcrumbs={['PetroFlow', 'Workflow Automation']}
      />

      {/* Pending approvals section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5 select-none">
          <UserCheck className="w-5 h-5 text-teal-500" />
          Pending My Action ({pendingApprovals.length})
        </h3>

        {pendingApprovals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400 select-none py-10">
            No pending approval sign-offs assigned to your role. Well done.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start select-none">
            {pendingApprovals.map((step) => (
              <div
                key={step.stepId}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-extrabold text-teal-650 bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded uppercase border border-teal-100 dark:border-teal-900/30">
                      Step {step.stepOrder} awaiting action
                    </span>
                    <span className="text-[9px] font-technical font-bold text-slate-450 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-3 leading-snug">
                    {step.workflowName}
                  </h4>
                  <p
                    onClick={() => navigate(`/projects/${step.projectId}`)}
                    className="text-[10px] text-slate-400 mt-1 hover:underline cursor-pointer truncate"
                  >
                    Project: {step.projectName}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 justify-end">
                  <button
                    onClick={() => handleOpenActionModal(step, 'Rejected')}
                    className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold border border-rose-100 cursor-pointer shadow-xs"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleOpenActionModal(step, 'Approved')}
                    className="px-3.5 py-1.5 rounded bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Approve & Sign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History panel */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5 select-none">
          <FileText className="w-5 h-5 text-teal-500" />
          Approval Workflows Registry
        </h3>

        <DataTable
          columns={columns}
          data={workflows}
          searchPlaceholder="Search history..."
          actions={[
            {
              label: 'View stepper trail',
              onClick: (row) => {
                setSelectedWorkflow(row);
                setIsDrawerOpen(true);
              }
            }
          ]}
        />
      </div>

      {/* Action Decision Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={actionData.status === 'Approved' ? 'Confirm Sign-off Approval' : 'Confirm Step Rejection'}
        footer={
          <>
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleActionSubmit}
              className={`px-4 py-2 text-white text-sm font-semibold rounded-lg cursor-pointer ${
                actionData.status === 'Approved' ? 'bg-teal-500 hover:bg-teal-600' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Confirm Decisive Action
            </button>
          </>
        }
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          <div className="text-xs bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200/50 rounded-xl space-y-1.5 leading-relaxed text-slate-500 select-none">
            <p>Project: <strong className="font-bold text-slate-800 dark:text-slate-300">{actionData.projectName}</strong></p>
            <p>Gate: <strong className="font-bold text-slate-800 dark:text-slate-300">{actionData.workflowName}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Review Comments * (Mandatory)
            </label>
            <textarea
              required
              rows={4}
              value={actionData.comments}
              onChange={(e) => setActionData({ ...actionData, comments: e.target.value })}
              placeholder="Detail reasons, design parameters checked, or requirements missing..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </form>
      </Modal>

      {/* Stepper Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Approval Stepper Trail"
        footer={
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Close Trail
          </button>
        }
      >
        {selectedWorkflow && (
          <div className="space-y-6 animate-fade-in select-none">
            <div>
              <span className="text-[10px] font-technical font-extrabold uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                Gate: {selectedWorkflow.phaseTrigger}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                {selectedWorkflow.name}
              </h3>
              <p className="text-xs text-slate-450 mt-1">Project Scope: {selectedWorkflow.project?.name}</p>
            </div>

            {/* Stepper Steps Trail */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-teal-500 animate-spin" />
                Sign-off Trail Progress
              </h4>

              <div className="relative pl-6 space-y-6 border-l border-slate-200 dark:border-slate-800">
                {selectedWorkflow.steps?.map((step) => {
                  const isPending = step.status === 'Pending';
                  const isApproved = step.status === 'Approved';
                  const isRejected = step.status === 'Rejected';

                  return (
                    <div key={step.id || step.stepOrder} className="relative">
                      {/* Step node indicator */}
                      <div className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center font-bold text-[9px] text-white shadow-xs ${
                        isApproved ? 'bg-teal-500' : isRejected ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700 animate-pulse'
                      }`}>
                        {step.stepOrder}
                      </div>

                      <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <span className="text-slate-800 dark:text-slate-250">
                            {step.approverRole} Check
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            isApproved ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/20' : isRejected ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>

                        {/* Sign-off Details */}
                        {!isPending && (
                          <div className="text-[10px] space-y-2">
                            <p className="text-slate-505 dark:text-slate-400 italic">"{step.comments || 'No comment logged'}"</p>
                            <div className="flex justify-between items-center pt-1.5 border-t border-slate-150 dark:border-slate-800 text-[9px] text-slate-400">
                              <span>By: <strong className="font-bold">{step.approverUser?.name || 'Division Auditor'}</strong></span>
                              <span className="font-technical">{new Date(step.actionedAt).toISOString().split('T')[0]}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discussion & Clarification Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <GitCommit className="w-4 h-4 text-teal-500" />
                Workflow Discussion & Notes
              </h4>

              {/* Discussion messages list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {(() => {
                  let comments = [];
                  try {
                    comments = JSON.parse(selectedWorkflow.discussionComments || '[]');
                  } catch (e) {
                    comments = [];
                  }

                  if (comments.length === 0) {
                    return (
                      <p className="text-xs text-slate-400 italic py-2">
                        No discussion notes logged. Use the form below to start.
                      </p>
                    );
                  }

                  return comments.map((comm) => (
                    <div key={comm.id} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-350">
                          {comm.userName} ({comm.userRole})
                        </span>
                        <span className="font-technical">
                          {new Date(comm.timestamp).toISOString().split('T')[0]} {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{comm.commentText}</p>
                    </div>
                  ));
                })()}
              </div>

              {/* Discussion post form */}
              <form onSubmit={handleAddComment} className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Ask for clarification or log a review note..."
                  className="w-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 text-slate-900 dark:text-white"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer select-none"
                  >
                    Post Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Approvals;
