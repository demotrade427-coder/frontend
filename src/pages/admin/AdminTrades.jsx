import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiTrendingUp, HiTrendingDown, HiPlus, HiCheck, HiX, HiSearch, HiUser } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

export default function AdminTrades() {
  const [trades, setTrades] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [processingTrade, setProcessingTrade] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/trades');
      setAllTrades(data || []);
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchTrades();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setTrades(allTrades.filter(t => t.user_id === selectedUser.id));
    } else {
      setTrades(allTrades);
    }
  }, [selectedUser, allTrades]);

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/trades', formData);
      setShowModal(false);
      setFormData({});
      fetchTrades();
      toast.success('Trade created successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create trade');
    }
  };

  const handleManualResult = async (tradeId, result) => {
    setProcessingTrade(tradeId);
    try {
      await API.post(`/admin/trades/${tradeId}/result`, { result });
      toast.success(`Trade marked as ${result.toUpperCase()}`);
      fetchTrades();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to set result');
    } finally {
      setProcessingTrade(null);
    }
  };

  const handleBulkWin = async () => {
    if (!selectedUser) {
      toast.error('Please select a user first');
      return;
    }
    const pendingTrades = trades.filter(t => t.result === 'pending');
    if (pendingTrades.length === 0) {
      toast.error('No pending trades for this user');
      return;
    }
    
    let count = 0;
    for (const trade of pendingTrades) {
      try {
        await API.post(`/admin/trades/${trade.id}/result`, { result: 'win' });
        count++;
      } catch (error) {}
    }
    toast.success(`${count} trades marked as WIN`);
    fetchTrades();
  };

  const handleBulkLoss = async () => {
    const pendingTrades = trades.filter(t => t.result === 'pending');
    if (pendingTrades.length === 0) {
      toast.error('No pending trades');
      return;
    }
    
    let count = 0;
    for (const trade of pendingTrades) {
      try {
        await API.post(`/admin/trades/${trade.id}/result`, { result: 'loss' });
        count++;
      } catch (error) {}
    }
    toast.success(`${count} trades marked as LOSS`);
    fetchTrades();
  };

  const handleSetAllWin = async () => {
    const allTradesToUpdate = trades;
    if (allTradesToUpdate.length === 0) {
      toast.error('No trades');
      return;
    }
    
    let count = 0;
    for (const trade of allTradesToUpdate) {
      try {
        await API.post(`/admin/trades/${trade.id}/result`, { result: 'win' });
        count++;
      } catch (error) {}
    }
    toast.success(`${count} trades set as WIN`);
    fetchTrades();
  };

  const handleSetAllLoss = async () => {
    const allTradesToUpdate = trades;
    if (allTradesToUpdate.length === 0) {
      toast.error('No trades');
      return;
    }
    
    let count = 0;
    for (const trade of allTradesToUpdate) {
      try {
        await API.post(`/admin/trades/${trade.id}/result`, { result: 'loss' });
        count++;
      } catch (error) {}
    }
    toast.success(`${count} trades set as LOSS`);
    fetchTrades();
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const pendingTrades = trades.filter(t => t.result === 'pending');
  const wonTrades = trades.filter(t => t.result === 'win');
  const lostTrades = trades.filter(t => t.result === 'loss');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Trades Management</h1>
          <p className="text-slate-400 mt-1">Manage all trades and results</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> Add Trade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-3xl font-bold text-amber-400">{pendingTrades.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">Won</p>
          <p className="text-3xl font-bold text-emerald-400">{wonTrades.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-sm">Lost</p>
          <p className="text-3xl font-bold text-red-400">{lostTrades.length}</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUserModal(true)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                selectedUser 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
            >
              <HiUser className="w-4 h-4" />
              {selectedUser ? (
                <span className="text-sm">{selectedUser.first_name} {selectedUser.last_name}</span>
              ) : (
                <span className="text-sm">Select User</span>
              )}
            </button>
            {selectedUser && (
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="text-sm text-slate-400">
            {selectedUser ? (
              <span>Showing trades for: <span className="text-white font-medium">{selectedUser.first_name} {selectedUser.last_name}</span></span>
            ) : (
              <span>Showing all trades</span>
            )}
          </div>
          
          {selectedUser && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleBulkWin}
                disabled={processingTrade !== null || pendingTrades.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <HiCheck className="w-4 h-4" />
                ALL WIN ({pendingTrades.length})
              </button>
              <button
                onClick={handleBulkLoss}
                disabled={processingTrade !== null || pendingTrades.length === 0}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <HiX className="w-4 h-4" />
                ALL LOSS ({pendingTrades.length})
              </button>
            </div>
          )}
        </div>

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
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Market</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Amount</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Result</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">P/L</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Date</th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      {selectedUser ? 'No trades found for this user' : 'No trades found'}
                    </td>
                  </tr>
                ) : (
                  trades.map((trade, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">
                        {trade.first_name || 'User'} {trade.last_name || ''}
                      </td>
                      <td className="px-4 py-4 text-slate-300">{trade.coin_symbol || 'XAUUSD'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.trade_type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.trade_type || 'buy'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-white font-medium">{formatCurrency(trade.amount)}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          trade.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                          trade.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {trade.result || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {trade.profit_loss ? (
                          <span className={Number(trade.profit_loss) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatCurrency(trade.profit_loss)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4 text-slate-400 text-sm">{formatDate(trade.created_at)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleManualResult(trade.id, 'win')}
                            disabled={processingTrade === trade.id}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              trade.result === 'win' 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400'
                            }`}
                            title="Set as Win"
                          >
                            <HiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleManualResult(trade.id, 'loss')}
                            disabled={processingTrade === trade.id}
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              trade.result === 'loss' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-red-500/20 hover:bg-red-500/40 text-red-400'
                            }`}
                            title="Set as Loss"
                          >
                            <HiX className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Select User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUserModal(false)} />
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Select User</h3>
            
            <div className="relative mb-4">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            
            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(false);
                      setSearchQuery('');
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                      selectedUser?.id === user.id 
                        ? 'bg-violet-600/30 border border-violet-500/50' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                      {user.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-white font-medium">{user.first_name} {user.last_name}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-medium">${Number(user.balance || 0).toFixed(2)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <button
              onClick={() => setShowUserModal(false)}
              className="w-full mt-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Trade Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Add New Trade</h3>
            <form onSubmit={handleCreateTrade} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">User ID</label>
                <input
                  type="number"
                  required
                  value={formData.user_id || ''}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Coin Symbol</label>
                  <input
                    type="text"
                    required
                    value={formData.coin_symbol || 'BTC'}
                    onChange={(e) => setFormData({ ...formData, coin_symbol: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Trade Type</label>
                  <select
                    value={formData.trade_type || 'buy'}
                    onChange={(e) => setFormData({ ...formData, trade_type: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Amount ($)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
