import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiTrendingUp, HiTrendingDown, HiVolumeUp, HiRefresh } from 'react-icons/hi';
import { FaBitcoin, FaEthereum, FaMonero } from 'react-icons/fa';
import { SiBinance, SiCardano, SiPolkadot } from 'react-icons/si';
import { TbCurrencySolana } from 'react-icons/tb';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { useBinanceMarketData } from '../hooks/useBinanceMarketData';

const CRYPTO_ICONS = {
  BTCUSDT: FaBitcoin,
  ETHUSDT: FaEthereum,
  BNBUSDT: SiBinance,
  SOLUSDT: TbCurrencySolana,
  XRPUSDT: FaMonero,
  ADAUSDT: SiCardano,
  DOGEUSDT: FaBitcoin,
  AVAXUSDT: FaEthereum,
  DOTUSDT: SiPolkadot,
  MATICUSDT: SiBinance,
  LINKUSDT: SiBinance,
  LTCUSDT: FaBitcoin,
  UNIUSDT: FaEthereum,
  ATOMUSDT: FaMonero,
  XLMUSDT: SiCardano
};

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

const ALL_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'XLMUSDT',
  'NEARUSDT', 'FTMUSDT', 'ALGOUSDT', 'ICPUSDT', 'FILUSDT'
];

const FALLBACK_PRICES = {
  BTCUSDT: { price: 70000, change: 2.5, volume: 28500000000, high: 71000, low: 69000 },
  ETHUSDT: { price: 2200, change: 1.8, volume: 15200000000, high: 2250, low: 2150 },
  BNBUSDT: { price: 600, change: -0.5, volume: 1800000000, high: 610, low: 595 },
  SOLUSDT: { price: 150, change: 3.2, volume: 3500000000, high: 155, low: 145 },
  XRPUSDT: { price: 0.52, change: -1.2, volume: 1200000000, high: 0.54, low: 0.51 },
  ADAUSDT: { price: 0.45, change: 0.8, volume: 450000000, high: 0.47, low: 0.44 },
  DOGEUSDT: { price: 0.12, change: 5.1, volume: 800000000, high: 0.13, low: 0.11 },
  AVAXUSDT: { price: 35, change: 2.3, volume: 520000000, high: 36, low: 34 },
  DOTUSDT: { price: 7.5, change: -0.8, volume: 310000000, high: 7.7, low: 7.4 },
  MATICUSDT: { price: 0.85, change: 1.5, volume: 420000000, high: 0.88, low: 0.83 },
  LINKUSDT: { price: 15, change: 0.9, volume: 580000000, high: 15.5, low: 14.8 },
  LTCUSDT: { price: 85, change: -0.3, volume: 390000000, high: 87, low: 84 },
  UNIUSDT: { price: 10, change: 2.1, volume: 220000000, high: 10.3, low: 9.8 },
  ATOMUSDT: { price: 9, change: 1.2, volume: 180000000, high: 9.2, low: 8.8 },
  XLMUSDT: { price: 0.12, change: 0.7, volume: 95000000, high: 0.125, low: 0.118 },
  NEARUSDT: { price: 5.2, change: 3.5, volume: 420000000, high: 5.4, low: 5.0 },
  FTMUSDT: { price: 0.72, change: 2.1, volume: 280000000, high: 0.74, low: 0.70 },
  ALGOUSDT: { price: 0.18, change: -0.5, volume: 120000000, high: 0.19, low: 0.177 },
  ICPUSDT: { price: 12.5, change: 4.2, volume: 350000000, high: 13.0, low: 12.0 },
  FILUSDT: { price: 5.8, change: 1.8, volume: 410000000, high: 6.0, low: 5.6 }
};

function formatPrice(price) {
  if (!price) return '0.00';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(vol) {
  if (!vol) return '0';
  if (vol >= 1000000000) return (vol / 1000000000).toFixed(1) + 'B';
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
  return vol.toFixed(0);
}

function MarketItem({ data, isSelected, onClick }) {
  const Icon = CRYPTO_ICONS[data.symbol] || FaBitcoin;
  const isPositive = data.change >= 0;
  
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-between transition-all ${
        isSelected 
          ? 'bg-violet-600/30 border border-violet-500/50' 
          : 'bg-white/5 border border-transparent hover:bg-white/10'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
        <div className="text-left">
          <p className="text-white font-medium text-xs sm:text-sm">{data.symbol.replace('USDT', '')}</p>
          <p className="text-slate-500 text-[10px] sm:text-xs hidden sm:block">{CRYPTO_NAMES[data.symbol] || data.symbol}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-white font-mono font-medium text-xs sm:text-sm">${formatPrice(data.price)}</p>
        <p className={`text-[10px] sm:text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{data.change?.toFixed(2)}%
        </p>
      </div>
    </motion.button>
  );
}

function MarketRow({ data, isSelected, onClick }) {
  const Icon = CRYPTO_ICONS[data.symbol] || FaBitcoin;
  const isPositive = data.change >= 0;
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
        isSelected ? 'bg-violet-600/20 border border-violet-500/30' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-white font-medium text-sm">{data.symbol.replace('USDT', '')}</span>
      </div>
      <div className="text-right">
        <p className="text-white font-mono text-sm">${formatPrice(data.price)}</p>
        <p className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{data.change?.toFixed(2)}%
        </p>
      </div>
    </motion.button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-3 w-12 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MarketList({ onSelectSymbol, selectedSymbol }) {
  const { marketData, loading } = useBinanceMarketData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [showAll, setShowAll] = useState(false);

  const filteredData = useMemo(() => {
    let data = Object.values(marketData);
    
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(item => 
        item.symbol.toLowerCase().includes(searchLower) ||
        CRYPTO_NAMES[item.symbol]?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filter === 'gainers') {
      data = data.filter(item => item.change > 0);
    } else if (filter === 'losers') {
      data = data.filter(item => item.change < 0);
    }
    
    if (sortBy === 'price') {
      data.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'change') {
      data.sort((a, b) => b.change - a.change);
    } else if (sortBy === 'volume') {
      data.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    }
    
    if (!showAll) {
      data = data.slice(0, 15);
    }
    
    return data;
  }, [marketData, search, filter, sortBy, showAll]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl h-full flex flex-col max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <HiTrendingUp className="w-4 h-4 text-violet-400" />
            Markets
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-emerald-400">Live</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-2 sm:mb-3">
          <HiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl py-1.5 sm:py-2 pl-8 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => { setFilter('all'); setSortBy('rank'); }}
            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
              filter === 'all' && sortBy === 'rank'
                ? 'bg-violet-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setFilter('gainers'); setSortBy('change'); }}
            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
              filter === 'gainers'
                ? 'bg-emerald-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => { setFilter('losers'); setSortBy('change'); }}
            className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap ${
              filter === 'losers'
                ? 'bg-red-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            Losers
          </button>
        </div>
      </div>
      
      {/* Market List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent p-2 sm:p-3">
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-1.5 sm:space-y-2">
            <AnimatePresence>
              {filteredData.slice(0, 12).map((item) => (
                <MarketItem
                  key={item.symbol}
                  data={item}
                  isSelected={selectedSymbol === item.symbol}
                  onClick={() => onSelectSymbol?.(item.symbol)}
                />
              ))}
            </AnimatePresence>
            {filteredData.length === 0 && (
              <p className="text-center text-slate-500 py-4 text-xs sm:text-sm">No markets found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
