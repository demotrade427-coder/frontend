import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { HiArrowUp, HiArrowDown, HiPlus, HiMinus, HiTrendingUp, HiClock } from 'react-icons/hi';
import MarketList from '../components/MarketList';
import TradingChart from '../components/TradingChart';

function Trading() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({});
  const [profile, setProfile] = useState({});
  const [trades, setTrades] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState(100);
  const [tradeType, setTradeType] = useState('buy');
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState({});
  const [showMobileMarkets, setShowMobileMarkets] = useState(false);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
    
    intervalRef.current = setInterval(() => {
      fetchPrices();
      fetchTrades();
    }, 2000);

    countdownRef.current = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};
      trades.forEach(trade => {
        if (trade.result === 'pending' && trade.expires_at) {
          const expires = new Date(trade.expires_at);
          const diff = Math.max(0, Math.floor((expires - now) / 1000));
          newCountdowns[trade.id] = diff;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [navigate]);

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
      setTrades(data || []);
      const profileRes = await API.get('/trading/profile');
      setProfile(profileRes.data || {});
    } catch (error) {
      console.error('Error fetching trades:', error);
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
      alert(res.data.message || 'Trade placed successfully!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Trade failed');
    }
  };

  const priceList = Object.entries(prices).map(([symbol, data]) => ({
    symbol,
    name: data.name,
    price: data.price,
    change: data.changePercent
  }));
  
  const selectedPrice = prices[selectedSymbol] || { price: 0, changePercent: 0, name: selectedSymbol };

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
      {/* Header & Stats */}
      <div className="w-full mb-4 lg:mb-6">
        <div className="flex justify-between items-center mb-4 lg:mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Trading</h1>
            <p className="text-slate-400 text-sm lg:text-base">Place your trades and win</p>
          </div>
        </div>

        {/* Stats Cards - Full Width Grid - Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 w-full">
          <div className="bg-slate-800/50 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-6">
            <p className="text-slate-400 text-xs lg:text-sm mb-1 lg:mb-2">Balance</p>
            <p className="text-xl lg:text-3xl font-bold text-white">${Number(profile.trading_balance || 0).toFixed(2)}</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-6">
            <p className="text-slate-400 text-xs lg:text-sm mb-1 lg:mb-2">Pending</p>
            <p className="text-xl lg:text-3xl font-bold text-amber-400">{pendingTrades.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-6">
            <p className="text-slate-400 text-xs lg:text-sm mb-1 lg:mb-2">Won</p>
            <p className="text-xl lg:text-3xl font-bold text-emerald-400">{wonTrades.length}</p>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-6">
            <p className="text-slate-400 text-xs lg:text-sm mb-1 lg:mb-2">Lost</p>
            <p className="text-xl lg:text-3xl font-bold text-red-400">{lostTrades.length}</p>
          </div>
        </div>
      </div>

      {/* Main Trading Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full">
        
        {/* LEFT: Market List - Hidden on mobile, shown in modal or separate tab */}
        <div className="hidden lg:block lg:col-span-3 lg:h-[calc(100vh-280px)] overflow-hidden">
          <MarketList 
            selectedSymbol={selectedSymbol} 
            onSelectSymbol={setSelectedSymbol} 
          />
        </div>

        {/* Mobile: Market List Button */}
        <div className="lg:hidden col-span-1">
          <button 
            onClick={() => setShowMobileMarkets(true)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-white font-bold">{selectedSymbol}</span>
              <span className="text-slate-400 text-sm">${Number(selectedPrice?.price || 0).toLocaleString()}</span>
            </div>
            <span className="text-violet-400">Change →</span>
          </button>
        </div>

        {/* Mobile Markets Modal */}
        {showMobileMarkets && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileMarkets(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900">
                <h3 className="text-lg font-bold text-white">Select Market</h3>
                <button onClick={() => setShowMobileMarkets(false)} className="text-slate-400">✕</button>
              </div>
              <div className="p-4 space-y-2">
                {Object.entries(prices).map(([symbol, data]) => (
                  <button
                    key={symbol}
                    onClick={() => { setSelectedSymbol(symbol); setShowMobileMarkets(false); }}
                    className={`w-full p-4 rounded-xl flex justify-between items-center ${
                      selectedSymbol === symbol 
                        ? 'bg-violet-600/20 border border-violet-500/30' 
                        : 'bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-white font-medium">{symbol}</p>
                      <p className="text-slate-400 text-sm">{data.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${Number(data.price || 0).toLocaleString()}</p>
                      <p className={`text-sm ${(data.changePercent || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {(data.changePercent || 0) >= 0 ? '+' : ''}{Number(data.changePercent || 0).toFixed(2)}%
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTER: Chart + Trade Form */}
        <div className="col-span-1 lg:col-span-6 space-y-4 lg:space-y-6">
          {/* Trading Chart */}
          <TradingChart symbol={selectedSymbol} />
          
          {/* Trade Panel */}
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-3 lg:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 lg:gap-4 mb-3 lg:mb-6">
              <div>
                <h3 className="text-lg lg:text-2xl font-bold text-white">{selectedSymbol}</h3>
                <p className="text-slate-400 text-xs lg:text-sm">Place your trade</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl lg:text-4xl font-bold text-white">${Number(selectedPrice?.price || 0).toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={handleTrade} className="space-y-3 lg:space-y-4">
              <div className="flex gap-2 lg:gap-4">
                <button
                  type="button"
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-2 lg:py-5 rounded-xl font-bold text-xs lg:text-lg transition-all ${
                    tradeType === 'buy' 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  <HiArrowUp className="inline w-3 lg:w-5 h-3 lg:h-5 mr-1" />
                  <span className="hidden xs:inline">BUY</span>
                  <span className="xs:hidden">B</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-2 lg:py-5 rounded-xl font-bold text-xs lg:text-lg transition-all ${
                    tradeType === 'sell' 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white/10 text-slate-400 hover:bg-white/20'
                  }`}
                >
                  <HiArrowDown className="inline w-3 lg:w-5 h-3 lg:h-5 mr-1" />
                  <span className="hidden xs:inline">SELL</span>
                  <span className="xs:hidden">S</span>
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-3 lg:p-5">
                <label className="text-slate-400 text-sm block mb-2 lg:mb-3">Amount (USD)</label>
                <div className="flex items-center gap-2 lg:gap-4">
                  <button type="button" onClick={() => setTradeAmount(Math.max(1, tradeAmount - 100))} className="p-2 lg:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex-shrink-0">
                    <HiMinus className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                  </button>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(Number(e.target.value))}
                    className="flex-1 bg-transparent text-xl lg:text-4xl font-bold text-white text-center outline-none min-w-0"
                  />
                  <button type="button" onClick={() => setTradeAmount(tradeAmount + 100)} className="p-2 lg:p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex-shrink-0">
                    <HiPlus className="w-4 lg:w-6 h-4 lg:h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between text-sm lg:text-base text-slate-400">
                <span>Available: ${Number(profile.trading_balance || 0).toFixed(2)}</span>
                <span>Payout: 85%</span>
              </div>

              <button
                type="submit"
                disabled={tradeAmount > Number(profile.trading_balance)}
                className={`w-full py-3 lg:py-5 rounded-xl font-bold text-xs sm:text-sm lg:text-lg transition-all truncate ${
                  tradeAmount > Number(profile.trading_balance)
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : tradeType === 'buy'
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30'
                }`}
              >
                {tradeAmount > Number(profile.trading_balance) 
                  ? 'Insufficient Balance' 
                  : `${tradeType.toUpperCase()} ${selectedSymbol} - $${tradeAmount}`
                }
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Recent Trades */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 lg:p-6 h-full lg:max-h-[calc(100vh-280px)] flex flex-col">
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
              <HiTrendingUp className="w-5 h-5 text-violet-400" />
              Recent Trades
            </h3>
            <div className="space-y-2 lg:space-y-3 overflow-y-auto flex-1">
              {trades.slice(0, 10).map((trade, i) => (
                <div key={i} className="flex justify-between items-center p-3 lg:p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-2 lg:gap-3 min-w-0">
                    {trade.result === 'win' ? (
                      <HiArrowUp className="w-4 lg:w-5 h-4 lg:h-5 text-emerald-400 flex-shrink-0" />
                    ) : trade.result === 'loss' ? (
                      <HiArrowDown className="w-4 lg:w-5 h-4 lg:h-5 text-red-400 flex-shrink-0" />
                    ) : (
                      <div className="w-4 lg:w-5 h-4 lg:h-5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-medium text-sm lg:text-base truncate">{trade.coin_symbol}</p>
                      <p className="text-slate-400 text-xs lg:text-sm">{trade.trade_type?.toUpperCase()} - ${trade.amount}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {trade.result === 'pending' ? (
                      <div className="text-amber-400 font-bold text-sm lg:text-lg">
                        ${trade.amount}
                        <p className="text-xs">at ${Number(trade.price || 0).toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className={`font-bold text-sm lg:text-lg ${
                        trade.result === 'win' ? 'text-emerald-400' : 
                        trade.result === 'loss' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {trade.result === 'win' ? `+$${Number(trade.profit_loss || 0).toFixed(2)}` : 
                         trade.result === 'loss' ? `-$${Number(trade.amount || 0).toFixed(2)}` : 'Pending'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {trades.length === 0 && (
                <p className="text-slate-500 text-center py-6 lg:py-8">No trades yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trading;
