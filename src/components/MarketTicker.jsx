import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiBinance, SiCardano, SiPolkadot } from 'react-icons/si';
import { TbCurrencySolana } from 'react-icons/tb';
import { useBinanceMarketData } from '../hooks/useBinanceMarketData';

const CRYPTO_ICONS = {
  BTCUSDT: FaBitcoin,
  ETHUSDT: FaEthereum,
  BNBUSDT: SiBinance,
  SOLUSDT: TbCurrencySolana,
  XRPUSDT: FaBitcoin,
  ADAUSDT: SiCardano,
  DOGEUSDT: FaBitcoin,
  AVAXUSDT: FaEthereum,
  DOTUSDT: SiPolkadot,
  MATICUSDT: SiBinance,
  LINKUSDT: SiBinance,
  LTCUSDT: FaBitcoin,
  UNIUSDT: FaEthereum,
  ATOMUSDT: FaBitcoin,
  XLMUSDT: SiCardano
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

function PriceBlink({ price, prevPrice, symbol }) {
  const [flash, setFlash] = useState(null);
  const prevPriceRef = useRef(price);

  useEffect(() => {
    if (price !== prevPriceRef.current) {
      const direction = price > prevPriceRef.current ? 'up' : 'down';
      setFlash(direction);
      prevPriceRef.current = price;
      
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
    }
  }, [price]);

  return (
    <motion.span
      key={price}
      initial={flash === 'up' ? { scale: 1.05, color: '#10b981' } : 
               flash === 'down' ? { scale: 1.05, color: '#ef4444' } : {}}
      animate={{ scale: 1, color: '#ffffff' }}
      transition={{ duration: 0.3 }}
      className={`${flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-red-400' : 'text-white'}`}
    >
      ${price?.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: price < 1 ? 6 : 2
      })}
    </motion.span>
  );
}

function TickerItem({ symbol, data, isSelected, onClick }) {
  const Icon = CRYPTO_ICONS[symbol] || FaBitcoin;
  const color = CRYPTO_COLORS[symbol] || '#6366f1';
  const isPositive = (data?.change || 0) >= 0;
  const [prevPrice, setPrevPrice] = useState(data?.price);
  const [price, setPrice] = useState(data?.price);

  useEffect(() => {
    if (data?.price !== price) {
      setPrevPrice(price);
      setPrice(data?.price);
    }
  }, [data?.price, price]);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex-shrink-0 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 transition-all min-w-[140px] sm:min-w-[180px] ${
        isSelected
          ? 'bg-gradient-to-r from-violet-600/40 to-indigo-600/40 border border-violet-500/50 shadow-lg shadow-violet-500/20'
          : 'bg-white/5 border border-transparent hover:bg-white/10'
      }`}
    >
      <div 
        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
        style={{ backgroundColor: color }}
      >
        {symbol.slice(0, 2)}
      </div>
      
      <div className="text-left">
        <p className="text-white font-semibold text-xs sm:text-sm">{symbol.replace('USDT', '')}</p>
        <div className="flex items-center gap-1">
          <PriceBlink price={price} prevPrice={prevPrice} symbol={symbol} />
        </div>
      </div>
      
      <div className={`ml-auto flex items-center gap-1 text-[10px] sm:text-xs font-medium ${
        isPositive ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {isPositive ? <HiTrendingUp className="w-2 h-2 sm:w-3 sm:h-3" /> : <HiTrendingDown className="w-2 h-2 sm:w-3 sm:h-3" />}
        {isPositive ? '+' : ''}{(data?.change || 0).toFixed(2)}%
      </div>
    </motion.button>
  );
}

export default function MarketTicker({ marketData: propMarketData, onSelectSymbol, selectedSymbol }) {
  const { marketData: hookMarketData } = useBinanceMarketData();
  const [position, setPosition] = useState(0);
  const animationRef = useRef(null);
  
  const marketData = propMarketData || hookMarketData;
  const effectiveData = Object.keys(marketData).length > 0 ? marketData : {};
  
  const tickers = Object.entries(effectiveData).map(([symbol, data]) => ({
    symbol,
    data: data
  }));

  useEffect(() => {
    const tickerWidth = 188;
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const totalWidth = tickerWidth * tickers.length;
    
    const animate = () => {
      setPosition(prev => {
        const newPos = prev - 1;
        if (Math.abs(newPos) >= totalWidth / 2) {
          return 0;
        }
        return newPos;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tickers.length]);

  if (tickers.length === 0) {
  return (
    <div className="w-full overflow-hidden bg-slate-900/90 border-b border-white/10 py-2 sm:py-3">
      <div className="flex gap-2 sm:gap-3" style={{ transform: `translateX(${position}px)` }}>
        {duplicatedTickers.map((item, index) => (
          <TickerItem
            key={`${item.symbol}-${index}`}
            symbol={item.symbol}
            data={item.data}
            isSelected={selectedSymbol === item.symbol}
            onClick={() => onSelectSymbol?.(item.symbol)}
          />
        ))}
      </div>
    </div>
  );
  }

  const duplicatedTickers = [...tickers, ...tickers];

  return (
    <div className="w-full overflow-hidden bg-slate-900/90 border-b border-white/10 py-2 sm:py-3">
      <div 
        className="flex gap-2 sm:gap-3 px-2 sm:px-0"
        style={{
          transform: `translateX(${position}px)`,
          transition: 'transform 0.05s linear'
        }}
      >
        {duplicatedTickers.map((item, index) => (
          <TickerItem
            key={`${item.symbol}-${index}`}
            symbol={item.symbol}
            data={item.data}
            isSelected={selectedSymbol === item.symbol}
            onClick={() => onSelectSymbol?.(item.symbol)}
          />
        ))}
      </div>
    </div>
  );
}
