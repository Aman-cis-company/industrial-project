import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import MyTasks from './pages/MyTasks';
import Documents from './pages/Documents';
import Resources from './pages/Resources';
import Risks from './pages/Risks';
import Approvals from './pages/Approvals';
import Proposals from './pages/Proposals';
import AIAssistant from './pages/AIAssistant';
import PipelineDashboard from './pages/PipelineDashboard';
import PipelineMap from './pages/PipelineMap';
import PipelineSegments from './pages/PipelineSegments';
import PipelineSegmentDetail from './pages/PipelineSegmentDetail';
import PipelineInspections from './pages/PipelineInspections';
import PipelineIncidents from './pages/PipelineIncidents';
import PipelineMaintenance from './pages/PipelineMaintenance';
import Settings from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D1C]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks" element={<MyTasks />} />
              <Route path="documents" element={<Documents />} />
              <Route path="approvals" element={<Approvals />} />
              <Route path="team" element={<EmployeeDirectory />} />
              <Route path="proposals" element={<Proposals />} />
              <Route path="workforce" element={<Resources />} />
              <Route path="risks" element={<Risks />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              
              {/* Pipeline Monitoring Routes */}
              <Route path="pipeline/dashboard" element={<PipelineDashboard />} />
              <Route path="pipeline/map" element={<PipelineMap />} />
              <Route path="pipeline/segments" element={<PipelineSegments />} />
              <Route path="pipeline/segments/:id" element={<PipelineSegmentDetail />} />
              <Route path="pipeline/inspections" element={<PipelineInspections />} />
              <Route path="pipeline/incidents" element={<PipelineIncidents />} />
              <Route path="pipeline/maintenance" element={<PipelineMaintenance />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
