import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Drawer from '../components/Drawer';
import { Calendar as CalendarIcon, List, Plus, Wrench, User, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const PipelineMaintenance = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [maintenance, setMaintenance] = useState([]);
  const [segments, setSegments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const [formData, setFormData] = useState({
    segmentId: '',
    assetId: '',
    technicianId: '',
    maintenanceType: 'Preventive',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    status: 'Scheduled',
    workPerformed: '',
    nextDueDate: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const maintRes = await fetch(`${apiUrl}/pipeline/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const segRes = await fetch(`${apiUrl}/pipeline/segments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const empRes = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const maintData = await maintRes.json();
      const segData = await segRes.json();
      const empData = await empRes.json();

      if (maintData.success) setMaintenance(maintData.data);
      if (segData.success) setSegments(segData.data);
      if (empData.success) setEmployees(empData.data);
    } catch (err) {
      addToast('Error loading maintenance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenSchedule = () => {
    setFormData({
      segmentId: segments[0]?.id || '',
      assetId: '',
      technicianId: employees[0]?.id || '',
      maintenanceType: 'Preventive',
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: '',
      status: 'Scheduled',
      workPerformed: '',
      nextDueDate: ''
    });
    setIsScheduleDrawerOpen(true);
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          segmentId: Number(formData.segmentId),
          assetId: formData.assetId ? Number(formData.assetId) : null,
          technicianId: Number(formData.technicianId)
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Maintenance task scheduled successfully', 'success');
        setIsScheduleDrawerOpen(false);
        fetchData();
      } else {
        addToast(data.message || 'Failed to schedule maintenance', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleUpdateStatus = async (recordId, nextStatus) => {
    try {
      const body = { status: nextStatus };
      if (nextStatus === 'Completed') {
        body.completedDate = new Date().toISOString().split('T')[0];
      }
      const res = await fetch(`${apiUrl}/pipeline/maintenance/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Task marked as ${nextStatus}`, 'success');
        fetchData();
      } else {
        addToast(data.message || 'Failed to update maintenance task', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  // Helper: Get assets of selected segment for form
  const formSegmentAssets = formData.segmentId 
    ? segments.find(s => s.id === Number(formData.segmentId))?.assets || []
    : [];

  // ==========================================
  // CALENDAR GENERATOR LOGIC
  // ==========================================
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // Day of week (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Total days (28-31)
    return { firstDay, totalDays };
  };

  const { firstDay, totalDays } = getDaysInMonth(currentDate);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Map of date string -> maintenance tasks
  const maintenanceMap = React.useMemo(() => {
    const map = {};
    maintenance.forEach(m => {
      const dateStr = m.scheduledDate;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(m);
    });
    return map;
  }, [maintenance]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Maintenance"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Predictive Maintenance']}
        actions={
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-border dark:border-border-dark p-0.5 bg-surface dark:bg-surface-dark select-none">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'list' 
                    ? 'bg-brand dark:bg-brand-dark text-white' 
                    : 'text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark'
                }`}
              >
                <List className="w-3.5 h-3.5" /> List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'calendar' 
                    ? 'bg-brand dark:bg-brand-dark text-white' 
                    : 'text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>

            <button onClick={handleOpenSchedule} className="btn btn-brand flex items-center gap-2">
              <Plus className="w-4 h-4" /> Schedule Task
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : viewMode === 'list' ? (
        // LIST VIEW
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-xs">
          <table className="min-w-full divide-y divide-border dark:divide-border-dark">
            <thead className="bg-background dark:bg-background-dark text-left text-xs font-bold uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-6 py-3">Scheduled Date</th>
                <th className="px-6 py-3">Segment</th>
                <th className="px-6 py-3">Asset</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Technician</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Work Detail</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark text-sm text-text-secondary dark:text-text-secondary-dark">
              {maintenance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-text-muted">No maintenance records found.</td>
                </tr>
              ) : (
                maintenance.map(m => (
                  <tr key={m.id} className="hover:bg-background/20">
                    <td className="px-6 py-4 font-technical font-semibold">{m.scheduledDate}</td>
                    <td className="px-6 py-4 font-semibold text-text-primary dark:text-text-primary-dark">{m.segment?.name || 'N/A'}</td>
                    <td className="px-6 py-4">{m.asset?.name || 'Segment Direct'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        m.maintenanceType === 'Corrective' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-100' 
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100'
                      }`}>
                        {m.maintenanceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">{m.technician?.user?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        m.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        m.status === 'Overdue' ? 'bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-450 font-bold animate-pulse' :
                        'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate">{m.workPerformed || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {m.status !== 'Completed' && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'Completed')}
                          className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded px-2.5 py-1 font-bold cursor-pointer"
                        >
                          Mark Done
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // CALENDAR VIEW
        <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border dark:border-border-dark">
            <h3 className="font-bold text-sm text-text-primary dark:text-text-primary-dark">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-1.5 rounded-lg border border-border dark:border-border-dark hover:bg-background cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={nextMonth} className="p-1.5 rounded-lg border border-border dark:border-border-dark hover:bg-background cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-text-muted border-b border-border/50 pb-2">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mt-2">
            {/* Blank padding days for start offset */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] border border-transparent"></div>
            ))}

            {/* Actual days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayMaint = maintenanceMap[dateStr] || [];
              
              return (
                <div key={day} className="min-h-[110px] border border-border dark:border-border-dark/60 rounded-lg p-1.5 bg-background/20 dark:bg-background-dark/20 flex flex-col justify-between">
                  <span className="font-technical text-xs font-bold text-text-muted block text-right">{day}</span>
                  
                  <div className="flex-1 space-y-1 mt-1 overflow-y-auto max-h-[80px]">
                    {dayMaint.map(m => {
                      const isOverdue = m.status === 'Overdue';
                      const isCompleted = m.status === 'Completed';
                      return (
                        <div
                          key={m.id}
                          onClick={() => handleUpdateStatus(m.id, isCompleted ? 'Scheduled' : 'Completed')}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold truncate cursor-pointer hover:opacity-90 select-none ${
                            isCompleted 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : isOverdue 
                                ? 'bg-rose-500 text-white font-extrabold border border-rose-600' 
                                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                          title={`${m.maintenanceType}: ${m.segment?.name || ''} - ${m.workPerformed || ''}`}
                        >
                          {m.asset?.name ? `${m.asset.name.split(' ')[0]} - ${m.maintenanceType[0]}` : `Seg - ${m.maintenanceType[0]}`}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Maintenance Drawer */}
      <Drawer isOpen={isScheduleDrawerOpen} onClose={() => setIsScheduleDrawerOpen(false)} title="Schedule Maintenance Task" size="sm">
        <form onSubmit={handleScheduleMaintenance} className="space-y-4">
          <div>
            <label className="form-label">Pipeline Segment</label>
            <select
              required
              className="form-input"
              value={formData.segmentId}
              onChange={e => setFormData(prev => ({ ...prev, segmentId: e.target.value, assetId: '' }))}
            >
              <option value="">Select Segment</option>
              {segments.map(seg => (
                <option key={seg.id} value={seg.id}>{seg.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Asset Scope (Optional)</label>
              <select
                className="form-input"
                value={formData.assetId}
                onChange={e => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              >
                <option value="">Segment Direct (No specific asset)</option>
                {formSegmentAssets.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetType})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Maintenance Type</label>
              <select
                className="form-input"
                value={formData.maintenanceType}
                onChange={e => setFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}
              >
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Technician</label>
            <select
              required
              className="form-input"
              value={formData.technicianId}
              onChange={e => setFormData(prev => ({ ...prev, technicianId: e.target.value }))}
            >
              <option value="">Select Technician</option>
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
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.nextDueDate}
                onChange={e => setFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Initial Status</label>
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
          <div>
            <label className="form-label">Work description</label>
            <textarea
              className="form-input min-h-[60px]"
              placeholder="e.g. Clean flow transmitter sensors and recalibrate inlet parameters..."
              value={formData.workPerformed}
              onChange={e => setFormData(prev => ({ ...prev, workPerformed: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Maintenance Task</button>
        </form>
      </Drawer>
    </div>
  );
};

export default PipelineMaintenance;
