import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { User, Mail, Phone, Lock, Save, Camera, ShieldAlert } from 'lucide-react';

const Settings = () => {
  const { user, setUser, token, apiUrl } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch complete profile info (including phone from employee table if available)
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
        phone: user.phone || ''
      }));

      // If phone is not directly in user, try to query employee detail
      const fetchEmployeePhone = async () => {
        try {
          const res = await fetch(`${apiUrl}/employees`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            const currentEmp = data.data.find(emp => emp.userId === user.id);
            if (currentEmp && currentEmp.phone) {
              setFormData(prev => ({ ...prev, phone: currentEmp.phone }));
            }
          }
        } catch (err) {
          console.warn('Could not fetch employee phone from backend.');
        }
      };
      fetchEmployeePhone();
    }
  }, [user, token, apiUrl]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatarUrl: formData.avatarUrl,
          phone: formData.phone
        })
      });
      const data = await res.json();

      if (data.success) {
        setUser({
          ...user,
          name: data.user.name,
          email: data.user.email,
          avatarUrl: data.user.avatarUrl,
          phone: formData.phone
        });
        addToast('Profile updated successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!formData.newPassword) {
      addToast('Please enter a new password.', 'warning');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          password: formData.newPassword
        })
      });
      const data = await res.json();

      if (data.success) {
        addToast('Password updated successfully!', 'success');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      } else {
        throw new Error(data.message || 'Failed to update password.');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & Profile Configuration"
        breadcrumbs={['PetroFlow', 'Settings']}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Display */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xs">
          <div className="relative group">
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={formData.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 dark:border-slate-850 shadow-inner"
            />
            <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="mt-4 font-bold text-slate-800 dark:text-white">{formData.name}</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">{user?.role}</p>
          <div className="w-full border-t border-slate-100 dark:border-slate-800 my-4"></div>
          
          <div className="text-left w-full space-y-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{user?.department || 'Operations'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">System Role</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Details Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-teal-500" />
              Personal Profile Info
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="form-input pl-10"
                      placeholder="e.g. Aarav Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="form-input pl-10"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Contact</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input pl-10"
                      placeholder="+91-98765-43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Avatar URL</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Camera className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={formData.avatarUrl}
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="form-input pl-10"
                      placeholder="https://image-link.com/photo.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-500" />
              Change Credentials Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">New Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                      className="form-input pl-10"
                      placeholder="Minimum 6 characters"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Confirm New Password</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="form-input pl-10"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-rose-550 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  {loading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
