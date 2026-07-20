import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Drawer from '../components/Drawer';
import {
  ShieldAlert,
  AlertTriangle,
  Award,
  Bookmark,
  Calendar,
  Grid,
  Search,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckSquare,
  Plus
} from 'lucide-react';

const MatrixColors = (score) => {
  if (score >= 15) return 'bg-rose-500/10 border-rose-350 dark:bg-rose-950/20 dark:border-rose-900/50';
  if (score >= 8) return 'bg-amber-500/10 border-amber-350 dark:bg-amber-950/20 dark:border-amber-900/50';
  return 'bg-teal-500/10 border-teal-350 dark:bg-teal-950/20 dark:border-teal-900/50';
};

const ScoreColors = (score) => {
  if (score >= 15) return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100';
  if (score >= 8) return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100';
  return 'bg-teal-50 text-teal-600 dark:bg-teal-950/20 dark:text-teal-400 border border-teal-100';
};

const Risks = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Risks');
  const [risks, setRisks] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected Risk drawer
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isRiskDrawerOpen, setIsRiskDrawerOpen] = useState(false);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const riskRes = await fetch(`${apiUrl}/risks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const compRes = await fetch(`${apiUrl}/compliance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projRes = await fetch(`${apiUrl}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const riskData = await riskRes.json();
      const compData = await compRes.json();
      const projData = await projRes.json();

      if (riskData.success) setRisks(riskData.data);
      if (compData.success) setCompliance(compData.data);
      if (projData.success) setProjects(projData.data);
    } catch (err) {
      console.warn('Backend server offline. Loading mock risk & compliance register.');
      setProjects([
        { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority', serviceCategory: 'Buildings' },
        { id: 2, name: 'King Salman Park Infrastructure Master Plan', clientName: 'King Salman Park Foundation', serviceCategory: 'UrbanPlanning' }
      ]);
      setRisks([
        { id: 1, title: 'Structural deflection due to excavation weight shifts', description: 'Subsurface density variations deviating from initial borehole geotechnical assay reports during tunnel segments construction.', category: 'Technical', probability: 3, impact: 4, riskScore: 12, status: 'Open', mitigationPlan: 'Perform continuous load balancing using spatial sensors.', identifiedDate: '2026-02-10', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' }, owner: { user: { name: 'Mei Tanaka' } } },
        { id: 2, title: 'Steel grid supply chain backlogs', description: 'Global freight congestions hindering timely procurement of structural steel sections.', category: 'Schedule', probability: 4, impact: 3, riskScore: 12, status: 'Mitigating', mitigationPlan: 'Pre-order structural supplies 6 months in advance.', identifiedDate: '2026-02-15', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' }, owner: { user: { name: 'Carlos Mendez' } } },
        { id: 3, title: 'Right-of-Way licensing municipal delay', description: 'Failure to secure road easement clearances from municipal zoning department in Riyadh central park sectors.', category: 'Regulatory', probability: 2, impact: 5, riskScore: 10, status: 'Open', mitigationPlan: 'Submit expedited review petition and schedule daily direct alignment meetings.', identifiedDate: '2026-03-01', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan' }, owner: { user: { name: 'David Kojo' } } },
        { id: 4, title: 'Contract currency exchange fluctuation (SAR/USD)', description: 'Risk of financial loss due to contract payment currency terms.', category: 'Financial', probability: 1, impact: 2, riskScore: 2, status: 'Closed', mitigationPlan: 'Hedge transaction values inside local bank contracts.', identifiedDate: '2026-01-20', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan' }, owner: { user: { name: 'Sarah Jenkins' } } }
      ]);
      setCompliance([
        { id: 1, requirementName: 'Municipality Construction License', applicableServiceCategory: 'Buildings', status: 'Compliant', dueDate: '2026-05-15', notes: 'Expedited approval secured. Signed document uploaded.', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' } },
        { id: 2, requirementName: 'Civil Defense Fire Safety Code Cert', applicableServiceCategory: 'Buildings', status: 'InProgress', dueDate: '2026-08-30', notes: 'Inspection scheduled for next Tuesday.', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' } },
        { id: 3, requirementName: 'Environmental Impact Dossier Sign-off', applicableServiceCategory: 'UrbanPlanning', status: 'NonCompliant', dueDate: '2026-07-10', notes: 'Soil samples report delayed, missing sub-permit.', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan' } },
        { id: 4, requirementName: 'District Water Ring Grid Permit', applicableServiceCategory: 'UrbanPlanning', status: 'Pending', dueDate: '2026-09-15', notes: 'Zoning map drafts submitted to municipality.', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan' } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, apiUrl]);

  // Compute countdown for compliance items
  const getCountdownLabel = (dueDateStr, status) => {
    if (status === 'Compliant') return { text: 'Compliant', color: 'text-slate-400' };
    const today = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, color: 'text-rose-500 font-extrabold' };
    }
    if (diffDays === 0) {
      return { text: 'Due Today', color: 'text-amber-500 font-bold' };
    }
    if (diffDays <= 7) {
      return { text: `${diffDays} days left`, color: 'text-amber-500 font-semibold' };
    }
    return { text: `${diffDays} days left`, color: 'text-slate-400 font-technical' };
  };

  // Filter lists
  const filteredRisks = useMemo(() => {
    return risks.filter(r => {
      const matchCat = !filterCategory || r.category === filterCategory;
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchCat && matchStatus;
    });
  }, [risks, filterCategory, filterStatus]);

  const filteredCompliance = useMemo(() => {
    return compliance.filter(c => {
      const matchDiscipline = !filterDiscipline || c.applicableServiceCategory === filterDiscipline;
      const matchStatus = !filterStatus || c.status === filterStatus;
      return matchDiscipline && matchStatus;
    });
  }, [compliance, filterDiscipline, filterStatus]);

  // Group Compliance by Project
  const complianceByProject = useMemo(() => {
    const groups = {};
    filteredCompliance.forEach(c => {
      const projId = c.project?.id || 0;
      const projName = c.project?.name || 'General PMO Compliance';
      if (!groups[projId]) {
        groups[projId] = { name: projName, items: [] };
      }
      groups[projId].items.push(c);
    });
    return groups;
  }, [filteredCompliance]);

  // Plotted risk dots for 5x5 matrix
  const getMatrixRisks = (prob, imp) => {
    return risks.filter(r => r.probability === prob && r.impact === imp && r.status !== 'Closed');
  };

  // DataTable columns for Risks
  const columns = [
    {
      header: 'Risk Title',
      accessor: 'title',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => {
            setSelectedRisk(row);
            setIsRiskDrawerOpen(true);
          }}
          className="font-semibold text-slate-850 dark:text-slate-100 hover:underline cursor-pointer block"
        >
          {row.title}
        </span>
      )
    },
    {
      header: 'Project Scope',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500 truncate max-w-[150px] block">
          {row.project?.name || 'General PMO'}
        </span>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/50 rounded">
          {row.category}
        </span>
      )
    },
    {
      header: 'Prob',
      accessor: 'probability',
      render: (row) => <span className="font-technical text-xs font-bold text-slate-500 text-center block">{row.probability}/5</span>
    },
    {
      header: 'Impact',
      accessor: 'impact',
      render: (row) => <span className="font-technical text-xs font-bold text-slate-500 text-center block">{row.impact}/5</span>
    },
    {
      header: 'Score',
      accessor: 'riskScore',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex px-2.5 py-0.5 text-xs font-technical font-bold rounded-full ${ScoreColors(row.riskScore)}`}>
          {row.riskScore}
        </span>
      )
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
        const riskStatusMap = {
          Open: 'Pending',
          Mitigating: 'At Risk',
          Closed: 'Completed'
        };
        return <StatusBadge status={riskStatusMap[row.status] || row.status} />;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safety Risks & Compliance"
        breadcrumbs={['PetroFlow', 'Safety Risks & Compliance']}
      />

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
        {['Risks', 'Compliance Checklist'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setFilterStatus('');
            }}
            className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer relative select-none ${
              activeTab === tab
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-400 hover:text-slate-650 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 select-none">
          <Sliders className="w-4 h-4 text-teal-500 shrink-0" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Registry Filters</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeTab === 'Risks' ? (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded px-2.5 py-1.5 cursor-pointer text-slate-700 dark:text-slate-350"
            >
              <option value="">All Categories</option>
              <option value="Technical">Technical</option>
              <option value="Financial">Financial</option>
              <option value="Regulatory">Regulatory</option>
              <option value="Schedule">Schedule</option>
              <option value="Safety">Safety</option>
            </select>
          ) : (
            <select
              value={filterDiscipline}
              onChange={(e) => setFilterDiscipline(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded px-2.5 py-1.5 cursor-pointer text-slate-700 dark:text-slate-350"
            >
              <option value="">All Service Domains</option>
              <option value="Buildings">Buildings</option>
              <option value="UrbanPlanning">Urban Planning</option>
              <option value="HeatingCooling">Heating/Cooling</option>
              <option value="PowerTransmissionDistribution">Power T&D</option>
              <option value="WaterTreatment">Water Treatment</option>
              <option value="WastewaterTreatment">Wastewater Treatment</option>
              <option value="InteriorDesign">Interior Design</option>
              <option value="Healthcare">Healthcare Planning</option>
              <option value="BIM">BIM Execution</option>
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded px-2.5 py-1.5 cursor-pointer text-slate-700 dark:text-slate-350"
          >
            <option value="">All Statuses</option>
            {activeTab === 'Risks' ? (
              <>
                <option value="Open">Open</option>
                <option value="Mitigating">Mitigating</option>
                <option value="Closed">Closed</option>
              </>
            ) : (
              <>
                <option value="Pending">Pending</option>
                <option value="InProgress">In Progress</option>
                <option value="Compliant">Compliant</option>
                <option value="NonCompliant">Non-Compliant</option>
              </>
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[255px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : activeTab === 'Risks' ? (
        /* Risks view - 5x5 Matrix + Table */
        <div className="space-y-6">
          {/* 5x5 Grid Risk Matrix Visual representation */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col xl:flex-row items-center gap-8">
            <div className="w-full xl:w-auto shrink-0 select-none">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white mb-4 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-teal-500" />
                PMO Risk Severity Matrix (5x5)
              </h3>
              
              <div className="flex gap-4">
                {/* Y Axis Label (Impact) */}
                <div className="flex flex-col justify-between py-6 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-right w-12 h-64 shrink-0">
                  <span>5 critical</span>
                  <span>4 major</span>
                  <span>3 moderate</span>
                  <span>2 minor</span>
                  <span>1 negligible</span>
                </div>

                {/* 5x5 Grid */}
                <div className="space-y-1 w-64 h-64">
                  {[5, 4, 3, 2, 1].map((imp) => (
                    <div key={imp} className="flex gap-1 h-12">
                      {[1, 2, 3, 4, 5].map((prob) => {
                        const cellScore = prob * imp;
                        const cellRisks = getMatrixRisks(prob, imp);
                        return (
                          <div
                            key={prob}
                            className={`flex-1 border rounded-md flex flex-wrap items-center justify-center gap-1 p-0.5 transition-all relative ${MatrixColors(cellScore)}`}
                            title={`Probability: ${prob}, Impact: ${imp} (Score: ${cellScore})`}
                          >
                            {/* Render small circular dots representing active risks */}
                            {cellRisks.map((r, rIdx) => (
                              <div
                                key={r.id}
                                onClick={() => {
                                  setSelectedRisk(r);
                                  setIsRiskDrawerOpen(true);
                                }}
                                className="w-4 h-4 rounded-full bg-[#0F2A47] dark:bg-slate-800 border border-white text-white flex items-center justify-center text-[7px] font-bold cursor-pointer font-technical shrink-0 hover:scale-110 shadow-xs"
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
                  {/* X Axis labels */}
                  <div className="flex justify-between pt-1 font-bold text-[9px] text-slate-400 uppercase tracking-wider text-center">
                    <span className="w-12">1 rare</span>
                    <span className="w-12">2 unlikely</span>
                    <span className="w-12">3 possible</span>
                    <span className="w-12">4 likely</span>
                    <span className="w-12">5 almost certain</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix instructions */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-500">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">How to read the risk matrix:</h4>
              <p>
                Risks are classified by their likelihood of occurrence (horizontal probability scale) and severity of consequence (vertical impact scale).
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-5 py-1 text-center font-technical font-bold text-[9px] rounded bg-rose-500/10 border border-rose-300 text-rose-600">RED</span>
                  <span className="dark:text-slate-350">Critical Risk (Score 15-25) — Requires immediate mitigation sign-off.</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-5 py-1 text-center font-technical font-bold text-[9px] rounded bg-amber-500/10 border border-amber-300 text-amber-600">AMB</span>
                  <span className="dark:text-slate-350">Medium Risk (Score 8-14) — Action items assigned to division PM.</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="w-5 py-1 text-center font-technical font-bold text-[9px] rounded bg-teal-500/10 border border-teal-300 text-teal-600">GRN</span>
                  <span className="dark:text-slate-350">Low Risk (Score 1-7) — Monitored on regular log audits.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risks DataTable */}
          <DataTable
            columns={columns}
            data={filteredRisks}
            searchPlaceholder="Filter risk logs..."
            actions={[
              {
                label: 'View details',
                onClick: (row) => {
                  setSelectedRisk(row);
                  setIsRiskDrawerOpen(true);
                }
              }
            ]}
          />
        </div>
      ) : (
        /* Compliance checklist view grouped by project */
        <div className="space-y-6 select-none">
          {Object.keys(complianceByProject).map((projId) => {
            const group = complianceByProject[projId];
            return (
              <div
                key={projId}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3
                    onClick={() => projId !== '0' && navigate(`/projects/${projId}`)}
                    className="font-bold text-xs text-slate-800 dark:text-slate-200 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {group.name}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item) => {
                    const cd = getCountdownLabel(item.dueDate, item.status);
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-50/50 dark:bg-slate-850 p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-extrabold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                              {item.applicableServiceCategory} permit
                            </span>
                            <StatusBadge status={item.status === 'InProgress' ? 'In Progress' : item.status} />
                          </div>
                          
                          <h4 className="font-bold text-slate-850 dark:text-white text-xs mt-3 leading-snug">
                            {item.requirementName}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {item.notes || 'No description notes loaded.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-450 font-semibold block">Due: <strong className="font-technical text-slate-850 dark:text-slate-350">{item.dueDate}</strong></span>
                          <span className={cd.color}>{cd.text}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Risk Dossier Drawer */}
      <Drawer
        isOpen={isRiskDrawerOpen}
        onClose={() => setIsRiskDrawerOpen(false)}
        title="PMO Risk Dossier"
        footer={
          <button
            onClick={() => setIsRiskDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Close Dossier
          </button>
        }
      >
        {selectedRisk && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded">
                Risk ID: #{selectedRisk.id} — {selectedRisk.category} Category
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                {selectedRisk.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">Project: {selectedRisk.project?.name || 'General'}</p>
            </div>

            {/* Risk details grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl">
              <div>
                <span className="text-slate-450 font-bold uppercase block mb-1">Probability Rating</span>
                <span className="font-technical font-bold text-slate-850 dark:text-white text-sm">{selectedRisk.probability} / 5</span>
              </div>
              <div>
                <span className="text-slate-450 font-bold uppercase block mb-1">Impact Rating</span>
                <span className="font-technical font-bold text-slate-850 dark:text-white text-sm">{selectedRisk.impact} / 5</span>
              </div>
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <span className="text-slate-450 font-bold uppercase block mb-0.5">Calculated Score</span>
                <span className={`inline-flex px-2.5 py-0.5 text-xs font-technical font-bold rounded-full ${ScoreColors(selectedRisk.riskScore)}`}>
                  {selectedRisk.riskScore}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-150 dark:border-slate-800">
                <span className="text-slate-450 font-bold uppercase block mb-0.5">Risk Owner</span>
                <span className="font-semibold text-slate-850 dark:text-slate-350">
                  {selectedRisk.owner?.user?.name || 'PM'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Risk Description</h4>
              <p className="text-xs text-slate-500 leading-relaxed bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg">
                {selectedRisk.description || 'No description provided.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550">Approved Mitigation Plan</h4>
              <p className="text-xs text-slate-500 leading-relaxed bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-lg border-l-4 border-l-teal-500">
                {selectedRisk.mitigationPlan || 'Mitigation strategy pending review.'}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Risks;
