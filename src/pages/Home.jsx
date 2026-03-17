import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight, HiShieldCheck, HiTrendingUp, HiClock, HiUserGroup, HiCurrencyDollar, HiChartBar, HiPlay, HiCheck, HiArrowUp, HiArrowDown, HiStar, HiGlobe, HiLightningBolt, HiBadgeCheck } from 'react-icons/hi';
import API from '../utils/api';

const certLogos = {
  'ISO 27001': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#e74c3c" strokeWidth="3"/>
      <path d="M24 12v24M12 24h24" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  'SOC 2': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <rect x="8" y="8" width="32" height="32" rx="4" stroke="#2ecc71" strokeWidth="3"/>
      <path d="M16 24h16M24 16v16" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  'FINRA': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <circle cx="24" cy="24" r="20" stroke="#9b59b6" strokeWidth="3"/>
      <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10" stroke="#9b59b6" strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 14v20" stroke="#9b59b6" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  'SEC': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <rect x="6" y="10" width="36" height="28" rx="2" stroke="#3498db" strokeWidth="3"/>
      <path d="M14 10v28M34 10v28M14 20h20M14 30h20" stroke="#3498db" strokeWidth="2"/>
    </svg>
  ),
  'FCA': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <polygon points="24,6 44,24 24,42 4,24" stroke="#1abc9c" strokeWidth="3"/>
      <path d="M24 18v12M18 24h12" stroke="#1abc9c" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  'ASIC': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <circle cx="24" cy="24" r="20" stroke="#e67e22" strokeWidth="3"/>
      <path d="M24 14a10 10 0 1 1 0 20 10 10 0 0 1 0-20" stroke="#e67e22" strokeWidth="3"/>
      <circle cx="24" cy="24" r="4" fill="#e67e22"/>
    </svg>
  ),
  'PCI DSS': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <rect x="8" y="14" width="32" height="20" rx="2" stroke="#c0392b" strokeWidth="3"/>
      <path d="M8 22h32M16 14v6M32 14v6" stroke="#c0392b" strokeWidth="2"/>
    </svg>
  ),
  'GDPR': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <circle cx="24" cy="24" r="20" stroke="#8e44ad" strokeWidth="3"/>
      <path d="M24 14v20M14 24h20" stroke="#8e44ad" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="24" cy="24" r="6" stroke="#8e44ad" strokeWidth="2"/>
    </svg>
  ),
  'MiFID II': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <path d="M8 40V16l16-8 16 8v24l-16 8-16-8z" stroke="#27ae60" strokeWidth="3"/>
      <path d="M24 8v32M8 16l16 8 16-8" stroke="#27ae60" strokeWidth="2"/>
    </svg>
  ),
  'FATF': () => (
    <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
      <polygon points="24,6 6,24 24,42 42,24" stroke="#f39c12" strokeWidth="3"/>
      <circle cx="24" cy="24" r="8" stroke="#f39c12" strokeWidth="3"/>
    </svg>
  ),
};

function AnimatedNumber({ end, suffix = '', duration = 2, decimals = 0 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toFixed(decimals)}{suffix}</span>;
}

function Home() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    API.get('/plans').then(res => setPlans(res.data.slice(0, 4))).catch(console.error);
  }, []);

  const stats = [
    { label: 'Active Investors', value: '50,000+', icon: HiUserGroup },
    { label: 'Total Invested', value: '$250M+', icon: HiCurrencyDollar },
    { label: 'Years Experience', value: '8+', icon: HiClock },
    { label: 'Security Verified', value: '100%', icon: HiShieldCheck },
  ];

  const teamMembers = [
    { name: 'Sarah Johnson', role: 'CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
    { name: 'Michael Chen', role: 'CTO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { name: 'Emma Williams', role: 'CFO', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
    { name: 'James Wilson', role: 'Head of Trading', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
    { name: 'Lisa Anderson', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
    { name: 'David Brown', role: 'Lead Analyst', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  ];

  const tradingCards = [
    { name: 'Bitcoin', symbol: 'BTC', price: '67,245.00', change: '+2.34%', isUp: true },
    { name: 'Ethereum', symbol: 'ETH', price: '3,452.00', change: '+1.87%', isUp: true },
    { name: 'Solana', symbol: 'SOL', price: '178.50', change: '-0.45%', isUp: false },
    { name: 'Cardano', symbol: 'ADA', price: '0.65', change: '+5.12%', isUp: true },
  ];

  const features = [
    { title: 'AI-Powered Trading', description: 'Advanced algorithms that maximize your returns automatically.', icon: HiChartBar },
    { title: 'Real-time Analytics', description: 'Track your investments with live updates and detailed reports.', icon: HiTrendingUp },
    { title: 'Secure Wallet', description: 'Industry-leading encryption keeps your funds safe.', icon: HiShieldCheck },
    { title: 'Expert Support', description: 'Our dedicated team is always available to help you.', icon: HiUserGroup },
  ];

  const benefits = [
    { icon: HiLightningBolt, title: 'Instant Trading', desc: 'Execute trades in milliseconds' },
    { icon: HiGlobe, title: 'Global Access', desc: 'Trade from anywhere worldwide' },
    { icon: HiBadgeCheck, title: 'Award Winning', desc: 'Recognized by industry experts' },
    { icon: HiShieldCheck, title: 'Fully Insured', desc: 'Your assets are protected' },
  ];

  return (
    <div className="bg-black min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen lg:min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-black pt-16 lg:pt-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute top-10 lg:top-20 left-10 lg:left-20 w-48 lg:w-72 h-48 lg:h-72 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 lg:bottom-20 right-10 lg:right-20 w-56 lg:w-96 h-56 lg:h-96 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-300 text-sm font-medium">Live Trading Active</span>
                  <span className="text-green-500 text-sm">• 24/7 Markets</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight"
                >
                  Grow Your Wealth with
                  <span className="block mt-1 text-white">
                    Smart Trading
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-base sm:text-lg lg:text-xl text-gray-400 mb-6 max-w-lg"
                >
                  Experience next-level investing with our AI-powered platform. 
                  Real-time analytics, secure transactions, and premium returns.
                </motion.p>

                {/* Stats Row */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="flex flex-wrap gap-6 lg:gap-8 mb-6"
                >
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-white">$<AnimatedNumber end={250} suffix="M+" />+</p>
                    <p className="text-gray-500 text-xs lg:text-sm">Total Volume</p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-white"><AnimatedNumber end={50} suffix="K+" /></p>
                    <p className="text-gray-500 text-xs lg:text-sm">Active Users</p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-white">99%</p>
                    <p className="text-gray-500 text-xs lg:text-sm">Uptime</p>
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-white">24/7</p>
                    <p className="text-gray-500 text-xs lg:text-sm">Support</p>
                  </div>
                </motion.div>

                {/* Team Avatars */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center mb-6"
                >
                  <div className="flex -space-x-3">
                    {teamMembers.slice(0, 5).map((member, i) => (
                      <img 
                        key={i}
                        src={member.image}
                        alt={member.name}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-2 lg:border-3 border-black object-cover"
                      />
                    ))}
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 border-2 lg:border-3 border-black flex items-center justify-center text-white text-xs lg:text-sm font-bold">
                      +1
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold text-sm lg:text-base">Join 50K+ investors</p>
                    <p className="text-gray-500 text-xs">Start your journey today</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 lg:gap-4"
                >
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center space-x-2 px-6 lg:px-8 py-3 lg:py-4 bg-white text-black font-semibold lg:font-bold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <span>Start Trading</span>
                    <HiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    to="/plans" 
                    className="flex items-center justify-center space-x-2 px-6 lg:px-8 py-3 lg:py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    <span>View Plans</span>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Content - Trading Cards */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full"
              >
                {/* Main Portfolio Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white text-black rounded-2xl lg:rounded-3xl p-5 lg:p-6 mb-3 lg:mb-4 shadow-xl lg:shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-4 lg:mb-6">
                    <div>
                      <p className="text-black/60 text-sm">Total Portfolio Value</p>
                      <p className="text-black text-3xl lg:text-4xl font-bold">$124,589</p>
                    </div>
                    <div className="w-12 lg:w-14 h-12 lg:h-14 bg-black rounded-xl lg:rounded-2xl flex items-center justify-center">
                      <HiChartBar className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HiArrowUp className="w-4 lg:w-5 h-4 lg:h-5 text-green-600" />
                    <span className="text-black font-semibold text-sm lg:text-base">+$12,450 today</span>
                    <span className="text-black/60 text-sm">(+24.5%)</span>
                  </div>
                </motion.div>

                {/* Trading Cards Grid */}
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  {tradingCards.map((card, index) => (
                    <motion.div
                      key={card.symbol}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-white/10 border border-white/10 rounded-2xl p-4 lg:p-5 hover:bg-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-white/10 flex items-center justify-center">
                          <span className="text-white font-bold text-sm lg:text-base">{card.symbol[0]}</span>
                        </div>
                        <div className={`flex items-center text-xs lg:text-sm ${card.isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {card.isUp ? <HiArrowUp className="w-3 lg:w-4 h-3 lg:h-4" /> : <HiArrowDown className="w-3 lg:w-4 h-3 lg:h-4" />}
                          <span className="font-bold ml-1">{card.change}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-semibold text-sm lg:text-base">{card.name}</h3>
                      <p className="text-gray-400 text-lg lg:text-xl font-bold">${card.price}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-3 mt-3 lg:mt-4">
                  <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 lg:py-4 text-white text-sm font-medium transition-all">
                    Deposit
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 lg:py-4 text-white text-sm font-medium transition-all">
                    Withdraw
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl py-3 lg:py-4 text-white text-sm font-medium transition-all">
                    Trade
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-12 bg-black border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Trusted & Certified</h2>
            <p className="text-gray-400 text-sm lg:text-base">Industry-leading certifications and partnerships</p>
          </motion.div>
        </div>
        
        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex gap-6 lg:gap-12 w-max animate-marquee py-4">
            {[
              { name: 'ISO 27001' },
              { name: 'SOC 2' },
              { name: 'FINRA' },
              { name: 'SEC' },
              { name: 'FCA' },
              { name: 'ASIC' },
              { name: 'PCI DSS' },
              { name: 'GDPR' },
              { name: 'MiFID II' },
              { name: 'FATF' },
            ].concat([
              { name: 'ISO 27001' },
              { name: 'SOC 2' },
              { name: 'FINRA' },
              { name: 'SEC' },
              { name: 'FCA' },
              { name: 'ASIC' },
              { name: 'PCI DSS' },
              { name: 'GDPR' },
              { name: 'MiFID II' },
              { name: 'FATF' },
            ]).map((cert, index) => {
              const LogoComponent = certLogos[cert.name];
              return (
                <motion.div
                  key={`${cert.name}-${index}`}
                  initial={{ opacity: 0.4 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center justify-center min-w-[120px] lg:min-w-[160px] py-6 px-6 lg:px-8 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                >
                  <div className="mb-3">
                    {LogoComponent && <LogoComponent />}
                  </div>
                  <span className="text-white text-xs lg:text-sm font-semibold">{cert.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-black border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{benefit.title}</p>
                  <p className="text-gray-500 text-xs">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Active Investors', value: 50000, suffix: '+', icon: HiUserGroup },
              { label: 'Total Invested', value: 250, prefix: '$', suffix: 'M+', icon: HiCurrencyDollar },
              { label: 'Years Experience', value: 8, suffix: '+', icon: HiClock },
              { label: 'Security Verified', value: 100, suffix: '%', icon: HiShieldCheck },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {stat.prefix && stat.prefix}{stat.value >= 1000 ? (stat.value / 1000).toFixed(1) + 'K' : stat.value}{stat.suffix}
                  </p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Meet Our Experts</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Our team of experienced professionals dedicated to maximizing your profits.</p>
          </motion.div>
        </div>

        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex animate-scroll gap-6 w-max py-4">
            {[
              { name: 'Sarah Johnson', role: 'CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', location: 'New York, USA', profit: '$2.5M+' },
              { name: 'Michael Chen', role: 'CTO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', location: 'San Francisco, USA', profit: '$1.8M+' },
              { name: 'Emma Williams', role: 'CFO', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', location: 'London, UK', profit: '$3.2M+' },
              { name: 'James Wilson', role: 'Head of Trading', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', location: 'Singapore', profit: '$4.1M+' },
              { name: 'Lisa Anderson', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', location: 'Dubai, UAE', profit: '$1.5M+' },
              { name: 'David Brown', role: 'Lead Analyst', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', location: 'Toronto, Canada', profit: '$900K+' },
              { name: 'Sarah Johnson', role: 'CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', location: 'New York, USA', profit: '$2.5M+' },
              { name: 'Michael Chen', role: 'CTO', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', location: 'San Francisco, USA', profit: '$1.8M+' },
            ].map((member, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/30 hover:from-white/15 hover:to-white/10 transition-all duration-300"
              >
                <div className="relative mb-5">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-28 h-28 mx-auto rounded-full object-cover border-4 border-white/20 shadow-lg"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {member.profit}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold text-xl">{member.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{member.role}</p>
                  <div className="inline-flex items-center gap-2 text-gray-400 text-sm bg-white/5 px-4 py-2 rounded-full">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {member.location}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex justify-center gap-3">
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why Choose InvestPro</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Experience the future of trading with our cutting-edge platform designed for serious investors.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Preview Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Investment Plans</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose a plan that matches your investment goals and risk tolerance.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const planColors = [
                { bg: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500' },
                { bg: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500' },
                { bg: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500' },
                { bg: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500' },
              ];
              const colors = planColors[index % planColors.length];
              const isPopular = index === 2;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className={`relative bg-gradient-to-b ${colors.bg} ${isPopular ? 'border-white/40' : colors.border} rounded-3xl p-6 hover:border-white/50 transition-all duration-300 backdrop-blur-sm group overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
                  
                  {isPopular && (
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl ${colors.bg.replace('from-', 'bg-').replace('/20', '/30')} border ${colors.border} flex items-center justify-center mb-4`}>
                      <span className={`${colors.text} font-bold text-lg`}>{plan.name?.charAt(0)}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{plan.description?.substring(0, 60)}...</p>
                    
                    <div className="mb-5">
                      <p className={`text-4xl font-bold ${colors.text}`}>{plan.roi_percentage}%</p>
                      <p className="text-gray-500 text-sm">ROI over {plan.duration_days} days</p>
                    </div>
                    
                    <div className="bg-black/30 rounded-xl p-3 mb-5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Min</span>
                        <span className="text-white font-semibold">${Number(plan.min_amount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-500">Max</span>
                        <span className="text-white font-semibold">${Number(plan.max_amount).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <Link 
                      to="/register" 
                      className={`block text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        isPopular 
                          ? 'bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/20' 
                          : `${colors.bg} ${colors.text} border ${colors.border} hover:bg-white/10`
                      }`}
                    >
                      Get Started
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/plans" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white font-medium">
              <span>View All Plans</span>
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Start investing in just three simple steps.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free and complete your profile verification in minutes.' },
              { step: '02', title: 'Choose Plan', desc: 'Select an investment plan that suits your goals and budget.' },
              { step: '03', title: 'Watch Growth', desc: 'Monitor your investments and withdraw profits anytime.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">What People Say About Us</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Join thousands of satisfied investors who trust us with their investments.</p>
          </motion.div>
        </div>

        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 lg:w-48 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none"></div>
          
          <div className="flex gap-6 w-max animate-marquee py-4">
            {[
              { name: 'John Mitchell', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', message: 'Incredible platform! I\'ve seen consistent returns on my investments. The transparency and security give me complete peace of mind.', rating: 5 },
              { name: 'Sarah Anderson', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', message: 'Started with a small investment and now I\'m earning passive income every week. The customer support is exceptional!', rating: 5 },
              { name: 'Michael Roberts', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', message: 'The best investment platform I\'ve used. Clean interface, fast withdrawals, and amazing ROI. Highly recommended!', rating: 5 },
              { name: 'Emily Chen', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', message: 'Finally found a trustworthy platform. My portfolio has grown 40% in just 3 months. Absolutely brilliant!', rating: 5 },
              { name: 'David Williams', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', message: 'Professional and reliable. The elite plan exceeded my expectations with amazing returns. Will invest more!', rating: 5 },
              { name: 'Lisa Thompson', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', message: 'From skeptical to convinced! This platform delivers exactly what it promises. My financial future looks bright.', rating: 5 },
            ].concat([
              { name: 'John Mitchell', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', message: 'Incredible platform! I\'ve seen consistent returns on my investments. The transparency and security give me complete peace of mind.', rating: 5 },
              { name: 'Sarah Anderson', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', message: 'Started with a small investment and now I\'m earning passive income every week. The customer support is exceptional!', rating: 5 },
              { name: 'Michael Roberts', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', message: 'The best investment platform I\'ve used. Clean interface, fast withdrawals, and amazing ROI. Highly recommended!', rating: 5 },
              { name: 'Emily Chen', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', message: 'Finally found a trustworthy platform. My portfolio has grown 40% in just 3 months. Absolutely brilliant!', rating: 5 },
              { name: 'David Williams', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', message: 'Professional and reliable. The elite plan exceeded my expectations with amazing returns. Will invest more!', rating: 5 },
              { name: 'Lisa Thompson', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', message: 'From skeptical to convinced! This platform delivers exactly what it promises. My financial future looks bright.', rating: 5 },
            ]).map((review, index) => (
              <motion.div
                key={`review-${index}`}
                initial={{ opacity: 0.4 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 lg:w-96 bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl p-6 hover:border-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <HiStar key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">"{review.message}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={review.image} 
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{review.name}</h4>
                    <p className="text-gray-500 text-xs">Verified Investor</p>
                  </div>
                  <div className="ml-auto">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-3xl p-10 lg:p-14 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of investors who are already building wealth with InvestPro. Your financial future starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Create Free Account
              </Link>
              <Link 
                to="/contact" 
                className="px-8 py-4 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
