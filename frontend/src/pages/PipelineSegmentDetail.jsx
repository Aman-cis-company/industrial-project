import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Drawer from '../components/Drawer';
import Modal from '../components/Modal';
import { PipelineStatusBadge, PIPELINE_STATUS_CONFIG } from './PipelineSegments';
import { CardSkeleton } from '../components/LoadingSkeleton';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Activity, 
  Settings, 
  Clipboard, 
  AlertOctagon, 
  Wrench, 
  FileCheck, 
  MapPin, 
  Plus, 
  Calendar, 
  User, 
  Clock, 
  CheckSquare, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';

// Fix Leaflet default icon issues in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom component to adjust map view based on segment coordinates
const RecenterMap = ({ start, end }) => {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      const bounds = L.latLngBounds([start, end]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [start, end, map]);
  return null;
};

// Risk helper functions matching PMO style
const ScoreColors = (score) => {
  if (score >= 15) return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100';
  if (score >= 8) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100';
  return 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100';
};

const MatrixColors = (score) => {
  if (score >= 15) return 'bg-rose-500/10 border-rose-350 dark:bg-rose-950/20 dark:border-rose-900/50';
  if (score >= 8) return 'bg-amber-500/10 border-amber-350 dark:bg-amber-950/20 dark:border-amber-900/50';
  return 'bg-teal-500/10 border-teal-350 dark:bg-teal-950/20 dark:border-teal-900/50';
};

const PipelineSegmentDetail = () => {
  const { id } = useParams();
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [segment, setSegment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Drawers and Modals States
  const [isAssetDrawerOpen, setIsAssetDrawerOpen] = useState(false);
  const [isInspectionDrawerOpen, setIsInspectionDrawerOpen] = useState(false);
  const [isIncidentDrawerOpen, setIsIncidentDrawerOpen] = useState(false);
  const [isMaintenanceDrawerOpen, setIsMaintenanceDrawerOpen] = useState(false);
  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);
  const [isComplianceDrawerOpen, setIsComplianceDrawerOpen] = useState(false);

  // Asset Form State
  const [assetFormData, setAssetFormData] = useState({
    name: '',
    assetType: 'Valve',
    installDate: new Date().toISOString().split('T')[0],
    lastServiceDate: '',
    status: 'Operational'
  });

  // Inspection Form State
  const [inspectionFormData, setInspectionFormData] = useState({
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
    attachmentUrls: []
  });

  // Incident Form State
  const [incidentFormData, setIncidentFormData] = useState({
    reportedById: '',
    title: '',
    description: '',
    severity: 'Low',
    status: 'Reported',
    latitude: '',
    longitude: ''
  });

  // Maintenance Form State
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    assetId: '',
    technicianId: '',
    maintenanceType: 'Preventive',
    scheduledDate: new Date().toISOString().split('T')[0],
    completedDate: '',
    status: 'Scheduled',
    workPerformed: '',
    nextDueDate: ''
  });

  // Risk Form State
  const [riskFormData, setRiskFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    probability: 3,
    impact: 3,
    status: 'Open',
    mitigationPlan: '',
    ownerId: '',
    identifiedDate: new Date().toISOString().split('T')[0]
  });

  // Compliance Form State
  const [complianceFormData, setComplianceFormData] = useState({
    requirementName: '',
    applicableServiceCategory: 'Safety Certification',
    status: 'Pending',
    dueDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchFullDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/pipeline/segments/${id}/full`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSegment(data.data);
      } else {
        addToast('Failed to fetch segment details', 'error');
        navigate('/pipeline/segments');
      }
    } catch (err) {
      addToast('Error loading segment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${apiUrl}/employees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFullDetails();
    fetchEmployees();
  }, [id]);

  // Submit Handlers
  const handleAddAsset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...assetFormData, segmentId: Number(id) })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Asset added successfully', 'success');
        setIsAssetDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to add asset', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleAddInspection = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/inspections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...inspectionFormData,
          segmentId: Number(id),
          inspectorId: Number(inspectionFormData.inspectorId)
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Inspection logged successfully', 'success');
        setIsInspectionDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to log inspection', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleAddIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...incidentFormData,
          segmentId: Number(id),
          reportedById: Number(incidentFormData.reportedById),
          latitude: incidentFormData.latitude ? parseFloat(incidentFormData.latitude) : null,
          longitude: incidentFormData.longitude ? parseFloat(incidentFormData.longitude) : null
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Incident reported successfully', 'success');
        setIsIncidentDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to report incident', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/pipeline/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...maintenanceFormData,
          segmentId: Number(id),
          assetId: maintenanceFormData.assetId ? Number(maintenanceFormData.assetId) : null,
          technicianId: Number(maintenanceFormData.technicianId)
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Maintenance task scheduled successfully', 'success');
        setIsMaintenanceDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to schedule maintenance', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleAddRisk = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/risks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...riskFormData,
          segmentId: Number(id),
          ownerId: Number(riskFormData.ownerId)
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Risk added to registry', 'success');
        setIsRiskDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to add risk', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleAddCompliance = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...complianceFormData,
          segmentId: Number(id)
        })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Compliance requirement created', 'success');
        setIsComplianceDrawerOpen(false);
        fetchFullDetails();
      } else {
        addToast(data.message || 'Failed to create compliance item', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const getMatrixRisks = (prob, imp) => {
    return segment?.risks?.filter(r => r.probability === prob && r.impact === imp && r.status !== 'Closed') || [];
  };

  const getSegmentColor = (status) => {
    switch (status) {
      case 'Operational': return '#10B981'; // Green
      case 'UnderMaintenance': return '#F59E0B'; // Amber
      case 'ShutDown': return '#64748B'; // Gray
      case 'Critical': return '#EF4444'; // Red
      default: return '#3B82F6';
    }
  };

  if (loading || !segment) {
    return <CardSkeleton />;
  }

  // Lat/Lng mapping
  const startPos = [segment.latStart, segment.lngStart];
  const endPos = [segment.latEnd, segment.lngEnd];
  const polylineCoords = [startPos, endPos];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'assets', label: 'Assets', icon: Settings },
    { id: 'inspections', label: 'Inspections', icon: Clipboard },
    { id: 'incidents', label: 'Incidents', icon: AlertOctagon },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'compliance-risk', label: 'Compliance & Risk', icon: FileCheck }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={segment.name}
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Segments', segment.name]}
        actions={
          <div className="flex items-center gap-2">
            <PipelineStatusBadge status={segment.status} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="border-b border-border dark:border-border-dark flex items-center gap-6 overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 select-none relative ${
                activeTab === tab.id
                  ? 'border-brand text-brand dark:text-brand-dark'
                  : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {/* 1. OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold pb-2 border-b border-border/50">Technical Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm bg-background/50 dark:bg-background-dark/30 p-5 rounded-xl border border-border/50 dark:border-border-dark/30 shadow-inner">
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Region</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.region}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Segment Type</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.segmentType}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Material</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.material}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Diameter</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.diameterInches} Inches</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Design Pressure</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.designPressure} PSI</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Install Date</span>
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{segment.installDate}</span>
                  </div>
                </div>
                <div className="border-t border-border dark:border-border-dark pt-4">
                  <span className="text-text-muted block text-[10px] font-bold uppercase tracking-wider mb-1">Description</span>
                  <p className="text-text-secondary dark:text-text-secondary-dark">{segment.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Map Location */}
              <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand dark:text-brand-dark" />
                  Routing Coordinates & Map
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs font-technical border-b border-border dark:border-border-dark pb-4">
                  <div>
                    <span className="text-text-muted uppercase tracking-wider font-bold block mb-1">Start Lat / Lng</span>
                    <span>{segment.latStart.toFixed(5)} , {segment.lngStart.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="text-text-muted uppercase tracking-wider font-bold block mb-1">End Lat / Lng</span>
                    <span>{segment.latEnd.toFixed(5)} , {segment.lngEnd.toFixed(5)}</span>
                  </div>
                </div>
                <div className="h-96 rounded-lg overflow-hidden border border-border dark:border-border-dark z-0 relative">
                  <MapContainer center={startPos} zoom={11} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RecenterMap start={startPos} end={endPos} />
                    <Polyline 
                      positions={polylineCoords} 
                      color={getSegmentColor(segment.status)}
                      weight={5}
                      opacity={0.8}
                    />
                    <CircleMarker center={startPos} radius={6} color="#000" fillColor="#10B981" fillOpacity={1}>
                      <Popup>Start: {segment.name}</Popup>
                    </CircleMarker>
                    <CircleMarker center={endPos} radius={6} color="#000" fillColor="#EF4444" fillOpacity={1}>
                      <Popup>End: {segment.name}</Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </div>
            </div>

            {/* Quick Stats sidebar panel */}
            <div className="space-y-6">
              <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold">Segment Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-border dark:border-border-dark pb-2">
                    <span className="text-text-muted">Total Assets</span>
                    <span className="font-technical font-bold text-base">{segment.assets?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border dark:border-border-dark pb-2">
                    <span className="text-text-muted">Open Incidents</span>
                    <span className="font-technical font-bold text-base text-rose-500">{segment.incidents?.filter(i => ['Reported', 'UnderInvestigation'].includes(i.status)).length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b border-border dark:border-border-dark pb-2">
                    <span className="text-text-muted">Scheduled Inspections</span>
                    <span className="font-technical font-bold text-base text-brand dark:text-brand-dark">{segment.inspections?.filter(i => i.status === 'Scheduled').length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-muted">Overdue Maintenance</span>
                    <span className="font-technical font-bold text-base text-amber-500">{segment.maintenanceRecords?.filter(m => m.status === 'Overdue').length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ASSETS PANEL */}
        {activeTab === 'assets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Pipeline Assets</h3>
              <button onClick={() => setIsAssetDrawerOpen(true)} className="btn btn-brand flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </div>
            <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-background dark:bg-background-dark text-left text-xs font-bold uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-6 py-3">Asset Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Install Date</th>
                    <th className="px-6 py-3">Last Service Date</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark text-sm text-text-secondary dark:text-text-secondary-dark">
                  {segment.assets?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-text-muted">No assets found.</td>
                    </tr>
                  ) : (
                    segment.assets?.map((asset) => (
                      <tr key={asset.id} className="hover:bg-background/20">
                        <td className="px-6 py-4 font-semibold text-text-primary dark:text-text-primary-dark">{asset.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-650 dark:text-slate-350">
                            {asset.assetType}
                          </span>
                        </td>
                        <td className="px-6 py-4">{asset.installDate}</td>
                        <td className="px-6 py-4">{asset.lastServiceDate || 'Never'}</td>
                        <td className="px-6 py-4">
                          <PipelineStatusBadge status={asset.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. INSPECTIONS PANEL */}
        {activeTab === 'inspections' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Inspection History</h3>
              <button onClick={() => setIsInspectionDrawerOpen(true)} className="btn btn-brand flex items-center gap-2">
                <Plus className="w-4 h-4" /> Log Inspection
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {segment.inspections?.length === 0 ? (
                <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-8 text-center text-text-muted">No inspections found.</div>
              ) : (
                segment.inspections?.map((log) => (
                  <div key={log.id} className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-text-primary dark:text-text-primary-dark">Log #{log.id}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          log.status === 'Overdue' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Scheduled: {log.scheduledDate}</span>
                        {log.completedDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Completed: {log.completedDate}</span>}
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> Inspector: {log.inspector?.user?.name || 'Unknown'}</span>
                      </div>
                      {log.notes && <p className="text-sm text-text-secondary dark:text-text-secondary-dark bg-background dark:bg-background-dark/50 p-3 rounded-lg border border-border/50 dark:border-border-dark/30 mt-2">{log.notes}</p>}
                    </div>

                    {log.checklistData && (
                      <div className="md:w-72 shrink-0 bg-background dark:bg-background-dark/50 p-4 border border-border/50 dark:border-border-dark/30 rounded-lg text-xs space-y-1.5 font-technical">
                        <div className="font-bold text-text-primary dark:text-text-primary-dark border-b border-border/50 pb-1 mb-2">Checklist Results:</div>
                        {Object.entries(log.checklistData).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-text-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className={`font-bold ${val === 'Pass' || val === 'None Detected' || val === 'Yes' || val === 'Verified Smooth' || val === 'Negligible' ? 'text-emerald-500' : 'text-rose-500'}`}>{val}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 4. INCIDENTS PANEL */}
        {activeTab === 'incidents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Incident Logs</h3>
              <button onClick={() => setIsIncidentDrawerOpen(true)} className="btn btn-brand flex items-center gap-2">
                <Plus className="w-4 h-4" /> Report Incident
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {segment.incidents?.length === 0 ? (
                <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-8 text-center text-text-muted">No incidents logged.</div>
              ) : (
                segment.incidents?.map((inc) => (
                  <div key={inc.id} className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-text-primary dark:text-text-primary-dark">{inc.title}</h4>
                        <div className="flex flex-wrap gap-2 text-xs text-text-muted select-none">
                          <span>Severity:</span>
                          <span className={`font-semibold ${
                            inc.severity === 'Critical' || inc.severity === 'High' ? 'text-rose-500' : 
                            inc.severity === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                          }`}>{inc.severity}</span>
                          <span>&bull;</span>
                          <span>Reported: {new Date(inc.reportedAt).toLocaleDateString()} by {inc.reportedBy?.user?.name || 'Reporter'}</span>
                          {inc.resolvedAt && (
                            <>
                              <span>&bull;</span>
                              <span className="text-emerald-500 font-medium">Resolved: {new Date(inc.resolvedAt).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        inc.status === 'Resolved' || inc.status === 'Closed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100' :
                        inc.status === 'UnderInvestigation' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100' :
                        'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border border-slate-200/50'
                      }`}>
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{inc.description}</p>
                    {inc.latitude && inc.longitude && (
                      <div className="text-[10px] text-text-muted font-technical flex items-center gap-1 bg-background dark:bg-background-dark/30 p-1.5 rounded w-max">
                        <MapPin className="w-3 h-3 text-brand" /> Loc: {inc.latitude.toFixed(5)} , {inc.longitude.toFixed(5)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. MAINTENANCE PANEL */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">Maintenance Records</h3>
              <button onClick={() => setIsMaintenanceDrawerOpen(true)} className="btn btn-brand flex items-center gap-2">
                <Plus className="w-4 h-4" /> Schedule Maintenance
              </button>
            </div>
            <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-border dark:divide-border-dark">
                <thead className="bg-background dark:bg-background-dark text-left text-xs font-bold uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-6 py-3">Scheduled Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Asset Scope</th>
                    <th className="px-6 py-3">Technician</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Work Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-border-dark text-sm text-text-secondary dark:text-text-secondary-dark">
                  {segment.maintenanceRecords?.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-text-muted">No maintenance records found.</td>
                    </tr>
                  ) : (
                    segment.maintenanceRecords?.map((m) => (
                      <tr key={m.id} className="hover:bg-background/20">
                        <td className="px-6 py-4 font-technical font-semibold">{m.scheduledDate}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            m.maintenanceType === 'Corrective' 
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' 
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                          }`}>
                            {m.maintenanceType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-primary dark:text-text-primary-dark">{m.asset?.name || 'Segment Direct'}</td>
                        <td className="px-6 py-4">{m.technician?.user?.name || 'Unassigned'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                            m.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                            m.status === 'Overdue' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-bold animate-pulse' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-[200px] truncate">{m.workPerformed || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. COMPLIANCE & RISK PANEL */}
        {activeTab === 'compliance-risk' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Risk Matrix Scoped to Segment */}
              <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border-dark">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4.5 h-4.5 text-brand dark:text-brand-dark" />
                    Segment Risk Matrix (5x5)
                  </h3>
                  <button onClick={() => setIsRiskDrawerOpen(true)} className="btn btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Log Risk
                  </button>
                </div>

                <div className="flex gap-4 select-none">
                  {/* Y Axis */}
                  <div className="flex flex-col justify-between py-5 font-bold text-[9px] text-text-muted uppercase tracking-wider text-right w-12 h-48 shrink-0">
                    <span>5 critical</span>
                    <span>4 major</span>
                    <span>3 moderate</span>
                    <span>2 minor</span>
                    <span>1 negligible</span>
                  </div>

                  {/* 5x5 Grid */}
                  <div className="space-y-1 w-48 h-48">
                    {[5, 4, 3, 2, 1].map((imp) => (
                      <div key={imp} className="flex gap-1 h-9">
                        {[1, 2, 3, 4, 5].map((prob) => {
                          const cellScore = prob * imp;
                          const cellRisks = getMatrixRisks(prob, imp);
                          return (
                            <div
                              key={prob}
                              className={`flex-1 border rounded flex flex-wrap items-center justify-center gap-0.5 p-0.5 transition-all relative ${MatrixColors(cellScore)}`}
                              title={`Prob: ${prob}, Imp: ${imp} (Score: ${cellScore})`}
                            >
                              {cellRisks.map((r) => (
                                <div
                                  key={r.id}
                                  className="w-3.5 h-3.5 rounded-full bg-[#0F2A47] dark:bg-slate-800 border border-white text-white flex items-center justify-center text-[6px] font-bold cursor-pointer shrink-0"
                                  title={r.title}
                                >
                                  {r.id}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 font-bold text-[8px] text-text-muted uppercase tracking-wider text-center">
                      <span className="w-10">1 rare</span>
                      <span className="w-10">2 unlik</span>
                      <span className="w-10">3 poss</span>
                      <span className="w-10">4 lik</span>
                      <span className="w-10">5 cert</span>
                    </div>
                  </div>
                </div>

                {/* Risk list */}
                <div className="border-t border-border dark:border-border-dark pt-4 space-y-2 max-h-60 overflow-y-auto">
                  {segment.risks?.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">No active risks registered.</p>
                  ) : (
                    segment.risks?.map(risk => (
                      <div key={risk.id} className="text-xs flex justify-between items-center p-2 rounded bg-background dark:bg-background-dark/30 border border-border/50">
                        <div className="truncate max-w-[70%]">
                          <span className="font-bold font-technical mr-1 bg-slate-100 dark:bg-slate-850 px-1 py-0.5 rounded">R{risk.id}</span>
                          <span className="font-semibold text-text-primary dark:text-text-primary-dark">{risk.title}</span>
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded font-technical font-bold text-[9px] ${ScoreColors(risk.riskScore)}`}>
                          Score {risk.riskScore}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Compliance Checklist Scoped to Segment */}
              <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border dark:border-border-dark">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <CheckSquare className="w-4.5 h-4.5 text-brand dark:text-brand-dark" />
                    Regulatory Permits & Compliance
                  </h3>
                  <button onClick={() => setIsComplianceDrawerOpen(true)} className="btn btn-secondary text-xs px-2.5 py-1 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Add Permit
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {segment.complianceItems?.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-10">No compliance permits listed.</p>
                  ) : (
                    segment.complianceItems?.map(item => (
                      <div key={item.id} className="p-3 bg-background dark:bg-background-dark/30 border border-border/50 dark:border-border-dark/30 rounded-lg flex justify-between items-start gap-4">
                        <div className="space-y-1 text-xs">
                          <h4 className="font-bold text-text-primary dark:text-text-primary-dark">{item.requirementName}</h4>
                          <p className="text-text-muted text-[10px]">Category: <span className="font-medium text-text-secondary dark:text-text-secondary-dark">{item.applicableServiceCategory}</span></p>
                          <p className="text-text-muted text-[10px]">Due: <span className="font-technical font-bold">{item.dueDate}</span></p>
                          {item.notes && <p className="text-[10px] italic text-text-secondary/70 mt-1">&bull; {item.notes}</p>}
                        </div>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          item.status === 'NonCompliant' ? 'bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-450' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          DRAWERS FOR TABS CREATIONS
         ========================================== */}
      
      {/* 1. Add Asset Drawer */}
      <Drawer isOpen={isAssetDrawerOpen} onClose={() => setIsAssetDrawerOpen(false)} title="Add Pipeline Asset" size="sm">
        <form onSubmit={handleAddAsset} className="space-y-4">
          <div>
            <label className="form-label">Asset Name</label>
            <input 
              type="text" 
              required
              className="form-input" 
              placeholder="e.g. Dammam Valve 1"
              value={assetFormData.name}
              onChange={e => setAssetFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Asset Type</label>
            <select 
              className="form-input" 
              value={assetFormData.assetType}
              onChange={e => setAssetFormData(prev => ({ ...prev, assetType: e.target.value }))}
            >
              <option value="Valve">Valve</option>
              <option value="Station">Station</option>
              <option value="PumpUnit">Pump Unit</option>
              <option value="Sensor">Sensor</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Install Date</label>
              <input 
                type="date" 
                required
                className="form-input" 
                value={assetFormData.installDate}
                onChange={e => setAssetFormData(prev => ({ ...prev, installDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Last Service Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={assetFormData.lastServiceDate}
                onChange={e => setAssetFormData(prev => ({ ...prev, lastServiceDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select 
              className="form-input" 
              value={assetFormData.status}
              onChange={e => setAssetFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Operational">Operational</option>
              <option value="UnderMaintenance">Under Maintenance</option>
              <option value="ShutDown">Shut Down</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Asset</button>
        </form>
      </Drawer>

      {/* 2. Log Inspection Drawer */}
      <Drawer isOpen={isInspectionDrawerOpen} onClose={() => setIsInspectionDrawerOpen(false)} title="Log Inspection Record" size="sm">
        <form onSubmit={handleAddInspection} className="space-y-4">
          <div>
            <label className="form-label">Inspector (Employee)</label>
            <select 
              required
              className="form-input"
              value={inspectionFormData.inspectorId}
              onChange={e => setInspectionFormData(prev => ({ ...prev, inspectorId: e.target.value }))}
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
                value={inspectionFormData.scheduledDate}
                onChange={e => setInspectionFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Completed Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={inspectionFormData.completedDate}
                onChange={e => setInspectionFormData(prev => ({ ...prev, completedDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Inspection Status</label>
            <select 
              className="form-input"
              value={inspectionFormData.status}
              onChange={e => setInspectionFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          
          <div className="bg-background dark:bg-background-dark/30 p-3 rounded border border-border/50 text-xs space-y-3">
            <div className="font-bold border-b border-border/30 pb-1">Checklist Builder:</div>
            {Object.keys(inspectionFormData.checklistData).map(key => (
              <div key={key} className="flex justify-between items-center">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <select 
                  className="bg-surface text-xs rounded border p-0.5"
                  value={inspectionFormData.checklistData[key]}
                  onChange={e => {
                    const val = e.target.value;
                    setInspectionFormData(prev => ({
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
            <label className="form-label">Inspection Notes</label>
            <textarea 
              className="form-input min-h-[70px]" 
              value={inspectionFormData.notes}
              onChange={e => setInspectionFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Inspection Log</button>
        </form>
      </Drawer>

      {/* 3. Report Incident Drawer */}
      <Drawer isOpen={isIncidentDrawerOpen} onClose={() => setIsIncidentDrawerOpen(false)} title="Report Segment Incident" size="sm">
        <form onSubmit={handleAddIncident} className="space-y-4">
          <div>
            <label className="form-label">Reporter (Employee)</label>
            <select 
              required
              className="form-input"
              value={incidentFormData.reportedById}
              onChange={e => setIncidentFormData(prev => ({ ...prev, reportedById: e.target.value }))}
            >
              <option value="">Select Employee</option>
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
              placeholder="e.g. Cathodic potential drops"
              value={incidentFormData.title}
              onChange={e => setIncidentFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea 
              required
              className="form-input min-h-[80px]" 
              value={incidentFormData.description}
              onChange={e => setIncidentFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Severity</label>
              <select 
                className="form-input"
                value={incidentFormData.severity}
                onChange={e => setIncidentFormData(prev => ({ ...prev, severity: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select 
                className="form-input"
                value={incidentFormData.status}
                onChange={e => setIncidentFormData(prev => ({ ...prev, status: e.target.value }))}
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
              <label className="form-label">Latitude (Optional)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input font-technical"
                value={incidentFormData.latitude}
                onChange={e => setIncidentFormData(prev => ({ ...prev, latitude: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Longitude (Optional)</label>
              <input 
                type="number" 
                step="0.0001"
                className="form-input font-technical" 
                value={incidentFormData.longitude}
                onChange={e => setIncidentFormData(prev => ({ ...prev, longitude: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Submit Incident Report</button>
        </form>
      </Drawer>

      {/* 4. Schedule Maintenance Drawer */}
      <Drawer isOpen={isMaintenanceDrawerOpen} onClose={() => setIsMaintenanceDrawerOpen(false)} title="Schedule Maintenance Task" size="sm">
        <form onSubmit={handleAddMaintenance} className="space-y-4">
          <div>
            <label className="form-label">Technician (Employee)</label>
            <select 
              required
              className="form-input"
              value={maintenanceFormData.technicianId}
              onChange={e => setMaintenanceFormData(prev => ({ ...prev, technicianId: e.target.value }))}
            >
              <option value="">Select Technician</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.designation})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Maintenance Scope</label>
              <select 
                className="form-input"
                value={maintenanceFormData.assetId}
                onChange={e => setMaintenanceFormData(prev => ({ ...prev, assetId: e.target.value }))}
              >
                <option value="">Segment Direct (No specific asset)</option>
                {segment.assets?.map(asset => (
                  <option key={asset.id} value={asset.id}>{asset.name} ({asset.assetType})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Maintenance Type</label>
              <select 
                className="form-input"
                value={maintenanceFormData.maintenanceType}
                onChange={e => setMaintenanceFormData(prev => ({ ...prev, maintenanceType: e.target.value }))}
              >
                <option value="Preventive">Preventive</option>
                <option value="Corrective">Corrective</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Scheduled Date</label>
              <input 
                type="date" 
                required
                className="form-input" 
                value={maintenanceFormData.scheduledDate}
                onChange={e => setMaintenanceFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Next Due Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={maintenanceFormData.nextDueDate}
                onChange={e => setMaintenanceFormData(prev => ({ ...prev, nextDueDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select 
              className="form-input"
              value={maintenanceFormData.status}
              onChange={e => setMaintenanceFormData(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="form-label">Work Performed Description</label>
            <textarea 
              className="form-input min-h-[60px]" 
              value={maintenanceFormData.workPerformed}
              onChange={e => setMaintenanceFormData(prev => ({ ...prev, workPerformed: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Maintenance Schedule</button>
        </form>
      </Drawer>

      {/* 5. Log Risk Drawer */}
      <Drawer isOpen={isRiskDrawerOpen} onClose={() => setIsRiskDrawerOpen(false)} title="Add Risk to Registry" size="sm">
        <form onSubmit={handleAddRisk} className="space-y-4">
          <div>
            <label className="form-label">Risk Title</label>
            <input 
              type="text" 
              required
              className="form-input" 
              placeholder="e.g. Ground soil shifting"
              value={riskFormData.title}
              onChange={e => setRiskFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea 
              className="form-input min-h-[60px]" 
              value={riskFormData.description}
              onChange={e => setRiskFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select 
                className="form-input"
                value={riskFormData.category}
                onChange={e => setRiskFormData(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="Technical">Technical</option>
                <option value="Financial">Financial</option>
                <option value="Regulatory">Regulatory</option>
                <option value="Schedule">Schedule</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
            <div>
              <label className="form-label">Risk Owner</label>
              <select 
                required
                className="form-input"
                value={riskFormData.ownerId}
                onChange={e => setRiskFormData(prev => ({ ...prev, ownerId: e.target.value }))}
              >
                <option value="">Select Owner</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.user?.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Probability (1-5)</label>
              <input 
                type="number" 
                min="1" 
                max="5"
                required
                className="form-input font-technical" 
                value={riskFormData.probability}
                onChange={e => setRiskFormData(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="form-label">Impact (1-5)</label>
              <input 
                type="number" 
                min="1" 
                max="5"
                required
                className="form-input font-technical" 
                value={riskFormData.impact}
                onChange={e => setRiskFormData(prev => ({ ...prev, impact: parseInt(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Mitigation Plan</label>
            <textarea 
              className="form-input min-h-[60px]" 
              value={riskFormData.mitigationPlan}
              onChange={e => setRiskFormData(prev => ({ ...prev, mitigationPlan: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Record Risk</button>
        </form>
      </Drawer>

      {/* 6. Add Compliance Permit Drawer */}
      <Drawer isOpen={isComplianceDrawerOpen} onClose={() => setIsComplianceDrawerOpen(false)} title="Register Compliance Requirement" size="sm">
        <form onSubmit={handleAddCompliance} className="space-y-4">
          <div>
            <label className="form-label">Requirement / Permit Name</label>
            <input 
              type="text" 
              required
              className="form-input" 
              placeholder="e.g. ASME Safety Certification"
              value={complianceFormData.requirementName}
              onChange={e => setComplianceFormData(prev => ({ ...prev, requirementName: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Compliance Domain Type</label>
            <select 
              className="form-input"
              value={complianceFormData.applicableServiceCategory}
              onChange={e => setComplianceFormData(prev => ({ ...prev, applicableServiceCategory: e.target.value }))}
            >
              <option value="Environmental Clearance">Environmental Clearance</option>
              <option value="Safety Certification">Safety Certification</option>
              <option value="Regulatory Permit">Regulatory Permit</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Compliance Status</label>
              <select 
                className="form-input"
                value={complianceFormData.status}
                onChange={e => setComplianceFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Compliant">Compliant</option>
                <option value="NonCompliant">Non-Compliant</option>
              </select>
            </div>
            <div>
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                required
                className="form-input" 
                value={complianceFormData.dueDate}
                onChange={e => setComplianceFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Permit Notes</label>
            <textarea 
              className="form-input min-h-[60px]" 
              value={complianceFormData.notes}
              onChange={e => setComplianceFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-brand w-full mt-4">Save Permit</button>
        </form>
      </Drawer>
    </div>
  );
};

export default PipelineSegmentDetail;
