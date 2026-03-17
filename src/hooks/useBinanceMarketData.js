import { useState, useEffect, useRef, useCallback } from 'react';

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/!ticker@arr';
const BINANCE_REST_URL = 'https://api.binance.com/api/v3/ticker/24hr';

const POPULAR_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'XLMUSDT'
];

export function useBinanceMarketData() {
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(BINANCE_REST_URL);
      const data = await response.json();
      
      const formatted = {};
      data.forEach(ticker => {
        if (POPULAR_PAIRS.includes(ticker.symbol)) {
          formatted[ticker.symbol] = {
            symbol: ticker.symbol,
            price: parseFloat(ticker.lastPrice),
            change: parseFloat(ticker.priceChangePercent),
            high: parseFloat(ticker.highPrice),
            low: parseFloat(ticker.lowPrice),
            volume: parseFloat(ticker.quoteVolume),
            prevPrice: parseFloat(ticker.prevClosePrice)
          };
        }
      });
      
      setMarketData(formatted);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    wsRef.current = new WebSocket(BINANCE_WS_URL);

    wsRef.current.onopen = () => {
      setConnectionStatus('connected');
      console.log('Binance WebSocket connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!Array.isArray(data)) return;

        setMarketData(prev => {
          const updated = { ...prev };
          data.forEach(ticker => {
            if (POPULAR_PAIRS.includes(ticker.symbol)) {
              updated[ticker.symbol] = {
                symbol: ticker.symbol,
                price: parseFloat(ticker.c),
                change: parseFloat(ticker.P),
                high: parseFloat(ticker.h),
                low: parseFloat(ticker.l),
                volume: parseFloat(ticker.v),
                prevPrice: updated[ticker.symbol]?.price || parseFloat(ticker.c)
              };
            }
          });
          return updated;
        });
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error');
    };

    wsRef.current.onclose = () => {
      setConnectionStatus('disconnected');
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [fetchInitialData, connect]);

  const getSortedData = useCallback((sortBy = 'symbol', filter = 'all') => {
    let data = Object.values(marketData);
    
    if (filter === 'gainers') {
      data = data.filter(item => item.change > 0);
    } else if (filter === 'losers') {
      data = data.filter(item => item.change < 0);
    }
    
    return data.sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'change') return b.change - a.change;
      if (sortBy === 'volume') return b.volume - a.volume;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [marketData]);

  return {
    marketData,
    loading,
    error,
    connectionStatus,
    getSortedData,
    refresh: fetchInitialData
  };
}

export function useCryptoPrice(symbol) {
  const [price, setPrice] = useState(null);
  const [change, setChange] = useState(0);
  const [prevPrice, setPrevPrice] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const streamName = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrevPrice(price);
      setPrice(parseFloat(data.c));
      setChange(parseFloat(data.P));
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  const direction = prevPrice && price > prevPrice ? 'up' : prevPrice && price < prevPrice ? 'down' : 'none';

  return { price, change, direction };
}

export default useBinanceMarketData;
