import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { PipelineStatusBadge } from './PipelineSegments';
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Activity, 
  MapPin, 
  ArrowRight, 
  X, 
  Settings, 
  AlertTriangle, 
  Wrench,
  Layers
} from 'lucide-react';

// Fit map bounds to show all segments
const FitAllBounds = ({ segments }) => {
  const map = useMap();
  useEffect(() => {
    if (segments && segments.length > 0) {
      const bounds = [];
      segments.forEach(seg => {
        bounds.push([seg.latStart, seg.lngStart]);
        bounds.push([seg.latEnd, seg.lngEnd]);
      });
      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
      }
    }
  }, [segments, map]);
  return null;
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

const PipelineMap = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

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
        addToast(data.message || 'Failed to load pipeline segments', 'error');
      }
    } catch (err) {
      addToast('Error loading segment coordinates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, []);

  const handleSegmentClick = (seg) => {
    setSelectedSegment(seg);
    setIsSidePanelOpen(true);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <PageHeader
        title="Interactive Telemetry Map"
        breadcrumbs={['PetroFlow', 'Pipeline Monitoring', 'Interactive Telemetry Map']}
        actions={
          <button 
            onClick={() => navigate('/pipeline/segments')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Layers className="w-4 h-4" /> Segment Grid
          </button>
        }
      />

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative rounded-xl border border-border dark:border-border-dark overflow-hidden bg-surface dark:bg-surface-dark flex shadow-sm">
          
          {/* Map view */}
          <div className="flex-1 h-full z-0 relative">
            <MapContainer 
              center={[20.5937, 78.9629]} 
              zoom={5} 
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitAllBounds segments={segments} />
              
              {segments.map((seg) => {
                const start = [seg.latStart, seg.lngStart];
                const end = [seg.latEnd, seg.lngEnd];
                const color = getSegmentColor(seg.status);
                
                return (
                  <React.Fragment key={seg.id}>
                    {/* Polyline pipeline route */}
                    <Polyline
                      positions={[start, end]}
                      color={color}
                      weight={6}
                      opacity={0.8}
                      eventHandlers={{
                        click: () => handleSegmentClick(seg)
                      }}
                    />

                    {/* Nodes at end-points */}
                    <CircleMarker
                      center={start}
                      radius={5}
                      color="#000"
                      weight={1}
                      fillColor={color}
                      fillOpacity={0.9}
                      eventHandlers={{
                        click: () => handleSegmentClick(seg)
                      }}
                    />
                    <CircleMarker
                      center={end}
                      radius={5}
                      color="#000"
                      weight={1}
                      fillColor={color}
                      fillOpacity={0.9}
                      eventHandlers={{
                        click: () => handleSegmentClick(seg)
                      }}
                    />
                  </React.Fragment>
                );
              })}
            </MapContainer>
          </div>

          {/* Floating quick info panel */}
          {isSidePanelOpen && selectedSegment && (
            <div className="w-80 md:w-96 border-l border-border/80 dark:border-border-dark/80 bg-surface/95 dark:bg-surface-dark/95 backdrop-blur-md h-full flex flex-col shrink-0 z-10 shadow-2xl transition-all duration-200">
              
              {/* Header */}
              <div className="p-5 border-b border-border/65 dark:border-border-dark/65 flex justify-between items-start gap-4 bg-gradient-to-r from-brand/5 to-transparent">
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-technical uppercase tracking-wider text-text-muted font-bold block">
                    {selectedSegment.region}
                  </span>
                  <h3 className="font-bold text-sm text-text-primary dark:text-text-primary-dark truncate">
                    {selectedSegment.name}
                  </h3>
                  <PipelineStatusBadge status={selectedSegment.status} />
                </div>
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="text-text-muted hover:text-text-primary dark:hover:text-text-primary-dark p-1 rounded-lg hover:bg-background cursor-pointer shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-text-secondary dark:text-text-secondary-dark">
                
                {/* Specifications */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Technical Specifications</h4>
                  <div className="grid grid-cols-2 gap-3.5 bg-background/60 dark:bg-background-dark/50 p-4 rounded-xl border border-border/50 dark:border-border-dark/30 shadow-inner">
                    <div>
                      <span className="text-[9px] font-technical text-text-muted block">Material</span>
                      <span className="font-semibold text-text-primary dark:text-text-primary-dark truncate block">{selectedSegment.material}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-technical text-text-muted block">Install Date</span>
                      <span className="font-semibold text-text-primary dark:text-text-primary-dark block">{selectedSegment.installDate}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-technical text-text-muted block">Diameter</span>
                      <span className="font-semibold text-text-primary dark:text-text-primary-dark block">{selectedSegment.diameterInches}&quot;</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-technical text-text-muted block">Design Pressure</span>
                      <span className="font-semibold text-text-primary dark:text-text-primary-dark block">{selectedSegment.designPressure} PSI</span>
                    </div>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="space-y-1.5">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Geographical Bounds</h4>
                  <div className="font-technical space-y-1 bg-background/50 dark:bg-background-dark/30 p-2.5 rounded border border-border/30">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Start:</span>
                      <span>{selectedSegment.latStart.toFixed(5)} , {selectedSegment.lngStart.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">End:</span>
                      <span>{selectedSegment.latEnd.toFixed(5)} , {selectedSegment.lngEnd.toFixed(5)}</span>
                    </div>
                  </div>
                </div>

                {/* Operations Checklist Counts */}
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Segment Operational Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="flex items-center gap-1.5 text-text-muted"><Settings className="w-3.5 h-3.5" /> Total Assets</span>
                      <span className="font-technical font-semibold">{selectedSegment.assets?.length || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="flex items-center gap-1.5 text-text-muted"><AlertTriangle className="w-3.5 h-3.5" /> Open Incidents</span>
                      <span className="font-technical font-bold text-rose-500">{selectedSegment.incidents?.filter(i => ['Reported', 'UnderInvestigation'].includes(i.status)).length || 0}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="flex items-center gap-1.5 text-text-muted"><Activity className="w-3.5 h-3.5" /> Total Inspections</span>
                      <span className="font-technical font-semibold">{selectedSegment.inspections?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5 text-text-muted"><Wrench className="w-3.5 h-3.5" /> Maintenance Tasks</span>
                      <span className="font-technical font-semibold">{selectedSegment.maintenanceRecords?.length || 0}</span>
                    </div>
                  </div>
                </div>

                {selectedSegment.description && (
                  <div className="space-y-1.5">
                    <h4 className="font-bold uppercase tracking-wider text-[10px] text-text-muted">Description</h4>
                    <p className="text-[11px] leading-relaxed text-text-muted bg-background/30 p-2.5 border border-border/30 rounded">
                      {selectedSegment.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border dark:border-border-dark bg-background/20">
                <button
                  onClick={() => navigate(`/pipeline/segments/${selectedSegment.id}`)}
                  className="w-full btn btn-brand flex items-center justify-center gap-2"
                >
                  View Full Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineMap;
