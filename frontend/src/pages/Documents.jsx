import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Drawer from '../components/Drawer';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  Image,
  FileArchive,
  Download,
  Search,
  Plus,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Grid,
  List,
  Box,
  CornerDownRight,
  Briefcase
} from 'lucide-react';

// Maps file extensions to descriptive icons and colors
export const getFileIcon = (ext) => {
  const extension = String(ext).toLowerCase().trim();
  if (['pdf'].includes(extension)) {
    return { icon: FileText, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' };
  }
  if (['dwg', 'dxf', 'cad'].includes(extension)) {
    return { icon: Layers, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' };
  }
  if (['rvt', 'nwd', 'ifc', 'bim'].includes(extension)) {
    return { icon: Box, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' };
  }
  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return { icon: FileSpreadsheet, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' };
  }
  if (['doc', 'docx', 'rtf'].includes(extension)) {
    return { icon: FileText, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
  }
  if (['png', 'jpg', 'jpeg', 'svg'].includes(extension)) {
    return { icon: Image, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' };
  }
  return { icon: FileCode, color: 'text-slate-500 bg-slate-50 dark:bg-slate-950/20' };
};

const Documents = () => {
  const { token, apiUrl } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterProject, setFilterProject] = useState('');

  // Version History Drawer
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [versionHistory, setVersionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch Documents & Projects
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const docRes = await fetch(`${apiUrl}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const projRes = await fetch(`${apiUrl}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const docData = await docRes.json();
      const projData = await projRes.json();

      if (docData.success) {
        setDocuments(docData.data);
      }
      if (projData.success) {
        setProjects(projData.data);
      }
    } catch (err) {
      console.warn('Backend server offline. Setting mock document registry.');
      setProjects([
        { id: 1, name: 'NEOM Spine Tunnel Structural Design', clientName: 'NEOM Authority' },
        { id: 2, name: 'King Salman Park Infrastructure Master Plan', clientName: 'King Salman Park Foundation' }
      ]);
      setDocuments([
        { id: 201, fileName: 'NEOM_Spine_Design_Criteria.pdf', fileType: 'pdf', filePath: '#', version: 1, discipline: 'General', description: 'Primary design bounds, load calculations, and baseline soil data reports.', fileSizeKB: 1450, uploadedAt: '2026-07-02T10:00:00.000Z', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' }, uploader: { designation: 'PM', user: { name: 'Elena Rostova' } } },
        { id: 202, fileName: 'NEOM_Spine_BIM_Consolidated.rvt', fileType: 'rvt', filePath: '#', version: 2, discipline: 'BIM', description: 'Consolidated architectural structural twin model clash logs.', fileSizeKB: 245900, uploadedAt: '2026-07-10T14:30:00.000Z', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' }, uploader: { designation: 'BIM Coordinator', user: { name: 'Priya Patel' } } },
        { id: 203, fileName: 'NEOM_Spine_Engineering_Layout.dwg', fileType: 'dwg', filePath: '#', version: 1, discipline: 'MEP', description: 'Primary electrical grid substation trench cabling drafts.', fileSizeKB: 41200, uploadedAt: '2026-07-08T09:15:00.000Z', project: { id: 1, name: 'NEOM Spine Tunnel Structural Design' }, uploader: { designation: 'Lead Mechanical', user: { name: 'Carlos Mendez' } } },
        { id: 204, fileName: 'King_Salman_MasterPlan_Zoning.dwg', fileType: 'dwg', filePath: '#', version: 1, discipline: 'Civil', description: 'Final zoning layout for Riyadh metro central park intersections.', fileSizeKB: 68100, uploadedAt: '2026-07-12T11:00:00.000Z', project: { id: 2, name: 'King Salman Park Infrastructure Master Plan' }, uploader: { designation: 'Lead Structural', user: { name: 'Mei Tanaka' } } }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token, apiUrl]);

  // Version history fetcher
  const openHistoryDrawer = async (doc) => {
    setSelectedDoc(doc);
    setIsDrawerOpen(true);
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
      // Mock history list
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

  // Search & Filter Memo logic
  const filteredDocuments = useMemo(() => {
    return documents.filter(d => {
      const matchDiscipline = !filterDiscipline || d.discipline === filterDiscipline;
      const matchType = !filterType || d.fileType.toLowerCase() === filterType.toLowerCase();
      const matchProject = !filterProject || d.projectId === Number(filterProject) || (d.project && d.project.id === Number(filterProject));
      
      // Mock Smart Document Search over fileName + description
      const matchSearch = !searchQuery ||
        d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchDiscipline && matchType && matchProject && matchSearch;
    });
  }, [documents, searchQuery, filterDiscipline, filterType, filterProject]);

  // Unique disciplines and file types list for filters
  const disciplines = useMemo(() => ['', ...new Set(documents.map(d => d.discipline).filter(Boolean))], [documents]);
  const fileTypes = useMemo(() => ['', ...new Set(documents.map(d => d.fileType.toLowerCase()).filter(Boolean))], [documents]);

  const columns = [
    {
      header: 'Document Name',
      accessor: 'fileName',
      sortable: true,
      render: (row) => {
        const fileStyle = getFileIcon(row.fileType);
        const Icon = fileStyle.icon;
        return (
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => openHistoryDrawer(row)}
          >
            <div className={`p-2 rounded-lg ${fileStyle.color} shrink-0`}>
              <Icon className="w-5 h-5 shrink-0" />
            </div>
            <div className="truncate max-w-[240px] md:max-w-xs">
              <p className="font-semibold text-slate-850 dark:text-white group-hover:underline leading-tight truncate">
                {row.fileName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{row.description || 'No description'}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Version',
      accessor: 'version',
      render: (row) => (
        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 rounded-full select-none">
          v{row.version}
        </span>
      )
    },
    {
      header: 'Discipline',
      accessor: 'discipline',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/60 rounded">
          {row.discipline}
        </span>
      )
    },
    {
      header: 'Project Scope',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-350 font-semibold truncate max-w-[160px] block">
          {row.project?.name || 'General PMO'}
        </span>
      )
    },
    {
      header: 'File Size',
      accessor: 'fileSizeKB',
      sortable: true,
      render: (row) => {
        const size = row.fileSizeKB > 1024 
          ? `${(row.fileSizeKB / 1024).toFixed(1)} MB`
          : `${row.fileSizeKB} KB`;
        return <span className="font-technical text-xs font-bold text-slate-500">{size}</span>;
      }
    },
    {
      header: 'Uploaded By',
      render: (row) => (
        <div>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{row.uploader?.user?.name || 'Staff'}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{row.uploader?.designation}</p>
        </div>
      )
    },
    {
      header: 'Upload Date',
      accessor: 'uploadedAt',
      sortable: true,
      render: (row) => (
        <span className="font-technical text-xs text-slate-400">
          {new Date(row.uploadedAt || row.createdAt).toISOString().split('T')[0]}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management Desk"
        breadcrumbs={['AeroPMO', 'DMS']}
      />

      {/* Filters & Search Grid */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        {/* Toggle Mode */}
        <div className="bg-slate-100 dark:bg-slate-850 p-1 rounded-xl flex items-center border border-slate-200 dark:border-slate-800/80 w-full xl:w-auto shrink-0 justify-center sm:justify-start">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
            Registry List
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-slate-850 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            Visual Cards
          </button>
        </div>

        {/* Global DMS Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
          {/* Smart Document Search Bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Smart Document Search..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-700 dark:text-slate-100"
            />
            <Sparkles className="absolute right-3 top-2.5 h-4 w-4 text-teal-500/80 animate-pulse pointer-events-none" title="Semantic indexing active" />
          </div>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[130px]"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[110px]"
          >
            <option value="">All Disciplines</option>
            {disciplines.filter(Boolean).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer min-w-[100px]"
          >
            <option value="">All Types</option>
            {fileTypes.filter(Boolean).map(t => (
              <option key={t} value={t}>{String(t).toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Render registry */}
      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      ) : viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredDocuments}
          searchPlaceholder="Filter listed files..."
          actions={[
            {
              label: 'Version History',
              onClick: (row) => openHistoryDrawer(row)
            },
            {
              label: 'Download file',
              onClick: () => addToast('File downloaded (Demo Blueprint)', 'success')
            }
          ]}
        />
      ) : (
        /* Grid cards view */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocuments.map(doc => {
            const style = getFileIcon(doc.fileType);
            const CardIcon = style.icon;
            const sizeStr = doc.fileSizeKB > 1024 
              ? `${(doc.fileSizeKB / 1024).toFixed(1)} MB`
              : `${doc.fileSizeKB} KB`;

            return (
              <div
                key={doc.id}
                onClick={() => openHistoryDrawer(doc)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-lg ${style.color}`}>
                      <CardIcon className="w-5 h-5" />
                    </div>
                    <span className="inline-flex text-[10px] font-bold px-2 py-0.5 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/30 rounded-full select-none">
                      v{doc.version}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-850 dark:text-white mt-4 hover:underline line-clamp-2 leading-snug">
                    {doc.fileName}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">{doc.description || 'No description'}</p>
                  
                  <span className="inline-block mt-3 text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 px-2 py-0.5 rounded uppercase">
                    {doc.discipline}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">By: <strong className="font-semibold text-slate-700 dark:text-slate-350">{doc.uploader?.user?.name || 'Staff'}</strong></span>
                  <span className="font-technical font-semibold text-slate-500">{sizeStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Version History Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="File Version Log"
        footer={
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer"
          >
            Close Logs
          </button>
        }
      >
        {selectedDoc && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded">
                {selectedDoc.discipline} Discipline
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                {selectedDoc.fileName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{selectedDoc.description || 'No description logs registered.'}</p>
            </div>

            {/* Version timeline tree */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-500" />
                History Timeline
              </h4>

              {loadingHistory ? (
                <div className="text-center py-6 text-xs text-slate-400">Loading version logs...</div>
              ) : (
                <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-slate-800">
                  {versionHistory.map((ver, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={ver.id || ver.version} className="relative">
                        {/* Timeline node marker */}
                        <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                          isLatest ? 'bg-teal-500 ring-4 ring-teal-500/10' : 'bg-slate-350'
                        }`}></div>

                        <div className="bg-slate-50 dark:bg-slate-850 p-4 border border-slate-200/50 dark:border-slate-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Version v{ver.version} {isLatest && <strong className="text-[10px] text-teal-600 dark:text-teal-400 ml-1.5 uppercase font-bold">(Latest)</strong>}
                            </span>
                            <span className="font-technical text-[10px] text-slate-400">
                              {new Date(ver.uploadedAt).toISOString().split('T')[0]}
                            </span>
                          </div>

                          <div className="flex justify-between items-end text-[10px] text-slate-450 dark:text-slate-500">
                            <div>
                              <p>By: <strong className="font-bold text-slate-700 dark:text-slate-350">{ver.uploader?.user?.name || 'Staff'}</strong></p>
                              <p className="mt-0.5">Size: {ver.fileSizeKB > 1024 ? `${(ver.fileSizeKB/1024).toFixed(1)} MB` : `${ver.fileSizeKB} KB`}</p>
                            </div>

                            <button
                              onClick={() => addToast(`Downloading v${ver.version} file...`, 'success')}
                              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-[10px] font-bold text-slate-750 dark:text-slate-200 flex items-center gap-1 cursor-pointer select-none"
                            >
                              <Download className="w-3 h-3 shrink-0" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Documents;
