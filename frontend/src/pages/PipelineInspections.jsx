import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import { Calendar, User, FileText, AlertTriangle, CheckCircle2, Clock, Plus, ClipboardCheck } from 'lucide-react';

const PipelineInspections = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [inspections, setInspections] = useState([]);
  const [segments, setSegments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    segmentId: '',
    inspectorId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    status: 'Scheduled',
    checklistData: {
      cathodicProtectionCheck: 'Pass',
      corrosionInspection: 'Negligible',
      leakPresence: 'None Detected',
      valveOperation: 'Verified Smooth',
      rightOfWayCleared: 'Yes'
    },
    notes: '',
    photoUrl: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const insRes = await fetch(`${apiUrl}/pipeline/inspections`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const segRes = await fetch(`${apiUrl}/pipeline/segments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const insData = await insRes.json();
      const segData = await segRes.json();
      const empData = await empRes.json();

      if (insData.success) setInspections(insData.data);
      if (segData.success) setSegments(segData.data);
      if (empData.success) setEmployees(empData.data);
    } catch (err) {
      addToast('Error loading inspections data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenLogForm = () => {
    setFormData({
      segmentId: segments[0]?.id || '',
      inspectorId: employees[0]?.id || '',
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: '',
      status: 'Scheduled',
      checklistData: {
        cathodicProtectionCheck: 'Pass',
        corrosionInspection: 'Negligible',
        leakPresence: 'None Detected',
        valveOperation: 'Verified Smooth',
        rightOfWayCleared: 'Yes'
      },
      notes: '',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'
    });
    setIsLogDrawerOpen(true);
  };

  const handleLogInspection = async (e) => {
    e.preventDefault();
    try {
      const attachments = formData.photoUrl ? [formData.photoUrl] : [];
      const res = await fetch(`${apiUrl}/pipeline/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          segmentId: Number(formData.segmentId),
          inspectorId: Number(formData.inspectorId),
          attachmentUrls: attachments
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Inspection logged successfully', 'success');
        setIsLogDrawerOpen(false);
        fetchData();
      } else {
        addToast(data.message || 'Failed to log inspection', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const filteredInspections = inspections.filter(item => {
    return !filterStatus || item.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections & Audits"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Inspections & Audits']}
        actions={
          <button onClick={handleOpenLogForm} className="btn btn-brand flex items-center gap-2">
            <Plus className="w-4 h-4" /> Log Inspection
          </button>
        }
      />

      {/* Filters */}
      <div className="flex justify-between items-center bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-4 rounded-xl shadow-xs">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Inspection Filters</span>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded px-2.5 py-1.5 cursor-pointer text-slate-700 dark:text-slate-350"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInspections.length === 0 ? (
            <div className="col-span-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-12 text-center text-text-muted rounded-xl">
              No inspections found matching search criteria.
            </div>
          ) : (
            filteredInspections.map((item) => {
              const isOverdue = item.status === 'Overdue';
              return (
                <div
                  key={item.id}
                  className={`bg-surface dark:bg-surface-dark border rounded-xl p-5 shadow-xs flex flex-col justify-between h-full transition-all duration-200 ${
                    isOverdue 
                      ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-950/5' 
                      : 'border-border dark:border-border-dark'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-technical text-text-muted font-bold block">LOG #{item.id}</span>
                        <h4 className="font-bold text-sm text-text-primary dark:text-text-primary-dark">{item.segment?.name}</h4>
                        <p className="text-[10px] text-text-muted font-medium">{item.segment?.region}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        item.status === 'Overdue' ? 'bg-rose-500 text-white dark:bg-rose-900 text-rose-100 font-extrabold animate-pulse' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-text-secondary dark:text-text-secondary-dark border-t border-border dark:border-border-dark pt-3">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-text-muted" /> <span className="font-technical font-semibold">{item.scheduledDate}</span></div>
                      {item.completedDate && <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-text-muted" /> Completed: <span className="font-technical font-semibold">{item.completedDate}</span></div>}
                      <div className="flex items-center gap-2"><User className="w-4 h-4 text-text-muted" /> Inspector: <span className="font-medium text-text-primary dark:text-text-primary-dark">{item.inspector?.user?.name || 'Unassigned'}</span></div>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-text-muted italic bg-background dark:bg-background-dark/30 p-2.5 rounded border border-border/30 max-h-20 overflow-y-auto mt-2">
                        &quot;{item.notes}&quot;
                      </p>
                    )}

                    {item.checklistData && (
                      <div className="border-t border-border dark:border-border-dark pt-3 mt-2">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Checklist Snapshot</span>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                          {Object.entries(item.checklistData).slice(0, 4).map(([key, val]) => (
                            <div key={key} className="flex justify-between border-b border-border/20 py-0.5">
                              <span className="text-text-muted truncate max-w-[70%]">{key.replace(/([A-Z])/g, ' $1')}</span>
                              <span className={`font-bold ${val === 'Pass' || val === 'None Detected' || val === 'Yes' || val === 'Verified Smooth' || val === 'Negligible' ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Log Inspection Drawer */}
      <Drawer isOpen={isLogDrawerOpen} onClose={() => setIsLogDrawerOpen(false)} title="Log New Pipeline Inspection" size="sm">
        <form onSubmit={handleLogInspection} className="space-y-4">
          <div>
            <label className="form-label">Pipeline Segment</label>
            <select
              required
              className="form-input"
              value={formData.segmentId}
              onChange={e => setFormData(prev => ({ ...prev, segmentId: e.target.value }))}
            >
              <option value="">Select Segment</option>
              {segments.map(seg => (
                <option key={seg.id} value={seg.id}>{seg.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Inspector</label>
            <select
              required
              className="form-input"
              value={formData.inspectorId}
              onChange={e => setFormData(prev => ({ ...prev, inspectorId: e.target.value }))}
            >
              <option value="">Select Inspector</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.designation})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Scheduled Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.scheduledDate}
                onChange={e => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Completed Date (Optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.completedDate}
                onChange={e => setFormData(prev => ({ ...prev, completedDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="bg-background dark:bg-background-dark/30 p-3 rounded border border-border/50 text-xs space-y-3">
            <div className="font-bold border-b border-border/30 pb-1 flex items-center gap-1">
              <ClipboardCheck className="w-4 h-4 text-brand" /> Checklist Builder
            </div>
            {Object.keys(formData.checklistData).map(key => (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <select
                  className="bg-surface text-xs rounded border p-0.5"
                  value={formData.checklistData[key]}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      checklistData: { ...prev.checklistData, [key]: val }
                    }));
                  }}
                >
                  <option value="Pass">Pass / Yes / Verified</option>
                  <option value="Fail">Fail / No / Anomalous</option>
                  <option value="None Detected">None Detected</option>
                </select>
              </div>
            ))}
          </div>

          <div>
            <label className="form-label">Photo Attachment URL</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://example.com/photo.jpg"
              value={formData.photoUrl}
              onChange={e => setFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
            />
          </div>

          <div>
            <label className="form-label">Inspector Notes</label>
            <textarea
              className="form-input min-h-[60px]"
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Inspection Record</button>
        </form>
      </Drawer>
    </div>
  );
};

export default PipelineInspections;
