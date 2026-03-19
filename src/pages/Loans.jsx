import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import API from '../utils/api';
import { HiCurrencyDollar, HiClock, HiCheck, HiX, HiPlus, HiChevronRight, HiShieldCheck, HiTrendingUp } from 'react-icons/hi';

const COLLATERAL_TYPES = ['Bitcoin', 'Ethereum', 'BNB', 'USDT', 'None'];
const DURATION_OPTIONS = [
  { duration: 7, interest: 5, label: '7 Days', monthly: '~21%' },
  { duration: 14, interest: 8, label: '14 Days', monthly: '~21%' },
  { duration: 30, interest: 12, label: '30 Days', monthly: '~12%' },
  { duration: 60, interest: 18, label: '60 Days', monthly: '~9%' },
  { duration: 90, interest: 24, label: '90 Days', monthly: '~8%' },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function LoanCard({ loan, onRepay }) {
  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const daysRemaining = loan.status === 'approved' 
    ? Math.max(0, loan.duration_days - Math.floor((new Date() - new Date(loan.approved_at)) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">Loan #{loan.id}</h3>
          <p className="text-slate-400 text-sm">Applied {new Date(loan.created_at).toLocaleDateString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[loan.status]}`}>
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Loan Amount</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(loan.amount)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Repayment</p>
          <p className="text-2xl font-bold text-violet-400">{formatCurrency(loan.repayment_amount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-white/5 rounded-xl p-3">
          <HiClock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
          <p className="text-white font-medium">{loan.duration_days} Days</p>
          <p className="text-slate-500 text-xs">Duration</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <HiTrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-white font-medium">{loan.interest_rate}%</p>
          <p className="text-slate-500 text-xs">Interest</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <HiCurrencyDollar className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-white font-medium">{formatCurrency(loan.repayment_amount - loan.amount)}</p>
          <p className="text-slate-500 text-xs">Interest Cost</p>
        </div>
      </div>

      {loan.status === 'approved' && daysRemaining !== null && (
        <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-emerald-400 text-sm font-medium">
            {daysRemaining > 0 ? `${daysRemaining} days remaining to repay` : 'Repayment overdue!'}
          </p>
        </div>
      )}

      {loan.status === 'pending' && (
        <div className="mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <p className="text-amber-400 text-sm font-medium">
            Your loan application is being reviewed
          </p>
        </div>
      )}

      {loan.status === 'rejected' && loan.rejection_reason && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-red-400 text-sm">
            <strong>Rejection Reason:</strong> {loan.rejection_reason}
          </p>
        </div>
      )}

      {loan.status === 'approved' && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onRepay(loan)}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
        >
          <HiCurrencyDollar className="w-5 h-5" />
          Repay Loan - {formatCurrency(loan.repayment_amount)}
        </motion.button>
      )}
    </motion.div>
  );
}

function ApplyLoanModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState(1000);
  const [duration, setDuration] = useState(30);
  const [collateralType, setCollateralType] = useState('None');
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const selectedDuration = DURATION_OPTIONS.find(d => d.duration === duration);
  const interestAmount = amount * (selectedDuration?.interest / 100) || 0;
  const totalRepayment = amount + interestAmount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post('/loans/apply', {
        amount,
        duration_days: duration,
        collateral_type: collateralType !== 'None' ? collateralType : null,
        collateral_amount: collateralAmount > 0 ? collateralAmount : null,
      });

      toast.success('Loan application submitted successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Apply for Loan</h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Amount */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Loan Amount (USD)</label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(100, Number(e.target.value)))}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl py-4 px-6 text-2xl font-bold text-white text-center outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex gap-2 mt-3">
              {[500, 1000, 2500, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === amt ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  ${amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Loan Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.duration}
                  type="button"
                  onClick={() => setDuration(opt.duration)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    duration === opt.duration
                      ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white border border-violet-500'
                      : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <p className="font-bold text-sm">{opt.label}</p>
                  <p className="text-xs opacity-70">{opt.interest}%</p>
                </button>
              ))}
            </div>
          </div>

          {/* Collateral */}
          <div>
            <label className="text-slate-400 text-sm block mb-2">Collateral (Optional)</label>
            <select
              value={collateralType}
              onChange={(e) => setCollateralType(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-violet-500"
            >
              {COLLATERAL_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {collateralType !== 'None' && (
              <input
                type="number"
                placeholder="Collateral Amount"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(Number(e.target.value))}
                className="w-full mt-3 bg-white/10 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-violet-500"
              />
            )}
          </div>

          {/* Summary */}
          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Loan Amount</span>
              <span className="text-white font-medium">{formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Interest Rate</span>
              <span className="text-emerald-400 font-medium">{selectedDuration?.interest}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Interest Amount</span>
              <span className="text-amber-400 font-medium">{formatCurrency(interestAmount)}</span>
            </div>
            <div className="border-t border-white/10 pt-3 flex justify-between">
              <span className="text-white font-bold">Total Repayment</span>
              <span className="text-violet-400 font-bold text-xl">{formatCurrency(totalRepayment)}</span>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading || amount < 100}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Loan Application'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedLoan, setSelectedLoan] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, statsRes] = await Promise.all([
        API.get('/loans/my-loans'),
        API.get('/loans/stats'),
      ]);
      setLoans(loansRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async (loan) => {
    if (!confirm(`Are you sure you want to repay ${formatCurrency(loan.repayment_amount)}?`)) return;

    try {
      await API.post(`/loans/repay/${loan.id}`);
      toast.success('Loan repaid successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to repay loan');
    }
  };

  const filteredLoans = filter === 'all' 
    ? loans 
    : loans.filter(l => l.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toaster position="top-center" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Loans</h1>
          <p className="text-slate-400">Get instant loans against your assets</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowApplyModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Apply for Loan
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 border border-amber-500/20 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <HiClock className="w-6 h-6 text-amber-400" />
              <span className="text-slate-400 text-sm">Pending</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-amber-400">{stats.pendingLoans}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-500/20 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <HiTrendingUp className="w-6 h-6 text-emerald-400" />
              <span className="text-slate-400 text-sm">Active</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-emerald-400">{stats.activeLoans}</p>
            <p className="text-slate-400 text-sm">{formatCurrency(stats.activeAmount)}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/20 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <HiCheck className="w-6 h-6 text-blue-400" />
              <span className="text-slate-400 text-sm">Completed</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-blue-400">{stats.completedLoans}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-violet-900/30 to-violet-800/30 border border-violet-500/20 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <HiCurrencyDollar className="w-6 h-6 text-violet-400" />
              <span className="text-slate-400 text-sm">Pending Repayment</span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-violet-400">{formatCurrency(stats.pendingRepayment)}</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'completed', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Loans Grid */}
      {filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLoans.map(loan => (
            <LoanCard key={loan.id} loan={loan} onRepay={handleRepay} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <HiCurrencyDollar className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No loans found</h3>
          <p className="text-slate-400 mb-6">Apply for a loan to get started</p>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold inline-flex items-center gap-2"
          >
            <HiPlus className="w-5 h-5" />
            Apply for Loan
          </button>
        </div>
      )}

      {/* Apply Modal */}
      <ApplyLoanModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
