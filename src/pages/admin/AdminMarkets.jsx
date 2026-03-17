import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

export default function AdminMarkets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/markets');
      setMarkets(data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/markets', formData);
      setShowModal(false);
      setFormData({});
      fetchMarkets();
    } catch (error) {
      console.error('Error creating market:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Markets Management</h1>
          <p className="text-slate-400 mt-1">Configure trading markets and payout rates</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> Add Market
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : markets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No markets configured</div>
        ) : (
          markets.map((market, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{market.name}</h3>
                  <p className="text-slate-400 text-sm">{market.symbol}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${market.is_tradable ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {market.is_tradable ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Price</span>
                  <span className="text-white font-semibold">{formatCurrency(market.current_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="text-white">{market.trade_duration_seconds || 60}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payout Rate</span>
                  <span className="text-emerald-400 font-semibold">{market.payout_rate || 85}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Market Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Add New Market</h3>
            <form onSubmit={handleCreateMarket} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Market Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Bitcoin"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BTCUSD"
                    value={formData.symbol || ''}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Payout %</label>
                  <input
                    type="number"
                    required
                    value={formData.payout_rate || 85}
                    onChange={(e) => setFormData({ ...formData, payout_rate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Current Price</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  placeholder="e.g., 50000"
                  value={formData.current_price || ''}
                  onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  required
                  value={formData.trade_duration_seconds || 60}
                  onChange={(e) => setFormData({ ...formData, trade_duration_seconds: e.target.value })}
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
