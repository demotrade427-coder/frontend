import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import API from '../../utils/api';
import { HiClock, HiCheck, HiX, HiChevronRight, HiCurrencyDollar, HiSearch, HiFilter } from 'react-icons/hi';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function AdminLoanRow({ loan, onApprove, onReject }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    try {
      await onApprove(loan.id, rejectReason);
      setShowRejectModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject loan');
    }
  };

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        <td className="p-4">
          <div>
            <p className="text-white font-medium">#{loan.id}</p>
            <p className="text-slate-400 text-sm">{formatDate(loan.created_at)}</p>
          </div>
        </td>
        <td className="p-4">
          <div>
            <p className="text-white font-medium">{loan.first_name} {loan.last_name}</p>
            <p className="text-slate-400 text-sm">{loan.email}</p>
          </div>
        </td>
        <td className="p-4">
          <p className="text-white font-mono font-bold">{formatCurrency(loan.amount)}</p>
        </td>
        <td className="p-4">
          <p className="text-violet-400 font-medium">{loan.interest_rate}%</p>
          <p className="text-slate-400 text-sm">{loan.duration_days} days</p>
        </td>
        <td className="p-4">
          <p className="text-white font-mono font-bold">{formatCurrency(loan.repayment_amount)}</p>
        </td>
        <td className="p-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[loan.status]}`}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </span>
        </td>
        <td className="p-4">
          {loan.status === 'pending' ? (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(loan.id)}
                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors"
                title="Approve"
              >
                <HiCheck className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRejectModal(true)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"
                title="Reject"
              >
                <HiX className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <button className="p-2 bg-white/10 hover:bg-white/20 text-slate-400 rounded-lg transition-colors">
              <HiChevronRight className="w-5 h-5" />
            </button>
          )}
        </td>
      </tr>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Reject Loan Application</h3>
              <p className="text-slate-400 mb-4">
                Please provide a reason for rejecting Loan #{loan.id} for {loan.first_name} {loan.last_name}.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason..."
                className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 outline-none focus:border-red-500 mb-4 h-32 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600"
                >
                  Reject Loan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [filter, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filter) params.status = filter;

      const [loansRes, statsRes] = await Promise.all([
        API.get(`/admin/loans?${new URLSearchParams(params)}`),
        API.get('/admin/loans/stats'),
      ]);
      
      setLoans(loansRes.data.loans || []);
      setTotalPages(loansRes.data.totalPages || 1);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (loanId, notes = 'Approved by admin') => {
    if (!confirm('Are you sure you want to approve this loan? The loan amount will be credited to the user\'s balance.')) {
      return;
    }

    try {
      await API.post(`/admin/loans/${loanId}/approve`, { notes });
      toast.success('Loan approved successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve loan');
    }
  };

  const handleReject = async (loanId, reason) => {
    try {
      await API.post(`/admin/loans/${loanId}/reject`, { reason });
      toast.success('Loan rejected successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject loan');
    }
  };

  return (
    <div className="w-full">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Loan Management</h1>
          <p className="text-slate-400">Manage loan applications and approvals</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">Total Loans</p>
            <p className="text-2xl font-bold text-white">{stats.totalLoans}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 border border-amber-500/20 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pendingLoans}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-500/20 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.activeLoans}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 border border-violet-500/20 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">Disbursed</p>
            <p className="text-2xl font-bold text-violet-400">{formatCurrency(stats.disbursedAmount)}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/20 rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm mb-1">Total Repaid</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalRepaid)}</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search loans..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none focus:border-violet-500"
          />
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'approved', 'completed', 'rejected'].map(status => (
            <button
              key={status || 'all'}
              onClick={() => { setFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-left text-slate-400 font-medium">Loan ID</th>
                <th className="p-4 text-left text-slate-400 font-medium">User</th>
                <th className="p-4 text-left text-slate-400 font-medium">Amount</th>
                <th className="p-4 text-left text-slate-400 font-medium">Terms</th>
                <th className="p-4 text-left text-slate-400 font-medium">Repayment</th>
                <th className="p-4 text-left text-slate-400 font-medium">Status</th>
                <th className="p-4 text-left text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
                    </div>
                  </td>
                </tr>
              ) : loans.length > 0 ? (
                loans.map(loan => (
                  <AdminLoanRow 
                    key={loan.id} 
                    loan={loan} 
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No loans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex justify-between items-center">
            <p className="text-slate-400 text-sm">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white/5 text-white rounded-lg disabled:opacity-50 hover:bg-white/10"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white/5 text-white rounded-lg disabled:opacity-50 hover:bg-white/10"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
