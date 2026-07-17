import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  FileText,
  Users,
  AlertOctagon,
  CheckCircle2,
  Target,
  Contact,
  Cpu,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  Shield
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Fetch pending approvals count
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        if (!token) return;

        const res = await fetch(`${apiUrl}/approvals/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setPendingApprovalsCount(data.data.length);
        }
      } catch (err) {
        console.warn('Backend offline. Mocking approvals counter.');
        // Seed default pending approvals counter for the PMO Director
        if (user?.role === 'PMO Director') {
          setPendingApprovalsCount(1);
        }
      }
    };

    fetchPendingApprovals();
    const interval = setInterval(fetchPendingApprovals, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navigationGroups = [
    {
      title: 'General',
      links: [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Operations',
      links: [
        { name: 'Projects', path: '/projects', icon: Briefcase },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Documents', path: '/documents', icon: FileText },
        { name: 'Approvals', path: '/approvals', icon: CheckCircle2 }
      ]
    },
    {
      title: 'Resources & CRM',
      links: [
        { name: 'Resources & Team', path: '/team', icon: Users },
        { name: 'CRM & Proposals', path: '/proposals', icon: Target },
        { name: 'HR / Workforce', path: '/workforce', icon: Contact }
      ]
    },
    {
      title: 'Controls & Intel',
      links: [
        { name: 'Risk & Compliance', path: '/risks', icon: AlertOctagon },
        { name: 'AI Assistant', path: '/ai-assistant', icon: Cpu }
      ]
    },
    {
      title: 'Admin',
      links: [
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  const allLinks = navigationGroups.flatMap(group => group.links);
  const currentLink = allLinks.find(link => link.path === location.pathname);
  const breadcrumbs = ['AeroPMO', currentLink ? currentLink.name : 'Overview'];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#090D1C] overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-[#0F2A47] dark:bg-[#0C1225] text-slate-350 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-white shrink-0 font-bold shadow-md shadow-teal-500/20">
              AP
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-lg text-white font-technical tracking-wide whitespace-nowrap">
                Aero<span className="text-teal-400">PMO</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <span className="block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-1">
                  {group.title}
                </span>
              )}
              {group.links.map(link => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-155 relative ${
                      isActive
                        ? 'bg-teal-600 dark:bg-teal-700/90 text-white font-medium shadow-sm'
                        : 'text-slate-350 hover:text-white hover:bg-slate-800/40 dark:hover:bg-slate-800/30'
                    }`}
                    title={sidebarCollapsed ? link.name : undefined}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!sidebarCollapsed && <span>{link.name}</span>}
                    {link.name === 'Approvals' && pendingApprovalsCount > 0 && (
                      <span className={`absolute ${sidebarCollapsed ? 'top-1 right-2 w-2 h-2 animate-ping' : 'right-3 px-1.5 py-0.5 text-[9px] font-technical'} font-bold rounded-full bg-rose-500 text-white flex items-center justify-center`}>
                        {!sidebarCollapsed && pendingApprovalsCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Profile Banner */}
        <div className="p-3 border-t border-slate-700/50 dark:border-slate-800 shrink-0 bg-slate-900/20">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full border border-slate-500/40 object-cover shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5 uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-100 md:hidden flex">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          ></div>
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#0F2A47] dark:bg-[#0C1225] text-slate-350 border-r border-slate-200 dark:border-slate-800 h-full p-4 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
              <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center text-white font-bold">
                AP
              </div>
              <span className="font-bold text-lg text-white font-technical">AeroPMO</span>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-5">
              {navigationGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </span>
                  {group.links.map(link => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : 'text-slate-350 hover:bg-slate-800/40 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 shrink-0" />
                          <span>{link.name}</span>
                        </div>
                        {link.name === 'Approvals' && pendingApprovalsCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[9px] font-technical font-bold rounded-full bg-rose-500 text-white flex items-center justify-center">
                            {pendingApprovalsCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Log Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-[#0C1225] border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-slate-800 dark:text-slate-205 font-bold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-850 px-3 py-1.5 rounded-lg w-64 border border-slate-200 dark:border-slate-800/80">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search drawings, tasks..."
                className="bg-transparent border-0 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden w-full placeholder-slate-450"
              />
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-white">Live Activity Alerts</span>
                    <span className="text-[10px] text-teal-600 font-bold hover:underline cursor-pointer">Clear all</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer">
                      <p className="font-semibold text-slate-750 dark:text-slate-200">New Task Assigned</p>
                      <p className="text-[10px] text-slate-400 mt-1">Review BIM Steel alignment by Priya Patel.</p>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">2 mins ago</span>
                    </div>
                    <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer">
                      <p className="font-semibold text-slate-750 dark:text-slate-200">Phase Gate Triggered</p>
                      <p className="text-[10px] text-slate-400 mt-1">NEOM Spine transition awaiting director signature.</p>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name || 'User'}
                  className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-800 dark:text-white leading-snug">{user?.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 cursor-pointer"
                  >
                    User Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-850 text-rose-500 font-bold border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Work View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 dark:bg-[#090D1C] relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
