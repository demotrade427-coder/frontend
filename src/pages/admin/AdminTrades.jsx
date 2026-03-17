import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiTrendingUp, HiTrendingDown, HiPlus } from 'react-icons/hi';

export default function AdminTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/trades');
      setTrades(data || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleCreateTrade = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/trades', formData);
      setShowModal(false);
      setFormData({});
      fetchTrades();
    } catch (error) {
      console.error('Error creating trade:', error);
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
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">No trades found</td>
                  </tr>
                ) : (
                  trades.map((trade, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 text-white font-medium">{trade.first_name || 'User'}</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
