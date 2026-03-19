import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiClock, HiPlay, HiPause } from 'react-icons/hi';

export default function TradeTimer({ expiresAt, onExpire, label = 'Trade expires in' }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!expiresAt) return 0;
      const now = new Date();
      const expiry = new Date(expiresAt);
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));
      return diff;
    };

    setTimeLeft(calculateTimeLeft());

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        setIsActive(false);
        if (onExpire) onExpire();
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const progress = expiresAt ? 
    Math.max(0, Math.min(100, (timeLeft / 60) * 100)) : 0;

  const getColor = () => {
    if (timeLeft <= 10) return '#ef4444';
    if (timeLeft <= 30) return '#f59e0b';
    return '#10b981';
  };

  const formatTime = (num) => num.toString().padStart(2, '0');

  if (!expiresAt) return null;

  return (
    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HiClock className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 text-sm">{label}</span>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {isActive ? (
            <HiPause className="w-4 h-4 text-white" />
          ) : (
            <HiPlay className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-4">
        {/* Circular Timer */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
              fill="none"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              stroke={getColor()}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: 220, strokeDashoffset: 0 }}
              animate={{ 
                strokeDashoffset: 220 - (progress / 100) * 220 
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold font-mono" style={{ color: getColor() }}>
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-left">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold font-mono text-white">
              {formatTime(minutes)}
            </span>
            <span className="text-slate-400 text-lg">:</span>
            <span className="text-4xl font-bold font-mono text-white">
              {formatTime(seconds)}
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {timeLeft > 0 ? 'seconds remaining' : 'Trade expired'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: getColor() }}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-slate-500 text-xs">Start</span>
          <span className="text-slate-500 text-xs">Settlement</span>
        </div>
      </div>
    </div>
  );
}

export function CountdownTimer({ duration = 60, onTick, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (onComplete) onComplete();
          return 0;
        }
        if (onTick) onTick(prev - 1);
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [duration, onTick, onComplete]);

  const progress = (timeLeft / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="#6366f1"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={100}
            strokeDashoffset={100 - progress}
          />
        </svg>
      </div>
      <span className="text-lg font-mono font-bold text-white">
        {minutes > 0 && `${minutes}:`}{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
