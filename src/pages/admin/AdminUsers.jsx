import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { HiSearch, HiPlus, HiCheck, HiX, HiPencil } from 'react-icons/hi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/admin/users/${formData.user_id}/balance`, { 
        amount: parseFloat(formData.amount), 
        type: formData.type 
      });
      setShowModal(false);
      setFormData({});
      fetchUsers();
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Users Management</h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm lg:text-base">Manage all registered users</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-violet-600 text-white rounded-lg sm:rounded-xl hover:bg-violet-700 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="text-sm sm:text-base">Add Balance</span>
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-white/10">
          <div className="relative max-w-sm sm:max-w-md">
            <HiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-700/50 border border-white/10 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Deposited</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 sm:py-12 text-center text-slate-500 text-sm">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                            {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{user.first_name} {user.last_name}</p>
                            <p className="text-slate-400 text-[10px] sm:text-sm">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-300 text-xs sm:text-sm hidden md:table-cell truncate max-w-[150px]">{user.email}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-white font-medium text-xs sm:text-sm">{formatCurrency(user.balance || 0)}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-300 text-xs sm:text-sm hidden sm:table-cell">{formatCurrency(user.total_deposited || 0)}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs ${user.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-400 text-[10px] sm:text-sm hidden lg:table-cell">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Add Balance to User</h3>
            <form onSubmit={handleUpdateBalance} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-slate-400 text-xs sm:text-sm mb-1.5 sm:mb-2">User ID</label>
                <input
                  type="number"
                  required
                  value={formData.user_id || ''}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border border-white/10 rounded-lg sm:rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-slate-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Amount</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border border-white/10 rounded-lg sm:rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Type</label>
                  <select
                    value={formData.type || 'add'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-700/50 border border-white/10 rounded-lg sm:rounded-xl text-white focus:outline-none focus:border-violet-500 text-sm"
                  >
                    <option value="add">Add</option>
                    <option value="subtract">Subtract</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 sm:py-3 bg-slate-700 text-white rounded-lg sm:rounded-xl hover:bg-slate-600 text-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg sm:rounded-xl hover:from-violet-700 hover:to-indigo-700 text-sm">
                  Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
