import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  AlertOctagon,
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
  MapPin,
  Layers,
  Clipboard,
  Wrench,
  Fuel,
  Briefcase,
  CheckSquare,
  FileText,
  Users,
  CheckCircle2,
  Target,
  Contact,
  Cpu
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

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navigationGroups = [
    {
      title: 'Business Intelligence & BI',
      links: [
        { name: 'Executive BI Portfolio', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Pipeline IoT Dashboard', path: '/pipeline/dashboard', icon: Fuel }
      ]
    },
    {
      title: 'Pipeline PMO & CRM',
      links: [
        { name: 'Pipeline PMO & Projects', path: '/projects', icon: Briefcase },
        { name: 'My Safety Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Pipeline DMS Drawings', path: '/documents', icon: FileText },
        { name: 'Client CRM & Proposals', path: '/proposals', icon: Target }
      ]
    },
    {
      title: 'Automation, Compliance & AI',
      links: [
        { name: 'Workflow Automation', path: '/approvals', icon: CheckCircle2 },
        { name: 'Safety Risks & Compliance', path: '/risks', icon: AlertOctagon },
        { name: 'Pipeline AI Copilot', path: '/ai-assistant', icon: Cpu }
      ]
    },
    {
      title: 'Workforce & Field Crew',
      links: [
        { name: 'Field Staff Directory', path: '/team', icon: Users },
        { name: 'Specialist Heatmap', path: '/workforce', icon: Contact }
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
  const breadcrumbs = ['PetroFlow', currentLink ? currentLink.name : 'Executive Dashboard'];

  return (
    <div className="flex h-screen bg-background dark:bg-background-dark text-text-primary dark:text-text-primary-dark transition-colors duration-200 overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/50 bg-[#090D16] transition-all duration-300 relative ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/50 shrink-0 bg-[#090D16]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-accent-hover dark:from-accent-dark dark:to-accent-hover-dark flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/10">
              <Fuel className="w-5 h-5 text-white dark:text-[#090D16]" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-lg text-white font-technical tracking-wide whitespace-nowrap">
                Petro<span className="text-accent dark:text-accent-dark">Flow</span>
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-6">
          {navigationGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <span className="block px-3.5 text-[9px] font-bold uppercase tracking-wider text-slate-500/70 mb-2">
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
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 relative group/link ${
                      isActive
                        ? 'bg-slate-800/50 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                    }`}
                    title={sidebarCollapsed ? link.name : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-accent dark:bg-accent-dark"></span>
                    )}
                    <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover/link:scale-105 duration-200 ${isActive ? 'text-accent dark:text-accent-dark' : 'text-slate-450'}`} />
                    {!sidebarCollapsed && <span>{link.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Profile Banner */}
        <div className="p-4 border-t border-slate-800/50 shrink-0 bg-[#090D16]">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-xl border border-slate-800 object-cover shrink-0"
            />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate leading-tight">{user?.name}</p>
                <p className="text-[9px] font-semibold text-slate-500 truncate mt-0.5 uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-100 md:hidden flex animate-fade-in">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#090D16] border-r border-slate-800/50 h-full p-5 space-y-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-accent-hover dark:from-accent-dark dark:to-accent-hover-dark flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/10">
                  <Fuel className="w-5 h-5 text-white dark:text-[#090D16]" />
                </div>
                <span className="font-extrabold text-lg text-white font-technical tracking-wide">Petro<span className="text-accent dark:text-accent-dark">Flow</span></span>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/50 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto space-y-5">
              {navigationGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="block px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500/70 mb-2">
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
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold relative transition-all duration-200 ${
                          isActive
                            ? 'bg-slate-800/50 text-white shadow-xs'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isActive && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-accent dark:bg-accent-dark"></span>
                          )}
                          <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-accent dark:text-accent-dark' : 'text-slate-400'}`} />
                          <span>{link.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors cursor-pointer border border-rose-500/20"
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              <span>Log Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark shrink-0 flex items-center justify-between px-4 sm:px-6 relative z-10 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-white cursor-pointer animate-fade-in"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-muted dark:text-text-muted-dark">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-border dark:text-border-dark" />}
                  <span className={idx === breadcrumbs.length - 1 ? 'text-text-primary dark:text-text-primary-dark font-bold' : ''}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-2 bg-background dark:bg-background-dark px-3 py-1.5 rounded-lg w-64 border border-border dark:border-border-dark">
              <Search className="w-4 h-4 text-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search segments, incidents..."
                className="bg-transparent border-0 text-xs text-text-primary dark:text-text-primary-dark focus:outline-hidden w-full placeholder-text-muted/60"
              />
            </div>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-background dark:hover:bg-background-dark text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark rounded-lg transition-all duration-200 cursor-pointer"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-background dark:hover:bg-background-dark text-text-muted dark:text-text-muted-dark hover:text-text-primary dark:hover:text-text-primary-dark rounded-lg transition-colors relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent dark:bg-accent-dark rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg py-2 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-2 border-b border-border dark:border-border-dark flex justify-between items-center select-none">
                    <span className="font-bold text-text-primary dark:text-text-primary-dark">Live Activity Alerts</span>
                    <span className="text-[10px] text-accent dark:text-accent-dark font-bold hover:underline cursor-pointer">Clear all</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border dark:divide-border-dark">
                    <div className="p-3 hover:bg-background dark:hover:bg-background-dark cursor-pointer">
                      <p className="font-semibold text-text-primary dark:text-text-primary-dark">Pressure Drop Warning</p>
                      <p className="text-[10px] text-text-muted dark:text-text-muted-dark mt-1">Segment 3 (HVJ Trunk Line) reports low pressure warning.</p>
                      <span className="text-[9px] text-text-muted/65 mt-0.5 block">2 mins ago</span>
                    </div>
                    <div className="p-3 hover:bg-background dark:hover:bg-background-dark cursor-pointer">
                      <p className="font-semibold text-text-primary dark:text-text-primary-dark">Incident Resolved</p>
                      <p className="text-[10px] text-text-muted dark:text-text-muted-dark mt-1">Excavation warning near Uran bypass has been resolved.</p>
                      <span className="text-[9px] text-text-muted/65 mt-0.5 block">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1.5 hover:bg-background dark:hover:bg-background-dark rounded-lg transition-colors cursor-pointer"
              >
                <img
                  src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name || 'User'}
                  className="w-8.5 h-8.5 rounded-full object-cover border border-border dark:border-border-dark shrink-0"
                />
                <ChevronDown className="w-4 h-4 text-text-muted" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg py-1 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-2 border-b border-border dark:border-border-dark select-none">
                    <p className="font-bold text-text-primary dark:text-text-primary-dark leading-snug">{user?.name}</p>
                    <p className="text-[10px] text-text-muted dark:text-text-muted-dark mt-0.5">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                    className="w-full text-left px-4 py-2 hover:bg-background dark:hover:bg-background-dark text-text-primary dark:text-text-primary-dark cursor-pointer"
                  >
                    User Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-background dark:hover:bg-background-dark text-rose-500 font-bold border-t border-border dark:border-border-dark cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Work View */}
        <main className="flex-1 overflow-y-auto p-6 bg-background dark:bg-background-dark transition-colors duration-200 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
