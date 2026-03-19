import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { HiTrendingUp, HiTrendingDown, HiRefresh, HiChartBar } from 'react-icons/hi';
import { createChart } from 'lightweight-charts';
import { LineSeries, CandlestickSeries } from 'lightweight-charts';

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

const TIMEFRAMES = [
  { label: '1m', value: '1m', seconds: 60 },
  { label: '5m', value: '5m', seconds: 300 },
  { label: '15m', value: '15m', seconds: 900 },
  { label: '1H', value: '1h', seconds: 3600 },
];

export default function TradingChart({ symbol = 'BTCUSDT', onPriceUpdate }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('1m');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [prevPrice, setPrevPrice] = useState(null);
  const [priceDirection, setPriceDirection] = useState(null);
  const [stats, setStats] = useState({ high: 0, low: 0, volume: 0, change: 0 });

  const fetchHistoricalData = useCallback(async (tf) => {
    try {
      setLoading(true);
      const intervalMap = { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h' };
      const limit = 500;
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${intervalMap[tf]}&limit=${limit}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data || !Array.isArray(data)) return;
      
      const candleData = data.map(d => ({
        time: Math.floor(d[0] / 1000),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        value: parseFloat(d[5])
      }));

      if (candleSeriesRef.current && chartRef.current) {
        candleSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(candleData.map(d => ({
          time: d.time,
          value: d.value,
          color: d.close >= d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
        })));
        
        chartRef.current.timeScale().fitContent();
        
        const lastCandle = candleData[candleData.length - 1];
        if (lastCandle) {
          setCurrentPrice(lastCandle.close);
          
          const high24h = Math.max(...candleData.slice(-24).map(c => c.high));
          const low24h = Math.min(...candleData.slice(-24).map(c => c.low));
          const firstPrice = candleData[0].open;
          const changePercent = ((lastCandle.close - firstPrice) / firstPrice) * 100;
          
          setStats({
            high: high24h,
            low: low24h,
            volume: candleData.reduce((sum, c) => sum + c.value, 0),
            change: changePercent
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      setLoading(false);
    }
  }, [symbol]);

  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.1)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.1)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: 2,
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: 2,
          labelBackgroundColor: '#6366f1',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(148, 163, 184, 0.2)',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(148, 163, 184, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addSeries(LineSeries, {
      color: 'rgba(99, 102, 241, 0.3)',
      lineWidth: 1,
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const streamName = `${symbol.toLowerCase()}@kline_${timeframe}`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.k) {
          const candle = data.k;
          
          setPrevPrice(currentPrice);
          setCurrentPrice(parseFloat(candle.c));
          setPriceDirection(parseFloat(candle.c) > parseFloat(candle.o) ? 'up' : 'down');
          
          if (candleSeriesRef.current) {
            candleSeriesRef.current.update({
              time: Math.floor(candle.t / 1000),
              open: parseFloat(candle.o),
              high: parseFloat(candle.h),
              low: parseFloat(candle.l),
              close: parseFloat(candle.c),
            });
          }
          
          if (onPriceUpdate) {
            onPriceUpdate(parseFloat(candle.c));
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    ws.onclose = () => {
      reconnectRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [symbol, timeframe, currentPrice, onPriceUpdate]);

  useEffect(() => {
    initChart();
    fetchHistoricalData(timeframe);
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [symbol, timeframe, initChart, fetchHistoricalData, connectWebSocket]);

  const isPositive = stats.change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-white">{symbol.replace('USDT', '')}</span>
              <span className="text-slate-400">/USDT</span>
              <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isPositive ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{stats.change?.toFixed(2)}%
              </div>
            </div>
            <p className="text-slate-500 text-sm">{CRYPTO_NAMES[symbol] || symbol}</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  timeframe === tf.value
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-baseline gap-3">
          <motion.p
            key={currentPrice}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className={`text-4xl lg:text-5xl font-bold font-mono ${
              priceDirection === 'up' ? 'text-emerald-400' : 
              priceDirection === 'down' ? 'text-red-400' : 'text-white'
            } ${priceDirection ? 'animate-pulse' : ''}`}
          >
            ${currentPrice?.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: currentPrice < 1 ? 6 : 2
            })}
          </motion.p>
          <div className={`flex items-center gap-1 text-sm ${
            priceDirection === 'up' ? 'text-emerald-400' : 
            priceDirection === 'down' ? 'text-red-400' : 'text-slate-400'
          }`}>
            {priceDirection === 'up' ? <HiTrendingUp className="w-4 h-4" /> : 
             priceDirection === 'down' ? <HiTrendingDown className="w-4 h-4" /> : null}
            {priceDirection && (
              <span>{priceDirection === 'up' ? '+' : '-'}${Math.abs(currentPrice - prevPrice)?.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: '400px' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
              <span className="text-white">Loading chart...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full" />
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-slate-500 text-xs mb-1">24h High</p>
            <p className="text-white font-mono font-medium">
              ${stats.high?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">24h Low</p>
            <p className="text-white font-mono font-medium">
              ${stats.low?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-1">24h Volume</p>
            <p className="text-white font-mono font-medium">
              ${(stats.volume / 1000000).toFixed(2)}M
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
