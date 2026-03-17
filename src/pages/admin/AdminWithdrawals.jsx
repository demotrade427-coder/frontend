import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiCheck, HiX } from 'react-icons/hi';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/withdrawals');
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id, status) => {
    try {
      await API.patch(`/admin/withdrawals/${id}`, { status });
      fetchWithdrawals();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Withdrawals Management</h1>
        <p className="text-slate-400 mt-1">Approve or reject withdrawal requests</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Method</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-4 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">No withdrawals found</td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">{withdrawal.first_name} {withdrawal.last_name}</p>
                          <p className="text-slate-400 text-sm">{withdrawal.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white font-semibold text-lg">{formatCurrency(withdrawal.amount)}</td>
                      <td className="px-4 py-4 text-slate-300">{withdrawal.payment_method || 'Crypto'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          withdrawal.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-sm">{formatDate(withdrawal.created_at)}</td>
                      <td className="px-4 py-4 text-right">
                        {withdrawal.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleApprove(withdrawal.id, 'approved')}
                              className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 flex items-center gap-1"
                            >
                              <HiCheck className="w-4 h-4" />
                              <span className="text-xs">Approve</span>
                            </button>
                            <button 
                              onClick={() => handleApprove(withdrawal.id, 'rejected')}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1"
                            >
                              <HiX className="w-4 h-4" />
                              <span className="text-xs">Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
