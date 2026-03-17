import { useState, useEffect } from 'react';
import API from '../../utils/api';
import { HiPlus, HiCreditCard, HiTrash } from 'react-icons/hi';

export default function AdminBankAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/bank-accounts');
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/bank-accounts', formData);
      setShowModal(false);
      setFormData({});
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const account = accounts.find(a => a.id === id);
      await API.patch(`/admin/bank-accounts/${id}`, { ...account, is_active: !isActive });
      fetchAccounts();
    } catch (error) {
      console.error('Error toggling account:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await API.delete(`/admin/bank-accounts/${id}`);
      fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Bank Accounts</h1>
          <p className="text-slate-400 mt-1">Manage payment accounts for deposits</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500">No bank accounts configured</div>
        ) : (
          accounts.map((account, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${account.is_active ? 'bg-slate-800/50 border-white/10' : 'bg-slate-800/30 border-white/5 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${account.is_crypto ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                    <HiCreditCard className={`w-5 h-5 ${account.is_crypto ? 'text-amber-400' : 'text-emerald-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{account.bank_name}</h3>
                    <p className="text-slate-400 text-sm">{account.is_crypto ? account.wallet_type : account.country}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggle(account.id, account.is_active)}
                  className={`px-2 py-1 rounded-lg text-xs ${account.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                >
                  {account.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <p className="text-slate-300"><span className="text-slate-500">Name:</span> {account.account_name}</p>
                <p className="text-slate-300"><span className="text-slate-500">Number:</span> {account.account_number}</p>
                {account.is_crypto && (
                  <p className="text-slate-300"><span className="text-slate-500">Network:</span> {account.network}</p>
                )}
                <p className="text-slate-300"><span className="text-slate-500">Priority:</span> {account.priority || 0}</p>
              </div>
              <button 
                onClick={() => handleDelete(account.id)}
                className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">Add Bank/Crypto Account</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_crypto || false}
                    onChange={(e) => setFormData({ ...formData, is_crypto: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-violet-500"
                  />
                  <span className="text-white text-sm">Crypto Wallet</span>
                </label>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Bank/Crypto Name</label>
                <input
                  type="text"
                  required
                  placeholder={formData.is_crypto ? 'e.g., USDT TRC20' : 'e.g., Chase Bank'}
                  value={formData.bank_name || ''}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Account Name</label>
                <input
                  type="text"
                  required
                  value={formData.account_name || ''}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                />
              </div>
              {formData.is_crypto ? (
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Wallet Address</label>
                    <input
                      type="text"
                      required
                      value={formData.wallet_address || ''}
                      onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Network</label>
                    <select
                      value={formData.network || 'TRC20'}
                      onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="TRC20">TRC20 (TRON)</option>
                      <option value="ERC20">ERC20 (Ethereum)</option>
                      <option value="BEP20">BEP20 (BNB)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Account Number</label>
                    <input
                      type="text"
                      required
                      value={formData.account_number || ''}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.country || ''}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-sm mb-2">Currency</label>
                      <select
                        value={formData.currency || 'USD'}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
