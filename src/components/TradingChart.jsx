import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiRefresh } from 'react-icons/hi';
import { useBinanceMarketData } from '../hooks/useBinanceMarketData';

const CRYPTO_NAMES = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  BNBUSDT: 'BNB',
  SOLUSDT: 'Solana',
  XRPUSDT: 'XRP',
  ADAUSDT: 'Cardano',
  DOGEUSDT: 'Dogecoin',
  AVAXUSDT: 'Avalanche',
  DOTUSDT: 'Polkadot',
  MATICUSDT: 'Polygon',
  LINKUSDT: 'Chainlink',
  LTCUSDT: 'Litecoin',
  UNIUSDT: 'Uniswap',
  ATOMUSDT: 'Cosmos',
  XLMUSDT: 'Stellar'
};

function MiniSparkline({ data, isPositive, height = 40 }) {
  if (!data || data.length < 2) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
      <polyline
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function TradingChart({ symbol = 'BTCUSDT' }) {
  const { marketData, loading } = useBinanceMarketData();
  const [priceHistory, setPriceHistory] = useState([]);
  
  const currentData = marketData[symbol];
  const isPositive = currentData?.changePercent >= 0;
  
  useEffect(() => {
    if (currentData?.price) {
      setPriceHistory(prev => {
        const newHistory = [...prev, currentData.price];
        if (newHistory.length > 30) {
          return newHistory.slice(-30);
        }
        return newHistory;
      });
    }
  }, [currentData?.price]);

  if (loading || !currentData) {
    return (
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-32" />
          <div className="h-10 bg-white/10 rounded w-48" />
          <div className="h-4 bg-white/10 rounded w-24" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-white">{symbol.replace('USDT', '')}</span>
            <span className="text-slate-400">/USDT</span>
          </div>
          <p className="text-slate-500 text-sm">{CRYPTO_NAMES[symbol] || symbol}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
          isPositive 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {isPositive ? <HiTrendingUp className="w-4 h-4" /> : <HiTrendingDown className="w-4 h-4" />}
          {isPositive ? '+' : ''}{currentData.changePercent?.toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <p className={`text-5xl font-bold font-mono ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          ${currentData.price?.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: currentData.price < 1 ? 6 : 2 
          })}
        </p>
      </div>

      {/* Sparkline Chart */}
      <div className="h-24 mb-6">
        <MiniSparkline data={priceHistory} isPositive={isPositive} height={80} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
        <div>
          <p className="text-slate-500 text-xs mb-1">24h High</p>
          <p className="text-white font-mono font-medium">
            ${currentData.high?.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">24h Low</p>
          <p className="text-white font-mono font-medium">
            ${currentData.low?.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </p>
        </div>
        <div>
          <p className="text-slate-500 text-xs mb-1">24h Volume</p>
          <p className="text-white font-mono font-medium">
            ${(currentData.volume / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>
    </motion.div>
  );
}
