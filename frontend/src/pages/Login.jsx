import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Key, Eye, EyeOff, Construction } from 'lucide-react';

const Login = () => {
  const { login, loading, error: authError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      addToast('Welcome to AeroPMO Platform', 'success');
      navigate('/dashboard');
    } else {
      addToast(res.message || 'Login failed. Verify your credentials.', 'error');
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    
    // Auto submit
    const res = await login(demoEmail, 'password123');
    if (res.success) {
      addToast(`Logged in as ${demoEmail.split('@')[0]}`, 'success');
      navigate('/dashboard');
    } else {
      addToast(res.message || 'Quick login failed', 'error');
    }
  };

  const demoAccounts = [
    { label: 'Sarah (Admin)', email: 'admin@industrial-project.com', role: 'Admin' },
    { label: 'Marcus (PMO Director)', email: 'director@industrial-project.com', role: 'PMO Director' },
    { label: 'Elena (Project Manager)', email: 'pm.buildings@industrial-project.com', role: 'Project Manager' },
    { label: 'Carlos (MEP Engineer)', email: 'eng.mep@industrial-project.com', role: 'Engineer' }
  ];

  return (
    <div className="min-h-screen flex bg-slate-900 text-white font-sans">
      {/* Visual panel - Industrial Steel Aesthetics */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F2A47] bg-radial from-[#1A3E62] to-[#0A1B2E] p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Blueprint Grid Overlay */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20">
            AP
          </div>
          <span className="font-bold text-2xl font-technical tracking-wide">
            Aero<span className="text-teal-400">PMO</span>
          </span>
        </div>

        <div className="space-y-6 relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight max-w-lg">
            Industrial Engineering <br />
            <span className="text-teal-400">PMO & ERP Portal</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed">
            Consolidated project control, technical documentation, structural BIM coordination, and resource scheduling for multi-discipline engineering projects.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-teal-400 border border-teal-500/25 bg-teal-500/5 px-4 py-3 rounded-xl max-w-sm">
            <Construction className="w-5 h-5 shrink-0" />
            <span>Demonstration Environment Loaded</span>
          </div>
        </div>

        <div className="text-xs text-slate-500 relative z-10">
          © {new Date().getFullYear()} AeroPMO Consultancy Services. All rights reserved.
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#0A0E1A]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign In
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Access the industrial resource console
            </p>
          </div>

          {authError && (
            <div className="bg-rose-950/20 border border-rose-800/40 text-rose-400 px-4 py-3 rounded-lg text-sm text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Technical ID / Email
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@industrial-project.com"
                  className="w-full bg-[#121829] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121829] border border-slate-800 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-teal-600/10 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Establish Session'}
            </button>
          </form>

          {/* Quick-select Demo Logins Panel */}
          <div className="pt-6 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center lg:text-left">
              Quick Login Demo Profiles
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => handleQuickLogin(account.email)}
                  className="px-3 py-2 bg-[#121829] hover:bg-[#1A233D] border border-slate-800/60 rounded-lg text-left transition-colors cursor-pointer select-none"
                >
                  <p className="text-xs font-bold text-slate-200 truncate">{account.label}</p>
                  <p className="text-[9px] text-slate-450 mt-0.5 truncate">{account.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
