import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCreditCard, HiArrowUp, HiArrowDown } from 'react-icons/hi';
import API from '../utils/api';

function Wallet() {
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/dashboard/user'),
      API.get('/deposits/my'),
      API.get('/withdrawals/my')
    ]).then(([dashRes, depRes, withRes]) => {
      setBalance(dashRes.data.balance);
      setDeposits(depRes.data);
      setWithdrawals(withRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleDeposit = async () => {
    setError('');
    setSuccess('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await API.post('/deposits', { amount: parseFloat(amount), paymentMethod });
      setSuccess('Deposit request submitted successfully!');
      setShowDeposit(false);
      setAmount('');
      const [dashRes, depRes] = await Promise.all([API.get('/dashboard/user'), API.get('/deposits/my')]);
      setBalance(dashRes.data.balance);
      setDeposits(depRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    }
  };

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > balance) {
      setError('Insufficient balance');
      return;
    }
    if (!walletAddress) {
      setError('Please enter wallet address');
      return;
    }

    try {
      await API.post('/withdrawals', { amount: parseFloat(amount), walletAddress });
      setSuccess('Withdrawal request submitted successfully!');
      setShowWithdraw(false);
      setAmount('');
      setWalletAddress('');
      const [dashRes, withRes] = await Promise.all([API.get('/dashboard/user'), API.get('/withdrawals/my')]);
      setBalance(dashRes.data.balance);
      setWithdrawals(withRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 sm:h-96">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 text-xs sm:text-sm lg:text-base">Manage your funds and transactions</p>
      </div>

      {/* Wallet Cards - Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <HiCreditCard className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-violet-400" />
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 text-center">Available Balance</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center">${Number(balance).toFixed(2)}</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowDeposit(true)}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-green-500/50 transition-colors text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <HiArrowDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />
          </div>
          <p className="text-white font-semibold text-base sm:text-lg lg:text-xl">Deposit</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Add funds to wallet</p>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setShowWithdraw(true)}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-yellow-500/50 transition-colors text-center"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <HiArrowUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-yellow-500" />
          </div>
          <p className="text-white font-semibold text-base sm:text-lg lg:text-xl">Withdraw</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Transfer to wallet</p>
        </motion.button>
      </div>

      {showDeposit && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Deposit Funds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-white text-sm sm:text-base lg:text-lg"
                placeholder="Enter amount"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-white text-sm sm:text-base lg:text-lg"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>}
          {success && <p className="text-green-400 text-xs sm:text-sm mb-3 sm:mb-4">{success}</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button onClick={handleDeposit} className="bg-violet-600 hover:bg-violet-700 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl text-white font-medium text-sm sm:text-base lg:text-lg transition-colors">
              Submit Deposit
            </button>
            <button onClick={() => setShowDeposit(false)} className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl text-gray-300 font-medium text-sm sm:text-base lg:text-lg transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {showWithdraw && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 lg:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Withdraw Funds</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-white text-sm sm:text-base lg:text-lg"
                placeholder={`Max: $${Number(balance).toFixed(2)}`}
              />
            </div>
            <div>
              <label className="block text-gray-400 text-xs sm:text-sm mb-1.5 sm:mb-2">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-white text-sm sm:text-base lg:text-lg"
                placeholder="Enter wallet address"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>}
          {success && <p className="text-green-400 text-xs sm:text-sm mb-3 sm:mb-4">{success}</p>}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button onClick={handleWithdraw} className="bg-violet-600 hover:bg-violet-700 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl text-white font-medium text-sm sm:text-base lg:text-lg transition-colors">
              Submit Withdrawal
            </button>
            <button onClick={() => setShowWithdraw(false)} className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl text-gray-300 font-medium text-sm sm:text-base lg:text-lg transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6">Deposit History</h3>
          <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
            {deposits.length > 0 ? deposits.map((d, i) => (
              <div key={i} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base lg:text-lg">${Number(d.amount).toFixed(2)}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">{d.payment_method}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm ${
                    d.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    d.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {d.status}
                  </span>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1">{new Date(d.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">No deposits yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
        >
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-4 sm:mb-6">Withdrawal History</h3>
          <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto pr-1">
            {withdrawals.length > 0 ? withdrawals.map((w, i) => (
              <div key={i} className="flex justify-between items-center p-3 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium text-sm sm:text-base lg:text-lg">${Number(w.amount).toFixed(2)}</p>
                  <p className="text-gray-400 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]">{w.wallet_address}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm ${
                    w.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {w.status}
                  </span>
                  <p className="text-gray-500 text-[10px] sm:text-xs mt-1">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-6 sm:py-8 text-sm">No withdrawals yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Wallet;