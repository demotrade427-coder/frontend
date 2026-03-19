import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome, HiUsers, HiCurrencyDollar, HiArrowUp, HiArrowDown,
  HiTrendingUp, HiCurrencyEuro, HiSupport, HiMenuAlt2, HiX,
  HiLogout, HiBell, HiShieldCheck, HiCreditCard, HiChartBar, HiArrowRight
} from 'react-icons/hi';
import API from '../../utils/api';

const menuItems = [
  { id: 'overview', path: '/admin', icon: HiHome, label: 'Overview' },
  { id: 'users', path: '/admin/users', icon: HiUsers, label: 'Users' },
  { id: 'deposits', path: '/admin/deposits', icon: HiArrowDown, label: 'Deposits' },
  { id: 'withdrawals', path: '/admin/withdrawals', icon: HiArrowUp, label: 'Withdrawals' },
  { id: 'trades', path: '/admin/trades', icon: HiTrendingUp, label: 'Trades' },
  { id: 'loans', path: '/admin/loans', icon: HiCurrencyDollar, label: 'Loans' },
  { id: 'markets', path: '/admin/markets', icon: HiChartBar, label: 'Markets' },
  { id: 'bank', path: '/admin/bank-accounts', icon: HiCreditCard, label: 'Bank Accounts' },
  { id: 'tickets', path: '/admin/tickets', icon: HiSupport, label: 'Support' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, connected } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/admin/dashboard-stats');
        setStats(data || {});
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    logout();
    navigate('/');
  };

  const pendingCount = (stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0);
  const currentPath = location.pathname;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'deposit': return <HiArrowDown className="w-4 h-4 text-emerald-400" />;
      case 'withdrawal': return <HiArrowUp className="w-4 h-4 text-amber-400" />;
      case 'trade': return <HiTrendingUp className="w-4 h-4 text-violet-400" />;
      case 'user': return <HiUsers className="w-4 h-4 text-blue-400" />;
      case 'ticket': return <HiSupport className="w-4 h-4 text-pink-400" />;
      case 'loan': return <HiCurrencyDollar className="w-4 h-4 text-cyan-400" />;
      default: return <HiBell className="w-4 h-4" />;
    }
  };

  const getNotificationLink = (type) => {
    switch (type) {
      case 'deposit': return '/admin/deposits';
      case 'withdrawal': return '/admin/withdrawals';
      case 'trade': return '/admin/trades';
      case 'user': return '/admin/users';
      case 'ticket': return '/admin/tickets';
      case 'loan': return '/admin/loans';
      default: return '/admin';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
              <HiMenuAlt2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Link to="/admin" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white hidden xs:block">Admin Panel</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Status */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/5">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-slate-400 text-[10px] sm:text-xs">{connected ? 'Live' : 'Offline'}</span>
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg relative"
              >
                <HiBell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-violet-500 rounded-full text-[9px] sm:text-[10px] text-white flex items-center justify-center">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </motion.button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <h3 className="text-white text-sm font-medium">Notifications</h3>
                        {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-xs text-violet-400 hover:text-violet-300">
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 sm:max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, index) => (
                            <Link
                              key={`${notif.type}-${index}`}
                              to={getNotificationLink(notif.type)}
                              onClick={() => setShowNotifications(false)}
                              className="flex items-start gap-2 sm:gap-3 p-3 hover:bg-white/5 border-b border-white/5 last:border-0"
                            >
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs sm:text-sm capitalize">{notif.type}</p>
                                <p className="text-slate-400 text-[10px] sm:text-xs truncate">
                                  {notif.data?.message || `New ${notif.type}`}
                                </p>
                              </div>
                              <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
                            </Link>
                          ))
                        ) : (
                          <div className="p-4 sm:p-6 text-center text-slate-500 text-xs sm:text-sm">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/10">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-white text-xs sm:text-sm font-medium leading-tight">{user?.username || 'Admin'}</span>
                <span className="text-slate-400 text-[10px] sm:text-xs leading-tight capitalize">{user?.role || 'Super Admin'}</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                {user?.username?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-slate-900/98 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <HiShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Admin</p>
                    <p className="text-slate-400 text-sm">Dashboard</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
                  <HiX className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent menuItems={menuItems} currentPath={currentPath} onNavigate={() => setSidebarOpen(false)} handleLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed left-0 top-14 bottom-0 w-56 xl:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex-col z-30">
        <SidebarContent menuItems={menuItems} currentPath={currentPath} handleLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="lg:ml-56 xl:ml-64 pt-14">
        <div className="p-3 sm:p-4 lg:p-6 xl:p-8">
          <Outlet context={{ stats, refreshData: () => window.location.reload() }} />
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ menuItems, currentPath, onNavigate, handleLogout }) {
  return (
    <>
      <nav className="flex-1 p-3 lg:p-4 space-y-0.5 sm:space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/admin' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm lg:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 lg:p-4 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <HiLogout className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-xs sm:text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </>
  );
}
