import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiRefresh, HiGlobe } from 'react-icons/hi';
import { createChart, CandlestickSeries } from 'lightweight-charts';

const BINANCE_REST_URL = 'https://api.binance.com/api/v3';

const CRYPTO_NAMES = {
  BTCUSDT: 'Bitcoin', ETHUSDT: 'Ethereum', BNBUSDT: 'BNB', SOLUSDT: 'Solana',
  XRPUSDT: 'XRP', ADAUSDT: 'Cardano', DOGEUSDT: 'Dogecoin', AVAXUSDT: 'Avalanche',
  DOTUSDT: 'Polkadot', MATICUSDT: 'Polygon', LINKUSDT: 'Chainlink', LTCUSDT: 'Litecoin',
  UNIUSDT: 'Uniswap', ATOMUSDT: 'Cosmos', XLMUSDT: 'Stellar'
};

const TIMEFRAMES = [
  { label: '1m', value: '1m' }, { label: '5m', value: '5m' },
  { label: '15m', value: '15m' }, { label: '1H', value: '1h' },
];

export default function TradingChart({ symbol = 'BTCUSDT', onPriceUpdate }) {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const updateIntervalRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('1m');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [priceDirection, setPriceDirection] = useState(null);
  const [stats, setStats] = useState({ high: 0, low: 0, volume: 0, change: 0 });

  const cleanup = useCallback(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
    if (chartInstanceRef.current) {
      try { chartInstanceRef.current.remove(); } catch (e) {}
      chartInstanceRef.current = null;
      candleSeriesRef.current = null;
    }
  }, []);

  const initChart = useCallback((container) => {
    if (!container) return;

    try {
      if (chartInstanceRef.current) {
        try { chartInstanceRef.current.remove(); } catch (e) {}
        chartInstanceRef.current = null;
      }

      const containerWidth = container.clientWidth || container.offsetWidth || 600;
      const containerHeight = container.clientHeight || container.offsetHeight || 300;

      const chart = createChart(container, {
        layout: { 
          background: { type: 'solid', color: '#0f172a' }, 
          textColor: '#94a3b8' 
        },
        grid: { 
          vertLines: { color: 'rgba(148, 163, 184, 0.1)' }, 
          horzLines: { color: 'rgba(148, 163, 184, 0.1)' }
        },
        rightPriceScale: { borderColor: 'rgba(148, 163, 184, 0.2)' },
        timeScale: { borderColor: 'rgba(148, 163, 184, 0.2)', timeVisible: true },
        width: containerWidth,
        height: containerHeight,
      });

      chartInstanceRef.current = chart;

      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      candleSeriesRef.current = candleSeries;

      const handleResize = () => {
        if (chartInstanceRef.current && container) {
          chartInstanceRef.current.applyOptions({
            width: container.clientWidth || container.offsetWidth || 600,
            height: container.clientHeight || container.offsetHeight || 300,
          });
        }
      };

      window.addEventListener('resize', handleResize);
      const resizeInterval = setInterval(handleResize, 500);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearInterval(resizeInterval);
      };
    } catch (e) {
      console.error('Chart init error:', e);
      setError('Chart initialization failed');
    }
  }, []);

  const fetchKlines = useCallback(async (sym, tf) => {
    setLoading(true);
    setError(null);

    try {
      const tfMap = { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h' };
      
      const response = await fetch(`${BINANCE_REST_URL}/klines?symbol=${sym}&interval=${tfMap[tf]}&limit=500`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('No data');
      }

      const candleData = data.map(d => ({
        time: Math.floor(d[0] / 1000),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
      }));

      if (candleSeriesRef.current) {
        candleSeriesRef.current.setData(candleData);
        chartInstanceRef.current?.timeScale().fitContent();
      }

      setUsingFallback(false);

      const lastCandle = candleData[candleData.length - 1];
      const firstCandle = candleData[0];
      
      if (lastCandle && firstCandle) {
        setCurrentPrice(lastCandle.close);
        setPrevPrice(lastCandle.close);
        
        const high24h = Math.max(...data.slice(-24).map(d => parseFloat(d[2])));
        const low24h = Math.min(...data.slice(-24).map(d => parseFloat(d[3])));
        const totalVolume = data.reduce((sum, d) => sum + parseFloat(d[5]), 0);
        const changePercent = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;

        setStats({ high: high24h, low: low24h, volume: totalVolume, change: changePercent });
      }

      setLoading(false);
    } catch (e) {
      console.error('Failed to fetch klines:', e);
      setError('Failed to load chart data');
      setLoading(false);
    }
  }, [symbol]);

  const updatePrice = useCallback(async (sym) => {
    try {
      const response = await fetch(`${BINANCE_REST_URL}/ticker/24hr?symbol=${sym}`);
      if (response.ok) {
        const data = await response.json();
        const price = parseFloat(data.lastPrice);
        const change = parseFloat(data.priceChangePercent);
        
        setCurrentPrice(prev => {
          if (prev !== null) {
            setPriceDirection(price > prev ? 'up' : 'down');
          }
          return price;
        });
        
        setStats(prev => ({
          ...prev,
          high: parseFloat(data.highPrice),
          low: parseFloat(data.lowPrice),
          change: change
        }));
        
        if (onPriceUpdate) onPriceUpdate(price);
      }
    } catch (e) {
      console.error('Failed to update price:', e);
    }
  }, [onPriceUpdate]);

  useEffect(() => {
    let mounted = true;
    let resizeCleanup = null;

    const init = () => {
      if (!mounted) return;
      
      cleanup();
      
      setTimeout(() => {
        if (chartContainerRef.current && mounted) {
          resizeCleanup = initChart(chartContainerRef.current);
          fetchKlines(symbol, timeframe);
        }
      }, 100);
    };

    init();

    return () => {
      mounted = false;
      if (resizeCleanup) resizeCleanup();
      cleanup();
    };
  }, [symbol, timeframe, initChart, fetchKlines, cleanup]);

  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      updatePrice(symbol);
    }, 5000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [symbol, updatePrice]);

  const isPositive = stats.change >= 0;

  const handleRetry = () => {
    fetchKlines(symbol, timeframe);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-2.5 sm:p-3 lg:p-4 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 lg:gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 mb-0.5 sm:mb-1">
              <span className="text-base sm:text-xl lg:text-2xl font-bold text-white">{symbol.replace('USDT', '')}</span>
              <span className="text-slate-400 text-xs sm:text-sm lg:text-base">/USDT</span>
              <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <HiTrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <HiTrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                {isPositive ? '+' : ''}{stats.change?.toFixed(2) || '0.00'}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-[10px] sm:text-xs lg:text-sm">{CRYPTO_NAMES[symbol] || symbol}</p>
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-1">
                <HiGlobe className="w-3 h-3" />
                LIVE
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-white/5 rounded-lg p-0.5 sm:p-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-1.5 sm:px-2 lg:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    timeframe === tf.value ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleRetry}
              className="p-1.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-2.5 sm:p-3 lg:p-4 border-b border-white/10">
        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono transition-colors duration-300 ${
          priceDirection === 'up' ? 'text-emerald-400' : priceDirection === 'down' ? 'text-red-400' : 'text-white'
        }`}>
          ${currentPrice?.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: currentPrice < 1 ? 6 : 2
          }) || '---'}
        </p>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="w-full bg-slate-900 h-52 sm:h-64 lg:h-80 xl:h-96 relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-violet-500 mx-auto mb-2 sm:mb-3"></div>
              <span className="text-white text-xs sm:text-sm">Loading chart...</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-2.5 sm:p-3 lg:p-4 border-t border-white/10 bg-white/5">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
          <div>
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">24h High</p>
            <p className="text-white font-mono font-medium text-xs sm:text-sm">
              ${stats.high?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '---'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">24h Low</p>
            <p className="text-white font-mono font-medium text-xs sm:text-sm">
              ${stats.low?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '---'}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] sm:text-xs mb-0.5 sm:mb-1">24h Volume</p>
            <p className="text-white font-mono font-medium text-xs sm:text-sm">
              ${stats.volume > 0 ? (stats.volume / 1000000).toFixed(2) + 'M' : '---'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
