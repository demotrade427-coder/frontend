import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiCheck, HiX } from 'react-icons/hi';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/deposits');
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (id, status) => {
    try {
      await API.patch(`/admin/deposits/${id}`, { status });
      fetchDeposits();
    } catch (error) {
      console.error('Error approving deposit:', error);
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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Deposits Management</h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm lg:text-base">Approve or reject deposit requests</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Method</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-3 sm:px-4 py-3 text-right text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 sm:py-12 text-center text-slate-500 text-sm">No deposits found</td>
                  </tr>
                ) : (
                  deposits.map((deposit, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <div>
                          <p className="text-white font-medium text-xs sm:text-sm">{deposit.first_name} {deposit.last_name}</p>
                          <p className="text-slate-400 text-[10px] sm:text-sm hidden lg:block">{deposit.email}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-white font-semibold text-sm sm:text-base">{formatCurrency(deposit.amount)}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-300 text-xs hidden sm:table-cell">{deposit.payment_method || 'Crypto'}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          deposit.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          deposit.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-400 text-[10px] sm:text-sm hidden md:table-cell">{formatDate(deposit.created_at)}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                        {deposit.status === 'pending' && (
                          <div className="flex justify-end gap-1 sm:gap-2">
                            <button 
                              onClick={() => handleApprove(deposit.id, 'approved')}
                              className="p-1.5 sm:p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 flex items-center gap-1"
                            >
                              <HiCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-[10px] sm:text-xs hidden sm:inline">Approve</span>
                            </button>
                            <button 
                              onClick={() => handleApprove(deposit.id, 'rejected')}
                              className="p-1.5 sm:p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-1"
                            >
                              <HiX className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-[10px] sm:text-xs hidden sm:inline">Reject</span>
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
