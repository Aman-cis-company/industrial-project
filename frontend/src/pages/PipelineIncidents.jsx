import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import { 
  AlertOctagon, 
  MapPin, 
  User, 
  Calendar, 
  Clock, 
  Plus, 
  ArrowRight, 
  ChevronRight,
  TrendingDown,
  Info 
} from 'lucide-react';

const SEVERITY_COLORS = {
  Low: 'border-l-4 border-l-emerald-500 bg-emerald-50/10 text-emerald-600 dark:bg-emerald-950/5 dark:text-emerald-400',
  Medium: 'border-l-4 border-l-amber-500 bg-amber-50/10 text-amber-600 dark:bg-amber-950/5 dark:text-amber-400',
  High: 'border-l-4 border-l-orange-500 bg-orange-50/10 text-orange-650 dark:bg-orange-950/5 dark:text-orange-400',
  Critical: 'border-l-4 border-l-rose-500 bg-rose-50/10 text-rose-600 dark:bg-rose-950/5 dark:text-rose-450'
};

const PipelineIncidents = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [incidents, setIncidents] = useState([]);
  const [segments, setSegments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    segmentId: '',
    reportedById: '',
    title: '',
    description: '',
    severity: 'Low',
    status: 'Reported',
    latitude: '',
    longitude: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const incRes = await fetch(`${apiUrl}/pipeline/incidents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const segRes = await fetch(`${apiUrl}/pipeline/segments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const incData = await incRes.json();
      const segData = await segRes.json();
      const empData = await empRes.json();

      if (incData.success) setIncidents(incData.data);
      if (segData.success) setSegments(segData.data);
      if (empData.success) setEmployees(empData.data);
    } catch (err) {
      addToast('Error loading incident data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReport = () => {
    setFormData({
      segmentId: segments[0]?.id || '',
      reportedById: employees[0]?.id || '',
      title: '',
      description: '',
      severity: 'Low',
      status: 'Reported',
      latitude: segments[0]?.latStart || '',
      longitude: segments[0]?.lngStart || ''
    });
    setIsReportDrawerOpen(true);
  };

  const handleSegmentChange = (e) => {
    const segId = Number(e.target.value);
    const selected = segments.find(s => s.id === segId);
    setFormData(prev => ({
      ...prev,
      segmentId: segId,
      latitude: selected ? selected.latStart : '',
      longitude: selected ? selected.lngStart : ''
    }));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          segmentId: Number(formData.segmentId),
          reportedById: Number(formData.reportedById),
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Incident reported successfully', 'success');
        setIsReportDrawerOpen(false);
        fetchData();
      } else {
        addToast(data.message || 'Failed to submit report', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleUpdateStatus = async (incidentId, nextStatus) => {
    try {
      const body = { status: nextStatus };
      if (nextStatus === 'Resolved' || nextStatus === 'Closed') {
        body.resolvedAt = new Date();
      }
      
      const res = await fetch(`${apiUrl}/pipeline/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Incident status updated to ${nextStatus}`, 'success');
        fetchData();
      } else {
        addToast(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  // Group Incidents by Kanban status
  const boardData = useMemo(() => {
    const columns = {
      Reported: [],
      UnderInvestigation: [],
      Resolved: [],
      Closed: []
    };
    incidents.forEach(inc => {
      if (columns[inc.status] !== undefined) {
        columns[inc.status].push(inc);
      }
    });
    return columns;
  }, [incidents]);

  const columnsConfig = [
    { key: 'Reported', title: 'Reported', color: 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800' },
    { key: 'UnderInvestigation', title: 'Under Investigation', color: 'bg-amber-500/5 border-amber-500/10' },
    { key: 'Resolved', title: 'Resolved', color: 'bg-emerald-500/5 border-emerald-500/10' },
    { key: 'Closed', title: 'Closed', color: 'bg-blue-500/5 border-blue-500/10' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Control Desk"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Incident Control Desk']}
        actions={
          <button 
            onClick={handleOpenReport} 
            className="btn btn-brand flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Report Incident
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
          {columnsConfig.map(({ key, title, color }) => {
            const list = boardData[key] || [];
            return (
              <div 
                key={key} 
                className={`border rounded-xl p-4 min-h-[500px] flex flex-col space-y-4 ${color}`}
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border-dark">
                  <h3 className="font-bold text-xs text-text-primary dark:text-text-primary-dark tracking-wide uppercase">
                    {title}
                  </h3>
                  <span className="font-technical text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-secondary dark:text-text-secondary-dark">
                    {list.length}
                  </span>
                </div>

                {/* List of cards */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                  {list.length === 0 ? (
                    <div className="text-center py-10 text-xs text-text-muted italic border-2 border-dashed border-border/50 dark:border-border-dark/50 rounded-xl">
                      Empty column
                    </div>
                  ) : (
                    list.map(inc => (
                      <div
                        key={inc.id}
                        className={`bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-4 rounded-xl shadow-xs space-y-3 hover:border-brand/40 dark:hover:border-brand-dark/40 transition-all ${SEVERITY_COLORS[inc.severity] || ''}`}
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-technical font-bold text-text-muted">REPORT #{inc.id}</span>
                          <h4 className="font-bold text-text-primary dark:text-text-primary-dark text-xs leading-snug truncate">
                            {inc.title}
                          </h4>
                          <span className="text-[10px] text-brand hover:underline font-semibold block truncate">
                            {inc.segment?.name}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark line-clamp-3 leading-relaxed">
                          {inc.description}
                        </p>

                        <div className="border-t border-border dark:border-border-dark/80 pt-2.5 flex flex-col gap-1.5 text-[9px] text-text-muted">
                          {inc.latitude && (
                            <div className="flex items-center gap-1 font-technical">
                              <MapPin className="w-3 h-3 text-text-muted" /> Loc: {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-text-muted" /> {inc.reportedBy?.user?.name || 'Reporter'}
                          </div>
                          <div className="flex items-center gap-1 font-technical">
                            <Calendar className="w-3 h-3 text-text-muted" /> {new Date(inc.reportedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Inline status update */}
                        <div className="pt-2 border-t border-border/50 dark:border-border-dark/50 flex justify-between items-center">
                          <span className="text-[9px] font-bold text-text-muted uppercase">Status Gate:</span>
                          <select
                            value={inc.status}
                            onChange={(e) => handleUpdateStatus(inc.id, e.target.value)}
                            className="text-[9px] font-bold bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded px-2 py-0.5 text-text-secondary dark:text-text-secondary-dark cursor-pointer focus:outline-hidden"
                          >
                            <option value="Reported">Reported</option>
                            <option value="UnderInvestigation">Investigating</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Incident Drawer */}
      <Drawer isOpen={isReportDrawerOpen} onClose={() => setIsReportDrawerOpen(false)} title="Report Segment Incident" size="sm">
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="form-label">Pipeline Segment</label>
            <select
              required
              className="form-input"
              value={formData.segmentId}
              onChange={handleSegmentChange}
            >
              <option value="">Select Segment</option>
              {segments.map(seg => (
                <option key={seg.id} value={seg.id}>{seg.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Reported By</label>
            <select
              required
              className="form-input"
              value={formData.reportedById}
              onChange={e => setFormData(prev => ({ ...prev, reportedById: e.target.value }))}
            >
              <option value="">Select Reporter</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.designation})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Incident Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Cathodic rectifier voltage drops below limits"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Incident Details</label>
            <textarea
              required
              className="form-input min-h-[90px]"
              placeholder="Please provide full details of indicators, damage presence, or physical encroachments noticed..."
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Severity Level</label>
              <select
                className="form-input"
                value={formData.severity}
                onChange={e => setFormData(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="form-label">Initial Status</label>
              <select
                className="form-input"
                value={formData.status}
                onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Reported">Reported</option>
                <option value="UnderInvestigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                className="form-input font-technical"
                value={formData.latitude}
                onChange={e => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                className="form-input font-technical"
                value={formData.longitude}
                onChange={e => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Log Incident Report</button>
        </form>
      </Drawer>
    </div>
  );
};

export default PipelineIncidents;
