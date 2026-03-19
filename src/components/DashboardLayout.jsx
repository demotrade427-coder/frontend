import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, HiCreditCard, HiTrendingUp, HiUser, HiLogout, HiCollection,
  HiMenuAlt3, HiX, HiShieldCheck
} from 'react-icons/hi';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { id: 'trading', path: '/dashboard/trading', icon: HiTrendingUp, label: 'Trading' },
  { id: 'investments', path: '/dashboard/investments', icon: HiCollection, label: 'Investments' },
  { id: 'loans', path: '/dashboard/loans', icon: HiCreditCard, label: 'Loans' },
  { id: 'wallet', path: '/dashboard/wallet', icon: HiCreditCard, label: 'Wallet' },
  { id: 'profile', path: '/dashboard/profile', icon: HiUser, label: 'Profile' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
              <HiMenuAlt3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <HiShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white hidden xs:block">InvestPro</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-white/10">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-white text-xs sm:text-sm font-medium leading-tight">{user?.first_name || 'User'}</span>
                <span className="text-slate-400 text-[10px] sm:text-xs leading-tight">{user?.email}</span>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                {(user?.first_name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
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
                    <p className="text-white font-bold">InvestPro</p>
                    <p className="text-slate-400 text-sm">Trading Platform</p>
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
      <div className="hidden lg:flex fixed left-0 top-14 bottom-0 w-60 xl:w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex-col z-30">
        <SidebarContent menuItems={menuItems} currentPath={currentPath} handleLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isMobile ? 'pt-14' : 'lg:ml-60 xl:ml-64 pt-14'}`}>
        <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ menuItems, currentPath, onNavigate, handleLogout }) {
  return (
    <>
      <nav className="flex-1 p-3 lg:p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 lg:p-4 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <HiLogout className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </>
  );
}
