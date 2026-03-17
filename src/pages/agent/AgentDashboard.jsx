import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HiHome, HiUserGroup, HiCurrencyDollar, HiArrowDown, HiArrowUp, HiChartBar, HiLogout,
  HiTicket, HiBell, HiCog, HiShieldCheck, HiTrendingUp
} from 'react-icons/hi';
import API from '../../utils/api';

function AgentDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [trades, setTrades] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('agentToken');
    if (!token) {
      navigate('/agent-login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, tradesRes, depositsRes, withdrawalsRes, profileRes] = await Promise.all([
        API.get('/admin/dashboard-stats'),
        API.get('/admin/users'),
        API.get('/admin/trades'),
        API.get('/admin/deposits'),
        API.get('/admin/withdrawals'),
        API.get('/trading/profile')
      ]);
      
      const myUsers = usersRes.data.filter(u => u.agent_id);
      const myUserIds = myUsers.map(u => u.id);
      
      setStats(statsRes.data);
      setUsers(myUsers);
      setTrades(tradesRes.data.filter(t => myUserIds.includes(t.user_id)));
      setDeposits(depositsRes.data.filter(d => myUserIds.includes(d.user_id)));
      setWithdrawals(withdrawalsRes.data.filter(w => myUserIds.includes(w.user_id)));
      setProfile(profileRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('agentToken');
        navigate('/agent-login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('agentToken');
    navigate('/agent-login');
  };

  const menuItems = [
    { id: 'dashboard', icon: HiHome, label: 'Dashboard' },
    { id: 'users', icon: HiUserGroup, label: 'My Users' },
    { id: 'trades', icon: HiTrendingUp, label: 'Trades' },
    { id: 'deposits', icon: HiArrowDown, label: 'Deposits' },
    { id: 'withdrawals', icon: HiArrowUp, label: 'Withdrawals' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Agent Dashboard</h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'My Users', value: users.length, color: 'from-blue-500 to-blue-600' },
                { label: 'Total Deposits', value: `$${deposits.filter(d => d.status === 'approved').reduce((a, d) => a + Number(d.amount), 0).toLocaleString()}`, color: 'from-green-500 to-green-600' },
                { label: 'Total Trades', value: trades.length, color: 'from-purple-500 to-purple-600' },
                { label: 'Commission', value: `$${Number(profile?.total_profit || 0).toLocaleString()}`, color: 'from-amber-500 to-amber-600' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5`}>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-white text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Recent Deposits</h3>
                <div className="space-y-3">
                  {deposits.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">${Number(d.amount).toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">{d.first_name} {d.last_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${d.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-white font-bold mb-4">Recent Trades</h3>
                <div className="space-y-3">
                  {trades.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div>
                        <p className="text-white font-medium">{t.coin_name}</p>
                        <p className="text-gray-400 text-sm">${Number(t.total_value).toLocaleString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.result === 'win' ? 'bg-green-500/20 text-green-400' : t.result === 'loss' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {t.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-4">User</th>
                    <th className="pb-4">Balance</th>
                    <th className="pb-4">Trading</th>
                    <th className="pb-4">Deposited</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-white/10">
                      <td className="py-4">
                        <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </td>
                      <td className="py-4 text-white">${Number(user.balance).toLocaleString()}</td>
                      <td className="py-4 text-white">${Number(user.trading_balance).toLocaleString()}</td>
                      <td className="py-4 text-white">${Number(user.total_deposited).toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'trades':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">User Trades</h2>
            <div className="space-y-3">
              {trades.map((trade) => (
                <div key={trade.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{trade.coin_name} ({trade.trade_type.toUpperCase()})</p>
                      <p className="text-gray-400 text-sm">{trade.first_name} {trade.last_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${Number(trade.total_value).toLocaleString()}</p>
                      <p className={`text-sm ${trade.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit_loss >= 0 ? '+' : ''}${Number(trade.profit_loss).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'deposits':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Deposits</h2>
            <div className="space-y-3">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">${Number(deposit.amount).toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{deposit.first_name} {deposit.last_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${deposit.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {deposit.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'withdrawals':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Withdrawals</h2>
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">${Number(withdrawal.amount).toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{withdrawal.first_name} {withdrawal.last_name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {withdrawal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-white/20 border-t-white rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <div className="w-64 bg-white/5 border-r border-white/10 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Agent Panel</h1>
          <p className="text-gray-400 text-sm">Manage Your Users</p>
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 transition-all mt-auto">
          <HiLogout className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default AgentDashboard;
