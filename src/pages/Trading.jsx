import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import API from '../utils/api';
import { HiArrowUp, HiArrowDown, HiPlus, HiMinus, HiTrendingUp, HiX, HiCheck, HiBell } from 'react-icons/hi';
import MarketList from '../components/MarketList';
import TradingChart from '../components/TradingChart';
import MarketTicker from '../components/MarketTicker';
import TradeTimer from '../components/TradeTimer';

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
  const textSize = size === 'large' ? 'text-3xl lg:text-4xl' : 'text-lg lg:text-xl';

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
        className={`relative p-8 rounded-3xl ${
          result === 'win' 
            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-2 border-emerald-500' 
            : 'bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              result === 'win' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {result === 'win' ? (
              <HiCheck className="w-10 h-10 text-white" />
            ) : (
              <HiX className="w-10 h-10 text-white" />
            )}
          </motion.div>
          
          <h2 className={`text-3xl font-bold mb-2 ${
            result === 'win' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {result === 'win' ? 'Trade Won!' : 'Trade Lost'}
          </h2>
          
          <p className="text-white text-lg mb-4">
            {trade?.coin_symbol} - {trade?.trade_type?.toUpperCase()}
          </p>
          
          <p className={`text-4xl font-bold font-mono ${
            result === 'win' ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {result === 'win' ? '+' : '-'}${Number(trade?.profit_loss || 0).toFixed(2)}
          </p>
          
          <button
            onClick={onClose}
            className={`mt-6 px-8 py-3 rounded-xl font-bold text-white ${
              result === 'win' 
                ? 'bg-emerald-500 hover:bg-emerald-600' 
                : 'bg-red-500 hover:bg-red-600'
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
  const [prices, setPrices] = useState({});
  const [binancePrices, setBinancePrices] = useState({});
  const [profile, setProfile] = useState({});
  const [trades, setTrades] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [showMobileMarkets, setShowMobileMarkets] = useState(false);
  const [tradeResultModal, setTradeResultModal] = useState(null);
  const [recentSettledTrades, setRecentSettledTrades] = useState([]);
  
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchData();
    connectBinanceWebSocket();

    intervalRef.current = setInterval(() => {
      fetchTrades();
      fetchProfile();
    }, 3000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [navigate]);

  const connectBinanceWebSocket = () => {
    if (wsRef.current) wsRef.current.close();

    const streams = POPULAR_PAIRS.map(p => `${p.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.data) {
          const ticker = data.data;
          setBinancePrices(prev => ({
            ...prev,
            [ticker.s]: {
              price: parseFloat(ticker.c),
              change: parseFloat(ticker.P),
              high: parseFloat(ticker.h),
              low: parseFloat(ticker.l),
              volume: parseFloat(ticker.v),
              name: ticker.s.replace('USDT', '')
            }
          }));
        }
      } catch (err) {
        console.error('WebSocket error:', err);
      }
    };

    ws.onerror = (error) => console.error('WebSocket error:', error);
  };

  const fetchPrices = async () => {
    try {
      const { data } = await API.get('/trading/prices');
      setPrices(data || {});
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  const fetchTrades = async () => {
    try {
      const { data } = await API.get('/trading/my-trades');
      const newTrades = data || [];
      
      const settledTrades = trades.filter(t => t.result === 'pending');
      const currentPending = newTrades.filter(t => t.result === 'pending');
      
      settledTrades.forEach(oldTrade => {
        const currentTrade = currentPending.find(t => t.id === oldTrade.id);
        if (!currentTrade || currentTrade.result !== 'pending') {
          const settled = currentTrade || oldTrade;
          if (settled.result !== 'pending') {
            setRecentSettledTrades(prev => [...prev.slice(-4), settled]);
            setTradeResultModal(settled);
            
            setTimeout(() => {
              toast.custom((t) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl shadow-2xl border ${
                    settled.result === 'win' 
                      ? 'bg-emerald-900/90 border-emerald-500' 
                      : 'bg-red-900/90 border-red-500'
                  }`}
                >
                  <p className={`font-bold ${
                    settled.result === 'win' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {settled.result === 'win' ? '+' : '-'}${Number(settled.profit_loss || 0).toFixed(2)}
                  </p>
                  <p className="text-white text-sm">{settled.coin_symbol} {settled.trade_type?.toUpperCase()}</p>
                </motion.div>
              ), { duration: 5000 });
            }, 500);
          }
        }
      });
      
      setTrades(newTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const profileRes = await API.get('/trading/profile');
      setProfile(profileRes.data || {});
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [profileRes, tradesRes, pricesRes] = await Promise.all([
        API.get('/trading/profile'),
        API.get('/trading/my-trades'),
        API.get('/trading/prices')
      ]);
      setProfile(profileRes.data || {});
      setTrades(tradesRes.data || []);
      setPrices(pricesRes.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
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
      toast.success(res.data.message || 'Trade placed successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Trade failed');
    }
  };

  const displayPrices = { ...prices, ...binancePrices };
  const selectedPrice = displayPrices[selectedSymbol] || { price: 0, change: 0, name: selectedSymbol };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
      
      {/* Live Market Ticker */}
      <div className="-mx-6 lg:-mx-8 mb-6">
        <MarketTicker 
          marketData={displayPrices} 
          onSelectSymbol={setSelectedSymbol}
          selectedSymbol={selectedSymbol}
        />
      </div>

      {/* Header & Stats */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Trading</h1>
            <p className="text-slate-400 text-sm lg:text-base">Place your trades and win up to 85%</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-4 lg:p-6 backdrop-blur-xl"
          >
            <p className="text-slate-400 text-xs lg:text-sm mb-1">Trading Balance</p>
            <p className="text-xl lg:text-3xl font-bold text-white">${Number(profile.trading_balance || 0).toFixed(2)}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-amber-900/30 to-amber-800/30 border border-amber-500/20 rounded-2xl p-4 lg:p-6 backdrop-blur-xl"
          >
            <p className="text-slate-400 text-xs lg:text-sm mb-1">Pending Trades</p>
            <p className="text-xl lg:text-3xl font-bold text-amber-400">{pendingTrades.length}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 border border-emerald-500/20 rounded-2xl p-4 lg:p-6 backdrop-blur-xl"
          >
            <p className="text-slate-400 text-xs lg:text-sm mb-1">Won Trades</p>
            <p className="text-xl lg:text-3xl font-bold text-emerald-400">{wonTrades.length}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/20 rounded-2xl p-4 lg:p-6 backdrop-blur-xl"
          >
            <p className="text-slate-400 text-xs lg:text-sm mb-1">Lost Trades</p>
            <p className="text-xl lg:text-3xl font-bold text-red-400">{lostTrades.length}</p>
          </motion.div>
        </div>
      </div>

      {/* Main Trading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        
        {/* LEFT: Market List */}
        <div className="hidden lg:block lg:col-span-3 lg:h-[calc(100vh-320px)] overflow-hidden">
          <MarketList 
            selectedSymbol={selectedSymbol} 
            onSelectSymbol={setSelectedSymbol} 
          />
        </div>

        {/* Mobile: Market List Button */}
        <div className="lg:hidden col-span-1">
          <button 
            onClick={() => setShowMobileMarkets(true)}
            className="w-full bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                {selectedSymbol.slice(0, 2)}
              </div>
              <div className="text-left">
                <p className="text-white font-bold">{selectedSymbol}</p>
                <p className="text-slate-400 text-sm">${formatPrice(selectedPrice?.price || 0)}</p>
              </div>
            </div>
            <span className="text-violet-400 font-medium">Change →</span>
          </button>
        </div>

        {/* Mobile Markets Modal */}
        <AnimatePresence>
          {showMobileMarkets && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMarkets(false)} />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
                  <h3 className="text-lg font-bold text-white">Select Market</h3>
                  <button onClick={() => setShowMobileMarkets(false)} className="p-2 bg-white/10 rounded-full">
                    <HiX className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  {Object.entries(displayPrices).map(([symbol, data]) => (
                    <button
                      key={symbol}
                      onClick={() => { setSelectedSymbol(symbol); setShowMobileMarkets(false); }}
                      className={`w-full p-4 rounded-xl flex justify-between items-center transition-all ${
                        selectedSymbol === symbol 
                          ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/50' 
                          : 'bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="text-left">
                        <p className="text-white font-medium">{symbol}</p>
                        <p className="text-slate-400 text-sm">{data.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">${formatPrice(data.price || 0)}</p>
                        <p className={`text-sm ${(data.change || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(data.change || 0) >= 0 ? '+' : ''}{(data.change || 0).toFixed(2)}%
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CENTER: Chart + Trade Form */}
        <div className="col-span-1 lg:col-span-6 space-y-6">
          {/* Trading Chart */}
          <TradingChart symbol={selectedSymbol} />
          
          {/* Trade Panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {selectedSymbol.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedSymbol}</h3>
                    <p className="text-slate-400 text-sm">Place your trade</p>
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-slate-400 text-sm mb-1">Current Price</p>
                <PriceDisplay 
                  price={selectedPrice?.price || 0} 
                  prevPrice={selectedPrice?.prevPrice || 0}
                  size="large"
                />
              </div>
            </div>

            {/* Active Trade Timer */}
            {pendingTrades.length > 0 && (
              <div className="mb-4">
                <TradeTimer 
                  expiresAt={pendingTrades[0].expires_at}
                  onExpire={() => fetchTrades()}
                />
              </div>
            )}

            <form onSubmit={handleTrade} className="space-y-4">
              <div className="flex gap-4">
                <motion.button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    tradeType === 'buy' 
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30' 
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  <HiArrowUp className="w-5 h-5" />
                  BUY
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    tradeType === 'sell' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  <HiArrowDown className="w-5 h-5" />
                  SELL
                </motion.button>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <label className="text-slate-400 text-sm block mb-3">Amount (USD)</label>
                <div className="flex items-center gap-4">
                  <motion.button 
                    type="button" 
                    onClick={() => setTradeAmount(Math.max(1, tradeAmount - 10))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <HiMinus className="w-5 h-5 text-white" />
                  </motion.button>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="flex-1 bg-transparent text-3xl lg:text-4xl font-bold text-white text-center outline-none"
                  />
                  <motion.button 
                    type="button" 
                    onClick={() => setTradeAmount(tradeAmount + 10)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    <HiPlus className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-4">
                  {[10, 50, 100, 500].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTradeAmount(amt)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        tradeAmount === amt
                          ? 'bg-violet-600 text-white'
                          : 'bg-white/10 text-slate-400 hover:bg-white/20'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-sm text-slate-400">
                <span>Available: ${Number(profile.trading_balance || 0).toFixed(2)}</span>
                <span>Payout: 85%</span>
              </div>

              <motion.button
                type="submit"
                disabled={tradeAmount > Number(profile.trading_balance)}
                whileHover={{ scale: tradeAmount <= Number(profile.trading_balance) ? 1.02 : 1 }}
                whileTap={{ scale: tradeAmount <= Number(profile.trading_balance) ? 0.98 : 1 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  tradeAmount > Number(profile.trading_balance)
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : tradeType === 'buy'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50'
                }`}
              >
                {tradeAmount > Number(profile.trading_balance) 
                  ? 'Insufficient Balance' 
                  : `${tradeType.toUpperCase()} ${selectedSymbol.replace('USDT', '')} - $${tradeAmount}`
                }
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* RIGHT: Recent Trades */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 lg:p-6 h-full lg:max-h-[calc(100vh-320px)] flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-violet-400" />
              Recent Trades
              <span className="ml-auto bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">
                {trades.length}
              </span>
            </h3>
            <div className="space-y-3 overflow-y-auto flex-1">
              {trades.slice(0, 10).map((trade, i) => (
                <motion.div
                  key={trade.id || i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        trade.trade_type === 'buy' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {trade.trade_type === 'buy' ? (
                          <HiArrowUp className={`w-4 h-4 ${trade.result === 'win' ? 'text-emerald-400' : 'text-white'}`} />
                        ) : (
                          <HiArrowDown className={`w-4 h-4 ${trade.result === 'loss' ? 'text-red-400' : 'text-white'}`} />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{trade.coin_symbol}</p>
                        <p className="text-slate-400 text-xs">{trade.trade_type?.toUpperCase()} ${trade.amount}</p>
                      </div>
                    </div>
                    {trade.result === 'pending' ? (
                      <div className="text-right">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        <p className="text-amber-400 text-xs mt-1">Pending</p>
                      </div>
                    ) : (
                      <p className={`font-bold ${
                        trade.result === 'win' ? 'text-emerald-400' : 
                        trade.result === 'loss' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {trade.result === 'win' ? `+$${Number(trade.profit_loss || 0).toFixed(2)}` : 
                         trade.result === 'loss' ? `-$${Number(trade.amount || 0).toFixed(2)}` : 
                         'Pending'}
                      </p>
                    )}
                  </div>
                  
                  {trade.result === 'pending' && trade.expires_at && (
                    <div className="mt-2">
                      <TradeTimer 
                        expiresAt={trade.expires_at}
                        onExpire={() => fetchTrades()}
                        label="Expires in"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
              {trades.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <HiTrendingUp className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-500">No trades yet</p>
                  <p className="text-slate-600 text-sm mt-1">Place your first trade above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
