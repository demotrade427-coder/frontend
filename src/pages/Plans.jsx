import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCalculator, HiClock, HiCurrencyDollar } from 'react-icons/hi';
import API from '../utils/api';

function Plans() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [amount, setAmount] = useState('');
  const [calculated, setCalculated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/plans').then(res => setPlans(res.data)).catch(console.error);
  }, []);

  const handleCalculate = () => {
    if (!selectedPlan || !amount) return;
    const amt = parseFloat(amount);
    if (amt < selectedPlan.min_amount || amt > selectedPlan.max_amount) return;
    
    const profit = (amt * selectedPlan.roi_percentage) / 100;
    setCalculated({
      amount: amt,
      profit,
      total: amt + profit,
      days: selectedPlan.duration_days
    });
  };

  const handleInvest = () => {
    if (!selectedPlan || !amount) return;
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    navigate('/dashboard', { state: { invest: true, plan: selectedPlan, amount } });
  };

  return (
    <div className="pt-24 pb-16">
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-white mb-6">Investment Plans</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the perfect plan to grow your wealth. All plans come with guaranteed returns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-card rounded-xl p-6 cursor-pointer transition-all ${
                  selectedPlan?.id === plan.id ? 'border-primary-500 ring-2 ring-primary-500/30' : ''
                }`}
                onClick={() => { setSelectedPlan(plan); setCalculated(null); setAmount(''); }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                  {index === 2 && <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded">Popular</span>}
                </div>
                <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <p className="text-4xl font-bold gradient-text">{plan.roi_percentage}%</p>
                  <p className="text-gray-500 text-sm">ROI in {plan.duration_days} days</p>
                </div>
                <div className="flex justify-between text-sm text-gray-400 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Min</p>
                    <p className="text-white">${plan.min_amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Max</p>
                    <p className="text-white">${plan.max_amount}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Calculate Your Returns</h3>
                <p className="text-gray-400">Selected: {selectedPlan.name} Plan</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Investment Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${selectedPlan.min_amount} - ${selectedPlan.max_amount}`}
                    className="input-field w-full px-4 py-3 rounded-lg text-white"
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Min: ${selectedPlan.min_amount} - Max: ${selectedPlan.max_amount}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleCalculate}
                    className="btn-primary px-8 py-3 rounded-lg text-white font-medium"
                  >
                    <HiCalculator className="w-5 h-5 inline mr-2" />
                    Calculate
                  </button>
                </div>
              </div>

              {calculated && (
                <div className="bg-dark-800/50 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-gray-400 text-sm">Invested</p>
                      <p className="text-2xl font-bold text-white">${Number(calculated.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Profit</p>
                      <p className="text-2xl font-bold text-green-400">+${Number(calculated.profit).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Return</p>
                      <p className="text-2xl font-bold text-primary-400">${Number(calculated.total).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 text-center text-gray-400 text-sm">
                    Investment period: {calculated.days} days
                  </div>
                </div>
              )}

              <button
                onClick={handleInvest}
                className="w-full btn-primary py-4 rounded-lg text-white font-semibold text-lg"
              >
                Invest Now
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Plans;