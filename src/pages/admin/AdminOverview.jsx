import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { HiUsers, HiArrowDown, HiArrowUp, HiTrendingUp, HiRefresh, HiCog } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 p-4 sm:p-5 lg:p-6"
  >
    <div className={`absolute top-0 right-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 truncate">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">{value}</p>
        {subtitle && <p className="text-slate-500 text-[10px] sm:text-xs lg:text-sm mt-0.5 sm:mt-1 truncate">{subtitle}</p>}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color} bg-opacity-20 flex-shrink-0`}>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </motion.div>
);

export default function AdminOverview() {
  const [stats, setStats] = useState({});
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoSettle, setAutoSettle] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, depositsRes, withdrawalsRes, settingsRes] = await Promise.all([
        API.get('/admin/dashboard-stats').catch(() => ({ data: {} })),
        API.get('/admin/deposits').catch(() => ({ data: [] })),
        API.get('/admin/withdrawals').catch(() => ({ data: [] })),
        API.get('/admin/settings/auto-settlement').catch(() => ({ data: { enabled: true } }))
      ]);
      setStats(statsRes.data || {});
      setDeposits(depositsRes.data?.slice(0, 5) || []);
      setWithdrawals(withdrawalsRes.data?.slice(0, 5) || []);
      setAutoSettle(settingsRes.data?.enabled ?? true);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoSettle = async () => {
    const newValue = !autoSettle;
    try {
      await API.patch('/admin/settings/auto-settlement', { enabled: newValue });
      setAutoSettle(newValue);
      toast.success(`Auto-settlement ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update setting');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm lg:text-base">Welcome back! Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 flex-1 sm:flex-none">
            <HiCog className={`w-4 h-4 ${autoSettle ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-white text-xs sm:text-sm">Auto Settle</span>
            <button
              onClick={toggleAutoSettle}
              className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors ${
                autoSettle ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full transition-transform ${
                  autoSettle ? 'translate-x-5 sm:translate-x-6' : ''
                }`}
              />
            </button>
          </div>
          <button onClick={fetchData} className="p-2 sm:p-3 bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
            <HiRefresh className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`${pendingDeposits.length} pending deposits`}
          icon={HiUsers}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Deposits"
          value={formatCurrency(stats.totalDeposits)}
          subtitle={`${pendingDeposits.length} pending`}
          icon={HiArrowDown}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(stats.totalWithdrawals)}
          subtitle={`${pendingWithdrawals.length} pending`}
          icon={HiArrowUp}
          color="bg-amber-500"
        />
        <StatCard
          title="Total Trades"
          value={stats.totalTrades || 0}
          subtitle="All time"
          icon={HiTrendingUp}
          color="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Deposits</h3>
          <div className="space-y-2 sm:space-y-3">
            {deposits.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
                    <HiArrowDown className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs sm:text-sm truncate">{d.first_name || 'User'}</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs hidden sm:block">{formatDate(d.created_at)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-white font-medium text-xs sm:text-sm">{formatCurrency(d.amount)}</p>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                    d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    d.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{d.status}</span>
                </div>
              </div>
            ))}
            {deposits.length === 0 && <p className="text-slate-500 text-center py-4 sm:py-6 text-xs sm:text-sm">No deposits yet</p>}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Withdrawals</h3>
          <div className="space-y-2 sm:space-y-3">
            {withdrawals.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-amber-500/20 rounded-lg flex-shrink-0">
                    <HiArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs sm:text-sm truncate">{w.first_name || 'User'}</p>
                    <p className="text-slate-400 text-[10px] sm:text-xs hidden sm:block">{formatDate(w.created_at)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-white font-medium text-xs sm:text-sm">{formatCurrency(w.amount)}</p>
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap ${
                    w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    w.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{w.status}</span>
                </div>
              </div>
            ))}
            {withdrawals.length === 0 && <p className="text-slate-500 text-center py-4 sm:py-6 text-xs sm:text-sm">No withdrawals yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
