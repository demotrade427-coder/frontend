import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiArrowRight } from 'react-icons/hi';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const CRYPTO_ICONS = {
  BTCUSDT: '₿',
  ETHUSDT: 'Ξ',
  BNBUSDT: 'B',
  SOLUSDT: 'S',
  XRPUSDT: 'X',
  ADAUSDT: 'A',
  DOGEUSDT: 'D',
  AVAXUSDT: 'AV',
  DOTUSDT: 'D',
  MATICUSDT: 'M',
  LINKUSDT: 'L',
  LTCUSDT: 'L',
  UNIUSDT: 'U',
  ATOMUSDT: 'A',
  XLMUSDT: 'X'
};

const CRYPTO_COLORS = {
  BTCUSDT: '#F7931A',
  ETHUSDT: '#627EEA',
  BNBUSDT: '#F3BA2F',
  SOLUSDT: '#00FFA3',
  XRPUSDT: '#23292F',
  ADAUSDT: '#0033AD',
  DOGEUSDT: '#C2A633',
  AVAXUSDT: '#E84142',
  DOTUSDT: '#E6007A',
  MATICUSDT: '#8247E5',
  LINKUSDT: '#2A5ADA',
  LTCUSDT: '#BFBBBB',
  UNIUSDT: '#FF007A',
  ATOMUSDT: '#2E3148',
  XLMUSDT: '#14B6E7'
};

function MiniSparkline({ data, isPositive, color }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 50 - ((value - min) / range) * 40;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-20 h-10">
      <polyline
        fill="none"
        stroke={color || (isPositive ? '#10b981' : '#ef4444')}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function CryptoCard({ symbol, data, isSelected, onClick, priceHistory }) {
  const changePercent = data?.changePercent ?? data?.change ?? 0;
  const isPositive = changePercent >= 0;
  const color = CRYPTO_COLORS[symbol] || '#6366f1';
  const icon = CRYPTO_ICONS[symbol] || symbol.slice(0, 2);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl flex items-center justify-between gap-2 sm:gap-3 lg:gap-4 transition-all ${
        isSelected 
          ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/50' 
          : 'bg-slate-800/50 border border-white/5 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div 
          className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white font-bold text-[10px] sm:text-xs lg:text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="text-left min-w-0">
          <p className="text-white font-semibold text-xs sm:text-sm lg:text-base truncate">{symbol.replace('USDT', '')}</p>
          <p className="text-slate-400 text-[10px] sm:text-xs hidden lg:block truncate">{data?.name || symbol}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <div className="hidden md:block">
          <MiniSparkline data={priceHistory} isPositive={isPositive} color={color} />
        </div>
        <div className="text-right min-w-0">
          <p className="text-white font-mono font-semibold text-xs sm:text-sm lg:text-base truncate">
            ${Number(data?.price || 0).toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: (data?.price || 0) < 1 ? 6 : 2 
            })}
          </p>
          <p className={`text-[10px] sm:text-xs font-medium truncate ${
            isPositive ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function CryptoMarkets({ prices, onSelectSymbol, selectedSymbol }) {
  const [priceHistory, setPriceHistory] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const newHistory = { ...prev };
        Object.entries(prices).forEach(([symbol, data]) => {
          if (!newHistory[symbol]) newHistory[symbol] = [];
          if (data?.price) {
            newHistory[symbol] = [...(newHistory[symbol] || []), data.price].slice(-20);
          }
        });
        return newHistory;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [prices]);

  const filteredPrices = Object.entries(prices).filter(([symbol, data]) => {
    const change = data?.changePercent ?? data?.change ?? 0;
    if (filter === 'gainers') return change > 0;
    if (filter === 'losers') return change < 0;
    return true;
  });

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-3 sm:p-4 lg:p-5 border-b border-white/10">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white flex items-center gap-1.5 sm:gap-2">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Live Markets
          </h3>
          <button className="text-violet-400 hover:text-violet-300 text-xs sm:text-sm flex items-center gap-1">
            View All <HiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-1 sm:gap-2">
          {['all', 'gainers', 'losers'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                filter === f 
                  ? f === 'gainers' ? 'bg-emerald-600 text-white' :
                    f === 'losers' ? 'bg-red-600 text-white' :
                    'bg-violet-600 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Crypto List */}
      <div className="p-2 sm:p-3 lg:p-4 space-y-1.5 sm:space-y-2 max-h-[350px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto">
        {filteredPrices.map(([symbol, data]) => (
          <CryptoCard
            key={symbol}
            symbol={symbol}
            data={data}
            isSelected={selectedSymbol === symbol}
            onClick={() => onSelectSymbol?.(symbol)}
            priceHistory={priceHistory[symbol]}
          />
        ))}
      </div>
    </div>
  );
}
