import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiTrendingUp, HiTrendingDown, HiVolumeUp, HiRefresh } from 'react-icons/hi';
import { FaBitcoin, FaEthereum, FaMonero } from 'react-icons/fa';
import { SiBinance, SiCardano, SiPolkadot } from 'react-icons/si';
import { TbCurrencySolana } from 'react-icons/tb';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import useBinanceMarketData from '../hooks/useBinanceMarketData';

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

function MarketItem({ data, isSelected, onClick }) {
  const Icon = CRYPTO_ICONS[data.symbol] || FaBitcoin;
  const isPositive = data.changePercent >= 0;
  
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
        isSelected 
          ? 'bg-gradient-to-r from-violet-600/30 to-purple-600/30 border border-violet-500/50 shadow-lg shadow-violet-500/10' 
          : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'
        }`}>
          <Icon className={`w-5 h-5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
        </div>
        <div className="text-left">
          <p className="text-white font-semibold">{data.symbol.replace('USDT', '')}</p>
          <p className="text-slate-500 text-xs">{CRYPTO_NAMES[data.symbol] || data.symbol}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-white font-mono font-medium">${formatPrice(data.price)}</p>
        <div className={`flex items-center justify-end gap-1 text-xs font-medium ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isPositive ? <MdKeyboardArrowUp className="w-3 h-3" /> : <MdKeyboardArrowDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{data.changePercent?.toFixed(2)}%
        </div>
      </div>
    </motion.button>
  );
}

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(6);
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
  const { marketData, loading, error, connectionStatus, getSortedData, refresh } = useBinanceMarketData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('symbol');

  const filteredData = useMemo(() => {
    let data = getSortedData(sortBy, filter);
    
    if (search) {
      const searchLower = search.toLowerCase();
      data = data.filter(item => 
        item.symbol.toLowerCase().includes(searchLower) ||
        CRYPTO_NAMES[item.symbol]?.toLowerCase().includes(searchLower)
      );
    }
    
    return data;
  }, [marketData, search, filter, sortBy, getSortedData]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <HiTrendingUp className="w-5 h-5 text-violet-400" />
            Crypto Markets
          </h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-xs text-slate-500 capitalize">{connectionStatus}</span>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
        
        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'all' 
                ? 'bg-violet-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('gainers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filter === 'gainers' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <HiTrendingUp className="w-3 h-3" />
            Gainers
          </button>
          <button
            onClick={() => setFilter('losers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filter === 'losers' 
                ? 'bg-red-600 text-white' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <HiTrendingDown className="w-3 h-3" />
            Losers
          </button>
          <button
            onClick={() => setSortBy(sortBy === 'volume' ? 'symbol' : 'volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto ${
              sortBy === 'volume'
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <HiVolumeUp className="w-3 h-3 inline mr-1" />
            Volume
          </button>
        </div>
      </div>
      
      {/* Market List */}
      <div className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button 
              onClick={refresh}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm hover:bg-violet-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredData.map((item) => (
                <MarketItem
                  key={item.symbol}
                  data={item}
                  isSelected={selectedSymbol === item.symbol}
                  onClick={() => onSelectSymbol?.(item.symbol)}
                />
              ))}
            </AnimatePresence>
            {filteredData.length === 0 && (
              <p className="text-center text-slate-500 py-8">No markets found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
