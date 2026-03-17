import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import { HiUsers, HiArrowDown, HiArrowUp, HiTrendingUp, HiRefresh } from 'react-icons/hi';

const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 p-6"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </motion.div>
);

export default function AdminOverview() {
  const [stats, setStats] = useState({});
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, depositsRes, withdrawalsRes] = await Promise.all([
        API.get('/admin/dashboard-stats').catch(() => ({ data: {} })),
        API.get('/admin/deposits').catch(() => ({ data: [] })),
        API.get('/admin/withdrawals').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data || {});
      setDeposits(depositsRes.data?.slice(0, 5) || []);
      setWithdrawals(withdrawalsRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-slate-400 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
          <HiRefresh className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Deposits</h3>
          <div className="space-y-3">
            {deposits.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <HiArrowDown className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{d.first_name || 'User'}</p>
                    <p className="text-slate-400 text-sm">{formatDate(d.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(d.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    d.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{d.status}</span>
                </div>
              </div>
            ))}
            {deposits.length === 0 && <p className="text-slate-500 text-center py-4">No deposits yet</p>}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Withdrawals</h3>
          <div className="space-y-3">
            {withdrawals.map((w, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <HiArrowUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{w.first_name || 'User'}</p>
                    <p className="text-slate-400 text-sm">{formatDate(w.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(w.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    w.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>{w.status}</span>
                </div>
              </div>
            ))}
            {withdrawals.length === 0 && <p className="text-slate-500 text-center py-4">No withdrawals yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
