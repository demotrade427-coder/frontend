import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiCreditCard, HiChartBar, HiArrowUp, HiArrowDown, HiRefresh } from 'react-icons/hi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../utils/api';
import CryptoMarkets from '../components/CryptoMarkets';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [trades, setTrades] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [liveTrades, setLiveTrades] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  const intervalRef = useRef(null);

  const fetchData = async () => {
    try {
      const [dashRes, tradesRes, pricesRes] = await Promise.all([
        API.get('/dashboard/user'),
        API.get('/trading/my-trades').catch(() => ({ data: [] })),
        API.get('/trading/prices').catch(() => ({}))
      ]);
      
      setDashboard(dashRes.data);
      setTrades(tradesRes.data || []);
      setPrices(pricesRes.data || {});
      
      if (tradesRes.data?.length > 0) {
        const recentTrades = tradesRes.data.slice(0, 10).map(t => ({
          id: t.id,
          symbol: t.coin_symbol || 'XAUUSD',
          type: t.trade_type,
          amount: t.amount,
          result: t.result,
          profit: t.profit_loss,
          time: new Date(t.created_at).toLocaleTimeString()
        }));
        setLiveTrades(prev => {
          const newTrades = [...recentTrades, ...prev].slice(0, 20);
          return newTrades;
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const chartData = trades.length > 0 ? trades.slice(0, 15).map((t, i) => ({
    trade: `T${i + 1}`,
    value: t.result === 'win' ? Number(t.profit_loss || 0) : t.result === 'loss' ? -Number(t.amount || 0) : 0
  })).reverse() : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const totalWins = trades.filter(t => t.result === 'win').length;
  const totalLosses = trades.filter(t => t.result === 'loss').length;
  const totalWinAmount = trades.filter(t => t.result === 'win').reduce((sum, t) => sum + Number(t.profit_loss || 0), 0);
  const totalLossAmount = trades.filter(t => t.result === 'loss').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const netProfit = totalWinAmount - totalLossAmount;

  const stats = [
    { 
      label: 'Trading Balance', 
      value: `$${Number(dashboard?.balance || 0).toFixed(2)}`, 
      icon: HiCreditCard, 
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-400'
    },
    { 
      label: 'Total Profit', 
      value: `$${Number(netProfit || 0).toFixed(2)}`, 
      icon: HiChartBar, 
      color: netProfit >= 0 ? 'from-emerald-500 to-green-600' : 'from-red-500 to-orange-600',
      textColor: netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
    },
    { 
      label: 'Total Wins', 
      value: totalWins, 
      icon: HiTrendingUp, 
      color: 'from-emerald-500 to-green-600',
      textColor: 'text-emerald-400',
      suffix: ''
    },
    { 
      label: 'Total Losses', 
      value: totalLosses, 
      icon: HiTrendingDown, 
      color: 'from-red-500 to-orange-600',
      textColor: 'text-red-400',
      suffix: ''
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm lg:text-base">Welcome back! Here's your trading overview.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-3 bg-slate-800/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 w-full sm:w-auto justify-center flex"
        >
          <HiRefresh className="w-5 h-5" />
        </button>
      </div>

      {/* Premium Crypto Markets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
        {/* Left: Crypto Markets List */}
        <div className="lg:col-span-1">
          <CryptoMarkets 
            prices={prices} 
            selectedSymbol={selectedCrypto}
            onSelectSymbol={setSelectedCrypto}
          />
        </div>

        {/* Right: Stats + Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-slate-800/50 border border-white/10 p-3 lg:p-4"
              >
                <div className={`absolute top-0 right-0 w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-br ${stat.color} opacity-20 rounded-full -translate-y-1/2 translate-x-1/2`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">{stat.label}</p>
                    <p className={`text-lg lg:text-xl font-bold ${stat.textColor}`}>{stat.value}{stat.suffix || ''}</p>
                  </div>
                  <div className={`p-1.5 lg:p-2 rounded-lg bg-gradient-to-br ${stat.color} opacity-20`}>
                    <stat.icon className={`w-3 lg:w-4 h-3 lg:h-4 ${stat.textColor}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Profit Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 lg:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-white">Profit/Loss History</h3>
              <Link to="/dashboard/trading" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
                Start Trading <HiArrowUp className="w-4 h-4 rotate-45" />
              </Link>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="trade" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 lg:h-48 flex items-center justify-center text-slate-500">
                No trade data yet. Start trading to see your profits!
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Live Trades Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:mb-8">
        {/* Live Trades Feed */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 lg:p-6 overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-white">Recent Trades</h3>
              <Link to="/dashboard/trading" className="text-violet-400 hover:text-violet-300 text-sm">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Market</th>
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Type</th>
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Amount</th>
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Entry</th>
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Result</th>
                    <th className="text-left py-2 px-2 lg:px-4 text-gray-400 font-medium text-xs lg:text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.length > 0 ? (
                    trades.slice(0, 8).map((trade, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-2 lg:px-4">
                          <span className="text-white font-medium text-sm">{trade.coin_symbol || 'XAUUSD'}</span>
                        </td>
                        <td className="py-2 px-2 lg:px-4">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            trade.trade_type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.trade_type?.toUpperCase() || 'BUY'}
                          </span>
                        </td>
                        <td className="py-2 px-2 lg:px-4 text-white text-sm">${Number(trade.amount || 0).toFixed(2)}</td>
                        <td className="py-2 px-2 lg:px-4 text-slate-300 text-sm">${Number(trade.price || 0).toFixed(2)}</td>
                        <td className="py-2 px-2 lg:px-4">
                          <span className={`px-2 py-0.5 lg:py-1 rounded-full text-xs font-medium ${
                            trade.result === 'win' ? 'bg-emerald-500/20 text-emerald-400' :
                            trade.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {trade.result === 'win' ? `Win (+$${Number(trade.profit_loss || 0).toFixed(2)})` :
                             trade.result === 'loss' ? `Loss ($${Number(trade.amount || 0).toFixed(2)})` :
                             'Pending'}
                          </span>
                        </td>
                        <td className="py-2 px-2 lg:px-4 text-slate-400 text-xs">
                          {trade.created_at ? new Date(trade.created_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        No trades yet. <Link to="/dashboard/trading" className="text-violet-400">Start trading!</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Live Results Feed */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-4 lg:p-6 h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg lg:text-xl font-semibold text-white">Live Results</h3>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                LIVE
              </span>
            </div>
            <div className="space-y-2 max-h-[300px] lg:max-h-[350px] overflow-y-auto">
              {liveTrades.length > 0 ? (
                liveTrades.map((trade, i) => (
                  <div 
                    key={`${trade.id}-${i}`} 
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      trade.result === 'win' 
                        ? 'bg-emerald-500/10 border border-emerald-500/20' 
                        : trade.result === 'loss'
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-amber-500/10 border border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {trade.result === 'win' ? (
                        <HiTrendingUp className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : trade.result === 'loss' ? (
                        <HiTrendingDown className="w-4 h-4 text-red-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{trade.symbol}</p>
                        <p className="text-slate-400 text-xs">{trade.time}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${
                        trade.result === 'win' 
                          ? 'text-emerald-400' 
                          : trade.result === 'loss'
                          ? 'text-red-400'
                          : 'text-amber-400'
                      }`}>
                        {trade.result === 'win' 
                          ? `+$${Number(trade.profit || 0).toFixed(2)}` 
                          : trade.result === 'loss'
                          ? `-$${Number(trade.amount || 0).toFixed(2)}`
                          : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-6">No trades yet</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
