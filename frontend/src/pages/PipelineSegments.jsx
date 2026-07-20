import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { Plus, Eye, Edit, Trash2, ArrowRight } from 'lucide-react';

export const PIPELINE_STATUS_CONFIG = {
  Operational: { label: 'Operational', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30' },
  UnderMaintenance: { label: 'Under Maintenance', color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30' },
  ShutDown: { label: 'Shut Down', color: 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/30' },
  Critical: { label: 'Critical', color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30' }
};

export const PipelineStatusBadge = ({ status }) => {
  const config = PIPELINE_STATUS_CONFIG[status] || { label: status, color: 'bg-slate-50 text-slate-600 border border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full select-none ${config.color}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 shrink-0" />
      {config.label}
    </span>
  );
};

const PipelineSegments = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer & Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    region: 'Eastern Region',
    segmentType: 'Transmission',
    material: '',
    diameterInches: '',
    designPressure: '',
    installDate: '',
    status: 'Operational',
    latStart: '',
    lngStart: '',
    latEnd: '',
    lngEnd: '',
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/pipeline/segments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSegments(data.data);
      } else {
        addToast(data.message || 'Failed to fetch segments', 'error');
      }
    } catch (err) {
      addToast('Error loading pipeline segments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleOpenCreate = () => {
    setSelectedSegment(null);
    setIsEditMode(false);
    setFormData({
      name: '',
      region: 'Eastern Region',
      segmentType: 'Transmission',
      material: 'Carbon Steel (API 5L X70)',
      diameterInches: '36.0',
      designPressure: '1200.0',
      installDate: new Date().toISOString().split('T')[0],
      status: 'Operational',
      latStart: '26.28',
      lngStart: '50.11',
      latEnd: '26.39',
      lngEnd: '50.19',
      description: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (seg) => {
    setSelectedSegment(seg);
    setIsEditMode(true);
    setFormData({
      name: seg.name,
      region: seg.region,
      segmentType: seg.segmentType,
      material: seg.material,
      diameterInches: String(seg.diameterInches),
      designPressure: String(seg.designPressure),
      installDate: seg.installDate,
      status: seg.status,
      latStart: String(seg.latStart),
      lngStart: String(seg.lngStart),
      latEnd: String(seg.latEnd),
      lngEnd: String(seg.lngEnd),
      description: seg.description || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleOpenDelete = (seg) => {
    setSegmentToDelete(seg);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.region.trim()) errors.region = 'Region is required';
    if (!formData.material.trim()) errors.material = 'Material is required';
    
    const diameter = parseFloat(formData.diameterInches);
    if (isNaN(diameter) || diameter <= 0) errors.diameterInches = 'Must be a positive number';
    
    const pressure = parseFloat(formData.designPressure);
    if (isNaN(pressure) || pressure <= 0) errors.designPressure = 'Must be a positive number';
    
    if (!formData.installDate) errors.installDate = 'Install date is required';
    
    const latStart = parseFloat(formData.latStart);
    if (isNaN(latStart) || latStart < -90 || latStart > 90) errors.latStart = 'Invalid latitude (-90 to 90)';
    
    const lngStart = parseFloat(formData.lngStart);
    if (isNaN(lngStart) || lngStart < -180 || lngStart > 180) errors.lngStart = 'Invalid longitude (-180 to 180)';

    const latEnd = parseFloat(formData.latEnd);
    if (isNaN(latEnd) || latEnd < -90 || latEnd > 90) errors.latEnd = 'Invalid latitude (-90 to 90)';
    
    const lngEnd = parseFloat(formData.lngEnd);
    if (isNaN(lngEnd) || lngEnd < -180 || lngEnd > 180) errors.lngEnd = 'Invalid longitude (-180 to 180)';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bodyData = {
      ...formData,
      diameterInches: parseFloat(formData.diameterInches),
      designPressure: parseFloat(formData.designPressure),
      latStart: parseFloat(formData.latStart),
      lngStart: parseFloat(formData.lngStart),
      latEnd: parseFloat(formData.latEnd),
      lngEnd: parseFloat(formData.lngEnd)
    };

    try {
      const url = isEditMode 
        ? `${apiUrl}/pipeline/segments/${selectedSegment.id}` 
        : `${apiUrl}/pipeline/segments`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();

      if (data.success) {
        addToast(`Segment ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
        setIsFormOpen(false);
        fetchSegments();
      } else {
        addToast(data.message || 'Operation failed', 'error');
      }
    } catch (err) {
      addToast('Network error, please try again', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${apiUrl}/pipeline/segments/${segmentToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        addToast('Segment deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchSegments();
      } else {
        addToast(data.message || 'Failed to delete segment', 'error');
      }
    } catch (err) {
      addToast('Network error, please try again', 'error');
    }
  };

  // Form fields change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Format DataTable Data
  const tableData = useMemo(() => {
    return segments.map(seg => {
      // Find open incidents count
      const openIncidents = seg.incidents?.filter(i => ['Reported', 'UnderInvestigation'].includes(i.status)).length || 0;
      
      // Find last inspection date
      const completedInspections = seg.inspections?.filter(i => i.status === 'Completed') || [];
      const lastInspection = completedInspections.length > 0
        ? completedInspections.reduce((latest, current) => {
            return new Date(current.completedDate) > new Date(latest.completedDate) ? current : latest;
          }, completedInspections[0])
        : null;

      return {
        ...seg,
        openIncidentsCount: openIncidents,
        lastInspectionDate: lastInspection ? lastInspection.completedDate : 'N/A'
      };
    });
  }, [segments]);

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="font-semibold text-text-primary dark:text-text-primary-dark">
          {row.name}
        </div>
      )
    },
    {
      header: 'Region',
      accessor: 'region',
      sortable: true
    },
    {
      header: 'Type',
      accessor: 'segmentType',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.segmentType}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (row) => <PipelineStatusBadge status={row.status} />
    },
    {
      header: 'Last Inspection',
      accessor: 'lastInspectionDate',
      sortable: true
    },
    {
      header: 'Open Incidents',
      accessor: 'openIncidentsCount',
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center justify-center font-technical font-bold text-xs w-6 h-6 rounded-full ${
          row.openIncidentsCount > 0 
            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' 
            : 'bg-slate-100 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
        }`}>
          {row.openIncidentsCount}
        </span>
      )
    }
  ];

  const tableActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => navigate(`/pipeline/segments/${row.id}`)
    },
    {
      label: 'Edit Segment',
      icon: Edit,
      onClick: (row) => handleOpenEdit(row)
    },
    {
      label: 'Delete Segment',
      icon: Trash2,
      onClick: (row) => handleOpenDelete(row),
      danger: true
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Segments Grid"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Segments Grid']}
        actions={
          <button
            onClick={handleOpenCreate}
            className="btn btn-brand flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Segment
          </button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tableData}
          searchPlaceholder="Search pipeline segments..."
          filterField="region"
          filterLabel="Region"
          filterOptions={[
            { label: 'Eastern Region', value: 'Eastern Region' },
            { label: 'Western Region', value: 'Western Region' },
            { label: 'Northern Region', value: 'Northern Region' }
          ]}
          actions={tableActions}
          emptyStateTitle="No segments found"
          emptyStateDescription="Ensure the seeder database ran correctly, or add a new pipeline segment."
        />
      )}

      {/* Drawer Form */}
      <Drawer
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={isEditMode ? 'Edit Pipeline Segment' : 'Create Pipeline Segment'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="form-label">Segment Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${formErrors.name ? 'border-rose-500' : ''}`}
                placeholder="e.g. Dammam-Dhahran Transmission Line"
              />
              {formErrors.name && <p className="text-rose-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Eastern Region">Eastern Region</option>
                  <option value="Western Region">Western Region</option>
                  <option value="Northern Region">Northern Region</option>
                </select>
              </div>

              <div>
                <label className="form-label">Segment Type</label>
                <select
                  name="segmentType"
                  value={formData.segmentType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Transmission">Transmission</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Gathering">Gathering</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.material ? 'border-rose-500' : ''}`}
                  placeholder="e.g. Carbon Steel (API 5L X70)"
                />
                {formErrors.material && <p className="text-rose-500 text-xs mt-1">{formErrors.material}</p>}
              </div>

              <div>
                <label className="form-label">Install Date</label>
                <input
                  type="date"
                  name="installDate"
                  value={formData.installDate}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.installDate ? 'border-rose-500' : ''}`}
                />
                {formErrors.installDate && <p className="text-rose-500 text-xs mt-1">{formErrors.installDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Diameter (Inches)</label>
                <input
                  type="number"
                  name="diameterInches"
                  step="0.1"
                  value={formData.diameterInches}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.diameterInches ? 'border-rose-500' : ''}`}
                  placeholder="e.g. 36.0"
                />
                {formErrors.diameterInches && <p className="text-rose-500 text-xs mt-1">{formErrors.diameterInches}</p>}
              </div>

              <div>
                <label className="form-label">Design Pressure (PSI)</label>
                <input
                  type="number"
                  name="designPressure"
                  step="1"
                  value={formData.designPressure}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.designPressure ? 'border-rose-500' : ''}`}
                  placeholder="e.g. 1200"
                />
                {formErrors.designPressure && <p className="text-rose-500 text-xs mt-1">{formErrors.designPressure}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Operational">Operational</option>
                  <option value="UnderMaintenance">Under Maintenance</option>
                  <option value="ShutDown">Shut Down</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="border-t border-border dark:border-border-dark pt-4">
              <h4 className="font-Technical text-xs font-bold text-text-muted dark:text-text-muted-dark uppercase tracking-wider mb-2">Coordinates (Lat / Lng)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Latitude</label>
                  <input
                    type="number"
                    name="latStart"
                    step="0.0001"
                    value={formData.latStart}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.latStart ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 26.2800"
                  />
                  {formErrors.latStart && <p className="text-rose-500 text-xs mt-1">{formErrors.latStart}</p>}
                </div>
                <div>
                  <label className="form-label">Start Longitude</label>
                  <input
                    type="number"
                    name="lngStart"
                    step="0.0001"
                    value={formData.lngStart}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.lngStart ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 50.1100"
                  />
                  {formErrors.lngStart && <p className="text-rose-500 text-xs mt-1">{formErrors.lngStart}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="form-label">End Latitude</label>
                  <input
                    type="number"
                    name="latEnd"
                    step="0.0001"
                    value={formData.latEnd}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.latEnd ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 26.3900"
                  />
                  {formErrors.latEnd && <p className="text-rose-500 text-xs mt-1">{formErrors.latEnd}</p>}
                </div>
                <div>
                  <label className="form-label">End Longitude</label>
                  <input
                    type="number"
                    name="lngEnd"
                    step="0.0001"
                    value={formData.lngEnd}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.lngEnd ? 'border-rose-500' : ''}`}
                    placeholder="e.g. 50.1900"
                  />
                  {formErrors.lngEnd && <p className="text-rose-500 text-xs mt-1">{formErrors.lngEnd}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input min-h-[80px]"
                placeholder="Detailed segment routing and operational parameters..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-border-dark">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-brand"
            >
              {isEditMode ? 'Update Segment' : 'Create Segment'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Pipeline Segment"
        confirmText="Delete Segment"
        cancelText="Cancel"
        onConfirm={handleDelete}
        type="danger"
      >
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Are you sure you want to delete <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segmentToDelete?.name}</span>?
          This action cannot be undone and will delete all associated assets, inspection logs, and incident reports.
        </p>
      </Modal>
    </div>
  );
};

export default PipelineSegments;
