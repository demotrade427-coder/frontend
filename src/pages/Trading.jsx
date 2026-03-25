import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import API from '../utils/api';
import { HiArrowUp, HiArrowDown, HiPlus, HiMinus, HiTrendingUp, HiX, HiCheck, HiRefresh } from 'react-icons/hi';
import MarketList from '../components/MarketList';
import TradingChart from '../components/TradingChart';
import MarketTicker from '../components/MarketTicker';
import TradeTimer from '../components/TradeTimer';
import { useBinanceMarketData } from '../hooks/useBinanceMarketData';

const POPULAR_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'XLMUSDT'
];

function formatPrice(price) {
  if (!price) return '0.00';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

function PriceDisplay({ price, prevPrice, size = 'normal' }) {
  const [direction, setDirection] = useState(null);
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(price);

  useEffect(() => {
    if (price !== prevRef.current) {
      setDirection(price > prevRef.current ? 'up' : 'down');
      setFlash(true);
      prevRef.current = price;
      const timer = setTimeout(() => {
        setDirection(null);
        setFlash(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [price]);

  const colorClass = direction === 'up' ? 'text-emerald-400' : direction === 'down' ? 'text-red-400' : 'text-white';
  const textSize = size === 'large' ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-lg lg:text-xl';

  return (
    <motion.span
      className={`font-mono font-bold ${colorClass} ${textSize}`}
      animate={flash ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      ${formatPrice(price)}
    </motion.span>
  );
}

function TradeResultModal({ result, trade, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl ${
          result === 'win' ? 'bg-emerald-900/90 border-2 border-emerald-500' : 'bg-red-900/90 border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result === 'win' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {result === 'win' ? <HiCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" /> : <HiX className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
          </motion.div>
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
            {result === 'win' ? 'Trade Won!' : 'Trade Lost'}
          </h2>
          <p className="text-white text-base sm:text-lg mb-4">{trade?.coin_symbol} - {trade?.trade_type?.toUpperCase()}</p>
          <p className={`text-3xl sm:text-4xl font-bold font-mono ${result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
            {result === 'win' ? '+' : '-'}${Number(trade?.profit_loss || 0).toFixed(2)}
          </p>
          <button
            onClick={onClose}
            className={`mt-6 px-6 sm:px-8 py-3 rounded-xl font-bold text-white ${
              result === 'win' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Continue Trading
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Trading() {
  const navigate = useNavigate();
  const { marketData, connectionStatus, refresh } = useBinanceMarketData();
  const [profile, setProfile] = useState({});
  const [trades, setTrades] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [showMobileMarkets, setShowMobileMarkets] = useState(false);
  const [tradeResultModal, setTradeResultModal] = useState(null);
  const [recentSettledTrades, setRecentSettledTrades] = useState([]);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();

    intervalRef.current = setInterval(() => {
      fetchTrades();
      fetchProfile();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate]);

  const handleRefresh = () => {
    refresh();
  };

  const fetchTrades = async () => {
    try {
      const { data } = await API.get('/trading/my-trades');
      const newTrades = data || [];
      
      const pendingTrades = trades.filter(t => t.result === 'pending');
      const currentPending = newTrades.filter(t => t.result === 'pending');
      
      pendingTrades.forEach(oldTrade => {
        const currentTrade = currentPending.find(t => t.id === oldTrade.id);
        if (!currentTrade || currentTrade.result !== 'pending') {
          const settled = currentTrade || oldTrade;
          if (settled.result !== 'pending') {
            setRecentSettledTrades(prev => [...prev.slice(-4), settled]);
            setTradeResultModal(settled);
          }
        }
      });
      
      setTrades(newTrades);
    } catch (error) {
      // Silently handle errors
    }
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await API.get('/trading/profile');
      setProfile(profileRes.data || {});
    } catch (error) {}
  };

  const fetchData = async () => {
    try {
      const [profileRes, tradesRes] = await Promise.all([
        API.get('/trading/profile'),
        API.get('/trading/my-trades')
      ]);
      setProfile(profileRes.data || {});
      setTrades(tradesRes.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/trading/trade', {
        symbol: selectedSymbol,
        trade_type: tradeType,
        amount: tradeAmount,
        duration: 60
      });
      toast.success(res.data.message || 'Trade placed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Trade failed');
    }
  };

  const displayPrices = marketData;
  const selectedPrice = displayPrices[selectedSymbol] || { price: 0, change: 0, name: selectedSymbol };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const pendingTrades = trades.filter(t => t.result === 'pending');
  const wonTrades = trades.filter(t => t.result === 'win');
  const lostTrades = trades.filter(t => t.result === 'loss');

  return (
    <div className="w-full min-h-screen">
      <Toaster position="top-center" />
      
      {/* Mobile Market Ticker */}
      <div className="w-full">
        <MarketTicker 
          marketData={displayPrices} 
          onSelectSymbol={setSelectedSymbol}
          selectedSymbol={selectedSymbol}
        />
      </div>

      {/* Header - Mobile Responsive */}
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Trading</h1>
            <p className="text-slate-400 text-xs sm:text-sm">Win up to 85%</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/5 rounded-lg hover:bg-white/10 text-slate-400 text-xs sm:text-sm"
          >
            <HiRefresh className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Refresh</span>
          </button>
        </div>

        {/* Stats Cards - Grid Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-4 backdrop-blur-xl">
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Balance</p>
            <p className="text-sm sm:text-lg lg:text-2xl font-bold text-white">${Number(profile.trading_balance || 0).toFixed(2)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 border border-amber-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 backdrop-blur-xl">
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">P&L</p>
            <p className={`text-sm sm:text-lg lg:text-2xl font-bold ${(profile.total_profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {(profile.total_profit || 0) >= 0 ? '+' : ''}${Number(profile.total_profit || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 backdrop-blur-xl">
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Wins</p>
            <p className="text-sm sm:text-lg lg:text-2xl font-bold text-emerald-400">{wonTrades.length}</p>
          </div>
          <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/20 rounded-lg sm:rounded-xl p-2.5 sm:p-4 backdrop-blur-xl">
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Losses</p>
            <p className="text-sm sm:text-lg lg:text-2xl font-bold text-red-400">{lostTrades.length}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Fully Responsive Grid */}
      <div className="px-3 sm:px-4 lg:px-6 pb-6">
        {/* Mobile Market Selector */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileMarkets(true)}
            className="w-full p-3 bg-white/5 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <HiTrendingUp className="w-5 h-5 text-violet-400" />
              <span className="text-white font-medium">{selectedSymbol.replace('USDT', '/USDT')}</span>
            </div>
            <span className="text-slate-400 text-sm">Change</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Markets List - Desktop Only */}
          <div className="hidden xl:block xl:col-span-1">
            <MarketList 
              onSelectSymbol={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </div>

          {/* Chart Section */}
          <div className="xl:col-span-2">
            <div className="mb-4">
              <TradingChart symbol={selectedSymbol} />
            </div>

            {/* Trade Form - Fully Responsive */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white">Place Trade</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="text-[10px] sm:text-xs text-slate-500">{connectionStatus === 'connected' ? 'Live' : 'Connecting...'}</span>
                </div>
              </div>
              
              {/* UP/DOWN Buttons */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 transition-all ${
                    tradeType === 'buy'
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <HiArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  UP
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`p-3 sm:p-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 transition-all ${
                    tradeType === 'sell'
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <HiArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  DOWN
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-3 sm:mb-4">
                <label className="text-slate-400 text-xs sm:text-sm mb-1 sm:mb-2 block">Amount (USD)</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTradeAmount(Math.max(10, tradeAmount - 10))}
                    className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl hover:bg-white/10"
                  >
                    <HiMinus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </button>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Math.max(10, Number(e.target.value)))}
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg sm:rounded-xl py-2 sm:py-3 px-3 sm:px-4 text-center text-lg sm:text-xl font-bold text-white outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => setTradeAmount(tradeAmount + 10)}
                    className="p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl hover:bg-white/10"
                  >
                    <HiPlus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </button>
                </div>
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 mt-2">
                  {[10, 50, 100, 200].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTradeAmount(amt)}
                      className={`py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        tradeAmount === amt ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <form onSubmit={handleTrade}>
                <motion.button
                  type="submit"
                  disabled={pendingTrades.length >= 5}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50 ${
                    tradeType === 'buy'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/30'
                  }`}
                >
                  {tradeType === 'buy' ? <HiArrowUp className="w-5 h-5" /> : <HiArrowDown className="w-5 h-5" />}
                  {tradeType === 'buy' ? 'UP' : 'DOWN'} - ${tradeAmount}
                </motion.button>
              </form>

              {pendingTrades.length >= 5 && (
                <p className="text-amber-400 text-xs sm:text-sm text-center mt-2">Max 5 active trades</p>
              )}
            </div>
          </div>

          {/* Trades Section */}
          <div className="xl:col-span-1">
            {/* Active Trades */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-xl mb-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-bold text-white">Active</h3>
                <span className="px-2 py-0.5 sm:py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                  {pendingTrades.length}
                </span>
              </div>
              
              {pendingTrades.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {pendingTrades.slice(0, 3).map(trade => (
                    <div key={trade.id} className="bg-white/5 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-white text-xs sm:text-sm font-medium">{trade.coin_symbol}</span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                          trade.trade_type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.trade_type?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] sm:text-xs">${Number(trade.amount).toFixed(0)}</span>
                        <TradeTimer expiresAt={trade.expires_at} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm text-center py-4">No active trades</p>
              )}
            </div>

            {/* Recent Results */}
            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 backdrop-blur-xl">
              <h3 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Recent</h3>
              {trades.filter(t => t.result !== 'pending').slice(0, 5).map(trade => (
                <div key={trade.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-xs sm:text-sm">{trade.coin_symbol}</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs">{trade.result === 'win' ? 'Won' : 'Lost'}</p>
                  </div>
                  <span className={`font-bold text-xs sm:text-sm ${trade.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {trade.result === 'win' ? '+' : '-'}${Number(trade.profit_loss || 0).toFixed(0)}
                  </span>
                </div>
              ))}
              {trades.filter(t => t.result !== 'pending').length === 0 && (
                <p className="text-slate-500 text-xs sm:text-sm text-center py-4">No completed trades</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Markets Modal */}
      <AnimatePresence>
        {showMobileMarkets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobileMarkets(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute bottom-0 left-0 right-0 max-h-[80vh] bg-slate-900 rounded-t-3xl p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Select Market</h3>
                <button onClick={() => setShowMobileMarkets(false)} className="p-2">
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>
              <MarketList 
                onSelectSymbol={(sym) => {
                  setSelectedSymbol(sym);
                  setShowMobileMarkets(false);
                }}
                selectedSymbol={selectedSymbol}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Result Modal */}
      <AnimatePresence>
        {tradeResultModal && (
          <TradeResultModal
            result={tradeResultModal.result}
            trade={tradeResultModal}
            onClose={() => setTradeResultModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
