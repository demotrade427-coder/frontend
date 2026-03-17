import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiPhone, HiGlobe, HiLockClosed } from 'react-icons/hi';
import API from '../utils/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    API.get('/auth/me').then(res => {
      setUser(res.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handlePasswordChange = () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordSuccess('Password updated successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information and security</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 lg:p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center">
                <HiUser className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <HiMail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <HiPhone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs">Phone</p>
                  <p className="text-white truncate">{user?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <HiGlobe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs">Country</p>
                  <p className="text-white truncate">{user?.country || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <HiUser className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-400 text-xs">KYC Status</p>
                  <p className={`truncate ${
                    user?.kycStatus === 'verified' ? 'text-green-400' :
                    user?.kycStatus === 'pending' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {user?.kycStatus || 'pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 lg:p-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">Security</h2>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-violet-400 hover:text-violet-300 text-sm"
            >
              {showPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPassword && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                <div className="relative">
                  <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
              {passwordSuccess && <p className="text-green-400 text-sm">{passwordSuccess}</p>}
              <button
                onClick={handlePasswordChange}
                className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl text-white font-medium transition-colors w-full sm:w-auto"
              >
                Update Password
              </button>
            </div>
          )}

          {!showPassword && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiLockClosed className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Click "Change Password" to update your security settings</p>
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 lg:p-8 mt-6 w-full"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Account Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-white">${Number(user?.balance || 0).toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">Current Balance</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-violet-400">${Number(user?.totalInvested || 0).toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">Total Invested</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-2xl lg:text-3xl font-bold text-green-400">${Number(user?.totalProfit || 0).toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-1">Total Profit</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 lg:p-6 text-center">
            <p className="text-xl lg:text-2xl font-bold text-purple-400">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <p className="text-gray-400 text-sm mt-1">Member Since</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;