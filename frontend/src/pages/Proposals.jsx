import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Drawer from '../components/Drawer';
import {
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Grid,
  List,
  ChevronRight,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Briefcase,
  Sliders,
  PhoneCall,
  User,
  Building
} from 'lucide-react';

const RelationshipStatusColors = {
  Active: 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400',
  Prospect: 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400',
  Inactive: 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
};

const Proposals = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('Pipeline');
  const [pipelineData, setPipelineData] = useState({ pipeline: { Draft: [], Sent: [], Negotiation: [], Won: [], Lost: [] }, totalValue: 0, winRate: 0, wonValue: 0 });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal
  const [isAddProposalOpen, setIsAddProposalOpen] = useState(false);
  const [newProposalData, setNewProposalData] = useState({
    title: '',
    clientId: '',
    serviceCategory: 'Buildings',
    estimatedValue: '',
    status: 'Draft',
    // Inline Client creation details
    isNewClient: false,
    newCompanyName: '',
    newIndustry: 'Construction',
    newContactName: '',
    newContactEmail: ''
  });

  // Client Details Drawer
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientDetails, setClientDetails] = useState({ client: null, proposals: [], projects: [] });
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [loadingClientDetails, setLoadingClientDetails] = useState(false);

  // Fetch Pipeline and Clients
  const fetchCRMData = async () => {
    try {
      setLoading(true);
      const pipeRes = await fetch(`${apiUrl}/crm/pipeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const clientRes = await fetch(`${apiUrl}/crm/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pipeData = await pipeRes.json();
      const clientData = await clientRes.json();

      if (pipeData.success) setPipelineData(pipeData.data);
      if (clientData.success) setClients(clientData.data);
    } catch (err) {
      console.warn('Backend server offline. Setting mock CRM datasets.');
      // Local seed fallbacks
      const mockClients = [
        { id: 1, companyName: 'NEOM Authority', industry: 'Infrastructure & Smart Cities', contactPersonName: 'Fahad Al-Qahtani', contactEmail: 'fahad@neom.com', contactPhone: '+966-50-111-2222', relationshipStatus: 'Active', projectsCount: 2 },
        { id: 2, companyName: 'Saudi Aramco', industry: 'Oil & Gas / Energy', contactPersonName: 'Khalid Al-Ghamdi', contactEmail: 'khalid@aramco.com', contactPhone: '+966-50-222-3333', relationshipStatus: 'Active', projectsCount: 1 },
        { id: 3, companyName: 'Diriyah Gate Development Authority (DGDA)', industry: 'Tourism & Real Estate Heritage', contactPersonName: 'Sarah Al-Saud', contactEmail: 'sarah@dgda.gov.sa', contactPhone: '+966-50-333-4444', relationshipStatus: 'Active', projectsCount: 1 },
        { id: 4, companyName: 'National Water Company (NWC)', industry: 'Utilities / Water Management', contactPersonName: 'Mohammed Al-Harbi', contactEmail: 'mohammed@nwc.com.sa', contactPhone: '+966-50-444-5555', relationshipStatus: 'Active', projectsCount: 1 },
        { id: 5, companyName: 'Red Sea Global (RSG)', industry: 'Real Estate & Hospitality', contactPersonName: 'Abdullah Al-Dossary', contactEmail: 'abdullah@redseaglobal.com', contactPhone: '+966-50-555-6666', relationshipStatus: 'Active', projectsCount: 1 },
        { id: 6, companyName: 'ROSHN Real Estate Co.', industry: 'Real Estate Development', contactPersonName: 'Yousef Al-Malki', contactEmail: 'yousef@roshn.sa', contactPhone: '+966-50-666-7777', relationshipStatus: 'Active', projectsCount: 1 },
        { id: 11, companyName: 'Jabal Omar Development', industry: 'Real Estate & Hospitality', contactPersonName: 'Hisham Al-Farsi', contactEmail: 'hisham@jabalomar.com.sa', contactPhone: '+966-50-111-3333', relationshipStatus: 'Prospect', projectsCount: 0 }
      ];

      const mockPipeline = {
        Draft: [
          { id: 4, title: 'Jabal Omar Boutique Hotel Digital Twin models', serviceCategory: 'BIM', estimatedValue: 3200000.00, status: 'Draft', client: { companyName: 'Jabal Omar Development' } }
        ],
        Sent: [
          { id: 2, title: 'Red Sea Resort Solar array battery storage', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 4800000.00, status: 'Sent', client: { companyName: 'Red Sea Global (RSG)' } }
        ],
        Negotiation: [
          { id: 1, title: 'Wastewater Treatment Plant Extension Phase 3', serviceCategory: 'WastewaterTreatment', estimatedValue: 12400000.00, status: 'Negotiation', client: { companyName: 'National Water Company (NWC)' } },
          { id: 5, title: 'NEOM Spine structural tunnel segment analysis', serviceCategory: 'Buildings', estimatedValue: 18500000.00, status: 'Negotiation', client: { companyName: 'NEOM Authority' } }
        ],
        Won: [
          { id: 3, title: 'ROSHN Towers Modular BIM Coordination contract', serviceCategory: 'BIM', estimatedValue: 6500000.00, status: 'Won', client: { companyName: 'ROSHN Real Estate Co.' } }
        ],
        Lost: [
          { id: 8, title: 'Al-Khobar Municipality canal expansions', serviceCategory: 'WastewaterTreatment', estimatedValue: 14500000.00, status: 'Lost', client: { companyName: 'National Water Company (NWC)' } }
        ]
      };

      setClients(mockClients);
      setPipelineData({
        pipeline: mockPipeline,
        totalValue: 59900000.00,
        winRate: 50,
        wonValue: 6500000.00
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCRMData();
  }, [token, apiUrl]);

  // Click single client details
  const openClientDetailDrawer = async (client) => {
    setSelectedClient(client);
    setIsClientDrawerOpen(true);
    try {
      setLoadingClientDetails(true);
      const res = await fetch(`${apiUrl}/crm/clients/${client.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setClientDetails(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Mock Client details histories
      setClientDetails({
        client,
        proposals: [
          { id: 101, title: 'Substation underground cabling survey', serviceCategory: 'PowerTransmissionDistribution', estimatedValue: 8500000, status: 'Won', sentDate: '2026-04-10' }
        ],
        projects: [
          { id: 1, name: 'NEOM Spine Tunnel Structural Design', currentPhase: 'Execution', status: 'OnTrack', budget: 45000000 }
        ]
      });
    } finally {
      setLoadingClientDetails(false);
    }
  };

  // Submit Proposal (including inline Client creation)
  const handleAddProposal = async (e) => {
    e.preventDefault();
    if (!newProposalData.title.trim() || !newProposalData.estimatedValue) {
      addToast('Please enter a proposal title and value', 'warning');
      return;
    }

    try {
      let finalClientId = newProposalData.clientId;

      // Handle inline Client creation first
      if (newProposalData.isNewClient) {
        if (!newProposalData.newCompanyName || !newProposalData.newContactName || !newProposalData.newContactEmail) {
          addToast('Please fill in new client firm requirements', 'warning');
          return;
        }

        const clientRes = await fetch(`${apiUrl}/crm/clients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            companyName: newProposalData.newCompanyName,
            industry: newProposalData.newIndustry,
            contactPersonName: newProposalData.newContactName,
            contactEmail: newProposalData.newContactEmail,
            relationshipStatus: 'Prospect'
          })
        });
        const clientJson = await clientRes.json();
        if (clientJson.success) {
          finalClientId = clientJson.data.id;
        } else {
          throw new Error(clientJson.message);
        }
      }

      if (!finalClientId) {
        addToast('Please choose or create a client', 'warning');
        return;
      }

      // Create Proposal
      const res = await fetch(`${apiUrl}/crm/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newProposalData.title,
          clientId: finalClientId,
          serviceCategory: newProposalData.serviceCategory,
          estimatedValue: parseFloat(newProposalData.estimatedValue),
          status: newProposalData.status
        })
      });

      const data = await res.json();
      if (data.success) {
        addToast('Proposal committed to pipeline', 'success');
        fetchCRMData();
        setIsAddProposalOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Mock local update fallback
      const mockClientObj = clients.find(c => c.id === Number(newProposalData.clientId)) || { companyName: newProposalData.newCompanyName || 'Prospect Firm' };
      const newProp = {
        id: Math.random(),
        title: newProposalData.title,
        serviceCategory: newProposalData.serviceCategory,
        estimatedValue: parseFloat(newProposalData.estimatedValue),
        status: newProposalData.status,
        client: { companyName: mockClientObj.companyName }
      };

      const updatedPipeline = { ...pipelineData.pipeline };
      updatedPipeline[newProposalData.status] = [...(updatedPipeline[newProposalData.status] || []), newProp];

      setPipelineData({
        ...pipelineData,
        pipeline: updatedPipeline,
        totalValue: pipelineData.totalValue + newProp.estimatedValue
      });

      addToast('Proposal committed (Demo Local Cache)', 'success');
      setIsAddProposalOpen(false);
    }
  };

  const handleUpdateProposalStatus = async (proposalId, nextStatus) => {
    try {
      const res = await fetch(`${apiUrl}/crm/proposals/${proposalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Proposal pipeline stage shifted', 'success');
        fetchCRMData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Update local state by shifting proposal between status arrays
      const updatedPipeline = { ...pipelineData.pipeline };
      let foundProp = null;

      // Find and remove
      Object.keys(updatedPipeline).forEach(status => {
        const idx = updatedPipeline[status].findIndex(p => p.id === proposalId);
        if (idx > -1) {
          foundProp = updatedPipeline[status][idx];
          updatedPipeline[status].splice(idx, 1);
        }
      });

      // Insert to next
      if (foundProp) {
        foundProp.status = nextStatus;
        updatedPipeline[nextStatus].push(foundProp);
        setPipelineData({ ...pipelineData, pipeline: updatedPipeline });
        addToast('Pipeline stage shifted (Demo)', 'success');
      }
    }
  };

  // DataTable columns for Clients registry
  const clientColumns = [
    {
      header: 'Company Name',
      accessor: 'companyName',
      sortable: true,
      render: (row) => (
        <span
          onClick={() => openClientDetailDrawer(row)}
          className="font-bold text-slate-850 dark:text-white hover:underline cursor-pointer flex items-center gap-1.5"
        >
          <Building className="w-4 h-4 text-slate-450 shrink-0" />
          {row.companyName}
        </span>
      )
    },
    {
      header: 'Industry Sector',
      accessor: 'industry',
      sortable: true,
      render: (row) => <span className="text-xs text-slate-550 truncate max-w-[150px] block">{row.industry}</span>
    },
    {
      header: 'Contact Person',
      accessor: 'contactPersonName',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{row.contactPersonName}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.contactEmail}</p>
        </div>
      )
    },
    {
      header: 'Partner status',
      accessor: 'relationshipStatus',
      sortable: true,
      render: (row) => (
        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full ${RelationshipStatusColors[row.relationshipStatus]}`}>
          {row.relationshipStatus}
        </span>
      )
    },
    {
      header: 'Active Projects',
      accessor: 'projectsCount',
      sortable: true,
      render: (row) => (
        <span className="font-technical font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">
          {row.projectsCount || 0} active
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM & Pipeline Desk"
        breadcrumbs={['AeroPMO', 'CRM Pipeline']}
      />

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6">
        {['Pipeline', 'Clients Database'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {activeTab === 'Pipeline' ? (
        /* Proposal Pipeline visual */
        <div className="space-y-6">
          {/* Summary stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
            {/* Total Pipeline */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg">
                <DollarSign className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Total Pipeline Value</span>
                <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
                  SAR {pipelineData.totalValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Negotiation Win Rate</span>
                <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
                  {pipelineData.winRate}%
                </span>
              </div>
            </div>

            {/* Won Value */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Won Contract Values</span>
                <span className="text-2xl font-bold font-technical text-slate-900 dark:text-white block mt-1">
                  SAR {pipelineData.wonValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setNewProposalData({
                  title: '',
                  clientId: clients[0]?.id || '',
                  serviceCategory: 'Buildings',
                  estimatedValue: '',
                  status: 'Draft',
                  isNewClient: false,
                  newCompanyName: '',
                  newIndustry: 'Construction',
                  newContactName: '',
                  newContactEmail: ''
                });
                setIsAddProposalOpen(true);
              }}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Draft Proposal
            </button>
          </div>

          {/* Kanban Board columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 items-start select-none">
            {Object.keys(pipelineData.pipeline).map((status) => {
              const colProposals = pipelineData.pipeline[status] || [];
              const colHeaders = {
                Draft: { title: 'Drafting', color: 'border-t-slate-400 bg-slate-100/10' },
                Sent: { title: 'Sent to Client', color: 'border-t-sky-500 bg-sky-50/5' },
                Negotiation: { title: 'Under Negotiation', color: 'border-t-amber-500 bg-amber-50/5' },
                Won: { title: 'Won / Signed', color: 'border-t-emerald-500 bg-emerald-50/5' },
                Lost: { title: 'Lost / Closed', color: 'border-t-rose-500 bg-rose-50/5' }
              };

              return (
                <div
                  key={status}
                  className="bg-slate-50/60 dark:bg-slate-900/35 border border-slate-200/50 dark:border-slate-800 rounded-xl p-3 min-h-[400px] flex flex-col gap-3"
                >
                  <div className={`p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 border-t-2 rounded-lg flex justify-between items-center ${colHeaders[status].color}`}>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{colHeaders[status].title}</span>
                    <span className="px-2 py-0.5 text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 text-slate-500 rounded font-technical font-bold">{colProposals.length}</span>
                  </div>

                  <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[500px]">
                    {colProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xs hover:shadow-sm space-y-3 cursor-grab"
                      >
                        <div>
                          <span className="text-[9px] uppercase tracking-wide font-extrabold text-slate-400 block mb-1">
                            {prop.serviceCategory || 'Engineering'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 leading-snug line-clamp-2">
                            {prop.title}
                          </h4>
                          <span className="text-[9px] text-slate-450 mt-1 block">
                            Client: {prop.client?.companyName}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="font-technical font-extrabold text-slate-700 dark:text-slate-300">
                            SAR {(prop.estimatedValue / 1000000).toFixed(1)}M
                          </span>
                          
                          {/* Shift stages select */}
                          <select
                            value={prop.status}
                            onChange={(e) => handleUpdateProposalStatus(prop.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-0.5 text-[9px] font-bold cursor-pointer"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Negotiation">Negot.</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Clients Datatable */
        <DataTable
          columns={clientColumns}
          data={clients}
          searchPlaceholder="Search clients..."
          actions={[
            {
              label: 'View details',
              onClick: (row) => openClientDetailDrawer(row)
            }
          ]}
        />
      )}

      {/* New Proposal Modal (with inline client option) */}
      <Modal
        isOpen={isAddProposalOpen}
        onClose={() => setIsAddProposalOpen(false)}
        title="Draft New Contract Proposal"
        footer={
          <>
            <button
              onClick={() => setIsAddProposalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProposal}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Commit Draft
            </button>
          </>
        }
      >
        <form onSubmit={handleAddProposal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">
              Proposal Name *
            </label>
            <input
              type="text"
              required
              value={newProposalData.title}
              onChange={(e) => setNewProposalData({ ...newProposalData, title: e.target.value })}
              placeholder="e.g. Phase 2 Geothermal Cooling Upgrade"
              className="w-full bg-white dark:bg-slate-800 border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>

          {/* Client select type toggle */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-850 p-2.5 border rounded-xl select-none">
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                checked={!newProposalData.isNewClient}
                onChange={() => setNewProposalData({ ...newProposalData, isNewClient: false })}
                className="text-teal-600 focus:ring-teal-500"
              />
              Choose Existing
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                checked={newProposalData.isNewClient}
                onChange={() => setNewProposalData({ ...newProposalData, isNewClient: true })}
                className="text-teal-600 focus:ring-teal-500"
              />
              Create New Client
            </label>
          </div>

          {!newProposalData.isNewClient ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">
                Client Organization *
              </label>
              <select
                value={newProposalData.clientId}
                required={!newProposalData.isNewClient}
                onChange={(e) => setNewProposalData({ ...newProposalData, clientId: e.target.value })}
                className="w-full bg-white dark:bg-slate-805 border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="">Select client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
          ) : (
            /* Inline Client Form fields */
            <div className="p-4 border rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-850">
              <p className="text-[10px] font-bold text-teal-600 uppercase">New Client Profile parameters</p>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Company name *</label>
                <input type="text" required={newProposalData.isNewClient} value={newProposalData.newCompanyName} onChange={e=>setNewProposalData({...newProposalData, newCompanyName: e.target.value})} className="w-full bg-white dark:bg-slate-800 border rounded px-2.5 py-1 text-xs text-slate-850" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact name *</label>
                  <input type="text" required={newProposalData.isNewClient} value={newProposalData.newContactName} onChange={e=>setNewProposalData({...newProposalData, newContactName: e.target.value})} className="w-full bg-white dark:bg-slate-800 border rounded px-2.5 py-1 text-xs text-slate-850" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Email *</label>
                  <input type="email" required={newProposalData.isNewClient} value={newProposalData.newContactEmail} onChange={e=>setNewProposalData({...newProposalData, newContactEmail: e.target.value})} className="w-full bg-white dark:bg-slate-800 border rounded px-2.5 py-1 text-xs text-slate-850" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">
                Service category
              </label>
              <select
                value={newProposalData.serviceCategory}
                onChange={(e) => setNewProposalData({ ...newProposalData, serviceCategory: e.target.value })}
                className="w-full bg-white dark:bg-slate-805 border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white cursor-pointer"
              >
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
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-505 mb-1.5">
                Estimated Contract Value (SAR) *
              </label>
              <input
                type="number"
                required
                value={newProposalData.estimatedValue}
                onChange={(e) => setNewProposalData({ ...newProposalData, estimatedValue: e.target.value })}
                placeholder="e.g. 4500000"
                className="w-full bg-white dark:bg-slate-800 border border-slate-202 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white font-technical"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Client Detail Drawer */}
      <Drawer
        isOpen={isClientDrawerOpen}
        onClose={() => setIsClientDrawerOpen(false)}
        title="Client Account Profile"
        footer={
          <button
            onClick={() => setIsClientDrawerOpen(false)}
            className="px-4 py-2 border border-slate-202 hover:bg-slate-50 text-sm font-semibold rounded-lg text-slate-700 cursor-pointer"
          >
            Close Profile
          </button>
        }
      >
        {selectedClient && (
          <div className="space-y-6 animate-fade-in select-none">
            {/* Header info */}
            <div>
              <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold rounded-full ${RelationshipStatusColors[selectedClient.relationshipStatus]}`}>
                {selectedClient.relationshipStatus} Status
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                {selectedClient.companyName}
              </h3>
              <p className="text-xs text-slate-450 mt-1">Sector: {selectedClient.industry}</p>
            </div>

            {/* Contact details */}
            <div className="p-4 border rounded-xl text-xs space-y-2 bg-slate-50/50 dark:bg-slate-850">
              <p className="text-[9px] font-bold uppercase text-slate-450">Primary Representative</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedClient.contactPersonName}</p>
              <p className="text-slate-505 dark:text-slate-400 mt-1">{selectedClient.contactEmail} | {selectedClient.contactPhone || '—'}</p>
            </div>

            {/* Linked Projects */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-teal-500" />
                Active & Past Projects
              </h4>

              {loadingClientDetails ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading history...</div>
              ) : clientDetails.projects?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No projects signed yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border rounded-xl overflow-hidden">
                  {clientDetails.projects?.map(proj => (
                    <div key={proj.id} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white hover:underline cursor-pointer" onClick={() => { setIsClientDrawerOpen(false); navigate(`/projects/${proj.id}`); }}>
                          {proj.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Budget: SAR {parseFloat(proj.budget).toLocaleString()}</p>
                      </div>
                      <span className="scale-75"><StatusBadge status={proj.status} /></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Proposals Sent */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-teal-500" />
                Dossier Proposals
              </h4>

              {loadingClientDetails ? (
                <div className="text-center py-4 text-xs text-slate-400">Loading history...</div>
              ) : clientDetails.proposals?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No proposals sent yet.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-850 border rounded-xl overflow-hidden">
                  {clientDetails.proposals?.map(prop => (
                    <div key={prop.id} className="p-3 bg-white dark:bg-slate-900 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{prop.title}</p>
                        <p className="text-[10px] font-technical font-semibold text-slate-400 mt-0.5">Est. Value: SAR {parseFloat(prop.estimatedValue).toLocaleString()}</p>
                      </div>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500`}>
                        {prop.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CRM Contact Log */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-teal-500" />
                Account Activity Logs
              </h4>
              <div className="border border-slate-150 p-4 rounded-xl text-center text-xs text-slate-400 bg-slate-50/50 py-6">
                Client activity logs will connect in future CRM Sprints.
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Proposals;
