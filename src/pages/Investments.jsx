import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCurrencyDollar, HiClock, HiPlus } from 'react-icons/hi';
import API from '../utils/api';

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      API.get('/investments/my'),
      API.get('/plans')
    ]).then(([invRes, plansRes]) => {
      setInvestments(invRes.data);
      setPlans(plansRes.data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleInvest = async () => {
    setError('');
    setSuccess('');
    if (!selectedPlan || !amount) return;

    const amt = parseFloat(amount);
    if (amt < selectedPlan.min_amount || amt > selectedPlan.max_amount) {
      setError(`Amount must be between $${selectedPlan.min_amount} and $${selectedPlan.max_amount}`);
      return;
    }

    try {
      await API.post('/investments', { planId: selectedPlan.id, amount: amt });
      setSuccess('Investment created successfully!');
      setShowForm(false);
      setAmount('');
      setSelectedPlan(null);
      const res = await API.get('/investments/my');
      setInvestments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Investment failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">My Investments</h1>
          <p className="text-slate-400 text-xs sm:text-sm lg:text-base">Track and manage your active investments</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white font-medium transition-colors w-full sm:w-auto justify-center text-sm sm:text-base"
        >
          <HiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Investment
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6 w-full"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Create Investment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Select Plan</label>
              <select
                value={selectedPlan?.id || ''}
                onChange={(e) => setSelectedPlan(plans.find(p => p.id === parseInt(e.target.value)))}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="" className="bg-slate-700 text-slate-300">Choose a plan</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id} className="bg-slate-700 text-white">
                    {plan.name} - {plan.roi_percentage}% ROI ({plan.duration_days} days)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                placeholder={selectedPlan ? `${selectedPlan.min_amount} - ${selectedPlan.max_amount}` : 'Select a plan first'}
              />
            </div>
          </div>

          {selectedPlan && amount && (
            <div className="bg-slate-700/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-slate-400 text-xs sm:text-sm mb-2">Investment Summary</p>
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <span className="text-white text-sm sm:text-base">Amount: ${Number(parseFloat(amount) || 0).toFixed(2)}</span>
                <span className="text-green-400 text-sm sm:text-base">
                  Expected Profit: ${Number((parseFloat(amount) || 0) * selectedPlan.roi_percentage / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">{error}</p>}
          {success && <p className="text-green-400 text-xs sm:text-sm mb-3 sm:mb-4">{success}</p>}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={handleInvest} className="bg-violet-600 hover:bg-violet-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-white font-medium transition-colors text-sm sm:text-base">
              Confirm Investment
            </button>
            <button onClick={() => setShowForm(false)} className="bg-white/10 hover:bg-white/20 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-gray-300 font-medium transition-colors text-sm sm:text-base">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 sm:gap-6 w-full">
        {investments.length > 0 ? investments.map((inv, index) => (
          <motion.div
            key={inv.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white">{inv.plan_name}</h3>
                <p className="text-slate-400 text-xs sm:text-sm">{inv.plan_description}</p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                inv.status === 'active' ? 'bg-green-500/20 text-green-400' :
                inv.status === 'completed' ? 'bg-violet-500/20 text-violet-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {inv.status}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Invested Amount</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-white">${Number(inv.amount).toFixed(2)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Expected Profit</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-green-400">${Number(inv.expected_profit).toFixed(2)}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-slate-400 text-[10px] sm:text-xs mb-1">Duration</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-white">{inv.duration_days || 0} days</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-slate-400 text-[10px] sm:text-xs mb-1">ROI</p>
                <p className="text-base sm:text-lg lg:text-xl font-bold text-violet-400">{inv.roi_percentage}%</p>
              </div>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-2 text-xs sm:text-sm text-slate-400">
              <span>Started: {new Date(inv.start_date).toLocaleDateString()}</span>
              <span>End Date: {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : 'N/A'}</span>
            </div>
          </motion.div>
        )) : (
          <div className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl p-8 sm:p-12 text-center">
            <HiCurrencyDollar className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Investments Yet</h3>
            <p className="text-slate-400 text-sm sm:text-base">Start your first investment to grow your wealth</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Investments;
